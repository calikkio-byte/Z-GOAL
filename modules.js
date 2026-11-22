/* ==========================================================================
   Scouting Dept — moduli: infortuni (omino), lavagna campo, privacy/GDPR, report PDF.
   Caricato dopo lo script principale di app.html: usa le sue funzioni globali.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* OMINO: zone del corpo                                              */
  /* ------------------------------------------------------------------ */
  const BODY = {
    head: { l: 'Testa', v: 'fb' }, neck: { l: 'Collo', v: 'fb' },
    chest: { l: 'Petto', v: 'f' }, upper_back: { l: 'Schiena alta', v: 'b' },
    abdomen: { l: 'Addome', v: 'f' }, lower_back: { l: 'Zona lombare', v: 'b' },
    groin: { l: 'Anca / inguine', v: 'f' }, glute: { l: 'Gluteo', s: 1, v: 'b' },
    shoulder: { l: 'Spalla', s: 1, v: 'fb' }, arm: { l: 'Braccio', s: 1, v: 'fb' },
    elbow: { l: 'Gomito', s: 1, v: 'fb' }, forearm: { l: 'Avambraccio', s: 1, v: 'fb' }, hand: { l: 'Mano', s: 1, v: 'fb' },
    thigh: { l: 'Coscia (davanti)', s: 1, v: 'f' }, hamstring: { l: 'Coscia (dietro)', s: 1, v: 'b' },
    knee: { l: 'Ginocchio', s: 1, v: 'fb' }, shin: { l: 'Tibia', s: 1, v: 'f' }, calf: { l: 'Polpaccio', s: 1, v: 'b' },
    ankle: { l: 'Caviglia', s: 1, v: 'fb' }, foot: { l: 'Piede', s: 1, v: 'fb' }
  };
  // Geometria del lato sinistro dell'immagine; l'altro lato è lo specchio.
  const GEO = {
    head: ['ellipse', 'cx="100" cy="34" rx="21" ry="25"'],
    neck: ['rect', 'x="91" y="58" width="18" height="18" rx="6"'],
    chest: ['rect', 'x="70" y="80" width="60" height="44" rx="14"'],
    upper_back: ['rect', 'x="70" y="80" width="60" height="44" rx="14"'],
    abdomen: ['rect', 'x="74" y="126" width="52" height="42" rx="12"'],
    lower_back: ['rect', 'x="74" y="126" width="52" height="42" rx="12"'],
    groin: ['rect', 'x="72" y="170" width="56" height="32" rx="12"'],
    glute: ['rect', 'x="71" y="172" width="29" height="32" rx="12"'],
    shoulder: ['ellipse', 'cx="66" cy="86" rx="19" ry="14"'],
    arm: ['rect', 'x="44" y="98" width="20" height="54" rx="9"'],
    elbow: ['ellipse', 'cx="53" cy="158" rx="11" ry="9"'],
    forearm: ['rect', 'x="41" y="166" width="19" height="52" rx="8"'],
    hand: ['ellipse', 'cx="49" cy="232" rx="10" ry="14"'],
    thigh: ['rect', 'x="72" y="206" width="27" height="78" rx="12"'],
    hamstring: ['rect', 'x="72" y="206" width="27" height="78" rx="12"'],
    knee: ['ellipse', 'cx="85" cy="292" rx="14" ry="12"'],
    shin: ['rect', 'x="73" y="306" width="24" height="68" rx="10"'],
    calf: ['rect', 'x="73" y="306" width="24" height="68" rx="10"'],
    ankle: ['ellipse', 'cx="84" cy="382" rx="9" ry="7"'],
    foot: ['ellipse', 'cx="80" cy="402" rx="15" ry="8"']
  };
  const ORDER = ['neck', 'head', 'chest', 'upper_back', 'abdomen', 'lower_back', 'groin', 'glute', 'shoulder', 'arm', 'elbow', 'forearm', 'hand', 'thigh', 'hamstring', 'knee', 'shin', 'calf', 'ankle', 'foot'];
  const SEV = { lieve: '#F5C542', moderato: '#F08A24', grave: '#E5484D' };
  const SEV_RANK = { lieve: 1, moderato: 2, grave: 3 };
  const INJ_TYPES = ['Muscolare', 'Articolare', 'Osseo', 'Contusione', 'Tendine', 'Altro'];

  function zoneLabel(key) {
    const m = String(key).match(/^(.*)_(dx|sx)$/), base = m ? m[1] : key, z = BODY[base];
    return z ? z.l + (m ? ' (' + m[2] + ')' : '') : key;
  }

  function bodyFigure(view, injs, o) {
    o = o || {};
    const worst = {};
    (injs || []).forEach(i => {
      const c = worst[i.zone];
      if (!c || SEV_RANK[i.severity] > SEV_RANK[c.severity] || (SEV_RANK[i.severity] === SEV_RANK[c.severity] && i.status === 'in_corso')) worst[i.zone] = i;
    });
    const leftSide = view === 'f' ? 'dx' : 'sx', rightSide = view === 'f' ? 'sx' : 'dx';
    const one = (base, key, mirror) => {
      const g = GEO[base], inj = worst[key], sel = o.sel === key;
      const fill = inj ? SEV[inj.severity] : (o.interactive ? '#DCE6EC' : '#E3EAEF');
      const op = inj ? (inj.status === 'pregresso' ? 0.55 : 0.96) : 1;
      return `<${g[0]} ${g[1]} class="bz${o.interactive ? ' bz-i' : ''}" data-zone="${key}" fill="${fill}" fill-opacity="${op}" stroke="${sel ? '#0B8A5C' : '#fff'}" stroke-width="${sel ? 3 : 1.6}"${mirror ? ' transform="translate(200,0) scale(-1,1)"' : ''}><title>${esc(zoneLabel(key))}</title></${g[0]}>`;
    };
    let body = '';
    ORDER.forEach(base => {
      const z = BODY[base];
      if (z.v.indexOf(view) < 0) return;
      if (z.s) body += one(base, base + '_' + leftSide, false) + one(base, base + '_' + rightSide, true);
      else body += one(base, base, false);
    });
    const w = o.w || 150;
    return `<svg viewBox="0 0 200 430" style="width:${w}px;max-width:100%;height:auto" role="img" aria-label="${view === 'f' ? 'Corpo, vista frontale' : 'Corpo, vista posteriore'}">${body}<text x="100" y="427" text-anchor="middle" font-size="11" font-weight="700" letter-spacing="1" fill="#5B6B7A">${view === 'f' ? 'FRONTE' : 'RETRO'}</text></svg>`;
  }
  function bodyPair(injs, o) { return bodyFigure('f', injs, o) + bodyFigure('b', injs, o); }
  function sevLegend() {
    return Object.keys(SEV).map(k => `<span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;color:#5B6B7A;margin-right:10px"><i style="width:10px;height:10px;border-radius:50%;background:${SEV[k]};display:inline-block"></i>${k}</span>`).join('') +
      '<span style="font-size:11px;color:#5B6B7A;white-space:nowrap">· chiaro = pregresso</span>';
  }

  /* ------------------------------------------------------------------ */
  /* OMINO: editor interattivo                                          */
  /* ------------------------------------------------------------------ */
  const injEditors = {};
  function InjuryEditor(prefix, el, cfg) {
    this.prefix = prefix; this.el = el; this.cfg = cfg; this.sel = null; this.drafts = cfg.drafts || [];
    injEditors[prefix] = this;
    const self = this;
    el.onclick = function (e) {
      const z = e.target.closest && e.target.closest('[data-zone]');
      if (z && self.cfg.canEdit) { self.sel = self.sel === z.dataset.zone ? null : z.dataset.zone; self.render(); }
    };
    this.render();
  }
  InjuryEditor.prototype.existing = function () { return (window.dbInjuries || dbInjuries || []).filter(i => i.player_id === this.cfg.playerId); };
  InjuryEditor.prototype.all = function () { return this.existing().concat(this.drafts); };
  InjuryEditor.prototype.canRemove = function (i) { return i.reported_by === currentUser.id || currentUser.role === 'admin' || currentUser.role === 'player'; };
  InjuryEditor.prototype.render = function () {
    const c = this.cfg, all = this.all(), pf = this.prefix;
    const blocked = c.blocked ? `<div class="p-3 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-900"><i class="fa-solid fa-lock mr-1.5"></i>${esc(c.blocked)}</div>` : '';
    const form = this.sel && c.canEdit ? `
      <div class="p-3 rounded-md border border-line bg-white/60 space-y-2">
        <div class="text-xs font-bold text-ink"><i class="fa-solid fa-location-crosshairs text-accent mr-1.5"></i>${esc(zoneLabel(this.sel))}</div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select id="${pf}-inj-type" class="min-h-[38px] px-2 text-xs rounded-md">${INJ_TYPES.map(t => `<option>${t}</option>`).join('')}</select>
          <select id="${pf}-inj-sev" class="min-h-[38px] px-2 text-xs rounded-md"><option value="lieve">Lieve</option><option value="moderato">Moderato</option><option value="grave">Grave</option></select>
          <select id="${pf}-inj-status" class="min-h-[38px] px-2 text-xs rounded-md"><option value="in_corso">In corso</option><option value="pregresso">Pregresso</option></select>
          <input type="date" id="${pf}-inj-date" value="${todayISO()}" class="min-h-[38px] px-2 text-xs rounded-md">
        </div>
        <input id="${pf}-inj-notes" maxlength="500" placeholder="Note (facoltative)" class="w-full min-h-[38px] px-3 text-xs rounded-md">
        <div class="flex gap-2"><button type="button" onclick="InjEd('${pf}').add()" class="min-h-[38px] px-4 rounded-md bg-accent text-white text-xs font-semibold">Aggiungi infortunio</button><button type="button" onclick="InjEd('${pf}').cancel()" class="min-h-[38px] px-3 rounded-md text-xs text-muted">Annulla</button></div>
      </div>` : (c.canEdit ? '<p class="text-xs text-muted text-center">Tocca una zona del corpo per segnalare un infortunio.</p>' : '');
    const list = all.length ? all.map(i => {
      const draft = this.drafts.indexOf(i) >= 0;
      return `<div class="flex items-start gap-2.5 p-2.5 rounded-md bg-white/60 border border-line text-xs">
        <i style="width:10px;height:10px;border-radius:50%;background:${SEV[i.severity]};margin-top:4px;flex:0 0 auto;opacity:${i.status === 'pregresso' ? .55 : 1}"></i>
        <div class="flex-1 min-w-0"><div class="font-semibold text-ink">${esc(zoneLabel(i.zone))} <span class="font-normal text-muted">· ${esc(i.injury_type)} · ${esc(i.severity)} · ${i.status === 'pregresso' ? 'pregresso' : 'in corso'}${draft ? ' · <em>da salvare con la valutazione</em>' : ''}</span></div>
        <div class="text-muted">${i.injury_date ? formatDateIT(i.injury_date) + ' · ' : ''}${esc(i.reported_by_name || '')}${i.notes ? ' — ' + esc(i.notes) : ''}</div></div>
        ${c.canEdit && (draft || this.canRemove(i)) ? `${!draft && i.status === 'in_corso' ? `<button type="button" title="Segna come pregresso" onclick="InjEd('${pf}').setPast(${jsq(i.id)})" class="px-2 min-h-[30px] rounded text-[11px] text-muted hover:bg-canvas">Guarito</button>` : ''}<button type="button" title="Elimina" onclick="InjEd('${pf}').remove(${jsq(i.id)})" class="w-8 min-h-[30px] rounded text-muted hover:bg-canvas"><i class="fa-solid fa-trash-can"></i></button>` : ''}
      </div>`;
    }).join('') : '<p class="text-xs text-muted text-center">Nessun infortunio segnalato.</p>';
    this.el.innerHTML = `<div class="space-y-3">${blocked}
      <div class="flex justify-center gap-3 flex-wrap p-3 rounded-2xl bg-white/40 border border-line">${bodyFigure('f', all, { interactive: !!c.canEdit, sel: this.sel, w: 138 })}${bodyFigure('b', all, { interactive: !!c.canEdit, sel: this.sel, w: 138 })}</div>
      <div class="text-center">${sevLegend()}</div>${form}<div class="space-y-1.5">${list}</div></div>`;
  };
  InjuryEditor.prototype.cancel = function () { this.sel = null; this.render(); };
  InjuryEditor.prototype.add = async function () {
    const pf = this.prefix, v = id => document.getElementById(pf + '-' + id);
    if (!this.sel) return;
    const rec = {
      id: newId('inj'), player_id: this.cfg.playerId, observation_id: null, zone: this.sel,
      injury_type: v('inj-type').value, severity: v('inj-sev').value, status: v('inj-status').value,
      injury_date: v('inj-date').value || null, notes: v('inj-notes').value.trim() || null,
      reported_by: currentUser.id, reported_by_name: currentUser.full_name, reported_by_role: currentUser.role
    };
    if (this.cfg.immediate) {
      const { error } = await sb.from('injuries').insert(rec);
      if (error) return showToast(error.message, 'error');
      dbInjuries.unshift(rec); showToast('Infortunio registrato.', 'success');
    } else this.drafts.push(rec);
    this.sel = null; this.render();
  };
  InjuryEditor.prototype.remove = async function (id) {
    const di = this.drafts.findIndex(d => d.id === id);
    if (di >= 0) { this.drafts.splice(di, 1); return this.render(); }
    const { error } = await sb.from('injuries').delete().eq('id', id);
    if (error) return showToast(error.message, 'error');
    dbInjuries = dbInjuries.filter(i => i.id !== id); this.render();
  };
  InjuryEditor.prototype.setPast = async function (id) {
    const { error } = await sb.from('injuries').update({ status: 'pregresso' }).eq('id', id);
    if (error) return showToast(error.message, 'error');
    const r = dbInjuries.find(i => i.id === id); if (r) r.status = 'pregresso'; this.render();
  };
  window.InjEd = function (pf) { return injEditors[pf]; };

  // Valutazione scout
  let evalInj = null, evalPitch = null;
  window.initEvalExtras = function (p) {
    evalPitch = new PitchEditor('ev', document.getElementById('ev-pitch'));
    const ok = !!p.health_consent;
    evalInj = new InjuryEditor('ev', document.getElementById('ev-inj'), {
      playerId: p.id, canEdit: ok, immediate: false, drafts: [],
      blocked: ok ? null : 'Per questo atleta non è stato prestato il consenso ai dati sulla salute: gli infortuni non possono essere registrati.'
    });
  };
  window.getEvalHeat = function () { return evalPitch ? evalPitch.getHeat() : null; };
  window.saveInjuryDrafts = async function (obsId) {
    if (!evalInj || !evalInj.drafts.length) return;
    const recs = evalInj.drafts.map(d => Object.assign({}, d, { observation_id: obsId }));
    const { error } = await sb.from('injuries').insert(recs);
    if (error) return showToast('Valutazione salvata, ma gli infortuni no: ' + error.message, 'error');
    dbInjuries = recs.concat(dbInjuries); evalInj.drafts = [];
  };
  // Dashboard atleta
  window.mountPlayerInjuries = function () {
    const el = document.getElementById('pp-inj'); if (!el) return;
    const p = getMyPlayerRecord();
    if (!p) { el.innerHTML = '<p class="text-xs text-muted">Salva prima la scheda per poter segnalare infortuni.</p>'; return; }
    const ok = !!p.health_consent;
    new InjuryEditor('pp', el, {
      playerId: p.id, canEdit: ok, immediate: true,
      blocked: ok ? null : 'Per segnalare infortuni spunta il consenso ai dati sulla salute qui sopra e salva la scheda.'
    });
  };

  /* ------------------------------------------------------------------ */
  /* LAVAGNA: campo da calcio                                            */
  /* ------------------------------------------------------------------ */
  const COLS = 12, ROWS = 8, PW = 600, PH = 390, FX = 10, FY = 10, FW = 580, FH = 370;
  const CW = FW / COLS, CH = FH / ROWS;
  const heatColor = L => (L <= 1.5 ? '#FFD23F' : L <= 2.5 ? '#FF8A3D' : '#E5484D');
  const heatOp = L => Math.min(0.88, 0.28 + 0.2 * L);

  function pitchLines(stroke) {
    return `<g fill="none" stroke="${stroke}" stroke-width="2.4" style="pointer-events:none">
      <rect x="${FX}" y="${FY}" width="${FW}" height="${FH}" rx="4"/><line x1="300" y1="${FY}" x2="300" y2="${FY + FH}"/>
      <circle cx="300" cy="195" r="48"/><rect x="${FX}" y="105" width="92" height="180"/><rect x="${FX}" y="152" width="34" height="86"/>
      <rect x="${FX + FW - 92}" y="105" width="92" height="180"/><rect x="${FX + FW - 34}" y="152" width="34" height="86"/>
      <path d="M102 165 A40 40 0 0 1 102 225"/><path d="M498 165 A40 40 0 0 0 498 225"/>
      <circle cx="300" cy="195" r="3" fill="${stroke}"/><circle cx="68" cy="195" r="2.5" fill="${stroke}"/><circle cx="532" cy="195" r="2.5" fill="${stroke}"/></g>`;
  }
  function pitchBase(o) {
    const stripes = Array.from({ length: 10 }, (_, i) => `<rect x="${FX + i * 58}" y="${FY}" width="58" height="${FH}" fill="${i % 2 ? '#B7E2C8' : '#C4E9D2'}"/>`).join('');
    return `<rect width="${PW}" height="${PH}" rx="14" fill="#A9DABD"/>${stripes}`;
  }
  function pitchSvg(cells, o) {
    o = o || {};
    let heat = '';
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
      const L = cells ? Number(cells[c + ',' + r]) || 0 : 0;
      if (!o.interactive && L < 0.2) continue;
      heat += `<rect class="pc" data-k="${c},${r}" x="${(FX + c * CW).toFixed(1)}" y="${(FY + r * CH).toFixed(1)}" width="${CW.toFixed(1)}" height="${CH.toFixed(1)}" fill="${L ? heatColor(L) : 'transparent'}" fill-opacity="${L ? heatOp(L) : 0}"/>`;
    }
    const grid = o.interactive ? `<g stroke="rgba(255,255,255,.28)" stroke-width="1" style="pointer-events:none">${Array.from({ length: COLS - 1 }, (_, i) => `<line x1="${FX + (i + 1) * CW}" y1="${FY}" x2="${FX + (i + 1) * CW}" y2="${FY + FH}"/>`).join('')}${Array.from({ length: ROWS - 1 }, (_, i) => `<line x1="${FX}" y1="${FY + (i + 1) * CH}" x2="${FX + FW}" y2="${FY + (i + 1) * CH}"/>`).join('')}</g>` : '';
    const arrow = `<g style="pointer-events:none" fill="#2E6B4F" fill-opacity=".85"><path d="M236 370 H350 M338 362 L352 370 L338 378" stroke="#2E6B4F" stroke-opacity=".85" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="300" y="357" text-anchor="middle" font-size="11" font-weight="700" letter-spacing="1">ATTACCO</text></g>`;
    return `<svg ${o.id ? `id="${o.id}"` : ''} viewBox="0 0 ${PW} ${PH}" style="width:${o.w ? o.w + 'px' : '100%'};max-width:100%;height:auto;display:block;${o.interactive ? 'touch-action:none;cursor:crosshair;' : ''}" role="img" aria-label="Lavagna del campo con le zone di presenza del giocatore">${pitchBase()}${heat}${grid}${pitchLines('rgba(255,255,255,.95)')}${arrow}</svg>`;
  }
  function heatMapOf(o) {
    const h = o && o.pitch_heatmap; if (!h || !Array.isArray(h.cells)) return null;
    const m = {}; h.cells.forEach(t => { const c = +t[0], r = +t[1], l = +t[2]; if (c >= 0 && c < COLS && r >= 0 && r < ROWS && l >= 1 && l <= 3) m[c + ',' + r] = l; });
    return Object.keys(m).length ? m : null;
  }
  function aggregateHeat(list) {
    const maps = list.map(heatMapOf).filter(Boolean); if (!maps.length) return null;
    const agg = {}; maps.forEach(m => Object.keys(m).forEach(k => { agg[k] = (agg[k] || 0) + m[k]; }));
    Object.keys(agg).forEach(k => { agg[k] /= maps.length; }); return agg;
  }
  function heatLegend() {
    return [['#FFD23F', 'presenza leggera'], ['#FF8A3D', 'media'], ['#E5484D', 'alta']].map(a => `<span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;color:#5B6B7A;margin-right:10px"><i style="width:10px;height:10px;border-radius:3px;background:${a[0]};display:inline-block"></i>${a[1]}</span>`).join('');
  }

  function PitchEditor(prefix, el) {
    const self = this; this.cells = {}; this.brush = 2; this.down = false; this.el = el;
    el.innerHTML = `<div class="space-y-2">
      <div class="flex flex-wrap items-center gap-1.5" id="${prefix}-brushes">
        ${[[1, 'Leggera', '#FFD23F'], [2, 'Media', '#FF8A3D'], [3, 'Alta', '#E5484D'], [0, 'Gomma', '#fff']].map(b => `<button type="button" data-b="${b[0]}" class="pb min-h-[34px] px-3 rounded-full text-xs font-semibold border border-line bg-white/70 flex items-center gap-1.5"><i style="width:10px;height:10px;border-radius:3px;background:${b[2]};border:1px solid rgba(16,32,47,.2);display:inline-block"></i>${b[1]}</button>`).join('')}
        <button type="button" data-clear="1" class="min-h-[34px] px-3 rounded-full text-xs text-muted ml-auto">Pulisci</button>
      </div>
      <div id="${prefix}-pitch-host"></div>
      <p class="text-[11px] text-muted">Tocca o trascina sul campo per colorare le zone in cui il giocatore è stato più presente.</p></div>`;
    const host = el.querySelector('#' + prefix + '-pitch-host');
    host.innerHTML = pitchSvg(null, { interactive: true });
    this.svg = host.querySelector('svg');
    const mark = () => el.querySelectorAll('.pb').forEach(b => { const on = +b.dataset.b === self.brush; b.style.background = on ? '#fff' : 'rgba(255,255,255,.55)'; b.style.boxShadow = on ? '0 0 0 2px #0B8A5C' : 'none'; });
    mark();
    el.querySelector('#' + prefix + '-brushes').onclick = function (e) {
      const b = e.target.closest('.pb'); if (b) { self.brush = +b.dataset.b; mark(); return; }
      if (e.target.closest('[data-clear]')) { self.cells = {}; self.svg.querySelectorAll('.pc').forEach(r => { r.setAttribute('fill', 'transparent'); r.setAttribute('fill-opacity', 0); }); }
    };
    const paint = e => {
      const rc = self.svg.getBoundingClientRect(); if (!rc.width) return;
      const x = (e.clientX - rc.left) / rc.width * PW, y = (e.clientY - rc.top) / rc.height * PH;
      const c = Math.floor((x - FX) / CW), r = Math.floor((y - FY) / CH);
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;
      const k = c + ',' + r, node = self.svg.querySelector('[data-k="' + k + '"]');
      if (self.brush === 0) { delete self.cells[k]; node.setAttribute('fill', 'transparent'); node.setAttribute('fill-opacity', 0); }
      else { self.cells[k] = self.brush; node.setAttribute('fill', heatColor(self.brush)); node.setAttribute('fill-opacity', heatOp(self.brush)); }
    };
    this.svg.addEventListener('pointerdown', e => { self.down = true; try { self.svg.setPointerCapture(e.pointerId); } catch (_) { } paint(e); e.preventDefault(); });
    this.svg.addEventListener('pointermove', e => { if (self.down) paint(e); });
    ['pointerup', 'pointercancel'].forEach(t => this.svg.addEventListener(t, () => { self.down = false; }));
  }
  PitchEditor.prototype.getHeat = function () {
    const cells = Object.keys(this.cells).map(k => { const p = k.split(','); return [+p[0], +p[1], this.cells[k]]; });
    return cells.length ? { cols: COLS, rows: ROWS, cells } : null;
  };

  /* ------------------------------------------------------------------ */
  /* PRIVACY / GDPR                                                      */
  /* ------------------------------------------------------------------ */
  let policyPromise = null;
  function getPolicy() {
    if (!policyPromise) policyPromise = sb.from('privacy_policy_versions').select('*').order('effective_from', { ascending: false }).limit(1).single().then(r => r.data || null);
    return policyPromise;
  }
  window.openPrivacyModal = async function () {
    let m = document.getElementById('privacy-modal');
    if (!m) {
      m = document.createElement('div'); m.id = 'privacy-modal';
      m.className = 'no-print hidden fixed inset-0 bg-ink/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4';
      m.addEventListener('click', e => { if (e.target === m) m.classList.add('hidden'); });
      document.body.appendChild(m);
    }
    m.innerHTML = '<div class="glass rounded-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 space-y-3"><p class="text-sm text-muted">Caricamento…</p></div>'; m.classList.remove('hidden');
    const pol = await getPolicy();
    m.innerHTML = `<div class="glass rounded-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 space-y-3">
      <div class="flex items-start justify-between gap-3"><div><span class="text-[11px] font-semibold uppercase text-accent">Informativa privacy · versione ${esc(pol ? pol.version : '-')}</span><h3 class="text-lg font-bold text-ink">${esc(pol ? pol.title : 'Informativa non disponibile')}</h3></div>
      <button type="button" onclick="document.getElementById('privacy-modal').classList.add('hidden')" class="w-9 h-9 rounded-md hover:bg-canvas text-muted" aria-label="Chiudi"><i class="fa-solid fa-xmark"></i></button></div>
      <div class="text-sm text-ink leading-relaxed" style="white-space:pre-line">${esc(pol ? pol.body : '')}</div></div>`;
  };

  window.consentBoxHtml = function (pf, role) {
    const rels = role === 'club' ? '' : `<select id="${pf}-cb-rel" class="min-h-[40px] px-3 text-sm rounded-md"><option value="genitore">Genitore</option><option value="tutore">Tutore legale</option><option value="atleta">Atleta maggiorenne</option></select>`;
    const intro = role === 'scout' ? 'Il consenso è stato dato da' : role === 'club' ? 'La società dichiara di aver raccolto il consenso dei genitori' : 'Il consenso è prestato da';
    const gen = role === 'player' ? '<strong>Consenso alla visibilità della scheda:</strong> autorizzo scout e società registrati a vedere questa scheda.' : '<strong>Dichiarazione di consenso:</strong> dichiaro di aver raccolto il consenso al trattamento dei dati e alla visibilità della scheda, e di poterlo documentare.';
    return `<div class="p-4 rounded-md bg-emerald-50/70 border border-emerald-200 space-y-3">
      <div class="text-xs font-semibold text-emerald-950">${intro}</div>
      <div class="grid grid-cols-1 ${role === 'club' ? '' : 'sm:grid-cols-2'} gap-2">${rels}<input id="${pf}-cb-name" placeholder="${role === 'club' ? 'Nome del responsabile della società' : 'Nome e cognome'}" class="min-h-[40px] px-3 text-sm rounded-md"></div>
      <label class="flex items-start gap-2.5 cursor-pointer"><input type="checkbox" id="${pf}-cb-gen" class="mt-1 w-4 h-4 accent-emerald-700"><span class="text-xs text-emerald-950">${gen}</span></label>
      <label class="flex items-start gap-2.5 cursor-pointer"><input type="checkbox" id="${pf}-cb-health" class="mt-1 w-4 h-4 accent-emerald-700"><span class="text-xs text-emerald-950"><strong>Dati sulla salute (facoltativo):</strong> acconsento in modo esplicito al trattamento dei dati sugli infortuni. Senza questo consenso gli infortuni non possono essere registrati.</span></label>
      <p class="text-[11px] text-emerald-900">Leggi l'<button type="button" onclick="openPrivacyModal()" class="underline font-semibold">informativa privacy</button>. Il consenso si può ritirare in qualsiasi momento togliendo la spunta e salvando; ogni consenso viene registrato con data e versione del testo.</p></div>`;
  };
  window.fillConsentBox = function (pf, p) {
    const v = id => document.getElementById(pf + '-cb-' + id); if (!v('gen')) return;
    if (v('rel')) v('rel').value = (p && p.consent_relation) || (p && p.consent_type === 'self' ? 'atleta' : 'genitore');
    v('name').value = (p && (p.consent_given_by || p.guardian_name)) || '';
    v('gen').checked = !!(p && p.privacy_consent); v('health').checked = !!(p && p.health_consent);
  };
  window.readConsentBox = function (pf, role, dob) {
    const v = id => document.getElementById(pf + '-cb-' + id);
    const gen = v('gen').checked, health = v('health').checked, name = v('name').value.trim();
    const rel = role === 'club' ? 'societa' : v('rel').value;
    if ((gen || health) && !name) return { error: 'Indica chi presta il consenso (nome e cognome).' };
    if ((gen || health) && rel === 'atleta') { const a = calculateAge(dob); if (a === '' || Number(a) < 18) return { error: 'Per un atleta minorenne il consenso deve essere prestato da un genitore o tutore.' }; }
    return {
      data: {
        privacy_consent: gen, health_consent: health, consent_relation: name ? rel : null, consent_given_by: name || null,
        consent_type: role === 'player' ? (rel === 'atleta' ? 'self' : 'parent') : role === 'scout' ? 'scout_declared' : 'club_vivaio',
        guardian_name: rel === 'genitore' || rel === 'tutore' ? name : ''
      }
    };
  };

  const EVT = { given: 'Consenso prestato', updated: 'Consenso aggiornato', withdrawn: 'Consenso ritirato', legacy: 'Dato storico' };
  const dtIT = s => { const d = new Date(s); return isNaN(d) ? '-' : d.toLocaleDateString('it-IT') + ' ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }); };
  const yn = b => b ? '<span style="color:#0B8A5C;font-weight:700">SÌ</span>' : '<span style="color:#B3263A;font-weight:700">NO</span>';
  const badge = (b, t) => `<span class="chip ${b ? 'chip-ok' : 'chip-todo'}">${t}${b ? '' : ' no'}</span>`;

  window.renderMyCerts = async function (playerId, elId) {
    const el = document.getElementById(elId); if (!el) return;
    if (!playerId) { el.innerHTML = ''; return; }
    const { data } = await sb.from('privacy_consents').select('id,cert_code,event,consent_general,consent_health,policy_version,created_at').eq('player_id', playerId).order('created_at', { ascending: false });
    el.innerHTML = (data && data.length) ? `<div class="text-xs font-semibold text-ink mb-1.5">I tuoi certificati di consenso</div>` + data.map(r => `<div class="flex items-center justify-between gap-2 p-2.5 rounded-md bg-white/60 border border-line text-xs"><span><strong>${esc(r.cert_code)}</strong> · ${esc(EVT[r.event] || r.event)} · v${esc(r.policy_version)} · ${dtIT(r.created_at)}</span><button type="button" onclick="printConsentCertificate(${jsq(r.id)})" class="px-3 min-h-[32px] rounded-md bg-ink text-white text-[11px] font-semibold"><i class="fa-solid fa-file-pdf mr-1"></i>PDF</button></div>`).join('') : '';
  };

  window.printConsentCertificate = async function (id) {
    const { data: r, error } = await sb.from('privacy_consents').select('*').eq('id', id).single();
    if (error || !r) return showToast('Certificato non disponibile.', 'error');
    const relMap = { genitore: 'Genitore', tutore: 'Tutore legale', atleta: 'Atleta maggiorenne', societa: 'Società (vivaio)' };
    const typeMap = { self: 'Atleta', parent: 'Genitore / tutore (scheda compilata dalla famiglia)', scout_declared: 'Dichiarato da uno scout', club_vivaio: 'Dichiarato dalla società (vivaio)' };
    const row = (k, v) => `<tr><td style="padding:7px 10px;color:#5B6B7A;width:38%;border-bottom:1px solid #E5E9ED;font-size:11px">${k}</td><td style="padding:7px 10px;border-bottom:1px solid #E5E9ED;font-size:11.5px;font-weight:600">${v}</td></tr>`;
    document.getElementById('print-area').innerHTML = `<div class="pdf-doc"><div style="background:linear-gradient(120deg,#0B3D2E,#0B8A5C);color:#fff;border-radius:14px;padding:18px 22px;display:flex;justify-content:space-between;align-items:center">
      <div><div style="font-size:10px;letter-spacing:2px;font-weight:700;opacity:.8">SCOUTING DEPT · REGISTRO CONSENSI</div><div style="font-size:21px;font-weight:700;margin-top:4px">Certificato di consenso</div><div style="font-size:11px;opacity:.85;margin-top:2px">Trattamento dei dati personali · Reg. UE 2016/679 (GDPR)</div></div>
      <div style="text-align:right"><div style="font-size:9px;letter-spacing:1.5px;opacity:.75">CODICE</div><div style="font-size:15px;font-weight:700;font-family:ui-monospace,monospace">${esc(r.cert_code)}</div></div></div>
      <table style="width:100%;border-collapse:collapse;margin-top:16px">
      ${row('Interessato (atleta)', esc(r.player_name))}${row('ID atleta', esc(r.player_code || '-'))}${row('Data di nascita', r.player_dob ? formatDateIT(r.player_dob) : '-')}
      ${row('Evento registrato', esc(EVT[r.event] || r.event))}${row('Consenso al trattamento e alla visibilità della scheda', yn(r.consent_general))}${row('Consenso esplicito ai dati sulla salute', yn(r.consent_health))}
      ${row('Consenso prestato da', esc(r.given_by_name || '-') + (r.relation ? ' (' + esc(relMap[r.relation] || r.relation) + ')' : ''))}${row('Modalità', esc(typeMap[r.consent_type] || '-'))}
      ${row('Registrato da', esc(r.actor_name || '-') + (r.actor_role ? ' (' + esc(r.actor_role) + ')' : ''))}${row('Data e ora della registrazione', dtIT(r.created_at))}${row('Versione dell\'informativa', esc(r.policy_version))}</table>
      <div style="margin-top:14px;padding:10px 12px;border-radius:10px;background:#F2F6F4;border:1px solid #DCE6E0"><div style="font-size:9px;letter-spacing:1.2px;font-weight:700;color:#5B6B7A">IMPRONTA DI INTEGRITÀ (SHA-256)</div><div style="font-family:ui-monospace,monospace;font-size:9.5px;word-break:break-all;margin-top:3px">${esc(r.integrity_hash)}</div></div>
      <div style="margin-top:16px;font-size:10px;font-weight:700;letter-spacing:1px;color:#0B8A5C">TESTO DELL'INFORMATIVA ACCETTATA</div>
      <div style="margin-top:6px;font-size:8.8px;line-height:1.45;color:#2B3A47;white-space:pre-line;border:1px solid #E5E9ED;border-radius:10px;padding:10px 12px">${esc(r.policy_text)}</div>
      <div style="margin-top:12px;font-size:8.5px;color:#6B7A88">Documento generato dal registro dei consensi della piattaforma il ${new Date().toLocaleDateString('it-IT')}. Le registrazioni sono in sola aggiunta e non modificabili.</div></div>`;
    window.print();
  };

  function csvCell(v) { return '"' + String(v ?? '').replace(/"/g, '""') + '"'; }
  window.renderAdminPrivacy = async function (box) {
    box.innerHTML = '<div class="p-6 text-sm text-muted">Caricamento del registro…</div>';
    const { data, error } = await sb.from('privacy_consents').select('id,cert_code,player_id,player_name,player_code,event,consent_general,consent_health,consent_type,relation,given_by_name,actor_name,actor_role,policy_version,integrity_hash,created_at').order('created_at', { ascending: false }).limit(1000);
    if (error) { box.innerHTML = `<div class="p-6 text-sm text-red-700">${esc(error.message)}</div>`; return; }
    window.__consents = data || [];
    const withConsent = dbPlayers.filter(p => p.privacy_consent).length, withHealth = dbPlayers.filter(p => p.health_consent).length;
    box.innerHTML = `<div class="p-4 sm:p-5 space-y-4">
      <div class="grid grid-cols-3 gap-3 text-center">
        <div class="p-3 rounded-md bg-white/60 border border-line"><div class="text-[11px] text-muted">Atleti con consenso</div><div class="text-xl font-bold">${withConsent}/${dbPlayers.length}</div></div>
        <div class="p-3 rounded-md bg-white/60 border border-line"><div class="text-[11px] text-muted">Con consenso salute</div><div class="text-xl font-bold">${withHealth}</div></div>
        <div class="p-3 rounded-md bg-white/60 border border-line"><div class="text-[11px] text-muted">Registrazioni</div><div class="text-xl font-bold">${window.__consents.length}</div></div></div>
      <div class="flex flex-col sm:flex-row gap-2"><input id="cons-q" oninput="filterConsents()" placeholder="Cerca per atleta, codice atleta, certificato o autore…" class="flex-1 min-h-[40px] px-3 text-sm rounded-md">
        <button type="button" onclick="openPrivacyModal()" class="min-h-[40px] px-4 rounded-md bg-white/70 border border-line text-xs font-semibold">Leggi informativa</button>
        <button type="button" onclick="exportConsentsCsv()" class="min-h-[40px] px-4 rounded-md bg-accent text-white text-xs font-semibold"><i class="fa-solid fa-file-csv mr-1.5"></i>Esporta registro CSV</button></div>
      <div class="overflow-x-auto"><table class="w-full text-left text-xs min-w-[760px]"><thead class="text-muted"><tr><th class="p-2">Data</th><th class="p-2">Atleta</th><th class="p-2">Evento</th><th class="p-2">Consensi</th><th class="p-2">Prestato da</th><th class="p-2">Registrato da</th><th class="p-2">Vers.</th><th class="p-2 text-right">Certificato</th></tr></thead><tbody id="cons-body"></tbody></table></div></div>`;
    window.filterConsents();
  };
  window.filterConsents = function () {
    const q = ((document.getElementById('cons-q') || {}).value || '').toLowerCase(), body = document.getElementById('cons-body'); if (!body) return;
    const list = (window.__consents || []).filter(r => !q || [r.player_name, r.player_code, r.cert_code, r.actor_name, r.given_by_name].some(x => String(x || '').toLowerCase().includes(q)));
    body.innerHTML = list.length ? list.map(r => `<tr class="border-t border-line"><td class="p-2 whitespace-nowrap">${dtIT(r.created_at)}</td><td class="p-2"><strong>${esc(r.player_name)}</strong><div class="code">${esc(r.player_code || '')}</div></td><td class="p-2">${esc(EVT[r.event] || r.event)}</td><td class="p-2 space-x-1 whitespace-nowrap">${badge(r.consent_general, 'Dati')}${badge(r.consent_health, 'Salute')}</td><td class="p-2">${esc(r.given_by_name || '-')}</td><td class="p-2">${esc(r.actor_name || '-')}</td><td class="p-2">${esc(r.policy_version)}</td><td class="p-2 text-right"><button type="button" onclick="printConsentCertificate(${jsq(r.id)})" class="px-3 min-h-[32px] rounded-md bg-ink text-white text-[11px] font-semibold whitespace-nowrap"><i class="fa-solid fa-file-pdf mr-1"></i>${esc(r.cert_code)}</button></td></tr>`).join('') : '<tr><td colspan="8" class="p-6 text-center text-muted">Nessuna registrazione.</td></tr>';
  };
  window.exportConsentsCsv = function () {
    const cols = ['cert_code', 'created_at', 'player_name', 'player_code', 'event', 'consent_general', 'consent_health', 'consent_type', 'relation', 'given_by_name', 'actor_name', 'actor_role', 'policy_version', 'integrity_hash'];
    const csv = '﻿' + cols.join(';') + '\n' + (window.__consents || []).map(r => cols.map(c => csvCell(r[c])).join(';')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'registro-consensi-' + todayISO() + '.csv'; document.body.appendChild(a); a.click(); a.remove();
  };

  /* ------------------------------------------------------------------ */
  /* DOSSIER: lavagna e infortuni                                        */
  /* ------------------------------------------------------------------ */
  window.renderDetailExtras = function (p) {
    const el = document.getElementById('dm-extra'); if (!el) return;
    const st = getPlayerStats(p.id), heat = aggregateHeat(st.list);
    const injs = p.health_consent ? dbInjuries.filter(i => i.player_id === p.id) : [];
    const pitch = heat ? `<div class="p-4 rounded-2xl border border-line bg-white/50 space-y-2"><div class="text-xs font-semibold text-ink">Presenza in campo (media delle osservazioni)</div>${pitchSvg(heat)}<div>${heatLegend()}</div></div>` : '';
    const body = `<div class="p-4 rounded-2xl border border-line bg-white/50 space-y-2"><div class="text-xs font-semibold text-ink">Infortuni</div>${p.health_consent ? `<div class="flex justify-center gap-3 flex-wrap">${bodyPair(injs, { w: 120 })}</div><div class="text-center">${sevLegend()}</div>${injs.length ? injs.map(i => `<div class="text-xs text-ink"><i style="width:9px;height:9px;border-radius:50%;background:${SEV[i.severity]};display:inline-block;margin-right:6px"></i><strong>${esc(zoneLabel(i.zone))}</strong> — ${esc(i.injury_type)}, ${esc(i.severity)}, ${i.status === 'pregresso' ? 'pregresso' : 'in corso'}${i.notes ? ' · ' + esc(i.notes) : ''}</div>`).join('') : '<p class="text-xs text-muted text-center">Nessun infortunio segnalato.</p>'}` : '<p class="text-xs text-muted">Dati sulla salute non disponibili: consenso non prestato.</p>'}</div>`;
    el.innerHTML = (pitch || body) ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">${pitch}${body}</div>` : '';
  };

  /* ------------------------------------------------------------------ */
  /* REPORT PDF                                                          */
  /* ------------------------------------------------------------------ */
  const sec = t => `<div style="font-size:10px;font-weight:800;letter-spacing:1.4px;color:#0B8A5C;text-transform:uppercase;margin:0 0 8px;display:flex;align-items:center;gap:8px"><span style="width:18px;height:3px;border-radius:2px;background:#0B8A5C;display:inline-block"></span>${t}</div>`;
  const card = (inner, extra) => `<div style="border:1px solid #E2E8EC;border-radius:14px;padding:14px;background:#fff;${extra || ''}">${inner}</div>`;
  function ringSvg(avg, color) {
    const R = 44, C = 2 * Math.PI * R, v = avg == null ? 0 : Math.max(0, Math.min(10, avg)) / 10;
    return `<svg viewBox="0 0 110 110" style="width:104px;height:104px"><circle cx="55" cy="55" r="${R}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="10"/><circle cx="55" cy="55" r="${R}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(C * v).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 55 55)"/><text x="55" y="63" text-anchor="middle" font-size="28" font-weight="700" fill="#fff" font-family="Arial,sans-serif">${avg == null ? '—' : avg.toFixed(1)}</text></svg>`;
  }

  window.exportDetailPDF = function () {
    const p = dbPlayers.find(x => x.id === currentDetailPlayerId); if (!p) return;
    const st = getPlayerStats(p.id), age = calculateAge(p.dob), th = roleTheme(p.role_category);
    const injs = p.health_consent ? dbInjuries.filter(i => i.player_id === p.id) : [];
    const heat = aggregateHeat(st.list);
    const logo = (currentUser && currentUser.role === 'club' && currentUser.avatar_url) ? `<img src="${esc(currentUser.avatar_url)}" style="height:40px;width:40px;object-fit:contain;border-radius:8px;background:#fff;padding:3px">` : '';
    const verdict = Object.entries(st.verdicts).map(([k, v]) => `${v} ${esc(k)}`).join(' · ') || 'Nessun esito';
    const bars = Object.keys(st.keyAvgs).length ? Object.entries(st.keyAvgs).map(([k, v]) => `<div style="margin-bottom:9px"><div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:3px"><span style="font-weight:700">${esc(k)} <span style="font-weight:400;color:#6B7A88">${esc(TIPS_FULL_LABELS[k] || '')}</span></span><span style="font-weight:800;color:${th.ink}">${v.toFixed(1)}</span></div><div style="height:7px;background:#E9EEF1;border-radius:4px;overflow:hidden"><div style="width:${Math.min(100, v * 10)}%;height:100%;background:linear-gradient(90deg,${th.a},${th.b})"></div></div></div>`).join('') : '<div style="font-size:10px;color:#6B7A88">Nessun punteggio disponibile.</div>';
    const radar = radarSvg(st.keyAvgs, th.b);

    const obs = st.list.length ? st.list.map(r => {
      const hm = heatMapOf(r), oi = injs.filter(i => i.observation_id === r.id);
      return `<div class="avoid-break" style="border:1px solid #E2E8EC;border-radius:14px;margin-bottom:10px;overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:center;background:#F3F7F5;padding:8px 12px;border-bottom:1px solid #E2E8EC"><div style="font-size:10.5px;font-weight:700">${esc(r.observer_name)} <span style="font-weight:400;color:#6B7A88">· ${esc(r.observer_role || 'Scout')}</span></div><div style="font-size:9.5px;color:#6B7A88">${formatDateIT(r.obs_date)} · ${esc(r.context || '')} · ${esc(r.location || '')}</div></div>
        <div style="display:flex;gap:12px;padding:10px 12px"><div style="flex:1;min-width:0">
          <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:7px"><span style="background:#0B8A5C;color:#fff;border-radius:999px;padding:3px 10px;font-size:9.5px;font-weight:800">Media ${Number(r.avg).toFixed(1)}</span>${Object.entries(r.scores || {}).map(([k, v]) => `<span style="border:1px solid #DCE4EA;border-radius:999px;padding:3px 9px;font-size:9.5px">${esc(k)} <strong>${esc(v)}</strong></span>`).join('')}<span style="background:#EEF3F1;border-radius:999px;padding:3px 9px;font-size:9.5px">${esc(r.outcome || '')}</span>${r.attitude ? `<span style="background:#EEF3F1;border-radius:999px;padding:3px 9px;font-size:9.5px">Atteggiamento: ${esc(r.attitude)}</span>` : ''}</div>
          <div style="font-size:10.5px;line-height:1.5;color:#1D2B38;white-space:pre-line">${esc(r.notes || 'Nessuna relazione.')}</div>
          ${oi.length ? `<div style="margin-top:6px;font-size:9.5px;color:#8A2A2A"><strong>Infortuni segnalati:</strong> ${oi.map(i => esc(zoneLabel(i.zone)) + ' (' + esc(i.severity) + ')').join(', ')}</div>` : ''}</div>
          ${hm ? `<div style="width:150px;flex:0 0 150px">${pitchSvg(hm, { w: 150 })}<div style="font-size:8.5px;color:#6B7A88;text-align:center;margin-top:2px">Presenza in campo</div></div>` : ''}</div></div>`;
    }).join('') : card('<div style="text-align:center;font-size:10.5px;color:#6B7A88">Nessuna osservazione registrata.</div>');

    const injList = injs.length ? injs.map(i => `<div style="font-size:9.5px;margin-top:4px"><i style="width:8px;height:8px;border-radius:50%;background:${SEV[i.severity]};display:inline-block;margin-right:5px"></i><strong>${esc(zoneLabel(i.zone))}</strong> — ${esc(i.injury_type)}, ${esc(i.severity)}, ${i.status === 'pregresso' ? 'pregresso' : 'in corso'}${i.injury_date ? ' (' + formatDateIT(i.injury_date) + ')' : ''}</div>`).join('') : '<div style="font-size:9.5px;color:#6B7A88;text-align:center;margin-top:6px">Nessun infortunio segnalato.</div>';

    const consentLine = p.privacy_consent ? `Consenso privacy registrato${p.consent_at ? ' il ' + new Date(p.consent_at).toLocaleDateString('it-IT') : ''}${p.consent_version ? ' (informativa v' + esc(p.consent_version) + ')' : ''}` : 'Consenso privacy non registrato';

    document.getElementById('print-area').innerHTML = `<div class="pdf-doc" style="font-family:-apple-system,'Segoe UI',Arial,sans-serif">
      <div style="background:linear-gradient(120deg,#0B3D2E,#0B8A5C);border-radius:16px;padding:16px 20px;color:#fff;display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:12px"><div style="width:38px;height:38px;border-radius:11px;background:rgba(255,255,255,.18);display:grid;place-items:center"><svg viewBox="0 0 44 44" style="width:26px;height:26px"><circle cx="22" cy="22" r="10" fill="none" stroke="#fff" stroke-width="2.6"/><line x1="22" y1="8" x2="22" y2="36" stroke="#fff" stroke-width="2.6"/></svg></div>
        <div><div style="font-size:9px;letter-spacing:2px;font-weight:700;opacity:.8">SCOUTING DEPT</div><div style="font-size:18px;font-weight:700">Report atleta</div></div></div>
        <div style="display:flex;align-items:center;gap:12px;text-align:right"><div><div style="font-size:12px;font-weight:700;font-family:ui-monospace,monospace">${esc(p.public_code || '')}</div><div style="font-size:9.5px;opacity:.85">${new Date().toLocaleDateString('it-IT')}${currentUser && currentUser.organization ? ' · ' + esc(currentUser.organization) : ''}</div></div>${logo}</div></div>

      <div class="avoid-break" style="display:flex;gap:16px;align-items:center;border-radius:16px;padding:14px;margin-bottom:14px;background:linear-gradient(135deg,${th.soft},#fff 60%);border:1px solid #E2E8EC">
        <img src="${esc(p.photo || playerPhoto(p))}" style="width:88px;height:88px;border-radius:20px;object-fit:cover;border:3px solid #fff;box-shadow:0 4px 12px rgba(16,32,47,.18);background:#fff">
        <div style="flex:1"><div style="font-size:23px;font-weight:800;line-height:1.1;color:#10202F">${esc(p.name)}</div>
        <div style="margin-top:5px"><span style="background:${th.soft};color:${th.ink};border-radius:999px;padding:3px 11px;font-size:10px;font-weight:800">${esc(p.role_category)}</span> <span style="font-size:10.5px;color:#4A5A6B;margin-left:4px">${esc(p.club || 'Svincolato')}${p.league ? ' · ' + esc(p.league) : ''}</span></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px 12px;margin-top:9px;font-size:10px"><div><span style="color:#6B7A88">Nascita</span><br><strong>${formatDateIT(p.dob)}${age ? ' (' + age + ' anni)' : ''}</strong></div><div><span style="color:#6B7A88">Fisico</span><br><strong>${esc(p.height || '-')} cm · ${esc(p.weight || '-')} kg</strong></div><div><span style="color:#6B7A88">Piede</span><br><strong>${esc(p.foot || '-')}</strong></div><div style="grid-column:span 2"><span style="color:#6B7A88">Residenza</span><br><strong>${esc(p.residence || '-')}</strong></div><div><span style="color:#6B7A88">Nazionalità</span><br><strong>${esc(p.nationality || '-')}</strong></div></div></div></div>

      <div class="avoid-break" style="display:flex;gap:12px;margin-bottom:14px;align-items:stretch">
        <div style="width:170px;flex:0 0 170px;background:linear-gradient(160deg,#10202F,#183349);border-radius:16px;color:#fff;text-align:center;padding:14px 10px;display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div style="font-size:8.5px;letter-spacing:1.4px;font-weight:700;color:#9FB3C4">MEDIA GLOBALE T.I.P.S.</div>${ringSvg(st.avg, th.a)}
          <div style="font-size:10px;color:#D7E2EB">${st.count} ${st.count === 1 ? 'osservazione' : 'osservazioni'}</div>
          <div style="margin-top:8px;font-size:9px;font-weight:700;color:${st.discordant ? '#FBBF24' : '#34D399'}">${st.discordant ? 'Pareri discordanti (scarto ' + st.spread + ')' : (st.count >= 2 ? 'Pareri concordi (scarto ' + st.spread + ')' : 'Valutazione singola')}</div>
          <div style="margin-top:4px;font-size:8.5px;color:#9FB3C4">${verdict}</div></div>
        ${radar ? card(`<div style="display:grid;place-items:center">${radar}</div>`, 'flex:0 0 200px;display:grid;place-items:center;padding:8px') : ''}
        ${card(sec('Medie per parametro') + bars, 'flex:1')}</div>

      <div class="avoid-break" style="display:flex;gap:12px;margin-bottom:16px">
        ${card(sec('Presenza in campo') + (heat ? pitchSvg(heat) + `<div style="margin-top:5px">${heatLegend()}</div>` : '<div style="font-size:10px;color:#6B7A88;text-align:center;padding:24px 0">Nessuna lavagna compilata.</div>'), 'flex:1.35')}
        ${card(sec('Mappa infortuni') + (p.health_consent ? `<div style="display:flex;justify-content:center;gap:4px">${bodyPair(injs, { w: 86 })}</div><div style="text-align:center;margin-top:4px">${sevLegend()}</div>${injList}` : '<div style="font-size:10px;color:#6B7A88;text-align:center;padding:24px 6px">Dati sulla salute non disponibili: consenso non prestato.</div>'), 'flex:1')}</div>

      ${sec('Storico osservazioni (' + st.count + ')')}${obs}

      <div style="border-top:1px solid #E2E8EC;padding-top:8px;margin-top:16px;display:flex;justify-content:space-between;gap:12px;font-size:8.5px;color:#6B7A88"><span>Scouting Dept — Documento riservato ad uso interno · ${consentLine}</span><span>${esc(p.name)} (${esc(p.public_code || '')})</span></div></div>`;
    window.print();
  };
})();
