// แล็บสามมิติ — เอนจินกลางที่ทุกฉากใช้ร่วมกัน (three.js r170)
import * as THREE from './lib/three.module.min.js';
import { OrbitControls } from './lib/addons/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from './lib/addons/CSS2DRenderer.js';

export const C = {
  teal: 0x2bb3a3, blue: 0x4c8dff, amber: 0xf2b134, red: 0xef5b5b, green: 0x4cc38a,
  violet: 0x9d7bff, pink: 0xf07ab8, slate: 0x5b6b7c, white: 0xf3f6f8, dark: 0x1b2631,
  orange: 0xf28c38, sky: 0x7cc7ff, lime: 0xa8d65b, sand: 0xd9c49a,
};
export const PALETTE = [C.teal, C.amber, C.blue, C.pink, C.green, C.violet, C.orange, C.sky, C.red, C.lime];
export const hex = (c) => '#' + new THREE.Color(c).getHexString();

export function createLab({ stage, panel }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x0f1a22);
  stage.appendChild(renderer.domElement);
  const labels = new CSS2DRenderer();
  labels.domElement.className = 'labels';
  stage.appendChild(labels.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0f1a22, 40, 90);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  scene.add(new THREE.HemisphereLight(0xdfefff, 0x1a2430, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(6, 12, 8);
  scene.add(sun);

  let root = new THREE.Group();
  scene.add(root);
  let gen = 0, loops = [], timers = [], clickables = [], cleanups = [];
  const clock = new THREE.Clock();
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h); labels.setSize(w, h);
    camera.aspect = w / h;
    // ฉากออกแบบไว้สำหรับจอกว้าง 16:10 ถ้าเวทีแคบกว่า ให้ขยายมุมมองแนวตั้งเพื่อเห็นความกว้างเท่าเดิม
    const hf = 2 * Math.atan(Math.tan((45 * Math.PI) / 360) * 1.6);
    camera.fov = Math.min(80, Math.max(45, (2 * Math.atan(Math.tan(hf / 2) / camera.aspect) * 180) / Math.PI));
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);

  renderer.domElement.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const r = renderer.domElement.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    const hits = ray.intersectObjects(clickables.map((c) => c.obj), true);
    if (!hits.length) return;
    let o = hits[0].object;
    while (o) { const c = clickables.find((k) => k.obj === o); if (c) { c.fn(o); return; } o = o.parent; }
  });

  (function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    for (const f of loops.slice()) f(dt, t);
    controls.update();
    renderer.render(scene, camera);
    labels.render(scene, camera);
  })();

  function disposeTree(o) {
    o.traverse((m) => {
      if (m.geometry) m.geometry.dispose();
      if (m.material) [].concat(m.material).forEach((x) => { if (x.map) x.map.dispose(); x.dispose(); });
    });
  }

  function reset() {
    gen++;
    loops = []; clickables = [];
    timers.forEach(clearTimeout); timers = [];
    cleanups.forEach((f) => { try { f(); } catch (e) {} }); cleanups = [];
    scene.remove(root);
    root.traverse((o) => { if (o.isCSS2DObject) o.element.remove(); });
    disposeTree(root);
    root = new THREE.Group(); scene.add(root);
    panel.controls.innerHTML = ''; panel.steps.innerHTML = ''; panel.quiz.innerHTML = '';
    panel.readouts.innerHTML = '';
    camera.position.set(0, 7, 14); controls.target.set(0, 1, 0);
    controls.enableRotate = true;
  }

  // ---------- ตัวช่วยสร้างวัตถุ ----------
  const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05,
    transparent: o.opacity != null && o.opacity < 1, opacity: o.opacity ?? 1, emissive: o.emissive ?? 0x000000, side: o.side ?? THREE.FrontSide });
  function place(m, o) {
    m.position.set(o.x || 0, o.y || 0, o.z || 0);
    if (o.rx) m.rotation.x = o.rx; if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz;
    (o.parent || root).add(m); return m;
  }
  function edges(m, color = 0xffffff, op = 0.35) {
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color, transparent: true, opacity: op }));
    m.add(e); return e;
  }
  const L = {
    THREE, C, PALETTE, hex, scene, camera, controls,
    get root() { return root; },
    alive(g) { return g === gen; }, get gen() { return gen; },
    cam(x, y, z, tx = 0, ty = 0, tz = 0) { camera.position.set(x, y, z); controls.target.set(tx, ty, tz); },
    flyTo(x, y, z, tx, ty, tz, ms = 900) {
      const p0 = camera.position.clone(), t0 = controls.target.clone();
      const p1 = new THREE.Vector3(x, y, z), t1 = new THREE.Vector3(tx, ty, tz);
      return L.anim(ms, (k) => { camera.position.lerpVectors(p0, p1, k); controls.target.lerpVectors(t0, t1, k); });
    },
    group(o = {}) { return place(new THREE.Group(), o); },
    box(o = {}) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(o.w ?? 1, o.h ?? 1, o.d ?? 1), mat(o.color ?? C.teal, o));
      place(m, o); if (o.edges !== false) edges(m, o.edgeColor ?? 0xffffff, o.edgeOpacity ?? 0.25); return m;
    },
    sphere(o = {}) { return place(new THREE.Mesh(new THREE.SphereGeometry(o.r ?? 0.5, 32, 20), mat(o.color ?? C.amber, o)), o); },
    cyl(o = {}) {
      return place(new THREE.Mesh(new THREE.CylinderGeometry(o.rt ?? o.r ?? 0.5, o.rb ?? o.r ?? 0.5, o.h ?? 1, o.seg ?? 32), mat(o.color ?? C.blue, o)), o);
    },
    cone(o = {}) { return place(new THREE.Mesh(new THREE.ConeGeometry(o.r ?? 0.5, o.h ?? 1, o.seg ?? 32), mat(o.color ?? C.amber, o)), o); },
    torus(o = {}) { return place(new THREE.Mesh(new THREE.TorusGeometry(o.r ?? 1, o.t ?? 0.1, 16, o.seg ?? 64, o.arc ?? Math.PI * 2), mat(o.color ?? C.teal, o)), o); },
    plane(o = {}) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(o.w ?? 1, o.h ?? 1), mat(o.color ?? C.slate, { ...o, side: THREE.DoubleSide }));
      return place(m, o);
    },
    floor(size = 30, color = 0x16242f) {
      const g = new THREE.GridHelper(size, size, 0x2d4352, 0x1d2d39); g.position.y = -0.01; root.add(g);
      const p = L.plane({ w: size, h: size, color, rx: -Math.PI / 2, y: -0.02 }); return p;
    },
    line(points, color = 0xffffff, opacity = 1) {
      const g = new THREE.BufferGeometry().setFromPoints(points.map((p) => (p.isVector3 ? p : new THREE.Vector3(...p))));
      const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
      root.add(l); return l;
    },
    setLine(l, points) { const g = new THREE.BufferGeometry().setFromPoints(points.map((p) => (p.isVector3 ? p : new THREE.Vector3(...p)))); l.geometry.dispose(); l.geometry = g; },
    arrow(from, to, color = C.amber, head = 0.35) {
      const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to), d = b.clone().sub(a);
      const h = new THREE.ArrowHelper(d.clone().normalize(), a, d.length(), color, head, head * 0.6);
      root.add(h); return h;
    },
    label(text, o = {}) {
      const el = document.createElement('div');
      el.className = 'lbl ' + (o.cls || '');
      el.innerHTML = text;
      if (o.color != null) el.style.setProperty('--lc', hex(o.color));
      const obj = new CSS2DObject(el);
      obj.position.set(o.x || 0, o.y || 0, o.z || 0);
      if (/\bside\b/.test(o.cls || '')) obj.center.set(0, 0.5);
      (o.parent || root).add(obj);
      obj.set = (t) => { el.innerHTML = t; };
      return obj;
    },
    canvasTex(w, h, draw) {
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const ctx = cv.getContext('2d'); draw(ctx, w, h);
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
      tex.redraw = (fn) => { ctx.clearRect(0, 0, w, h); fn(ctx, w, h); tex.needsUpdate = true; };
      return tex;
    },
    texPlane(o, draw) {
      const tex = L.canvasTex(o.pw ?? 1024, o.ph ?? 640, draw);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(o.w ?? 4, o.h ?? 2.5), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true }));
      place(m, o); m.tex = tex; return m;
    },
    color(m, c) { m.material.color.set(c); },
    glow(m, on, c = 0x333333) { m.material.emissive.set(on ? c : 0x000000); },
    loop(fn) { loops.push(fn); return () => (loops = loops.filter((f) => f !== fn)); },
    anim(ms, fn, ease = easeInOut) {
      const g = gen;
      return new Promise((res) => {
        const t0 = performance.now();
        const stop = L.loop(() => {
          if (g !== gen) { stop(); return res(false); }
          const k = Math.min(1, (performance.now() - t0) / ms);
          fn(ease(k));
          if (k >= 1) { stop(); res(true); }
        });
      });
    },
    tween(obj, to, ms = 600, ease = easeInOut) {
      const from = {}; for (const k in to) from[k] = obj[k];
      return L.anim(ms, (k) => { for (const p in to) obj[p] = from[p] + (to[p] - from[p]) * k; }, ease);
    },
    moveTo(m, x, y, z, ms = 600) { return L.tween(m.position, { x, y, z }, ms); },
    wait(ms) { const g = gen; return new Promise((r) => timers.push(setTimeout(() => r(g === gen), ms))); },
    onClick(obj, fn) { clickables.push({ obj, fn }); if (obj.userData) obj.userData.clickable = true; },
    onCleanup(fn) { cleanups.push(fn); },
    remove(o) { if (!o) return; o.traverse((x) => { if (x.isCSS2DObject) x.element.remove(); }); o.parent && o.parent.remove(o); disposeTree(o); },
    clearGroup(g) { [...g.children].forEach((c) => L.remove(c)); },

    // ---------- แผงควบคุม ----------
    button(text, fn, o = {}) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn' + (o.primary ? ' primary' : ''); b.innerHTML = text;
      b.addEventListener('click', () => fn(b));
      (o.into || panel.controls).appendChild(b); return b;
    },
    buttons(list, o = {}) {
      const row = document.createElement('div'); row.className = 'btnrow'; panel.controls.appendChild(row);
      const bs = list.map(([t, f]) => L.button(t, (b) => { if (o.radio) { bs.forEach((x) => x.classList.remove('on')); b.classList.add('on'); } f(b); }, { into: row }));
      if (o.radio && o.active != null) bs[o.active].classList.add('on');
      return bs;
    },
    slider(label, o, fn) {
      const id = 'ctl' + Math.random().toString(36).slice(2, 8);
      const w = document.createElement('div'); w.className = 'ctl';
      w.innerHTML = `<label for="${id}"><span>${label}</span><output></output></label><input id="${id}" type="range" min="${o.min}" max="${o.max}" step="${o.step ?? 1}" value="${o.value}">`;
      panel.controls.appendChild(w);
      const inp = w.querySelector('input'), out = w.querySelector('output');
      const fmt = o.fmt || ((v) => v + (o.unit ? ' ' + o.unit : ''));
      const upd = () => { const v = +inp.value; out.textContent = fmt(v); fn && fn(v); };
      inp.addEventListener('input', upd); out.textContent = fmt(+inp.value);
      if (o.now !== false) setTimeout(() => upd(), 0);
      return { get value() { return +inp.value; }, set(v) { inp.value = v; upd(); }, el: inp };
    },
    toggle(label, value, fn) {
      const id = 'ctl' + Math.random().toString(36).slice(2, 8);
      const w = document.createElement('div'); w.className = 'ctl tog';
      w.innerHTML = `<input id="${id}" type="checkbox" ${value ? 'checked' : ''}><label for="${id}">${label}</label>`;
      panel.controls.appendChild(w);
      const inp = w.querySelector('input');
      inp.addEventListener('change', () => fn(inp.checked));
      setTimeout(() => fn(inp.checked), 0);
      return { get value() { return inp.checked; }, set(v) { inp.checked = v; fn(v); } };
    },
    select(label, options, fn, value = 0) {
      const id = 'ctl' + Math.random().toString(36).slice(2, 8);
      const w = document.createElement('div'); w.className = 'ctl';
      w.innerHTML = `<label for="${id}"><span>${label}</span></label><select id="${id}">${options.map((o, i) => `<option value="${i}" ${i === value ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
      panel.controls.appendChild(w);
      const s = w.querySelector('select');
      s.addEventListener('change', () => fn(+s.value));
      setTimeout(() => fn(+s.value), 0);
      return s;
    },
    input(label, value, fn) {
      const id = 'ctl' + Math.random().toString(36).slice(2, 8);
      const w = document.createElement('div'); w.className = 'ctl';
      w.innerHTML = `<label for="${id}"><span>${label}</span></label><input id="${id}" type="text" value="${value}" autocomplete="off">`;
      panel.controls.appendChild(w);
      const s = w.querySelector('input'); s.addEventListener('input', () => fn(s.value)); setTimeout(() => fn(s.value), 0);
      return s;
    },
    readout(label, value = '') {
      const w = document.createElement('div'); w.className = 'ro';
      w.innerHTML = `<span>${label}</span><b>${value}</b>`; panel.readouts.appendChild(w);
      const b = w.querySelector('b');
      return (v, state) => { b.innerHTML = v; w.dataset.state = state || ''; };
    },
    note(html) { const d = document.createElement('p'); d.className = 'note'; d.innerHTML = html; panel.controls.appendChild(d); return d; },

    // ขั้นตอนการอธิบาย: [{t:'ข้อความ', f: ()=>{}}]
    steps(list) {
      let i = 0;
      const wrap = panel.steps;
      wrap.innerHTML = `<div class="stephead"><b>อธิบายทีละขั้น</b><span class="stepn"></span></div><p class="steptext"></p>
        <div class="btnrow"><button type="button" class="btn" data-a="prev">ย้อนกลับ</button><button type="button" class="btn primary" data-a="next">ขั้นถัดไป</button></div>`;
      const txt = wrap.querySelector('.steptext'), n = wrap.querySelector('.stepn');
      const go = (k) => {
        i = Math.max(0, Math.min(list.length - 1, k));
        txt.innerHTML = list[i].t; n.textContent = `${i + 1} / ${list.length}`;
        wrap.querySelector('[data-a=prev]').disabled = i === 0;
        wrap.querySelector('[data-a=next]').disabled = i === list.length - 1;
        list[i].f && list[i].f();
      };
      wrap.querySelector('[data-a=prev]').onclick = () => go(i - 1);
      wrap.querySelector('[data-a=next]').onclick = () => go(i + 1);
      setTimeout(() => go(0), 0);
      return { go };
    },
    quiz(q, choices, ans, why) {
      const wrap = panel.quiz;
      wrap.innerHTML = `<div class="stephead"><b>เช็กความเข้าใจ</b></div><p class="q">${q}</p><div class="choices"></div><p class="why" hidden></p>`;
      const box = wrap.querySelector('.choices'), w = wrap.querySelector('.why');
      choices.forEach((c, k) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'choice'; b.innerHTML = c;
        b.onclick = () => {
          box.querySelectorAll('.choice').forEach((x, j) => { x.disabled = true; if (j === ans) x.classList.add('right'); });
          if (k !== ans) b.classList.add('wrong');
          w.hidden = false; w.innerHTML = (k === ans ? '<b>ถูกต้อง</b> ' : '<b>ยังไม่ใช่</b> ') + why;
        };
        box.appendChild(b);
      });
    },

    // ---------- ชุดสำเร็จรูป ----------
    // ป้ายเรียงเป็นเส้นทาง พร้อมลูกศรเชื่อม
    flow(stages, o = {}) {
      const n = stages.length, gap = o.gap ?? 3, ring = o.ring;
      const pos = stages.map((s, i) => {
        if (ring) { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; return [Math.cos(a) * ring, o.y ?? 0.6, Math.sin(a) * ring]; }
        return [(i - (n - 1) / 2) * gap, o.y ?? 0.6, o.z ?? 0];
      });
      const nodes = stages.map((s, i) => {
        const b = L.box({ w: o.w ?? 2.2, h: o.h ?? 1, d: o.d ?? 1.2, color: s.color ?? PALETTE[i % PALETTE.length], x: pos[i][0], y: pos[i][1], z: pos[i][2] });
        b.lbl = L.label(s.name ?? s, { parent: b, y: (o.h ?? 1) / 2 + 0.45, cls: 'tag' });
        return b;
      });
      const arrows = [];
      for (let i = 0; i < n - (ring ? 0 : 1); i++) {
        const a = pos[i], b = pos[(i + 1) % n], d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], len = Math.hypot(...d), u = d.map((x) => x / len);
        const off = ring ? 1.05 : (o.w ?? 2.2) / 2 + 0.1;
        arrows.push(L.arrow(a.map((x, k) => x + u[k] * off), b.map((x, k) => x - u[k] * off), o.arrowColor ?? 0x9fb4c4, 0.3));
      }
      const api = {
        nodes, pos, arrows,
        highlight(k) { nodes.forEach((b, i) => { b.material.emissive.set(i === k ? 0x553300 : 0); b.scale.setScalar(i === k ? 1.15 : 1); }); },
        async packet(from, to, color = C.white, ms = 700) {
          const s = L.sphere({ r: 0.22, color, x: pos[from][0], y: pos[from][1] + 0.9, z: pos[from][2], emissive: 0x333333 });
          await L.moveTo(s, pos[to][0], pos[to][1] + 0.9, pos[to][2], ms); L.remove(s);
        },
      };
      return api;
    },
    // แกน 2 มิติบนระนาบ XY
    axes(o) {
      const W = o.w ?? 10, H = o.h ?? 6, x0 = o.x ?? -W / 2, y0 = o.y ?? 0, z = o.z ?? 0;
      const g = L.group();
      const mk = (pts, c, op) => { const l = L.line(pts, c, op); g.add(l); return l; };
      mk([[x0, y0, z], [x0 + W, y0, z]], 0xcfdbe4); mk([[x0, y0, z], [x0, y0 + H, z]], 0xcfdbe4);
      const sx = (v) => x0 + ((v - o.xmin) / (o.xmax - o.xmin)) * W, sy = (v) => y0 + ((v - o.ymin) / (o.ymax - o.ymin)) * H;
      (o.xticks || []).forEach((v) => { mk([[sx(v), y0, z], [sx(v), y0 - 0.12, z]], 0xcfdbe4); g.add(L.label(String(v), { x: sx(v), y: y0 - 0.4, z, cls: 'tick' })); });
      (o.yticks || []).forEach((v) => { mk([[x0, sy(v), z], [x0 + W, sy(v), z]], 0x6c8293, 0.25); g.add(L.label(String(v), { x: x0 - 0.45, y: sy(v), z, cls: 'tick' })); });
      if (o.xlabel) g.add(L.label(o.xlabel, { x: x0 + W / 2, y: y0 - 0.95, z, cls: 'axis' }));
      if (o.ylabel) g.add(L.label(o.ylabel, { x: x0 - 0.2, y: y0 + H + 0.5, z, cls: 'axis' }));
      return { g, sx, sy, x0, y0, W, H, z };
    },
    // แท่งข้อมูล
    bars(values, o = {}) {
      const g = L.group({ x: o.x ?? 0, y: o.y ?? 0, z: o.z ?? 0 });
      const gap = o.gap ?? 1.1, scale = o.scale ?? 1;
      const items = values.map((v, i) => {
        const h = Math.max(0.02, v * scale);
        const m = L.box({ w: o.w ?? 0.8, h: 1, d: o.d ?? 0.8, color: o.colors ? o.colors[i % o.colors.length] : (o.color ?? C.teal), x: (i - (values.length - 1) / 2) * gap, y: h / 2, parent: g });
        m.scale.y = h; m.val = v;
        m.tag = o.labels !== false ? L.label(o.fmt ? o.fmt(v, i) : String(v), { x: m.position.x, y: h + 0.35, parent: g, cls: 'tick' }) : null;
        if (o.names) m.name2 = L.label(o.names[i], { x: m.position.x, y: -0.4, parent: g, cls: 'tick' });
        return m;
      });
      const api = {
        g, items,
        set(i, v, ms = 400) {
          const m = items[i]; m.val = v; const h = Math.max(0.02, v * scale);
          if (m.tag) { m.tag.set(o.fmt ? o.fmt(v, i) : String(v)); L.tween(m.tag.position, { y: h + 0.35 }, ms); }
          L.tween(m.position, { y: h / 2 }, ms); return L.tween(m.scale, { y: h }, ms);
        },
        async swap(i, j, ms = 450) {
          const a = items[i], b = items[j], xa = a.position.x, xb = b.position.x;
          const pa = L.tween(a.position, { x: xb, z: 0.9 }, ms / 2).then(() => L.tween(a.position, { z: 0 }, ms / 2));
          const pb = L.tween(b.position, { x: xa, z: -0.9 }, ms / 2).then(() => L.tween(b.position, { z: 0 }, ms / 2));
          if (a.tag) L.tween(a.tag.position, { x: xb }, ms); if (b.tag) L.tween(b.tag.position, { x: xa }, ms);
          await Promise.all([pa, pb]); items[i] = b; items[j] = a;
        },
        paint(fn) { items.forEach((m, i) => m.material.color.set(fn(i, m))); },
      };
      return api;
    },
    // ชั้นซ้อนกัน แยกออกได้
    stack(layers, o = {}) {
      const g = L.group({ x: o.x ?? 0, y: o.y ?? 0, z: o.z ?? 0 });
      const items = layers.map((ly, i) => {
        const b = L.box({ w: ly.w ?? o.w ?? 4, h: ly.h ?? 0.3, d: ly.d ?? o.d ?? 3, color: ly.color ?? PALETTE[i % PALETTE.length], y: i * (ly.h ?? 0.3), parent: g, opacity: ly.opacity });
        b.lbl = L.label(ly.name, { parent: b, x: (ly.w ?? o.w ?? 4) / 2 + 0.2, cls: 'tag side' }); b.base = i * (ly.h ?? 0.3);
        return b;
      });
      return { g, items, explode(k, ms = 700) { return Promise.all(items.map((b, i) => L.tween(b.position, { y: b.base + i * k }, ms))); } };
    },
  };
  return { L, reset, resize };
}

export function easeInOut(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
export const linear = (k) => k;
export const easeOutBounce = (x) => {
  const n1 = 7.5625, d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x; if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
  if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375; return n1 * (x -= 2.625 / d1) * x + 0.984375;
};
