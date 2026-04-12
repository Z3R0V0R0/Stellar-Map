// ─── StellarMap.jsx ───────────────────────────────────────────────────────────
// Componente principal da aplicação Stellar Map
// Honkai: Star Rail — Pull Tracker
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect, useRef, } from "react";
import { HelpModal } from '../i18n/HelpModal.jsx';
import '../i18n/HelpModal.css';
import { AuthModal } from '../i18n/AuthModal.jsx';
import '../i18n/AuthModal.css';

// Estilos
import "../StellarMap.css";
import { supabase } from "../lib/supabase.js";
import { saveMap } from "../services/maps.js";

// i18n
import { useT } from "../i18n/useT";

// Lógica de cálculo
import {
  PULL_COST,
  calcEndgameCycles,
  calcEndgameCyclesFromDates,
  calcWeeks,
  calcMondaysInRange,
  calcDaysBetween,
  calcTotalJades,
  jadesToPulls,
  calcGoalProgress,
  subtotalExpress,
  subtotalEndgamesStars,
  todayStr,
  addDays,
} from "../logic/calculations";

// Componentes de UI
import {
  NumInput,
  Field,
  ToggleRow,
  InfoBox,
  SectionLabel,
  StarBackground,
  HelpButton,
  StellarLogo,
} from "../StellarMapUI";

// ──────────────────────────────────────────────────────────────────────────────

export default function StellarMap() {
  // ── Tela atual ──
  const [screen, setScreen] = useState("home");
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState(() => localStorage.getItem("stellar_lang") || "Português");

  // ── Hook de tradução ──
  const t = useT(lang);

  // ── Sleep ──
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // ── Toast ──
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (msg, type = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
    setTimeout(() => {
      setToast({ msg, type, key: Date.now() });
      toastTimer.current = setTimeout(() => setToast(null), 3000);
    }, 20);
  };

  // ── Modais ──
  const [helpOpen, setHelpOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  const showConfirm = (message, onConfirm) => {
    setConfirmModal({ message, onConfirm });
  };

  const ConfirmModal = () => {
    if (!confirmModal) return null;
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(4, 6, 20, 0.82)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          background: "rgba(10, 17, 48, 0.98)",
          border: "1px solid rgba(248,113,113,0.35)",
          borderTop: "2px solid var(--red)",
          padding: "28px 32px",
          maxWidth: 380, width: "90%",
          boxShadow: "0 0 40px rgba(248,113,113,0.12)",
        }}>
          <div style={{
            fontFamily: "'Orbitron', sans-serif", fontSize: 12,
            color: "var(--red)", letterSpacing: 3, textTransform: "uppercase",
            marginBottom: 14,
          }}>{t("confirm_action")}</div>
          <div style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.6, marginBottom: 24 }}>
            {confirmModal.message}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="sbtn ghost" onClick={() => setConfirmModal(null)}>{t("cancel")}</button>
            <button className="sbtn re" onClick={() => {
              confirmModal.onConfirm();
              setConfirmModal(null);
            }}>{t("delete")}</button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) fetchMaps();
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchMaps();
    });
    return () => listener.subscription.unsubscribe();
  });

  // ── Mapas ──
  const [maps, setMaps] = useState([]);
  const [displayMaps, setDisplayMaps] = useState([]);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const fetchMaps = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("maps").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (error) console.error(error);
    else {
      setMaps(data);
      setDisplayMaps([]);
    }
  };

  const [currentMapId, setCurrentMapId] = useState(null);

  // ── Deadline helpers ──
  const calcDaysUntil = (dateStr) => {
    if (!dateStr) return null;
    const target = new Date(dateStr + "T00:00:00");
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  };

  const deadlineColor = (days) => {
    if (days === null) return "var(--muted)";
    if (days <= 1) return "var(--red)";
    if (days <= 7) return "var(--gold)";
    if (days <= 13) return "#FFA94D";
    return "var(--green)";
  };

  const deadlineLabel = (days) => {
    if (days === null) return null;
    if (days <= 0) return t("deadline_expired");
    if (days === 1) return t("deadline_last_day");
    return t("deadline_days", { n: days });
  };

  const handleSaveMap = async () => {
    if (!user) { setAuthOpen(true); return; }
    const payload = {
      versionDays, startDate, endDate, useCalendar,
      dailyJades, expressPass, expressQty,
      manualFragments, convertFragments,
      battlePass, bpMedal,
      mocStars, pfStars, apocStars,
      du, customEvents,
      anniversary, anniversaryJades,
      extraJades, trialCount, monthlyResets,
      bonusPulls, newCycleJades, levelUpJades,
      initialJades, initialPasses, goalPulls,
      goalDeadline,
    };
    if (currentMapId) {
      await supabase.from("maps").update({ name: mapName, data: payload }).eq("id", currentMapId);
    } else {
      const finalName = generateUniqueName(mapName, maps);
      await saveMap(payload, finalName);
    }
    await fetchMaps();
    showToast(t("map_saved"), "success");
  };

  const generateUniqueName = (name, maps) => {
    const names = maps.map(m => m.name);
    if (!names.includes(name)) return name;
    let i = 1;
    let newName = `${name} (${i})`;
    while (names.includes(newName)) { i++; newName = `${name} (${i})`; }
    return newName;
  };

  const resetMapState = () => {
    setCurrentMapId(null);
    setMapName("Minha Jornada Estelar");
    setVersionDays(42);
    setUseCalendar(false);
    setStartDate(todayStr());
    setEndDate(addDays(todayStr(), 42));
    setDailyJades(60);
    setExpressPass(false); setExpressQty(1);
    setManualFragments(0); setConvertFragments(0);
    setBattlePass(false); setBpMedal(false);
    setMocStars(0); setPfStars(0); setApocStars(0);
    setDu(false); setCustomEvents([]);
    setAnniversary(false); setAnniversaryJades(800);
    setExtraJades(0); setTrialCount(0); setMonthlyResets(0);
    setBonusPulls(0); setNewCycleJades(0); setLevelUpJades(0);
    setInitialJades(0); setInitialPasses(0);
    setGoalPulls(0);
    setGoalDeadline("");
  };

  // ── Carrega mapa com toast ──
  const loadMap = (map) => {
    const d = map.data;
    setCurrentMapId(map.id);
    const safe = (v, def = 0) => Number(v ?? def);
    setMapName(map.name);
    setVersionDays(safe(d.versionDays, 42));
    setUseCalendar(!!d.useCalendar);
    setStartDate(d.startDate || todayStr());
    setEndDate(d.endDate || addDays(todayStr(), safe(d.versionDays, 42)));
    setDailyJades(safe(d.dailyJades, 60));
    setExpressPass(!!d.expressPass); setExpressQty(safe(d.expressQty, 1));
    setManualFragments(safe(d.manualFragments)); setConvertFragments(safe(d.convertFragments));
    setBattlePass(!!d.battlePass); setBpMedal(!!d.bpMedal);
    setMocStars(safe(d.mocStars)); setPfStars(safe(d.pfStars)); setApocStars(safe(d.apocStars));
    setDu(!!d.du); setCustomEvents(d.customEvents || []);
    setAnniversary(!!d.anniversary); setAnniversaryJades(safe(d.anniversaryJades, 800));
    setExtraJades(safe(d.extraJades)); setTrialCount(safe(d.trialCount)); setMonthlyResets(safe(d.monthlyResets));
    setBonusPulls(safe(d.bonusPulls)); setNewCycleJades(safe(d.newCycleJades)); setLevelUpJades(safe(d.levelUpJades));
    setInitialJades(safe(d.initialJades)); setInitialPasses(safe(d.initialPasses));
    setGoalPulls(safe(d.goalPulls));
    setGoalDeadline(d.goalDeadline || "");
    showToast(t("map_loaded"), "success");
    setScreen("dash");
  };

  const renameMap = async (map) => {
    let newName = prompt("Novo nome:", map.name);
    if (!newName) return;
    newName = generateUniqueName(newName, maps);
    await supabase.from("maps").update({ name: newName }).eq("id", map.id);
    fetchMaps();
  };

  const exportMap = (map) => {
    const blob = new Blob([JSON.stringify(map.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${map.name}.json`; a.click();
  };

  // ── Delete com modal customizado ──
  const deleteMap = (id, name) => {
    showConfirm(
      t("confirm_delete", { name }),
      async () => {
        await supabase.from("maps").delete().eq("id", id);
        fetchMaps();
        showToast(t("map_deleted"), "warning");
      }
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    showToast(t("logout_success"), "info");
  };

  // ── Configuração do mapa ──
  const [mapName, setMapName] = useState("Minha Jornada Estelar");
  const [versionDays, setVersionDays] = useState(42);
  const [dailyJades, setDailyJades] = useState(60);

  // ── 📅 Calendário ──
  const [useCalendar, setUseCalendar] = useState(false);
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(addDays(todayStr(), 42));

  const handleToggleCalendar = (val) => {
    setUseCalendar(val);
    if (val) {
      setEndDate(addDays(startDate, versionDays));
    } else {
      const diff = calcDaysBetween(startDate, endDate);
      if (diff > 0) setVersionDays(diff);
    }
  };

  const handleStartDateChange = (val) => {
    setStartDate(val);
    setEndDate(addDays(val, versionDays));
  };

  const handleEndDateChange = (val) => {
    setEndDate(val);
    const diff = calcDaysBetween(startDate, val);
    if (diff > 0) setVersionDays(diff);
  };

  const handleVersionDaysChange = (val) => {
    setVersionDays(val);
    if (useCalendar) setEndDate(addDays(startDate, val));
  };

  const activeDays = useCalendar ? calcDaysBetween(startDate, endDate) : versionDays;
  const activeWeeks = useCalendar ? calcMondaysInRange(startDate, endDate) : calcWeeks(versionDays);
  const activeEndgameCycles = useCalendar
    ? calcEndgameCyclesFromDates(startDate, endDate)
    : calcEndgameCycles(versionDays);

  const calendarInfo = useMemo(() => {
    if (!useCalendar) return null;
    const days = calcDaysBetween(startDate, endDate);
    const mondays = calcMondaysInRange(startDate, endDate);
    const cycles = calcEndgameCyclesFromDates(startDate, endDate);
    const fmt = (d) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR", {
      weekday: "long", day: "2-digit", month: "2-digit"
    });
    return { days, mondays, cycles, startDay: fmt(startDate), endDay: fmt(endDate) };
  }, [useCalendar, startDate, endDate]);

  // ── Passes & Fragmentos ──
  const [expressPass, setExpressPass] = useState(false);
  const [expressQty, setExpressQty] = useState(1);
  const [manualFragments, setManualFragments] = useState(0);
  const [convertFragments, setConvertFragments] = useState(0);
  const [battlePass, setBattlePass] = useState(false);
  const [bpMedal, setBpMedal] = useState(false);

  // ── Dados Iniciais ──
  const [initialJades, setInitialJades] = useState(0);
  const [initialPasses, setInitialPasses] = useState(0);

  // ── Endgames ──
  const [odyssey, setOdyssey] = useState(false);
  const [mocStars, setMocStars] = useState(0);
  const [pfStars, setPfStars] = useState(0);
  const [apocStars, setApocStars] = useState(0);
  const [du, setDu] = useState(false);

  // ── Eventos customizados ──
  const [customEvents, setCustomEvents] = useState([]);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [newEvName, setNewEvName] = useState("");
  const [newEvJades, setNewEvJades] = useState(500);

  // ── Extras ──
  const [anniversary, setAnniversary] = useState(false);
  const [anniversaryJades, setAnniversaryJades] = useState(800);
  const [bonusPulls, setBonusPulls] = useState(0);
  const [extraJades, setExtraJades] = useState(0);
  const [trialCount, setTrialCount] = useState(0);
  const [monthlyResets, setMonthlyResets] = useState(0);
  const [newCycleJades, setNewCycleJades] = useState(0);
  const [levelUpJades, setLevelUpJades] = useState(0);

  // ── Meta ──
  const [goalPulls, setGoalPulls] = useState(0);
  const [goalDeadline, setGoalDeadline] = useState("");

  // ── Fragmentos derivados ──
  const passFragments = expressPass ? expressQty * 300 : 0;
  const totalFragments = passFragments + manualFragments;
  const safeConvert = Math.min(convertFragments, totalFragments);

  // ── Cálculo total de jades ──
  const totalJades = useMemo(() =>
    calcTotalJades({
      versionDays: activeDays,
      dailyJades,
      expressPass, expressQty,
      odyssey,
      mocStars, pfStars, apocStars,
      battlePass, bpMedal,
      convertFragments: safeConvert,
      initialJades, initialPasses,
      du, customEvents,
      anniversary, anniversaryJades,
      extraJades, trialCount, monthlyResets,
      bonusPulls, newCycleJades, levelUpJades,
      startDate: useCalendar ? startDate : undefined,
      endDate: useCalendar ? endDate : undefined,
    }),
    [
      activeDays, dailyJades, expressPass, expressQty, odyssey,
      mocStars, pfStars, apocStars, battlePass, bpMedal,
      safeConvert, initialJades, initialPasses,
      du, customEvents, anniversary, anniversaryJades,
      extraJades, trialCount, monthlyResets, bonusPulls,
      newCycleJades, levelUpJades, useCalendar, startDate, endDate,
    ]
  );

  const totalPulls = jadesToPulls(totalJades);
  const { hasGoal, goalMet, pullsNeeded, jadesNeeded, progressPct, surplus } =
    calcGoalProgress(totalPulls, goalPulls);

  // ── Handlers de eventos ──
  const addEvent = () => {
    if (!newEvName.trim()) return;
    setCustomEvents(p => [...p, { id: Date.now(), name: newEvName.trim(), jades: newEvJades }]);
    setNewEvName(""); setNewEvJades(500); setShowNewEvent(false);
  };
  const removeEvent = id => setCustomEvents(p => p.filter(e => e.id !== id));
  const goToDash = () => setScreen("dash");

  // ── Barra superior direita ──
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const LANGS = ["Português", "English", "简体中文", "日本語", "ภาษาไทย", "Español"];

  // ── Componentes auxiliares ──
  const Toast = () => toast ? (
    <div key={toast.key} className={`toast ${toast.type}`}>{toast.msg}</div>
  ) : null;

  // ── AuthModal compartilhado (renderizado em todas as telas) ──
  const SharedAuthModal = () => authOpen ? (
    <AuthModal
      t={t}
      supabase={supabase}
      onClose={() => setAuthOpen(false)}
      onSuccess={(msg, type) => showToast(msg, type)}
    />
  ) : null;

  const TopRightBar = () => (
    <div style={{ position: "fixed", top: 12, right: 12, display: "flex", alignItems: "center", gap: 8, zIndex: 100 }}>
      {user ? (
        <>
          <span style={{ fontSize: 12, color: "var(--gold, #f0c346)", fontFamily: "var(--font, monospace)", letterSpacing: 1, whiteSpace: "nowrap" }}>
            {t("logged_as")} {user.user_metadata?.display_name ?? user.email}
          </span>
          <button className="sbtn ghost" style={{ fontSize: 11, padding: "3px 10px" }} onClick={handleLogout}>{t("logout")}</button>
        </>
      ) : (
        <button className="sbtn cy" style={{ fontSize: 11, padding: "3px 10px" }} onClick={() => setAuthOpen(true)}>
          {t("login_register")}
        </button>
      )}
      <div ref={langRef} style={{ position: "relative" }}>
        <button className="sbtn ghost" style={{ fontSize: 16, padding: "3px 8px", lineHeight: 1 }} onClick={() => setLangOpen(o => !o)} title={lang}>🌐</button>
        {langOpen && (
          <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "var(--bg2, #0e1526)", border: "1px solid var(--border, rgba(255,255,255,0.12))", borderRadius: 8, overflow: "hidden", minWidth: 90, boxShadow: "0 8px 24px rgba(0,0,0,0.5)", zIndex: 200 }}>
            {LANGS.map(l => (
              <button key={l} onClick={() => { setLang(l); localStorage.setItem("stellar_lang", l); setLangOpen(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 16px", background: l === lang ? "rgba(240,195,70,0.12)" : "transparent", color: l === lang ? "var(--gold, #f0c346)" : "var(--text, #c8d0e0)", fontFamily: "var(--font, monospace)", fontSize: 12, letterSpacing: 1, border: "none", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => { if (l !== lang) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { if (l !== lang) e.currentTarget.style.background = "transparent"; }}
              >{l}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ────────────────────────────────────────────────── TELA: HOME ──────────────
  if (screen === "home") return (
    <div className="app">
      <StarBackground />
      <TopRightBar />
      <Toast />
      <SharedAuthModal />
      <div className="rel home">
        <HelpButton t={t} onClick={() => setHelpOpen(true)} />
        <StellarLogo t={t} />
        <div className="home-btns">
          <button className="btn-primary" onClick={() => { setCurrentMapId(null); setMapName("Minha Jornada Estelar"); setScreen("create"); }}>
            {t("create_map")}
          </button>
          <button className="btn-secondary" onClick={() => { fetchMaps(); setScreen("maps"); }}>
            {t("load_map")}
          </button>
        </div>
        <div className="version-tag">{t("version_tag")}</div>
        {helpOpen && <HelpModal lang={lang} onClose={() => setHelpOpen(false)} />}
      </div>
    </div>
  );

  // ────────────────────────────────────────────────── TELA: MAPS ──────────────
  if (screen === "maps") {
    const sorted = [...maps].sort((a, b) => {
      const dA = calcDaysUntil(a.data?.goalDeadline);
      const dB = calcDaysUntil(b.data?.goalDeadline);
      const urgA = dA !== null && dA <= 7;
      const urgB = dB !== null && dB <= 7;
      if (urgA && !urgB) return -1;
      if (!urgA && urgB) return 1;
      if (dA !== null && dB !== null) return dA - dB;
      if (dA !== null) return -1;
      if (dB !== null) return 1;
      return 0;
    });

    const list = displayMaps.length === maps.length ? displayMaps : sorted;

    const handleDragStart = (idx) => {
      setDragIdx(idx);
      if (displayMaps.length !== maps.length) setDisplayMaps(sorted);
    };
    const handleDragOver = (e, idx) => { e.preventDefault(); setDragOverIdx(idx); };
    const handleDrop = (idx) => {
      if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOverIdx(null); return; }
      const next = [...list];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(idx, 0, moved);
      setDisplayMaps(next);
      setDragIdx(null); setDragOverIdx(null);
    };

    return (
      <div className="app">
        <StarBackground />
        <TopRightBar />
        <Toast />
        <ConfirmModal />
        <SharedAuthModal />
        <div className="rel create-wrap">
          <div className="create-box">
            <div className="create-title">{t("my_maps")}</div>

            {list.length === 0 && (
              <div style={{ color: "var(--muted)" }}>{t("no_maps")}</div>
            )}

            {list.map((map, idx) => {
              const days = calcDaysUntil(map.data?.goalDeadline);
              const color = deadlineColor(days);
              const label = deadlineLabel(days);
              const urgent = days !== null && days <= 7;
              const isDragging = dragIdx === idx;
              const isOver = dragOverIdx === idx;

              return (
                <div
                  key={map.id}
                  className={`map-item${isDragging ? " dragging" : ""}${isOver ? " drag-over" : ""}`}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx)}
                  onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                >
                  <div className="map-item-top">
                    <span style={{ color: "var(--muted)", fontSize: 16, userSelect: "none", cursor: "grab" }}>⠿</span>
                    <span className="map-item-name">{map.name}</span>
                    {urgent && <span className="red-dot" title="Prazo urgente!" />}
                  </div>

                  {label && (
                    <div className="deadline-badge" style={{ color }}>
                      {label}
                    </div>
                  )}

                  <div className="map-item-btns">
                    <button className="sbtn cy" onClick={() => loadMap(map)}>{t("load_btn")}</button>
                    <button className="sbtn ghost" onClick={() => renameMap(map)}>{t("rename_btn")}</button>
                    <button className="sbtn" onClick={() => exportMap(map)}>{t("export_btn")}</button>
                    <button className="sbtn re" onClick={() => deleteMap(map.id, map.name)}>{t("delete_btn")}</button>
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: 16 }}>
              <button className="sbtn ghost" onClick={() => setScreen("home")}>{t("back")}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────── TELA: CREATE ─────────────
  if (screen === "create") return (
    <div className="app">
      <StarBackground />
      <TopRightBar />
      <Toast />
      <SharedAuthModal />
      <div className="rel create-wrap">
        <div className="create-box">
          <div className="create-title">{t("new_map_title")}</div>

          <Field label={t("map_name")}>
            <input className="finput" type="text" value={mapName}
              placeholder={t("map_name_placeholder")}
              onChange={e => setMapName(e.target.value)}
            />
          </Field>

          <SectionLabel>{t("version_config")}</SectionLabel>

          <ToggleRow
            label={t("use_calendar")}
            sub={t("use_calendar_sub")}
            val={useCalendar}
            onChange={handleToggleCalendar}
          />
          <div style={{ marginTop: 20 }} />
          {useCalendar ? (
            <>
              <div style={{ marginTop: 20 }} />
              <Field label={t("version_start")}>
                <input className="finput" type="date" value={startDate}
                  onChange={e => handleStartDateChange(e.target.value)} />
              </Field>
              <Field label={t("version_end")}>
                <input className="finput" type="date" value={endDate} min={startDate}
                  onChange={e => handleEndDateChange(e.target.value)} />
              </Field>
              {calendarInfo && calendarInfo.days > 0 && (
                <InfoBox>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div><span className="mu">{t("calendar_start_label")} </span><span className="cy">{calendarInfo.startDay}</span></div>
                    <div><span className="mu">{t("calendar_end_label")} </span><span className="cy">{calendarInfo.endDay}</span></div>
                    <div style={{ marginTop: 8, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 8, display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span><span className="mu">{t("calendar_days")} </span><span className="gold">{calendarInfo.days}</span></span>
                      <span><span className="mu">{t("calendar_du_cycles")} </span><span className="cy">{calendarInfo.mondays}×</span></span>
                      <span><span className="mu">{t("calendar_eg_cycles")} </span><span className="cy">{calendarInfo.cycles}×</span></span>
                    </div>
                  </div>
                </InfoBox>
              )}
            </>
          ) : (
            <Field label={t("version_duration")}>
              <NumInput val={versionDays} onChange={handleVersionDaysChange} min={1} step={1} />
            </Field>
          )}

          <div style={{ marginTop: 20 }} />
          <Field label={t("daily_jades")}>
            <NumInput val={dailyJades} onChange={setDailyJades} min={0} step={5} />
          </Field>

          <Field label={t("current_jades")}>
            <div className="input-icon-wrap">
              <img src={require("../imgs/jade.webp")} alt="jade" />
              <input className="finput with-icon" type="text" inputMode="numeric" value={initialJades}
                placeholder={t("current_jades_ph")}
                onChange={(e) => { const n = e.target.value.replace(/\D/g, ""); setInitialJades(Number(n || 0)); }}
              />
            </div>
          </Field>

          <Field label={t("current_passes")}>
            <div className="input-icon-wrap">
              <img src={require("../imgs/gtik.webp")} alt="ticket" />
              <input className="finput with-icon" type="text" inputMode="numeric" value={initialPasses}
                placeholder={t("current_passes_ph")}
                onChange={(e) => { const n = e.target.value.replace(/\D/g, ""); setInitialPasses(Number(n || 0)); }}
              />
            </div>
            <InfoBox>
              <span className="cy">{initialPasses} </span>
              <span className="mu">{t("passes_equiv", { n: initialPasses, jades: (initialPasses * PULL_COST).toLocaleString() })}</span>
            </InfoBox>
          </Field>

          <InfoBox>
            <span className="mu">{t("initial_info")}</span>
          </InfoBox>

          <SectionLabel>{t("express_section")}</SectionLabel>
          <ToggleRow label={t("express_question")} sub={t("express_sub")} val={expressPass} onChange={setExpressPass} />
          {expressPass && (
            <div style={{ marginTop: 12 }}>
              <Field label={t("express_qty")}>
                <NumInput val={expressQty} onChange={setExpressQty} min={1} step={1} />
              </Field>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <button className="sbtn ghost" onClick={() => { resetMapState(); setScreen("home"); }}>{t("back")}</button>
            <button className="sbtn gold" style={{ flex: 1 }} onClick={goToDash}>{t("create_btn")}</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ────────────────────────────────────────────────── PAINEL DE ESTRELAS ──────────
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  const StarController = ({ label, value, setValue, max }) => {
    const add = (n) => setValue(v => clamp(v + n, 0, max));
    const sub = (n) => setValue(v => clamp(v - n, 0, max));
    const isMax = value >= max;
    const isMin = value <= 0;
    return (
      <Field label={t("star_label", { label, max })}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>✦ {value} / {max}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button disabled={isMin} onClick={() => sub(3)} className="sbtn ghost">-3</button>
            <button disabled={isMin} onClick={() => sub(1)} className="sbtn ghost">-1</button>
            <button disabled={isMax} onClick={() => add(1)} className="sbtn cy">+1</button>
            <button disabled={isMax} onClick={() => add(3)} className="sbtn cy">+3</button>
            <button disabled={isMax} onClick={() => setValue(max)} className="sbtn gold">{t("star_complete")}</button>
          </div>
        </div>
      </Field>
    );
  };

  // ────────────────────────────────────────────────── TELA: DASHBOARD ──────────
  return (
    <div className="app">
      <StarBackground />
      <TopRightBar />
      <Toast />
      <SharedAuthModal />
      <div className="rel dash">

        {/* Barra superior */}
        <div className="topbar">
          <div className="topbar-left">
            <button className="lbtn" onClick={() => { resetMapState(); setScreen("home"); }}>{t("back")}</button>
            <div className="map-title">{mapName || "Minha Jornada Estelar"}</div>
          </div>
          <div className="top-stats">
            <div className="stat-chip">
              <span className="slabel">{t("stat_total_jades")}</span>
              <span className="sval">
                {totalJades.toLocaleString()}
                <img src={require("../imgs/jade.webp")} alt="jades" style={{ width: 30, marginLeft: 8, verticalAlign: "middle", filter: "drop-shadow(0 0 4px rgba(124, 246, 255, 0.7))" }} />
              </span>
            </div>
            <div className="sdiv" />
            <div className="stat-chip">
              <span className="slabel">{t("stat_total_passes")}</span>
              <span className="sval">
                {totalPulls.toLocaleString()}
                <img src={require("../imgs/gtik.webp")} alt="ticket" style={{ width: 30, marginLeft: 8, verticalAlign: "middle", filter: "drop-shadow(0 0 4px rgba(240,195,70,0.7))" }} />
              </span>
            </div>
            <div className="sdiv" />
            <div className="stat-chip">
              <span className="slabel">{t("stat_fragments")}</span>
              <span className="sval">
                {(totalFragments - safeConvert).toLocaleString()}
                <img src={require("../imgs/fragment.webp")} alt="fragmentos" style={{ width: 28, marginLeft: 6, verticalAlign: "middle", filter: "drop-shadow(0 0 6px rgba(120,200,255,0.7))" }} />
              </span>
            </div>
            {hasGoal && (
              <>
                <div className="sdiv" />
                <div className="stat-chip">
                  <span className="slabel">{goalMet ? t("stat_surplus") : t("stat_missing")}</span>
                  <span className={`sval ${goalMet ? "gr" : "re"}`}>
                    {goalMet ? `+${surplus}` : t("stat_pulls_missing", { n: pullsNeeded })}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Grid de cards */}
        <div className="grid">

          {/* Card: Passes & Fragmentos */}
          <div className="card">
            <div className="card-hd">
              <img src={require("../imgs/nmh.webp")} alt="passes" style={{ width: 35, marginLeft: 0, marginRight: 5, verticalAlign: "middle", filter: "drop-shadow(0 0 6px rgba(120,200,255,0.7))" }} />
              <span className="card-ttl">{t("card_passes_title")}</span>
            </div>

            <SectionLabel>{t("express_section")}</SectionLabel>
            <ToggleRow label={t("activate_pass")} img="../imgs/supplymail.webp" sub={t("express_sub_card")} val={expressPass} onChange={setExpressPass} />
            <Field label={t("express_qty")}>
              <NumInput val={expressQty} onChange={setExpressQty} min={1} step={1} />
            </Field>
            <InfoBox>
              <span className="cy">{expressPass ? subtotalExpress(expressQty).toLocaleString() : 0} jades</span>
            </InfoBox>

            <div style={{ marginTop: 18 }}>
              <SectionLabel>{t("fragment_section")}</SectionLabel>
              <Field label={t("fragment_add")}>
                <NumInput val={manualFragments} onChange={setManualFragments} min={0} step={10} />
              </Field>
              <div style={{ fontSize: 14 }}>
                <img src={require("../imgs/fragment.webp")} alt="fragmentos" style={{ width: 25, marginRight: 5, verticalAlign: "middle", filter: "drop-shadow(0 0 6px rgba(120,200,255,0.7))" }} />
                {t("fragment_total")} {totalFragments}
                {passFragments > 0 && <span style={{ marginLeft: 6, color: "var(--muted)" }}>({passFragments} {t("fragment_from_pass")})</span>}
              </div>
              <Field label={t("fragment_convert")}>
                <input type="range" min={0} max={totalFragments} value={safeConvert}
                  onChange={(e) => setConvertFragments(Number(e.target.value))}
                  disabled={totalFragments === 0} style={{ width: "100%" }}
                />
              </Field>
              <InfoBox>
                <span className="cy">{t("fragment_converted", { n: safeConvert })}</span>
              </InfoBox>
            </div>

            <div style={{ marginTop: 20 }}>
              <SectionLabel>{t("nameless_section")}</SectionLabel>
              <ToggleRow label={t("battle_pass")} sub={t("battle_pass_sub")} val={battlePass} onChange={setBattlePass} />
              <ToggleRow label={t("bp_medal")} sub={t("bp_medal_sub")} val={bpMedal} onChange={setBpMedal} />
            </div>
          </div>

          {/* Card: Endgames */}
          <div className="card">
            <div className="card-hd">
              <img src={require("../imgs/moc.webp")} alt="eg_sign" style={{ width: 35, marginRight: 5, verticalAlign: "middle", filter: "drop-shadow(0 0 6px rgba(120,200,255,0.7))" }} />
              <span className="card-ttl">{t("card_endgames_title")}</span>
              <span className="card-badge">
                {useCalendar
                  ? t("endgame_cycles_badge", { n: activeEndgameCycles })
                  : t("endgame_cycles_label")}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
              {t("endgame_sub")}
            </p>
            <StarController label={t("moc")} value={mocStars} setValue={setMocStars} max={36} />
            <StarController label={t("pf")} value={pfStars} setValue={setPfStars} max={12} />
            <StarController label={t("apoc")} value={apocStars} setValue={setApocStars} max={12} />
            <InfoBox style={{ marginTop: 12 }}>
              <span className="mu">{t("endgame_total")} </span>
              <span className="cy">{Math.floor(subtotalEndgamesStars({ mocStars, pfStars, apocStars }))} jades</span>
            </InfoBox>
          </div>

          {/* Card: Universo Divergente */}
          <div className="card">
            <div className="card-hd">
              <img src={require("../imgs/du.webp")} alt="du_sign" style={{ width: 35, marginRight: 5, verticalAlign: "middle", filter: "drop-shadow(0 0 6px rgba(120,200,255,0.7))" }} />
              <span className="card-ttl">{t("card_du_title")}</span>
              <span className="card-badge">
                {du
                  ? t("du_badge_on", { n: activeWeeks, jades: 225 * activeWeeks })
                  : t("du_badge_off")}
              </span>
            </div>
            <ToggleRow
              label={t("du_toggle_label")}
              sub={useCalendar
                ? t("du_sub_calendar", { n: activeWeeks })
                : t("du_sub_weeks", { n: activeWeeks })}
              val={du} onChange={setDu}
            />
            {useCalendar && du && (
              <InfoBox>
                <span className="mu">{t("du_mondays_info")}</span>
              </InfoBox>
            )}
          </div>

          {/* Card: Reset Mensal + Trials */}
          <div className="card">
            <div className="card-hd">
              <img src={require("../imgs/bagicon.webp")} alt="du_sign" style={{ width: 30, marginRight: 5, verticalAlign: "middle", filter: "drop-shadow(0 0 6px rgba(120,200,255,0.7))" }} />
              <span className="card-ttl">{t("card_monthly_title")}</span>
            </div>
            <Field label={t("monthly_resets_field")}>
              <NumInput val={monthlyResets} onChange={setMonthlyResets} min={0} step={1} />
            </Field>
            <InfoBox>
              <span className="cy">{monthlyResets * 5} {t("stat_total_passes").toLowerCase()}</span>
              <span className="mu"> · {(monthlyResets * 5 * PULL_COST).toLocaleString()} jades</span>
            </InfoBox>
            <div style={{ marginTop: 14 }}>
              <Field label={t("trials_field")}>
                <NumInput val={trialCount} onChange={setTrialCount} min={0} step={1} />
              </Field>
              <InfoBox>
                <span className="cy">{trialCount * 20} jades</span>
              </InfoBox>
            </div>
          </div>

          {/* Card: Atualização de Conteúdo */}
          <div className="card">
            <div className="card-hd">
              <img src={require("../imgs/upd.webp")} alt="upd" style={{ width: 28, marginLeft: 0, verticalAlign: "middle", filter: "drop-shadow(0 0 6px rgba(255, 255, 255, 0.53))" }} />
              <span className="card-ttl">{t("card_content_title")}</span>
            </div>
            <Field label={t("new_cycle_field")}>
              <NumInput val={newCycleJades} onChange={setNewCycleJades} min={0} step={100} />
            </Field>
            <Field label={t("level_up_field")}>
              <NumInput val={levelUpJades} onChange={setLevelUpJades} min={0} step={100} />
            </Field>
            <div className="card-hd" style={{ marginTop: 8 }}>
              <span className="card-ico">➕</span>
              <span className="card-ttl">{t("card_extras_title")}</span>
            </div>
            <Field label={t("bonus_pulls_field")}>
              <NumInput val={bonusPulls} onChange={setBonusPulls} min={0} step={1} />
            </Field>
            <Field label={t("extra_jades_field")}>
              <NumInput val={extraJades} onChange={setExtraJades} min={0} step={160} />
            </Field>
          </div>

          {/* Card: Eventos & Aniversário */}
          <div className="card">
            <div className="card-hd">
              <img src={require("../imgs/events.webp")} alt="events" style={{ width: 28, marginLeft: 0, verticalAlign: "middle", filter: "drop-shadow(0 0 6px rgba(255, 255, 255, 0.53))" }} />
              <span className="card-ttl">{t("card_events_title")}</span>
            </div>

            {/* Odisseia */}
            <div className="card-hd" style={{ marginTop: 0, marginBottom: 4 }}>
              <img src={require("../imgs/gtik.webp")} alt="ticket" style={{ width: 30, verticalAlign: "middle", filter: "drop-shadow(0 0 4px rgba(240,195,70,0.7))" }} />
              <span className="card-ttl">{t("card_odyssey_title")}</span>
            </div>
            <ToggleRow label={t("odyssey_available")} sub={t("odyssey_sub")} val={odyssey} onChange={setOdyssey} />

            <div style={{ marginTop: 16 }} />

            <ToggleRow label={t("anniversary_toggle")} sub={t("anniversary_sub")} val={anniversary} onChange={setAnniversary} />
            {anniversary && (
              <div style={{ marginTop: 12 }}>
                <Field label={t("anniversary_jades")}>
                  <NumInput val={anniversaryJades} onChange={setAnniversaryJades} min={0} step={100} />
                </Field>
              </div>
            )}
            {customEvents.length > 0 && <div style={{ marginTop: 12 }} />}
            {customEvents.map(ev => (
              <div className="evitem" key={ev.id}>
                <span className="evname">{ev.name}</span>
                <span className="evjades">+{ev.jades.toLocaleString()} ✦</span>
                <button className="evdel" onClick={() => removeEvent(ev.id)}>✕</button>
              </div>
            ))}
            {showNewEvent ? (
              <div className="evform">
                <div className="field" style={{ marginBottom: 10 }}>
                  <label className="flabel">{t("event_name_label")}</label>
                  <input className="finput" type="text" value={newEvName}
                    placeholder={t("event_name_ph")}
                    onChange={e => setNewEvName(e.target.value)}
                  />
                </div>
                <Field label={t("event_jades_label")}>
                  <NumInput val={newEvJades} onChange={setNewEvJades} min={0} step={100} />
                </Field>
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button className="sbtn gold" onClick={addEvent}>{t("add_event_btn")}</button>
                  <button className="sbtn ghost" onClick={() => setShowNewEvent(false)}>{t("cancel_event_btn")}</button>
                </div>
              </div>
            ) : (
              <button className="sbtn cy full" onClick={() => setShowNewEvent(true)}>{t("new_event_btn")}</button>
            )}
          </div>

          {/* Card: Meta de Pulls */}
          <div className="card goal-card grid-full">
            <div className="card-hd">
              <span className="card-ico">🎯</span>
              <span className="card-ttl">{t("card_goal_title")}</span>
              <span className="card-badge" style={{ color: goalMet ? 'var(--green)' : hasGoal ? 'var(--cyan)' : 'var(--muted)' }}>
                {goalMet
                  ? t("goal_reached")
                  : hasGoal
                    ? t("goal_complete", { pct: progressPct.toFixed(0) })
                    : t("goal_define")}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 240px' }}>
                <div className="flabel">{t("goal_field")}</div>
                <NumInput val={goalPulls} onChange={setGoalPulls} min={0} step={10} />
              </div>
              {hasGoal && (
                <div style={{ fontSize: 13, color: 'var(--muted)', paddingBottom: 10 }}>
                  {t("goal_jades_needed", { jades: (goalPulls * PULL_COST).toLocaleString() })}
                </div>
              )}
            </div>

            {hasGoal && (
              <>
                <div className="pbar"><div className="pfill" style={{ width: `${progressPct}%` }} /></div>
                <div className="goal-display">
                  <div className="goal-box">
                    <div className="gbl">{t("goal_current")}</div>
                    <div className={`gbig ${goalMet ? "gr" : "gold"}`}>{totalPulls}</div>
                  </div>
                  <div className="goal-box">
                    <div className="gbl">{t("goal_target")}</div>
                    <div className="gbig cy">{goalPulls}</div>
                  </div>
                  <div className="goal-box">
                    <div className="gbl">{goalMet ? t("goal_surplus") : t("goal_missing")}</div>
                    <div className={`gbig ${goalMet ? "gr" : "re"}`}>{goalMet ? `+${surplus}` : pullsNeeded}</div>
                  </div>
                  <div className="goal-box">
                    <div className="gbl">{goalMet ? t("goal_extra_jades") : t("goal_jades_missing")}</div>
                    <div className={`gbig sm ${goalMet ? "gr" : "re"}`}>
                      {goalMet ? `+${(surplus * PULL_COST).toLocaleString()}` : jadesNeeded.toLocaleString()}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Fim do Objetivo (Deadline) ── */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                <label className="tgl">
                  <input type="checkbox" checked={!!goalDeadline}
                    onChange={e => setGoalDeadline(e.target.checked ? (useCalendar ? endDate : addDays(todayStr(), 30)) : "")} />
                  <span className="tslider" />
                </label>
                <div>
                  <div className="tlabel">{t("goal_deadline_toggle")}</div>
                  <div className="tsub">{t("goal_deadline_sub")}</div>
                </div>
              </div>
              {goalDeadline && (
                <div style={{ marginTop: 12 }}>
                  <Field label={t("date_limit")}>
                    <input
                      className="finput" type="date"
                      value={goalDeadline}
                      min={todayStr()}
                      onChange={e => setGoalDeadline(e.target.value)}
                    />
                  </Field>
                  {(() => {
                    const days = calcDaysUntil(goalDeadline);
                    const color = deadlineColor(days);
                    const label = deadlineLabel(days);
                    return label ? (
                      <div className="infobox" style={{ borderColor: color + "55", background: color + "11" }}>
                        <span style={{ color, fontWeight: 700, letterSpacing: 1 }}>{label}</span>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* Pills de resumo */}
            <div className="summary-row">
              <div className="sum-pill"><span className="mu">{t("pill_total_jades")} </span><span className="cy">{totalJades.toLocaleString()}</span></div>
              <div className="sum-pill"><span className="mu">{t("pill_total_passes")} </span><span className="go">{totalPulls}</span></div>
              <div className="sum-pill"><span className="mu">{t("pill_pull_cost")}</span></div>
              <div className="sum-pill">
                <span className="mu">{t("pill_duration")} </span>
                <span className="go">{activeDays} {t("days")}</span>
                {useCalendar && <span className="mu"> {t("pill_calendar_icon")}</span>}
              </div>
              {useCalendar && (
                <div className="sum-pill">
                  <span className="mu">{t("pill_du_cycles")} </span>
                  <span className="cy">{activeWeeks}×</span>
                </div>
              )}
              {expressPass && (
                <div className="sum-pill"><span className="mu">{t("pill_express")} </span><span className="cy">{expressQty}×</span></div>
              )}
              <button className="sbtn gold" onClick={async () => {
                handleSaveMap();
                if (user) {
                  resetMapState();
                  await sleep(1000);
                  setScreen("home");
                }
              }}>
                {t("save_map")}
              </button>
            </div>
          </div>

        </div>
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}