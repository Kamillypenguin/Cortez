// StatusReport.jsx — Screen 5 (Corporate status report)

function ScreenStatusReport() {
  const [audience, setAudience] = useState('brm');

  const metrics = [
    { label: 'Conclusão geral', value: '74%', delta: '+6pp', good: true, icon: 'circle-percentage' },
    { label: 'Tarefas entregues', value: '32 / 43', delta: '5 atrasadas', good: false, icon: 'checks' },
    { label: 'Prazo', value: 'Em risco', icon: 'alert-triangle', status: 'warn' },
    { label: 'Riscos abertos', value: '4', delta: '2 críticos', good: false, icon: 'flame', status: 'bad' },
  ];

  const modules = [
    { name: 'Discovery & Research', pct: 100, status: 'ok' },
    { name: 'Design System', pct: 92, status: 'ok' },
    { name: 'Frontend — Web app', pct: 68, status: 'warn' },
    { name: 'Backend — APIs', pct: 71, status: 'ok' },
    { name: 'Integração SSO', pct: 35, status: 'bad' },
    { name: 'QA & Homologação', pct: 18, status: 'paused' },
  ];

  const risks = [
    { sev: 'Crítico', tone: 'urgent', title: 'Dependência de SSO sem owner', impact: 'Bloqueia GA · 8 dias' },
    { sev: 'Crítico', tone: 'urgent', title: 'API de pagamento sem ambiente staging', impact: 'Sem teste end-to-end' },
    { sev: 'Atenção', tone: 'attention', title: 'Time de Design com 1 vaga aberta', impact: 'Velocity -20% em 2 sprints' },
    { sev: 'Atenção', tone: 'attention', title: 'Cliente solicitou 2 novos requisitos', impact: 'Escopo +12%' },
  ];

  const audienceTexts = {
    brm: {
      label: 'BRM / Diretor',
      title: 'Resumo executivo · 1 página',
      body: 'Sprint 21 entregou 74% do planejado (+6pp vs Sprint 20). Risco principal: integração SSO sem owner, bloqueando o marco de GA em 12/jun. Mitigação proposta: alocar 1 dev senior por 5 dias úteis. Sem isso, GA escorrega 8 dias. Cliente segue confiante; satisfação em 4.6/5 na última reunião.',
    },
    tech: {
      label: 'Time técnico',
      title: 'Detalhamento técnico',
      body: 'Frontend: 12 PRs mergeados, 3 em review (CRUD de eventos, busca global, perfil corporativo). Backend: API de notificações com 71% de cobertura; falta endpoint de bulk-update. Bloqueio crítico: SSO da Microsoft Entra exige permissão admin no tenant — solicitada em 22/05, sem resposta. QA travada aguardando staging com dados sintéticos.',
    },
    cliente: {
      label: 'Cliente interno',
      title: 'O que entregamos esta semana',
      body: 'Avançamos no design final das telas de Painel, Agenda e Tarefas (homologadas com 4.6/5). Iniciamos o desenvolvimento do módulo de relatórios — vocês poderão ver uma prévia na próxima sexta. Próximos passos: revisão do fluxo de aprovação que vocês desenharam comigo na quarta. Algum ponto que querem priorizar?',
    },
  };

  return (
    <div className="cortex" style={{ width: 1440, height: 900, background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Topbar */}
      <header style={{ height: 60, borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, background: 'var(--bg-surface)' }}>
        <button className="icon-btn"><Icon name="arrow-left" size={16} /></button>
        <Logo size={24} withText={false} />
        <div style={{ width: 1, height: 20, background: 'var(--bd-default)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="folder" size={14} style={{ color: 'var(--c-info)' }} />
          <span style={{ fontSize: 13, color: 'var(--tx-2)' }}>Projeto</span>
          <Icon name="chevron-right" size={12} style={{ color: 'var(--tx-3)' }} />
          <span style={{ fontSize: 13, color: 'var(--tx-2)' }}>Plataforma Cortex · v1.0</span>
          <Icon name="chevron-right" size={12} style={{ color: 'var(--tx-3)' }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Status report</span>
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn btn-secondary"><Icon name="history" size={14} /> Versões</button>
        <button className="btn btn-secondary"><Icon name="edit" size={14} /> Editar</button>
        <button className="btn btn-primary"><Icon name="send" size={14} /> Enviar report</button>
      </header>

      <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: '24px 28px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Plataforma Cortex · v1.0</h1>
              <Badge tone="ai">Rascunho gerado pela IA</Badge>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'var(--tx-2)', fontSize: 13 }}>
              <span><Icon name="calendar" size={13} style={{ marginRight: 4 }} /> Semana 21 · 19–25 mai 2026</span>
              <span style={{ color: 'var(--tx-3)' }}>·</span>
              <span><Icon name="user" size={13} style={{ marginRight: 4 }} /> Coordenado por Renato Lima</span>
              <span style={{ color: 'var(--tx-3)' }}>·</span>
              <span><Icon name="users" size={13} style={{ marginRight: 4 }} /> 8 pessoas</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: -8 }}>
            {['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6'].map((c, i) => (
              <Avatar key={i} name={`P${i + 1}`} size={28} color={c} />
            ))}
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-card)', border: '2px solid var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--tx-2)', fontWeight: 600, marginLeft: -8 }}>+3</div>
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
          {metrics.map((m, i) => {
            const statusColor = m.status === 'bad' ? 'var(--c-danger)' : m.status === 'warn' ? 'var(--c-warning)' : 'var(--c-success)';
            return (
              <div key={i} className="card" style={{ padding: 16, position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className="t-micro" style={{ color: 'var(--tx-2)' }}>{m.label}</span>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: m.status ? `${statusColor}1A` : 'rgba(255,255,255,0.04)', color: m.status ? statusColor : 'var(--tx-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={m.icon} size={14} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, color: m.status ? statusColor : 'var(--tx-1)' }} className="mono">{m.value}</div>
                {m.delta && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, color: m.good ? 'var(--c-success)' : 'var(--tx-2)' }}>
                    {m.good && <Icon name="trending-up" size={12} />}
                    {m.delta}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* AI summary */}
        <div className="card-ai" style={{ marginBottom: 22, padding: 20, boxShadow: 'var(--sh-glow)' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <Sparkle size={22} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Resumo da semana</span>
                <Badge tone="ai">Gerado pela IA</Badge>
                <Badge tone="neutral">Confiança 92%</Badge>
              </div>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: 'var(--tx-1)' }}>
                A sprint 21 entregou <strong>74% do planejado</strong>, o melhor desempenho dos últimos 3 ciclos. A boa notícia: <strong>design e backend dentro do prazo</strong>. A má notícia: a <strong>integração SSO segue sem owner</strong> e ameaça o marco de GA em 12/jun. Recomendo escalonar para o BRM essa semana ainda. Cliente confiante, satisfação em 4.6/5.
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn btn-sm btn-secondary"><Icon name="refresh" size={12} /> Regenerar</button>
                <button className="btn btn-sm btn-secondary"><Icon name="adjustments" size={12} /> Ajustar tom</button>
                <button className="btn btn-sm btn-ghost"><Icon name="thumb-up" size={12} /> Bom resumo</button>
              </div>
            </div>
          </div>
        </div>

        {/* 2-col: progress + risks */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
          {/* Progress per module */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="t-h3" style={{ margin: 0 }}>Progresso por módulo</h3>
              <span style={{ fontSize: 11, color: 'var(--tx-3)' }}>Sprint 21</span>
            </div>
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {modules.map(m => {
                const color = m.status === 'bad' ? 'var(--c-danger)' : m.status === 'warn' ? 'var(--c-warning)' : m.status === 'paused' ? 'var(--tx-3)' : 'var(--c-success)';
                return (
                  <div key={m.name}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <StatusDot status={m.status} />
                      <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{m.name}</span>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 600, color, minWidth: 38, textAlign: 'right' }}>{m.pct}%</span>
                    </div>
                    <div className="progress">
                      <span style={{ width: `${m.pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risks */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="t-h3" style={{ margin: 0 }}>Riscos e impedimentos</h3>
              <button className="btn btn-sm btn-ghost"><Icon name="plus" size={12} /> Novo</button>
            </div>
            <div style={{ padding: 8 }}>
              {risks.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '12px 10px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'background 120ms',
                }} onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{ width: 3, alignSelf: 'stretch', background: r.tone === 'urgent' ? 'var(--c-danger)' : 'var(--c-warning)', borderRadius: 2, marginTop: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Badge tone={r.tone}>{r.sev}</Badge>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{r.title}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--tx-2)' }}>{r.impact}</div>
                  </div>
                  <Icon name="chevron-right" size={14} style={{ color: 'var(--tx-3)', marginTop: 4 }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audience tabs */}
        <div className="card" style={{ padding: 0, marginBottom: 24 }}>
          <div style={{ padding: '14px 18px 0', borderBottom: '1px solid var(--bd-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <h3 className="t-h3" style={{ margin: 0 }}>Versões por audiência</h3>
              <Badge tone="ai">A IA escreve para cada público</Badge>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {Object.entries(audienceTexts).map(([k, v]) => (
                <button key={k} onClick={() => setAudience(k)} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '8px 12px',
                  color: audience === k ? 'var(--tx-1)' : 'var(--tx-2)',
                  fontWeight: audience === k ? 600 : 500,
                  fontSize: 13,
                  borderBottom: `2px solid ${audience === k ? 'var(--c-primary)' : 'transparent'}`,
                  marginBottom: -1,
                }}>{v.label}</button>
              ))}
            </div>
          </div>
          <div style={{ padding: 22, display: 'grid', gridTemplateColumns: '1fr 220px', gap: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{audienceTexts[audience].title}</div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--tx-1)' }}>{audienceTexts[audience].body}</p>
            </div>
            <div style={{ borderLeft: '1px solid var(--bd-default)', paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div className="t-micro" style={{ color: 'var(--tx-3)', marginBottom: 6 }}>Tom</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  {audience === 'brm' ? 'Executivo · direto' : audience === 'tech' ? 'Técnico · preciso' : 'Empático · transparente'}
                </div>
              </div>
              <div>
                <div className="t-micro" style={{ color: 'var(--tx-3)', marginBottom: 6 }}>Tempo de leitura</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  {audience === 'brm' ? '~1 min' : audience === 'tech' ? '~3 min' : '~2 min'}
                </div>
              </div>
              <button className="btn btn-sm btn-secondary" style={{ marginTop: 4 }}><Icon name="copy" size={12} /> Copiar texto</button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--c-primary-soft)', color: 'var(--c-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="mail" size={16} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Será enviado para 8 destinatários</div>
              <div style={{ fontSize: 12, color: 'var(--tx-2)' }}>BRM · Diretor de Tech · Stakeholders · Time interno</div>
            </div>
          </div>
          <button className="btn btn-secondary"><Icon name="eye" size={14} /> Preview PDF</button>
          <button className="btn btn-secondary"><Icon name="calendar" size={14} /> Agendar envio</button>
          <button className="btn btn-primary btn-lg"><Icon name="send" size={14} /> Confirmar envio</button>
        </div>
      </div>
    </div>
  );
}

window.ScreenStatusReport = ScreenStatusReport;
