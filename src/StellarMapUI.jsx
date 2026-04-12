// ─── StellarMapUI.jsx ─────────────────────────────────────────────────────────
// Componentes de UI reutilizáveis do Stellar Map
// Importe e use esses componentes dentro do StellarMap principal.
// ──────────────────────────────────────────────────────────────────────────────

// Idiomas suportados
export const LANGS = ["PT-BR", "ENG", "CN", "JP", "TL", "ES"];

// ── Toggle (chave liga/desliga) ──────────────────────────────────────────────
export const Toggle = ({ val, onChange }) => (
  <label className="tgl">
    <input type="checkbox" checked={val} onChange={e => onChange(e.target.checked)} />
    <span className="tslider" />
  </label>
);

// ── Controle numérico com botões + / − ──────────────────────────────────────
export const NumInput = ({ val, onChange, min = 0, step = 1 }) => (
  <div className="numctrl">
    <button
      className="nmbtn"
      style={{ borderRadius: '2px 0 0 2px' }}
      onClick={() => onChange(Math.max(min, val - step))}
    >
      −
    </button>
    <input
      type="number"
      value={val}
      min={min}
      onChange={e => onChange(Math.max(min, Number(e.target.value)))}
    />
    <button
      className="nmbtn"
      style={{ borderRadius: '0 2px 2px 0' }}
      onClick={() => onChange(val + step)}
    >
      +
    </button>
  </div>
);

// ── Campo com label ──────────────────────────────────────────────────────────
export const Field = ({ label, children }) => (
  <div className="field">
    <label>{label}</label>
    {children}
  </div>
);

// ── Linha com toggle + label + sublabel opcional ─────────────────────────────
export const ToggleRow = ({ label, sub, val, onChange, extra }) => (
  <div className="toggle-row">
    <div>
      <div className="tlabel">{label}</div>
      {sub && <div className="tsub">{sub}</div>}
    </div>
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      {extra}
      <Toggle val={val} onChange={onChange} />
    </div>
  </div>
);

// ── Card genérico com cabeçalho ──────────────────────────────────────────────
export const Card = ({ icon, title, badge, children, className = '' }) => (
  <div className={`card ${className}`}>
    <div className="card-hd">
      <span className="card-ico">{icon}</span>
      <span className="card-ttl">{title}</span>
      {badge && <span className="card-badge">{badge}</span>}
    </div>
    {children}
  </div>
);

// ── Caixa de informação (infobox azul) ───────────────────────────────────────
export const InfoBox = ({ children }) => (
  <div className="infobox">{children}</div>
);

// ── Separador de seção ───────────────────────────────────────────────────────
export const SectionLabel = ({ children }) => (
  <div className="sec-label">{children}</div>
);

// ── Fundo estrelado (fixo, decorativo) ──────────────────────────────────────
export const StarBackground = () => (
  <>
    <div className="starfield" />
    <div className="nebula" />
  </>
);

// ── Barra de idiomas ─────────────────────────────────────────────────────────
export const LangBar = ({ lang, setLang }) => (
  <div className="lang-bar">
    {LANGS.map(l => (
      <button
        key={l}
        className={`lbtn ${lang === l ? 'active' : ''}`}
        onClick={() => setLang(l)}
      >
        {l}
      </button>
    ))}
  </div>
);

// ── Botão de ajuda — recebe `t` para traduzir o label ────────────────────────
// Uso: <HelpButton t={t} onClick={...} />
// A chave usada é "help_btn" — adicione nas translations se quiser customizar.
// Fallback: "❓ Ajuda" (PT-BR)
export const HelpButton = ({ onClick, t }) => (
  <div className="help-btn">
    <button className="lbtn cy" onClick={onClick}>
      {t ? t("help_btn") : "❓ Ajuda"}
    </button>
  </div>
);

// ── Logo / Cabeçalho da Home — recebe `t` para traduzir subtítulo ────────────
// Uso: <StellarLogo t={t} />
// Chaves usadas: "logo_sub"
// Fallback: textos PT-BR originais
export const StellarLogo = ({ t }) => (
  <div style={{ textAlign: 'center', marginBottom: 52 }}>
    <div className="logo-gem"></div>
    <img className = "logo-title" src={require("./imgs/logo.webp")} alt="stellar_map_logo" style={{ filter: "drop-shadow(0 0 4px rgba(124, 148, 255, 0.7))" }} />
    <div className="logo-sub">
      {t ? t("logo_sub") : "Calculadora de Jades · Honkai: Star Rail"}
    </div>
    <div className="divider" />
  </div>
);

// ── Barra de divisão dourada ─────────────────────────────────────────────────
export const Divider = () => <div className="divider" />;