// ม.6 การออกแบบเว็บไซต์
import { C, PALETTE } from '../engine.js';

const r2 = (v) => Math.round(v * 100) / 100;
function lum(hex) { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
function hsl(h, s, l) { s /= 100; l /= 100; const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l); const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return '#' + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join(''); }

export default {
  1: {
    idea: 'แยกหน้าเว็บออกเป็นชั้น Header · Navigation · Content · Call to Action · Footer สลับมุมมองคอม/มือถือ แล้วให้คะแนนตามเกณฑ์เว็บที่ดี 4 ข้อ',
    build(L) {
      L.cam(6, 6, 11, 0, 2, 0); L.floor(30);
      const parts = [['Footer: ติดต่อ 042-xxx-xxx', 0.6, C.slate], ['Content: ร้านกาแฟริมโขง 3 ร้าน', 2.6, C.sky], ['Call to Action: ปุ่ม "จองโต๊ะ"', 0.5, C.amber], ['Navigation: หน้าแรก เมนู แผนที่ รีวิว', 0.4, C.violet], ['Header: โลโก้ + ชื่อเว็บ', 0.8, C.teal]];
      const g = L.group(); let mobile = false, gap = 0;
      function draw() {
        L.clearGroup(g); let y = 0; const w = mobile ? 2 : 6;
        parts.forEach(([n, h, c], i) => { const b = L.box({ w: n.startsWith('Call') ? w * 0.5 : w, h, d: 0.3, color: c, y: y + h / 2, z: i * gap, parent: g }); L.label(n, { parent: b, x: w / 2 + 0.2, cls: 'tag side' }); y += h + 0.05; });
      }
      L.buttons([['แยกชั้น', () => { gap = 0.8; draw(); }], ['รวมชั้น', () => { gap = 0; draw(); }]]);
      L.select('อุปกรณ์', ['คอมพิวเตอร์', 'มือถือ'], (i) => { mobile = i === 1; draw(); });
      const crit = ['ใช้ง่าย หาเมนูเจอ', 'โหลดเร็ว', 'อ่านง่าย ตัว ≥ 16px สีตัดกัน', 'ใช้บนมือถือได้'], ok = [true, false, true, false];
      const rS = L.readout('คะแนนเว็บนี้');
      const sc = () => { const n = ok.filter(Boolean).length; rS(n + ' / 4', n === 4 ? 'good' : n >= 2 ? 'warn' : 'bad'); };
      crit.forEach((c, i) => L.toggle(c, ok[i], (v) => { ok[i] = v; sc(); }));
      L.steps([
        { t: 'เปรียบเว็บกับร้านก๋วยเตี๋ยว: ป้ายร้าน = Header · เมนูบนผนัง = Navigation · ก๋วยเตี๋ยว = Content · "สั่งเลย!" = Call to Action · เบอร์สั่งกลับบ้าน = Footer', f: () => { gap = 0.8; draw(); } },
        { t: 'Call to Action คือปุ่มที่อยากให้ผู้ใช้กดมากที่สุด จึงต้องเด่น (สีส้ม) เว็บโรงเรียนอาจเป็น "สมัครเรียน" หรือ "ดูประกาศ"' },
        { t: 'สลับเป็นมือถือ เว็บต้องจัดเรียงใหม่ให้แคบลง คนไทยส่วนใหญ่เข้าเว็บจากมือถือ', f: () => { mobile = true; draw(); } },
        { t: 'เว็บสวยยังไม่พอ ต้องผ่าน 4 เกณฑ์ ให้คะแนนพร้อมหลักฐาน เช่น "ให้ 2 เพราะต้องซูมถึงอ่านได้" แล้วใช้ AI ร่าง Website Brief โดยเราเป็นบรรณาธิการ' },
      ]);
      draw(); sc();
      L.quiz('Call to Action ของเว็บร้านกาแฟควรเป็นอะไร', ['ข้อความลิขสิทธิ์', 'ปุ่ม "จองโต๊ะ/ดูแผนที่" ที่เด่นชัด', 'โลโก้ร้าน'], 1, 'CTA คือสิ่งที่อยากให้ผู้ใช้ทำ ต้องเห็นชัดและกดง่าย');
    },
  },

  2: {
    idea: 'เครื่องตรวจ contrast สามมิติ: ปรับสีตัวอักษรกับพื้นหลัง ดูค่า WCAG ต้องได้อย่างน้อย 4.5 : 1 และวงล้อสีที่เลือกชุดสีแบบตรงข้าม ใกล้เคียง สามเส้า',
    build(L) {
      L.cam(0, 4, 12, 0, 2.2, 0); L.floor(30);
      let bh = 45, bl = 55, th = 0, tl = 100;
      const card = L.texPlane({ w: 4.8, h: 2.7, pw: 960, ph: 540, x: -2.8, y: 2.4 }, () => {});
      const rC = L.readout('Contrast ratio'), rW = L.readout('ผล WCAG AA');
      function draw() {
        const bg = hsl(bh, 85, bl), fg = hsl(th, 10, tl), c = contrast(bg, fg);
        card.tex.redraw((ctx, w, h) => { ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); ctx.fillStyle = fg; ctx.font = '600 120px Mitr, sans-serif'; ctx.fillText('สมัคร', 70, 250); ctx.font = '48px Sarabun, sans-serif'; ctx.fillText('ค่ายคอมพิวเตอร์ ม.6 รับ 30 คน', 70, 380); });
        rC(r2(c) + ' : 1', c >= 4.5 ? 'good' : c >= 3 ? 'warn' : 'bad'); rW(c >= 4.5 ? 'ผ่าน (ข้อความทั่วไป)' : c >= 3 ? 'ผ่านเฉพาะตัวใหญ่มาก' : 'ไม่ผ่าน อ่านยาก', c >= 4.5 ? 'good' : 'bad');
      }
      L.slider('สีพื้น (Hue)', { min: 0, max: 359, value: 45, unit: '°' }, (v) => { bh = v; draw(); });
      L.slider('ความสว่างพื้น', { min: 5, max: 95, value: 55, unit: '%' }, (v) => { bl = v; draw(); });
      L.slider('ความสว่างตัวอักษร', { min: 0, max: 100, value: 100, unit: '%' }, (v) => { tl = v; draw(); });
      const wheel = L.group({ x: 4, y: 2.4 }), sw = [];
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; sw.push(L.sphere({ r: 0.32, color: hsl(i * 30, 80, 55), x: Math.cos(a) * 1.8, y: Math.sin(a) * 1.8, parent: wheel })); }
      const hl = L.label('', { parent: wheel, y: -2.5, cls: 'tag' });
      L.select('ชุดสี (Color harmony)', ['คู่ตรงข้าม', 'ใกล้เคียง', 'สามเส้า', 'โทนเดียว'], (m) => {
        const pick = [[0, 6], [0, 1, 11], [0, 4, 8], [0]][m];
        sw.forEach((s, i) => s.scale.setScalar(pick.includes(i) ? 1.6 : 0.8));
        hl.set(['สดตัดกัน เหมาะปุ่มสำคัญ', 'นุ่มกลมกลืน เหมาะเว็บท่องเที่ยวธรรมชาติ', 'สนุกสดใส เหมาะงานผีตาโขน', 'เรียบหรู ใช้สีเดียวหลายระดับ'][m]);
      });
      L.steps([
        { t: 'ตอนนี้ปุ่ม "สมัคร" สีเหลืองตัวอักษรขาว ดูสวย แต่ contrast ต่ำมาก คนสายตาไม่ดีและผู้สูงอายุอ่านลำบาก', f: () => L.flyTo(-2.8, 2.6, 6, -2.8, 2.4, 0) },
        { t: 'ลดความสว่างพื้นลง หรือทำตัวอักษรให้เข้ม จนค่าถึง 4.5 : 1 (มาตรฐาน WCAG AA) ช่องผลจะเป็นสีเขียว' },
        { t: 'วงล้อสี: คู่ตรงข้ามดูสดตัดกัน ใกล้เคียงดูนุ่ม สามเส้าดูสนุก โทนเดียวดูเรียบหรู สีมีอารมณ์ เขียว = ธรรมชาติ ส้มแดง = หิว น้ำเงิน = น่าเชื่อถือ', f: () => L.flyTo(4, 3, 7, 4, 2.4, 0) },
        { t: 'AI เสนอชุดสีสวย ๆ ได้ แต่ไม่ได้ตรวจ contrast ให้เสมอ เอารหัสสีมาตรวจทุกครั้ง แล้วรวมเป็น Style Guide ของทีม (สี 5 สี ฟอนต์ไม่เกิน 2 แบบ)', f: () => L.flyTo(0, 4, 12, 0, 2.2, 0) },
      ]);
      draw();
      L.quiz('contrast ratio ขั้นต่ำของข้อความทั่วไปตาม WCAG AA คือเท่าไร', ['2 : 1', '3 : 1', '4.5 : 1'], 2, 'ข้อความทั่วไปต้องได้อย่างน้อย 4.5 : 1');
    },
  },

  3: {
    idea: 'Sitemap แบบต้นไม้ของเว็บโรงเรียน หา "ปฏิทินการศึกษา" ให้เจอในกี่คลิก เทียบโครงสร้างที่ลึกเกินกับโครงสร้างที่จัดดีตามกฎ 3 คลิก',
    build(L) {
      L.cam(0, 9, 13, 0, 2, 0); L.floor(36);
      const bad = { n: 'หน้าแรก', c: [{ n: 'เกี่ยวกับเรา', c: [{ n: 'งานบริหาร', c: [{ n: 'งานบริหารวิชาการ', c: [{ n: 'เอกสาร', c: [{ n: 'ปฏิทินการศึกษา', t: 1 }] }] }] }] }, { n: 'ข่าว', c: [{ n: 'ข่าวกีฬาสี' }] }, { n: 'ติดต่อ' }] };
      const good = { n: 'หน้าแรก', c: [{ n: 'การเรียน', c: [{ n: 'ปฏิทินการศึกษา', t: 1 }, { n: 'ตารางเรียน' }] }, { n: 'ข่าวและกิจกรรม', c: [{ n: 'กีฬาสี' }, { n: 'ประกาศ' }] }, { n: 'เกี่ยวกับโรงเรียน', c: [{ n: 'ประวัติ' }, { n: 'บุคลากร' }] }, { n: 'ติดต่อ' }] };
      const g = L.group(); let path = [];
      const rC = L.readout('จำนวนคลิกถึงปฏิทิน'), rD = L.readout('ความลึกสูงสุด');
      function layout(node, depth, x0, x1, out) {
        const x = (x0 + x1) / 2, y = 6 - depth * 1.3; out.push({ node, x, y, depth });
        const kids = node.c || []; kids.forEach((k, i) => { const a = x0 + ((x1 - x0) * i) / kids.length, b = x0 + ((x1 - x0) * (i + 1)) / kids.length; const ch = layout(k, depth + 1, a, b, out); ch.parentPos = [x, y]; });
        return out[out.findIndex((o) => o.node === node)];
      }
      function draw(tree) {
        L.clearGroup(g); const out = []; layout(tree, 0, -7, 7, out);
        let target = null, maxD = 0;
        out.forEach((o) => { maxD = Math.max(maxD, o.depth); if (o.node.t) target = o;
          const b = L.box({ w: 1.7, h: 0.5, d: 0.5, color: o.node.t ? C.amber : PALETTE[o.depth % PALETTE.length], x: o.x, y: o.y, parent: g }); g.add(L.label(o.node.n, { x: o.x, y: o.y + 0.55, cls: 'tick' }));
          if (o.parentPos) g.add(L.line([[o.parentPos[0], o.parentPos[1] - 0.25, 0], [o.x, o.y + 0.25, 0]], 0x9fb4c4, 0.7));
        });
        path = []; let t = target; while (t) { path.unshift(t); t = out.find((o) => (o.node.c || []).includes(t.node)); }
        rC(path.length - 1 + ' คลิก', path.length - 1 <= 3 ? 'good' : 'bad'); rD(maxD + ' ชั้น');
      }
      async function walk() { const g0 = L.gen; const s = L.sphere({ r: 0.25, color: C.white, emissive: 0x444444 }); for (const p of path) { if (!(await L.moveTo(s, p.x, p.y + 0.45, 0.4, 500))) return; } await L.wait(600); L.remove(s); }
      L.select('โครงสร้างเว็บ', ['แบบเดิม (ลึกเกิน)', 'แบบจัดบ้านใหม่'], (i) => draw(i ? good : bad));
      L.buttons([['เดินหาปฏิทินการศึกษา', walk]]);
      L.steps([
        { t: 'Sitemap คือแผนผังว่าเว็บมีหน้าอะไร ต่อกันยังไง หน้าแรกอยู่บนสุด แตกกิ่งลงมาเป็นเมนู กดปุ่มเดินหาปฏิทินการศึกษา' },
        { t: 'แบบเดิมต้องคลิก 5 ครั้ง และชื่อเมนู "งานบริหารวิชาการ" ผู้ปกครองไม่เข้าใจ เหมือนเอาถุงเท้าไปไว้ในกล่องรองเท้า' },
        { t: 'เลือก "แบบจัดบ้านใหม่" จัดหมวดตามความคิดผู้ใช้ เมนูหลัก 4–7 อัน ชื่อที่คนทั่วไปเข้าใจ ปฏิทินอยู่ใน 2 คลิก' },
        { t: 'จากนั้นร่าง Wireframe (โครงขาวดำ) → Mockup (สีจริง) → Prototype (คลิกได้) ใช้ Google Stitch ช่วยได้ แต่ Sitemap ของเราเป็น "เจ้านาย" ของ AI' },
      ]);
      L.quiz('กฎ 3 คลิกหมายถึงอะไร', ['เว็บต้องมี 3 หน้า', 'ผู้ใช้ควรเข้าถึงข้อมูลที่ต้องการได้ภายใน 3 คลิก', 'เมนูต้องมี 3 อัน'], 1, 'ยิ่งข้อมูลซ่อนลึก ผู้ใช้ยิ่งหาไม่เจอและออกจากเว็บ');
    },
  },

  4: {
    idea: 'HTML คือ "โครงบ้าน" ของเว็บ กล่อง Semantic ซ้อนกันเป็นชั้น header nav main section footer คลิกกล่องเพื่อดูโค้ด และฟังว่าโปรแกรมอ่านหน้าจออ่านอะไร',
    build(L) {
      L.cam(5, 7, 12, 0, 1.5, 0); L.floor(30);
      const tags = [
        ['<html lang="th">', 7, 0.15, 5, 0, 0, 0x2b3a46], ['<header>', 6.4, 0.3, 0.9, 0, -1.8, C.teal], ['<nav>', 6.4, 0.3, 0.6, 0, -0.9, C.violet],
        ['<main>', 6.4, 0.3, 2.2, 0, 0.6, C.sky], ['<section> ร้านแนะนำ', 3, 0.4, 1.6, -1.5, 0.6, C.blue], ['<img alt="ทะเลหมอกภูเรือ">', 2.6, 0.5, 1.4, 1.6, 0.6, C.pink], ['<footer>', 6.4, 0.3, 0.6, 0, 2.1, C.slate],
      ];
      const code = { '<html lang="th">': '<!DOCTYPE html>\n<html lang="th">\n<head><meta charset="UTF-8">\n<title>เที่ยวเลย</title></head>\n<body> … </body>\n</html>', '<header>': '<header>\n  <h1>เที่ยวเลย</h1>\n</header>', '<nav>': '<nav>\n  <a href="index.html">หน้าแรก</a>\n  <a href="shops.html">ร้าน</a>\n</nav>',
        '<main>': '<main>\n  เนื้อหาหลักของหน้า\n</main>', '<section> ร้านแนะนำ': '<section>\n  <h2>ร้านแนะนำ</h2>\n  <ul><li>…</li></ul>\n</section>', '<img alt="ทะเลหมอกภูเรือ">': '<img src="images/phuruea.jpg"\n     alt="ทะเลหมอกภูเรือ">', '<footer>': '<footer>ติดต่อ 042-xxx-xxx</footer>' };
      const rC = L.readout('โค้ดของกล่องที่เลือก', 'คลิกกล่องในฉาก'); const rR = L.readout('โปรแกรมอ่านหน้าจออ่านว่า');
      let semantic = true, alt = true; const boxes = [];
      function draw() {
        boxes.forEach((b) => L.remove(b)); boxes.length = 0;
        tags.forEach(([t, w, h, d, x, z, c], i) => {
          const name = semantic ? t : i === 0 ? t : i === 5 ? (alt ? t : '<img>') : '<div>';
          const b = L.box({ w, h, d, color: semantic || i === 0 || i === 5 ? c : 0x56677a, x, y: (i === 0 ? 0.08 : 0.3 + h / 2) , z }); L.label(name, { parent: b, y: h / 2 + 0.3, cls: 'tag' });
          L.onClick(b, () => rC(`<pre style="margin:0;font:12px var(--f-mono);white-space:pre-wrap">${(code[t] || '').replace(/</g, '&lt;')}</pre>`)); boxes.push(b);
        });
        rR(semantic ? (alt ? '"ส่วนหัว: เที่ยวเลย · เมนูนำทาง · เนื้อหาหลัก · รูปภาพ: ทะเลหมอกภูเรือ"' : '"…รูปภาพ (ไม่มีคำอธิบาย)"') : '"กลุ่ม กลุ่ม กลุ่ม รูปภาพ…" (ไม่รู้ว่าส่วนไหนคืออะไร)', semantic && alt ? 'good' : 'bad');
      }
      L.toggle('ใช้ Semantic HTML (แทน div ทั้งหน้า)', true, (v) => { semantic = v; draw(); });
      L.toggle('ใส่ alt ให้รูปภาพ', true, (v) => { alt = v; draw(); });
      L.steps([
        { t: 'HTML = โครงบ้าน · CSS = สีและของตกแต่ง · JavaScript = ไฟฟ้าและประตูอัตโนมัติ ทุกหน้าเริ่มด้วย DOCTYPE html head meta charset body คลิกพื้นล่างสุดเพื่อดู' },
        { t: 'แท็กส่วนใหญ่มาเป็นคู่ เปิด <p> ปิด </p> ลืมปิดหน้าเว็บจะเพี้ยน 10 แท็กที่ใช้บ่อย: h1–h6 p b br ul ol li a img table' },
        { t: 'ปิด Semantic ทุกกล่องกลายเป็น <div> สีเทา Google และโปรแกรมอ่านหน้าจอไม่รู้ว่าส่วนไหนคืออะไร (ดูช่องด้านขวา)' },
        { t: 'ปิด alt โปรแกรมอ่านหน้าจออ่านแค่ "รูปภาพ" เพื่อนที่มองไม่เห็นจะไม่รู้ว่าเป็นภาพอะไร ภาพตกแต่งเฉย ๆ ใช้ alt="" ให้ข้าม' },
      ]);
      draw();
      L.quiz('แท็ก <img> ต้องมี attribute ใดบ้าง', ['href และ title', 'src และ alt', 'class และ id'], 1, 'src บอกที่อยู่ไฟล์ภาพ alt คือข้อความแทนภาพ');
    },
  },

  5: {
    idea: 'Box Model เป็นกล่องซ้อน 4 ชั้น content → padding → border → margin และ Flexbox จัดการ์ดในกล่องแม่ ลดความกว้างจอแล้วดูการ์ดเรียงใหม่ (Responsive)',
    build(L) {
      L.cam(0, 9, 12, 0, 0, 1); L.floor(36);
      const bm = L.group({ x: -6, z: -2 });
      let pad = 16, bor = 4, mar = 12;
      const rB = L.readout('ขนาดรวมของการ์ด');
      function box() {
        L.clearGroup(bm); const s = 1 / 40, cw = 100 * s;
        const lay = [['margin', cw + 2 * (pad + bor + mar) * s, C.orange, 0.15], ['border', cw + 2 * (pad + bor) * s, C.amber, 0.3], ['padding', cw + 2 * pad * s, C.green, 0.45], ['content', cw, C.sky, 0.6]];
        lay.forEach(([n, w, c, h], i) => { const b = L.box({ w, h: 0.15, d: w, color: c, y: h, parent: bm, opacity: i === 0 ? 0.5 : 0.9 }); bm.add(L.label(n, { x: w / 2, y: h + 0.1, z: w / 2, cls: 'tick' })); });
        rB(`100 + 2×(${pad} + ${bor} + ${mar}) = ${100 + 2 * (pad + bor + mar)} px`);
      }
      L.slider('padding (ระยะในกล่อง)', { min: 0, max: 40, value: 16, unit: 'px' }, (v) => { pad = v; box(); });
      L.slider('border (ขอบ)', { min: 0, max: 12, value: 4, unit: 'px' }, (v) => { bor = v; box(); });
      L.slider('margin (ระยะนอกกล่อง)', { min: 0, max: 40, value: 12, unit: 'px' }, (v) => { mar = v; box(); });
      const fx = L.group({ x: 2, z: 1 }); let vw = 1100, jc = 0, ai = 0;
      const rL = L.readout('จอกว้าง / การจัดเรียง'), rCss = L.readout('CSS ที่ทำงาน');
      function flex() {
        L.clearGroup(fx); const W = (vw / 1100) * 7, cols = vw <= 600 ? 1 : 3, cw = cols === 1 ? W * 0.8 : 1.6, ch = [1.2, 0.8, 1.4];
        L.box({ w: W, h: 0.1, d: 6.2, color: 0x2b3a46, parent: fx, edges: true });
        fx.add(L.label(`.cards (กล่องแม่) ${vw}px`, { x: 0, y: 0.3, z: -3.4, cls: 'tag' }));
        const gap = 0.3, tot = cols * cw + (cols - 1) * gap, startX = [-W / 2 + 0.2, -tot / 2, W / 2 - 0.2 - tot][jc];
        for (let i = 0; i < 3; i++) {
          const r = Math.floor(i / cols), c = i % cols, d = cols === 1 ? 1.5 : ch[i];
          const zz = cols === 1 ? -2.2 + r * 2 : [-2.8 + d / 2, 0, 2.8 - d / 2][ai] ;
          const zr = cols === 1 ? zz : ai === 0 ? -2.8 + d / 2 : ai === 1 ? 0 : 2.8 - d / 2;
          L.box({ w: cw, h: 0.4, d, color: PALETTE[i], x: startX + cw / 2 + c * (cw + gap), y: 0.3, z: zr, parent: fx });
        }
        rL(`${vw}px · ${cols} คอลัมน์`, cols === 1 ? 'warn' : 'good');
        rCss(`justify-content: ${['flex-start', 'center', 'flex-end'][jc]}; align-items: ${['flex-start', 'center', 'flex-end'][ai]};` + (vw <= 600 ? ' @media (max-width:600px) → 1 คอลัมน์' : ''));
      }
      L.slider('ความกว้างหน้าจอ', { min: 360, max: 1100, step: 20, value: 1100, unit: 'px' }, (v) => { vw = v; flex(); });
      L.select('justify-content (แนวนอน)', ['flex-start', 'center', 'flex-end'], (i) => { jc = i; flex(); });
      L.select('align-items (แนวตั้ง)', ['flex-start', 'center', 'flex-end'], (i) => { ai = i; flex(); });
      L.steps([
        { t: 'ทุกอย่างบนเว็บเป็นกล่อง นึกถึงรูปติดกรอบแขวนผนัง: รูป = content · ช่องว่างถึงกรอบ = padding · กรอบ = border · ระยะไปถึงรูปอื่น = margin', f: () => L.flyTo(-6, 5, 4, -6, 0.3, -2) },
        { t: 'อยากให้ตัวหนังสือในการ์ดห่างจากขอบ ให้เพิ่ม padding อยากให้การ์ดห่างกัน ให้เพิ่ม margin กด F12 ใน Chrome ก็เห็นกล่องสีแบบนี้' },
        { t: 'Flexbox: ใส่ display:flex ที่ "กล่องแม่" ลูกจะเรียงแถว ลองเปลี่ยน justify-content และ align-items', f: () => L.flyTo(2, 8, 8, 2, 0, 1) },
        { t: 'ลดความกว้างจอเหลือ 600px ลงไป media query ทำงาน การ์ดเปลี่ยนจาก 3 คอลัมน์เป็น 1 คอลัมน์ Responsive 3 ขั้น: viewport → flex/grid → media query' },
      ]);
      box(); flex();
      L.quiz('ใส่ display: flex; ที่ใด', ['กล่องลูกทุกตัว', 'กล่องแม่ที่ครอบลูก', 'แท็ก <html>'], 1, 'Flexbox สั่งให้ "ลูก" เรียงตัว โดยกำหนดที่ "กล่องแม่"');
    },
  },

  6: {
    idea: 'JavaScript คือ "สมอง" ของเว็บ: กดปุ่ม (Event) → ฟังก์ชันทำงาน (Function) → หน้าเว็บเปลี่ยน (DOM) ลองนับคะแนน สลับโหมดมืด และดูว่าสะกด id ผิดแล้ว Console แจ้งอะไร',
    build(L) {
      L.cam(0, 4, 13, 0, 2.2, 0); L.floor(30);
      const page = L.texPlane({ w: 5, h: 3.4, pw: 1000, ph: 680, x: 3.2, y: 2.4 }, () => {});
      const btn = L.box({ w: 1.2, h: 0.5, d: 0.5, color: C.amber, x: -5.5, y: 0.6 }); L.label('ปุ่ม (คลิกได้)', { parent: btn, y: 0.6, cls: 'tag' });
      const gear = L.torus({ r: 0.6, t: 0.18, color: C.violet, x: -2.2, y: 1.6, seg: 8 }); L.label('function', { parent: gear, y: 1, cls: 'tag' });
      let score = 0, dark = false, typo = false;
      const rE = L.readout('Console'), rV = L.readout('ตัวแปร');
      const code = L.label('', { x: -3.6, y: 4.6, cls: 'code' });
      function render() {
        page.tex.redraw((ctx, w, h) => { ctx.fillStyle = dark ? '#121a21' : '#f6f8fa'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = dark ? '#e8eef2' : '#12324a'; ctx.font = '600 64px Mitr, sans-serif'; ctx.fillText('แบบทดสอบเมืองเลย', 50, 110); ctx.font = '150px "IBM Plex Mono", monospace'; ctx.fillText(String(score), 60, 380); ctx.font = '44px Sarabun, sans-serif'; ctx.fillText('คะแนน (id="score")', 60, 470); });
        rV(`let score = ${score}; const btn = ปุ่ม`);
        code.set(`const btn = document.getElementById('plus');\nbtn.addEventListener('click', () => {\n  score = score + 1;\n  document.getElementById('${typo ? 'Score' : 'score'}')\n          .textContent = score;\n});`);
      }
      async function click() {
        const g = L.gen; L.tween(btn.position, { y: 0.45 }, 120).then(() => L.tween(btn.position, { y: 0.6 }, 120));
        const p = L.sphere({ r: 0.2, color: C.white, x: -5.5, y: 1.1, emissive: 0x444444 });
        if (!(await L.moveTo(p, -2.2, 1.6, 0, 400))) return; await L.tween(gear.rotation, { z: gear.rotation.z + Math.PI }, 300);
        if (typo) { L.color(p, C.red); rE("TypeError: Cannot read properties of null (setting 'textContent') — หา id 'Score' ไม่เจอ", 'bad'); await L.wait(600); L.remove(p); return; }
        if (!(await L.moveTo(p, 1.2, 2.4, 0, 400))) return; L.remove(p); score++; render(); rE('ไม่มีข้อผิดพลาด', 'good');
      }
      L.onClick(btn, click);
      L.buttons([['คลิกปุ่ม +1', click], ['สลับโหมดมืด (classList.toggle)', () => { dark = !dark; render(); }]]);
      L.toggle("สะกด id ผิดเป็น 'Score' (ตัว S ใหญ่)", false, (v) => { typo = v; render(); });
      L.steps([
        { t: 'HTML = โครงสร้าง CSS = หน้าตา JS = พฤติกรรม ตัวแปร let เปลี่ยนค่าได้ (score) const ไม่เปลี่ยน (ตัวปุ่ม)' },
        { t: 'คลิกปุ่มสีส้ม: Event (มีคนกด) → Function (เฟืองหมุน คิดคะแนนใหม่) → เปลี่ยน DOM (ตัวเลขบนหน้าเว็บเปลี่ยน)' },
        { t: 'กดสลับโหมดมืด classList.toggle เหมือนสวิตช์ไฟ ไม่มี class ก็เพิ่ม มีแล้วก็เอาออก' },
        { t: "เปิดตัวเลือกสะกด id ผิด แล้วคลิกอีกครั้ง Console ขึ้น Error สีแดง อ่านมันก่อนถามครู ถ้าให้ AI ช่วย ให้ถามว่า 'Error นี้หมายความว่าอะไร' ไม่ใช่ขอโค้ดใหม่ไปเรื่อย ๆ" },
      ]);
      render();
      L.quiz('Console ขึ้น "Cannot read properties of null" น่าจะเพราะอะไร', ['เน็ตหลุด', 'getElementById หา id ไม่เจอ (สะกดไม่ตรงกับ HTML)', 'CSS ผิด'], 1, 'id ใน JS ต้องตรงกับ HTML ทุกตัวอักษร รวมถึงตัวพิมพ์เล็ก–ใหญ่');
    },
  },

  7: {
    idea: 'Git เหมือนสมุดบันทึกประวัติ ทุก Commit คือการถ่ายรูปงานเก็บไว้ ลอง Commit ย้อนเวอร์ชัน และส่งเว็บขึ้น GitHub Pages พร้อมตรวจชื่อไฟล์ให้ถูกกฎ',
    build(L) {
      L.cam(0, 7, 14, 0, 1, 0); L.floor(36);
      const tl = L.group(); const commits = [['สร้าง index.html หน้าแรก', 'ภูผา'], ['เพิ่ม style.css ตาม Style Guide', 'มะลิ']];
      L.line([[-7, 0.5, 0], [7, 0.5, 0]], 0x6c8293);
      const rV = L.readout('เวอร์ชันที่เปิดอยู่'), rU = L.readout('URL เว็บ', 'https://malee-loei.github.io/loei-cafe/'); const rN = L.readout('ตรวจชื่อไฟล์');
      let cur = 1;
      function draw() {
        L.clearGroup(tl);
        commits.forEach(([m, who], i) => { const x = -6 + i * 1.8; const s = L.sphere({ r: 0.3, color: i === cur ? C.amber : C.teal, x, y: 0.5, parent: tl }); tl.add(L.label(`${m}<br><small>${who}</small>`, { x, y: i % 2 ? -0.3 : 1.4, cls: 'tick' })); L.onClick(s, () => { cur = i; draw(); }); });
        rV(`#${cur + 1} ${commits[cur][0]}`);
      }
      const msgs = [['เพิ่มหน้าเมนูอาหาร shops.html', 'ต้นกล้า'], ['แก้สีปุ่มให้ผ่าน contrast', 'ใบเตย'], ['บีบอัดภาพเป็น WebP', 'ภูผา'], ['เพิ่มเมนูแฮมเบอร์เกอร์มือถือ', 'มะลิ']];
      const server = L.box({ w: 1.6, h: 2, d: 1.2, color: C.violet, x: 5.5, y: 1, z: -3 }); L.label('GitHub Pages', { parent: server, y: 1.4, cls: 'tag' });
      L.buttons([['Commit งานใหม่', () => { if (commits.length < 8) { commits.push(msgs[(commits.length - 2) % msgs.length]); cur = commits.length - 1; draw(); } }],
        ['Deploy ขึ้นเว็บ', async () => { const p = L.box({ w: 0.4, h: 0.4, d: 0.4, color: C.amber, x: -6 + cur * 1.8, y: 0.9 }); await L.moveTo(p, 5.5, 2.2, -3, 1200); L.remove(p); rU('อัปเดตแล้ว (รอ 1–2 นาที) · https://malee-loei.github.io/loei-cafe/', 'good'); }]]);
      L.input('ทดลองตั้งชื่อไฟล์', 'ภาพ ภูเรือ.JPG', (v) => { const ok = /^[a-z0-9\-_.\/]+$/.test(v) && !/\s/.test(v); rN(ok ? 'ใช้ได้' : `ไม่ผ่าน: ${/[^\x00-\x7F]/.test(v) ? 'มีภาษาไทย ' : ''}${/\s/.test(v) ? 'มีเว้นวรรค ' : ''}${/[A-Z]/.test(v) ? 'มีตัวพิมพ์ใหญ่' : ''} → ลอง phuruea.jpg`, ok ? 'good' : 'bad'); });
      L.steps([
        { t: 'เคยมีไฟล์ "รายงาน_final_จริงๆ_v3" ไหม Git แก้ปัญหานี้ ทุก Commit คือจุดบนเส้นเวลา คลิกจุดเก่าเพื่อย้อนไปดูเวอร์ชันนั้นได้' },
        { t: 'ข้อความ Commit ต้องบอกว่าแก้อะไร "เพิ่มตัวกรองร้านตามงบ" ไม่ใช่ "update" หรือ "แก้ๆ" กด Commit งานใหม่ดูตัวอย่าง' },
        { t: 'Repository คือโฟลเดอร์โครงงาน เพิ่มเพื่อนเป็น Collaborator ทุกคน Commit ได้ ครูดูประวัติว่าใครมีส่วนร่วม' },
        { t: 'GitHub Pages เปลี่ยน Repo เป็นเว็บฟรี: Settings → Pages → main → Save ไฟล์หน้าแรกต้องชื่อ index.html ชื่อไฟล์ใช้ตัวเล็ก ไม่เว้นวรรค ไม่ใช้ภาษาไทย' },
      ]);
      draw();
      L.quiz('ชื่อไฟล์ใดใช้บนเว็บได้ถูกต้อง', ['ภาพ ภูเรือ.JPG', 'Phu Ruea.jpg', 'phuruea.jpg'], 2, 'ตัวพิมพ์เล็ก ไม่มีเว้นวรรค ไม่ใช่ภาษาไทย เซิร์ฟเวอร์ถือว่า A กับ a เป็นคนละตัว');
    },
  },

  8: {
    idea: 'ภาพจากมือถือ 4.8 MB กับภาพเดียวกันที่ย่อและแปลงเป็น WebP เหลือไม่ถึง 200 KB ปรับความกว้างและคุณภาพ แล้วดูเวลาโหลดบนเน็ตมือถือ พร้อมเลือกสัญญาอนุญาต CC',
    build(L) {
      L.cam(0, 5, 12, 0, 1.5, 0); L.floor(30);
      const orig = 4.8; let w = 1200, q = 75, fmt = 1, net = 5;
      const big = L.box({ w: 1, h: 1, d: 1, color: C.red, x: -3.5, opacity: 0.85 }), small = L.box({ w: 1, h: 1, d: 1, color: C.green, x: 2.5 });
      const lb = L.label('', { x: -3.5, cls: 'tag' }), ls = L.label('', { x: 2.5, cls: 'tag' });
      const rS = L.readout('ขนาดหลังบีบอัด'), rT = L.readout('เวลาโหลด (ต้นฉบับ → ย่อแล้ว)');
      function upd() {
        const px = (w / 4000) ** 2, qf = 0.25 + (q / 100) ** 2 * 1.2, ff = [1, 0.7][fmt];
        const kb = Math.max(20, orig * 1024 * px * qf * ff * 0.6);
        const sb = Math.cbrt(orig) * 1.5, ss = Math.cbrt(kb / 1024) * 1.5;
        big.scale.setScalar(sb); big.position.y = sb / 2; small.scale.setScalar(ss); small.position.y = ss / 2;
        lb.position.y = sb + 0.4; ls.position.y = ss + 0.4; lb.set('ต้นฉบับ 4000 px · 4.8 MB'); ls.set(`${w} px · ${['JPG', 'WebP'][fmt]} · ${Math.round(kb)} KB`);
        rS(Math.round(kb) + ' KB', kb < 300 ? 'good' : 'warn');
        rT(`${r2(orig * 8 / net)} วิ → ${r2(kb / 1024 * 8 / net)} วิ`);
      }
      L.slider('ความกว้างภาพ', { min: 600, max: 4000, step: 100, value: 1200, unit: 'px' }, (v) => { w = v; upd(); });
      L.slider('คุณภาพ', { min: 30, max: 100, value: 75, unit: '%' }, (v) => { q = v; upd(); });
      L.select('ชนิดไฟล์', ['JPG', 'WebP'], (i) => { fmt = i; upd(); }, 1);
      L.slider('ความเร็วเน็ตมือถือ', { min: 1, max: 50, value: 5, unit: 'Mbps' }, (v) => { net = v; upd(); });
      const rC = L.readout('สัญญาอนุญาตที่ได้');
      const cc = { nc: false, nd: false, sa: false };
      const ccU = () => rC('CC BY' + (cc.nc ? '-NC' : '') + (cc.nd ? '-ND' : cc.sa ? '-SA' : '') + ' · ' + ['ใช้ได้ ต้องให้เครดิต', cc.nc && 'ห้ามใช้หาเงิน', cc.nd && 'ห้ามดัดแปลง', !cc.nd && cc.sa && 'ดัดแปลงแล้วต้องแบ่งปันแบบเดียวกัน'].filter(Boolean).join(' · '));
      L.toggle('ห้ามนำไปใช้เชิงพาณิชย์ (NC)', false, (v) => { cc.nc = v; ccU(); });
      L.toggle('ห้ามดัดแปลง (ND)', false, (v) => { cc.nd = v; ccU(); });
      L.toggle('ดัดแปลงแล้วต้องแบ่งปันแบบเดียวกัน (SA)', false, (v) => { cc.sa = v; ccU(); });
      L.steps([
        { t: 'ปริมาตรกล่องแทนขนาดไฟล์ ภาพจากมือถือ 4.8 MB เอาขึ้นเว็บตรง ๆ บนเน็ตมือถือ 5 Mbps ต้องรอเกือบ 8 วินาที คนปิดหนีก่อน' },
        { t: 'ย่อเหลือกว้าง 1,200 px และแปลงเป็น WebP ด้วย Squoosh เหลือไม่ถึง 200 KB ภาพยังคมพอสำหรับจอ' },
        { t: 'ภาพใน Google ไม่ใช่ภาพฟรี ใช้ภาพที่ถ่ายเองหรือจาก Unsplash Pexels Wikimedia Commons แล้วให้เครดิต ลองสร้างสัญญาอนุญาต CC ด้านขวา' },
        { t: 'เนื้อหาจาก AI: AI ร่าง → คนตรวจข้อเท็จจริงกับแหล่งที่เชื่อถือได้ → อ้างอิง ภาพ AI ต้องติดป้าย "ภาพสร้างด้วย AI" และทำหน้าเครดิต + AI Use Statement' },
      ]);
      upd(); ccU();
      L.quiz('CC BY-NC หมายความว่าอย่างไร', ['ใช้ได้ทุกกรณีไม่ต้องให้เครดิต', 'ใช้ได้ ต้องให้เครดิต และห้ามใช้หาเงิน', 'ห้ามใช้ทุกกรณี'], 1, 'BY = ให้เครดิต NC = Non-Commercial ห้ามใช้เชิงพาณิชย์');
    },
  },

  9: {
    idea: 'วงแหวน Lighthouse 4 ด้าน (Performance Accessibility Best Practices SEO) เปิดการแก้ไขทีละอย่างแล้วดูคะแนนขึ้น และจัดลำดับปัญหาจากการทดสอบกับผู้ใช้',
    build(L) {
      L.cam(0, 6, 13, 0, 1.5, 0); L.floor(30);
      const names = ['Performance', 'Accessibility', 'Best Practices', 'SEO'], base = [48, 62, 75, 70];
      const fixes = [['บีบอัดภาพเป็น WebP + lazy loading', [30, 0, 4, 0]], ['ใส่ alt ทุกภาพ', [0, 14, 0, 6]], ['แก้สีให้ผ่าน contrast 4.5:1', [0, 12, 0, 0]], ['ใส่ <html lang="th"> และ meta description', [0, 6, 0, 18]], ['ใช้ HTTPS/ลบ error ใน Console', [0, 0, 16, 0]]];
      const on = fixes.map(() => false);
      const rings = names.map((n, i) => { const x = -4.8 + i * 3.2; L.torus({ r: 1, t: 0.12, color: 0x2b3a46, x, y: 2 }); const r = L.torus({ r: 1, t: 0.16, color: C.green, x, y: 2, arc: 0.01 }); r.lbl = L.label('', { x, y: 2, cls: 'big' }); L.label(n, { x, y: 0.6, cls: 'tag' }); return r; });
      function upd() {
        names.forEach((n, i) => {
          const v = Math.min(100, base[i] + fixes.reduce((s, f, k) => s + (on[k] ? f[1][i] : 0), 0));
          const r = rings[i]; r.geometry.dispose(); r.geometry = new L.THREE.TorusGeometry(1, 0.16, 12, 64, (v / 100) * Math.PI * 2); r.rotation.z = Math.PI / 2;
          L.color(r, v >= 90 ? C.green : v >= 50 ? C.amber : C.red); r.lbl.set(String(v)); r.lbl.element.style.setProperty('--lc', v >= 90 ? '#4cc38a' : v >= 50 ? '#f2b134' : '#ef5b5b');
        });
      }
      fixes.forEach(([n], i) => L.toggle(n, false, (v) => { on[i] = v; upd(); }));
      const probs = [['หาเบอร์โทรร้านไม่เจอ', 3, 3], ['ปุ่มเมนูมือถือกดยาก', 2, 2], ['ภาพโหลดช้า', 3, 2], ['ฟอนต์หัวเรื่องไม่สวย', 1, 1], ['ลิงก์รีวิวเสีย', 1, 3]];
      probs.forEach(([n, freq, sev]) => { const s = L.sphere({ r: 0.25 + freq * 0.05, color: freq * sev >= 6 ? C.red : freq * sev >= 3 ? C.amber : C.slate, x: -2 + freq * 1.3, y: 0.3, z: 2 + (3 - sev) * 0.9 }); L.label(n, { parent: s, y: 0.5, cls: 'tick' }); });
      L.label('บ่อย →', { x: 2.5, y: 0, z: 4.6, cls: 'axis' }); L.label('↑ รุนแรง', { x: -2.6, y: 0, z: 1.6, cls: 'axis' });
      L.steps([
        { t: 'Lighthouse (F12 → Lighthouse) คือหมอตรวจเว็บ ให้คะแนน 4 ด้าน เขียว 90+ ดี ส้มพอใช้ แดงต้องแก้' },
        { t: 'เปิดการแก้ไขทีละข้อ ภาพใหญ่ทำให้ Performance ต่ำ alt กับ contrast ช่วย Accessibility ทุกอย่างที่เรียนมาส่งผลที่นี่', f: () => L.flyTo(0, 6, 13, 0, 1.5, 0) },
        { t: 'ทดสอบกับผู้ใช้: ให้โจทย์ 3 งาน สังเกต จับเวลา ห้ามชี้ ห้ามบอกใบ้ ถ้าเพื่อน 3 คนติดที่เดียวกัน เป็นปัญหาของเว็บ ไม่ใช่ของผู้ใช้', f: () => L.flyTo(1, 6, 9, 1, 0, 2.5) },
        { t: 'จัดลำดับ: แก้ปัญหาที่ "บ่อยและรุนแรง" (มุมขวาบน สีแดง) ก่อน ความเห็นจาก AI ใช้เป็นข้อมูลเสริม ผู้ใช้จริงสำคัญกว่าเสมอ' },
      ]);
      upd();
      L.quiz('ระหว่างทดสอบกับผู้ใช้ ผู้ทดสอบห้ามทำอะไร', ['จับเวลา', 'ช่วยชี้หรืออธิบายวิธีใช้', 'จดปัญหา'], 1, 'ถ้าช่วย เราจะไม่รู้ว่าผู้ใช้จริงที่ไม่มีใครช่วยติดตรงไหน');
    },
  },

  10: {
    idea: 'ก้อนหิน 5 ก้อนของการนำเสนอโครงงาน 5 นาที: ปัญหา → ผู้ใช้ → สาธิต → AI ช่วยอะไร → พัฒนาต่อ พร้อมนาฬิกาจับเวลาแบบวงแหวน',
    build(L) {
      L.cam(0, 8, 13, 0, 0, 0); L.floor(40);
      const parts = [['ปัญหา', 45, 'คนเที่ยวเชียงคานหาร้านกาแฟที่เปิดเช้าไม่เจอ'], ['ผู้ใช้', 30, 'นักท่องเที่ยว 18–35 ปี งบไม่มาก'], ['สาธิต', 120, 'เปิดเว็บจริงบนมือถือ ใช้ตัวกรองร้านตามงบ'], ['AI ช่วยอะไร', 60, 'AI ร่าง Brief และ CSS ทีมตรวจข้อมูลร้านและแก้สีให้ผ่าน contrast'], ['พัฒนาต่อ', 45, 'เพิ่มแผนที่และรีวิวจากผู้ใช้จริง']];
      const stones = parts.map(([n, s, ex], i) => { const x = -8 + i * 4, z = i % 2 ? -1.2 : 1.2; const c = L.cyl({ r: 1.3, rb: 1.5, h: 0.5, color: PALETTE[i], x, y: 0.25, z }); L.label(`${i + 1}. ${n} (${s} วิ)`, { x, y: 0.9, z, cls: 'tag' }); L.label(ex, { x, y: 1.9, z, cls: 'wrap' }); return c; });
      const ringBg = L.torus({ r: 1.4, t: 0.1, color: 0x2b3a46, x: 0, y: 4.5, z: -4 }); let ring = null;
      const walker = L.sphere({ r: 0.3, color: C.white, emissive: 0x444444, x: -8, y: 0.8, z: 1.2 });
      const rT = L.readout('เวลาที่ใช้'), rP = L.readout('ส่วนที่กำลังพูด');
      async function present() {
        const g = L.gen, total = 300; let el = 0;
        for (let i = 0; i < parts.length; i++) {
          rP(parts[i][0]); L.moveTo(walker, stones[i].position.x, 0.8, stones[i].position.z, 400);
          const steps = Math.round(parts[i][1] / 15);
          for (let k = 0; k < steps; k++) {
            el += 15; if (ring) L.remove(ring); ring = L.torus({ r: 1.4, t: 0.14, color: el > 270 ? C.red : C.teal, x: 0, y: 4.5, z: -4, arc: (el / total) * Math.PI * 2 }); ring.rotation.z = Math.PI / 2;
            rT(`${Math.floor(el / 60)}:${String(el % 60).padStart(2, '0')} / 5:00`, el > 270 ? 'warn' : 'good');
            if (!(await L.wait(160))) return;
          }
        }
        rP('ถาม-ตอบ 2 นาที');
      }
      L.buttons([['ซ้อมนำเสนอ (เร่งเวลา)', present]]);
      L.steps([
        { t: 'นำเสนอ 5 นาที ถาม 2 นาที เรียงเรื่อง 5 ส่วน ส่วน "สาธิต" ใช้เวลามากที่สุด เปิดเว็บจริงที่ออนไลน์ ไม่ใช่ภาพหน้าจอ' },
        { t: 'กด "ซ้อมนำเสนอ" วงแหวนด้านหลังคือนาฬิกา เปลี่ยนเป็นสีแดงเมื่อเหลือไม่ถึง 30 วินาที' },
        { t: 'ส่วน "AI ช่วยอะไร" ต้องเจาะจง: AI ทำส่วนไหน ทีมตรวจ/แก้อะไร การบอกอย่างโปร่งใสได้คะแนน ไม่ได้ทำให้เสียคะแนน' },
        { t: 'คนฟังเป็นกรรมการ: คำชมที่เจาะจง "ปุ่มโทรเลยในการ์ดร้านทำให้หาเบอร์ได้ทันที" มีประโยชน์กว่า "เว็บสวยดี"' },
      ]);
      L.quiz('คำชมแบบใดมีประโยชน์ต่อเพื่อนมากที่สุด', ['เว็บสวยดี', 'ปุ่ม "โทรเลย" ในการ์ดร้านทำให้หาเบอร์ได้ทันที', 'ชอบมาก'], 1, 'คำชมที่เจาะจงบอกให้รู้ว่าดีตรงไหน และควรรักษาไว้');
    },
  },
};
