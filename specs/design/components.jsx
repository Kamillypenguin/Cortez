// Components.jsx — Shared UI primitives for Cortex prototype
const { useState, useEffect, useRef } = React;

// ===== Icon (Tabler webfont) =====
function Icon({ name, size, className = '', style = {} }) {
  const sz = size ? { fontSize: size } : {};
  return <i className={`ti ti-${name} ${className}`} style={{ ...sz, ...style }} />;
}

// ===== Sparkle (custom SVG, gradient) =====
function Sparkle({ size = 16, className = '', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style} fill="none">
      <defs>
        <linearGradient id={`spk-${size}`} x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <path d="M12 3 L13.8 9.5 L20 12 L13.8 14.5 L12 21 L10.2 14.5 L4 12 L10.2 9.5 Z"
        fill={`url(#spk-${size})`} />
      <path d="M19 4 L19.6 6.1 L21.5 7 L19.6 7.9 L19 10 L18.4 7.9 L16.5 7 L18.4 6.1 Z"
        fill={`url(#spk-${size})`} opacity="0.7" />
    </svg>
  );
}

// ===== Avatar =====
function Avatar({ name = 'Mariana Reis', size = 32, color = '#6366F1' }) {
  const initials = name.split(' ').map(s => s[0]).slice(0, 2).join('');
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}, ${color}CC)`,
      color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 600,
      fontSize: size * 0.42,
      flexShrink: 0,
    }}>{initials}</div>
  );
}

// ===== Logo =====
function Logo({ size = 28, withText = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="32" y2="32">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#logo-g)" />
        <path d="M10 16 L14 20 L22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="22" cy="10" r="2" fill="white" />
      </svg>
      {withText && <span style={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: size * 0.62 }}>Cortex</span>}
    </div>
  );
}

// ===== Badge =====
function Badge({ tone = 'neutral', children, icon }) {
  return (
    <span className={`badge badge-${tone}`}>
      {icon && <Icon name={icon} size={11} />}
      {children}
    </span>
  );
}

// ===== Status dot =====
function StatusDot({ status = 'ok' }) {
  const cls = { ok: 'dot-ok', warn: 'dot-warn', bad: 'dot-bad', paused: 'dot-paused' }[status] || 'dot-paused';
  return <span className={`dot ${cls}`} />;
}

// ===== Sidebar nav (web) =====
function NavItem({ icon, label, active, badge, onClick, color }) {
  return (
    <button onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%',
        background: active ? 'var(--c-primary-soft)' : 'transparent',
        color: active ? 'var(--tx-1)' : 'var(--tx-2)',
        border: 'none',
        padding: '8px 10px',
        borderRadius: 'var(--r-md)',
        cursor: 'pointer',
        font: '500 13px/1 Inter, sans-serif',
        textAlign: 'left',
        transition: 'all 120ms ease-out',
        position: 'relative',
      }}
      onMouseOver={e => { if (!active) e.currentTarget.style.background = 'var(--bg-card)'; }}
      onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {active && <span style={{ position: 'absolute', left: -10, top: '50%', transform: 'translateY(-50%)', width: 3, height: 16, background: color || 'var(--c-primary)', borderRadius: 2 }} />}
      <Icon name={icon} size={18} style={{ color: active ? (color || 'var(--c-primary)') : 'currentColor' }} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: 'var(--c-primary)', color: 'white', fontWeight: 600 }}>{badge}</span>}
    </button>
  );
}

// ===== Check circle =====
function CheckCircle({ checked, onChange, color = 'var(--c-success)' }) {
  return (
    <button className={`check-circle ${checked ? 'checked' : ''}`}
      onClick={() => onChange(!checked)}
      style={checked ? { background: color, borderColor: color } : {}}>
      {checked && <Icon name="check" size={12} />}
    </button>
  );
}

// ===== Profile colors =====
const PROFILE_COLORS = {
  estudante: '#6366F1',
  professor: '#10B981',
  profissional: '#F59E0B',
  corporativo: '#3B82F6',
};
const PROFILE_LABEL = {
  estudante: 'Estudante',
  professor: 'Professor',
  profissional: 'Profissional',
  corporativo: 'Coordenador',
};

Object.assign(window, {
  Icon, Sparkle, Avatar, Logo, Badge, StatusDot,
  NavItem, CheckCircle,
  PROFILE_COLORS, PROFILE_LABEL,
});
