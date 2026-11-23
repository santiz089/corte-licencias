let indiceActivo = 0;
let m5Manual = false; // true = el Módulo 05 se captura a mano (no se sobrescribe automáticamente)

// --- NAVEGACIÓN Y VISTAS ---
const escenario = document.getElementById('escenario');
const tiltWrapper = document.getElementById('tilt-wrapper');
const btn3D = document.getElementById('btn-vista-3d');
const btnPlana = document.getElementById('btn-vista-plana');
const indicador = document.getElementById('controlesIndicator');
let isFlatMode = false;

function moverIndicador(btn) {
    if (!btn) return;
    indicador.style.left = btn.offsetLeft + 'px';
    indicador.style.width = btn.offsetWidth + 'px';
}

function setVista(vista) {
    if (vista === '3d') {
        isFlatMode = false;
        escenario.classList.remove('vista-plana');
        escenario.classList.add('vista-isometrica');
        btn3D.classList.add('active');
        btnPlana.classList.remove('active');
        moverIndicador(btn3D);
        iniciarPhysics();
    } else {
        isFlatMode = true;
        if (tiltWrapper) tiltWrapper.style.transform = `rotateX(0deg) rotateY(0deg)`;
        escenario.classList.remove('vista-isometrica');
        escenario.classList.add('vista-plana');
        btnPlana.classList.add('active');
        btn3D.classList.remove('active');
        moverIndicador(btnPlana);
    }
}
window.addEventListener('load', () => moverIndicador(btn3D));

// --- NAVEGACIÓN ENTRE TARJETAS ---
const totalHojas = 7;
const botonesSidebar = document.querySelectorAll('.sidebar-btn');

function cambiarHoja(indiceDestino) {
    botonesSidebar.forEach((btn, index) => {
        if (index === indiceDestino) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    for (let i = 0; i < totalHojas; i++) {
        const hoja = document.getElementById(`hoja-${i}`);
        if(!hoja) continue;
        hoja.classList.remove('active', 'sibling-1', 'sibling-2', 'oculta');
        if (i === indiceDestino) hoja.classList.add('active');
        else if (i === (indiceDestino + 1) % totalHojas) hoja.classList.add('sibling-1');
        else if (i === (indiceDestino + 2) % totalHojas) hoja.classList.add('sibling-2');
        else hoja.classList.add('oculta');
    }
}

function actualizarNavegacion(nuevoIndice) {
    indiceActivo = (nuevoIndice + totalHojas) % totalHojas;
    cambiarHoja(indiceActivo);
}

function seleccionarTarjeta(indice) {
    actualizarNavegacion(indice);
}

// --- FUNCIÓN MAESTRA PARA SINCRONIZAR MÓDULOS ---
function actualizarControlGeneral() {
    const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
    const getInt = (id) => { const el = document.getElementById(id); return el ? parseInt(el.value) || 0 : 0; };
    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };

    // == CÁLCULO DE AFLUENCIA GLOBAL ==
    let m1_h = 0, m1_m = 0;
    document.querySelectorAll('.m1-aflu-h').forEach(i => m1_h += parseInt(i.value) || 0);
    document.querySelectorAll('.m1-aflu-m').forEach(i => m1_m += parseInt(i.value) || 0);
    
    let m2_h = getInt('m2-per-h');
    let m2_m = getInt('m2-per-m');
    
    let m3_h = 0, m3_m = 0;
    document.querySelectorAll('.m3-aflu-h').forEach(i => m3_h += parseInt(i.value) || 0);
    document.querySelectorAll('.m3-aflu-m').forEach(i => m3_m += parseInt(i.value) || 0);
    
    let global_h = m1_h + m2_h + m3_h;
    let global_m = m1_m + m2_m + m3_m;
    let global_tot = global_h + global_m;
    
    setVal('m4-tot-h', global_h);
    setVal('m4-tot-m', global_m);
    setVal('m4-tot-personas', global_tot);
    setVal('m4-turnos-val', global_tot);

    // == ATENCIÓN PRIORITARIA ==
    let m3_am = getInt('m3-am');
    let m3_gv = getInt('m3-gv');
    setVal('m4-am', m3_am);
    setVal('m4-gv', m3_gv);

    // == MAPEOS TABLAS LICENCIAS (Módulo 1 -> Módulo 4) ==
    setVal('m4-ini-lila', getVal('f-ini-lila'));
    setVal('m4-fin-lila', getVal('f-fin-lila'));
    let iL1 = getInt('f-ini-lila'), fL1 = getInt('f-fin-lila');
    setVal('m4-tot-lila', (fL1 >= iL1 && iL1 > 0) ? (fL1 - iL1 + 1) : 0);

    setVal('m4-ini-lila-2', getVal('f-ini-lila-2'));
    setVal('m4-fin-lila-2', getVal('f-fin-lila-2'));
    let iL2 = getInt('f-ini-lila-2'), fL2 = getInt('f-fin-lila-2');
    setVal('m4-tot-lila-2', (fL2 >= iL2 && iL2 > 0) ? (fL2 - iL2 + 1) : 0);

    setVal('m4-ini-verde', getVal('f-ini-verde'));
    setVal('m4-fin-verde', getVal('f-fin-verde'));
    let iV1 = getInt('f-ini-verde'), fV1 = getInt('f-fin-verde');
    setVal('m4-tot-verde', (fV1 >= iV1 && iV1 > 0) ? (fV1 - iV1 + 1) : 0);

    setVal('m4-ini-verde-2', getVal('f-ini-verde-2'));
    setVal('m4-fin-verde-2', getVal('f-fin-verde-2'));
    let iV2 = getInt('f-ini-verde-2'), fV2 = getInt('f-fin-verde-2');
    setVal('m4-tot-verde-2', (fV2 >= iV2 && iV2 > 0) ? (fV2 - iV2 + 1) : 0);

    // == DESGLOSE TRÁMITES LICENCIAS ==
    let digitalesLila = getInt('m1-digitales-lila');
    let digitalesVerde = getInt('m1-digitales-verde');
            
    setVal('m4-nueva-perm', getVal('m1-nueva-perm'));
    setVal('m4-digitales', digitalesLila);
    setVal('m4-digitales-verde', digitalesVerde);
    setVal('m4-nuevas', getVal('m1-nuevas'));
    setVal('m4-renovaciones', getVal('m1-renovaciones'));
    setVal('m4-rep-perm', getVal('m1-rep-perm'));
    setVal('m4-rep-3', getVal('m1-rep-3'));
    setVal('m4-permisos', getVal('m1-permisos'));
    setVal('m4-rep-permiso', getVal('m1-rep-permiso'));
    setVal('m4-rep-nueva-perm', getVal('m1-rep-nueva-perm'));

    let lilasCanc = getInt('m1-lilas-canc');
    let verdesCanc = getInt('m1-verdes-canc');
    setVal('m4-lilas-canc-1', lilasCanc);
    setVal('m4-verdes-canc-1', verdesCanc);
    setVal('m4-lilas-canc-2', lilasCanc);
    setVal('m4-verdes-canc-2', verdesCanc);

    // Folios de las micas canceladas (se capturan en la pantalla de captura o a mano en el Módulo 1)
    const foliosLilasCanc = getVal('m1-lilas-canc-folios').trim();
    const foliosVerdesCanc = getVal('m1-verdes-canc-folios').trim();
    setVal('m4-lilas-canc-folios', foliosLilasCanc);
    setVal('m4-verdes-canc-folios', foliosVerdesCanc);
    setVal('m6-folios-canc', [foliosLilasCanc && ('Lilas: ' + foliosLilasCanc), foliosVerdesCanc && ('Verdes: ' + foliosVerdesCanc)].filter(Boolean).join('  |  ') || 'Ninguno');

    let m1Total = parseInt(document.getElementById('lbl-total-tramites').textContent) || 0; 
    let m1Efectivas = m1Total - lilasCanc - verdesCanc;
    setVal('m4-tot-lic-canc', m1Total);

    // == BADGE DINÁMICO LICENCIAS EN MÓDULO 4 ==
    let foliosLilasM4 = getInt('m4-tot-lila') + getInt('m4-tot-lila-2');
    let foliosVerdesM4 = getInt('m4-tot-verde') + getInt('m4-tot-verde-2');
    let totalFoliosM4 = foliosLilasM4 + foliosVerdesM4;

    let totalTramitesM4 = getInt('m4-nueva-perm') + getInt('m4-digitales') + getInt('m4-digitales-verde') + getInt('m4-nuevas') + getInt('m4-renovaciones') + getInt('m4-rep-perm') + getInt('m4-rep-3') + getInt('m4-permisos') + getInt('m4-rep-permiso') + getInt('m4-rep-nueva-perm') + getInt('m4-lilas-canc-1') + getInt('m4-verdes-canc-1');

    const badgeLicenciasM4 = document.getElementById('m4-badge-licencias');
    if(badgeLicenciasM4) {
        if(totalFoliosM4 === totalTramitesM4 && totalFoliosM4 > 0) {
            badgeLicenciasM4.textContent = "✔ CUADRÓ";
            badgeLicenciasM4.style.color = "var(--accent-green)";
            badgeLicenciasM4.style.borderColor = "var(--accent-green)";
            badgeLicenciasM4.style.background = "rgba(52, 211, 153, 0.15)";
        } else {
            badgeLicenciasM4.textContent = "✖ ERROR DE CUADRE";
            badgeLicenciasM4.style.color = "var(--accent-warm)";
            badgeLicenciasM4.style.borderColor = "var(--accent-warm)";
            badgeLicenciasM4.style.background = "rgba(255, 42, 95, 0.15)";
        }
    }


    // == MAPEOS TABLAS ACTAS (Módulo 2 -> Módulo 4) ==
    setVal('m4-acta-ini-1', getVal('acta-f-ini'));
    setVal('m4-acta-fin-1', getVal('acta-f-fin'));
    let aI1 = getInt('acta-f-ini'), aF1 = getInt('acta-f-fin');
    setVal('m4-acta-tot-1', (aF1 >= aI1 && aI1 > 0) ? (aF1 - aI1 + 1) : 0);

    setVal('m4-acta-ini-2', getVal('acta-f-ini-2'));
    setVal('m4-acta-fin-2', getVal('acta-f-fin-2'));
    let aI2 = getInt('acta-f-ini-2'), aF2 = getInt('acta-f-fin-2');
    setVal('m4-acta-tot-2', (aF2 >= aI2 && aI2 > 0) ? (aF2 - aI2 + 1) : 0);

    setVal('m4-nac', getVal('m2-nac'));
    setVal('m4-mat', getVal('m2-mat'));
    setVal('m4-def', getVal('m2-def'));
    setVal('m4-papel-val-canc', getVal('m2-canc'));
            
    let copiasCertificadas = getInt('m2-nac') + getInt('m2-mat') + getInt('m2-def');

    // == BADGE DINÁMICO ACTAS EN MÓDULO 4 ==
    let actasFoliosM4 = getInt('m4-acta-tot-1') + getInt('m4-acta-tot-2');
    let actasTramitesM4 = getInt('m4-nac') + getInt('m4-mat') + getInt('m4-def') + getInt('m4-papel-val-canc');

    const badgeActasM4 = document.getElementById('m4-badge-actas');
    if(badgeActasM4) {
        if(actasFoliosM4 === actasTramitesM4 && actasFoliosM4 > 0) {
            badgeActasM4.textContent = "✔ CUADRÓ";
            badgeActasM4.style.color = "var(--accent-green)";
            badgeActasM4.style.borderColor = "var(--accent-green)";
            badgeActasM4.style.background = "rgba(52, 211, 153, 0.15)";
        } else {
            badgeActasM4.textContent = "✖ ERROR DE CUADRE";
            badgeActasM4.style.color = "var(--accent-warm)";
            badgeActasM4.style.borderColor = "var(--accent-warm)";
            badgeActasM4.style.background = "rgba(255, 42, 95, 0.15)";
        }
    }


    // == CONSTRUCCIÓN DEL REPORTE MENSUAL EN MÓDULO 4 ==
    // Cálculo Dinámico para FUTs basado SÓLO en Afluencia de Tesorería General
    let tesoAfluenciaGeneral = 0;
    document.querySelectorAll('.teso-gen-aflu').forEach(i => tesoAfluenciaGeneral += parseInt(i.value) || 0);
            
    let p1 = 0, p2 = 0, p3 = 0;
    if (tesoAfluenciaGeneral === 1) { p1 = 1; }
    else if (tesoAfluenciaGeneral === 2) { p1 = 1; p2 = 1; }
    else if (tesoAfluenciaGeneral === 3) { p1 = 2; p2 = 1; p3 = 0; }
    else if (tesoAfluenciaGeneral === 4) { p1 = 2; p2 = 1; p3 = 1; }
    else if (tesoAfluenciaGeneral > 4) {
        p1 = Math.floor(tesoAfluenciaGeneral * 0.5);
        p2 = Math.floor(tesoAfluenciaGeneral * 0.3);
        p3 = tesoAfluenciaGeneral - p1 - p2;
    }
            
    setVal('m4-rm-tenencia', p1);
    setVal('m4-rm-predial', p2);
    setVal('m4-rm-otros', p3);
            
    setVal('m4-rm-afluencia', global_tot);
            
    let tipoAP = getInt('m1-nuevas') + getInt('m1-renovaciones') + getInt('m1-permisos') + getInt('m1-rep-perm') + getInt('m1-rep-3') + getInt('m1-rep-permiso');
    setVal('m4-rm-tipo-ap', tipoAP);
            
    setVal('m4-rm-nueva-perm', getVal('m1-nueva-perm'));
    setVal('m4-rm-rep-nueva-perm', getVal('m1-rep-nueva-perm'));
    setVal('m4-rm-lic-emitidas', m1Efectivas);
            
    setVal('m4-rm-imp-lic-dig', digitalesVerde);
    setVal('m4-rm-imp-lic-dig-np', digitalesLila);
            
    let certis = 0; document.querySelectorAll('.certis-tram').forEach(i => certis += parseInt(i.value) || 0);
    setVal('m4-rm-certificaciones', certis);
            
    let constancias = 0; document.querySelectorAll('.const-tram').forEach(i => constancias += parseInt(i.value) || 0);
    setVal('m4-rm-const-adeudos', constancias);
            
    let noInhab = 0; document.querySelectorAll('.no-inhab-aflu').forEach(i => noInhab += parseInt(i.value) || 0);
    setVal('m4-rm-no-inhab', noInhab);
            
    setVal('m4-rm-copias-cert', copiasCertificadas);
            
    let totalTramitesRM = 
        getInt('m4-rm-afluencia') + 
        getInt('m4-rm-tenencia') + 
        getInt('m4-rm-predial') + 
        getInt('m4-rm-otros') + 
        getInt('m4-rm-tipo-ap') + 
        getInt('m4-rm-nueva-perm') + 
        getInt('m4-rm-rep-nueva-perm') + 
        getInt('m4-rm-lic-emitidas') + 
        getInt('m4-rm-imp-lic-dig') + 
        getInt('m4-rm-imp-lic-dig-np') + 
        getInt('m4-rm-certificaciones') + 
        getInt('m4-rm-const-adeudos') + 
        getInt('m4-rm-no-inhab') + 
        getInt('m4-rm-copias-cert');
            
    setVal('m4-rm-tot-tramites', totalTramitesRM);

    // === SINCRONIZACIÓN HACIA MÓDULO 05 (se omite en modo manual) ===
    if (!m5Manual) {
    setVal('m5-busquedas-rc', getVal('m2-fut-5700'));
    // Certificación y Constancias: si no hubo trámites se muestra 0 (no en blanco)
    setVal('m5-cert-ten', getInt('teso-tenencia'));
    setVal('m5-cert-pre', getInt('teso-predial'));
    setVal('m5-cert-rtc', getInt('teso-rtc'));
    setVal('m5-cert-rev', getInt('teso-revista'));
    setVal('m5-cert-lin', getInt('teso-linea'));
    setVal('m5-const-agua', getInt('const-agua'));
    setVal('m5-const-predio', getInt('const-predio'));
    
    // Licencias Afluencia M5
    setVal('m5-lic-h', m1_h);
    setVal('m5-lic-m', m1_m);
    setVal('m5-lic-tot', m1_h + m1_m);

    setVal('m5-aflu-h', global_h);
    setVal('m5-aflu-m', global_m);
    setVal('m5-aflu-tot', global_tot);
    
    // Grupos Vulnerables M5
    let total_vul = m3_am + m3_gv;
    setVal('m5-grupos-vul', total_vul);

    // Citas y Control M5
    setVal('m5-citas-reg', getVal('m4-citas-reg'));
    setVal('m5-citas-atendidas', getVal('m4-citas-atendidas'));
    setVal('m5-dig-np', getVal('m4-digitales'));
    setVal('m5-lilas-canc', getVal('m4-lilas-canc-1'));

    } // fin sincronización M05

    // === SINCRONIZACIÓN HACIA MÓDULO 06 ===
    // Trámites de licencia: si no hay registro se muestra 0 (no en blanco)
    setVal('m6-rep-nueva-perm', getInt('m1-rep-nueva-perm'));
    setVal('m6-rep-3', getInt('m1-rep-3'));
    setVal('m6-rep-perm', getInt('m1-rep-perm'));
    setVal('m6-rep-permiso', getInt('m1-rep-permiso'));
    setVal('m6-nuevas', getInt('m1-nuevas'));
    let digitalesTotal = digitalesLila + digitalesVerde;
    setVal('m6-digitales', digitalesTotal);
    setVal('m6-nueva-perm', getInt('m1-nueva-perm'));
    setVal('m6-permisos', getInt('m1-permisos'));
    setVal('m6-ini-s1', getVal('f-ini-lila'));
    setVal('m6-fin-s1', getVal('f-fin-lila'));
    setVal('m6-ini-s2', getVal('f-ini-lila-2'));
    setVal('m6-fin-s2', getVal('f-fin-lila-2'));
    setVal('m6-ini-s3', getVal('f-ini-verde'));
    setVal('m6-fin-s3', getVal('f-fin-verde'));
            
    let m6Canc = lilasCanc + verdesCanc;
    setVal('m6-canceladas', m6Canc);
            
    let m6Emitidas = m1Total - m6Canc; 
    setVal('m6-emitidas', m6Emitidas > 0 ? m6Emitidas : 0);
    setVal('m6-total', (m6Emitidas > 0 ? m6Emitidas : 0) + m6Canc);
}

document.addEventListener('input', actualizarControlGeneral);

// --- LÓGICA DE NEGOCIO (MÓDULO LICENCIAS) ---
const inputsFolios = document.querySelectorAll('.calc-folio');
const inputsTramites = document.querySelectorAll('.calc-tramite');
const inputsAfluencia = document.querySelectorAll('.calc-afluencia');

const fIniLila = document.getElementById('f-ini-lila');
const fFinLila = document.getElementById('f-fin-lila');
const fIniLila2 = document.getElementById('f-ini-lila-2');
const fFinLila2 = document.getElementById('f-fin-lila-2');

const fIniVerde = document.getElementById('f-ini-verde');
const fFinVerde = document.getElementById('f-fin-verde');
const fIniVerde2 = document.getElementById('f-ini-verde-2');
const fFinVerde2 = document.getElementById('f-fin-verde-2');

const lblFolios = document.getElementById('lbl-folios-usados');
const lblTramites = document.getElementById('lbl-total-tramites');
const lblAfluencia = document.getElementById('lbl-afluencia');
const badgeCuadre = document.getElementById('badge-cuadre');

function calcularCuadre() {
    let usadasLilas = 0; let usadasVerdes = 0;
    
    const iniL1 = parseInt(fIniLila.value) || 0; const finL1 = parseInt(fFinLila.value) || 0;
    const iniL2 = parseInt(fIniLila2.value) || 0; const finL2 = parseInt(fFinLila2.value) || 0;
    
    if(finL1 >= iniL1 && iniL1 > 0) usadasLilas += (finL1 - iniL1) + 1;
    if(finL2 >= iniL2 && iniL2 > 0) usadasLilas += (finL2 - iniL2) + 1;

    const iniV1 = parseInt(fIniVerde.value) || 0; const finV1 = parseInt(fFinVerde.value) || 0;
    const iniV2 = parseInt(fIniVerde2.value) || 0; const finV2 = parseInt(fFinVerde2.value) || 0;

    if(finV1 >= iniV1 && iniV1 > 0) usadasVerdes += (finV1 - iniV1) + 1;
    if(finV2 >= iniV2 && iniV2 > 0) usadasVerdes += (finV2 - iniV2) + 1;
    
    const totalFolios = usadasLilas + usadasVerdes;
    lblFolios.textContent = totalFolios;

    let totalTramites = 0; let totalCanceladas = 0;
    inputsTramites.forEach(input => {
        let valor = parseInt(input.value) || 0;
        totalTramites += valor;
        if (input.classList.contains('calc-cancelada')) { totalCanceladas += valor; }
    });
    lblTramites.textContent = totalTramites;

    let totalAfluencia = 0;
    inputsAfluencia.forEach(input => { totalAfluencia += parseInt(input.value) || 0; });
    lblAfluencia.textContent = totalAfluencia;

    let tramitesEfectivos = totalTramites - totalCanceladas;

    if (totalFolios === 0 && totalTramites === 0 && totalAfluencia === 0) {
        badgeCuadre.className = 'status-badge status-error';
        badgeCuadre.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> FALTAN DATOS`;
    } else {
        let errores = [];
        if (totalFolios !== totalTramites) errores.push("Folios ≠ Micas");
        if (totalAfluencia !== tramitesEfectivos) errores.push("Afluencia ≠ Trámites");

        if (errores.length === 0) {
            badgeCuadre.className = 'status-badge status-ok';
            badgeCuadre.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ¡CUADRA PERFECTO!`;
        } else {
            badgeCuadre.className = 'status-badge status-error';
            badgeCuadre.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> ERROR: ${errores.join(" | ")}`;
        }
    }
    
    actualizarControlGeneral(); 
}

inputsFolios.forEach(input => input.addEventListener('input', calcularCuadre));
inputsTramites.forEach(input => input.addEventListener('input', calcularCuadre));
inputsAfluencia.forEach(input => input.addEventListener('input', calcularCuadre));


// --- LÓGICA DE NEGOCIO (MÓDULO ACTAS) ---
const inputsActas = document.querySelectorAll('.calc-acta-input');
const aIni1 = document.getElementById('acta-f-ini'); const aFin1 = document.getElementById('acta-f-fin');
const aIni2 = document.getElementById('acta-f-ini-2'); const aFin2 = document.getElementById('acta-f-fin-2');
const inputsFUT = document.querySelectorAll('.calc-fut');
const inputsPersona = document.querySelectorAll('.calc-persona');

const lblActasFolios = document.getElementById('lbl-actas-folios');
const lblActasTramites = document.getElementById('lbl-actas-tramites');
const lblActasCanceladas = document.getElementById('lbl-actas-canceladas');
const lblActasFUTSimples = document.getElementById('lbl-actas-fut-simples');
const lblActasPersonas = document.getElementById('lbl-actas-personas');
const badgeCuadreActas = document.getElementById('badge-cuadre-actas');

function calcularCuadreActas() {
    let usadasActas = 0;
    const i1 = parseInt(aIni1.value) || 0, f1 = parseInt(aFin1.value) || 0;
    const i2 = parseInt(aIni2.value) || 0, f2 = parseInt(aFin2.value) || 0;
    
    if(f1 >= i1 && i1 > 0) usadasActas += (f1 - i1) + 1;
    if(f2 >= i2 && i2 > 0) usadasActas += (f2 - i2) + 1;
    lblActasFolios.textContent = usadasActas;

    let totalFUTSimples = 0;
    inputsFUT.forEach(input => {
        totalFUTSimples += parseInt(input.value) || 0; 
    });
    lblActasFUTSimples.textContent = totalFUTSimples;

    let totalPersonas = 0;
    inputsPersona.forEach(input => totalPersonas += parseInt(input.value) || 0);
    lblActasPersonas.textContent = totalPersonas;

    let nac = parseInt(document.getElementById('m2-nac').value) || 0;
    let mat = parseInt(document.getElementById('m2-mat').value) || 0;
    let def = parseInt(document.getElementById('m2-def').value) || 0;
    let canc = parseInt(document.getElementById('m2-canc').value) || 0;

    let actasEmitidas = nac + mat + def;
    lblActasTramites.textContent = actasEmitidas;
    if (lblActasCanceladas) lblActasCanceladas.textContent = canc;

    if (usadasActas === 0 && totalFUTSimples === 0 && totalPersonas === 0 && actasEmitidas === 0 && canc === 0) {
        badgeCuadreActas.className = 'status-badge status-error';
        badgeCuadreActas.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> FALTAN DATOS`;
    } else {
        let errores = [];
        
        if (usadasActas !== (actasEmitidas + canc)) {
            errores.push("Folios ≠ Actas + Canc");
        }
        
        if (totalPersonas !== totalFUTSimples) {
            errores.push("Personas ≠ Recibos FUT");
        }

        if (errores.length === 0) {
            badgeCuadreActas.className = 'status-badge status-ok';
            badgeCuadreActas.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ¡CUADRA PERFECTO!`;
        } else {
            badgeCuadreActas.className = 'status-badge status-error';
            badgeCuadreActas.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> ERROR: ${errores.join(" | ")}`;
        }
    }
    actualizarControlGeneral(); 
}
inputsActas.forEach(input => input.addEventListener('input', calcularCuadreActas));


// --- LÓGICA DE NEGOCIO (MÓDULO TESORERÍA) ---
const inputsTesoAflu = document.querySelectorAll('.teso-calc-aflu');
const inputsTesoTram = document.querySelectorAll('.teso-calc-tram');
const inputsCertisAflu = document.querySelectorAll('.certis-aflu');
const inputsCertisTram = document.querySelectorAll('.certis-tram');
const inputsConstAflu = document.querySelectorAll('.const-aflu');
const inputsConstTram = document.querySelectorAll('.const-tram');

const lblTesoAfluencia = document.getElementById('lbl-teso-afluencia');
const lblTesoTramites = document.getElementById('lbl-teso-tramites');
const badgeCertis = document.getElementById('badge-certis');
const badgeConst = document.getElementById('badge-const');
const badgeCuadreTeso = document.getElementById('badge-cuadre-tesoreria');

function calcularCuadreTesoreria() {
    let totalAflu = 0;
    inputsTesoAflu.forEach(i => totalAflu += parseInt(i.value) || 0);
    lblTesoAfluencia.textContent = totalAflu;

    let totalTram = 0;
    inputsTesoTram.forEach(i => totalTram += parseInt(i.value) || 0);
    lblTesoTramites.textContent = totalTram;

    let certisAflu = 0, certisTram = 0;
    inputsCertisAflu.forEach(i => certisAflu += parseInt(i.value) || 0);
    inputsCertisTram.forEach(i => certisTram += parseInt(i.value) || 0);
    
    let okCertis = false;
    if (certisAflu === 0 && certisTram === 0) {
        badgeCertis.style.color = "var(--texto-secundario)"; badgeCertis.textContent = "Cuadró Certis: Pendiente"; okCertis = true; 
    } else if (certisAflu === certisTram) {
        badgeCertis.style.color = "var(--accent-green)"; badgeCertis.textContent = "✔ Cuadró Certis: OK"; okCertis = true;
    } else {
        badgeCertis.style.color = "var(--accent-warm)"; badgeCertis.textContent = "✖ Error en Certis";
    }

    let constAflu = 0, constTram = 0;
    inputsConstAflu.forEach(i => constAflu += parseInt(i.value) || 0);
    inputsConstTram.forEach(i => constTram += parseInt(i.value) || 0);

    let okConst = false;
    if (constAflu === 0 && constTram === 0) {
        badgeConst.style.color = "var(--texto-secundario)"; badgeConst.textContent = "Cuadre: Pendiente"; okConst = true;
    } else if (constAflu === constTram) {
        badgeConst.style.color = "var(--accent-green)"; badgeConst.textContent = "✔ Cuadre: OK"; okConst = true;
    } else {
        badgeConst.style.color = "var(--accent-warm)"; badgeConst.textContent = "✖ Error Constancias";
    }

    if (totalAflu === 0 && totalTram === 0) {
        badgeCuadreTeso.className = 'status-badge status-error';
        badgeCuadreTeso.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> FALTAN DATOS`;
    } else if (okCertis && okConst) {
        badgeCuadreTeso.className = 'status-badge status-ok';
        badgeCuadreTeso.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> SECCIONES CUADRADAS`;
    } else {
        badgeCuadreTeso.className = 'status-badge status-error';
        badgeCuadreTeso.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> REVISAR DESGLOSES`;
    }
    
    actualizarControlGeneral(); 
}

inputsTesoAflu.forEach(i => i.addEventListener('input', calcularCuadreTesoreria));
inputsTesoTram.forEach(i => i.addEventListener('input', calcularCuadreTesoreria));
window.addEventListener('load', actualizarControlGeneral);

// --- INCLINACIÓN 3D CON EL MOUSE ---
// El bucle de animación solo corre mientras la escena se está moviendo; en reposo no consume CPU/GPU.
let targetRotX = 0, targetRotY = 0;
let currentRotX = 0, currentRotY = 0;
let physicsRaf = null;

function renderPhysics() {
    if (isFlatMode) { physicsRaf = null; return; }
    currentRotX += (targetRotX - currentRotX) * 0.12;
    currentRotY += (targetRotY - currentRotY) * 0.12;
    tiltWrapper.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
    const quieto = Math.abs(targetRotX - currentRotX) < 0.01 && Math.abs(targetRotY - currentRotY) < 0.01;
    physicsRaf = quieto ? null : requestAnimationFrame(renderPhysics);
}

function iniciarPhysics() {
    if (!physicsRaf && !isFlatMode) physicsRaf = requestAnimationFrame(renderPhysics);
}

window.addEventListener('mousemove', (e) => {
    if (isFlatMode) return;
    const rect = tiltWrapper.getBoundingClientRect();
    const centroX = rect.left + rect.width / 2;
    const centroY = rect.top + rect.height / 2;
    targetRotY = ((e.clientX - centroX) / (rect.width / 2)) * 12;
    targetRotX = -((e.clientY - centroY) / (rect.height / 2)) * 12;
    iniciarPhysics();
});

document.body.addEventListener('mouseleave', () => { targetRotX = 0; targetRotY = 0; iniciarPhysics(); });

// --- CONFIGURAR FECHA ACTUAL AUTOMÁTICA ---
// Fecha del corte: hoy, o el día que llegue en la dirección (?fecha=AAAA-MM-DD)
function fechaCorte() {
    const f = new URLSearchParams(location.search).get('fecha');
    return (f && /^\d{4}-\d{2}-\d{2}$/.test(f)) ? new Date(f + 'T12:00:00') : new Date();
}

function establecerFechaActual() {
    const hoy = fechaCorte();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0'); 
    const anio = hoy.getFullYear();
    const fechaFormateada = `${dia}/${mes}/${anio}`;

    const fechaM5 = document.getElementById('fecha-m5');
    if (fechaM5) fechaM5.textContent = fechaFormateada;

    const fechaM6 = document.getElementById('fecha-m6');
    if (fechaM6) fechaM6.value = fechaFormateada;
    
    const fechaCaratula = document.getElementById('caratula-fecha');
    if (fechaCaratula) fechaCaratula.textContent = fechaFormateada;
}

window.addEventListener('load', establecerFechaActual);

// --- FUNCIONES DE IMPRESIÓN INDEPENDIENTES ---
function imprimirCaratula() {
    // Pasar los valores al molde
    document.getElementById('caratula-f-ini').textContent = document.getElementById('acta-f-ini').value || '0';
    document.getElementById('caratula-f-fin').textContent = document.getElementById('acta-f-fin').value || '0';
    
    // Rellenamos con ceros a la izquierda (ej. 7 -> 07)
    let hojas = document.getElementById('lbl-actas-folios').textContent || '0';
    document.getElementById('caratula-hojas').textContent = String(hojas).padStart(2, '0');
    
    let actas = document.getElementById('lbl-actas-tramites').textContent || '0';
    document.getElementById('caratula-actas').textContent = String(actas).padStart(2, '0');
    
    let canc = document.getElementById('lbl-actas-canceladas').textContent || '0';
    document.getElementById('caratula-canc').textContent = canc; // No rellenamos para que quede "0" o "1"
    
    // Activar modo de impresión de Carátula
    tituloPDF('Caratula');
    document.body.classList.add('print-mode-caratula');
    window.print();
    // Remover modo después de imprimir
    restaurarTitulo();
    setTimeout(() => { document.body.classList.remove('print-mode-caratula'); }, 500);
}

function imprimirReporte() {
    // Activar modo de impresión de Reporte Final
    tituloPDF('Reporte');
    document.body.classList.add('print-mode-reporte');
    window.print();
    // Remover modo después de imprimir
    restaurarTitulo();
    setTimeout(() => { document.body.classList.remove('print-mode-reporte'); }, 500);
}

// --- FUNCIONES PARA MODAL DE TEXTO SIMPLE ---
function abrirTextoSimple() {
    const modal = document.getElementById('modal-texto-simple');
    const contenedor = document.getElementById('contenido-texto-simple');
    
    // Función auxiliar para leer datos del Módulo 04
    const v = (id) => document.getElementById(id) ? document.getElementById(id).value || '0' : '0';

    // Generar el HTML estructurado en 3 columnas
    contenedor.innerHTML = `
        <!-- COLUMNA 1: LICENCIAS -->
        <div class="columna-simple">
            <div class="bloque-simple">
                <h4>LICENCIAS: FOLIOS</h4>
                <div class="item-s"><span>Lilas Inic 1:</span> <b>${v('m4-ini-lila')}</b></div>
                <div class="item-s"><span>Lilas Fin 1:</span> <b>${v('m4-fin-lila')}</b></div>
                <div class="item-s"><span>Lilas Inic 2:</span> <b>${v('m4-ini-lila-2')}</b></div>
                <div class="item-s"><span>Lilas Fin 2:</span> <b>${v('m4-fin-lila-2')}</b></div>
                <div class="item-s highlight"><span>Total Lilas:</span> <b>${parseInt(v('m4-tot-lila')) + parseInt(v('m4-tot-lila-2'))}</b></div>
                
                <div class="item-s" style="margin-top:6px;"><span>Verdes Inic 1:</span> <b>${v('m4-ini-verde')}</b></div>
                <div class="item-s"><span>Verdes Fin 1:</span> <b>${v('m4-fin-verde')}</b></div>
                <div class="item-s"><span>Verdes Inic 2:</span> <b>${v('m4-ini-verde-2')}</b></div>
                <div class="item-s"><span>Verdes Fin 2:</span> <b>${v('m4-fin-verde-2')}</b></div>
                <div class="item-s highlight"><span>Total Verdes:</span> <b>${parseInt(v('m4-tot-verde')) + parseInt(v('m4-tot-verde-2'))}</b></div>
            </div>
            
            <div class="bloque-simple">
                <h4>LICENCIAS: TRÁMITES</h4>
                <div class="item-s"><span>Nueva Perm:</span> <b>${v('m4-nueva-perm')}</b></div>
                <div class="item-s"><span>Dig. Lilas:</span> <b>${v('m4-digitales')}</b></div>
                <div class="item-s"><span>Dig. Verdes:</span> <b>${v('m4-digitales-verde')}</b></div>
                <div class="item-s"><span>Nuevas:</span> <b>${v('m4-nuevas')}</b></div>
                <div class="item-s"><span>Renovaciones:</span> <b>${v('m4-renovaciones')}</b></div>
                <div class="item-s"><span>Rep. Perm:</span> <b>${v('m4-rep-perm')}</b></div>
                <div class="item-s"><span>Rep. 3 Años:</span> <b>${v('m4-rep-3')}</b></div>
                <div class="item-s"><span>Permisos:</span> <b>${v('m4-permisos')}</b></div>
                <div class="item-s"><span>Rep. Permiso:</span> <b>${v('m4-rep-permiso')}</b></div>
                <div class="item-s"><span>Rep. Nva Perm:</span> <b>${v('m4-rep-nueva-perm')}</b></div>
                <div class="item-s highlight" style="margin-top:6px; border-top:1px solid #ccc;"><span>TOTAL LIC+CANC:</span> <b>${v('m4-tot-lic-canc')}</b></div>
            </div>
        </div>

        <!-- COLUMNA 2: REGISTRO CIVIL Y AFLUENCIA -->
        <div class="columna-simple">
            <div class="bloque-simple">
                <h4>REGISTRO CIVIL</h4>
                <div class="item-s"><span>Actas Ini 1:</span> <b>${v('m4-acta-ini-1')}</b></div>
                <div class="item-s"><span>Actas Fin 1:</span> <b>${v('m4-acta-fin-1')}</b></div>
                <div class="item-s highlight"><span>Total Actas 1:</span> <b>${v('m4-acta-tot-1')}</b></div>
                
                <div class="item-s" style="margin-top:6px;"><span>Actas Ini 2:</span> <b>${v('m4-acta-ini-2')}</b></div>
                <div class="item-s"><span>Actas Fin 2:</span> <b>${v('m4-acta-fin-2')}</b></div>
                <div class="item-s highlight"><span>Total Actas 2:</span> <b>${v('m4-acta-tot-2')}</b></div>
                
                <div class="item-s" style="margin-top:6px;"><span>Nacimiento:</span> <b>${v('m4-nac')}</b></div>
                <div class="item-s"><span>Matrimonio:</span> <b>${v('m4-mat')}</b></div>
                <div class="item-s"><span>Defunción:</span> <b>${v('m4-def')}</b></div>
                <div class="item-s"><span>Lilas Canceladas:</span> <b>${v('m4-lilas-canc-2')}</b></div>
                <div class="item-s"><span>Folios lilas canc.:</span> <b>${document.getElementById('m4-lilas-canc-folios').value || '—'}</b></div>
                <div class="item-s"><span>Verdes Canceladas:</span> <b>${v('m4-verdes-canc-2')}</b></div>
                <div class="item-s"><span>Folios verdes canc.:</span> <b>${document.getElementById('m4-verdes-canc-folios').value || '—'}</b></div>
                <div class="item-s highlight"><span>Papel Valorado Cancelado:</span> <b>${v('m4-papel-val-canc')}</b></div>
            </div>

            <div class="bloque-simple">
                <h4>AFLUENCIA GLOBAL</h4>
                <div class="item-s"><span>Hombres:</span> <b>${v('m4-tot-h')}</b></div>
                <div class="item-s"><span>Mujeres:</span> <b>${v('m4-tot-m')}</b></div>
                <div class="item-s highlight" style="margin-top:6px;"><span>TOTAL PERSONAS:</span> <b>${v('m4-tot-personas')}</b></div>
            </div>
        </div>

        <!-- COLUMNA 3: REPORTE MENSUAL -->
        <div class="columna-simple">
            <div class="bloque-simple" style="height: 100%;">
                <h4>REPORTE MENSUAL</h4>
                <div class="item-s"><span>Afluencia:</span> <b>${v('m4-rm-afluencia')}</b></div>
                <div class="item-s"><span>FUT Tenencia:</span> <b>${v('m4-rm-tenencia')}</b></div>
                <div class="item-s"><span>FUT Predial:</span> <b>${v('m4-rm-predial')}</b></div>
                <div class="item-s"><span>Otros FUTs:</span> <b>${v('m4-rm-otros')}</b></div>
                <div class="item-s"><span>Tipo A/P:</span> <b>${v('m4-rm-tipo-ap')}</b></div>
                <div class="item-s" style="margin-top:6px;"><span>Nueva Perm:</span> <b>${v('m4-rm-nueva-perm')}</b></div>
                <div class="item-s"><span>Rep. Nva Perm:</span> <b>${v('m4-rm-rep-nueva-perm')}</b></div>
                <div class="item-s"><span>Lic. Emitidas:</span> <b>${v('m4-rm-lic-emitidas')}</b></div>
                <div class="item-s"><span>Imp. Lic Dig:</span> <b>${v('m4-rm-imp-lic-dig')}</b></div>
                <div class="item-s"><span>Dig. Nva Perm:</span> <b>${v('m4-rm-imp-lic-dig-np')}</b></div>
                <div class="item-s" style="margin-top:6px;"><span>Certificaciones:</span> <b>${v('m4-rm-certificaciones')}</b></div>
                <div class="item-s"><span>Const. Adeudo:</span> <b>${v('m4-rm-const-adeudos')}</b></div>
                <div class="item-s"><span>Const. No Inhab:</span> <b>${v('m4-rm-no-inhab')}</b></div>
                <div class="item-s"><span>Impresion Copias Cert:</span> <b>${v('m4-rm-copias-cert')}</b></div>
                <div class="item-s highlight" style="margin-top:12px; border-top:2px solid #000; padding-top:6px;">
                    <span>TOTAL TRÁMITES:</span> <b style="font-size:0.9rem;">${v('m4-rm-tot-tramites')}</b>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

function cerrarTextoSimple() {
    document.getElementById('modal-texto-simple').style.display = 'none';
}

// --- FUNCIONES DE AYUDA (HELPERS) ---
const getSafeIntM7 = (id) => {
    const el = document.getElementById(id);
    return el ? (parseInt(el.value) || 0) : 0;
};

const setSafeTextM7 = (id, val) => {
    const el = document.getElementById(id);
    if(el) el.textContent = val;
};

// --- LÓGICA DE CÁLCULO DE FOLIOS ---
const calcFoliosRango = (iniId, finId) => {
    const ini = getSafeIntM7(iniId);
    const fin = getSafeIntM7(finId);
    if (ini > 0 && fin >= ini) {
        return { total: (fin - ini + 1), rango: `${ini} - ${fin}` };
    }
    return { total: 0, rango: '-' };
};

// --- FUNCIÓN PRINCIPAL MÓDULO 7 ---
function actualizarReporteDiario() {
    // 1. Inyección de Fecha Actual y Turnos
    const hoy = fechaCorte();
    const fechaFormateada = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
    setSafeTextM7('m7-fecha', fechaFormateada);

    // Obtener "Turnos" (Total Personas) del Módulo 04
    const turnosTotal = document.getElementById('m4-turnos-val') ? document.getElementById('m4-turnos-val').value : '0';
    setSafeTextM7('m7-turnos', turnosTotal);

    // 2. Sección de Micas (Licencias)
    const lilas1 = calcFoliosRango('f-ini-lila', 'f-fin-lila');
    const lilas2 = calcFoliosRango('f-ini-lila-2', 'f-fin-lila-2');
    const totalLilas = lilas1.total + lilas2.total;
    
    let rangoLilas = lilas1.rango !== '-' ? lilas1.rango : (lilas2.rango !== '-' ? lilas2.rango : '-');
    if (lilas1.rango !== '-' && lilas2.rango !== '-') rangoLilas = `${lilas1.rango} / ${lilas2.rango}`;
    
    setSafeTextM7('m7-tot-lilas', totalLilas);
    setSafeTextM7('m7-rango-lilas', rangoLilas);

    const verdes1 = calcFoliosRango('f-ini-verde', 'f-fin-verde');
    const verdes2 = calcFoliosRango('f-ini-verde-2', 'f-fin-verde-2');
    const totalVerdes = verdes1.total + verdes2.total;
    
    let rangoVerdes = verdes1.rango !== '-' ? verdes1.rango : (verdes2.rango !== '-' ? verdes2.rango : '-');
    if (verdes1.rango !== '-' && verdes2.rango !== '-') rangoVerdes = `${verdes1.rango} / ${verdes2.rango}`;
    
    setSafeTextM7('m7-tot-verdes', totalVerdes);
    setSafeTextM7('m7-rango-verdes', rangoVerdes);

    // 3. Sección de Actas (Registro Civil)
    // Extraer rangos de actas
    const actas1 = calcFoliosRango('acta-f-ini', 'acta-f-fin');
    const actas2 = calcFoliosRango('acta-f-ini-2', 'acta-f-fin-2');
    let rangoActas = actas1.rango !== '-' ? actas1.rango : (actas2.rango !== '-' ? actas2.rango : '-');
    if (actas1.rango !== '-' && actas2.rango !== '-') rangoActas = `${actas1.rango} / ${actas2.rango}`;
    setSafeTextM7('m7-rango-actas', rangoActas);

    const nac = getSafeIntM7('m2-nac');
    const mat = getSafeIntM7('m2-mat');
    const def = getSafeIntM7('m2-def');
    const papelCanc = getSafeIntM7('m4-papel-val-canc'); // Se extrae directo de M4
    
    setSafeTextM7('m7-acta-nac', nac);
    setSafeTextM7('m7-acta-mat', mat);
    setSafeTextM7('m7-acta-def', def);
    setSafeTextM7('m7-papel-val-canc', papelCanc);
    setSafeTextM7('m7-acta-tot', nac + mat + def);

    // 4. Sección de Trámites de Licencias
    const rp = getSafeIntM7('m1-rep-perm');
    const rnp = getSafeIntM7('m1-rep-nueva-perm');
    const r3 = getSafeIntM7('m1-rep-3');
    const rpe = getSafeIntM7('m1-rep-permiso');
    const na = getSafeIntM7('m1-nuevas');
    const np = getSafeIntM7('m1-nueva-perm');
    const ra = getSafeIntM7('m1-renovaciones');
    const p = getSafeIntM7('m1-permisos');
    
    // Digitales extraídas de ambos renglones de captura 
    const dig = getSafeIntM7('m1-digitales-lila') + getSafeIntM7('m1-digitales-verde');

    setSafeTextM7('m7-tram-rp', rp);
    setSafeTextM7('m7-tram-rnp', rnp);
    setSafeTextM7('m7-tram-r3', r3);
    setSafeTextM7('m7-tram-rpe', rpe);
    setSafeTextM7('m7-tram-na', na);
    setSafeTextM7('m7-tram-np', np);
    setSafeTextM7('m7-tram-ra', ra);
    setSafeTextM7('m7-tram-p', p);
    setSafeTextM7('m7-tram-dig', dig);
    
    const totEmitidas = rp + rnp + r3 + rpe + na + np + ra + p + dig;
    setSafeTextM7('m7-tram-tot', totEmitidas);

    // 5. Alertas Dinámicas (Cancelaciones)
    const cancLilas = getSafeIntM7('m1-lilas-canc');
    const cancVerdes = getSafeIntM7('m1-verdes-canc');
    const cancActas = getSafeIntM7('m2-canc');

    const alertasBox = document.getElementById('m7-alertas');
    if (cancLilas > 0 || cancVerdes > 0 || cancActas > 0) {
        alertasBox.style.display = 'block';
        
        document.getElementById('row-canc-lilas').style.display = cancLilas > 0 ? 'flex' : 'none';
        const fl = (document.getElementById('m1-lilas-canc-folios') || {}).value || '';
        setSafeTextM7('m7-canc-lilas', fl ? `${cancLilas} · ${fl}` : cancLilas);

        document.getElementById('row-canc-verdes').style.display = cancVerdes > 0 ? 'flex' : 'none';
        const fv = (document.getElementById('m1-verdes-canc-folios') || {}).value || '';
        setSafeTextM7('m7-canc-verdes', fv ? `${cancVerdes} · ${fv}` : cancVerdes);

        document.getElementById('row-canc-actas').style.display = cancActas > 0 ? 'flex' : 'none';
        setSafeTextM7('m7-canc-actas', cancActas);
    } else {
        alertasBox.style.display = 'none';
    }
}

// Sincronización en tiempo real
document.addEventListener('input', actualizarReporteDiario);
window.addEventListener('load', actualizarReporteDiario);

// --- GRÁFICA 3D DE BARRAS AGRUPADAS: HOMBRES / MUJERES POR HORA (MÓDULO 01) ---
const SVG_NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs, parent) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
}

// Estado persistente de las barras (permite animar el crecimiento entre capturas)
let barrasGraf = [];
let animGrafId = null;

function renderGraficaAfluencia() {
    const gBars = document.getElementById('g-bars');
    const gGrid = document.getElementById('g-grid');
    if (!gBars || !gGrid) return;

    const hs = Array.from(document.querySelectorAll('.m1-aflu-h')).map(i => parseInt(i.value) || 0);
    const ms = Array.from(document.querySelectorAll('.m1-aflu-m')).map(i => parseInt(i.value) || 0);
    const horas = Array.from(document.querySelectorAll('#hoja-0 .caja-hora .hora-label')).map(e => e.textContent);
    const n = horas.length;

    // Totales junto a la leyenda
    const sumH = hs.reduce((a, b) => a + b, 0), sumM = ms.reduce((a, b) => a + b, 0);
    const elTH = document.getElementById('aflu-tot-h'), elTM = document.getElementById('aflu-tot-m');
    if (elTH) elTH.textContent = sumH;
    if (elTM) elTM.textContent = sumM;

    const L = 38, R = 890, B = 165, T = 22;
    const DX = 6, DY = 4; // profundidad 3D
    const maxVal = Math.max(1, ...hs, ...ms);
    const paso = Math.max(1, Math.ceil(maxVal / 4));
    const escala = (B - T) / (paso * 4);

    const gw = (R - L) / n;
    const bw = Math.min(20, gw * 0.3), gap = 3;
    const total = bw * 2 + gap;

    // --- Piso 3D, cuadrícula, eje Y, horas y sombras (se redibuja; es liviano) ---
    gGrid.innerHTML = '';
    svgEl('polygon', { class: 'g-floor-top', points: `${L},${B} ${R},${B} ${R + DX + 4},${B - DY - 2} ${L + DX + 4},${B - DY - 2}` }, gGrid);
    for (let k = 0; k <= 4; k++) {
        const y = B - k * paso * escala;
        svgEl('line', { class: k === 0 ? 'g-gridline g-base' : 'g-gridline', x1: L, x2: R + DX, y1: y - (k === 0 ? 0 : 0), y2: y }, gGrid);
        const t = svgEl('text', { class: 'g-axis-txt', x: L - 8, y: y + 4, 'text-anchor': 'end' }, gGrid);
        t.textContent = k * paso;
    }
    svgEl('rect', { class: 'g-floor-front', x: L, y: B, width: R - L, height: 5, rx: 1.5 }, gGrid);
    for (let i = 0; i < n; i++) {
        const x0 = L + i * gw + (gw - total) / 2;
        const lbl = svgEl('text', { class: 'g-hora-txt', x: L + i * gw + gw / 2, y: B + 22, 'text-anchor': 'middle' }, gGrid);
        lbl.textContent = horas[i];
        [x0, x0 + bw + gap].forEach(x => svgEl('ellipse', { class: 'g-shadow', cx: x + bw / 2 + DX / 2, cy: B - 1, rx: bw * 0.8, ry: 2.6 }, gGrid));
    }

    // --- Barras: se crean una sola vez y luego solo se animan ---
    if (barrasGraf.length !== n * 2) {
        gBars.innerHTML = '';
        barrasGraf = [];
        for (let i = 0; i < n; i++) {
            const x0 = L + i * gw + (gw - total) / 2;
            [['Hombres', x0, 'h'], ['Mujeres', x0 + bw + gap, 'm']].forEach(([tipo, x, k]) => {
                const g = svgEl('g', { class: 'bar-g' }, gBars);
                const front = svgEl('rect', { class: 'b-front', x: x, width: bw, fill: `url(#gr-${k})` }, g);
                const top = svgEl('polygon', { class: 'b-top', fill: k === 'h' ? 'var(--color-blue)' : 'var(--color-warm)' }, g);
                const side = svgEl('polygon', { class: 'b-side', fill: k === 'h' ? 'var(--color-blue)' : 'var(--color-warm)' }, g);
                barrasGraf.push({ g, front, top, side, x, cur: 2 });
            });
        }
    }

    const geom = (b, h) => {
        const y = B - h, x = b.x;
        b.front.setAttribute('y', y); b.front.setAttribute('height', h);
        b.top.setAttribute('points', `${x},${y} ${x + DX},${y - DY} ${x + bw + DX},${y - DY} ${x + bw},${y}`);
        b.side.setAttribute('points', `${x + bw},${y} ${x + bw + DX},${y - DY} ${x + bw + DX},${B - DY} ${x + bw},${B}`);
        b.cur = h;
    };

    // Destinos y textos del tooltip (incluye el total de la hora)
    const destinos = barrasGraf.map((b, idx) => {
        const i = Math.floor(idx / 2), esH = idx % 2 === 0;
        const val = esH ? hs[i] : ms[i];
        const h = Math.max(val * escala, 2); // mínimo 2px para poder pasar el mouse con valor 0
        b.g.setAttribute('data-txt', `${horas[i]} · ${esH ? 'Hombres' : 'Mujeres'}: ${val}  |  Total hora: ${hs[i] + ms[i]}`);
        b.g.setAttribute('data-cx', b.x + bw / 2);
        b.g.setAttribute('data-top', B - h);
        return h;
    });

    // Animación de crecimiento (ease-out) desde la altura actual hacia la nueva
    if (animGrafId) cancelAnimationFrame(animGrafId);
    const desde = barrasGraf.map(b => b.cur);
    const t0 = performance.now(), dur = 380;
    const paso_anim = (now) => {
        const p = Math.min(Math.max((now - t0) / dur, 0), 1), e = 1 - Math.pow(1 - p, 3); // sin valores negativos
        barrasGraf.forEach((b, idx) => geom(b, desde[idx] + (destinos[idx] - desde[idx]) * e));
        animGrafId = p < 1 ? requestAnimationFrame(paso_anim) : null;
    };
    animGrafId = requestAnimationFrame(paso_anim);
}

(function initTooltipGrafica() {
    const svg = document.getElementById('grafica-aflu');
    const tip = document.getElementById('g-tip');
    if (!svg || !tip) return;
    const rect = tip.querySelector('rect');
    const txt = tip.querySelector('text');

    svg.addEventListener('mouseover', (e) => {
        const g = e.target.closest('.bar-g');
        if (!g) return;
        txt.textContent = g.dataset.txt;
        txt.setAttribute('x', 8); txt.setAttribute('y', 17);
        const w = txt.getComputedTextLength() + 16, h = 24;
        rect.setAttribute('width', w); rect.setAttribute('height', h);
        let x = parseFloat(g.dataset.cx) - w / 2;
        let y = parseFloat(g.dataset.top) - h - 8;
        x = Math.min(Math.max(x, 2), 900 - w - 2);
        if (y < 2) y = 2;
        tip.setAttribute('transform', `translate(${x},${y})`);
        tip.style.opacity = 1;
    });
    svg.addEventListener('mouseout', (e) => {
        if (e.target.closest('.bar-g')) tip.style.opacity = 0;
    });
})();

document.addEventListener('input', renderGraficaAfluencia);
window.addEventListener('load', renderGraficaAfluencia);
renderGraficaAfluencia();


// --- GRÁFICA CIRCULAR 3D: LICENCIAS POR TIPO DE TRÁMITE (MÓDULO 01) ---
// Morado = Micas Lilas · Verde = Micas Verdes (las canceladas no se incluyen)
const TIPOS_PIE = [
    { id: 'm1-nueva-perm',      nombre: 'Nueva Permanente',      grupo: 'lila' },
    { id: 'm1-rep-nueva-perm',  nombre: 'Rep. Nueva Permanente', grupo: 'lila' },
    { id: 'm1-digitales-lila',  nombre: 'Digitales (Lila)',      grupo: 'lila' },
    { id: 'm1-nuevas',          nombre: 'Nuevas',                grupo: 'verde' },
    { id: 'm1-renovaciones',    nombre: 'Renovaciones',          grupo: 'verde' },
    { id: 'm1-digitales-verde', nombre: 'Digitales (Verde)',     grupo: 'verde' },
    { id: 'm1-permisos',        nombre: 'Permisos',              grupo: 'verde' },
    { id: 'm1-rep-perm',        nombre: 'Reposición Perman.',    grupo: 'verde' },
    { id: 'm1-rep-3',           nombre: 'Reposición 3 años',     grupo: 'verde' },
    { id: 'm1-rep-permiso',     nombre: 'Reposición Permiso',    grupo: 'verde' }
];

function colorTipoPie(grupo, idx) {
    // Tonos distintos dentro de cada familia para diferenciar los tipos
    return grupo === 'lila'
        ? `hsl(265, 90%, ${74 - idx * 9}%)`
        : `hsl(${158 + (idx % 2) * 6}, 78%, ${64 - idx * 5}%)`;
}

function renderGraficaPie() {
    const gS = document.getElementById('p-slices');
    const gL = document.getElementById('p-legend');
    if (!gS || !gL) return;
    gS.innerHTML = ''; gL.innerHTML = '';

    let iL = 0, iV = 0;
    const datos = TIPOS_PIE.map(t => {
        const el = document.getElementById(t.id);
        const valor = el ? (parseInt(el.value) || 0) : 0;
        const color = colorTipoPie(t.grupo, t.grupo === 'lila' ? iL++ : iV++);
        return { ...t, valor, color };
    });
    const total = datos.reduce((s, d) => s + d.valor, 0);

    const CX = 250, CY = 118, RX = 150, RY = 68, D = 26, EX = 11, TWO = Math.PI * 2;
    const P = (a) => [CX + RX * Math.cos(a), CY + RY * Math.sin(a)];

    // --- Leyenda (dos columnas: lilas / verdes) ---
    const columnas = [
        { grupo: 'lila',  titulo: 'MICAS LILAS',  x: 540, color: 'var(--color-lila)' },
        { grupo: 'verde', titulo: 'MICAS VERDES', x: 705, color: 'var(--color-verde)' }
    ];
    columnas.forEach(col => {
        const h = svgEl('text', { class: 'p-leg-head', x: col.x, y: 34, fill: col.color }, gL);
        h.textContent = col.titulo;
        datos.filter(d => d.grupo === col.grupo).forEach((d, r) => {
            const y = 56 + r * 24;
            svgEl('rect', { x: col.x, y: y - 10, width: 11, height: 11, rx: 2, fill: d.color }, gL);
            const t = svgEl('text', { class: 'p-leg-txt', x: col.x + 18, y: y }, gL);
            t.textContent = d.nombre + ' ';
            const v = svgEl('tspan', { class: 'p-leg-val' }, t);
            v.textContent = d.valor;
        });
    });
    const tt = svgEl('text', { class: 'p-leg-txt', x: 540, y: 246 }, gL);
    tt.textContent = 'Total licencias emitidas: ';
    const tv = svgEl('tspan', { class: 'p-leg-val' }, tt);
    tv.textContent = total;

    if (total === 0) {
        svgEl('ellipse', { cx: CX, cy: CY + D, rx: RX, ry: RY, fill: 'rgba(255,255,255,0.05)' }, gS);
        svgEl('ellipse', { cx: CX, cy: CY, rx: RX, ry: RY, fill: 'rgba(255,255,255,0.08)', stroke: 'rgba(255,255,255,0.15)' }, gS);
        const e = svgEl('text', { class: 'p-empty', x: CX, y: CY + 5, 'text-anchor': 'middle' }, gS);
        e.textContent = 'Sin trámites registrados';
        return;
    }

    // --- Rebanadas ---
    const activos = datos.filter(d => d.valor > 0);
    let ang = -Math.PI / 2;
    const rebanadas = activos.map(d => {
        const frac = Math.min(d.valor / total, 0.9999);
        const a0 = ang, a1 = ang + frac * TWO;
        ang += (d.valor / total) * TWO;
        return { ...d, a0, a1, mid: (a0 + a1) / 2, frac: d.valor / total };
    });
    // Pintar primero las de atrás (parte superior de la elipse)
    rebanadas.sort((a, b) => Math.sin(a.mid) - Math.sin(b.mid));

    rebanadas.forEach(s => {
        const solo = rebanadas.length === 1;
        const ox = solo ? 0 : Math.cos(s.mid) * EX;
        const oy = solo ? 0 : Math.sin(s.mid) * EX * (RY / RX);
        const hx = ox + (solo ? 0 : Math.cos(s.mid) * 7);
        const hy = oy + (solo ? -5 : Math.sin(s.mid) * 7 * (RY / RX));
        const pct = (s.frac * 100).toFixed(1).replace('.0', '');

        const g = svgEl('g', {
            class: 'pie-g',
            style: `--ox:${ox};--oy:${oy};--hx:${hx};--hy:${hy}`,
            'data-txt': `${s.nombre}: ${s.valor} (${pct}%)`,
            'data-cx': CX + hx + Math.cos(s.mid) * RX * 0.55,
            'data-top': CY + hy + Math.sin(s.mid) * RY * 0.55 - 6
        }, gS);

        const [x0, y0] = P(s.a0), [x1, y1] = P(s.a1);
        // Paredes radiales (cortes laterales)
        svgEl('polygon', { class: 'p-side', fill: s.color, points: `${CX},${CY} ${x0},${y0} ${x0},${y0 + D} ${CX},${CY + D}` }, g);
        svgEl('polygon', { class: 'p-side', fill: s.color, points: `${CX},${CY} ${x1},${y1} ${x1},${y1 + D} ${CX},${CY + D}` }, g);
        // Pared curva frontal (solo el tramo visible, parte baja de la elipse)
        for (let k = Math.floor(s.a0 / TWO) - 1; k <= Math.floor(s.a1 / TWO) + 1; k++) {
            const a = Math.max(s.a0, k * TWO), b = Math.min(s.a1, k * TWO + Math.PI);
            if (b > a) {
                const [ax, ay] = P(a), [bx, by] = P(b);
                svgEl('path', { class: 'p-side', fill: s.color,
                    d: `M${ax},${ay} A${RX},${RY} 0 0 1 ${bx},${by} L${bx},${by + D} A${RX},${RY} 0 0 0 ${ax},${ay + D} Z` }, g);
            }
        }
        // Cara superior
        const grande = (s.a1 - s.a0) > Math.PI ? 1 : 0;
        svgEl('path', { class: 'p-top', fill: s.color, d: `M${CX},${CY} L${x0},${y0} A${RX},${RY} 0 ${grande} 1 ${x1},${y1} Z` }, g);
    });
}

(function initTooltipPie() {
    const svg = document.getElementById('grafica-pie');
    const tip = document.getElementById('p-tip');
    if (!svg || !tip) return;
    const rect = tip.querySelector('rect'), txt = tip.querySelector('text');

    svg.addEventListener('mouseover', (e) => {
        const g = e.target.closest('.pie-g');
        if (!g) return;
        txt.textContent = g.dataset.txt;
        txt.setAttribute('x', 8); txt.setAttribute('y', 17);
        const w = txt.getComputedTextLength() + 16, h = 24;
        rect.setAttribute('width', w); rect.setAttribute('height', h);
        const x = Math.min(Math.max(parseFloat(g.dataset.cx) - w / 2, 2), 900 - w - 2);
        const y = Math.max(parseFloat(g.dataset.top) - h, 2);
        tip.setAttribute('transform', `translate(${x},${y})`);
        tip.style.opacity = 1;
    });
    svg.addEventListener('mouseout', (e) => {
        if (e.target.closest('.pie-g')) tip.style.opacity = 0;
    });
})();

document.addEventListener('input', renderGraficaPie);
window.addEventListener('load', renderGraficaPie);
renderGraficaPie();


// --- NOMBRE DEL PDF CON LA FECHA DEL DÍA ---
// Al imprimir, el navegador propone como nombre de archivo el título de la página.
const TITULO_ORIGINAL = document.title;

function fechaArchivo() {
    const h = fechaCorte();
    return `${String(h.getDate()).padStart(2, '0')}-${String(h.getMonth() + 1).padStart(2, '0')}-${h.getFullYear()}`;
}
function tituloPDF(prefijo) { document.title = `${prefijo}_${fechaArchivo()}`; }
function restaurarTitulo() { document.title = TITULO_ORIGINAL; }
window.addEventListener('afterprint', restaurarTitulo);

// --- MÓDULO 05: CAPTURA MANUAL ---
function toggleManualM5(ev) {
    if (ev) ev.stopPropagation();
    const inputs = document.querySelectorAll('#hoja-4 .m5-input');
    const btn = document.getElementById('btn-m5-manual');
    const txt = document.getElementById('btn-m5-manual-txt');
    const hint = document.getElementById('m5-manual-hint');
    const cont = document.getElementById('m5-excel');

    if (!m5Manual) {
        m5Manual = true;
        inputs.forEach(i => { i.dataset.ro = i.readOnly ? '1' : '0'; i.readOnly = false; });
        btn.classList.add('activo');
        cont.classList.add('m5-manual');
        txt.textContent = 'Volver a automático';
        hint.textContent = 'Modo manual: puedes escribir en cualquier casilla';
    } else {
        if (!confirm('Se descartarán los valores escritos a mano y el Módulo 05 volverá a llenarse automáticamente. ¿Continuar?')) return;
        m5Manual = false;
        inputs.forEach(i => { i.readOnly = (i.dataset.ro === '1'); });
        btn.classList.remove('activo');
        cont.classList.remove('m5-manual');
        txt.textContent = 'Captura manual';
        hint.textContent = 'Valores automáticos desde los otros módulos';
        actualizarControlGeneral();
    }
}

// En modo manual, las casillas de texto solo aceptan números
document.addEventListener('input', (e) => {
    const t = e.target;
    if (m5Manual && t.classList && t.classList.contains('m5-input') && t.type === 'text') {
        t.value = t.value.replace(/\D/g, '');
    }
});
