// Dashboard.jsx — Screen 2 (Web Dashboard, dark mode)

function ScreenDashboard() {
  const [activeNav, setActiveNav] = useState('home');
  const [taskState, setTaskState] = useState({ t1: false, t2: false, t3: true, t4: false });
  const [quickInput, setQuickInput] = useState('');

  const userName = 'Mariana';
  const today = 'Terça, 26 de maio';

  return (
    <div className="cortex" style={{ width: 1440, height: 900, display: 'grid', gridTemplateColumns: '220px 1fr 300px', background: 'var(--bg-base)', overflow: 'hidden' }}>

      {/* ===== SIDEBAR ===== */}
      <aside style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--bd-default)', display: 'flex', flexDirection: 'column', padding: '20px 14px' }}>
        <div style={{ padding: '4px 6px 22px' }}>
          <Logo size={26} />
        </div>

        {/* User card */}
        <div style={{ padding: '10px', background: 'var(--bg-card)', borderRadius: 10, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name="Mariana Reis" size={32} color="#6366F1" />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Mariana Reis</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--tx-2)', marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366F1' }} />
              Estudante · Pós
            </div>
          </div>
          <Icon name="selector" size={14} style={{ color: 'var(--tx-3)' }} />
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 18 }}>
          <NavItem icon="home" label="Início" active={activeNav === 'home'} onClick={() => setActiveNav('home')} />
          <NavItem icon="calendar" label="Agenda" active={activeNav === 'cal'} onClick={() => setActiveNav('cal')} badge="3" />
          <NavItem icon="checklist" label="Tarefas" active={activeNav === 'tasks'} onClick={() => setActiveNav('tasks')} />
          <NavItem icon="folder" label="Arquivos" active={activeNav === 'files'} onClick={() => setActiveNav('files')} />
          <NavItem icon="sparkles" label="IA" active={activeNav === 'ai'} onClick={() => setActiveNav('ai')} color="#8B5CF6" />
          <NavItem icon="users" label="Colaboração" active={activeNav === 'collab'} onClick={() => setActiveNav('collab')} />
        </nav>

        {/* Projects */}
        <div style={{ flex: 1, overflow: 'auto' }} className="scroll">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px', marginBottom: 6 }}>
            <span className="t-micro" style={{ color: 'var(--tx-3)' }}>Projetos recentes</span>
            <Icon name="plus" size={12} style={{ color: 'var(--tx-3)', cursor: 'pointer' }} />
          </div>
          {[
            { name: 'TCC · Visão Computacional', status: 'warn' },
            { name: 'Disciplina · Estatística', status: 'ok' },
            { name: 'Iniciação Científica', status: 'ok' },
            { name: 'Monografia parcial', status: 'bad' },
            { name: 'Grupo de Estudos', status: 'paused' },
          ].map(p => (
            <button key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'transparent', border: 'none', padding: '6px 8px', borderRadius: 6, color: 'var(--tx-2)', cursor: 'pointer', fontSize: 12, textAlign: 'left' }}>
              <StatusDot status={p.status} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{p.name}</span>
            </button>
          ))}
        </div>

        <button className="btn btn-primary" style={{ marginTop: 16, width: '100%', justifyContent: 'center', height: 40 }}>
          <Icon name="plus" size={16} /> Novo
        </button>
      </aside>

      {/* ===== MAIN ===== */}
      <main style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: 56, borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--tx-2)', fontSize: 13 }}>
            <Icon name="home" size={14} />
            <span>Início</span>
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 440, height: 36, background: 'var(--bg-surface)', border: '1px solid var(--bd-default)', borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 10 }}>
              <Icon name="search" size={14} style={{ color: 'var(--tx-3)' }} />
              <span style={{ flex: 1, color: 'var(--tx-3)', fontSize: 13 }}>Buscar em tudo…</span>
              <span className="kbd">⌘</span><span className="kbd">K</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button className="icon-btn"><Icon name="bell" size={16} />
              <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--c-danger)', border: '2px solid var(--bg-base)' }} />
            </button>
            <button className="icon-btn"><Icon name="moon" size={16} /></button>
            <Avatar name="Mariana Reis" size={28} color="#6366F1" />
          </div>
        </header>

        {/* Content */}
        <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: '28px 32px 32px' }}>
          {/* Greeting */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
              Bom dia, {userName}.{' '}
              <span style={{ color: 'var(--tx-2)', fontWeight: 500 }}>Aqui está seu dia.</span>
            </h1>
            <span style={{ color: 'var(--tx-2)', fontSize: 14 }}>{today}</span>
          </div>

          {/* AI Summary card */}
          <div className="card-ai" style={{ marginBottom: 24, padding: 20, boxShadow: 'var(--sh-glow)' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>
                <Sparkle size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Resumo do seu dia</span>
                  <Badge tone="ai">Gerado pela IA · há 2 min</Badge>
                </div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: 'var(--tx-1)' }}>
                  Hoje você tem <strong>2 entregas com prazo curto</strong> (TCC · capítulo 3 e Estatística · lista 5). Sugiro começar pela <strong>lista de Estatística</strong> — leva ~90min e libera você para focar no capítulo do TCC à tarde. Seu orientador respondeu o email das 14h de ontem.
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                  <button className="btn btn-sm btn-secondary"><Icon name="list-check" size={13} /> Priorizar meu dia</button>
                  <button className="btn btn-sm btn-secondary"><Icon name="calendar-plus" size={13} /> Bloquear agenda</button>
                  <button className="btn btn-sm btn-ghost"><Icon name="refresh" size={13} /> Regenerar</button>
                </div>
              </div>
            </div>
          </div>

          {/* Two-col mid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, marginBottom: 24 }}>
            {/* HOJE */}
            <section className="card" style={{ padding: 0 }}>
              <div style={{ padding: '16px 18px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--bd-default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="flame" size={16} style={{ color: 'var(--c-warning)' }} />
                  <h3 className="t-h3" style={{ margin: 0 }}>Hoje</h3>
                  <Badge tone="neutral">4 tarefas</Badge>
                </div>
                <button className="btn btn-sm btn-ghost"><Icon name="plus" size={12} /> Adicionar</button>
              </div>
              <div>
                {[
                  { id: 't1', title: 'Finalizar lista 5 — Estatística', proj: 'Estatística', projColor: '#10B981', urgency: 'urgent', due: 'Hoje · 23:59', durMin: 90 },
                  { id: 't2', title: 'Reler artigo Lucas Beyer (DINOv2)', proj: 'TCC · Visão', projColor: '#6366F1', urgency: 'attention', due: 'Hoje', durMin: 40 },
                  { id: 't3', title: 'Sincronizar bibliografia no Zotero', proj: 'TCC · Visão', projColor: '#6366F1', urgency: 'normal', due: 'Concluída 09:12', durMin: 15 },
                  { id: 't4', title: 'Reunião com orientador — preparar 3 perguntas', proj: 'TCC · Visão', projColor: '#6366F1', urgency: 'attention', due: 'Amanhã · 10:00', durMin: 20 },
                ].map((t, i) => {
                  const checked = taskState[t.id];
                  return (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < 3 ? '1px solid var(--bd-default)' : 'none', opacity: checked ? 0.55 : 1, transition: 'opacity 200ms' }}>
                      <CheckCircle checked={checked} onChange={(v) => setTaskState(s => ({ ...s, [t.id]: v }))} color={t.projColor} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--tx-1)', textDecoration: checked ? 'line-through' : 'none', textDecorationColor: 'var(--tx-3)' }}>
                          {t.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, fontSize: 12, color: 'var(--tx-2)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.projColor }} />
                            {t.proj}
                          </span>
                          <span style={{ color: 'var(--tx-3)' }}>·</span>
                          <span>{t.due}</span>
                          <span style={{ color: 'var(--tx-3)' }}>·</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="clock" size={12} /> {t.durMin}min</span>
                        </div>
                      </div>
                      {t.urgency === 'urgent' && <Badge tone="urgent" icon="alert-triangle">Urgente</Badge>}
                      {t.urgency === 'attention' && <Badge tone="attention" icon="clock">Atenção</Badge>}
                      {checked && <Badge tone="done" icon="check">Feita</Badge>}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Mini calendar */}
            <section className="card" style={{ padding: 0 }}>
              <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className="t-h3" style={{ margin: 0 }}>Esta semana</h3>
                <span style={{ fontSize: 12, color: 'var(--tx-2)' }}>Mai 26 – Jun 1</span>
              </div>
              {/* Week strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '14px 12px 8px', gap: 4 }}>
                {[
                  { d: 'T', n: 26, today: true, evt: 3 },
                  { d: 'Q', n: 27, evt: 2 },
                  { d: 'Q', n: 28, evt: 1 },
                  { d: 'S', n: 29, evt: 4 },
                  { d: 'S', n: 30, evt: 0 },
                  { d: 'D', n: 31, evt: 0 },
                  { d: 'S', n: 1, evt: 2 },
                ].map((day, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '6px 0', borderRadius: 6, background: day.today ? 'var(--c-primary-soft)' : 'transparent' }}>
                    <div style={{ fontSize: 10, color: 'var(--tx-3)', marginBottom: 4, textTransform: 'uppercase' }}>{day.d}</div>
                    <div style={{ fontSize: 14, fontWeight: day.today ? 700 : 500, color: day.today ? 'var(--c-primary)' : 'var(--tx-1)' }}>{day.n}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 4, height: 4 }}>
                      {[...Array(Math.min(day.evt, 3))].map((_, j) => (
                        <span key={j} style={{ width: 4, height: 4, borderRadius: 99, background: day.today ? 'var(--c-primary)' : 'var(--tx-3)' }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Today's events */}
              <div style={{ padding: '4px 12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '6px 6px 8px' }}>Eventos de hoje</div>
                {[
                  { time: '11:00', title: 'Aula de Estatística', loc: 'Sala B-204', color: '#10B981' },
                  { time: '14:30', title: 'Reunião do grupo', loc: 'Discord', color: '#6366F1' },
                  { time: '18:00', title: 'Yoga', loc: 'Estúdio', color: '#F59E0B' },
                ].map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 6 }}>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--tx-2)', width: 38 }}>{e.time}</span>
                    <span style={{ width: 3, alignSelf: 'stretch', background: e.color, borderRadius: 2 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--tx-3)' }}>{e.loc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Prazos próximos */}
          <section style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 className="t-h2" style={{ margin: 0 }}>Prazos próximos</h3>
              <button style={{ background: 'none', border: 'none', color: 'var(--tx-2)', fontSize: 12, cursor: 'pointer' }}>Ver todos →</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {[
                { days: 0, label: 'Hoje', title: 'Lista 5 — Estatística', proj: 'Estatística', color: '#EF4444' },
                { days: 1, label: '1 dia', title: 'Reunião orientador', proj: 'TCC · Visão', color: '#F59E0B' },
                { days: 3, label: '3 dias', title: 'Entrega cap. 3 do TCC', proj: 'TCC · Visão', color: '#F59E0B' },
                { days: 8, label: '8 dias', title: 'Apresentação IC', proj: 'Iniciação Cient.', color: '#10B981' },
              ].map((p, i) => (
                <div key={i} className="card" style={{ padding: 14, borderLeft: `3px solid ${p.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ fontSize: 26, fontWeight: 700, color: p.color, letterSpacing: '-0.02em', lineHeight: 1 }} className="mono">
                      {p.days === 0 ? '0d' : `${p.days}d`}
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--tx-3)', textTransform: 'uppercase' }}>{p.label}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, lineHeight: 1.3 }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--tx-2)' }}>{p.proj}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* ===== RIGHT — Contextual ===== */}
      <aside style={{ borderLeft: '1px solid var(--bd-default)', background: 'var(--bg-surface)', padding: '20px 18px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }} className="scroll">

        {/* Quick chat */}
        <div className="card-ai" style={{ padding: 14 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Sparkle size={16} />
            <span style={{ fontWeight: 600, fontSize: 13 }}>Pergunte ao Cortex</span>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              placeholder="Resuma a aula de Estatística…"
              value={quickInput}
              onChange={e => setQuickInput(e.target.value)}
              style={{ paddingRight: 36, background: 'rgba(0,0,0,0.25)', borderColor: 'var(--c-primary-border)' }}
            />
            <button style={{ position: 'absolute', right: 4, top: 4, width: 28, height: 28, borderRadius: 6, border: 'none', background: 'var(--grad-ai)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="arrow-up" size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {['Resumir aula', 'O que fazer agora?', 'Gerar mapa mental'].map(s => (
              <button key={s} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 99, border: '1px solid var(--bd-default)', background: 'transparent', color: 'var(--tx-2)', cursor: 'pointer' }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Recent files */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h4 className="t-h3" style={{ margin: 0 }}>Arquivos recentes</h4>
            <Icon name="dots" size={14} style={{ color: 'var(--tx-3)' }} />
          </div>
          {[
            { icon: 'file-text', name: 'Cap3_revisao_2.docx', proj: 'TCC · Visão', t: 'há 12min', color: '#3B82F6' },
            { icon: 'file-spreadsheet', name: 'dataset_resultados.xlsx', proj: 'Iniciação Cient.', t: 'há 1h', color: '#10B981' },
            { icon: 'photo', name: 'diagrama_arquitetura.png', proj: 'TCC · Visão', t: 'ontem', color: '#8B5CF6' },
            { icon: 'file-text', name: 'lista_5_enunciado.pdf', proj: 'Estatística', t: 'ontem', color: '#EF4444' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 6, cursor: 'pointer' }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: `${f.color}1A`, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={f.icon} size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                <div style={{ fontSize: 11, color: 'var(--tx-3)' }}>{f.proj} · {f.t}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Produtividade widget */}
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <h4 className="t-h3" style={{ margin: 0 }}>Esta semana</h4>
            <span style={{ fontSize: 11, color: 'var(--c-success)', fontWeight: 600 }}>+18%</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 2 }} className="mono">23 tarefas</div>
          <div style={{ fontSize: 11, color: 'var(--tx-2)', marginBottom: 14 }}>concluídas vs semana passada</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 48 }}>
            {[0.4, 0.65, 0.5, 0.8, 0.95, 0.3, 0.6].map((v, i) => (
              <div key={i} style={{ flex: 1, height: `${v * 100}%`, background: i === 4 ? 'var(--c-primary)' : 'var(--bd-strong)', borderRadius: 3 }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--tx-3)' }}>
            <span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span><span>D</span>
          </div>
        </div>

        {/* Activity */}
        <div>
          <h4 className="t-h3" style={{ margin: '0 0 10px' }}>Atividade do time</h4>
          {[
            { who: 'Prof. Costa', what: 'comentou em Cap3_revisao.docx', t: '8min', color: '#10B981' },
            { who: 'Lucas M.', what: 'compartilhou um arquivo', t: '1h', color: '#F59E0B' },
            { who: 'Cortex IA', what: 'gerou seu resumo diário', t: '2h', color: '#8B5CF6' },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 6px', alignItems: 'flex-start' }}>
              <Avatar name={a.who} size={24} color={a.color} />
              <div style={{ flex: 1, fontSize: 12, color: 'var(--tx-2)', lineHeight: 1.4 }}>
                <span style={{ color: 'var(--tx-1)', fontWeight: 500 }}>{a.who}</span> {a.what}
                <div style={{ fontSize: 10, color: 'var(--tx-3)', marginTop: 2 }}>há {a.t}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

window.ScreenDashboard = ScreenDashboard;
