// Onboarding.jsx — Screen 1
const { useState: useStateOB } = React;

function ScreenOnboarding() {
  const [selected, setSelected] = useState(null);
  const [hover, setHover] = useState(null);

  const profiles = [
    { id: 'estudante', icon: 'school', title: 'Estudante', subtitle: 'Provas, trabalhos e prazos — tudo organizado.', color: '#6366F1', tag: 'Universidade · Pós · Cursos' },
    { id: 'professor', icon: 'chalkboard', title: 'Professor / Educador', subtitle: 'Gerencie turmas, aulas e materiais com IA.', color: '#10B981', tag: 'Plano de aula · Notas · Materiais' },
    { id: 'profissional', icon: 'briefcase', title: 'Profissional', subtitle: 'Clientes, projetos e prazos num só lugar.', color: '#F59E0B', tag: 'Freelance · Consultoria · Liberal' },
    { id: 'corporativo', icon: 'sitemap', title: 'Coordenador de Projetos', subtitle: 'Equipes, sprints e relatórios automáticos.', color: '#3B82F6', tag: 'Sprints · Status report · Equipes' },
  ];

  const activeColor = selected ? profiles.find(p => p.id === selected).color : '#6366F1';

  return (
    <div className="cortex" style={{ width: 1440, height: 900, display: 'grid', gridTemplateColumns: '560px 1fr', overflow: 'hidden' }}>

      {/* Left — brand / manifesto */}
      <div style={{
        background: 'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.18), transparent 50%), radial-gradient(circle at 80% 80%, rgba(236,72,153,0.12), transparent 50%), #0F0F13',
        padding: '56px 56px 48px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Bg mesh dots */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none' }} width="100%" height="100%">
          <defs>
            <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#9090A8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        <div style={{ position: 'relative' }}>
          <Logo size={32} />
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--bd-default)', marginBottom: 24 }}>
            <Sparkle size={14} />
            <span className="t-micro" style={{ color: 'var(--tx-1)' }}>Seu segundo cérebro · com IA</span>
          </div>

          <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', margin: 0, marginBottom: 20 }}>
            Tudo o que importa,<br />
            <span className="ai-gradient-text">organizado por você.<br />Priorizado pela IA.</span>
          </h1>

          <p style={{ color: 'var(--tx-2)', fontSize: 16, lineHeight: 1.55, margin: 0, marginBottom: 32, maxWidth: 420 }}>
            Agenda, tarefas, arquivos e comunicação reunidos num só lugar — com um assistente que conhece seu contexto e te ajuda a decidir o que fazer agora.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 420 }}>
            {[
              { icon: 'calendar-event', label: 'Agenda unificada' },
              { icon: 'checklist', label: 'Tarefas inteligentes' },
              { icon: 'folder', label: 'Arquivos contextuais' },
              { icon: 'sparkles', label: 'Resumos da IA' },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--tx-2)', fontSize: 13 }}>
                <Icon name={f.icon} size={16} style={{ color: activeColor, transition: 'color 250ms' }} />
                {f.label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--tx-3)', fontSize: 12 }}>
          <Icon name="lock" size={14} />
          Seus dados criptografados · LGPD · SOC 2
        </div>
      </div>

      {/* Right — profile selection */}
      <div style={{
        background: 'var(--bg-base)',
        padding: '64px 72px',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span className="t-micro" style={{ color: 'var(--tx-3)' }}>Passo 1 de 3</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <span style={{ width: 24, height: 3, borderRadius: 2, background: activeColor, transition: 'background 250ms' }} />
            <span style={{ width: 24, height: 3, borderRadius: 2, background: 'var(--bd-default)' }} />
            <span style={{ width: 24, height: 3, borderRadius: 2, background: 'var(--bd-default)' }} />
          </div>
        </div>

        <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', margin: '12px 0 8px' }}>
          Como você vai usar o Cortex?
        </h2>
        <p style={{ color: 'var(--tx-2)', fontSize: 15, margin: 0, marginBottom: 36 }}>
          Escolha o perfil que mais combina com seu dia. Você pode mudar depois.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          {profiles.map(p => {
            const isSel = selected === p.id;
            const isHov = hover === p.id;
            return (
              <button key={p.id}
                onClick={() => setSelected(p.id)}
                onMouseEnter={() => setHover(p.id)}
                onMouseLeave={() => setHover(null)}
                style={{
                  textAlign: 'left',
                  padding: 20,
                  background: isSel ? `linear-gradient(135deg, ${p.color}22, ${p.color}08)` : 'var(--bg-card)',
                  border: `1.5px solid ${isSel ? p.color : (isHov ? p.color + '88' : 'var(--bd-default)')}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                  transition: 'all 180ms ease-out',
                  position: 'relative',
                  color: 'var(--tx-1)',
                  boxShadow: isSel ? `0 8px 24px ${p.color}33` : 'none',
                  transform: isSel ? 'translateY(-2px)' : 'translateY(0)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: isSel ? p.color : `${p.color}22`,
                    color: isSel ? 'white' : p.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 200ms',
                  }}>
                    <Icon name={p.icon} size={22} />
                  </div>
                  {isSel && (
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: p.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="check" size={14} />
                    </div>
                  )}
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{p.title}</div>
                <div style={{ color: 'var(--tx-2)', fontSize: 13, lineHeight: 1.45, marginBottom: 12 }}>{p.subtitle}</div>
                <div style={{ fontSize: 11, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>{p.tag}</div>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 'auto' }}>
          <button className="btn btn-xl"
            disabled={!selected}
            style={{
              background: selected ? activeColor : 'var(--bg-card)',
              color: selected ? 'white' : 'var(--tx-3)',
              cursor: selected ? 'pointer' : 'not-allowed',
              boxShadow: selected ? `0 6px 20px ${activeColor}44` : 'none',
              transition: 'all 200ms',
            }}>
            Começar com este perfil
            <Icon name="arrow-right" size={16} />
          </button>
          <button style={{ background: 'none', border: 'none', color: 'var(--tx-2)', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
            Posso mudar depois?
          </button>
        </div>
      </div>
    </div>
  );
}

window.ScreenOnboarding = ScreenOnboarding;
