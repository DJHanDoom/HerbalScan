"""Polygon utilities for Herbal Scan (Camada 3).

Unifica o calculo de cobertura: substitui Shoelace simples no backend +
Monte Carlo no JS por uma unica implementacao baseada em Shapely. Aplica-se
a todos os formatos de analise (herbacea, drone, cerrado, etc) pois opera
sobre o formato canonico de poligonos {x, y} em 0..100.

Modos de cobertura:
  - 'estratos' (default): poligonos da MESMA especie sao unidos antes de
    calcular area. Especies diferentes podem somar > 100% se sobrepoem
    (modela estratos verticais em florestas).
  - 'exclusivo': cada pixel atribuido a uma unica especie (ordem de
    declaracao = prioridade do estrato superior). Soma sempre <= 100%.
"""

from typing import Iterable, List, Optional, Tuple

try:
    from shapely.geometry import Polygon, MultiPolygon, GeometryCollection
    from shapely.ops import unary_union
    from shapely.validation import make_valid
    SHAPELY_OK = True
except ImportError:
    SHAPELY_OK = False


def _to_tuples(points: Iterable[dict]) -> List[Tuple[float, float]]:
    return [(float(p['x']), float(p['y'])) for p in points if 'x' in p and 'y' in p]


def _make_polygon(points: List[dict]) -> Optional['Polygon']:
    """Cria um Polygon valido (corrige auto-intersecoes se possivel)."""
    if not SHAPELY_OK or not points or len(points) < 3:
        return None
    try:
        coords = _to_tuples(points)
        if len(coords) < 3:
            return None
        poly = Polygon(coords)
        if not poly.is_valid:
            poly = make_valid(poly)
        if poly.is_empty:
            return None
        # make_valid pode retornar GeometryCollection; pegar so o(s) Polygon(s)
        if isinstance(poly, (MultiPolygon, GeometryCollection)):
            polys = [g for g in poly.geoms if g.geom_type == 'Polygon' and not g.is_empty]
            if not polys:
                return None
            return unary_union(polys)
        return poly
    except Exception:
        return None


def union_of_shapes(area_shapes: List[dict]) -> Optional[object]:
    """Recebe lista [{points: [...]}] e retorna a uniao (Polygon ou MultiPolygon)."""
    if not SHAPELY_OK or not area_shapes:
        return None
    polys = []
    for shape in area_shapes:
        pts = shape.get('points') if isinstance(shape, dict) else None
        if not pts:
            continue
        p = _make_polygon(pts)
        if p is not None and not p.is_empty:
            polys.append(p)
    if not polys:
        return None
    return unary_union(polys)


def calculate_coverage(species_area_shapes: List[dict],
                       parcela_area_shape: Optional[dict] = None,
                       total_image_area: float = 10000.0) -> float:
    """Calcula a % de cobertura de UMA especie (lista de poligonos).

    Args:
        species_area_shapes: lista [{points: [...]}, ...] em 0..100
        parcela_area_shape: opcional, {points: [...]} delimitando a parcela.
            Se ausente, usa o total da imagem (10000 = 100x100).
        total_image_area: fallback quando nao ha parcela.

    Returns:
        Percentual no intervalo [0, 100].
    """
    if not SHAPELY_OK:
        return 0.0

    species_union = union_of_shapes(species_area_shapes)
    if species_union is None or species_union.is_empty:
        return 0.0

    if parcela_area_shape and isinstance(parcela_area_shape, dict):
        parcela_poly = _make_polygon(parcela_area_shape.get('points', []))
        if parcela_poly and not parcela_poly.is_empty:
            denom = parcela_poly.area
            if denom <= 0:
                return 0.0
            inside = species_union.intersection(parcela_poly)
            return max(0.0, min(100.0, (inside.area / denom) * 100.0))

    return max(0.0, min(100.0, (species_union.area / total_image_area) * 100.0))


def calculate_coverage_exclusive(species_list: List[dict],
                                 parcela_area_shape: Optional[dict] = None,
                                 total_image_area: float = 10000.0) -> List[dict]:
    """Modo 'exclusivo': pinta cada area uma unica vez, na ordem das especies.

    Especies posteriores so ficam com a area que nao foi tomada por
    especies anteriores. Soma <= 100%.

    Args:
        species_list: lista de especies, cada uma com 'apelido' e 'area_shapes'
        parcela_area_shape: poligono da parcela (opcional)
        total_image_area: fallback

    Returns:
        Lista de dicts {apelido, cobertura} na MESMA ordem da entrada.
    """
    if not SHAPELY_OK:
        return [{'apelido': s.get('apelido', '?'), 'cobertura': 0.0} for s in species_list]

    parcela_poly = None
    denom = total_image_area
    if parcela_area_shape and isinstance(parcela_area_shape, dict):
        parcela_poly = _make_polygon(parcela_area_shape.get('points', []))
        if parcela_poly and not parcela_poly.is_empty:
            denom = parcela_poly.area

    if denom <= 0:
        return [{'apelido': s.get('apelido', '?'), 'cobertura': 0.0} for s in species_list]

    claimed = None
    results = []
    for esp in species_list:
        u = union_of_shapes(esp.get('area_shapes', []))
        if u is None or u.is_empty:
            results.append({'apelido': esp.get('apelido', '?'), 'cobertura': 0.0})
            continue

        # Recortar pela parcela
        if parcela_poly is not None:
            u = u.intersection(parcela_poly)
            if u.is_empty:
                results.append({'apelido': esp.get('apelido', '?'), 'cobertura': 0.0})
                continue

        # Subtrair area ja reivindicada por estratos superiores
        if claimed is not None:
            u_excl = u.difference(claimed)
        else:
            u_excl = u

        cov = max(0.0, min(100.0, (u_excl.area / denom) * 100.0))
        results.append({'apelido': esp.get('apelido', '?'), 'cobertura': round(cov, 2)})

        # Acumular reivindicacao
        claimed = u if claimed is None else unary_union([claimed, u])

    return results


def calculate_coverage_overlap(species_list: List[dict],
                               parcela_area_shape: Optional[dict] = None,
                               total_image_area: float = 10000.0) -> List[dict]:
    """Modo 'estratos': cada especie e calculada independentemente (uniao
    interna mas SEM descontar outras especies). Soma pode exceder 100%."""
    out = []
    for esp in species_list:
        cov = calculate_coverage(
            esp.get('area_shapes', []),
            parcela_area_shape=parcela_area_shape,
            total_image_area=total_image_area,
        )
        out.append({'apelido': esp.get('apelido', '?'), 'cobertura': round(cov, 2)})
    return out


def calculate_all_coverages(species_list: List[dict],
                            parcela_area_shape: Optional[dict] = None,
                            mode: str = 'estratos',
                            total_image_area: float = 10000.0) -> List[dict]:
    """Dispatcher: chama o modo escolhido."""
    if mode == 'exclusivo':
        return calculate_coverage_exclusive(species_list, parcela_area_shape, total_image_area)
    return calculate_coverage_overlap(species_list, parcela_area_shape, total_image_area)
