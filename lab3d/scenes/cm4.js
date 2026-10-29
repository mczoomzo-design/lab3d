// ม.4 คอมพิวเตอร์มัลติมีเดีย
import { C, PALETTE } from '../engine.js';

const r2 = (v) => Math.round(v * 100) / 100;

function dimLights(L, k) {
  const saved = [];
  L.scene.children.forEach((o) => { if (o.isLight) { saved.push([o, o.intensity]); o.intensity *= k; } });
  L.onCleanup(() => saved.forEach(([o, i]) => (o.intensity = i)));
}

export default {
  1: {
    idea: 'RAM คือ "โต๊ะทำงาน" เปิดแอปมากเกินโต๊ะ เครื่องก็ค้าง เลือก RAM แล้วเปิดแอปทีละตัว พร้อมดูว่างานแต่ละแบบต้องเน้นสเปกส่วนไหน',
    build(L) {
      L.cam(0, 8, 16, 0, 1.5, 0); L.floor(30);
      const desk = L.box({ w: 8, h: 0.3, d: 4, color: C.sand, y: 1.2 }); L.label('โต๊ะทำงาน = RAM', { parent: desk, x: -3, y: 0.5, cls: 'tag' });
      [[-3.7, -1.7], [3.7, -1.7], [-3.7, 1.7], [3.7, 1.7]].forEach(([x, z]) => L.box({ w: 0.25, h: 1.2, d: 0.25, color: 0x8a7350, x, y: 0.6, z, edges: false }));
      const shelf = L.box({ w: 3, h: 2.4, d: 1.4, color: C.violet, x: 6.5, y: 1.2, opacity: 0.85 }); L.label('ตู้เก็บของ = SSD', { parent: shelf, y: 1.6, cls: 'tag' });
      const cook = L.cyl({ r: 0.5, h: 1.6, color: C.amber, x: -6.2, y: 0.8 }); L.label('CPU = คนทำงาน', { parent: cook, y: 1.2, cls: 'tag' });
      const appsDef = [['LINE', 0.5, C.green], ['YouTube', 1.0, C.red], ['Canva', 1.2, C.sky], ['Chrome 10 แท็บ', 2.0, C.amber], ['เกม Free Fire', 2.5, C.orange], ['CapCut ตัดต่อ', 3.0, C.pink]];
      let ram = 8; const open = [];
      const rU = L.readout('RAM ที่ใช้'), rS = L.readout('สถานะเครื่อง');
      const blocks = L.group();
      function draw() {
        L.clearGroup(blocks); let used = 0; const cap = ram, sc = cap / 16;
        desk.scale.x = sc; const left = -4 * sc;
        open.forEach((a, i) => {
          const w = (a[1] / 16) * 8, over = used + a[1] > cap;
          const b = over
            ? L.box({ w: w - 0.05, h: 0.5, d: 1.4, color: C.red, x: left + w / 2 + (i % 3) * 0.3, y: 2.3 + i * 0.55, z: 0.2, parent: blocks })
            : L.box({ w: w - 0.05, h: 0.5, d: 1.6, color: a[2], x: left + (used / 16) * 8 + w / 2, y: 1.6, parent: blocks });
          L.label(a[0], { parent: b, y: 0.45, cls: 'tick' }); used += a[1];
        });
        rU(`${used} / ${cap} GB`, used > cap ? 'bad' : used > cap * 0.8 ? 'warn' : 'good');
        rS(used > cap ? 'ค้าง! ต้องย้ายงานไปพักใน SSD (ช้ามาก)' : 'ลื่นไหล', used > cap ? 'bad' : 'good');
      }
      L.select('ขนาด RAM', ['4 GB', '8 GB', '16 GB'], (i) => { ram = [4, 8, 16][i]; draw(); }, 1);
      L.buttons(appsDef.map((a) => ['เปิด ' + a[0], () => { open.push(a); draw(); }]).concat([['ปิดทุกแอป', () => { open.length = 0; draw(); }]]));
      const need = [['งานเอกสาร', 'CPU ทั่วไป · RAM 8 GB · SSD 256 GB'], ['แต่งภาพ', 'RAM 16 GB · จอสีดี · SSD 512 GB'], ['ตัดต่อวิดีโอ', 'CPU 6 คอร์+ · RAM 16 GB+ · GPU แยก · SSD 512 GB+'], ['เล่นเกม', 'GPU แรง · RAM 16 GB · CPU เร็ว']];
      const rN = L.readout('สเปกที่ควรเน้น');
      L.select('งานที่จะใช้', need.map((n) => n[0]), (i) => rN(need[i][1]));
      L.steps([
        { t: 'เปรียบคอมพิวเตอร์กับร้านส้มตำ: แม่ค้า = CPU · โต๊ะเตรียมของ = RAM · ตู้เย็น = SSD · คนจัดจาน = GPU' },
        { t: 'กดเปิดแอปทีละตัว แต่ละแอปกินพื้นที่บนโต๊ะ (RAM) ไม่เท่ากัน ตัดต่อวิดีโอกินที่มากที่สุด' },
        { t: 'เมื่อของล้นโต๊ะ (กล่องสีแดง) เครื่องต้องย้ายงานไปพักในตู้ (SSD) ซึ่งช้ากว่ามาก จึงรู้สึกว่าเครื่อง "ค้าง"' },
        { t: 'เปลี่ยน RAM เป็น 16 GB แล้วเปิดแอปชุดเดิม ซื้อคอม/มือถือ ให้ถามก่อนว่า "จะเอาไปทำงานอะไร" แล้วดูช่องสเปกที่ควรเน้น' },
      ]);
      L.quiz('เปิดแอปหลายตัวแล้วมือถือค้าง น่าจะเพราะส่วนใดไม่พอ', ['RAM', 'จอภาพ', 'ลำโพง'], 0, 'RAM คือที่ทำงานชั่วคราว เปิดหลายแอปพร้อมกันแล้วไม่พอ เครื่องจึงช้า/ค้าง');
    },
  },

  2: {
    idea: 'บันไดหน่วยข้อมูล B → KB → MB → GB → TB ขึ้นบันได "หาร" ลงบันได "คูณ" และไขความลับว่าทำไมแฟลชไดรฟ์ 32 GB เหลือ 29.8 GB',
    build(L) {
      L.cam(-1, 7, 14, 0, 2, 0); L.floor(30);
      const units = ['Byte', 'KB', 'MB', 'GB', 'TB'];
      const steps = units.map((u, i) => { const b = L.box({ w: 2.4, h: 0.8 + i * 0.8, d: 2.4, color: PALETTE[i], x: -5 + i * 2.5, y: (0.8 + i * 0.8) / 2 }); L.label(u, { parent: b, y: (0.8 + i * 0.8) / 2 + 0.4, cls: 'big' }); return b; });
      const walker = L.sphere({ r: 0.35, color: C.white, emissive: 0x444444 });
      let base = 1024, val = 3, from = 3, to = 2;
      const rR = L.readout('ผลการแปลง'), rH = L.readout('วิธีคิด'), rF = L.readout('แฟลชไดรฟ์ 32 GB ที่คอมเห็น');
      function place(i) { walker.position.set(-5 + i * 2.5, 0.8 + i * 0.8 + 0.4, 0); }
      async function conv() {
        place(from); let v = val, how = [`${val} ${units[from]}`];
        const dir = to > from ? 1 : -1;
        for (let i = from; i !== to; i += dir) {
          v = dir > 0 ? v / base : v * base; how.push((dir > 0 ? '÷ ' : '× ') + base);
          await L.moveTo(walker, -5 + (i + dir) * 2.5, 0.8 + (i + dir) * 0.8 + 0.4, 0, 500);
        }
        rR(`${val} ${units[from]} = ${v.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${units[to]}`, 'good'); rH(how.join(' '));
      }
      L.slider('ค่าที่จะแปลง', { min: 1, max: 4096, value: 3 }, (v) => (val = v));
      L.select('จากหน่วย', units, (i) => { from = i; place(i); }, 3);
      L.select('เป็นหน่วย', units, (i) => (to = i), 2);
      L.select('ฐานที่ใช้', ['1024 (คอมพิวเตอร์นับ)', '1000 (ผู้ผลิตนับ)'], (i) => (base = i ? 1000 : 1024));
      L.buttons([['แปลงหน่วย', conv]]);
      rF(`32 × 1000³ ÷ 1024³ = ${r2((32e9) / 1024 ** 3)} GB`);
      place(3);
      L.steps([
        { t: 'คอมรู้จักแค่ 0 กับ 1 หนึ่งตัวเรียก "บิต" 8 บิต = 1 ไบต์ เก็บตัวอักษรอังกฤษได้ 1 ตัว' },
        { t: 'บันไดหน่วย: ขึ้นบันได (หน่วยใหญ่ขึ้น) ให้หาร ลงบันได (หน่วยเล็กลง) ให้คูณ เหมือน 100 สตางค์ = 1 บาท' },
        { t: 'ลองแปลง 3 GB เป็น MB (ฐาน 1024) ลูกบอลลงบันได 1 ขั้น = 3 × 1024 = 3,072 MB' },
        { t: 'ผู้ผลิตนับ 1 GB = 1,000,000,000 ไบต์ แต่คอมหารด้วย 1024 สามครั้ง 32 GB จึงแสดง 29.8 GB ไม่ได้โดนโกง แค่นับต่างกัน' },
      ]);
      L.quiz('2,048 KB เท่ากับกี่ MB (ฐาน 1024)', ['2 MB', '2,048,000 MB', '20.48 MB'], 0, 'KB → MB คือขึ้นบันได 1 ขั้น ต้องหาร 1024: 2,048 ÷ 1024 = 2 MB');
    },
  },

  3: {
    idea: 'สร้าง Prompt ทีละชั้น 6 ส่วน: บทบาท งาน บริบท รูปแบบ ผู้อ่าน ข้อจำกัด ยิ่งครบ คำตอบยิ่งตรงใจ และดูว่า AI "ทายคำถัดไป" อย่างไร',
    build(L) {
      L.cam(0, 6, 14, 0, 2.5, 0); L.floor(30);
      const parts = [
        ['บทบาท', 'คุณเป็นครูวิทยาศาสตร์'], ['งาน', 'ช่วยสรุป'], ['บริบท', 'เรื่องดาวเคราะห์ในระบบสุริยะ สำหรับสอบกลางภาค'],
        ['รูปแบบ', 'เป็นตาราง 3 คอลัมน์'], ['ผู้อ่าน', 'ให้นักเรียน ม.4 อ่าน'], ['ข้อจำกัด', 'ไม่เกิน 10 บรรทัด'],
      ];
      const on = [false, true, true, false, false, false];
      const g = L.group({ x: -3.5 });
      const meter = L.box({ w: 0.8, h: 1, d: 0.8, color: C.green, x: 0.5 }); L.label('ความตรงใจ', { x: 0.5, y: -0.4, cls: 'tick' });
      const out = L.label('', { x: -7.5, y: 4.2, cls: 'wrap' });
      const rP = L.readout('Prompt ที่ได้');
      function build() {
        L.clearGroup(g); let k = 0;
        parts.forEach(([n], i) => { if (!on[i]) return; const b = L.box({ w: 3.2, h: 0.6, d: 1.6, color: PALETTE[i], y: 0.3 + k * 0.62, parent: g }); L.label(n, { parent: b, x: -2.1, cls: 'tag' }); k++; });
        const h = 0.3 + k * 0.9; L.tween(meter.scale, { y: h }, 400); L.tween(meter.position, { y: h / 2 }, 400);
        L.color(meter, k >= 5 ? C.green : k >= 3 ? C.amber : C.red);
        rP(parts.filter((_, i) => on[i]).map((p) => p[1]).join(' ') || '(ว่าง)');
        out.set(k >= 5 ? '<b>คำตอบ AI:</b> ตารางสั้น 3 คอลัมน์ ชื่อ–ลักษณะเด่น–ลำดับ ภาษาเข้าใจง่ายระดับ ม.4 พอดีอ่านทวน' : k >= 3 ? '<b>คำตอบ AI:</b> สรุปพอใช้ แต่ยาวเกิน รูปแบบไม่ตามที่ต้องการ' : '<b>คำตอบ AI:</b> ข้อความยาวมาก กว้าง ๆ ไม่รู้จะเอาไปใช้ยังไง');
      }
      parts.forEach(([n, t], i) => L.toggle(`${n}: “${t}”`, on[i], (v) => { on[i] = v; build(); }));
      const words = [['ดาวพฤหัสบดี', 0.46], ['ดาวเสาร์', 0.28], ['ดวงอาทิตย์', 0.15], ['ดาวโลก', 0.11]];
      const pb = L.bars(words.map((w) => w[1] * 10), { x: 5, z: -3, gap: 1.2, scale: 0.6, names: words.map((w) => w[0]), colors: [C.amber, C.slate, C.slate, C.slate], fmt: (v) => Math.round(v * 10) + '%' });
      L.label('"ดาวเคราะห์ที่ใหญ่ที่สุดในระบบสุริยะคือ ___"', { x: 5, y: 4, z: -3, cls: 'tag' });
      L.steps([
        { t: 'AI แชตอย่าง Gemini ChatGPT Copilot "ทายคำถัดไป" ที่น่าจะต่อกันมากที่สุด (แท่งด้านหลัง) มันเก่งภาษา แต่ไม่ได้รู้ความจริงทุกเรื่อง', f: () => L.flyTo(4, 5, 8, 5, 2, -3) },
        { t: 'ตอนนี้ Prompt มีแค่ "งาน + บริบท" มาตรวัดยังต่ำ คำตอบกว้างและยาวเกินไป', f: () => L.flyTo(0, 6, 14, 0, 2.5, 0) },
        { t: 'เปิดส่วนที่เหลือทีละข้อทางขวา หอคอย Prompt สูงขึ้น ความตรงใจเพิ่มขึ้น ส่วน "รูปแบบ" กับ "ผู้อ่าน" เปลี่ยนคำตอบมากที่สุด' },
        { t: 'กติกา: Explain ให้ AI อธิบาย → Try เราลองเอง → Check ตรวจก่อนใช้ และห้ามใส่เลขบัตร รหัสผ่าน ที่อยู่ เบอร์โทร ลงใน AI' },
      ]);
      build();
      L.quiz('Prompt "ช่วยทำการบ้านให้หน่อย" ขาดส่วนไหน', ['ขาดแค่บทบาท', 'ขาดเกือบทุกส่วน: บริบท รูปแบบ ผู้อ่าน ข้อจำกัด', 'ครบแล้ว'], 1, 'ไม่บอกวิชา เรื่อง รูปแบบ ใครอ่าน และความยาว AI จึงเดาและตอบไม่ตรงใจ');
    },
  },

  4: {
    idea: 'สไลด์บนเวทีห้องประชุม ปรับขนาดตัวอักษรและจำนวนบรรทัด แล้วสลับไปนั่ง "แถวหลัง" ดูว่ายังอ่านออกไหม',
    build(L) {
      L.cam(0, 2.2, 6, 0, 2.6, 0); L.floor(40);
      let size = 18, lines = 10, img = false;
      const slide = L.texPlane({ w: 6.4, h: 3.6, pw: 1280, ph: 720, y: 2.6, z: -3 }, () => {});
      L.box({ w: 6.8, h: 4, d: 0.1, color: 0x222b33, y: 2.6, z: -3.08, edges: false });
      for (let r = 0; r < 4; r++) for (let c = -3; c <= 3; c++) L.box({ w: 0.7, h: 0.5, d: 0.6, color: 0x34495a, x: c * 1.1, y: 0.25, z: 2 + r * 2.4, edgeOpacity: 0.1 });
      const rR = L.readout('แถวหลังอ่านได้ไหม'), rL = L.readout('จำนวนบรรทัด');
      function draw() {
        slide.tex.redraw((ctx, w, h) => {
          ctx.fillStyle = '#f6f8fa'; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = '#12324a'; ctx.font = `600 ${size * 2.6}px Sarabun, sans-serif`; ctx.fillText('เลย 3 ที่ต้องไป', 60, 40 + size * 2.6);
          const body = ['ภูกระดึง เดินขึ้นเขาชมทะเลหมอก', 'ภูเรือ ดอกไม้เมืองหนาว', 'เชียงคาน ถนนคนเดินริมโขง', 'แก่งคุดคู้ แก่งหินกลางแม่น้ำโขง', 'พระธาตุศรีสองรัก ด่านซ้าย', 'สวนหินผางาม', 'ผีตาโขน ประเพณีประจำปี', 'ภูป่าเปาะ ฟูจิเมืองเลย', 'ไร่องุ่นภูเรือ', 'ตลาดเช้าเชียงคาน', 'ดอยแม่อูคอ', 'น้ำตกห้วยไผ่'];
          ctx.font = `${size * 2}px Sarabun, sans-serif`; ctx.fillStyle = '#26323c';
          const x0 = img ? 640 : 60; let y = 80 + size * 5.6;
          for (let i = 0; i < lines && y < h - 20; i++) { ctx.fillText('• ' + body[i], x0, y); y += size * 2.6; }
          if (img) { const gr = ctx.createLinearGradient(0, 200, 0, 680); gr.addColorStop(0, '#9ed0f2'); gr.addColorStop(1, '#2f7d5b'); ctx.fillStyle = gr; ctx.fillRect(60, 200, 540, 460);
            ctx.fillStyle = '#e9f2f6'; ctx.beginPath(); ctx.moveTo(60, 520); ctx.lineTo(260, 330); ctx.lineTo(420, 470); ctx.lineTo(600, 360); ctx.lineTo(600, 660); ctx.lineTo(60, 660); ctx.fill(); }
        });
        const ok = size >= 24 && lines <= 6;
        rR(ok ? 'อ่านออก' : size < 24 ? 'ตัวเล็กเกินไป (ต่ำกว่า 24 pt)' : 'ข้อความเยอะเกิน 6 บรรทัด', ok ? 'good' : 'bad'); rL(lines + ' บรรทัด');
      }
      L.slider('ขนาดตัวอักษรเนื้อหา', { min: 12, max: 40, value: 18, unit: 'pt' }, (v) => { size = v; draw(); });
      L.slider('จำนวนบรรทัด', { min: 1, max: 12, value: 10 }, (v) => { lines = v; draw(); });
      L.toggle('ใส่ภาพใหญ่ (ภาพทะเลหมอก)', false, (v) => { img = v; draw(); });
      L.buttons([['ยืนหน้าเวที', () => L.flyTo(0, 2.2, 3, 0, 2.6, -3)], ['นั่งแถวหน้า', () => L.flyTo(0, 1.4, 2.3, 0, 2.6, -3)], ['นั่งแถวหลังสุด', () => L.flyTo(0, 1.6, 10, 0, 2.6, -3)]], { radio: true, active: 0 });
      L.steps([
        { t: 'สไลด์นี้มีข้อความ 10 บรรทัด ตัว 18 pt กด "นั่งแถวหลังสุด" แล้วลองอ่านดู', f: () => L.flyTo(0, 2.2, 6, 0, 2.6, -3) },
        { t: 'หลัก: 1 สไลด์ 1 ความคิด · ไม่เกิน 6 บรรทัด · ตัวอักษรอย่างน้อย 24 pt · ภาพใหญ่ชัด · สีตัดกัน · ฟอนต์ไม่เกิน 2 แบบ', f: () => L.flyTo(0, 1.6, 10, 0, 2.6, -3) },
        { t: 'ปรับเป็น 3 บรรทัด ตัว 28 pt และใส่ภาพใหญ่ ช่อง "แถวหลังอ่านได้ไหม" จะเป็นสีเขียว' },
        { t: 'สไลด์มีไว้ "ช่วย" คนพูด ไม่ได้ "แทน" คนพูด ถ้าเขียนทุกคำบนสไลด์ คนฟังจะอ่านเอง ไม่ฟังเรา', f: () => L.flyTo(0, 2.2, 6, 0, 2.6, -3) },
      ]);
      L.quiz('ตัวอักษรบนสไลด์ควรมีขนาดอย่างน้อยเท่าไร', ['12 pt', '18 pt', '24 pt'], 2, 'ต่ำกว่า 24 pt คนหลังห้องอ่านลำบาก');
    },
  },

  5: {
    idea: 'ผลสำรวจ "ห้องเรา" ชุดเดียว แสดงได้หลายแบบ เลือกแผนภูมิให้ตรงกับสิ่งที่อยากบอก และคิดเปอร์เซ็นต์ให้ถูกก่อนเชื่อ AI',
    build(L) {
      L.cam(0, 6, 14, 0, 2, 0); L.floor(36);
      const data = [['TikTok', 14], ['YouTube', 9], ['LINE', 7], ['Instagram', 4], ['อื่น ๆ', 2]], tot = 36;
      const g = L.group();
      const rP = L.readout('เปอร์เซ็นต์ TikTok', `14 ÷ 36 × 100 = ${r2(14 / 36 * 100)}%`), rA = L.readout('คำแนะนำ');
      function show(kind) {
        L.clearGroup(g);
        if (kind === 0) {
          const b = L.bars(data.map((d) => d[1]), { names: data.map((d) => d[0]), scale: 0.3, gap: 1.6, w: 1.1, colors: [C.amber, C.slate, C.slate, C.slate, C.slate], fmt: (v) => v + ' คน' }); g.add(b.g);
          rA('แผนภูมิแท่ง: เปรียบเทียบจำนวนแต่ละแอป เน้นแท่งที่สำคัญด้วยสี', 'good');
        } else if (kind === 1) {
          let a0 = 0; data.forEach(([n, v], i) => { const arc = (v / tot) * Math.PI * 2; const m = new L.THREE.Mesh(new L.THREE.CylinderGeometry(3, 3, 0.4, 48, 1, false, a0, arc), new L.THREE.MeshStandardMaterial({ color: PALETTE[i] }));
            m.position.y = 2.5; m.rotation.x = Math.PI / 2; g.add(m); const mid = a0 + arc / 2; g.add(L.label(`${n} ${Math.round((v / tot) * 100)}%`, { x: Math.sin(mid) * 2, y: 2.5 + Math.cos(mid) * 2, z: 0.4, cls: 'tag' })); a0 += arc; });
          rA('แผนภูมิวงกลม: ดูสัดส่วนของทั้งหมด (รวม 100%) ไม่ควรเกิน 5 ส่วน', 'good');
        } else {
          const hrs = [3, 4, 5, 6, 5.5, 7, 8], pts = hrs.map((h, i) => [-5 + i * 1.6, 0.5 + h * 0.5, 0]);
          g.add(L.line(pts, C.amber)); pts.forEach((p, i) => { const s = L.sphere({ r: 0.14, color: C.amber, x: p[0], y: p[1], z: 0, parent: g }); g.add(L.label(['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'][i], { x: p[0], y: 0.1, cls: 'tick' })); });
          g.add(L.label('ชั่วโมงใช้มือถือของห้องตลอดสัปดาห์', { x: 0, y: 5.4, cls: 'tag' }));
          rA('กราฟเส้น: ข้อมูลตามเวลา ดูแนวโน้ม (ข้อมูลชุดนี้ไม่เหมาะกับแอปที่ชอบ)', 'warn');
        }
      }
      L.select('ชนิดแผนภูมิ', ['แผนภูมิแท่ง', 'แผนภูมิวงกลม', 'กราฟเส้น (ข้อมูลรายวัน)'], show);
      const rT = L.readout('จับเวลาอ่าน', '10 วินาที');
      L.buttons([['ทดสอบ 10 วินาที', async () => { for (let s = 10; s >= 0; s--) { rT(s + ' วินาที', s ? 'warn' : 'good'); if (!(await L.wait(1000))) return; } rT('หมดเวลา! บอกสาระสำคัญได้ไหม', 'good'); }]]);
      L.note('AI สรุปว่า "นักเรียน 80% ใช้ TikTok" — ตรวจ: 14 ÷ 36 × 100 = 38.89% AI ผิด! ต้องเทียบกับตัวเลขจริงเสมอ');
      L.steps([
        { t: 'ข้อมูลคือแอปที่นักเรียน 36 คนใช้มากที่สุด จาก Google Forms (ไม่เก็บชื่อ) แผนภูมิแท่งเหมาะกับการเปรียบเทียบจำนวน' },
        { t: 'เปลี่ยนเป็นแผนภูมิวงกลม ใช้ได้เพราะรวมกันเป็น 100% และมีแค่ 5 ส่วน' },
        { t: 'อินโฟกราฟิกที่ดีต้องเข้าใจใน 10 วินาที: หัวเรื่อง → ตัวเลขเด่น → แผนภูมิ → รายละเอียด → แหล่งข้อมูล' },
        { t: 'สูตรเปอร์เซ็นต์ = ส่วน ÷ ทั้งหมด × 100 ใช้ตรวจสิ่งที่ AI สรุปทุกครั้ง' },
      ]);
      L.quiz('18 คนจาก 36 คน คิดเป็นกี่เปอร์เซ็นต์', ['18%', '36%', '50%'], 2, '18 ÷ 36 × 100 = 50%');
    },
  },

  6: {
    idea: 'กล้องจำลอง: มองผ่านช่องมองภาพที่มีเส้นกฎสามส่วน ปรับมุมกล้อง ตำแหน่งจุดเด่น และทิศของแสง แล้วดูว่าภาพเปลี่ยนความรู้สึกอย่างไร',
    build(L) {
      dimLights(L, 0.35);
      L.floor(40, 0x203024);
      const pag = L.group({ x: 0, z: 0 });
      L.box({ w: 2.4, h: 0.6, d: 2.4, color: C.sand, y: 0.3, parent: pag }); L.box({ w: 1.8, h: 1.2, d: 1.8, color: 0xe6d3a3, y: 1.2, parent: pag });
      L.cone({ r: 1.0, h: 3.2, color: C.amber, y: 3.4, parent: pag, seg: 8 }); L.cyl({ r: 0.05, h: 0.8, color: C.amber, y: 5.3, parent: pag });
      L.label('พระธาตุ (จุดเด่น)', { parent: pag, y: 6, cls: 'tag' });
      for (let i = 0; i < 8; i++) { const a = i * 0.8; L.cone({ r: 0.6, h: 2, color: 0x2f6b3a, x: -8 + i * 2.2, y: 1, z: -6 - (i % 2) }); }
      L.box({ w: 1.2, h: 30, d: 0.2, color: 0x6b5b45, x: 0, y: 0.01, z: 6, rx: -Math.PI / 2, edges: false });
      const light = new L.THREE.DirectionalLight(0xfff1d6, 3.2); L.root.add(light); L.root.add(light.target);
      const sun = L.sphere({ r: 0.6, color: 0xffd27a, emissive: 0xffaa33 });
      const stageEl = document.getElementById('stage');
      const grid = document.createElement('div'); grid.style.cssText = 'position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,transparent calc(33.33% - 1px),#ffffff88 33.33%,transparent calc(33.33% + 1px),transparent calc(66.66% - 1px),#ffffff88 66.66%,transparent calc(66.66% + 1px)),linear-gradient(0deg,transparent calc(33.33% - 1px),#ffffff88 33.33%,transparent calc(33.33% + 1px),transparent calc(66.66% - 1px),#ffffff88 66.66%,transparent calc(66.66% + 1px));';
      stageEl.appendChild(grid); L.onCleanup(() => grid.remove());
      let h = 1.6, off = 0, dist = 12, la = 0;
      const rA = L.readout('มุมกล้อง'), rL = L.readout('แสง');
      function cam() {
        L.controls.enableRotate = false;
        L.cam(off, h, dist, off, h < 1 ? 3.5 : h > 6 ? 0.5 : 2.5, 0);
        rA(h < 1 ? 'มุมต่ำ: ดูยิ่งใหญ่ สง่า' : h > 6 ? 'มุมสูง: ดูเล็ก เห็นภาพรวม' : 'ระดับสายตา: เป็นธรรมชาติ');
      }
      function lit() {
        const a = la * Math.PI / 180; light.position.set(Math.sin(a) * 10, 6, Math.cos(a) * 10); sun.position.copy(light.position).multiplyScalar(1.6);
        rL(Math.abs(la) < 45 ? 'แสงหน้า: เห็นรายละเอียดชัด' : Math.abs(la) < 135 ? 'แสงข้าง: เห็นมิติ แสงเงา' : 'แสงย้อน: ด้านหน้ามืด ได้ภาพเงาดำ (Silhouette)', Math.abs(la) >= 135 ? 'warn' : 'good');
      }
      L.slider('ความสูงกล้อง (มุมต่ำ ↔ มุมสูง)', { min: 0.3, max: 10, step: 0.1, value: 1.6, unit: 'ม.' }, (v) => { h = v; cam(); });
      L.slider('เลื่อนกล้องซ้าย–ขวา (วางจุดเด่นตามกฎสามส่วน)', { min: -3, max: 3, step: 0.1, value: 0 }, (v) => { off = v; cam(); });
      L.slider('ระยะกล้อง (เดินเข้าใกล้แทนการซูม)', { min: 6, max: 20, step: 0.5, value: 12, unit: 'ม.' }, (v) => { dist = v; cam(); });
      L.slider('ทิศของแสง', { min: -180, max: 180, step: 5, value: 0, unit: '°' }, (v) => { la = v; lit(); });
      L.toggle('แสดงเส้นกฎสามส่วน', true, (v) => (grid.hidden = !v));
      cam(); lit();
      L.steps([
        { t: 'หน้าจอนี้คือช่องมองภาพของกล้อง ตอนนี้พระธาตุอยู่กลางภาพพอดี ภาพดูนิ่ง ๆ' },
        { t: 'กฎสามส่วน: เลื่อนกล้องซ้าย–ขวาให้พระธาตุไปอยู่บนเส้นแนวตั้งเส้นใดเส้นหนึ่ง ภาพมีมิติและน่าสนใจขึ้น ทางเดินเป็น "เส้นนำสายตา"' },
        { t: 'ลดความสูงกล้องเหลือ 0.5 ม. (มุมต่ำ) พระธาตุดูสง่า ยกเป็น 8 ม. (มุมสูง) ดูเล็กลงและเห็นภาพรวม' },
        { t: 'หมุนแสงไป 180° คือแสงย้อน ด้านหน้ามืด ได้ภาพเงาดำสวยตอนเย็น ถ่ายคนต้องหันหน้าคนเข้าหาแสง' },
      ]);
      L.quiz('อยากให้เสาธงโรงเรียนดูสูงสง่า ควรถ่ายมุมใด', ['มุมสูงมองลง', 'มุมต่ำมองขึ้น', 'ซูมดิจิทัล 8 เท่า'], 1, 'มุมต่ำทำให้วัตถุดูใหญ่และสง่า');
    },
  },

  7: {
    idea: 'ไทม์ไลน์คลิปสั้น 30 วินาที: Hook 3 วินาที → เนื้อหา → ปิดท้ายชวนติดตาม ลากหัวเล่นดูว่าคนดูจะอยู่ต่อไหม และคิดขนาดไฟล์จาก bitrate',
    build(L) {
      L.cam(0, 7, 13, 0, 0.5, 0); L.floor(36);
      const S = 0.4;
      const segs = [['Hook', 0, 3, C.red], ['เนื้อหา 1', 3, 10, C.blue], ['เนื้อหา 2', 10, 18, C.blue], ['เนื้อหา 3', 18, 25, C.blue], ['ปิดท้าย/ชวนติดตาม', 25, 30, C.green]];
      let hookLen = 3, clipLen = 30;
      const g = L.group();
      const head = L.box({ w: 0.08, h: 2, d: 2.4, color: C.white, emissive: 0x666666, y: 1 });
      const ret = L.line([[0, 0, 0], [0, 0, 0]], C.amber); const retL = L.label('คนดูที่ยังอยู่', { cls: 'tick' });
      const rH = L.readout('Hook ยาว'), rR = L.readout('คนดูที่อยู่จนจบ (ประมาณ)'), rB = L.readout('ขนาดไฟล์');
      let br = 8;
      function draw() {
        L.clearGroup(g); const x0 = -clipLen * S / 2;
        const sg = [['Hook', 0, hookLen, C.red], ['เนื้อหา', hookLen, clipLen - 5, C.blue], ['ปิดท้าย', clipLen - 5, clipLen, C.green]];
        sg.forEach(([n, a, b, c]) => { if (b <= a) return; const m = L.box({ w: (b - a) * S - 0.05, h: 0.5, d: 1.4, color: c, x: x0 + ((a + b) / 2) * S, y: 0.25, parent: g }); L.label(`${n} ${a}–${b} วิ`, { parent: m, y: 0.6, cls: 'tick' }); });
        for (let t = 0; t <= clipLen; t += 5) g.add(L.label(t + 's', { x: x0 + t * S, y: 0, z: 1.2, cls: 'tick' }));
        const pts = []; const keep = hookLen <= 3 ? 0.85 : Math.max(0.3, 0.85 - (hookLen - 3) * 0.08);
        for (let t = 0; t <= clipLen; t += 0.5) { const v = t < 3 ? 1 - (1 - keep) * (t / 3) : keep * Math.exp(-(t - 3) / (hookLen > 3 ? 18 : 40)); pts.push([x0 + t * S, 1 + v * 3, -1]); }
        L.setLine(ret, pts); retL.position.set(x0 - 0.5, 4, -1);
        const end = pts[pts.length - 1][1] - 1; rR(Math.round((end / 3) * 100) + '%', end / 3 > 0.5 ? 'good' : 'bad');
        rH(hookLen + ' วินาที', hookLen <= 3 ? 'good' : 'bad'); rB(`${br} Mbps × ${clipLen} วิ ÷ 8 = ${r2(br * clipLen / 8)} MB`);
        head.position.x = x0;
      }
      L.slider('ความยาวช่วงเกริ่น/Hook', { min: 1, max: 12, value: 3, unit: 'วินาที' }, (v) => { hookLen = v; draw(); });
      L.slider('Bitrate', { min: 2, max: 20, value: 8, unit: 'Mbps' }, (v) => { br = v; draw(); });
      L.buttons([['เล่นคลิป', async () => { const x0 = -clipLen * S / 2; head.position.x = x0; await L.tween(head.position, { x: x0 + clipLen * S }, 4000, (k) => k); }]]);
      L.steps([
        { t: 'คลิปสั้น 30 วินาที แบ่ง 3 ส่วน: Hook 3 วิแรก ดึงความสนใจ → เนื้อหา 2–3 ประเด็น → ปิดท้าย 5 วิ ชวนติดตาม/ชวนมา' },
        { t: 'เส้นสีเหลืองคือจำนวนคนดูที่ยังไม่ปัดหนี เลื่อน Hook เป็น 10 วินาที (เกริ่น "สวัสดีครับ วันนี้…" ยาว ๆ) คนดูหายเร็วมาก' },
        { t: 'ถ่ายแนวตั้ง 9:16 1080×1920 30 fps สำหรับ TikTok/Reels ใส่ซับอัตโนมัติแล้วต้องตรวจคำผิดทุกบรรทัด และใช้เพลงปลอดลิขสิทธิ์' },
        { t: 'ขนาดไฟล์ ≈ bitrate × วินาที ÷ 8 คลิป 30 วิ ที่ 8 Mbps = 30 MB' },
      ]);
      draw();
      L.quiz('คลิปแนวตั้งสำหรับ TikTok ใช้อัตราส่วนเท่าไร', ['16:9', '9:16', '1:1'], 1, 'แนวตั้ง 9:16 (1080 × 1920) ต้องถือมือถือแนวตั้งตั้งแต่ตอนถ่าย');
    },
  },

  8: {
    idea: 'กำแพงรหัสผ่าน: ยิ่งยาวและผสมตัวอักษรหลายแบบ กำแพงยิ่งสูง เวลาที่ใช้เดาสุ่มยิ่งนาน และ 2FA คือประตูชั้นที่สองที่มิจฉาชีพผ่านไม่ได้',
    build(L) {
      L.cam(0, 6, 14, 0, 2, 0); L.floor(36);
      const wall = L.group();
      const door2 = L.box({ w: 1.8, h: 3, d: 0.3, color: C.violet, x: 5, y: 1.5 }); L.label('ประตูชั้นที่ 2: 2FA', { parent: door2, y: 1.9, cls: 'tag' });
      const thief = L.sphere({ r: 0.4, color: C.red, x: -7, y: 0.4, z: 2 }); L.label('มิจฉาชีพ', { parent: thief, y: 0.7, cls: 'tick' });
      let pw = 'malee2552', fa = false;
      const rS = L.readout('ชุดตัวอักษร'), rT = L.readout('เวลาเดาสุ่ม (โดยประมาณ)'), rV = L.readout('ผลลัพธ์');
      function score() {
        let set = 0; if (/[a-z]/.test(pw)) set += 26; if (/[A-Z]/.test(pw)) set += 26; if (/[0-9]/.test(pw)) set += 10; if (/[^a-zA-Z0-9]/.test(pw)) set += 33;
        const bits = pw.length * Math.log2(Math.max(set, 1)); const sec = Math.pow(2, bits) / 1e10 / 2;
        const fmt = sec < 1 ? 'ไม่ถึง 1 วินาที' : sec < 3600 ? Math.round(sec / 60) + ' นาที' : sec < 86400 * 365 ? Math.round(sec / 86400) + ' วัน' : sec < 1e12 * 365 * 86400 ? (sec / 31536000).toExponential(1).replace('e+', ' × 10^') + ' ปี' : 'นานกว่าอายุจักรวาล';
        let weak = /(19|20|25)\d\d|1234|password|qwerty/i.test(pw);
        rS(`${pw.length} ตัว · ${set} แบบ`); rT(weak ? 'เดาได้เร็ว! มีวันเกิด/คำยอดนิยม' : fmt, weak || bits < 50 ? 'bad' : bits < 70 ? 'warn' : 'good');
        L.clearGroup(wall); const rows = Math.min(14, Math.round(bits / 6) - (weak ? 3 : 0));
        for (let r = 0; r < Math.max(1, rows); r++) for (let c = 0; c < 6; c++) wall.add(L.box({ w: 0.95, h: 0.38, d: 0.6, color: r % 2 ? 0xb5674a : 0xa35a3f, x: -0.5 * (r % 2) + c - 2.5, y: 0.2 + r * 0.4, edgeOpacity: 0.15 }));
        return { bits, weak };
      }
      L.input('ลองพิมพ์รหัสผ่าน (ตัวอย่าง อย่าใช้รหัสจริง)', pw, (v) => { pw = v; score(); });
      L.toggle('เปิด 2FA (ยืนยันจากมือถือเราอีกชั้น)', false, (v) => { fa = v; door2.visible = v; });
      L.buttons([['ใช้ประโยคจำง่าย', () => { const i = document.querySelector('.ctl input[type=text]'); i.value = 'Ch0bKinKhaoPun@2569!'; i.dispatchEvent(new Event('input')); }],
        ['มิจฉาชีพโจมตี', async () => {
          const { bits, weak } = score(); thief.position.set(-7, 0.4, 2); const g = L.gen;
          const broke = weak || bits < 50;
          await L.moveTo(thief, broke ? 0 : -3.6, 0.4, broke ? 0 : 2, 900); if (!L.alive(g)) return;
          if (!broke) { rV('ผ่านกำแพงไม่ได้', 'good'); return; }
          if (fa) { await L.moveTo(thief, 3.8, 0.4, 0, 700); rV('รู้รหัสผ่านแล้ว แต่ติดประตู 2FA เข้าบัญชีไม่ได้', 'good'); }
          else { await L.moveTo(thief, 7, 0.4, 0, 700); rV('เข้าบัญชีได้! ต้องใช้รหัสที่แข็งแรงขึ้นและเปิด 2FA', 'bad'); }
        }]]);
      score();
      L.steps([
        { t: 'รหัส "malee2552" มีชื่อและปีเกิด เดาได้เร็วมาก กำแพงจึงเตี้ย กด "มิจฉาชีพโจมตี" ดูผล' },
        { t: 'รหัสแข็งแรง: ยาว 12 ตัวขึ้นไป ผสมตัวเล็ก ตัวใหญ่ ตัวเลข สัญลักษณ์ ไม่ใช้วันเกิด ไม่ใช้รหัสเดียวทุกแอป ลองกด "ใช้ประโยคจำง่าย"' },
        { t: 'เปิด 2FA แล้วกลับไปใช้รหัสอ่อน ๆ อีกครั้ง แม้มิจฉาชีพรู้รหัส ก็ยังติดประตูชั้นที่สอง' },
        { t: 'กลโกงด้วย AI: เสียงปลอมเหมือนญาติขอโอนเงิน คลิปคนดังชวนลงทุน แชตขอรหัส OTP กฎทอง: หยุด → ตรวจ (โทรกลับเบอร์ที่รู้จัก) → ปรึกษาผู้ใหญ่ → ไม่โอน ไม่บอกรหัส' },
      ]);
      L.quiz('2FA ช่วยอะไร', ['ทำให้รหัสผ่านสั้นลง', 'แม้รหัสผ่านรั่ว ก็ยังเข้าบัญชีไม่ได้ถ้าไม่ยืนยันขั้นที่สอง', 'ทำให้ไม่ต้องจำรหัสผ่าน'], 1, '2FA ต้องยืนยันจากอุปกรณ์ของเราอีกชั้น มิจฉาชีพที่ได้รหัสไปจึงยังเข้าไม่ได้');
    },
  },

  9: {
    idea: 'แผนงานโครงงานสื่อแนะนำท้องถิ่น 2 สัปดาห์ แบบ Gantt สามมิติ เทียบ Timeline ที่ AI ร่าง กับแผนที่ปรับให้ตรงเวลาจริงของทีม',
    build(L) {
      L.cam(0, 8, 14, 0, 0, 0); L.floor(36);
      const members = [['ภูผา', C.amber], ['มะลิ', C.pink], ['ต้นกล้า', C.teal], ['ใบเตย', C.violet]];
      const tasks = [
        ['หาข้อมูล/สัมภาษณ์', 0, [1, 3], [1, 4]], ['ถ่ายภาพ 3 ภาพ', 1, [3, 5], [6, 7]], ['ทำอินโฟกราฟิก', 2, [4, 7], [5, 9]],
        ['ถ่ายคลิป', 3, [6, 8], [6, 7]], ['ตัดต่อคลิป', 3, [8, 10], [8, 11]], ['ตรวจข้อมูล + เครดิต', 0, [10, 11], [11, 12]], ['ซ้อมนำเสนอ', 1, [12, 13], [13, 14]],
      ];
      const g = L.group(); const S = 0.9, x0 = -7;
      for (let d = 1; d <= 14; d++) { L.label(String(d), { x: x0 + (d - 0.5) * S, y: 0, z: -4, cls: 'tick' }); if (d === 6 || d === 7 || d === 13 || d === 14) L.box({ w: S - 0.05, h: 0.02, d: 7.2, color: 0x2b3a46, x: x0 + (d - 0.5) * S, y: 0.01, z: -0.4, edges: false }); }
      L.label('วันที่ (กรอบเข้ม = เสาร์–อาทิตย์ ออกถ่ายได้)', { x: 0, y: 0, z: -4.8, cls: 'axis' });
      let real = false;
      const rC = L.readout('งานที่ชนวันไม่ว่าง'), rE = L.readout('วันส่งงาน');
      function draw() {
        L.clearGroup(g); let clash = 0;
        tasks.forEach(([n, m, ai, rl], i) => {
          const [a, b] = real ? rl : ai; const bad = !real && (n.startsWith('ถ่ายภาพ') && a < 6);
          if (bad) clash++;
          const z = -3.2 + i * 0.95, w = (b - a + 1) * S;
          const box = L.box({ w: w - 0.06, h: 0.45, d: 0.7, color: bad ? C.red : members[m][1], x: x0 + (a - 1) * S + w / 2, y: 0.23, z, parent: g });
          L.label(`${n} · ${members[m][0]}`, { parent: box, x: -w / 2 - 0.1, y: 0.3, cls: 'tick' }).center.set(1, 0.5);
        });
        rC(clash ? clash + ' งาน (นัดถ่ายวันเรียน)' : 'ไม่มี', clash ? 'bad' : 'good'); rE(real ? 'วันที่ 14' : 'วันที่ 13 (เร็วเกินจริง)');
      }
      L.select('แผนที่แสดง', ['Timeline ที่ AI ร่าง', 'แผนที่ทีมปรับให้ตรงเวลาจริง'], (i) => { real = i === 1; draw(); });
      L.steps([
        { t: 'แท่งแต่ละแท่งคืองาน 1 อย่าง สีบอกว่าใครรับผิดชอบ ความยาวคือจำนวนวัน ชุดสื่อมี 3 ชิ้น: อินโฟกราฟิก ภาพ 3 ภาพ คลิป' },
        { t: 'Timeline จาก AI ให้ออกถ่ายภาพวันที่ 3–5 ซึ่งเป็นวันเรียน (แท่งแดง) AI ไม่รู้ตารางชีวิตจริงของทีม' },
        { t: 'เลือก "แผนที่ทีมปรับ" ย้ายงานถ่ายไปเสาร์–อาทิตย์ และเผื่อเวลาตรวจข้อมูลกับเขียนเครดิต' },
        { t: 'ข้อมูลในสื่อต้องมาจากของจริง: สัมภาษณ์ ป้ายประวัติ เว็บราชการ ถ่ายภาพคนต้องขออนุญาตก่อน และเขียน AI Use Statement ว่าใช้ AI ช่วยวางแผน' },
      ]);
      L.quiz('ถ้าจะสัมภาษณ์ป้าที่ขายข้าวหลาม ต้องทำอะไรก่อน', ['ถ่ายคลิปทันทีแล้วค่อยบอก', 'แนะนำตัว บอกว่าเป็นงานโรงเรียน และขออนุญาต', 'ให้ AI แต่งบทสัมภาษณ์แทน'], 1, 'เคารพสิทธิ์และความเป็นส่วนตัวของคนในชุมชน ต้องขออนุญาตก่อนสัมภาษณ์หรือถ่ายภาพ');
    },
  },

  10: {
    idea: 'กราฟเรดาร์ประเมินโครงงาน 6 ด้าน ให้คะแนนแล้วรูปทรงเปลี่ยนตาม ดูว่ากลุ่มเด่นด้านไหนและควรพัฒนาด้านไหน',
    build(L) {
      L.cam(0, 9, 8, 0, 0, 0); L.floor(30);
      const crit = ['ข้อมูลถูกต้อง+อ้างอิง', 'อินโฟกราฟิก', 'ภาพถ่าย', 'คลิป', 'การนำเสนอ', 'ใช้ AI อย่างโปร่งใส'];
      const sc = [4, 3, 4, 2, 3, 4], R = 4;
      const ang = (i) => -Math.PI / 2 + (i / crit.length) * Math.PI * 2;
      for (let lv = 1; lv <= 4; lv++) L.line(crit.map((_, i) => [Math.cos(ang(i)) * R * lv / 4, 0.02, Math.sin(ang(i)) * R * lv / 4]).concat([[Math.cos(ang(0)) * R * lv / 4, 0.02, Math.sin(ang(0)) * R * lv / 4]]), 0x3d5466);
      crit.forEach((c, i) => { L.line([[0, 0.02, 0], [Math.cos(ang(i)) * R, 0.02, Math.sin(ang(i)) * R]], 0x3d5466); L.label(c, { x: Math.cos(ang(i)) * (R + 0.9), y: 0.1, z: Math.sin(ang(i)) * (R + 0.9), cls: 'tag' }); });
      let shape = null; const pins = crit.map(() => L.cyl({ r: 0.12, h: 1, color: C.amber }));
      const rT = L.readout('คะแนนรวม'), rB = L.readout('จุดเด่น'), rW = L.readout('ควรพัฒนา');
      function draw() {
        if (shape) L.remove(shape);
        const s = new L.THREE.Shape(); sc.forEach((v, i) => { const x = Math.cos(ang(i)) * R * v / 4, y = Math.sin(ang(i)) * R * v / 4; i ? s.lineTo(x, y) : s.moveTo(x, y); });
        const geo = new L.THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: false });
        shape = new L.THREE.Mesh(geo, new L.THREE.MeshStandardMaterial({ color: C.teal, transparent: true, opacity: 0.75 })); shape.rotation.x = Math.PI / 2; shape.position.y = 0.35; L.root.add(shape);
        sc.forEach((v, i) => { pins[i].scale.y = v * 0.4; pins[i].position.set(Math.cos(ang(i)) * R * v / 4, v * 0.2, Math.sin(ang(i)) * R * v / 4); });
        const tot = sc.reduce((a, b) => a + b, 0), mx = Math.max(...sc), mn = Math.min(...sc);
        rT(`${tot} / 24 (${Math.round(tot / 24 * 100)}%)`, tot >= 18 ? 'good' : tot >= 12 ? 'warn' : 'bad');
        rB(crit.filter((_, i) => sc[i] === mx).join(', ')); rW(crit.filter((_, i) => sc[i] === mn).join(', '), 'warn');
      }
      crit.forEach((c, i) => L.slider(c, { min: 1, max: 4, value: sc[i], fmt: (v) => ['', 'ปรับปรุง', 'พอใช้', 'ดี', 'ดีมาก'][v] }, (v) => { sc[i] = v; draw(); }));
      L.steps([
        { t: 'แต่ละแกนคือเกณฑ์ประเมิน 1 ด้าน (1–4 คะแนน) พื้นที่สีเขียวยิ่งกว้าง ยิ่งดีโดยรวม' },
        { t: 'รูปทรงที่ "บุบ" บอกด้านที่ควรพัฒนาทันที ตัวอย่างนี้ "คลิป" ได้น้อยที่สุด' },
        { t: 'ให้คะแนนเพื่อนตามจริง พร้อมเขียน "ชอบ… เพราะ…" 1 ข้อ และ "อยากให้เพิ่ม…" 1 ข้อ การให้เต็มทุกกลุ่มไม่ได้ช่วยให้เพื่อนพัฒนา' },
        { t: 'สะท้อนคิด: ทักษะไหนที่เราพัฒนามากที่สุดในเทอมนี้ และข้อตกลงการใช้ AI ที่เราจะใช้ต่อไปคืออะไร' },
      ]);
      draw();
      L.quiz('การบอกว่ากลุ่มใช้ AI ช่วยส่วนไหน ส่งผลต่อการประเมินอย่างไร', ['เสียคะแนนเสมอ', 'ได้คะแนนด้านความโปร่งใส และเพิ่มความน่าเชื่อถือ', 'ไม่เกี่ยวกับการประเมิน'], 1, 'การบอกอย่างตรงไปตรงมา (AI Use Statement) คือความซื่อสัตย์ทางวิชาการ');
    },
  },
};
