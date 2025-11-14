# 📊 Módulo de Análises Avançadas

## Visão Geral

O sistema agora conta com um módulo completo de **Análises Avançadas** que oferece análises ecológicas e fitossociológicas profissionais, visualizações interativas e múltiplos formatos de exportação.

## 🌿 Funcionalidades

### 1. Análises Ecológicas

#### Índices Calculados:
- **Diversidade de Shannon (H')**: Mede a diversidade de espécies considerando riqueza e abundância
  - Valores típicos: 1.5-3.5
  - Interpretação automática incluída
  
- **Riqueza de Espécies (S)**: Número total de espécies identificadas

- **Equitabilidade de Pielou (J')**: Uniformidade na distribuição das espécies (0-1)
  - J' próximo de 1 = distribuição uniforme
  - J' próximo de 0 = dominância de poucas espécies

- **Dominância de Simpson (D)**: Probabilidade de duas amostras aleatórias serem da mesma espécie
  - Valores mais altos = maior dominância

### 2. Análises Fitossociológicas

#### Parâmetros Calculados:
- **Frequência Absoluta e Relativa**: Presença das espécies nas subparcelas
- **Densidade Absoluta e Relativa**: Abundância das espécies por área
- **Dominância Absoluta e Relativa**: Cobertura das espécies na área total
- **Índice de Valor de Importância (IVI)**: Combina frequência, densidade e dominância

#### Tabela Fitossociológica Completa:
Apresenta todos os parâmetros de forma organizada, ordenados por IVI decrescente.

### 3. Análise de Monitoramento

- **Taxa de Cobertura Vegetal Total**: Percentual da área coberta por vegetação
- **Estratificação Vertical**: Distribuição das espécies por altura
  - Rasteiras (0-20cm)
  - Baixas (20-50cm)
  - Médias (50-80cm)
  - Altas (>80cm)
- **Sucessão Ecológica**: Classificação em pioneiras, secundárias e clímax
- **Indicadores de Qualidade**: Métricas para avaliação da restauração

### 4. Análises Comparativas

- **Comparação entre Subparcelas**: Riqueza de espécies por subparcela
- **Similaridade de Jaccard**: Matriz de similaridade na composição de espécies
- **Variabilidade Espacial**: Análise de cobertura ao longo das subparcelas
- **Mapa de Calor de Diversidade**: Visualização da distribuição da diversidade

### 5. Análises Acumuladas

- **Curva de Acumulação de Espécies**: Indica suficiência do esforço amostral
- **Estatísticas Acumuladas**: Totalização de todos os dados
- **Distribuição por Forma de Vida**: Classificação das espécies
- **Distribuição de Frequências**: Classes de frequência (rara a muito frequente)

## 📈 Visualizações

Todos os gráficos são gerados com **Chart.js** e incluem:

### Gráficos de Barras:
- Top 10 espécies por cobertura
- Top 10 espécies por IVI
- Frequência relativa
- Densidade relativa
- Dominância relativa

### Gráficos de Pizza/Rosca:
- Distribuição de alturas
- Estratificação vertical
- Formas de vida

### Gráficos de Linha:
- Variabilidade espacial (cobertura por subparcela)
- Curva de acumulação de espécies

### Gráficos Compostos:
- Mapa de calor de diversidade
- Distribuição de frequências

## 📦 Exportações

### 1. Exportação Excel Completa
- Dados detalhados de todas as subparcelas
- Resumo por espécie
- **NOVO**: Abas com análises ecológicas e fitossociológicas
- Formatação profissional com cores e estilos

### 2. Exportação PDF Completa
- Relatório formatado em PDF
- Tabelas de análises ecológicas
- Lista completa de espécies
- Interpretações dos índices
- Layout profissional em páginas A4

### 3. Exportação ZIP Completa
Pacote completo contendo:
- **JSON**: Todos os dados brutos da análise
- **Excel**: Planilha com análises (quando implementado)
- **PDF**: Relatório formatado
- **Subparcelas/**: Todas as fotos das subparcelas
- **Especies/**: Todas as fotos das espécies (organizadas por pastas)
- **README.txt**: Documentação do pacote

## 🎨 Interface

### Navegação por Abas
O módulo de análises possui 5 abas principais:
1. 🌿 **Análises Ecológicas**
2. 📊 **Fitossociologia**
3. 📈 **Monitoramento**
4. 🔍 **Comparativas**
5. 📚 **Acumuladas**

### Design Responsivo
- Cards com gradientes coloridos
- Animações suaves de transição
- Gráficos responsivos que se adaptam ao tamanho da tela
- Tooltips informativos
- Tabelas com scroll horizontal em telas pequenas

## 🔧 Implementação Técnica

### Frontend (JavaScript)
```javascript
// Módulo principal
AdvancedAnalytics.initialize(data)

// Cálculos disponíveis
AdvancedAnalytics.calculateShannonDiversity()
AdvancedAnalytics.calculateSpeciesRichness()
AdvancedAnalytics.calculateEveness()
AdvancedAnalytics.calculateSimpsonDominance()
AdvancedAnalytics.calculateFrequency()
AdvancedAnalytics.calculateDensity()
AdvancedAnalytics.calculateDominance()
AdvancedAnalytics.calculateIVI()
```

### Backend (Python/Flask)
```python
# Rotas de exportação
@app.route('/export_pdf', methods=['POST'])
@app.route('/export_zip', methods=['POST'])

# Bibliotecas usadas
- reportlab: Geração de PDF
- zipfile: Criação de arquivos ZIP
- openpyxl: Manipulação de Excel
```

### Dependências
```
reportlab>=4.0.0  # PDF generation
Chart.js@4.4.0    # Gráficos (via CDN)
```

## 📊 Fórmulas Utilizadas

### Diversidade de Shannon (H')
```
H' = -Σ(pi × ln(pi))
onde pi = proporção de cobertura da espécie i
```

### Equitabilidade de Pielou (J')
```
J' = H' / ln(S)
onde S = número de espécies
```

### Dominância de Simpson (D)
```
D = Σ(pi²)
onde pi = proporção de cobertura da espécie i
```

### IVI (Índice de Valor de Importância)
```
IVI = Frequência Relativa + Densidade Relativa + Dominância Relativa
IVI% = IVI / 3
```

### Similaridade de Jaccard
```
J = |A ∩ B| / |A ∪ B|
onde A e B são conjuntos de espécies em duas subparcelas
```

## 🚀 Como Usar

1. **Realizar Análise**: Faça o upload e análise das imagens normalmente
2. **Visualizar Analytics**: Após a análise, role até a seção "4. Análises Avançadas"
3. **Navegar pelas Abas**: Explore diferentes tipos de análises
4. **Exportar Dados**: Use os botões na seção "5. Visualização e Exportação"
   - 📊 Excel: Planilha completa
   - 📄 PDF: Relatório formatado
   - 📦 ZIP: Pacote completo com tudo

## 📝 Notas Importantes

- As análises são atualizadas automaticamente quando os dados mudam
- Todos os gráficos são interativos (hover para ver valores)
- O ZIP contém TODAS as fotos (subparcelas + espécies)
- O PDF usa formatação padrão A4 para impressão
- Interpretações automáticas ajudam na compreensão dos índices

## 🔮 Melhorias Futuras

- [ ] Análise temporal (comparação entre diferentes datas)
- [ ] Exportação de gráficos como imagens
- [ ] Relatório PDF com gráficos incluídos
- [ ] Análise de rarefação mais sofisticada
- [ ] Curva de acumulação com intervalos de confiança
- [ ] Análise de ordenação (PCA, NMDS)
- [ ] Índices de diversidade beta
- [ ] Análise de cobertura por classes de altura

## 📧 Suporte

Para dúvidas ou sugestões sobre o módulo de análises avançadas, consulte a documentação principal ou entre em contato com o desenvolvedor.

---

**Versão**: 1.0.0  
**Data**: 2024  
**Desenvolvido para**: Sistema de Análise de Vegetação Herbácea
