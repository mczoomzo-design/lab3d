// ม.5 วิทยาการคำนวณ (วิทยาการข้อมูล)
import { C, PALETTE } from '../engine.js';

const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const median = (a) => { const b = [...a].sort((x, y) => x - y), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
const r2 = (v) => Math.round(v * 100) / 100;
function gauss(rnd) { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function seeded(s) { return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }

export default {
  1: {
    idea: 'ใบเสร็จสหกรณ์โรงเรียน 60 ใบคือ "ข้อมูล" ดิบ ผ่านการประมวลผลกลายเป็นกราฟยอดขายรายวัน คือ "สารสนเทศ" แล้วนำไปตัดสินใจได้',
    build(L) {
      L.cam(0, 8, 18, 0, 1.5, 0); L.floor(36);
      const days = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.'], sales = [9, 11, 10, 12, 18];
      const rnd = seeded(3), cards = [];
      sales.forEach((n, d) => { for (let i = 0; i < n; i++) cards.push({ d, m: L.box({ w: 0.5, h: 0.06, d: 0.7, color: C.white, x: -7 + rnd() * 3, y: 0.05 + cards.length * 0.02, z: -2 + rnd() * 4, ry: rnd() * 3 }) }); });
      L.label('ข้อมูล: ใบเสร็จ 60 ใบ (ขายน้ำดื่ม)', { x: -5.5, y: 2.2, cls: 'tag', color: C.white });
      const mach = L.box({ w: 2, h: 2, d: 2, color: C.violet, x: -1, y: 1 }); L.label('ประมวลผล (นับ จัดกลุ่ม)', { parent: mach, y: 1.4, cls: 'tag' });
      const bars = L.bars([0, 0, 0, 0, 0], { x: 4, gap: 0.9, w: 0.7, scale: 0.18, names: days, color: C.teal, fmt: (v) => v + ' ขวด' });
      const t2 = L.label('สารสนเทศ: ยอดขายรายวัน', { x: 4, y: 4.4, cls: 'tag', color: C.teal });
      const bulb = L.sphere({ r: 0.5, color: 0x333d44, x: 7.6, y: 4 });
      const dec = L.label('', { x: 6.2, y: 5.2, cls: 'tag wrap', color: C.amber });
      const rD = L.readout('สถานะ', 'ข้อมูลดิบ'); const rN = L.readout('ใบเสร็จที่ประมวลผลแล้ว', '0');
      let done = false;
      async function process() {
        if (done) return; done = true; const g = L.gen; const cnt = [0, 0, 0, 0, 0];
        rD('กำลังประมวลผล', 'warn');
        for (let k = 0; k < cards.length; k++) {
          const c = cards[k]; L.moveTo(c.m, -1, 1, 0, 350).then(() => L.remove(c.m));
          if (!(await L.wait(60))) return; cnt[c.d]++; bars.set(c.d, cnt[c.d], 150); rN(k + 1);
        }
        await L.wait(500); if (!L.alive(g)) return;
        L.color(bars.items[4], C.amber); L.color(bulb, C.amber); bulb.material.emissive.set(0x775500);
        dec.set('การตัดสินใจ: วันศุกร์ขายดีที่สุด สั่งน้ำเพิ่มทุกวันพฤหัส'); rD('ได้สารสนเทศแล้ว', 'good');
      }
      L.buttons([['ประมวลผลข้อมูล', process]]);
      L.steps([
        { t: 'กองด้านซ้ายคือใบเสร็จ 60 ใบ แต่ละใบคือ "ข้อมูล" ข้อเท็จจริงดิบ ๆ ที่ยังใช้ตัดสินใจไม่ได้' },
        { t: 'กด "ประมวลผลข้อมูล" ใบเสร็จถูกนับและจัดกลุ่มตามวัน กลายเป็นแท่งกราฟ' },
        { t: 'กราฟยอดขายรายวันคือ "สารสนเทศ" ข้อมูลที่ผ่านการประมวลผลแล้วและมีความหมาย' },
        { t: 'สารสนเทศนำไปสู่การตัดสินใจ: ข้อมูล → ประมวลผล → สารสนเทศ → การตัดสินใจ จำลูกศรนี้ไว้ใช้ทั้งเทอม' },
        { t: 'ข้อมูลในใบเสร็จมีทั้งเชิงปริมาณ (จำนวนขวด ราคา) และเชิงคุณภาพ (ชื่อสินค้า วัน) เป็นข้อมูลปฐมภูมิเพราะสหกรณ์เก็บเอง' },
      ]);
      L.quiz('"ส่วนสูงของนักเรียนห้องนี้ 40 คน" เป็นข้อมูลหรือสารสนเทศ', ['ข้อมูล', 'สารสนเทศ', 'การตัดสินใจ'], 0, 'ยังเป็นตัวเลขดิบ 40 ค่า ถ้าสรุปเป็นค่าเฉลี่ยหรือแนวโน้มจึงจะเป็นสารสนเทศ');
    },
  },

  2: {
    idea: 'กระบวนการวิทยาการข้อมูล 5 ขั้นวนเป็นวงจร และลองใช้กับ "เวลาของฉัน" 24 ชั่วโมงที่ต้องรวมได้ 24 พอดี',
    build(L) {
      L.cam(0, 9, 13, 0, 0, 0); L.floor(30);
      const fl = L.flow(['1 ตั้งคำถาม', '2 เก็บข้อมูล', '3 สำรวจข้อมูล', '4 วิเคราะห์/แบบจำลอง', '5 สื่อสารผล'], { ring: 4.5, w: 2.4, h: 0.7, d: 1.2 });
      const acts = [['นอน', 7, C.violet], ['เรียน', 8, C.blue], ['มือถือ', 4, C.pink], ['เดินทาง', 1, C.orange], ['กิน', 1.5, C.green], ['การบ้าน', 1, C.amber], ['อื่น ๆ', 1.5, C.slate]];
      const ring = L.group({ y: 0.2 });
      const rSum = L.readout('รวมทั้งหมด'), rQ = L.readout('คำถามที่ได้');
      function draw() {
        L.clearGroup(ring); const tot = acts.reduce((s, a) => s + a[1], 0); let a0 = 0;
        acts.forEach(([n, h, c]) => {
          const arc = (h / Math.max(24, tot)) * Math.PI * 2; if (arc <= 0) return;
          const t = L.torus({ r: 1.6, t: 0.45, arc, color: c, rx: Math.PI / 2, parent: ring }); t.rotation.z = a0;
          const mid = a0 + arc / 2; ring.add(L.label(`${n} ${h}`, { x: Math.cos(mid) * 2.5, y: 0.3, z: Math.sin(mid) * 2.5, cls: 'tick' }));
          a0 += arc;
        });
        rSum(tot + ' ชม.', tot === 24 ? 'good' : 'bad');
        rQ(tot === 24 ? 'คนที่ใช้มือถือมาก นอนน้อยกว่าไหม?' : 'ผลรวมไม่เท่ากับ 24 ตรวจข้อมูลก่อน!', tot === 24 ? '' : 'bad');
      }
      acts.forEach((a, i) => L.slider(a[0], { min: 0, max: 12, step: 0.5, value: a[1], unit: 'ชม.' }, (v) => { a[1] = v; draw(); }));
      draw();
      let k = 0; L.buttons([['ไปขั้นถัดไปของวงจร', () => { fl.highlight(k % 5); fl.packet(k % 5, (k + 1) % 5, C.white); k++; }]]);
      L.steps([
        { t: 'วิทยาการข้อมูล = สถิติ + วิทยาการคอมพิวเตอร์ + ความรู้เฉพาะด้าน กระบวนการมี 5 ขั้นวนเป็นวงจร', f: () => fl.highlight(-1) },
        { t: 'ขั้นที่ 1 "ตั้งคำถาม" สำคัญที่สุด ถ้าคำถามไม่ดี ข้อมูลเยอะแค่ไหนก็ไม่ช่วย', f: () => fl.highlight(0) },
        { t: 'วงแหวนกลางคือข้อมูล "เวลาของฉัน" ลองเลื่อนแถบด้านขวาเป็นข้อมูลของตัวเองเมื่อวาน', f: () => fl.highlight(1) },
        { t: 'ขั้นสำรวจข้อมูล: ผลรวมต้องเท่ากับ 24 พอดี ถ้าได้ 26 แปลว่ามีอะไรนับซ้ำ นี่คือการตรวจข้อมูลครั้งแรก', f: () => fl.highlight(2) },
        { t: 'ขั้นวิเคราะห์และสื่อสาร: รวมข้อมูลของเพื่อนในกลุ่ม หาค่าเฉลี่ย แล้วเล่าข้อสรุปพร้อมตัวเลข', f: () => fl.highlight(4) },
      ]);
      L.quiz('ถ้าข้ามขั้น "สำรวจข้อมูล" ไปวิเคราะห์เลย อาจเกิดอะไรขึ้น', ['ได้ผลเร็วและถูกเสมอ', 'อาจเจอข้อมูลผิด/หาย แล้วสรุปผิด', 'ไม่มีผลอะไร'], 1, 'เหมือนทำอาหารโดยไม่ตรวจวัตถุดิบ ข้อมูลที่ผิดหรือขาดทำให้ข้อสรุปผิด');
    },
  },

  3: {
    idea: 'แนวคิดเชิงออกแบบ 5 ขั้นกับปัญหา "คิวโรงอาหาร" แล้วเปลี่ยนคำถามกว้าง ๆ ให้เป็นคำถามโครงงานที่วัดได้ด้วยการจับเวลาจริง',
    build(L) {
      L.cam(0, 8, 15, 0, 0.5, 0); L.floor(36);
      const fl = L.flow(['เข้าใจ', 'กำหนดปัญหา', 'สร้างแนวคิด', 'ต้นแบบ', 'ทดสอบ'], { gap: 3, z: -4, w: 2.2, h: 0.7 });
      const back = L.line([[5.9, 1.2, -4], [6.2, 2.4, -4], [-6.2, 2.4, -4], [-5.9, 1.2, -4]], C.amber, 0.7);
      L.label('วนกลับได้เสมอ', { x: 0, y: 2.7, z: -4, cls: 'tick' });
      const stalls = [['ก๋วยเตี๋ยว', 3.6, C.orange], ['ข้าวราดแกง', 2.0, C.teal], ['ส้มตำ', 1.2, C.pink]];
      const queues = stalls.map(([n, rate, c], i) => {
        const x = (i - 1) * 4.5; const st = L.box({ w: 2.2, h: 1.2, d: 1, color: c, x, y: 0.6, z: 1 }); L.label(n, { parent: st, y: 0.9, cls: 'tag' });
        return { x, rate, people: [], waits: [] };
      });
      const rW = queues.map((q, i) => L.readout('รอเฉลี่ย ' + stalls[i][0], '–'));
      async function simulate() {
        const g = L.gen; queues.forEach((q) => { q.people.forEach((p) => L.remove(p)); q.people = []; q.waits = []; });
        for (let t = 0; t < 14 && L.alive(g); t++) {
          queues.forEach((q, i) => {
            if (q.people.length < 9) { const p = L.cyl({ r: 0.22, h: 0.9, color: C.sky, x: q.x, y: 0.45, z: 2.2 + q.people.length * 0.6 }); q.people.push(p); }
            if (t % Math.round(q.rate) === 0 && q.people.length) { L.remove(q.people.shift()); q.people.forEach((p, k) => L.moveTo(p, q.x, 0.45, 2.2 + k * 0.6, 250)); }
            q.waits.push(q.people.length * q.rate);
            rW[i](r2(mean(q.waits)) + ' นาที', mean(q.waits) > 15 ? 'bad' : 'good');
          });
          await L.wait(420);
        }
      }
      L.buttons([['จับเวลาคิว 12.00–12.20 น.', simulate]]);
      L.steps([
        { t: 'ขั้น 1 เข้าใจ (Empathize): ไปยืนดูคิวจริงตอนพักเที่ยง สัมภาษณ์เพื่อนและแม่ค้า ถาม "ทำไม" ต่ออีก 2–3 ครั้ง', f: () => fl.highlight(0) },
        { t: 'ขั้น 2 กำหนดปัญหา: "นักเรียน ม.ปลาย ต้องการซื้ออาหารให้ทันใน 15 นาที เพราะต้องไปซ้อมกีฬาต่อ"', f: () => fl.highlight(1) },
        { t: 'ขั้น 3 How Might We: "เราจะลดเวลารอคิวช่วงพักเที่ยงได้อย่างไร" ระดมไอเดียโดยไม่ตัดสินกันก่อน', f: () => fl.highlight(2) },
        { t: 'คำถาม "ทำให้โรงอาหารดีขึ้น" วัดไม่ได้ เปลี่ยนเป็น "ร้านไหนรอคิวเฉลี่ยนานที่สุดช่วง 12.00–12.20 น." แล้วกดจับเวลา', f: () => fl.highlight(3) },
        { t: 'ตัวเลขที่ได้คือข้อมูลที่ตอบคำถามได้จริง ขั้นทดสอบอาจพาเรากลับไปขั้นแรกอีกรอบ (เส้นสีส้ม)', f: () => fl.highlight(4) },
      ]);
      L.quiz('ข้อใดเป็นคำถามโครงงานที่ดีที่สุด', ['ทำให้โรงเรียนดีขึ้น', 'นักเรียนชอบอะไร', 'นักเรียน ม.5 ใช้มือถือวันละกี่ชั่วโมง และสัมพันธ์กับชั่วโมงนอนไหม'], 2, 'คำถามที่ดีต้องชัด วัดได้ มีประโยชน์ และเก็บข้อมูลได้จริง');
    },
  },

  4: {
    idea: 'สายพานข้อมูลส่วนสูงที่ "สกปรก" มีทั้ง 165, "1.65 ม.", ช่องว่าง, แถวซ้ำ, 17 เปิดตัวกรองทีละอย่างแล้วดูค่าเฉลี่ยเปลี่ยน — Garbage in, garbage out',
    build(L) {
      L.cam(0, 8, 18, 0, 1, 0); L.floor(36);
      const raw = ['165', '1.65 ม.', '', '170', '170', ' 158 ', '17', '172', '160', '', '1.68 ม.', '163', '175', '163'];
      const ids = raw.map((v, i) => (i === 4 ? 3 : i === 13 ? 11 : i));
      const rules = { trim: false, unit: false, dup: false, blank: false, odd: false };
      const g = L.group();
      L.box({ w: 16, h: 0.15, d: 1.4, color: 0x2a3b48, y: 0.6 }); L.label('สายพานข้อมูลส่วนสูง (ซม.)', { x: -6, y: 2.4, cls: 'tag' });
      const rN = L.readout('จำนวนข้อมูลที่ใช้'), rM = L.readout('ค่าเฉลี่ย'), rL = L.readout('บันทึกการแก้ไข');
      function clean() {
        const out = [], seen = new Set(), log = [];
        raw.forEach((v, i) => {
          let s = rules.trim ? v.trim() : v, st = 'ok', val;
          if (s === '' || s.trim() === '') { if (rules.blank) { log.push('ตัดค่าว่าง'); st = 'drop'; } else st = 'bad'; }
          else if (/ม\./.test(s)) { if (rules.unit) { val = parseFloat(s) * 100; } else { val = parseFloat(s); st = 'bad'; } }
          else if (s !== s.trim()) { val = NaN; st = 'bad'; }
          else val = +s;
          if (st !== 'drop' && rules.dup && seen.has(ids[i])) { log.push('ลบแถวซ้ำ'); st = 'drop'; }
          seen.add(ids[i]);
          if (st !== 'drop' && rules.odd && val < 100) { log.push('ตัด 17 (ตรวจแล้วผิดปกติ)'); st = 'drop'; }
          out.push({ v, val, st });
        });
        L.clearGroup(g);
        out.forEach((o, i) => {
          const c = o.st === 'drop' ? 0x3a4650 : o.st === 'bad' || isNaN(o.val) || o.val < 100 ? C.red : C.green;
          const b = L.box({ w: 0.8, h: 0.5, d: 0.8, color: c, x: -7 + i * 1.08, y: o.st === 'drop' ? 0.3 : 0.95, z: o.st === 'drop' ? 1.6 : 0, parent: g, opacity: o.st === 'drop' ? 0.4 : 1 });
          L.label(o.v === '' ? '(ว่าง)' : `"${o.v}"`, { parent: b, y: 0.6, cls: 'tick' });
        });
        const used = out.filter((o) => o.st !== 'drop' && !isNaN(o.val) && o.v.trim() !== '');
        const vals = used.map((o) => (isNaN(o.val) ? 0 : o.val));
        rN(used.length + ' ค่า'); const m = vals.length ? mean(vals) : 0;
        rM(r2(m) + ' ซม.', m > 150 && m < 180 ? 'good' : 'bad');
        rL(log.length ? [...new Set(log)].join(' · ') : 'ยังไม่ได้แก้');
      }
      [['TRIM ตัดช่องว่างหน้า–หลัง', 'trim'], ['แปลงหน่วยเมตรเป็นเซนติเมตร (×100)', 'unit'], ['ลบรายการที่ซ้ำ', 'dup'], ['ตัดค่าว่าง', 'blank'], ['ตรวจค่าผิดปกติ (17 ซม.)', 'odd']]
        .forEach(([t, k]) => L.toggle(t, false, (v) => { rules[k] = v; clean(); }));
      L.steps([
        { t: 'กล่องสีแดงคือข้อมูลที่ยังใช้ไม่ได้ ค่าเฉลี่ยตอนนี้ผิดมาก เพราะ 1.65 กับ 17 ถูกนับรวมเป็นตัวเลขเล็ก ๆ' },
        { t: 'เปิดตัวกรองทีละข้อ ดูค่าเฉลี่ยค่อย ๆ เข้าใกล้ความจริง (ราว 165 ซม.)' },
        { t: '17 ไม่ควรลบทันที ต้องตรวจก่อนว่าพิมพ์ผิดจาก 170 หรือเปล่า ถ้าไม่แน่ใจให้ตัดออกและบันทึกเหตุผล' },
        { t: 'นักวิทยาการข้อมูลจริงใช้เวลากับการทำความสะอาดข้อมูลมากกว่าครึ่งของงาน เก็บไฟล์ "ข้อมูลดิบ" ไว้เสมอ แก้ในสำเนา "ข้อมูลสะอาด"' },
      ]);
      L.quiz('Garbage in, garbage out หมายความว่าอะไร', ['ข้อมูลขยะต้องลบทิ้งทุกครั้ง', 'ข้อมูลไม่ดีเข้าไป ผลลัพธ์ก็ไม่ดีออกมา', 'คอมพิวเตอร์ทิ้งข้อมูลเก่าเอง'], 1, 'ต่อให้วิเคราะห์เก่งแค่ไหน ถ้าข้อมูลสกปรก ข้อสรุปก็ผิด');
    },
  },

  5: {
    idea: 'สำรวจข้อมูลชั่วโมงนอนของนักเรียน 12 คน: หาค่าต่ำสุด สูงสุด ค่าผิดปกติ แล้วสร้างฮิสโทแกรม ลองเปลี่ยนความกว้างช่วงดู',
    build(L) {
      L.cam(0, 6, 14, 0, 2, 0); L.floor(36);
      const data = [6, 7, 7, 8, 6, 5, 7, 8, 9, 6, 7, 2];
      const ax = L.axes({ w: 12, h: 5, x: -6, xmin: 0, xmax: 10, ymin: 0, ymax: 8, xticks: [0, 2, 4, 6, 8, 10], yticks: [0, 2, 4, 6, 8], xlabel: 'ชั่วโมงนอน', ylabel: 'จำนวนคน' });
      const dots = data.map((v, i) => { const prev = data.slice(0, i).filter((x) => x === v).length; return L.sphere({ r: 0.2, color: v === 2 ? C.red : C.sky, x: ax.sx(v), y: 0.25, z: 1 + prev * 0.45 }); });
      L.label('ค่าผิดปกติ? (2 ชม.)', { x: ax.sx(2), y: 0.9, z: 1, cls: 'tag', color: C.red });
      const hg = L.group();
      const rN = L.readout('จำนวน (COUNT)', data.length), rMin = L.readout('MIN / MAX', `${Math.min(...data)} / ${Math.max(...data)}`), rU = L.readout('ค่าไม่ซ้ำ', new Set(data).size), rB = L.readout('ตารางความถี่');
      function hist(w) {
        L.clearGroup(hg); const rows = [];
        for (let a = 0; a < 10; a += w) {
          const n = data.filter((v) => v >= a && v < a + w).length; rows.push(`${a}–${a + w}: ${n}`);
          if (!n) continue; const x0 = ax.sx(a), x1 = ax.sx(a + w), h = ax.sy(n) - ax.y0;
          const b = L.box({ w: x1 - x0 - 0.04, h, d: 0.6, color: C.teal, x: (x0 + x1) / 2, y: h / 2, z: 0, parent: hg, opacity: 0.85 });
          L.label(String(n), { parent: b, y: h / 2 + 0.3, cls: 'tick' });
        }
        rB(rows.join(' · '));
      }
      L.slider('ความกว้างช่วง (bin)', { min: 1, max: 4, value: 2, unit: 'ชม.' }, hist);
      L.steps([
        { t: 'ลูกบอลแต่ละลูกคือนักเรียน 1 คน วางตามชั่วโมงนอน ก่อนวิเคราะห์ ต้องตอบคำถามนักสำรวจ: มีกี่แถว ขาดไหม ต่ำสุด–สูงสุดเท่าไร', f: () => L.flyTo(0, 9, 9, 0, 0, 1) },
        { t: 'ลูกสีแดง 2 ชม. ต่างจากคนอื่นมาก เป็น Outlier อาจพิมพ์ผิด หรืออาจเป็นเรื่องจริงที่น่าสนใจ ต้องตรวจก่อนตัดสินใจ' },
        { t: 'ฮิสโทแกรมแบ่งตัวเลขเป็นช่วง แท่งติดกัน ลองเลื่อนความกว้างช่วง 1–4 ชม. รูปร่างข้อมูลเปลี่ยนไปตามช่วง', f: () => L.flyTo(0, 6, 14, 0, 2, 0) },
        { t: 'ข้อสังเกตที่ดีต้องมีตัวเลข: "7 จาก 12 คน นอน 7–8 ชม." ไม่ใช่ "หลายคนนอนพอ" ใน Sheets ใช้ COUNT MIN MAX COUNTIF และตาราง Pivot' },
      ]);
      L.quiz('ข้อมูลชั่วโมงนอน (ตัวเลข) ควรใช้แผนภาพแบบใดเพื่อดูการกระจาย', ['แผนภูมิวงกลม', 'ฮิสโทแกรม', 'กราฟเส้น'], 1, 'ฮิสโทแกรมแบ่งข้อมูลตัวเลขเป็นช่วงและแสดงความถี่ของแต่ละช่วง');
    },
  },

  6: {
    idea: 'บริษัทที่ "เงินเดือนเฉลี่ย 43,500 บาท" แต่พนักงาน 9 ใน 10 ได้ 15,000 และกราฟการกระจายที่ปรับค่า r ได้ พร้อมกับดัก "ไอศกรีมทำให้จมน้ำ"',
    build(L) {
      L.cam(0, 7, 16, 0, 2, 0); L.floor(40);
      const g1 = L.group({ x: -5 }), g2 = L.group({ x: 5 });
      let owner = true;
      const S = 1 / 20000;
      const rMean = L.readout('ค่าเฉลี่ย'), rMed = L.readout('มัธยฐาน'), rR = L.readout('สหสัมพันธ์ r');
      const meanPlane = L.box({ w: 5.4, h: 0.04, d: 1.6, color: C.amber, opacity: 0.6, parent: g1 }); const mL = L.label('', { parent: meanPlane, x: 3.3, cls: 'tag', color: C.amber });
      const medPlane = L.box({ w: 5.4, h: 0.04, d: 1.6, color: C.green, opacity: 0.6, parent: g1 }); const dL = L.label('', { parent: medPlane, x: -3.4, cls: 'tag', color: C.green });
      const towers = [];
      function salary() {
        towers.forEach((t) => L.remove(t)); towers.length = 0;
        const sal = [...Array(9).fill(15000), ...(owner ? [300000] : [])];
        sal.forEach((v, i) => { const h = Math.min(v * S, 15), t = L.box({ w: 0.4, h, d: 0.4, color: i === 9 ? C.red : C.sky, x: -2.4 + i * 0.52, y: h / 2, parent: g1 }); towers.push(t); });
        const m = mean(sal), md = median(sal);
        meanPlane.position.y = m * S; medPlane.position.y = md * S; mL.set('ค่าเฉลี่ย ' + Math.round(m).toLocaleString()); dL.set('มัธยฐาน ' + md.toLocaleString());
        rMean(Math.round(m).toLocaleString() + ' บาท', owner ? 'bad' : 'good'); rMed(md.toLocaleString() + ' บาท', 'good');
      }
      L.toggle('รวมเงินเดือนเจ้าของ 300,000 บาท', true, (v) => { owner = v; salary(); });
      const pts = [], ax = L.axes({ w: 6, h: 5, x: 2, xmin: 0, xmax: 10, ymin: 0, ymax: 10, xticks: [0, 5, 10], yticks: [0, 5, 10], xlabel: 'ชั่วโมงเล่นเกม', ylabel: 'ชั่วโมงนอน' });
      ax.g.position.x = 0;
      const base = Array.from({ length: 40 }, (_, i) => { const rnd = seeded(11 + i); return [gauss(rnd), gauss(rnd)]; });
      const dots = base.map(() => L.sphere({ r: 0.12, color: C.pink }));
      let rho = -0.8, heat = false;
      function scatter() {
        const xs = [], ys = [];
        base.forEach(([a, b], i) => { const x = 5 + a * 1.6, y = 5 + (rho * a + Math.sqrt(1 - rho * rho) * b) * 1.6; xs.push(x); ys.push(y);
          dots[i].position.set(ax.sx(Math.max(0, Math.min(10, x))), ax.sy(Math.max(0, Math.min(10, y))), 0.1); L.color(dots[i], heat ? (a > 0 ? C.red : C.blue) : C.pink); });
        const mx = mean(xs), my = mean(ys); let sxy = 0, sxx = 0, syy = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; syy += (ys[i] - my) ** 2; });
        const r = sxy / Math.sqrt(sxx * syy); rR(r2(r) + (Math.abs(r) > 0.7 ? ' (แรง)' : Math.abs(r) > 0.3 ? ' (ปานกลาง)' : ' (อ่อน/แทบไม่มี)'));
      }
      L.slider('ปรับความสัมพันธ์ของข้อมูล', { min: -0.95, max: 0.95, step: 0.05, value: -0.8, fmt: (v) => v.toFixed(2) }, (v) => { rho = v; scatter(); });
      L.toggle('ระบายสีตาม "อากาศร้อน" (ตัวแปรแฝง: ไอศกรีม vs คนจมน้ำ)', false, (v) => { heat = v; scatter(); });
      L.steps([
        { t: 'ฝั่งซ้าย: พนักงาน 9 คนได้ 15,000 เจ้าของได้ 300,000 ค่าเฉลี่ย (แผ่นสีเหลือง) ลอยสูงเกินคนส่วนใหญ่ ส่วนมัธยฐาน (สีเขียว) อยู่ตรงคนส่วนใหญ่', f: () => L.flyTo(-5, 6, 11, -5, 2, 0) },
        { t: 'ปิดตัวเลือก "รวมเงินเดือนเจ้าของ" ค่าเฉลี่ยตกลงมาเท่ามัธยฐาน กฎ: มีค่าผิดปกติ ให้ใช้มัธยฐาน' },
        { t: 'ฝั่งขวา: แผนภาพการกระจาย แต่ละจุดคือ 1 คน เลื่อนแถบความสัมพันธ์ ค่า r ใกล้ −1 คือสัมพันธ์ทางลบแรง (เล่นเกมมาก นอนน้อย)', f: () => L.flyTo(4, 5, 11, 3, 2.5, 0) },
        { t: 'เปิด "อากาศร้อน" สมมติแกนเป็นยอดขายไอศกรีมกับคนจมน้ำ ทั้งสองเพิ่มพร้อมกันเพราะอากาศร้อน ไม่ใช่ไอศกรีมทำให้จมน้ำ — สหสัมพันธ์ไม่ใช่เหตุและผล' },
      ]);
      L.quiz('ข้อมูล 10, 12, 12, 15, 100 ควรรายงานค่ากลางด้วยอะไร', ['ค่าเฉลี่ย 29.8', 'มัธยฐาน 12', 'ค่าสูงสุด 100'], 1, 'มีค่าผิดปกติ (100) ดึงค่าเฉลี่ยขึ้น มัธยฐาน 12 จึงแทนข้อมูลส่วนใหญ่ได้ดีกว่า');
    },
  },

  7: {
    idea: 'ยอดวิวคลิปเพิ่มวันละเท่าไร? หาเส้นตรง y = a + bx ที่ผ่านใกล้จุดมากที่สุด ใช้ทำนาย วัดความคลาดเคลื่อน (MAE) และดูอันตรายของการทำนายนอกช่วง',
    build(L) {
      L.cam(0, 5, 17, 1, 3, 0); L.floor(40);
      const ax = L.axes({ w: 13, h: 6, x: -6.5, xmin: 0, xmax: 30, ymin: 0, ymax: 1200, xticks: [0, 5, 10, 15, 20, 25, 30], yticks: [0, 400, 800, 1200], xlabel: 'วันที่', ylabel: 'ยอดวิวสะสม' });
      let noise = 15, xp = 10;
      const days = [1, 2, 3, 4, 5, 6, 7], eps = days.map((d, i) => gauss(seeded(5 + i)));
      const dots = days.map(() => L.sphere({ r: 0.16, color: C.sky })), res = days.map(() => L.line([[0, 0, 0], [0, 0, 0]], C.red, 0.8));
      const fit = L.line([[0, 0, 0], [0, 0, 0]], C.amber), ext = L.line([[0, 0, 0], [0, 0, 0]], C.amber, 0.35);
      const pred = L.sphere({ r: 0.22, color: C.green, emissive: 0x114422 }); const pL = L.label('', { parent: pred, y: 0.5, cls: 'tag', color: C.green });
      const real = L.line([[0, 0, 0], [0, 0, 0]], C.white, 0.4); L.label('ของจริง: ยอดวิวเริ่มคงที่', { x: ax.sx(26), y: ax.sy(560), cls: 'tick' });
      const rEq = L.readout('สมการ'), rB = L.readout('ความหมายของ b'), rMae = L.readout('MAE'), rP = L.readout('ทำนาย');
      let a, b;
      function upd() {
        const ys = days.map((d, i) => 100 + 30 * d + eps[i] * noise);
        const mx = mean(days), my = mean(ys); let sxy = 0, sxx = 0; days.forEach((d, i) => { sxy += (d - mx) * (ys[i] - my); sxx += (d - mx) ** 2; });
        b = sxy / sxx; a = my - b * mx;
        let mae = 0; days.forEach((d, i) => { const yh = a + b * d; mae += Math.abs(ys[i] - yh); dots[i].position.set(ax.sx(d), ax.sy(ys[i]), 0); L.setLine(res[i], [[ax.sx(d), ax.sy(ys[i]), 0], [ax.sx(d), ax.sy(yh), 0]]); });
        mae /= days.length;
        L.setLine(fit, [[ax.sx(0), ax.sy(a), 0], [ax.sx(7), ax.sy(a + b * 7), 0]]);
        L.setLine(ext, [[ax.sx(7), ax.sy(a + b * 7), 0], [ax.sx(30), ax.sy(Math.min(1200, a + b * 30)), 0]]);
        const curve = []; for (let d = 0; d <= 30; d++) curve.push([ax.sx(d), ax.sy(Math.min(1200, 100 + 450 * (1 - Math.exp(-d / 6)) + 30 * Math.min(d, 7) * 0.2)), 0]);
        L.setLine(real, curve);
        const yp = a + b * xp; pred.position.set(ax.sx(xp), ax.sy(Math.min(1200, yp)), 0); pL.set(`วันที่ ${xp}: ${Math.round(yp)} วิว`);
        rEq(`y = ${Math.round(a)} + ${r2(b)}x`); rB(`วันละ ~${Math.round(b)} วิว`); rMae(r2(mae) + ' วิว', mae < 30 ? 'good' : 'warn');
        rP(xp > 7 ? (xp > 14 ? 'นอกช่วงข้อมูลมาก — ระวัง!' : 'นอกช่วงข้อมูล (1–7)') : 'ในช่วงข้อมูล', xp > 14 ? 'bad' : xp > 7 ? 'warn' : 'good');
      }
      L.slider('ความไม่แน่นอนของข้อมูล (noise)', { min: 0, max: 60, value: 15 }, (v) => { noise = v; upd(); });
      L.slider('วันที่อยากทำนาย (x)', { min: 1, max: 30, value: 10 }, (v) => { xp = v; upd(); });
      L.steps([
        { t: 'จุดสีฟ้าคือยอดวิวจริง 7 วันแรก เส้นสีเหลืองคือเส้นตรงที่ผ่านใกล้ทุกจุดที่สุด (Regression)' },
        { t: 'สมการ y = a + bx: b คือความชัน "วันละเพิ่มกี่วิว" a คือค่าของ y เมื่อ x = 0 ดูช่อง "ความหมายของ b"' },
        { t: 'เส้นสีแดงคือความคลาดเคลื่อนของแต่ละวัน MAE = ค่าเฉลี่ยของ |จริง − ทำนาย| ลองเพิ่ม noise แล้ว MAE เพิ่มตาม' },
        { t: 'เลื่อนวันที่ทำนายไป 30 เส้นตรงพุ่งต่อไปเรื่อย ๆ แต่ของจริง (เส้นขาว) ยอดวิวเริ่มคงที่ — การทำนายนอกช่วงข้อมูล (Extrapolation) อันตราย' },
        { t: 'ใน Google Sheets: แผนภูมิ Scatter → เส้นแนวโน้ม → แสดงสมการและ R² หรือใช้ =SLOPE() =INTERCEPT() =FORECAST()' },
      ]);
      L.quiz('สมการ คะแนน = 42 + 6.5 × ชั่วโมงอ่าน ถ้าอ่าน 4 ชั่วโมง ทำนายคะแนนเท่าไร', ['46.5', '68', '194'], 1, '42 + 6.5 × 4 = 42 + 26 = 68 คะแนน');
    },
  },

  8: {
    idea: 'K-NN จำแนกผลไม้ "ส้ม หรือ มะนาว" จากน้ำหนักและความเปรี้ยว เลื่อนผลไม้ใหม่ เปลี่ยนค่า K แล้วดูเพื่อนบ้านที่ใกล้ที่สุดโหวต',
    build(L) {
      L.cam(0, 13, 7, 0, 0, 0); L.floor(30);
      const toX = (w) => -5 + ((w - 50) / 200) * 10, toZ = (s) => 4 - (s / 10) * 8;
      L.line([[-5, 0.02, 4], [5, 0.02, 4]], 0xcfdbe4); L.line([[-5, 0.02, 4], [-5, 0.02, -4]], 0xcfdbe4);
      L.label('น้ำหนัก (กรัม) →', { x: 0, y: 0, z: 4.7, cls: 'axis' }); L.label('ความเปรี้ยว (1–10) →', { x: -6.2, y: 0, z: 0, cls: 'axis' });
      const rnd = seeded(21), train = [];
      for (let i = 0; i < 14; i++) train.push({ w: 150 + gauss(rnd) * 28, s: 3.2 + gauss(rnd) * 1.1, c: 'ส้ม' });
      for (let i = 0; i < 12; i++) train.push({ w: 85 + gauss(rnd) * 20, s: 7.5 + gauss(rnd) * 1, c: 'มะนาว' });
      train.forEach((p) => { p.m = L.sphere({ r: 0.2, color: p.c === 'ส้ม' ? C.orange : C.lime, x: toX(p.w), y: 0.2, z: toZ(p.s) }); });
      const q = L.sphere({ r: 0.3, color: C.white, emissive: 0x444444, y: 0.3 }); L.label('ผลไม้ใหม่', { parent: q, y: 0.6, cls: 'tag' });
      const ring = L.torus({ r: 1, t: 0.03, color: C.amber, rx: Math.PI / 2, y: 0.05 });
      const lines = L.group();
      let W = 120, Sr = 5, K = 3;
      const rD = L.readout('ระยะห่างใกล้สุด'), rV = L.readout('ผลโหวต'), rA = L.readout('ทำนายว่าเป็น');
      function upd() {
        q.position.set(toX(W), 0.3, toZ(Sr));
        const d = train.map((p) => ({ p, d: Math.hypot((p.w - W) / 20, p.s - Sr) })).sort((a, b) => a.d - b.d);
        const near = d.slice(0, K); L.clearGroup(lines);
        train.forEach((p) => p.m.scale.setScalar(1));
        near.forEach(({ p }) => { p.m.scale.setScalar(1.6); lines.add(L.line([q.position.clone(), p.m.position.clone()], C.amber, 0.8)); });
        const rad = q.position.distanceTo(near[K - 1].p.m.position); ring.scale.setScalar(rad); ring.position.set(q.position.x, 0.05, q.position.z);
        const o = near.filter((x) => x.p.c === 'ส้ม').length, l = K - o;
        rD(`√((Δน้ำหนัก/20)² + (Δเปรี้ยว)²) = ${r2(near[0].d)}`); rV(`ส้ม ${o} : มะนาว ${l}`); rA(o > l ? 'ส้ม' : o < l ? 'มะนาว' : 'เสมอ! เลือก K เลขคี่', o === l ? 'bad' : 'good');
        L.color(q, o > l ? C.orange : o < l ? C.lime : C.white);
      }
      L.slider('น้ำหนักผลไม้ใหม่', { min: 50, max: 250, value: 120, unit: 'กรัม' }, (v) => { W = v; upd(); });
      L.slider('ความเปรี้ยว', { min: 0, max: 10, step: 0.5, value: 5 }, (v) => { Sr = v; upd(); });
      L.slider('K (จำนวนเพื่อนบ้าน)', { min: 1, max: 9, value: 3 }, (v) => { K = v; upd(); });
      L.steps([
        { t: 'จุดส้มคือส้ม จุดเขียวคือมะนาว (ข้อมูลฝึกที่มีป้ายกำกับแล้ว) ลูกสีขาวคือผลไม้ใหม่ที่ยังไม่รู้ว่าเป็นอะไร' },
        { t: 'K-NN 4 ขั้น: วัดระยะไปทุกจุด → เรียงจากใกล้ไปไกล → เลือก K จุดที่ใกล้สุด (เส้นสีเหลือง) → โหวตเสียงข้างมาก' },
        { t: 'ระยะห่างแบบยุคลิด = √((x1−x2)² + (y1−y2)²) คือพีทาโกรัส เช่น (2,3) กับ (5,7) ห่าง √(9+16) = 5' },
        { t: 'ลองตั้ง K = 2 หรือ 4 บางตำแหน่งจะโหวตเสมอ จึงควรใช้ K เลขคี่ และลอง K = 9 ดูว่าวงขยายไปดึงอีกกลุ่มมาโหวตด้วย' },
        { t: 'ถ้าข้อมูลฝึกมีส้ม 18 มะนาว 2 โมเดลจะทายส้มเกือบตลอด อคติในข้อมูลแบบนี้อันตรายมากเมื่อใช้ AI จัดกลุ่ม "คน"' },
      ]);
      L.quiz('ระยะห่างระหว่างจุด (0, 0) กับ (6, 8) เท่าไร', ['10', '14', '48'], 0, '√(6² + 8²) = √(36 + 64) = √100 = 10');
    },
  },

  9: {
    idea: 'กราฟหลอกตา: ความต่าง 1% กลายเป็นดูต่างหลายเท่าเมื่อตัดแกน y และพายสามมิติทำให้ชิ้นหน้าดูใหญ่เกินจริง เปิด–ปิดกลแต่ละแบบแล้วจับผิด',
    build(L) {
      L.cam(0, 5, 15, 0, 2.5, 0); L.floor(40);
      const g = L.group({ x: -4 });
      const vA = 50, vB = 51;
      const bA = L.box({ w: 1.4, h: 1, d: 1, color: C.slate, x: -1, parent: g }), bB = L.box({ w: 1.4, h: 1, d: 1, color: C.teal, x: 1, parent: g });
      const lA = L.label('แบรนด์ A 50%', { parent: g, x: -1, cls: 'tag' }), lB = L.label('แบรนด์ B 51%', { parent: g, x: 1, cls: 'tag' });
      const base = L.label('', { parent: g, x: -2.6, y: 0, cls: 'tick' });
      const rS = L.readout('B ดูสูงกว่า A', ''), rC = L.readout('ความต่างจริง', '1 จุด (2%)');
      let cut = false;
      function bars() {
        const y0 = cut ? 49.5 : 0, k = 5 / (52 - y0);
        const hA = (vA - y0) * k, hB = (vB - y0) * k;
        bA.scale.y = hA; bA.position.y = hA / 2; bB.scale.y = hB; bB.position.y = hB / 2;
        lA.position.y = hA + 0.4; lB.position.y = hB + 0.4; base.set('แกน y เริ่มที่ ' + y0);
        rS(r2(hB / hA) + ' เท่า', cut ? 'bad' : 'good');
      }
      L.toggle('ตัดแกน y ให้เริ่มที่ 49.5', false, (v) => { cut = v; bars(); });
      const pie = L.group({ x: 5, y: 0.5 });
      const share = [40, 25, 20, 15], cols = [C.amber, C.blue, C.pink, C.green];
      let a0 = 0;
      share.forEach((s, i) => {
        const arc = (s / 100) * Math.PI * 2;
        const m = new L.THREE.Mesh(new L.THREE.CylinderGeometry(2.2, 2.2, 0.5, 48, 1, false, a0, arc), new L.THREE.MeshStandardMaterial({ color: cols[i] }));
        pie.add(m); const mid = a0 + arc / 2; pie.add(L.label(`${s}%`, { x: Math.sin(mid) * 1.5, y: 0.5, z: Math.cos(mid) * 1.5, cls: 'tag' })); a0 += arc;
      });
      L.toggle('มองพายแบบ 3 มิติเอียง (หลอกตา)', true, (v) => L.tween(pie.rotation, { x: v ? 0.25 : Math.PI / 2 - 0.0001 }, 600));
      pie.rotation.x = 0.25;
      L.steps([
        { t: 'ฝั่งซ้าย: ความนิยมชานมแบรนด์ A 50% B 51% ต่างกันแค่ 1 จุด ตอนแกน y เริ่มที่ 0 แท่งสูงพอ ๆ กัน', f: () => L.flyTo(-4, 4, 11, -4, 2.5, 0) },
        { t: 'เปิด "ตัดแกน y" แท่ง B ดูสูงกว่า A หลายเท่า ตัวเลขไม่ได้โกหก แต่ภาพโกหกสายตา กราฟแท่งควรเริ่มที่ 0' },
        { t: 'ฝั่งขวา: พาย 3 มิติที่เอียงทำให้ชิ้นด้านหน้าดูใหญ่กว่าความจริง ปิดตัวเลือก 3 มิติ จะเห็นสัดส่วนตรงตามจริง', f: () => L.flyTo(5, 6, 9, 5, 0.5, 0) },
        { t: 'เช็กลิสต์ภาพข้อมูลที่ดี 6 ข้อ: ชื่อกราฟบอกข้อค้นพบ · ชื่อแกนและหน่วย · แหล่งข้อมูล · สีน้อย เน้นสิ่งสำคัญ · แกนแท่งเริ่มที่ 0 · ไม่ใช้ 3D', f: () => L.flyTo(0, 5, 15, 0, 2.5, 0) },
      ]);
      L.quiz('ข้อมูลจำนวนนักท่องเที่ยวภูเรือรายเดือน ควรใช้แผนภาพใด', ['แผนภูมิวงกลม', 'กราฟเส้น', 'แผนภาพการกระจาย'], 1, 'ข้อมูลตามเวลาต้องการดูแนวโน้ม จึงใช้กราฟเส้น');
    },
  },

  10: {
    idea: 'บินผ่าน 4 เกาะของการเล่าเรื่องด้วยข้อมูล: บริบท → ปัญหา → ข้อค้นพบ → ข้อเสนอ ใช้ตัวอย่างโครงงาน "คิวโรงอาหาร"',
    build(L) {
      L.cam(0, 12, 18, 0, 0, 0); L.floor(50);
      const isl = [
        { n: 'บริบท', t: 'พักเที่ยงมีแค่ 50 นาที นักเรียนหลายคนต้องไปซ้อมกีฬาต่อ', x: -9, z: 3, c: C.sky },
        { n: 'ปัญหา', t: 'ร้านไหนรอคิวนานที่สุด ช่วง 12.00–12.20 น.', x: -3, z: -3, c: C.violet },
        { n: 'ข้อค้นพบ', t: 'ร้านก๋วยเตี๋ยวรอเฉลี่ย 14 นาที นานกว่าร้านอื่นเกือบ 2 เท่า (จับเวลา 40 คน)', x: 3, z: 3, c: C.amber },
        { n: 'ข้อเสนอ', t: 'เพิ่มจุดสั่งล่วงหน้า/คิวสั่งกลับ เสนอสภานักเรียนและฝ่ายโรงอาหาร', x: 9, z: -3, c: C.green },
      ];
      isl.forEach((s, i) => {
        L.cyl({ r: 2.2, rt: 2.2, rb: 1.6, h: 0.8, color: s.c, x: s.x, y: 0.4, z: s.z });
        L.label(`${i + 1}. ${s.n}`, { x: s.x, y: 1.3, z: s.z, cls: 'big', color: s.c });
        L.label(s.t, { x: s.x, y: 2.4, z: s.z, cls: 'wrap' });
      });
      const bars = L.bars([14, 7.5, 6], { x: 3, z: 3.4, y: 0.8, gap: 0.8, w: 0.5, d: 0.5, scale: 0.12, names: ['ก๋วยเตี๋ยว', 'ราดแกง', 'ส้มตำ'], colors: [C.red, C.teal, C.teal], fmt: (v) => v + ' น.' });
      for (let i = 0; i < 3; i++) L.line([[isl[i].x, 0.8, isl[i].z], [isl[i + 1].x, 0.8, isl[i + 1].z]], 0x9fb4c4, 0.7);
      const go = (i) => L.flyTo(isl[i].x, 5, isl[i].z + 7, isl[i].x, 1.5, isl[i].z);
      L.buttons(isl.map((s, i) => [s.n, () => go(i)]).concat([['ภาพรวม', () => L.flyTo(0, 12, 18, 0, 0, 0)]]));
      L.steps([
        { t: 'โครงงานวิทยาการข้อมูลจบด้วย "การเล่าเรื่อง" ที่ทำให้คนฟังเข้าใจและลงมือทำ มี 4 ส่วนเรียงเป็นเกาะ', f: () => L.flyTo(0, 12, 18, 0, 0, 0) },
        { t: 'บริบท: ทำไมเรื่องนี้สำคัญกับคนฟัง', f: () => go(0) },
        { t: 'ปัญหา: คำถามโครงงานที่ชัดและวัดได้', f: () => go(1) },
        { t: 'ข้อค้นพบ: 1–3 ข้อหลัก มีตัวเลขและภาพข้อมูล 1–2 ภาพ บอกข้อจำกัดด้วย เช่น เก็บแค่ 40 คน', f: () => go(2) },
        { t: 'ข้อเสนอ (Call to action): ใครควรทำอะไรต่อ ต้องระบุผู้ทำได้จริง', f: () => go(3) },
      ]);
      L.quiz('ข้อค้นพบหลักในการนำเสนอควรมีกี่ข้อ', ['1–3 ข้อ', '10 ข้อขึ้นไป', 'ไม่ต้องมี ใส่กราฟอย่างเดียว'], 0, 'ข้อค้นพบน้อยแต่ชัด คนฟังจำได้ ใส่ 10 ข้อคนฟังจำไม่ได้สักข้อ');
    },
  },
};
