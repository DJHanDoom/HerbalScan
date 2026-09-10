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


def clip_polygon_to_boundary(points: List[dict], boundary_points: Optional[List[dict]]) -> List[List[dict]]:
    """Recorta um poligono pelos limites de boundary_points (ambos em 0..100).

    Usado para garantir que poligonos retornados pela IA (que nem sempre
    respeita o delimitador fisico da subparcela com precisao) nunca sejam
    exibidos nem contados fora da area real da subparcela - a IA pode
    errar a posicao exata do delimitador, mas o recorte geometrico garante
    que o resultado final e sempre fisicamente consistente.

    Retorna uma lista de poligonos (cada um lista de {x,y}) - normalmente 1,
    mas pode ser >1 se o recorte partir o poligono original em pedacos
    disjuntos, ou [] se o poligono ficar totalmente fora do limite.
    Se shapely indisponivel ou nao ha boundary, retorna [points] inalterado
    (fail-open: preferimos manter o poligono original a apaga-lo por erro
    tecnico).
    """
    if not points:
        return []
    if not SHAPELY_OK or not boundary_points:
        return [points]

    poly = _make_polygon(points)
    boundary = _make_polygon(boundary_points)
    if poly is None or boundary is None or poly.is_empty or boundary.is_empty:
        return [points]

    try:
        clipped = poly.intersection(boundary)
    except Exception:
        return [points]

    # Salvaguarda: se o boundary vier malformado (ex: cantos do delimitador
    # fora de ordem sequencial, formando um poligono "boca de laco"), a
    # interseccao pode ficar vazia ou minuscula mesmo quando o poligono
    # original claramente deveria estar (quase) todo dentro da subparcela.
    # Preferimos manter o poligono original a fazer ele sumir do mapa por
    # causa de uma geometria de delimitador ruim - so aceitamos o recorte se
    # ele preservar uma fracao razoavel da area original.
    original_area = poly.area
    clipped_area = 0.0 if clipped.is_empty else clipped.area
    if original_area > 0 and (clipped_area / original_area) < 0.10:
        return [points]

    if clipped.is_empty:
        return []

    if clipped.geom_type == 'Polygon':
        geoms = [clipped]
    elif clipped.geom_type in ('MultiPolygon', 'GeometryCollection'):
        geoms = [g for g in clipped.geoms if g.geom_type == 'Polygon' and not g.is_empty]
    else:
        # Linha/ponto degenerado (tangencia a borda) - sem area util
        return []

    result = []
    for g in geoms:
        coords = list(g.exterior.coords)[:-1]  # remove ponto de fechamento duplicado
        if len(coords) >= 3:
            result.append([{'x': round(x, 4), 'y': round(y, 4)} for x, y in coords])
    return result


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
