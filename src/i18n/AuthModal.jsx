// ─── AuthModal.jsx ────────────────────────────────────────────────────────────
// Modal de Login / Cadastro do Stellar Map
// Uso: <AuthModal t={t} onClose={fn} onSuccess={fn} supabase={supabase} />
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

export const AuthModal = ({ t, onClose, onSuccess, supabase }) => {
  const [tab, setTab]           = useState("login");       // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // Pré-preenche usuário salvo (remember me)
  useEffect(() => {
    const saved = localStorage.getItem("stellar_remembered_user");
    if (saved) { setUsername(saved); setRemember(true); }
  }, []);

  // Reseta erro ao trocar de aba
  const switchTab = (t) => { setTab(t); setError(""); setPassword(""); setShowPwd(false); };

  // ── Validações compartilhadas ──
  const validateUsername = (u) => {
    if (u.length < 8)  return t("username_too_short") || "Usuário precisa ter ao menos 8 caracteres.";
    if (u.length > 20) return t("username_too_long")  || "Usuário pode ter no máximo 20 caracteres.";
    return null;
  };

  const validatePassword = (p) => {
    if (p.length < 8 || p.length > 16) return t("password_length_error");
    return null;
  };

  // ── Login ──
  const handleLogin = async () => {
    setError("");
    const u = username.toLowerCase().trim();
    const uErr = validateUsername(u);
    if (uErr) { setError(uErr); return; }
    const pErr = validatePassword(password);
    if (pErr) { setError(pErr); return; }

    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: `${u}@stellarmap.app`,
      password,
    });
    setLoading(false);

    if (err) { setError(t("login_error")); return; }

    if (remember) localStorage.setItem("stellar_remembered_user", u);
    else          localStorage.removeItem("stellar_remembered_user");

    onSuccess(t("login_success"), "success");
    onClose();
  };

  // ── Cadastro ──
  const handleRegister = async () => {
    setError("");
    const u = username.toLowerCase().trim();
    const uErr = validateUsername(u);
    if (uErr) { setError(uErr); return; }
    const pErr = validatePassword(password);
    if (pErr) { setError(pErr); return; }

    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email: `${u}@stellarmap.app`,
      password,
      options: { data: { display_name: u } },
    });
    setLoading(false);

    if (err) { setError(err.message); return; }

    // Auto-login após cadastro
    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email: `${u}@stellarmap.app`,
      password,
    });

    if (loginErr) { setError(t("login_error")); return; }

    onSuccess(t("register_success"), "success");
    onClose();
  };

  const handleOverlay = (e) => { if (e.target === e.currentTarget) onClose(); };
  const handleKey     = (e) => {
    if (e.key === "Enter") tab === "login" ? handleLogin() : handleRegister();
  };

  return (
    <div className="help-overlay" onClick={handleOverlay}>
      <div className="help-modal auth-modal" role="dialog" aria-modal="true">

        {/* ── Cabeçalho ── */}
        <div className="help-modal-header">
          <span className="help-modal-title"> 🔐 {t("login_register")}</span>
          <button className="help-modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        {/* ── Tabs ── */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => switchTab("login")}
          >
            {t("login_btn")}
          </button>
          <button
            className={`auth-tab ${tab === "register" ? "active" : ""}`}
            onClick={() => switchTab("register")}
          >
            {t("register_btn")}
          </button>
        </div>

        {/* ── Corpo ── */}
        <div className="auth-body" onKeyDown={handleKey}>

          {/* Campo: Usuário */}
          <div className="auth-field">
            <label className="auth-label">{t("username")}</label>
            <input
              className="finput"
              type="text"
              autoComplete="username"
              value={username}
              maxLength={20}
              onChange={e => { setUsername(e.target.value); setError(""); }}
              placeholder={tab === "login" ? (t("username_ph_login") || "seu usuário") : (t("username_ph_register") || "8–20 caracteres")}
            />
            {/* Contador de caracteres ao cadastrar */}
            {tab === "register" && (
              <div className="auth-hint" style={{ color: username.length < 8 || username.length > 20 ? "var(--red)" : "var(--muted)" }}>
                {username.length}/20 {username.length < 8 ? `· mín. 8` : ""}
              </div>
            )}
          </div>

          {/* Campo: Senha */}
          <div className="auth-field">
            <label className="auth-label">{t("password")}</label>
            <div className="auth-pwd-wrap">
              <input
                className="finput"
                type={showPwd ? "text" : "password"}
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                value={password}
                maxLength={16}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder={(t("password_ph"))}
              />
              <button
                className="auth-eye"
                type="button"
                onClick={() => setShowPwd(v => !v)}
                aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                tabIndex={-1}
              >
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>
            {tab === "register" && (
            <div className="auth-hint" style={{ color: password.length < 8 || password.length > 16 ? "var(--red)" : "var(--muted)" }}>
                {password.length}/16 {password.length < 8 ? `· mín. 8` : ""}
              </div>
            )}
          </div>
            
          {/* Lembrar de mim — só no login */}
          {tab === "login" && (
            <label className="auth-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
              <span>{t("remember_me") || "Lembrar de mim"}</span>
            </label>
          )}

          {/* Erro */}
          {error && <div className="auth-error">{error}</div>}

          {/* Botão de ação */}
          <button
            className={`sbtn ${tab === "login" ? "cy" : "gold"} auth-submit`}
            onClick={tab === "login" ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading
              ? (t("loading") || "...")
              : tab === "login"
                ? t("login_btn")
                : t("register_btn")}
          </button>

        </div>
      </div>
    </div>
  );
};

export default AuthModal;
