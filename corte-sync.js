/* =============================================================
   corte-sync.js · Llena Final.html con la captura en tiempo real
   - Lo capturado por ventanillas y oficial llega solo (campos con
     borde azul, de solo lectura).
   - Lo que se escribe a mano aquí (folios finales, etc.) se guarda
     en el mismo registro del día, para no perderlo si se cierra.
   ============================================================= */
(async function () {
  const params = new URLSearchParams(location.search);
  const FECHA = (params.get("fecha") && /^\d{4}-\d{2}-\d{2}$/.test(params.get("fecha"))) ? params.get("fecha") : Corte.dateKey();
  const HORAS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const TRAMITE_CAMPO = {
    NP: "m1-nueva-perm", NA: "m1-nuevas", RA: "m1-renovaciones", RepA: "m1-rep-3", D3: "m1-digitales-verde",
    DNP: "m1-digitales-lila", P: "m1-permisos", RepP: "m1-rep-permiso", RepPerm: "m1-rep-perm", RepNP: "m1-rep-nueva-perm"
  };
  const FOLIO_CAMPO = { verde1: "f-ini-verde", verde2: "f-ini-verde-2", morada1: "f-ini-lila", morada2: "f-ini-lila-2" };

  const $id = id => document.getElementById(id);
  const allInputs = [...document.querySelectorAll("input, textarea")];
  const keyOf = el => el.id || `n${allInputs.indexOf(el)}`;
  const elOf = key => key.startsWith("n") && /^n\d+$/.test(key) ? allInputs[+key.slice(1)] : $id(key);

  // Campos que llena la captura
  const autoEls = new Map(); // elemento -> valor
  const aflH = [...document.querySelectorAll(".m1-aflu-h")], aflM = [...document.querySelectorAll(".m1-aflu-m")];
  const AUTO = new Set([
    ...aflH, ...aflM,
    ...Object.values(TRAMITE_CAMPO).map($id), ...Object.values(FOLIO_CAMPO).map($id),
    $id("m1-lilas-canc"), $id("m1-verdes-canc"), $id("m1-lilas-canc-folios"), $id("m1-verdes-canc-folios"),
    $id("m4-citas-reg"), $id("m4-citas-atendidas"), $id("m4-citas-saf")
  ].filter(Boolean));
  AUTO.forEach(el => { el.readOnly = true; el.classList.add("auto-captura"); el.title = "Se llena solo desde la captura en tiempo real"; });

  /* ---------- indicador flotante ---------- */
  const badge = document.createElement("div");
  badge.className = "sync-badge";
  badge.innerHTML = `<span class="sync-dot" id="syncDot"></span><span id="syncTxt">Conectando…</span><a href="index.html" target="_blank">Ir a captura</a>`;
  document.body.appendChild(badge);
  const setConn = (on, txt) => { $id("syncDot").className = "sync-dot " + (on ? "on" : "off"); $id("syncTxt").textContent = txt; };

  const store = await Corte.store();
  store.onConn(on => setConn(on, on ? (store.demo ? `Demo · ${FECHA}` : `En vivo · ${FECHA}`) : "Sin conexión"));

  /* ---------- aplicar datos del día ---------- */
  const setIf = (el, val) => { if (!el) return false; val = val == null ? "" : String(val); if (el.value !== val) { el.value = val; return true; } return false; };

  function apply(day) {
    let changed = false;

    // 1) Captura en vivo
    const marks = [];
    for (const v of ["V1", "V2"]) {
      const g = (day.v || {})[v] || {};
      for (const h of Object.keys(g)) for (const s of Object.keys(g[h] || {})) { const m = g[h][s]; if (m && m.p && m.tr) marks.push({ h: +h, ...m }); }
    }
    HORAS.forEach((h, i) => {
      const m = marks.filter(x => x.h === h);
      changed = setIf(aflH[i], m.filter(x => x.p[0] === "H").length || "") || changed;
      changed = setIf(aflM[i], m.filter(x => x.p[0] === "M").length || "") || changed;
    });
    for (const [c, id] of Object.entries(TRAMITE_CAMPO)) changed = setIf($id(id), marks.filter(x => x.tr === c).length || "") || changed;

    const fol = day.folios || {};
    for (const [k, id] of Object.entries(FOLIO_CAMPO)) changed = setIf($id(id), (fol[k] || {}).v || "") || changed;

    const canc = Object.entries(day.canc || {}).sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([, c]) => c);
    const lis = color => canc.filter(c => c.color === color).map(c => c.folio).sort((a, b) => Number(a) - Number(b));
    const cm = lis("morada"), cv = lis("verde");
    changed = setIf($id("m1-lilas-canc"), cm.length || "") || changed;
    changed = setIf($id("m1-verdes-canc"), cv.length || "") || changed;
    changed = setIf($id("m1-lilas-canc-folios"), cm.join(", ")) || changed;
    changed = setIf($id("m1-verdes-canc-folios"), cv.join(", ")) || changed;

    const ofi = day.ofi || {}, lleg = Object.values(ofi.llegadas || {});
    changed = setIf($id("m4-citas-reg"), ofi.regSemovi || 0) || changed;
    changed = setIf($id("m4-citas-atendidas"), lleg.filter(x => x.f === "semovi").length) || changed;
    changed = setIf($id("m4-citas-saf"), lleg.filter(x => x.f === "saf").length) || changed;

    // 2) Campos escritos a mano en este corte (folios finales, tesorería, etc.)
    const fin = day.final || {};
    for (const [k, val] of Object.entries(fin)) {
      const el = elOf(k);
      if (!el || AUTO.has(el) || document.activeElement === el) continue;
      changed = setIf(el, val) || changed;
    }

    // 3) Recalcular con la lógica original de script.js
    if (changed || !apply.done) {
      ["f-ini-lila", "acta-f-ini", "m3-am"].forEach(id => { const el = $id(id); if (el) el.dispatchEvent(new Event("input", { bubbles: true })); });
      apply.done = true;
    }
  }

  /* ---------- guardar lo que se escribe a mano ---------- */
  const timers = {};
  const saveManual = e => {
    if (!e.isTrusted) return;                     // ignorar los eventos que genera este script
    const el = e.target;
    if (!el.matches || !el.matches("input, textarea") || AUTO.has(el) || el.readOnly) return;
    const k = keyOf(el);
    clearTimeout(timers[k]);
    timers[k] = setTimeout(() => store.set(FECHA, `final/${k}`, el.value === "" ? null : el.value), 400);
  };
  document.addEventListener("input", saveManual);
  document.addEventListener("change", saveManual);

  /* ---------- inicio de sesión (solo con Firebase) ---------- */
  let started = false;
  await store.init(user => {
    if (!user) {
      if (document.querySelector(".sync-login")) return;
      const ov = document.createElement("div");
      ov.className = "sync-login";
      ov.innerHTML = `<form><b>Entrar para ver el corte del día</b><input type="email" placeholder="Correo" autocomplete="username" required>
        <input type="password" placeholder="Contraseña" autocomplete="current-password" required><div class="err"></div><button>Entrar</button></form>`;
      ov.querySelector("form").onsubmit = async ev => {
        ev.preventDefault();
        const [em, pw] = ov.querySelectorAll("input");
        try { await store.login(em.value.trim(), pw.value); } catch { ov.querySelector(".err").textContent = "No se pudo entrar: revisa correo y contraseña."; }
      };
      document.body.appendChild(ov);
      return;
    }
    const ov = document.querySelector(".sync-login"); if (ov) ov.remove();
    if (!started) { started = true; store.watchDay(FECHA, d => apply(d || {})); }
  });
})();
