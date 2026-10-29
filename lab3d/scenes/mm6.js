// ม.6 เทคโนโลยีมัลติมีเดีย
import { C, PALETTE, easeOutBounce } from '../engine.js';

const r2 = (v) => Math.round(v * 100) / 100;

export default {
  1: {
    idea: 'องค์ประกอบมัลติมีเดีย 6 อย่างโคจรรอบ "สื่อ" หนึ่งชิ้น ปิดทีละองค์ประกอบแล้วดูว่าความน่าสนใจหายไปแค่ไหน และเทียบสื่อเชิงเส้นกับสื่อโต้ตอบ',
    build(L) {
      L.cam(0, 7, 14, 0, 1.5, 0); L.floor(36);
      const core = L.sphere({ r: 1.2, color: C.violet, y: 2, emissive: 0x221144 }); L.label('คลิปเที่ยวเชียงคาน 60 วิ', { parent: core, y: 1.6, cls: 'tag' });
      const el = [['ข้อความ', 'ให้ข้อมูลชัด', 10], ['ภาพ', 'ดึงดูดสายตา', 20], ['เสียง', 'สร้างอารมณ์', 25], ['วิดีโอ', 'เล่าเรื่อง', 25], ['แอนิเมชัน', 'อธิบายสิ่งที่ถ่ายจริงไม่ได้', 10], ['การโต้ตอบ', 'ผู้ใช้เลือกเองได้', 10]];
      const on = el.map((e, i) => i !== 5);
      const orbs = el.map(([n, f], i) => { const s = L.sphere({ r: 0.45, color: PALETTE[i] }); s.lbl = L.label(`${n}<br><small>${f}</small>`, { parent: s, y: 0.8, cls: 'tag' }); return s; });
      const rE = L.readout('ความน่าสนใจ (สมมติ)'), rT = L.readout('ประเภทสื่อ');
      L.loop((dt, t) => orbs.forEach((s, i) => { const a = t * 0.3 + (i / 6) * Math.PI * 2; s.position.set(Math.cos(a) * 4, 2 + Math.sin(t + i) * 0.3, Math.sin(a) * 3); s.visible = on[i]; }));
      const upd = () => { const sc = el.reduce((s, e, i) => s + (on[i] ? e[2] : 0), 0); rE(sc + ' / 100', sc > 70 ? 'good' : sc > 40 ? 'warn' : 'bad'); core.scale.setScalar(0.6 + sc / 200); rT(on[5] ? 'สื่อโต้ตอบ (Interactive)' : 'สื่อเชิงเส้น (Linear)'); };
      el.forEach((e, i) => L.toggle(e[0], on[i], (v) => { on[i] = v; upd(); }));
      L.steps([
        { t: 'มัลติมีเดีย = สื่อหลายแบบรวมกัน 6 องค์ประกอบ แต่ละอย่างมีหน้าที่ต่างกัน (อ่านใต้ชื่อแต่ละลูก)' },
        { t: 'ลองปิด "เสียง" ความน่าสนใจตกลงมาก นึกถึงคลิปผีที่ไม่มีเสียงประกอบ ยังน่ากลัวไหม' },
        { t: 'คลิปที่ดูจากต้นจนจบตามลำดับคือสื่อเชิงเส้น เปิด "การโต้ตอบ" กลายเป็นสื่อโต้ตอบ เช่น เกม เว็บ Google Maps ที่ผู้ใช้เลือกดูเอง' },
        { t: 'Generative AI สร้างองค์ประกอบเหล่านี้ได้จาก Prompt แต่มีข้อจำกัด: ข้อมูลผิด ภาษาไทยในภาพเพี้ยน อคติ ลิขสิทธิ์ Deepfake ต้องตรวจและติดป้ายเสมอ' },
      ]);
      upd();
      L.quiz('Google Maps เป็นสื่อแบบใด', ['สื่อเชิงเส้น', 'สื่อโต้ตอบ', 'ไม่ใช่สื่อมัลติมีเดีย'], 1, 'ผู้ใช้เลื่อน ซูม ค้นหาเองได้ จึงเป็นสื่อโต้ตอบ');
    },
  },

  2: {
    idea: 'ซูมวงกลมแบบ Raster (พิกเซล) เทียบ Vector (สมการเส้น) คำนวณขนาดงานพิมพ์จากพิกเซลและ dpi และผสมสี RGB ในลูกบาศก์สี',
    build(L) {
      L.cam(0, 6, 15, 0, 2.5, 0); L.floor(40);
      const rg = L.group({ x: -5, y: 2.5 }), vg = L.group({ x: 0, y: 2.5 });
      L.label('Raster (พิกเซล)', { x: -5, y: 5.4, cls: 'tag' }); L.label('Vector (สมการเส้น)', { x: 0, y: 5.4, cls: 'tag' });
      let res = 12;
      const ring = L.torus({ r: 2, t: 0.2, color: C.amber, parent: vg, seg: 128 });
      function raster() {
        L.clearGroup(rg); const n = res, s = 4.6 / n;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
          const x = (i + 0.5) * s - 2.3, y = (j + 0.5) * s - 2.3, d = Math.hypot(x, y);
          if (Math.abs(d - 2) < s * 0.75) L.box({ w: s * 0.96, h: s * 0.96, d: 0.2, color: C.amber, x, y, parent: rg, edges: false });
        }
      }
      L.slider('ความละเอียดภาพ Raster', { min: 6, max: 48, value: 12, fmt: (v) => `${v}×${v} px` }, (v) => { res = v; raster(); });
      L.slider('ซูม', { min: 1, max: 5, step: 0.1, value: 1, fmt: (v) => Math.round(v * 100) + '%' }, (v) => { rg.scale.setScalar(v); vg.scale.setScalar(v); });
      let px = 3000, dpi = 300;
      const rP = L.readout('ขนาดงานพิมพ์'), rF = L.readout('ขนาดไฟล์ (24 บิต ก่อนบีบอัด)');
      const pr = () => { const inch = px / dpi; rP(`${px} ÷ ${dpi} = ${r2(inch)} นิ้ว (${r2(inch * 2.54)} ซม.)`); rF(`${px}×${Math.round(px * 2 / 3)}×24÷8 = ${r2(px * px * 2 / 3 * 3 / 1e6)} MB`); };
      L.slider('จำนวนพิกเซลด้านกว้าง', { min: 600, max: 6000, step: 100, value: 3000, unit: 'px' }, (v) => { px = v; pr(); });
      L.select('dpi', ['72 dpi (จอ)', '150 dpi', '300 dpi (งานพิมพ์)'], (i) => { dpi = [72, 150, 300][i]; pr(); }, 2);
      const cube = L.box({ w: 2, h: 2, d: 2, color: 0xff0000, x: 5.5, y: 2.5 }); const cL = L.label('', { parent: cube, y: 1.6, cls: 'tag' });
      const rgb = [30, 107, 82];
      const col = () => { const h = '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase(); cube.material.color.set(h); cL.set(`RGB(${rgb.join(', ')}) = ${h}`); };
      ['R แดง', 'G เขียว', 'B น้ำเงิน'].forEach((n, i) => L.slider(n, { min: 0, max: 255, value: rgb[i] }, (v) => { rgb[i] = v; col(); }));
      L.loop((dt) => (cube.rotation.y += dt * 0.4));
      L.steps([
        { t: 'ภาพ Raster ทำจากพิกเซลเรียงกันเหมือนโมเสก ภาพ Vector เก็บเป็นสมการเส้น ลองเลื่อน "ซูม" ไป 500% ฝั่งซ้ายเห็นขั้นบันได ฝั่งขวายังคม', f: () => L.flyTo(-2.5, 4, 10, -2.5, 2.5, 0) },
        { t: 'เพิ่มความละเอียด Raster ขอบเนียนขึ้น แต่ไฟล์ใหญ่ขึ้น โลโก้ที่ต้องใช้ทั้งบนเสื้อและป้ายไวนิลจึงควรเป็น Vector (SVG)' },
        { t: 'ขนาดงานพิมพ์ = พิกเซล ÷ dpi ภาพ 3000 px ที่ 300 dpi = 10 นิ้ว (25.4 ซม.) กระดาษ A4 ที่ 300 dpi ต้องใช้ประมาณ 2480 × 3508 px' },
        { t: 'ลูกบาศก์ขวา: จอผสมแสง RGB (แดง เขียว น้ำเงิน) เขียนแบบเว็บเป็น HEX งานพิมพ์ใช้หมึก CMYK สีสดบนจอบางสีพิมพ์ออกมาจึงหม่นลง', f: () => L.flyTo(4, 4, 9, 5.5, 2.5, 0) },
      ]);
      raster(); col();
      L.quiz('ภาพ 1200 × 1800 px พิมพ์ที่ 300 dpi ได้ขนาดเท่าไร', ['4 × 6 นิ้ว', '12 × 18 นิ้ว', '40 × 60 นิ้ว'], 0, '1200 ÷ 300 = 4 นิ้ว และ 1800 ÷ 300 = 6 นิ้ว');
    },
  },

  3: {
    idea: 'โปสเตอร์รก ๆ ที่ค่อย ๆ ดีขึ้นทีละหลักการ C-R-A-P เปิดทีละข้อแล้วดูชิ้นส่วนเลื่อนเข้าที่',
    build(L) {
      L.cam(0, 3, 12, 0, 3, 0);
      L.box({ w: 6.2, h: 8.6, d: 0.1, color: 0xf3eee4, y: 3.6, z: -0.1, edges: false });
      const items = {
        title: L.texPlane({ w: 5, h: 1.2, pw: 1000, ph: 240, z: 0.05 }, () => {}),
        img: L.box({ w: 4.6, h: 2.6, d: 0.05, color: C.teal, z: 0.05, edges: false }),
        date: L.texPlane({ w: 3, h: 0.5, pw: 600, ph: 100, z: 0.05 }, () => {}),
        time: L.texPlane({ w: 3, h: 0.5, pw: 600, ph: 100, z: 0.05 }, () => {}),
        place: L.texPlane({ w: 3, h: 0.5, pw: 600, ph: 100, z: 0.05 }, () => {}),
        cta: L.box({ w: 2.6, h: 0.7, d: 0.08, color: C.slate, z: 0.06, edges: false }),
      };
      const ctaL = L.label('สมัครเลย!', { parent: items.cta, cls: 'plain' });
      const st = { C: false, R: false, A: false, P: false };
      const txt = (pl, t, size, color, font) => pl.tex.redraw((ctx, w, h) => { ctx.fillStyle = color; ctx.font = `${size}px ${font}`; ctx.textBaseline = 'middle'; ctx.fillText(t, 10, h / 2); });
      async function layout() {
        const fonts = st.R ? ['Mitr, sans-serif', 'Sarabun, sans-serif'] : ['serif', 'cursive'];
        txt(items.title, 'แยกขยะ ลดโลกร้อน', st.C ? 150 : 90, st.C ? '#0f4f45' : '#7d8a94', fonts[0]);
        txt(items.date, 'วันศุกร์ 14 พ.ย.', 56, st.R ? '#0f4f45' : '#b0573a', fonts[1]);
        txt(items.time, '12.00–12.40 น.', 56, st.R ? '#0f4f45' : '#5b3ab0', st.R ? fonts[1] : 'monospace');
        txt(items.place, 'ลานหน้าอาคาร 2', 56, st.R ? '#0f4f45' : '#3a8ab0', st.R ? fonts[1] : 'fantasy');
        L.color(items.cta, st.C ? C.amber : C.slate); ctaL.element.style.color = st.C ? '#3a2400' : '#ccc';
        items.img.material.color.set(st.R ? C.teal : C.pink);
        const ax = st.A ? -0.3 : 0;
        const pos = {
          title: st.A ? [ax + 0.2, 6.9] : [0.6, 7.1], img: st.A ? [0, 4.8] : [-0.5, 4.6],
          date: st.P ? [ax - 0.7, 2.7] : st.A ? [ax - 0.7, 2.7] : [1.3, 1.1],
          time: st.P ? [ax - 0.7, 2.15] : st.A ? [ax - 0.7, 1.6] : [-1.2, 3.0],
          place: st.P ? [ax - 0.7, 1.6] : st.A ? [ax - 0.7, 0.5] : [0.8, 6.0],
          cta: st.P ? [1.5, 0.4] : st.A ? [1.6, 1.6] : [-1.5, 0.3],
        };
        await Promise.all(Object.entries(pos).map(([k, [x, y]]) => L.moveTo(items[k], x, y, items[k].position.z, 600)));
      }
      [['C — Contrast ความต่าง', 'C'], ['R — Repetition การซ้ำ', 'R'], ['A — Alignment การจัดแนว', 'A'], ['P — Proximity ความใกล้ชิด', 'P']].forEach(([t, k]) => L.toggle(t, false, (v) => { st[k] = v; layout(); }));
      L.steps([
        { t: 'โปสเตอร์ตอนนี้: หัวเรื่องเล็กสีจาง ฟอนต์ 4 แบบ วางลอย ๆ วัน เวลา สถานที่กระจาย 3 มุม สายตาไม่รู้จะเริ่มอ่านตรงไหน' },
        { t: 'C: สิ่งสำคัญต้องต่างให้ชัด หัวเรื่องใหญ่ เข้ม ปุ่มสีเด่น "ถ้าจะต่างต้องต่างให้สุด"' },
        { t: 'R: ใช้สี ฟอนต์ รูปแบบเดิมซ้ำ ๆ ทั้งชิ้นดูเป็นชุดเดียวกัน (Canva Brand Kit ช่วยได้)' },
        { t: 'A: ทุกอย่างเกาะเส้นแนวเดียวกัน ไม่วางลอย ๆ / P: วัน เวลา สถานที่ เป็นเรื่องเดียวกัน วางชิดกันเป็นกลุ่ม' },
        { t: 'Magic Design สร้างโปสเตอร์ได้ใน 30 วินาที แต่ AI ทำ 70% เราต้องตรวจด้วย CRAP และแก้ข้อความ/ภาพให้ตรงบริบทอีก 30%' },
      ]);
      layout();
      L.quiz('ชุดสื่อ 3 ขนาด (โพสต์ สตอรี่ A4) ดูเป็นแคมเปญเดียวกันได้เพราะหลักข้อใด', ['Contrast', 'Repetition', 'Proximity'], 1, 'Repetition: ใช้สี ฟอนต์ โลโก้ ซ้ำในทุกชิ้น');
    },
  },

  4: {
    idea: 'เครื่องสร้างภาพจำลอง: เติม Prompt ทีละองค์ประกอบ (วัตถุ การกระทำ ฉาก สไตล์ แสง มุมกล้อง) แล้วดูภาพเปลี่ยน พร้อม Negative prompt และกติกาจริยธรรม',
    build(L) {
      L.cam(0, 3, 9, 0, 1, 0);
      const st = { act: false, scene: false, style: 0, light: 0, cam: 0, neg: false };
      const g = L.group();
      const fr = L.box({ w: 7, h: 4.6, d: 0.1, color: 0x0b141b, y: 1.9, z: -2.2, edges: true });
      const wm = L.label('ภาพสร้างด้วย AI', { x: 2.8, y: 0, z: 0.5, cls: 'tick' });
      const rP = L.readout('Prompt ปัจจุบัน');
      function draw() {
        L.clearGroup(g);
        const mat = st.style === 1 ? { opacity: 1 } : {};
        const flat = st.style === 2;
        const catC = flat ? 0xff9a3c : 0xd9822b;
        const lieY = st.act ? 0.45 : 0.75;
        const body = L.box({ w: 1.4, h: st.act ? 0.5 : 0.8, d: 0.7, color: catC, y: lieY, parent: g, edges: flat });
        const head = L.sphere({ r: 0.38, color: catC, x: 0.85, y: lieY + 0.25, parent: g });
        L.cone({ r: 0.12, h: 0.3, color: catC, x: 0.75, y: lieY + 0.65, parent: g }); L.cone({ r: 0.12, h: 0.3, color: catC, x: 1.0, y: lieY + 0.65, parent: g });
        if (st.act) L.box({ w: 2.2, h: 0.08, d: 1.4, color: 0xc9b178, y: 0.16, parent: g, edges: false });
        if (st.scene) { L.box({ w: 6.6, h: 3.8, d: 0.1, color: 0x8a6a46, y: 1.9, z: -2.1, parent: g, edges: false }); L.box({ w: 2.4, h: 1.6, d: 0.12, color: st.light === 1 ? 0xffc27a : 0x9ed0f2, x: -1.6, y: 2.4, z: -2, parent: g, edges: false }); L.box({ w: 2.2, h: 0.15, d: 0.15, color: 0x5a4130, x: -1.6, y: 2.4, z: -1.9, parent: g, edges: false }); }
        if (!st.neg) { const t = L.label('ทแมสวยาจ๊ะ 2O25', { x: -2.4, y: 3.6, z: -1.9, cls: 'plain' }); t.element.style.cssText += ';font:700 20px serif;color:#e8d36a;transform:rotate(-8deg)'; g.add(t); }
        const warm = st.light === 1;
        L.scene.background = new L.THREE.Color(warm ? 0x3a2414 : 0x0f1a22);
        const camPos = [[0, 3, 9, 0, 1, 0], [1.2, 1.2, 3.2, 0.6, 0.8, 0], [0, 7, 4, 0, 0.5, 0]][st.cam];
        L.flyTo(...camPos, 600);
        const parts = ['แมวส้ม', st.act && 'นอนบนเสื่อกก', st.scene && 'ข้างหน้าต่างบ้านไม้ริมโขงเชียงคาน', ['', 'ภาพถ่าย', 'ภาพการ์ตูนสีเรียบ'][st.style], ['', 'แสงแดดยามเย็นสีทอง'][st.light], ['ภาพมุมกว้าง', 'ภาพระยะใกล้ ฉากหลังเบลอ', 'มุมสูงมองลง'][st.cam]].filter(Boolean);
        rP(parts.join(' ') + (st.neg ? ' · Negative: ไม่มีตัวหนังสือ' : ''));
      }
      L.onCleanup(() => (L.scene.background = null));
      L.toggle('การกระทำ: นอนบนเสื่อกก', false, (v) => { st.act = v; draw(); });
      L.toggle('ฉาก: หน้าต่างบ้านไม้ริมโขง', false, (v) => { st.scene = v; draw(); });
      L.select('สไตล์', ['ไม่ระบุ', 'ภาพถ่าย', 'การ์ตูนสีเรียบ'], (i) => { st.style = i; draw(); });
      L.select('แสงและสี', ['ไม่ระบุ', 'แสงแดดยามเย็นสีทอง'], (i) => { st.light = i; draw(); });
      L.select('มุมกล้อง', ['มุมกว้าง', 'ระยะใกล้ ฉากหลังเบลอ', 'มุมสูงมองลง'], (i) => { st.cam = i; draw(); });
      L.toggle('Negative prompt: ไม่มีตัวหนังสือ', false, (v) => { st.neg = v; draw(); });
      L.steps([
        { t: 'สั่งแค่ "แมว" ได้แมวธรรมดา ๆ ไม่รู้ว่าอยู่ที่ไหน ทำอะไร สไตล์ไหน และมีตัวหนังสือมั่ว ๆ ลอยอยู่ (AI มักเขียนภาษาไทยเพี้ยน)' },
        { t: 'สูตร 6 องค์ประกอบ: วัตถุ · การกระทำ · ฉาก · สไตล์ · แสงและสี · มุมกล้อง ลองเปิดทีละข้อ ปรับทีละเรื่องจะรู้ว่าคำไหนเปลี่ยนภาพ' },
        { t: 'Negative prompt บอกสิ่งที่ "ไม่เอา" เปิดแล้วตัวหนังสือมั่วหายไป ข้อความไทยให้ใส่เองใน Canva ภายหลัง' },
        { t: 'กติกา 4 ข้อ: ไม่สร้างภาพบุคคลจริง · ไม่ทำให้เข้าใจผิดว่าเป็นภาพจริง · ติดป้าย "ภาพสร้างด้วย AI" (มุมขวาล่าง) · ให้เครดิตภาพของคนอื่น' },
      ]);
      draw();
      L.quiz('ภาพที่ได้มืดเกินไป ควรแก้ Prompt อย่างไร', ['เปลี่ยนวัตถุเป็นสัตว์อื่น', 'เพิ่มคำเรื่องแสง เช่น "แสงสว่างกลางวัน"', 'พิมพ์คำเดิมซ้ำหลายครั้ง'], 1, 'แก้องค์ประกอบที่เป็นสาเหตุ (แสง) ทีละเรื่อง');
    },
  },

  5: {
    idea: 'คลื่นเสียงต่อเนื่องถูก "สุ่มวัด" เป็นจุด ๆ ปรับ Sample rate และ Bit depth แล้วดูคลื่นที่สร้างกลับเหมือนเดิมแค่ไหน พร้อมคำนวณขนาดไฟล์',
    build(L) {
      L.cam(0, 3, 13, 0, 1.5, 0); L.floor(36);
      const W = 12, x0 = -6, yc = 2.2, A = 1.6;
      const f = (x) => Math.sin(x * 2.2) * 0.75 + Math.sin(x * 5.3 + 1) * 0.25;
      const pts = []; for (let i = 0; i <= 400; i++) { const x = (i / 400) * W; pts.push([x0 + x, yc + f(x) * A, 0]); }
      L.line(pts, C.sky); L.label('คลื่นเสียงจริง (แอนะล็อก)', { x: -4.5, y: 4.3, cls: 'tag', color: C.sky });
      L.line([[x0, yc, 0], [x0 + W, yc, 0]], 0x3d5466);
      const samp = L.group(), recon = L.line([[0, 0, 0], [0, 0, 0]], C.amber);
      let sr = 16, bits = 3, sec = 60, ch = 2, rateK = 44.1, bd = 16;
      const rS = L.readout('จุดที่วัด'), rQ = L.readout('ระดับความดังที่เก็บได้'), rF = L.readout('ขนาด WAV'), rM = L.readout('ขนาด MP3 128 kbps');
      function draw() {
        L.clearGroup(samp); const levels = Math.pow(2, bits), stepY = 2 / (levels - 1), rp = [];
        for (let i = 0; i <= sr; i++) {
          const x = (i / sr) * W, q = Math.round((f(x) + 1) / stepY) * stepY - 1, y = yc + q * A;
          samp.add(L.line([[x0 + x, yc, 0], [x0 + x, y, 0]], C.amber, 0.5)); L.sphere({ r: 0.07, color: C.amber, x: x0 + x, y, parent: samp });
          rp.push([x0 + x, y, 0]); if (i < sr) rp.push([x0 + ((i + 1) / sr) * W, y, 0]);
        }
        L.setLine(recon, rp);
        rS(sr + ' จุด'); rQ(`${levels} ระดับ (${bits} บิต)`);
      }
      function size() { const b = rateK * 1000 * bd * ch * sec / 8; rF(`${rateK} kHz × ${bd} บิต × ${ch} ช่อง × ${sec} วิ ÷ 8 = ${r2(b / 1e6)} MB`); rM(`128,000 × ${sec} ÷ 8 = ${r2(128000 * sec / 8 / 1e6)} MB`); }
      L.slider('จำนวนจุดสุ่มในช่วงนี้ (แทน Sample rate)', { min: 6, max: 120, value: 16 }, (v) => { sr = v; draw(); });
      L.slider('Bit depth (ในภาพ)', { min: 2, max: 8, value: 3, unit: 'บิต' }, (v) => { bits = v; draw(); });
      L.note('<b>คำนวณขนาดไฟล์เสียงจริง</b>');
      L.select('Sample rate', ['8 kHz (โทรศัพท์)', '44.1 kHz (ซีดีเพลง)', '48 kHz (วิดีโอ)'], (i) => { rateK = [8, 44.1, 48][i]; size(); }, 1);
      L.select('Bit depth', ['16 บิต', '24 บิต'], (i) => { bd = [16, 24][i]; size(); });
      L.select('ช่องเสียง', ['Mono (1)', 'Stereo (2)'], (i) => { ch = i + 1; size(); }, 1);
      L.slider('ความยาว', { min: 10, max: 300, step: 10, value: 60, unit: 'วินาที' }, (v) => { sec = v; size(); });
      L.steps([
        { t: 'เส้นสีฟ้าคือคลื่นเสียงจริงที่ต่อเนื่อง คอมเก็บได้แค่ตัวเลข จึง "สุ่มวัด" เป็นจุด ๆ (จุดสีเหลือง) เรียกว่า Sampling' },
        { t: 'เส้นสีเหลืองคือเสียงที่คอมสร้างกลับ ตอนนี้จุดน้อยและระดับหยาบ เสียงจะอู้อี้เหมือนโทรศัพท์บ้าน 8 kHz' },
        { t: 'เพิ่มจุดสุ่ม (Sample rate) และ Bit depth เส้นเหลืองแนบเส้นฟ้ามากขึ้น 44.1 kHz คือคุณภาพซีดีเพลง' },
        { t: 'เพลง 1 นาที WAV 44.1 kHz 16 บิต สเตอริโอ = 10.6 MB แต่ MP3 128 kbps ≈ 0.96 MB ตัดต่อใช้ WAV เผยแพร่ใช้ MP3' },
      ]);
      draw(); size();
      L.quiz('เปลี่ยนไฟล์ WAV จาก Stereo เป็น Mono ขนาดไฟล์เป็นอย่างไร', ['เท่าเดิม', 'ลดลงครึ่งหนึ่ง', 'เพิ่มขึ้น 2 เท่า'], 1, 'จำนวนช่องในสูตรลดจาก 2 เป็น 1 ผลคูณจึงเหลือครึ่งหนึ่ง');
    },
  },

  6: {
    idea: 'กองถ่ายจำลอง: แม่ค้าข้าวปุ้นกับลูกค้า เลือกขนาดภาพ (Wide → Extreme close-up) และมุมกล้อง แล้วดูว่าแต่ละช็อตเล่าเรื่องอะไร',
    build(L) {
      L.floor(36, 0x2a2420);
      const person = (x, z, c, ry = 0) => { const g = L.group({ x, z, ry }); L.cyl({ r: 0.35, rt: 0.3, h: 1.3, color: c, y: 0.65, parent: g }); L.sphere({ r: 0.28, color: 0xe0b48a, y: 1.55, parent: g }); return g; };
      L.box({ w: 3.4, h: 0.9, d: 1.1, color: 0x8a5a3a, y: 0.45, z: -0.6 }); L.label('ร้านข้าวปุ้นตลาดเช้า', { x: 0, y: 3.4, z: -2, cls: 'tag' });
      L.box({ w: 4.2, h: 0.1, d: 2.2, color: C.red, y: 2.6, z: -0.9, edges: false });
      const bowl = L.cyl({ r: 0.32, rt: 0.32, rb: 0.2, h: 0.2, color: 0xf3f6f8, x: 0.3, y: 1.0, z: -0.5 }); L.cyl({ r: 0.29, h: 0.04, color: 0xd28a3c, x: 0.3, y: 1.09, z: -0.5 });
      person(-0.4, -1.5, C.teal); person(1.2, 1.4, C.blue, Math.PI);
      for (let i = 0; i < 6; i++) L.box({ w: 2, h: 1.6, d: 1.2, color: [0x6d4c3d, 0x56677a][i % 2], x: -9 + i * 3.6, y: 0.8, z: -5 });
      const shots = {
        'Wide (ภาพกว้าง)': [[0, 3, 10], [0, 1, -1], 'บอกว่า "ที่ไหน" เห็นร้านทั้งร้านและตลาด'],
        'Medium (ครึ่งตัว)': [[0.8, 1.6, 3.2], [-0.3, 1.2, -1.2], 'เห็นการกระทำ แม่ค้ากำลังตักน้ำยา'],
        'Close-up (ใบหน้า)': [[0.1, 1.6, 0.4], [-0.4, 1.55, -1.5], 'เห็นอารมณ์บนใบหน้า'],
        'Extreme close-up': [[0.3, 1.7, 0.2], [0.3, 1.0, -0.5], 'รายละเอียด น้ำยาราดบนเส้นข้าวปุ้น'],
        'Over the shoulder': [[2.1, 2.1, 3.4], [-0.4, 1.4, -1.5], 'ข้ามไหล่ลูกค้า ใช้ตอนสองคนคุยกัน'],
        'มุมต่ำมองขึ้น': [[0.3, 0.3, 2], [-0.4, 1.8, -1.5], 'ตัวละครดูยิ่งใหญ่ มีพลัง'],
        'มุมสูงมองลง': [[0.3, 5.5, 2.2], [-0.2, 0.6, -0.9], 'ตัวละครดูเล็ก หรือเห็นภาพรวมจากด้านบน'],
      };
      const names = Object.keys(shots);
      const rS = L.readout('ช็อตนี้เล่าอะไร');
      const go = (n) => { const [p, t, m] = shots[n]; L.flyTo(...p, ...t, 800); rS(m); };
      L.buttons(names.map((n) => [n, () => go(n)]), { radio: true, active: 0 });
      L.cam(0, 3, 10, 0, 1, -1); rS(shots[names[0]][2]);
      L.steps([
        { t: 'คลิปสั้นเริ่มด้วย Hook 3 วินาที: ภาพที่ดึงความสนใจทันที เช่น Extreme close-up น้ำยาราดเส้น แล้วค่อยเล่าเรื่องต่อ', f: () => go('Extreme close-up') },
        { t: 'Wide บอกสถานที่ ตามด้วย Medium เห็นการกระทำ แล้ว Close-up เห็นอารมณ์ ลำดับนี้ช่วยให้คนดูไม่หลง', f: () => go('Wide (ภาพกว้าง)') },
        { t: 'มุมกล้องเปลี่ยนความรู้สึก: มุมต่ำทำให้ดูสง่า มุมสูงทำให้ดูเล็ก ระดับสายตาดูเป็นธรรมชาติ', f: () => go('มุมต่ำมองขึ้น') },
        { t: 'สตอรีบอร์ดแต่ละช่องเขียน: ภาพร่าง ขนาดภาพ มุมกล้อง เวลา เสียง ใช้ AI แตกบทได้ แต่ต้องบอกข้อจำกัดจริง เช่น "ถ่ายด้วยมือถือ ไม่มีโดรน"', f: () => go('Over the shoulder') },
      ]);
      L.quiz('อยากให้คนดูรู้ว่าเหตุการณ์เกิดที่ไหน ควรเปิดด้วยภาพขนาดใด', ['Extreme close-up', 'Wide shot', 'Close-up'], 1, 'Wide shot เห็นสถานที่และบริบทโดยรวม');
    },
  },

  7: {
    idea: 'ตัวเลขของวิดีโอ: เทียบขนาดเฟรม 720p 1080p 4K อัตราส่วน 16:9 9:16 1:1 ดู fps เป็นแถบฟิล์ม และคิดขนาดไฟล์จาก bitrate',
    build(L) {
      L.cam(0, 4, 15, 0, 2.5, 0); L.floor(40);
      const g = L.group();
      const res = [['720p', 1280, 720, C.slate], ['1080p', 1920, 1080, C.teal], ['4K', 3840, 2160, C.violet]];
      res.forEach(([n, w, h, c], i) => { const s = 1 / 600; const p = L.box({ w: w * s, h: h * s, d: 0.05, color: c, x: -3 + (w * s) / 2 - 3.2, y: (h * s) / 2 + 0.05, z: -i * 0.15, opacity: 0.75, edges: true }); L.label(`${n} ${w}×${h}`, { x: -6.2 + w * s, y: h * s + 0.1, z: 0.2, cls: 'tick' }); });
      const asp = L.group({ x: 4.5 });
      let ratio = 1;
      function aspect() { L.clearGroup(asp); const [w, h, n] = [[3.2, 1.8, '16:9 YouTube'], [1.35, 2.4, '9:16 TikTok/Reels'], [2.2, 2.2, '1:1 โพสต์']][ratio]; L.box({ w, h, d: 0.05, color: C.amber, y: h / 2 + 0.05, parent: asp, opacity: 0.85 }); asp.add(L.label(n, { y: h + 0.35, cls: 'tag' })); }
      L.select('อัตราส่วน', ['16:9', '9:16', '1:1'], (i) => { ratio = i; aspect(); }, 1);
      const strip = L.group({ y: 0.6, z: 3 });
      let fps = 24, br = 8, sec = 60;
      const rF = L.readout('fps'), rB = L.readout('ขนาดไฟล์ ≈ bitrate × เวลา ÷ 8');
      function film() { L.clearGroup(strip); const n = fps, w = 12 / n; for (let i = 0; i < n; i++) L.box({ w: w * 0.85, h: 0.7, d: 0.05, color: i % 2 ? C.sky : 0x8fd3ff, x: -6 + w / 2 + i * w, parent: strip, edges: false }); strip.add(L.label(`1 วินาที = ${fps} เฟรม`, { x: 0, y: 0.8, cls: 'tag' })); rF(fps + (fps >= 60 ? ' (ลื่นมาก กีฬา)' : fps >= 30 ? ' (วิดีโอทั่วไป)' : ' (แบบภาพยนตร์)')); }
      const size = () => rB(`${br} Mbps × ${sec} วิ ÷ 8 = ${r2(br * sec / 8)} MB`, br * sec / 8 > 200 ? 'warn' : 'good');
      L.select('Frame rate', ['24 fps', '30 fps', '60 fps'], (i) => { fps = [24, 30, 60][i]; film(); });
      L.slider('Bitrate', { min: 2, max: 50, value: 8, unit: 'Mbps' }, (v) => { br = v; size(); });
      L.slider('ความยาวคลิป', { min: 10, max: 180, step: 10, value: 60, unit: 'วินาที' }, (v) => { sec = v; size(); });
      let t = 0; const dot = L.sphere({ r: 0.12, color: C.amber, y: 0.6, z: 3.2 });
      L.loop((dt) => { t = (t + dt) % 1; dot.position.x = -6 + 12 * (Math.floor(t * fps) / fps) + 6 / fps; });
      L.steps([
        { t: 'แผ่นสี 3 แผ่นซ้อนกัน: 4K มีพิกเซลมากกว่า 1080p ถึง 4 เท่า ภาพละเอียดแต่ไฟล์ใหญ่มาก', f: () => L.flyTo(-3, 3, 9, -3, 1.5, 0) },
        { t: 'อัตราส่วนเลือกตามช่องทาง: TikTok/Reels 9:16 แนวตั้ง YouTube 16:9 ต้องถือมือถือให้ถูกตั้งแต่ตอนถ่าย', f: () => L.flyTo(4.5, 3, 8, 4.5, 1.5, 0) },
        { t: 'แถบฟิล์ม: 1 วินาทีมีกี่ภาพนิ่ง 24 fps ดูเป็นภาพยนตร์ 30 ทั่วไป 60 ลื่นมาก เหมาะกับกีฬา จุดเหลืองกระโดดทีละเฟรม', f: () => L.flyTo(0, 3, 9, 0, 0.6, 3) },
        { t: 'ถ่าย 4K 60fps (~50 Mbps) 1 นาที ≈ 375 MB 1080p 30fps (~8 Mbps) 1 นาที ≈ 60 MB สำหรับโซเชียล 1080p 30fps ก็พอ', f: () => L.flyTo(0, 4, 15, 0, 2.5, 0) },
      ]);
      aspect(); film(); size();
      L.quiz('คลิป 30 วินาที bitrate 8 Mbps มีขนาดประมาณเท่าไร', ['30 MB', '240 MB', '3.75 MB'], 0, '8 × 30 ÷ 8 = 30 MB');
    },
  },

  8: {
    idea: 'ลูกบอลกระเด้งพร้อมเงาเฟรมก่อนหน้า (Onion skin) เปิด–ปิด Ease in–out และ Squash & Stretch ปรับ fps แล้วดูว่าลูกบอล "มีชีวิต" ขึ้นอย่างไร',
    build(L) {
      L.cam(0, 3, 12, 0, 2.5, 0); L.floor(30);
      const ball = L.sphere({ r: 0.6, color: C.orange, y: 0.6 });
      const ghosts = [1, 2, 3, 4].map((k) => L.sphere({ r: 0.6, color: C.orange, opacity: 0.35 - k * 0.07 }));
      let fps = 12, ease = true, squash = true, onion = true, acc = 0, t = 0;
      const pose = (k) => {
        const ph = k % 1, x = -5 + ((k % 3) / 3) * 10;
        const h = ease ? 4.5 * (1 - Math.pow(2 * ph - 1, 2)) : 4.5 * (1 - Math.abs(2 * ph - 1));
        const v = ease ? Math.abs(2 * ph - 1) : 0;
        let sy = 1, sx = 1;
        if (squash) { if (h < 0.15) { sy = 0.6; sx = 1.3; } else { sy = 1 + v * 0.35; sx = 1 / Math.sqrt(sy); } }
        return { x, y: 0.6 * sy + h, sx, sy };
      };
      function apply(m, p) { m.position.set(p.x, p.y, 0); m.scale.set(p.sx, p.sy, p.sx); }
      L.loop((dt) => {
        acc += dt; if (acc < 1 / fps) return; acc = 0; t += 1 / fps / 1.2;
        apply(ball, pose(t));
        ghosts.forEach((gm, i) => { gm.visible = onion; apply(gm, pose(t - (i + 1) / fps / 1.2)); });
      });
      const rF = L.readout('fps');
      L.slider('fps', { min: 4, max: 60, value: 12 }, (v) => { fps = v; rF(v + (v < 10 ? ' (กระตุก)' : v < 24 ? ' (การ์ตูนวาดมือ)' : ' (ลื่น)')); });
      L.toggle('Ease in–out (ค่อย ๆ เร่ง ค่อย ๆ ช้า)', true, (v) => (ease = v));
      L.toggle('Squash & Stretch (แบนเมื่อกระทบ ยืดเมื่อตก)', true, (v) => (squash = v));
      L.toggle('Onion skin (เห็นเฟรมก่อนหน้า)', true, (v) => (onion = v));
      L.steps([
        { t: 'ภาพติดตา: ตาเราค้างภาพไว้ชั่วครู่ ภาพนิ่งที่มาเร็วพอจึงดูเหมือนเคลื่อนไหว แต่ละภาพเรียกว่า "เฟรม"' },
        { t: 'ลด fps เหลือ 6 ลูกบอลกระตุก เพิ่มเป็น 30 ลื่นขึ้น fps กำหนด "ความลื่น" ส่วนระยะห่างระหว่างเฟรมกำหนด "ความเร็ว"' },
        { t: 'ปิด Ease in–out ลูกบอลเคลื่อนเร็วเท่ากันตลอด ดูเหมือนหุ่นยนต์ ของจริงจะช้าที่จุดสูงสุดและเร็วตอนใกล้พื้น (ดูระยะเงาที่ห่างไม่เท่ากัน)' },
        { t: 'ปิด Squash & Stretch ลูกบอลดูแข็งเหมือนหิน เปิดแล้วดูนุ่ม มีน้ำหนัก หลักนี้ใช้ได้กับโลโก้เคลื่อนไหวใน Canva ด้วย' },
      ]);
      L.quiz('ถ้าอยากให้ลูกบอลตกเร็วขึ้นโดยระยะเท่าเดิม ต้องทำอย่างไร', ['เพิ่ม fps', 'ใช้จำนวนเฟรมน้อยลง (ระยะห่างระหว่างเฟรมมากขึ้น)', 'เปิด Onion skin'], 1, 'fps คือความลื่น ส่วนจำนวนเฟรมที่ใช้เคลื่อนที่กำหนดความเร็ว');
    },
  },

  9: {
    idea: 'ชุดสื่อเพื่อชุมชน 3 ชิ้น (โพสต์ สตอรี่ คลิป) จะดูเป็นแคมเปญเดียวกันเมื่อใช้ Brand Kit เดียวกัน ลองเปลี่ยนสีแบรนด์ แล้วปิด Brand Kit ดูความต่าง',
    build(L) {
      L.cam(0, 4, 13, 0, 2.5, 0); L.floor(36);
      const make = (x, w, h, name) => { const p = L.texPlane({ w, h, pw: Math.round(w * 160), ph: Math.round(h * 160), x, y: h / 2 + 0.3 }, () => {}); L.label(name, { x, y: -0.1, cls: 'tick' }); return p; };
      const media = [make(-5, 3, 3, 'โพสต์ 1080×1080'), make(-0.5, 2.1, 3.8, 'สตอรี่ 1080×1920'), make(4.6, 4.6, 2.6, 'คลิป 16:9')];
      let brand = '#1e6b52', kit = true;
      const rnd = ['#c0392b', '#8e44ad', '#2980b9', '#f39c12', '#16a085', '#d35400'];
      function draw() {
        media.forEach((m, i) => m.tex.redraw((ctx, w, h) => {
          const col = kit ? brand : rnd[(i * 2 + 1) % rnd.length];
          ctx.fillStyle = kit ? '#f6f3ea' : ['#fff3c4', '#d7f0ff', '#ffe0ec'][i]; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = col; ctx.fillRect(0, 0, w, h * 0.22);
          ctx.fillStyle = '#fff'; ctx.font = `600 ${Math.min(w * 0.075, h * 0.08)}px ${kit ? 'Mitr, sans-serif' : ['serif', 'cursive', 'monospace'][i]}`; ctx.fillText('ข้าวหลามบ้านนาอาน', w * 0.06, h * 0.14);
          ctx.fillStyle = kit ? col : rnd[(i + 3) % rnd.length]; ctx.beginPath(); ctx.arc(w * 0.82, h * 0.55, Math.min(w, h) * 0.13, 0, 7); ctx.fill();
          ctx.fillStyle = '#ffffff'; ctx.font = `600 ${Math.min(w, h) * 0.07}px Sarabun, sans-serif`; ctx.fillText('OTOP', w * 0.75, h * 0.57);
          ctx.fillStyle = '#2b3a46'; ctx.font = `${Math.min(w * 0.06, h * 0.06)}px Sarabun, sans-serif`; ctx.fillText('เปิดทุกวัน 7 โมงเช้า', w * 0.06, h * 0.45); ctx.fillText('ภาพบางส่วนตกแต่งด้วย AI', w * 0.06, h * 0.92);
        }));
      }
      L.select('สีหลักของแบรนด์', ['เขียวป่าภูหลวง', 'น้ำตาลกระบอกไม้ไผ่', 'ส้มดอกบัวตอง'], (i) => { brand = ['#1e6b52', '#7a4a24', '#e08a12'][i]; draw(); });
      L.toggle('ใช้ Brand Kit เดียวกันทุกชิ้น', true, (v) => { kit = v; draw(); });
      const chk = ['ประเด็นและกลุ่มเป้าหมายชัด', 'ขออนุญาตถ่ายภาพ/สัมภาษณ์แล้ว', 'เพลง/ภาพมีสิทธิ์ใช้ถูกต้อง', 'ติดป้ายการใช้ AI', 'ตรวจข้อมูล (เวลาเปิด ราคา) กับเจ้าของจริง'];
      const rC = L.readout('เช็กลิสต์ก่อนเผยแพร่', '0 / 5'); const done = chk.map(() => false);
      chk.forEach((c, i) => L.toggle(c, false, (v) => { done[i] = v; const n = done.filter(Boolean).length; rC(n + ' / 5', n === 5 ? 'good' : 'warn'); }));
      L.steps([
        { t: 'สื่อ 3 ชิ้นทำคนละขนาด แต่ใช้สี ฟอนต์ โลโก้ชุดเดียวกัน คนเห็นชิ้นไหนก็รู้ว่าเป็นแคมเปญเดียวกัน (หลัก Repetition)' },
        { t: 'ปิด "ใช้ Brand Kit" แต่ละชิ้นสีและฟอนต์คนละแบบ ดูเหมือน 3 ร้านคนละร้าน' },
        { t: 'แผนผลิต 5 คำถาม: เรื่องอะไร · ใครดู · ทำสื่ออะไร · ลงที่ไหน · ใครทำอะไรเสร็จเมื่อไร' },
        { t: 'ก่อนเผยแพร่ ติ๊กเช็กลิสต์ให้ครบ 5 ข้อ ถ่ายคนต้องขออนุญาต ถ้าเขาไม่สะดวก ถ่ายมือ สินค้า บรรยากาศแทน' },
      ]);
      draw();
      L.quiz('เจ้าของร้านไม่อยากให้ถ่ายหน้า ควรทำอย่างไร', ['ถ่ายแอบ ๆ ไม่ให้รู้', 'เคารพการตัดสินใจ ถ่ายมือ สินค้า บรรยากาศแทน', 'ใช้ AI สร้างหน้าคนแทน'], 1, 'เคารพสิทธิ์ความเป็นส่วนตัว และไม่สร้างภาพบุคคลที่ทำให้คนดูเข้าใจผิด');
    },
  },

  10: {
    idea: 'กรวยผลตอบรับ: คนเห็นโพสต์ → ดูจบ → มีส่วนร่วม → แสดงความคิดเห็น → ลงมือทำ ปรับแต่ละชั้นแล้วดูว่ายอดวิวอย่างเดียวไม่ได้บอกความสำเร็จ',
    build(L) {
      L.cam(0, 5, 13, 0, 2.5, 0); L.floor(36);
      const layers = [['เห็นโพสต์ (Reach)', 2000], ['ดูจบ', 45], ['ไลก์/แชร์', 20], ['คอมเมนต์', 15], ['มาซื้อ/มาร่วมงานจริง', 30]];
      const fun = L.group();
      const rows = layers.map(([n], i) => L.readout(n));
      function draw() {
        L.clearGroup(fun); let v = layers[0][1]; const vals = [v];
        for (let i = 1; i < layers.length; i++) { v = Math.round(v * layers[i][1] / 100); vals.push(v); }
        vals.forEach((x, i) => {
          const r = 0.4 + Math.sqrt(x / vals[0]) * 3.2;
          const c = L.cyl({ rt: r, rb: Math.max(0.3, r * 0.85), h: 0.8, color: PALETTE[i], y: 4.4 - i * 0.95, parent: fun, opacity: 0.9 });
          fun.add(L.label(`${layers[i][0]}: ${x.toLocaleString()} คน`, { x: r + 0.3, y: 4.4 - i * 0.95, cls: 'tag side' }));
          rows[i](x.toLocaleString() + ' คน', i === 4 ? (x >= 10 ? 'good' : 'warn') : '');
        });
      }
      L.slider('คนเห็นโพสต์', { min: 200, max: 10000, step: 100, value: 2000 }, (v) => { layers[0][1] = v; draw(); });
      ['% ที่ดูจบ', '% ที่ไลก์/แชร์', '% ที่คอมเมนต์', '% ที่ลงมือทำจริง'].forEach((n, i) => L.slider(n, { min: 1, max: 90, value: layers[i + 1][1], unit: '%' }, (v) => { layers[i + 1][1] = v; draw(); }));
      let cap = 'ข้าวหลามที่หอมที่สุดในเมืองเลยอยู่ตรงนี้ บ้านนาอาน เปิดทุกวัน 7 โมงเช้า #ของดีเมืองเลย #ข้าวหลามนาอาน #เลยอนุกูลวิทยา';
      const rT = L.readout('ตรวจแคปชัน');
      L.input('แคปชัน', cap, (v) => { const tags = (v.match(/#\S+/g) || []).length; rT(`แฮชแท็ก ${tags} อัน ${tags > 5 ? '(เยอะเกิน แนะนำ 3–5)' : tags < 1 ? '(ยังไม่มี)' : '(พอดี)'} · ${/เปิด|โทร|วัน/.test(v) ? 'มีข้อมูลติดต่อ/เวลา' : 'ขาดข้อมูลสำคัญ'}`, tags >= 1 && tags <= 5 ? 'good' : 'warn'); });
      L.steps([
        { t: 'ยอดคนเห็น 2,000 ดูเยอะ แต่ไล่ลงไปตามกรวย คนที่มาซื้อจริงเหลือไม่กี่คน ลองปรับแต่ละชั้นดู' },
        { t: 'เพิ่ม "% ที่ดูจบ" ด้วย Hook ที่ดีและคลิปกระชับ ส่งผลต่อทุกชั้นด้านล่าง มากกว่าการเพิ่มยอดเห็นอย่างเดียว' },
        { t: 'แคปชันที่ดี: ประโยคแรกดึงความสนใจ บอกที่ไหน เมื่อไร ติดต่ออย่างไร ชวนทำอะไร และแฮชแท็ก 3–5 อัน' },
        { t: 'ใช้ AI สรุปคอมเมนต์ได้ แต่ลบชื่อคนก่อน และอ่านคอมเมนต์จริงประกอบ AI อาจเข้าใจคำประชดผิด สิ่งที่ AI ทำแทนไม่ได้คือความเข้าใจคนดูและความรับผิดชอบ' },
      ]);
      draw();
      L.quiz('ตัวชี้วัดใดบอกว่าสื่อเพื่อชุมชน "ได้ผลจริง" ดีที่สุด', ['จำนวนแฮชแท็ก', 'จำนวนคนที่ลงมือทำจริง (มาซื้อ/มาร่วมงาน)', 'จำนวนสีในโปสเตอร์'], 1, 'ยอดเห็นเป็นแค่จุดเริ่ม เป้าหมายจริงคือผลต่อชุมชน');
    },
  },
};
