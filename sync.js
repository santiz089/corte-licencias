/* =============================================================
   sync.js · Capa de datos compartida
   La usan la pantalla de captura (index.html) y el corte (Final.html).
   Todo lo del día vive en:  modulos/<MODULO>/dias/<AAAA-MM-DD>/...
   ============================================================= */
(function () {
  const cfg = window.FIREBASE_CONFIG || {};
  const MODULO = window.MODULO || "modulo";
  const DEMO = !cfg.apiKey || cfg.apiKey === "PEGA_AQUI";

  const pad = n => String(n).padStart(2, "0");
  const dateKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  /* ---------- Modo demostración (localStorage) ---------- */
  function demoStore() {
    const KEY = `corte-demo-${MODULO}`;
    const load = () => lsGet(KEY, { dias: {} });
    let subs = [];
    const fire = () => { const db = load(); subs.forEach(s => s(db)); };
    const save = db => { lsSet(KEY, db); fire(); };
    window.addEventListener("storage", e => { if (e.key === KEY) fire(); });
    const walk = (obj, parts, create) => {
      let o = obj;
      for (const p of parts) { if (o[p] == null) { if (!create) return null; o[p] = {}; } o = o[p]; }
      return o;
    };
    let seq = 0;
    const api = {
      demo: true,
      uid: "demo",
      async init(onUser) { onUser({ email: "demo" }); },
      onConn(cb) { cb(true); },
      watchDay(date, cb) {
        const f = db => cb((db.dias || {})[date] || {});
        subs.push(f); f(load());
        return () => { subs = subs.filter(x => x !== f); };
      },
      async set(date, path, val) {
        const db = load(); const parts = ["dias", date, ...path.split("/")];
        const parent = walk(db, parts.slice(0, -1), true);
        if (val === null || val === undefined) delete parent[parts.at(-1)]; else parent[parts.at(-1)] = val;
        save(db);
      },
      async push(date, path, val) {
        const id = Date.now().toString(36) + (seq++).toString(36).padStart(3, "0") + Math.random().toString(36).slice(2, 5);
        await api.set(date, `${path}/${id}`, val); return id;
      },
      async remove(date, path) { await api.set(date, path, null); },
      async login() {}, async logout() {}
    };
    return api;
  }

  /* ---------- Firebase ---------- */
  async function firebaseStore() {
    const V = "10.12.2";
    const { initializeApp } = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
    const { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`);
    const { getDatabase, ref, onValue, push, set, remove } = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-database.js`);
    const app = initializeApp(cfg), auth = getAuth(app), db = getDatabase(app);
    const p = (date, path) => `modulos/${MODULO}/dias/${date}${path ? "/" + path : ""}`;
    const api = {
      demo: false,
      uid: null,
      async init(onUser) { onAuthStateChanged(auth, u => { api.uid = u ? u.uid : null; onUser(u); }); },
      onConn(cb) { onValue(ref(db, ".info/connected"), s => cb(!!s.val())); },
      watchDay(date, cb) { return onValue(ref(db, p(date)), s => cb(s.val() || {})); },
      async set(date, path, val) { await set(ref(db, p(date, path)), val ?? null); },
      async push(date, path, val) { const r = push(ref(db, p(date, path))); await set(r, val); return r.key; },
      async remove(date, path) { await remove(ref(db, p(date, path))); },
      async login(email, pass) { await signInWithEmailAndPassword(auth, email, pass); },
      async logout() { await signOut(auth); }
    };
    return api;
  }

  let storePromise = null;
  window.Corte = {
    DEMO, dateKey, lsGet, lsSet,
    store() { return storePromise || (storePromise = DEMO ? Promise.resolve(demoStore()) : firebaseStore()); }
  };
})();
