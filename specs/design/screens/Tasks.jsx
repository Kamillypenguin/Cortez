// Tasks.jsx — Screen 4 (Tasks management, student profile)

const DISCIPLINES = {
  'Estatística': '#10B981',
  'Visão Comp.': '#6366F1',
  'Iniciação Cient.': '#F59E0B',
  'Cálculo III': '#EC4899',
  'Inglês Acad.': '#3B82F6',
};

function ScreenTasks() {
  const [tab, setTab] = useState('hoje');
  const [filterDisc, setFilterDisc] = useState(null);
  const [done, setDone] = useState({});

  const allTasks = [
    { id: 1, title: 'Finalizar lista 5 — Distribuições contínuas', disc: 'Estatística', due: 'Hoje · 23:59', urgency: 'urgent', attach: true, est: 90, focus: true, focusWhy: 'Prazo apertado · 23h e libera tempo para o TCC.' },
    { id: 2, title: 'Reler artigo DINOv2 (Beyer et al.)', disc: 'Visão Comp.', due: 'Hoje', urgency: 'attention', attach: true, est: 40, focus: true, focusWhy: 'Pré-requisito para a reunião de amanhã.' },
    { id: 3, title: 'Preparar 3 perguntas para o orientador', disc: 'Visão Comp.', due: 'Amanhã · 10:00', urgency: 'attention', attach: false, est: 25, focus: true, focusWhy: 'Sua reunião quinzenal — máximo retorno por minuto.' },
    { id: 4, title: 'Sincronizar bibliografia no Zotero', disc: 'Visão Comp.', due: 'Hoje', urgency: 'normal', attach: false, est: 15 },
    { id: 5, title: 'Revisar capítulo 7 — Cálculo III', disc: 'Cálculo III', due: 'Quinta', urgency: 'normal', attach: true, est: 60 },
    { id: 6, title: 'Apresentação IC — montar slides v1', disc: 'Iniciação Cient.', due: '3 jun', urgency: 'normal', attach: false, est: 120 },
    { id: 7, title: 'Inglês — submission writing essay 4', disc: 'Inglês Acad.', due: '5 jun', urgency: 'normal', attach: true, est: 90 },
  ];

  const tabs = [
    { id: 'hoje', label: 'Hoje', count: 4 },
    { id: 'semana', label: 'Esta semana', count: 12 },
    { id: 'disciplinas', label: 'Disciplinas', count: 5 },
    { id: 'concluidas', label: 'Concluídas', count: 23 },
  ];

  const focusTasks = allTasks.filter(t => t.focus);
  const listTasks = filterDisc ? allTasks.filter(t => t.disc === filterDisc) : allTasks;

  return (
    <div className="cortex" style={{ width: 1440, height: 900, display: 'grid', gridTemplateColumns: '220px 1fr', background: 'var(--bg-base)', overflow: 'hidden' }}>

      {/* Sidebar (compact) */}
      <aside style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--bd-default)', padding: '20px 14px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '4px 6px 22px' }}><Logo size={26} /></div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 22 }}>
          <NavItem icon="home" label="Início" />
          <NavItem icon="calendar" label="Agenda" />
          <NavItem icon="checklist" label="Tarefas" active />
          <NavItem icon="folder" label="Arquivos" />
          <NavItem icon="sparkles" label="IA" color="#8B5CF6" />
          <NavItem icon="users" label="Colaboração" />
        </nav>

        <div className="t-micro" style={{ color: 'var(--tx-3)', padding: '0 6px 10px' }}>Disciplinas</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={() => setFilterDisc(null)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px',
            background: !filterDisc ? 'var(--bg-card)' : 'transparent',
            border: 'none', borderRadius: 6, cursor: 'pointer',
            color: 'var(--tx-1)', fontSize: 13, textAlign: 'left',
          }}>
            <Icon name="apps" size={14} style={{ color: 'var(--tx-2)' }} />
            <span style={{ flex: 1 }}>Todas</span>
            <span style={{ fontSize: 11, color: 'var(--tx-3)' }}>{allTasks.length}</span>
          </button>
          {Object.entries(DISCIPLINES).map(([d, c]) => (
            <button key={d} onClick={() => setFilterDisc(d)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px',
              background: filterDisc === d ? 'var(--bg-card)' : 'transparent',
              border: 'none', borderRadius: 6, cursor: 'pointer',
              color: filterDisc === d ? 'var(--tx-1)' : 'var(--tx-2)', fontSize: 13, textAlign: 'left',
            }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: c, flexShrink: 0 }} />
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d}</span>
              <span style={{ fontSize: 11, color: 'var(--tx-3)' }}>{allTasks.filter(t => t.disc === d).length}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: 56, borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16 }}>
          <h1 className="t-h1" style={{ margin: 0 }}>Tarefas</h1>
          <Badge tone="neutral">{allTasks.length} ativas</Badge>
          <div style={{ flex: 1 }} />
          <div style={{ width: 280, height: 34, background: 'var(--bg-surface)', border: '1px solid var(--bd-default)', borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
            <Icon name="search" size={13} style={{ color: 'var(--tx-3)' }} />
            <span style={{ flex: 1, color: 'var(--tx-3)', fontSize: 13 }}>Buscar tarefa…</span>
          </div>
          <button className="btn btn-secondary"><Icon name="filter" size={14} /> Filtros</button>
          <button className="btn btn-primary"><Icon name="plus" size={14} /> Nova tarefa</button>
        </header>

        <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: '24px 28px 32px' }}>

          {/* AI urgency banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.10), rgba(245,158,11,0.04))',
            border: '1px solid rgba(245,158,11,0.32)',
            borderLeft: '3px solid var(--c-warning)',
            borderRadius: 12, padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(245,158,11,0.18)', color: 'var(--c-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="alert-triangle" size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Você tem 2 entregas amanhã.</div>
              <div style={{ fontSize: 13, color: 'var(--tx-2)' }}>A IA pode reorganizar seu dia para priorizar essas tarefas.</div>
            </div>
            <button className="btn btn-sm btn-ai"><Sparkle size={12} /> Priorizar meu dia</button>
            <button className="icon-btn"><Icon name="x" size={14} /></button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid var(--bd-default)', marginBottom: 22 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '12px 16px',
                color: tab === t.id ? 'var(--tx-1)' : 'var(--tx-2)',
                fontWeight: tab === t.id ? 600 : 500,
                fontSize: 13,
                borderBottom: `2px solid ${tab === t.id ? 'var(--c-primary)' : 'transparent'}`,
                marginBottom: -1,
                transition: 'all 120ms',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {t.label}
                <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 99, background: tab === t.id ? 'var(--c-primary-soft)' : 'var(--bg-card)', color: tab === t.id ? 'var(--c-primary)' : 'var(--tx-3)' }}>{t.count}</span>
              </button>
            ))}
          </div>

          {/* Focus card */}
          <div className="card-ai" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', padding: '16px 20px 14px', borderBottom: '1px solid var(--c-primary-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkle size={20} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Foco do dia</div>
                <div style={{ fontSize: 12, color: 'var(--tx-2)' }}>As 3 tarefas que mais movem sua semana, escolhidas pela IA.</div>
              </div>
              <Badge tone="ai">Cortex AI</Badge>
            </div>
            <div style={{ position: 'relative', padding: '14px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {focusTasks.map((t, i) => (
                <div key={t.id} style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--bd-default)', borderRadius: 10, padding: 14, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -8, left: 14, fontSize: 10, padding: '3px 8px', borderRadius: 99, background: 'var(--grad-ai)', color: 'white', fontWeight: 600 }}>#{i + 1}</div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <CheckCircle checked={!!done[t.id]} onChange={v => setDone(s => ({ ...s, [t.id]: v }))} color={DISCIPLINES[t.disc]} />
                    <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, flex: 1 }}>{t.title}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--tx-2)', lineHeight: 1.45, marginBottom: 10, paddingLeft: 30 }}>
                    <Icon name="sparkles" size={11} style={{ color: 'var(--c-primary)', marginRight: 4 }} />
                    {t.focusWhy}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 30 }}>
                    <Badge tone="normal" icon={null}>
                      <span style={{ width: 6, height: 6, borderRadius: 99, background: DISCIPLINES[t.disc] }} />
                      {t.disc}
                    </Badge>
                    <span style={{ fontSize: 11, color: 'var(--tx-3)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Icon name="clock" size={11} /> {t.est}min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task list */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 className="t-h3" style={{ margin: 0 }}>Todas as tarefas</h3>
              {filterDisc && (
                <Badge tone="normal">
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: DISCIPLINES[filterDisc] }} />
                  {filterDisc}
                  <Icon name="x" size={11} style={{ marginLeft: 2, cursor: 'pointer' }} onClick={() => setFilterDisc(null)} />
                </Badge>
              )}
              <div style={{ flex: 1 }} />
              <button className="btn btn-sm btn-ghost"><Icon name="arrows-sort" size={12} /> Ordenar: Urgência</button>
              <button className="btn btn-sm btn-ghost"><Icon name="layout-grid" size={12} /></button>
            </div>
            {listTasks.map((t, i) => {
              const checked = !!done[t.id];
              const discColor = DISCIPLINES[t.disc];
              return (
                <div key={t.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px',
                    borderBottom: i < listTasks.length - 1 ? '1px solid var(--bd-default)' : 'none',
                    transition: 'background 120ms', opacity: checked ? 0.5 : 1,
                    cursor: 'pointer',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <CheckCircle checked={checked} onChange={v => setDone(s => ({ ...s, [t.id]: v }))} color={discColor} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, textDecoration: checked ? 'line-through' : 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {t.title}
                      {t.attach && <Icon name="paperclip" size={13} style={{ color: 'var(--tx-3)' }} />}
                    </div>
                  </div>
                  <Badge tone="normal" icon={null}>
                    <span style={{ width: 6, height: 6, borderRadius: 99, background: discColor }} />
                    {t.disc}
                  </Badge>
                  <span style={{ fontSize: 12, color: 'var(--tx-2)', minWidth: 110, textAlign: 'right' }}>
                    <Icon name="clock" size={12} style={{ marginRight: 4 }} />{t.est}min
                  </span>
                  <span style={{ minWidth: 130, textAlign: 'right' }}>
                    {t.urgency === 'urgent' && <Badge tone="urgent" icon="alert-triangle">{t.due}</Badge>}
                    {t.urgency === 'attention' && <Badge tone="attention" icon="clock">{t.due}</Badge>}
                    {t.urgency === 'normal' && <span style={{ fontSize: 12, color: 'var(--tx-2)' }}>{t.due}</span>}
                  </span>
                  <button className="icon-btn"><Icon name="dots" size={14} /></button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

window.ScreenTasks = ScreenTasks;
