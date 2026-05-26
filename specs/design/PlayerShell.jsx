// PlayerShell.jsx — Scales any fixed-size screen to fit viewport
// Pattern: 1920×1080 style letterboxing — viewport-scale, navigation, prev/next

function PlayerShell({ screens }) {
  const [idx, setIdx] = useState(() => {
    const fromUrl = parseInt(new URLSearchParams(location.search).get('s'));
    return Number.isFinite(fromUrl) && fromUrl >= 0 && fromUrl < screens.length ? fromUrl : 0;
  });
  const [scale, setScale] = useState(1);
  const [showThumbs, setShowThumbs] = useState(false);
  const stageRef = useRef(null);

  const current = screens[idx];

  // Update URL hash for sharing/refresh
  useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set('s', String(idx));
    history.replaceState(null, '', url.toString());
  }, [idx]);

  // Fit-to-viewport scaling
  useEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight - 64; // top bar
      const sx = vw / current.w;
      const sy = vh / current.h;
      const s = Math.min(sx, sy, 1);
      setScale(s);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [current.w, current.h]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); setIdx(i => Math.min(screens.length - 1, i + 1)); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); setIdx(i => Math.max(0, i - 1)); }
      else if (e.key === 'Escape') setShowThumbs(false);
      else if (e.key === 'g' || e.key === 'G') setShowThumbs(s => !s);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screens.length]);

  const Screen = current.component;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#07070A',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
      color: '#F0F0F5',
    }}>
      {/* Top bar */}
      <header style={{
        height: 56,
        background: 'rgba(15,15,19,0.7)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #2A2A35',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 12,
        zIndex: 50, flexShrink: 0,
      }}>
        <Logo size={24} />
        <div style={{ width: 1, height: 20, background: '#2A2A35' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          <span style={{ fontSize: 11, color: '#5A5A72', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            {String(idx + 1).padStart(2, '0')} / {String(screens.length).padStart(2, '0')}
          </span>
          <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {current.title}
          </span>
          <span style={{ fontSize: 12, color: '#9090A8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            · {current.subtitle}
          </span>
        </div>

        {/* Controls */}
        <button onClick={() => setShowThumbs(s => !s)}
          title="Visão geral (G)"
          style={navBtnStyle(showThumbs)}>
          <Icon name="layout-grid" size={16} />
        </button>
        <button onClick={() => setIdx(i => Math.max(0, i - 1))}
          disabled={idx === 0}
          title="Anterior (←)"
          style={{ ...navBtnStyle(false), opacity: idx === 0 ? 0.3 : 1, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>
          <Icon name="chevron-left" size={18} />
        </button>
        <button onClick={() => setIdx(i => Math.min(screens.length - 1, i + 1))}
          disabled={idx === screens.length - 1}
          title="Próxima (→)"
          style={{ ...navBtnStyle(false), opacity: idx === screens.length - 1 ? 0.3 : 1, cursor: idx === screens.length - 1 ? 'not-allowed' : 'pointer' }}>
          <Icon name="chevron-right" size={18} />
        </button>
        <a href="canvas.html" title="Abrir visão de canvas"
          style={{ ...navBtnStyle(false), textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="layout-board" size={16} />
        </a>
      </header>

      {/* Stage */}
      <div ref={stageRef} style={{
        flex: 1, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <div style={{
          width: current.w, height: current.h,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px #2A2A35',
          borderRadius: scale < 1 ? 8 / scale : 0,
          overflow: 'hidden',
          background: '#0F0F13',
        }}>
          <Screen />
        </div>

        {/* Dots — bottom */}
        <div style={{
          position: 'absolute', bottom: 18,
          left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 6, alignItems: 'center',
          padding: '8px 14px',
          background: 'rgba(15,15,19,0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid #2A2A35',
          borderRadius: 99,
        }}>
          {screens.map((s, i) => (
            <button key={i} onClick={() => setIdx(i)}
              title={s.title}
              style={{
                width: i === idx ? 22 : 8, height: 8,
                borderRadius: 99,
                background: i === idx ? '#6366F1' : '#353542',
                border: 'none', cursor: 'pointer',
                transition: 'all 200ms',
                padding: 0,
              }} />
          ))}
        </div>

        {/* Hint */}
        <div style={{
          position: 'absolute', bottom: 18, right: 18,
          display: 'flex', gap: 6, alignItems: 'center',
          padding: '6px 10px',
          background: 'rgba(15,15,19,0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid #2A2A35',
          borderRadius: 99,
          fontSize: 11, color: '#9090A8',
        }}>
          <span className="kbd">←</span>
          <span className="kbd">→</span>
          navegar
          <span style={{ width: 1, height: 12, background: '#2A2A35', margin: '0 4px' }} />
          <span className="kbd">G</span> grade
        </div>
      </div>

      {/* Thumbs grid overlay */}
      {showThumbs && (
        <div onClick={() => setShowThumbs(false)} style={{
          position: 'fixed', inset: 0,
          background: 'rgba(7,7,10,0.92)',
          backdropFilter: 'blur(16px)',
          zIndex: 100,
          padding: '80px 60px 60px',
          overflow: 'auto',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Todas as telas</h2>
              <span style={{ fontSize: 12, color: '#5A5A72' }}>Esc ou clique fora para fechar</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {screens.map((s, i) => {
                const ThumbScreen = s.component;
                const thumbScale = 280 / s.w;
                return (
                  <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); setShowThumbs(false); }}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      textAlign: 'left', padding: 0,
                    }}>
                    <div style={{
                      position: 'relative',
                      width: '100%', aspectRatio: `${s.w} / ${s.h}`,
                      background: '#0F0F13',
                      borderRadius: 10,
                      border: i === idx ? '2px solid #6366F1' : '1px solid #2A2A35',
                      overflow: 'hidden',
                      marginBottom: 10,
                      boxShadow: i === idx ? '0 8px 24px rgba(99,102,241,0.3)' : '0 4px 16px rgba(0,0,0,0.4)',
                    }}>
                      <div style={{
                        width: s.w, height: s.h,
                        transform: `scale(${thumbScale})`,
                        transformOrigin: 'top left',
                        pointerEvents: 'none',
                      }}>
                        <ThumbScreen />
                      </div>
                      <div style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, fontFamily: 'JetBrains Mono', padding: '3px 7px', borderRadius: 4, background: 'rgba(0,0,0,0.6)', color: '#F0F0F5', fontWeight: 600 }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: '#9090A8' }}>{s.subtitle}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function navBtnStyle(active) {
  return {
    width: 36, height: 36,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
    border: '1px solid ' + (active ? 'rgba(99,102,241,0.4)' : '#2A2A35'),
    borderRadius: 8,
    color: active ? '#A5A8FA' : '#9090A8',
    cursor: 'pointer',
    transition: 'all 120ms',
  };
}

window.PlayerShell = PlayerShell;
