// MobileDashboard.jsx — Screen 6 (Mobile dashboard, iPhone)

function MobileBottomNav({ active = 'home' }) {
  const items = [
    { id: 'home', icon: 'home', label: 'Início' },
    { id: 'cal', icon: 'calendar', label: 'Agenda' },
    { id: 'tasks', icon: 'checklist', label: 'Tarefas' },
    { id: 'ai', icon: 'sparkles', label: 'IA', special: true },
    { id: 'menu', icon: 'menu-2', label: 'Mais' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 28, paddingTop: 8,
      background: 'rgba(15,15,19,0.92)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--bd-default)',
      display: 'flex', justifyContent: 'space-around',
      zIndex: 5,
    }}>
      {items.map(it => {
        const isActive = it.id === active;
        return (
          <div key={it.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 8 }}>
            {it.special ? (
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--grad-ai)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                marginTop: -6,
              }}>
                <Sparkle size={18} style={{ filter: 'brightness(0) invert(1)' }} />
              </div>
            ) : (
              <Icon name={it.icon} size={22} style={{ color: isActive ? 'var(--c-primary)' : 'var(--tx-3)' }} />
            )}
            <span style={{ fontSize: 10, color: isActive ? 'var(--c-primary)' : 'var(--tx-3)', fontWeight: isActive ? 600 : 500 }}>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function ScreenMobile() {
  const [taskDone, setTaskDone] = useState({});

  return (
    <IOSDevice width={375} height={812} dark={true}>
      <div className="cortex" style={{
        background: 'var(--bg-base)', height: '100%',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{
          paddingTop: 56, paddingLeft: 20, paddingRight: 20, paddingBottom: 8,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Logo size={22} withText={false} />
          <span style={{ fontSize: 16, fontWeight: 700 }}>Cortex</span>
          <div style={{ flex: 1 }} />
          <button className="icon-btn"><Icon name="search" size={18} /></button>
          <button className="icon-btn" style={{ position: 'relative' }}>
            <Icon name="bell" size={18} />
            <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: 'var(--c-danger)', border: '2px solid var(--bg-base)' }} />
          </button>
          <Avatar name="Mariana Reis" size={28} color="#6366F1" />
        </div>

        {/* Scrollable content */}
        <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: '4px 20px 96px' }}>
          {/* Greeting */}
          <div style={{ marginTop: 4, marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: 'var(--tx-2)', marginBottom: 2 }}>Terça, 26 de mai</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Bom dia, Mariana.</h1>
          </div>

          {/* AI card */}
          <div className="card-ai" style={{ padding: 16, marginBottom: 18, boxShadow: 'var(--sh-glow)' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Sparkle size={16} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>Seu dia em 3 linhas</span>
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--tx-1)' }}>
                Comece pela <strong>lista de Estatística</strong> (90min). Sua reunião com o orientador é amanhã às 10h — separei 25min hoje para você preparar as perguntas.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 11, color: 'var(--tx-2)' }}>
                <Icon name="refresh" size={11} />Puxe para regenerar
              </div>
            </div>
          </div>

          {/* Agora — horizontal scroll */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="flame" size={14} style={{ color: 'var(--c-warning)' }} /> Agora
              </h3>
              <span style={{ fontSize: 11, color: 'var(--tx-3)' }}>1 de 3 ›</span>
            </div>
            <div className="scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', margin: '0 -20px', padding: '0 20px 4px', scrollSnapType: 'x mandatory' }}>
              {[
                { title: 'Lista 5 — Estatística', proj: 'Estatística', color: '#10B981', urgency: 'urgent', due: 'Hoje 23h59', est: 90 },
                { title: 'Reler artigo DINOv2', proj: 'TCC · Visão', color: '#6366F1', urgency: 'attention', due: 'Hoje', est: 40 },
                { title: '3 perguntas p/ orientador', proj: 'TCC · Visão', color: '#6366F1', urgency: 'attention', due: 'Amanhã 10h', est: 25 },
              ].map((t, i) => (
                <div key={i} style={{
                  flex: '0 0 240px', scrollSnapAlign: 'start',
                  background: 'var(--bg-card)',
                  border: `1px solid ${i === 0 ? 'rgba(239,68,68,0.4)' : 'var(--bd-default)'}`,
                  borderLeft: `3px solid ${i === 0 ? 'var(--c-danger)' : t.color}`,
                  borderRadius: 12,
                  padding: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    {i === 0 ? <Badge tone="urgent" icon="alert-triangle">Urgente</Badge> : <Badge tone="attention" icon="clock">Atenção</Badge>}
                    <span style={{ fontSize: 10, color: 'var(--tx-3)', marginLeft: 'auto' }}>#{i + 1}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginBottom: 8 }}>{t.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--tx-2)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: 99, background: t.color }} />
                      {t.proj}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--bd-default)' }}>
                    <span style={{ fontSize: 11, color: 'var(--tx-2)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="calendar" size={11} /> {t.due}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--tx-2)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="clock" size={11} /> {t.est}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini agenda */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="calendar" size={14} style={{ color: 'var(--c-primary)' }} /> Agenda de hoje
              </h3>
              <span style={{ fontSize: 11, color: 'var(--tx-3)' }}>3 eventos</span>
            </div>
            <div className="card" style={{ padding: 0 }}>
              {[
                { time: '11:00', dur: '90min', title: 'Aula de Estatística', loc: 'Sala B-204', color: '#10B981', now: true },
                { time: '14:30', dur: '60min', title: 'Reunião do grupo', loc: 'Discord', color: '#6366F1' },
                { time: '18:00', dur: '45min', title: 'Yoga', loc: 'Estúdio Zen', color: '#F59E0B' },
              ].map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: i < 2 ? '1px solid var(--bd-default)' : 'none' }}>
                  <div style={{ width: 44, textAlign: 'center' }}>
                    <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{e.time}</div>
                    <div style={{ fontSize: 10, color: 'var(--tx-3)', marginTop: 1 }}>{e.dur}</div>
                  </div>
                  <div style={{ width: 3, alignSelf: 'stretch', background: e.color, borderRadius: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {e.title}
                      {e.now && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 99, background: 'var(--c-success)', color: 'white', fontWeight: 600 }}>EM 12min</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--tx-2)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Icon name="map-pin" size={10} />{e.loc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prazos — horizontal chips */}
          <div style={{ marginBottom: 8 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="alarm" size={14} style={{ color: 'var(--c-danger)' }} /> Prazos
            </h3>
            <div className="scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -20px', padding: '0 20px 4px' }}>
              {[
                { d: '0d', label: 'Hoje', title: 'Lista 5', color: '#EF4444' },
                { d: '1d', label: 'Amanhã', title: 'Reunião', color: '#F59E0B' },
                { d: '3d', label: '3 dias', title: 'Cap. 3 TCC', color: '#F59E0B' },
                { d: '8d', label: '8 dias', title: 'IC', color: '#10B981' },
              ].map((p, i) => (
                <div key={i} style={{
                  flex: '0 0 auto',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--bd-default)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  display: 'flex', flexDirection: 'column', gap: 4,
                  minWidth: 100,
                }}>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: p.color, letterSpacing: '-0.02em', lineHeight: 1 }}>{p.d}</div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{p.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--tx-3)' }}>{p.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <MobileBottomNav active="home" />
      </div>
    </IOSDevice>
  );
}

window.ScreenMobile = ScreenMobile;
