# PROMPT DE DESIGN — Plataforma Agenda Inteligente com IA
**Para:** Claude Design  
**Projeto:** Plataforma SaaS de produtividade com IA  
**Versão do prompt:** 1.0 | Mai/2026

---

## CONTEXTO DO PRODUTO

Você está criando o design de uma plataforma SaaS de produtividade chamada **[NOME A DEFINIR]** — um "segundo cérebro com IA" que unifica agenda, tarefas, arquivos, comunicação e inteligência artificial num único app.

**Públicos simultâneos:**
- Estudantes (universitários, pós-graduandos, cursos livres)
- Professores e educadores
- Profissionais liberais e trabalhadores
- Coordenadores de projetos corporativos

**Plataformas:** Web (desktop + tablet) + Mobile (iOS e Android)  
**Idiomas:** Português (BR) e Inglês (US)  
**Modelo:** SaaS — Freemium / Pro / Enterprise

---

## IDENTIDADE VISUAL

### Personalidade da marca
- **Inteligente mas acessível** — não intimidador, não burocrático
- **Focado mas humano** — ajuda a pessoa a performar sem parecer uma máquina
- **Moderno e confiável** — tech de ponta com a solidez que documentos importantes exigem
- **Adaptável** — a mesma plataforma serve um estudante de 18 anos e um diretor de 50

### Estilo visual
- **Estética:** Moderno e tech — dark mode como padrão com opção light
- **Inspirações de referência:** Linear.app (precisão técnica), Notion (leveza editorial), Raycast (velocidade e foco), Arc Browser (personalidade e cor)
- **Tom:** Profissional sem ser frio. Amigável sem ser infantil.

### Paleta de cores
```
Primária (ação, destaque, IA):    #6366F1  (índigo vibrante)
Secundária (projetos, sucesso):   #10B981  (verde esmeralda)
Alerta / Urgente:                 #F59E0B  (âmbar)
Erro / Crítico:                   #EF4444  (vermelho)
IA / Assistente (especial):       gradiente #6366F1 → #8B5CF6 → #EC4899

Background dark (padrão):
  - Base:       #0F0F13
  - Superfície: #17171D
  - Card:       #1E1E26
  - Borda:      #2A2A35

Background light:
  - Base:       #FAFAFA
  - Superfície: #FFFFFF
  - Card:       #F4F4F8
  - Borda:      #E4E4EF

Texto dark:
  - Primário:   #F0F0F5
  - Secundário: #9090A8
  - Terciário:  #5A5A72

Texto light:
  - Primário:   #0F0F13
  - Secundário: #6B6B80
  - Terciário:  #9999B0
```

### Tipografia
```
Títulos e UI:    Inter (700, 600, 500)
Corpo e dados:   Inter (400, 300)
Código / mono:   JetBrains Mono
Tamanhos:
  - Display:   32–40px
  - H1:        24px / 700
  - H2:        18px / 600
  - H3:        14px / 600
  - Body:      14px / 400
  - Small:     12px / 400
  - Micro:     11px / 500 (labels, badges)
```

### Iconografia
- Biblioteca: **Tabler Icons** (stroke, 1.5px, arredondado)
- Tamanho padrão: 16px (inline), 20px (ações), 24px (navegação)
- Nunca usar ícones filled — sempre outline/stroke

### Border radius
```
Cards grandes:    12px
Cards médios:     8px
Botões:           6px
Badges / tags:    20px (pill)
Inputs:           6px
Modais:           16px
```

### Sombras (dark mode)
```
Nível 1 (hover):  0 1px 3px rgba(0,0,0,0.4)
Nível 2 (card):   0 4px 12px rgba(0,0,0,0.5)
Nível 3 (modal):  0 16px 48px rgba(0,0,0,0.7)
Glow IA:          0 0 20px rgba(99,102,241,0.3)
```

---

## TELAS A CRIAR

### TELA 1 — Onboarding / Seleção de perfil
**Objetivo:** Primeira experiência do usuário — selecionar o perfil que define sua experiência

**Layout:**
- Tela dividida: lado esquerdo com branding/manifesto do produto, lado direito com a seleção
- 4 cards grandes de perfil com ícone, nome e descrição de 1 linha
- Cada card muda de cor ao hover (usando a cor do perfil)
- CTA principal: "Começar com este perfil"
- Link secundário: "Posso mudar depois?"

**Cores por perfil:**
- Estudante: índigo (#6366F1)
- Professor: verde esmeralda (#10B981)
- Profissional: âmbar (#F59E0B)
- Corporativo: azul (#3B82F6)

**Conteúdo dos cards:**
```
[Estudante]
Ícone: graduation-cap
Título: Estudante
Subtítulo: "Provas, trabalhos e prazos — tudo organizado"

[Professor]
Ícone: chalkboard
Título: Professor / Educador
Subtítulo: "Gerencie turmas, aulas e materiais com IA"

[Profissional]
Ícone: briefcase
Título: Profissional
Subtítulo: "Clientes, projetos e prazos num só lugar"

[Corporativo]
Ícone: sitemap
Título: Coordenador de Projetos
Subtítulo: "Equipes, sprints e relatórios automáticos"
```

---

### TELA 2 — Painel Principal / Dashboard (dark mode)
**Objetivo:** Tela inicial que o usuário vê ao abrir o app — deve transmitir "sei exatamente o que fazer hoje"

**Layout (web — 3 colunas):**

**Coluna esquerda — Sidebar (220px):**
- Logo do produto no topo
- Avatar + nome do usuário + badge do perfil ativo
- Navegação principal com ícones: Início, Agenda, Tarefas, Arquivos, IA, Colaboração
- Seção "Projetos recentes" com indicadores de saúde coloridos
- Botão "Novo" no rodapé da sidebar

**Coluna central — Conteúdo principal (flex):**
- Saudação personalizada com hora: "Bom dia, [Nome]. Aqui está seu dia."
- **Card de resumo da IA** (destaque): fundo com gradiente sutil índigo, ícone de sparkles, texto em linguagem natural descrevendo o dia. Borda com glow sutil.
- **Seção "Hoje":** lista de tarefas prioritárias com checkbox, indicador de urgência e projeto vinculado
- **Mini calendário** da semana com eventos do dia destacados
- **Prazos próximos:** cards horizontais com countdown visual (3 dias, 1 dia, hoje)

**Coluna direita — Contextual (280px):**
- Card "IA Quick Chat" — input para perguntar algo rápido
- "Arquivos recentes" — thumbnails com nome e projeto
- "Atividade do time" (se colaborativo) — feed de ações recentes
- Widget de produtividade semanal — mini gráfico de barras

**Barra superior (topbar):**
- Breadcrumb leve: "Início"
- Busca global (⌘K) centralizada
- Notificações com badge
- Toggle dark/light
- Avatar com menu de perfil

---

### TELA 3 — Assistente de IA (tela dedicada)
**Objetivo:** Experiência de chat com a IA que tem contexto de todos os dados do usuário

**Layout:**
- Interface de chat centralizada com largura máxima de 720px
- Sidebar esquerda com histórico de conversas agrupadas por data
- Área central: bolhas de chat — usuário (direita, fundo índigo suave) e IA (esquerda, fundo card)
- Mensagens da IA com ícone de sparkles e nome "Assistente"
- Input fixo no rodapé com botões de ação rápida

**Botões de ação rápida (abaixo do input):**
- "Resumir documento" (ícone: file-text)
- "Priorizar meu dia" (ícone: list-check)
- "Gerar mapa mental" (ícone: brain)
- "Pesquisar na web" (ícone: world)
- "Criar conteúdo" (ícone: pencil)

**Estado de "IA pensando":**
- 3 pontos pulsando com gradiente índigo → roxo
- Label: "Analisando seus dados..."

**Card de resultado especial (quando a IA gera conteúdo estruturado):**
- Fundo ligeiramente diferente do texto comum
- Botões de ação: "Salvar como arquivo", "Copiar", "Exportar PDF"
- Badge "Gerado por IA" em micro text

---

### TELA 4 — Gestão de Tarefas (modo estudante)
**Objetivo:** Visão das tarefas do estudante com priorização inteligente

**Layout:**
- Header com título "Tarefas" e botão "+ Nova tarefa"
- Tabs: "Hoje", "Esta semana", "Disciplinas", "Concluídas"
- **Banner da IA** (quando há tarefas urgentes): fundo âmbar suave, ícone de alerta, texto "Você tem 2 entregas amanhã. Quer que eu priorize seu dia?"
- Lista de tarefas com:
  - Checkbox circular (quando marcado: animação de check com cor da disciplina)
  - Título da tarefa
  - Badge da disciplina (cor única por disciplina)
  - Data de prazo com indicador de urgência (vermelho se < 24h, âmbar se < 3 dias)
  - Ícone de anexo (se tiver arquivo vinculado)
  - Menu de ações no hover (editar, mover, deletar)
- **Card "Foco do dia" (destaque):** top 3 tarefas da IA com explicação de por que são prioritárias

**Estado vazio:**
- Ilustração minimalista (linha/outline, não colorida)
- Texto: "Tudo em dia! A IA vai te avisar quando algo precisar de atenção."

---

### TELA 5 — Status Report Corporativo (modo coordenador)
**Objetivo:** Tela de geração e revisão do status report semanal automático

**Layout:**
- Header: nome do projeto + "Semana 21 · 19–25 mai 2026" + badge "Rascunho gerado pela IA"
- Botões no header: "Editar", "Enviar report" (primário)
- **Bloco de métricas (4 cards horizontais):**
  - % Conclusão geral (número grande + delta vs semana anterior)
  - Tarefas entregues (X de Y)
  - Status do prazo (ícone + label: "Em risco", "No prazo", "Atrasado")
  - Riscos abertos (número com cor de severidade)
- **Card resumo da IA:** fundo roxo/índigo suave, texto gerado, ícone sparkles
- **Grid 2 colunas:** Progresso por módulo (barras) + Riscos e impedimentos (lista com badges)
- **Tabs de audiência:** "BRM / Diretor", "Time técnico", "Cliente interno"
  - Cada tab mostra preview do texto gerado para aquela audiência
- **Rodapé de ações:** info de destinatários + "Preview PDF" + "Confirmar envio"

---

### TELA 6 — Mobile — Painel Principal (iPhone 14 Pro)
**Objetivo:** Versão mobile do dashboard — thumb-friendly, informação essencial

**Layout (375px de largura):**
- **Header:** Logo pequeno + ícone de busca + notificação + avatar
- **Saudação:** "Bom dia, [Nome]" em 22px bold
- **Card IA (destaque):** largura total, fundo com gradiente índigo, texto de resumo do dia, 2–3 linhas máximo
- **Seção "Agora":** scroll horizontal de cards compactos com as 3 prioridades do dia
- **Mini agenda:** lista de eventos do dia em formato lista compacta
- **Prazos:** scroll horizontal de chips com countdown
- **Bottom navigation:** Início, Agenda, Tarefas, IA, Menu (5 itens, ícone + label)

**Gestos:**
- Swipe horizontal nos cards de prioridade
- Pull to refresh para regenerar resumo da IA
- Long press em tarefa para menu de ações rápidas

---

## COMPONENTES DE DESIGN SYSTEM

### Botões
```
Primary:   fundo #6366F1, texto branco, hover: #4F52CC
Secondary: borda #2A2A35, texto primário, hover: fundo card
Ghost:     sem fundo, sem borda, texto secundário, hover: fundo sutil
Danger:    fundo #EF4444, texto branco
Tamanhos: SM (28px), MD (34px), LG (40px)
```

### Badges / Tags
```
Urgente:    fundo #FEE2E2, texto #DC2626
Atenção:    fundo #FEF3C7, texto #D97706
Normal:     fundo #EDE9FE, texto #7C3AED
Concluído:  fundo #D1FAE5, texto #059669
Neutro:     fundo #F3F4F6, texto #6B7280
```

### Cards
```
Card padrão:     fundo #1E1E26, borda #2A2A35, radius 12px, padding 16px
Card destaque:   + glow sutil na cor do conteúdo
Card IA:         gradiente sutil #1A1A2E → #1E1E35, borda índigo 30% opacidade
Card urgente:    borda esquerda 3px âmbar ou vermelho
```

### Input / Campos
```
Fundo:          #17171D
Borda:          #2A2A35 (idle), #6366F1 (focus)
Placeholder:    #5A5A72
Texto:          #F0F0F5
Height:         36px (SM), 40px (MD), 48px (LG)
```

### Indicadores de status do projeto
```
No prazo:  ponto verde  #10B981
Em risco:  ponto âmbar  #F59E0B
Atrasado:  ponto vermelho #EF4444
Pausado:   ponto cinza  #6B7280
```

---

## MICROINTERAÇÕES E ANIMAÇÕES

- **Checkbox de tarefa concluída:** check animado com cor da categoria + texto riscado suavemente
- **Card da IA gerando:** shimmer/skeleton loading com gradiente índigo pulsando
- **Notificação de urgência:** borda do card pulsa 2x em vermelho quando aparece
- **Troca de perfil:** fade suave com mudança de cor de destaque da UI
- **Pull to refresh (mobile):** ícone de sparkles girando com gradiente IA
- **Bottom nav ativo:** ícone com preenchimento suave + label aparece
- **Hover em card:** elevação de 2px com sombra nível 2

---

## REGRAS DE DESIGN OBRIGATÓRIAS

1. **Hierarquia visual clara:** o olho do usuário deve saber instantaneamente o que fazer
2. **A IA sempre tem identidade visual própria:** gradiente índigo→roxo, ícone sparkles, glow sutil
3. **Urgência é comunicada por cor E forma** — nunca apenas por cor (acessibilidade)
4. **Cada perfil tem uma cor de destaque** — mas o sistema base é sempre o mesmo
5. **Dark mode é o padrão** — light mode é alternativa igualmente bem projetada
6. **Mobile-first no layout** — mas a versão web pode ter mais densidade de informação
7. **Nunca mais de 3 ações primárias visíveis** em qualquer tela
8. **Textos gerados pela IA** devem sempre ter identificação visual clara
9. **Espaçamento generoso** — min 8px entre elementos, preferência por 16px e 24px
10. **Consistência de componentes** — usar o design system em todas as telas sem exceção

---

## ENTREGÁVEIS ESPERADOS

1. **Tela 1:** Onboarding — seleção de perfil (web)
2. **Tela 2:** Dashboard principal — dark mode (web desktop)
3. **Tela 3:** Assistente de IA — tela dedicada (web)
4. **Tela 4:** Gestão de tarefas — modo estudante (web)
5. **Tela 5:** Status report corporativo (web)
6. **Tela 6:** Dashboard mobile — iOS (375px)
7. **Bônus:** Design system — componentes principais (botões, cards, badges, inputs)

---

## OBSERVAÇÕES FINAIS PARA O DESIGNER

- O produto compete diretamente com Notion, Todoist, Google Calendar e Linear — o design precisa estar no mesmo nível de polimento
- O usuário abre o app e em 3 segundos deve saber o que fazer — clareza é o principal KPI visual
- A IA é o coração do produto — ela deve ter presença visual marcante mas não intrusiva
- O produto precisa funcionar para um estudante de 18 anos E para um diretor de TI de 45 — o design system deve sustentar essa amplitude
- Dark mode é padrão pois o público usa muito à noite (estudantes) e em ambientes de escritório (corporativo)

---

*Prompt de design gerado pelo processo de levantamento de requisitos — Analista: Claude (BA) — v1.0 — Mai/2026*
