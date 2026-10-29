// ม.2 วิทยาการคำนวณ
import { C, PALETTE } from '../engine.js';

export default {
  1: {
    idea: 'ข่าวปลอมหนึ่งข่าวแพร่ไปได้ไกลแค่ไหน ถ้าทุกคน "แชร์ก่อนคิด" ลองเปิดตัวกรอง "หยุด–คิด–ตรวจ–ค่อยแชร์" แล้วดูว่าการแพร่หยุดลงอย่างไร',
    build(L) {
      L.cam(0, 13, 15, 0, 0, 0); L.floor(30);
      const N = 48, nodes = [], links = [];
      let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
      for (let i = 0; i < N; i++) {
        const a = rnd() * Math.PI * 2, r = 1.5 + Math.sqrt(rnd()) * 8;
        nodes.push(L.sphere({ r: 0.32, color: C.slate, x: Math.cos(a) * r, y: 0.4, z: Math.sin(a) * r * 0.75 }));
      }
      nodes[0].position.set(0, 0.4, 0);
      nodes.forEach((n, i) => {
        const d = nodes.map((m, j) => [m.position.distanceTo(n.position), j]).sort((a, b) => a[0] - b[0]).slice(1, 4);
        d.forEach(([, j]) => { if (j > i) links.push([i, j, L.line([n.position, nodes[j].position], 0x35505f, 0.8)]); });
      });
      L.label('คนแรกที่ได้รับข่าว', { x: 0, y: 1.3, z: 0, cls: 'tag', color: C.red });
      const ro = L.readout('คนที่ได้รับข่าวปลอม'), rk = L.readout('รอบการแชร์');
      let check = false;
      L.toggle('ทุกคนใช้หลัก "หยุด–คิด–ตรวจ–ค่อยแชร์" (ตรวจแล้ว 70% ไม่แชร์ต่อ)', false, (v) => (check = v));
      const reached = new Set();
      const paint = () => nodes.forEach((n, i) => L.color(n, reached.has(i) ? C.red : C.slate));
      async function run() {
        const g = L.gen; reached.clear(); reached.add(0); paint(); let frontier = [0], round = 0;
        ro(1); rk(0);
        while (frontier.length && L.alive(g)) {
          round++; const next = [];
          for (const i of frontier) {
            if (check && i !== 0 && Math.random() < 0.7) continue;
            for (const [a, b] of links) {
              const j = a === i ? b : b === i ? a : -1;
              if (j >= 0 && !reached.has(j)) { reached.add(j); next.push(j); }
            }
          }
          if (!(await L.wait(550))) return;
          paint(); ro(reached.size + ' / ' + N, reached.size > N / 2 ? 'bad' : 'good'); rk(round);
          frontier = next;
        }
      }
      L.buttons([['ปล่อยข่าว "ด่วน! น้ำมะนาวโซดาฆ่าไวรัส แชร์ก่อนลบ"', run]]);
      L.steps([
        { t: 'ทุกจุดคือคน เส้นคือเพื่อนในไลน์/เฟซบุ๊ก กดปุ่ม "ปล่อยข่าว" แล้วนับว่ากี่รอบข่าวไปถึงคนเกินครึ่ง', f: () => L.flyTo(0, 13, 15, 0, 0, 0) },
        { t: 'สังเกตลักษณะข่าวปลอม 6 ข้อ: พาดหัวเร้าอารมณ์ ไม่มีแหล่งที่มา ไม่มีวันที่ เร่งให้แชร์ สะกดผิด เกินจริง' },
        { t: 'เปิดตัวเลือก "หยุด–คิด–ตรวจ–ค่อยแชร์" แล้วปล่อยข่าวอีกครั้ง ข่าวไปได้ไกลน้อยลงเพราะแต่ละคนช่วยหยุดมันไว้', f: () => L.flyTo(0, 9, 11, 0, 0, 0) },
        { t: 'PAPA: Privacy ความเป็นส่วนตัว · Accuracy ความถูกต้อง · Property ความเป็นเจ้าของ · Access การเข้าถึง การแชร์ข่าวปลอมขัดกับ Accuracy' },
      ]);
      L.quiz('ได้รับข่าว "ด่วน! แชร์ก่อนลบ" จากกลุ่มไลน์ครอบครัว ควรทำอะไรก่อน', ['แชร์ต่อทันทีเพราะหวังดี', 'หยุด ตรวจแหล่งที่มาและค้นข้ามแหล่งก่อน', 'ลบข้อความทิ้งโดยไม่บอกใคร'], 1, 'คำว่า "ด่วน" และ "แชร์ก่อนลบ" คือสัญญาณเร่งให้แชร์ ต้องตรวจก่อนเสมอ ถ้าเป็นข่าวปลอมค่อยบอกคนในกลุ่มอย่างสุภาพ');
    },
  },

  2: {
    idea: 'หุ่นยนต์วาดแบบแปลนบนตาราง 10×10 ทำตาม "อัลกอริทึม" ทุกคำสั่งตรงตัว เปรียบเทียบโปรแกรมแบบยาวกับแบบใช้ "ทำซ้ำ"',
    build(L) {
      L.cam(0, 13, 10, 0, 0, 0);
      const S = 10, cells = [];
      for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) cells.push(L.box({ w: 0.95, h: 0.1, d: 0.95, color: 0x1d2f3c, x: c - 4.5, y: 0, z: r - 4.5, edgeOpacity: 0.1 }));
      const bot = L.group({ y: 0.5 }); L.cone({ r: 0.32, h: 0.7, color: C.amber, rx: -Math.PI / 2, parent: bot });
      const progs = {
        'สี่เหลี่ยม (แบบยาว)': ['ระบาย', 'เดิน 3', 'ขวา', 'เดิน 3', 'ขวา', 'เดิน 3', 'ขวา', 'เดิน 3', 'ขวา'],
        'สี่เหลี่ยม (ใช้ทำซ้ำ)': ['ระบาย', 'ทำซ้ำ 4 { เดิน 3, ขวา }'],
        'ตัว L': ['ระบาย', 'เดิน 4', 'ซ้าย', 'เดิน 2'],
        'บันได': ['ระบาย', 'ทำซ้ำ 3 { เดิน 1, ขวา, เดิน 1, ซ้าย }'],
      };
      const names = Object.keys(progs);
      const code = L.label('', { x: -7.6, y: 0.5, z: -3, cls: 'code' });
      const rCount = L.readout('จำนวนบรรทัดคำสั่ง'), rStep = L.readout('คำสั่งที่ทำจริง');
      let prog = progs[names[0]];
      const expand = (p) => p.flatMap((c) => { const m = /ทำซ้ำ (\d+) \{ (.+) \}/.exec(c); return m ? Array(+m[1]).fill(0).flatMap(() => m[2].split(', ')) : [c]; });
      let st;
      function home() {
        st = { r: 7, c: 2, dir: 0, pen: false }; cells.forEach((m) => L.color(m, 0x1d2f3c));
        bot.position.set(st.c - 4.5, 0.5, st.r - 4.5); bot.rotation.set(0, 0, 0);
      }
      const D = [[-1, 0], [0, 1], [1, 0], [0, -1]];
      const paint = () => { if (st.pen) L.color(cells[st.r * S + st.c], C.teal); };
      async function run() {
        home(); const g = L.gen; const list = expand(prog); let k = 0;
        for (const cmd of list) {
          if (!L.alive(g)) return; k++; rStep(k);
          if (cmd === 'ระบาย') { st.pen = true; paint(); }
          else if (cmd === 'ขวา' || cmd === 'ซ้าย') { st.dir = (st.dir + (cmd === 'ขวา' ? 1 : 3)) % 4; await L.tween(bot.rotation, { y: -st.dir * Math.PI / 2 }, 250); }
          else { const n = +cmd.split(' ')[1]; for (let i = 0; i < n; i++) { st.r = Math.min(S - 1, Math.max(0, st.r + D[st.dir][0])); st.c = Math.min(S - 1, Math.max(0, st.c + D[st.dir][1])); await L.moveTo(bot, st.c - 4.5, 0.5, st.r - 4.5, 220); paint(); } }
          await L.wait(80);
        }
      }
      function show() { code.set(prog.map((c, i) => `${i + 1}  ${c}`).join('\n')); rCount(prog.length); rStep(0); home(); }
      L.select('เลือกโปรแกรม', names, (i) => { prog = progs[names[i]]; show(); });
      L.buttons([['สั่งหุ่นยนต์ทำงาน', run], ['เริ่มใหม่', show]]);
      L.steps([
        { t: 'หุ่นยนต์เริ่มที่มุมล่างซ้าย หันขึ้นด้านบน มันทำตาม "ทุกคำ" ที่เราสั่งเป๊ะ ๆ ไม่เดาใจเรา เหมือนเกมหุ่นยนต์ทำมาม่า' },
        { t: 'Decomposition: งาน "วาดสี่เหลี่ยม" แบ่งย่อยได้เป็น ด้านที่ 1–4 ด้านละ "เดิน 3 แล้วเลี้ยวขวา"' },
        { t: 'Pattern: สังเกตว่า "เดิน 3, ขวา" ซ้ำ 4 ครั้ง ลองเลือกโปรแกรม "ใช้ทำซ้ำ" แล้วเทียบจำนวนบรรทัด 9 บรรทัด vs 2 บรรทัด' },
        { t: 'Abstraction: เราไม่ต้องบอกสีของหุ่นยนต์หรือขนาดห้อง บอกแค่สิ่งที่จำเป็น คือทิศและจำนวนช่อง' },
        { t: 'Algorithm: ขั้นตอนที่ชัดเจน ใครทำตามก็ได้รูปเหมือนกัน ลองเลือก "บันได" แล้วทายก่อนกดว่าจะได้รูปอะไร' },
      ]);
      L.quiz('โปรแกรม "ทำซ้ำ 4 { เดิน 3, ขวา }" ได้รูปเดียวกับแบบยาว 8 คำสั่งหรือไม่', ['ได้รูปเดียวกัน แต่สั้นกว่า', 'ได้รูปต่างกัน', 'ทำซ้ำใช้กับหุ่นยนต์ไม่ได้'], 0, 'ทำซ้ำไม่ได้เปลี่ยนผลลัพธ์ แค่ทำให้โปรแกรมสั้น อ่านง่าย และแก้ที่เดียว (หลัก Pattern Recognition)');
    },
  },

  3: {
    idea: 'Bubble Sort แบบเข้าแถวตามความสูง: เทียบคนที่ยืนติดกันทีละคู่ ถ้าคนซ้ายสูงกว่าให้สลับ ทำซ้ำจนไม่มีการสลับ',
    build(L) {
      L.cam(0, 6, 13, 0, 2, 0); L.floor(30);
      let n = 8, b, arr, i, j, cmp, sw, swappedInPass, done;
      const rC = L.readout('จำนวนการเปรียบเทียบ'), rS = L.readout('จำนวนการสลับ'), rP = L.readout('รอบที่'), rMax = L.readout('เทียบมากสุด n(n−1)/2');
      const g = L.group();
      function setup() {
        L.clearGroup(g); arr = Array.from({ length: n }, () => 1.2 + Math.round(Math.random() * 40) / 10);
        b = L.bars(arr, { gap: n > 12 ? 0.75 : 1.1, w: n > 12 ? 0.55 : 0.8, fmt: (v) => Math.round(v * 30 + 100) + '', color: C.sky });
        g.add(b.g); i = 0; j = 0; cmp = 0; sw = 0; swappedInPass = false; done = false;
        rC(0); rS(0); rP(1); rMax(n * (n - 1) / 2);
      }
      async function step() {
        if (done) return false;
        const it = b.items; b.paint((k) => (k >= n - i ? C.green : C.sky));
        L.color(it[j], C.amber); L.color(it[j + 1], C.amber); cmp++; rC(cmp);
        await L.wait(220);
        if (it[j].val > it[j + 1].val) { await b.swap(j, j + 1, 400); sw++; rS(sw); swappedInPass = true; }
        j++;
        if (j >= n - 1 - i) { i++; j = 0; if (!swappedInPass || i >= n - 1) { done = true; b.paint(() => C.green); return false; } swappedInPass = false; rP(i + 1); }
        b.paint((k) => (k >= n - i ? C.green : C.sky));
        return true;
      }
      let busy = false;
      L.buttons([['เทียบ 1 คู่', async () => { if (busy) return; busy = true; await step(); busy = false; }],
        ['เรียงอัตโนมัติ', async () => { if (busy) return; busy = true; const gg = L.gen; while (L.alive(gg) && (await step())); busy = false; }],
        ['สุ่มแถวใหม่', () => { if (!busy) setup(); }]]);
      L.slider('จำนวนคน', { min: 5, max: 20, value: 8 }, (v) => { if (!busy && v !== n) { n = v; setup(); } });
      setup();
      L.steps([
        { t: 'แท่งแต่ละแท่งคือนักเรียน ตัวเลขคือส่วนสูง (ซม.) คู่ที่กำลังเทียบเป็นสีเหลือง' },
        { t: 'กด "เทียบ 1 คู่" ไปเรื่อย ๆ จบรอบแรกแล้ว คนที่สูงที่สุด "ลอย" ไปอยู่ท้ายแถว (สีเขียว) เหมือนฟองอากาศ จึงเรียกว่า Bubble Sort' },
        { t: 'รอบต่อไปไม่ต้องเทียบคนที่เป็นสีเขียวแล้ว จำนวนการเปรียบเทียบในแต่ละรอบจึงลดลง 7, 6, 5, …' },
        { t: 'ลองเลื่อนจำนวนคนเป็น 10 และ 20 แล้วกด "เรียงอัตโนมัติ" ดูช่อง "เทียบมากสุด" 45 → 190 คนเพิ่ม 2 เท่า แต่งานเพิ่มเกือบ 4 เท่า' },
      ]);
      L.quiz('เรียงคน 6 คนด้วย Bubble Sort รอบแรกต้องเปรียบเทียบกี่ครั้ง', ['6 ครั้ง', '5 ครั้ง', '15 ครั้ง'], 1, 'คน 6 คนมีคู่ที่ยืนติดกัน 5 คู่ รอบแรกจึงเทียบ 5 ครั้ง (รวมทุกรอบมากสุด 5+4+3+2+1 = 15)');
    },
  },

  4: {
    idea: 'My Blocks คือ "เครื่องจักรฟังก์ชัน" ใส่ค่าเข้า → ทำงานตามสูตรที่ตั้งชื่อไว้ → ได้ค่าออก เรียกใช้ซ้ำกี่ครั้งก็ได้ แก้สูตรที่เดียว',
    build(L) {
      L.cam(0, 4, 11, 0, 1.5, 0); L.floor(24);
      const machine = L.box({ w: 3.2, h: 2.2, d: 2, color: C.violet, y: 1.6 });
      const mlbl = L.label('', { parent: machine, y: 1.6, cls: 'big' });
      L.cone({ r: 0.7, h: 0.9, color: C.slate, x: -2.1, y: 1.6, rz: -Math.PI / 2 });
      L.cyl({ r: 0.35, h: 1, color: C.slate, x: 2.1, y: 1.6, rz: Math.PI / 2 });
      L.label('input', { x: -3.6, y: 2.6, cls: 'tick' }); L.label('output', { x: 3.6, y: 2.6, cls: 'tick' });
      const fns = [
        { name: 'C to F (c)', f: (v) => v * 9 / 5 + 32, unit: ['°C', '°F'], code: 'define C to F (c)\n  set F to (c × 9 ÷ 5) + 32\n  say F', min: -10, max: 100, val: 37 },
        { name: 'กม. to ไมล์ (k)', f: (v) => v * 0.621371, unit: ['กม.', 'ไมล์'], code: 'define กม. to ไมล์ (k)\n  set ไมล์ to k × 0.621\n  say ไมล์', min: 0, max: 100, val: 42 },
        { name: 'คำนวณ BMI (หนัก)', f: (v) => v / (1.6 * 1.6), unit: ['กก.', 'BMI (สูง 1.60 ม.)'], code: 'define คำนวณ BMI (หนัก)\n  set BMI to หนัก ÷ (สูง × สูง)\n  say BMI', min: 30, max: 90, val: 50 },
      ];
      let F = fns[0], x = F.val;
      const code = L.label('', { x: 0, y: 4.2, cls: 'code' });
      const rIn = L.readout('ค่าที่ส่งเข้า'), rOut = L.readout('ค่าที่ได้ออกมา'), rCall = L.readout('เรียกใช้บล็อกแล้ว');
      let calls = 0, sl;
      const fmt = (v) => (Math.round(v * 100) / 100).toString();
      function show() { mlbl.set(F.name); code.set(F.code); rIn(fmt(x) + ' ' + F.unit[0]); }
      L.select('เลือกบล็อก', fns.map((f) => f.name), (i) => { F = fns[i]; x = F.val; if (sl) { sl.el.min = F.min; sl.el.max = F.max; sl.set(F.val); } show(); rOut('–'); });
      sl = L.slider('ค่าที่จะส่งเข้า', { min: -10, max: 100, value: 37 }, (v) => { x = v; show(); });
      async function call() {
        const g = L.gen; const ball = L.sphere({ r: 0.35, color: C.amber, x: -4.5, y: 1.6 });
        const t = L.label(fmt(x), { parent: ball, y: 0.7, cls: 'tag' });
        await L.moveTo(ball, -1, 1.6, 0, 600); if (!L.alive(g)) return;
        machine.material.emissive.set(0x332255); await L.wait(350); machine.material.emissive.set(0);
        const y = F.f(x); t.set(fmt(y)); L.color(ball, C.green);
        await L.moveTo(ball, 4.6, 1.6, 0, 600); calls++; rCall(calls + ' ครั้ง'); rOut(fmt(y) + ' ' + F.unit[1], 'good');
        await L.wait(700); L.remove(ball);
      }
      L.buttons([['เรียกใช้บล็อก', call]]);
      show();
      L.steps([
        { t: 'ฟังก์ชันเหมือน "สูตรกะเพรา" ของแม่ครัวร้านตามสั่ง ตั้งชื่อไว้ครั้งเดียว ลูกค้าสั่งเมื่อไรก็เรียกใช้' },
        { t: 'กด "เรียกใช้บล็อก" ลูกบอลคือค่าที่ส่งเข้า (input) เข้าไปในเครื่อง ออกมาเป็นผลลัพธ์ (output)' },
        { t: 'ลองเปลี่ยนค่าแล้วเรียกใช้ซ้ำหลายครั้ง สูตรข้างในไม่ต้องเขียนใหม่เลย นี่คือ "ลดโค้ดซ้ำ"' },
        { t: 'ถ้าวันหนึ่งสูตรผิด แก้ที่ define ที่เดียว ทุกจุดที่เรียกใช้ถูกหมด และชื่อบล็อกยังบอกหน้าที่ทำให้อ่านง่าย' },
      ]);
      L.quiz('37 °C เมื่อเข้าบล็อก C to F ได้กี่ °F', ['69.6', '98.6', '67'], 1, '37 × 9 ÷ 5 + 32 = 66.6 + 32 = 98.6 °F');
    },
  },

  5: {
    idea: 'ประตูตรรกะ AND OR NOT แบบจับต้องได้ กดสวิตช์ A B แล้วดูว่าไฟติดเมื่อไร พร้อมระบบตรวจสิทธิ์รับทุนที่มี 3 เงื่อนไข',
    build(L) {
      L.cam(0, 9, 15, 0, 1, 0); L.floor(26);
      const mk = (x, z, t, c) => { const b = L.box({ w: 1.6, h: 1, d: 1.2, color: c, x, y: 0.5, z }); L.label(t, { parent: b, y: 0.9, cls: 'tag' }); return b; };
      const lamp = (x, z) => { const s = L.sphere({ r: 0.45, color: 0x333d44, x, y: 1.2, z }); L.cyl({ r: 0.12, h: 0.7, color: C.slate, x, y: 0.35, z }); return s; };
      const sw = (x, z, t) => { const b = L.box({ w: 0.9, h: 0.4, d: 0.9, color: C.slate, x, y: 0.2, z }); b.lbl = L.label(t, { parent: b, y: 0.6, cls: 'tag' }); return b; };
      let A = true, B = false;
      const sA = sw(-6, -2, 'A'), sB = sw(-6, 0.5, 'B');
      const gAnd = mk(-1.5, -2.6, 'AND', C.blue), gOr = mk(-1.5, -0.2, 'OR', C.violet), gNot = mk(-1.5, 2.2, 'NOT A', C.pink);
      const lAnd = lamp(2, -2.6), lOr = lamp(2, -0.2), lNot = lamp(2, 2.2);
      [[-6, -2, gAnd], [-6, 0.5, gAnd], [-6, -2, gOr], [-6, 0.5, gOr], [-6, -2, gNot]].forEach(([x, z, g]) => L.line([[x + 0.5, 0.3, z], [g.position.x - 0.8, 0.5, g.position.z]], 0x6c8293));
      [[gAnd, lAnd], [gOr, lOr], [gNot, lNot]].forEach(([g, l]) => L.line([[g.position.x + 0.8, 0.5, g.position.z], [l.position.x - 0.4, 0.5, l.position.z]], 0x6c8293));
      const T = (v) => (v ? 'จริง' : 'เท็จ');
      const rA = L.readout('A AND B'), rO = L.readout('A OR B'), rN = L.readout('NOT A');
      function upd() {
        sA.lbl.set('A = ' + T(A)); sB.lbl.set('B = ' + T(B)); L.color(sA, A ? C.green : C.slate); L.color(sB, B ? C.green : C.slate);
        [[lAnd, A && B, rA], [lOr, A || B, rO], [lNot, !A, rN]].forEach(([l, v, r]) => { L.color(l, v ? C.amber : 0x333d44); l.material.emissive.set(v ? 0x775500 : 0); r(T(v), v ? 'good' : 'bad'); });
      }
      L.onClick(sA, () => { A = !A; upd(); }); L.onClick(sB, () => { B = !B; upd(); });
      L.buttons([['สลับ A', () => { A = !A; upd(); }], ['สลับ B', () => { B = !B; upd(); }]]);
      // ระบบทุน
      L.note('<b>ระบบตรวจสิทธิ์รับทุน</b> (เกรด ≥ 3.00) AND (รายได้ < 100,000) AND NOT (ถูกตัดคะแนน)');
      const scholar = L.label('', { x: 4.5, y: 3, z: -3, cls: 'big' });
      let gr = 3.5, inc = 80000, cut = false;
      const updS = () => { const ok = gr >= 3 && inc < 100000 && !cut; scholar.set(`เกรด ${gr.toFixed(2)} · รายได้ ${inc.toLocaleString()}<br>${ok ? 'ได้ทุน' : 'ไม่ได้ทุน'}`); scholar.element.style.setProperty('--lc', ok ? '#4cc38a' : '#ef5b5b'); };
      L.slider('เกรดเฉลี่ย', { min: 1, max: 4, step: 0.05, value: 3.5, fmt: (v) => v.toFixed(2) }, (v) => { gr = v; updS(); });
      L.slider('รายได้ครอบครัว/ปี', { min: 20000, max: 300000, step: 10000, value: 80000, fmt: (v) => v.toLocaleString() + ' บาท' }, (v) => { inc = v; updS(); });
      L.toggle('ถูกตัดคะแนนความประพฤติ', false, (v) => { cut = v; updS(); });
      upd();
      L.steps([
        { t: 'คลิกสวิตช์ A หรือ B บนพื้น (หรือปุ่มด้านขวา) ไฟแต่ละดวงบอกผลของตัวดำเนินการ' },
        { t: 'AND "ใจแคบ" ต้องจริงทั้งคู่ไฟถึงติด เหมือนเข้าห้องสอบต้องมีบัตรนักเรียน และ แต่งกายถูกระเบียบ' },
        { t: 'OR "ใจกว้าง" จริงข้อเดียวก็พอ เหมือนจ่ายค่าขนมด้วยเงินสด หรือ สแกนจ่าย' },
        { t: 'NOT "ชอบเถียง" กลับค่าเสมอ จริงเป็นเท็จ เท็จเป็นจริง' },
        { t: 'ลองระบบทุน: ทดสอบให้ครบ 4 แบบ จริง-จริง จริง-เท็จ เท็จ-จริง เท็จ-เท็จ จะรู้ว่าโปรแกรมไม่ให้ทุนผิดคน' },
      ]);
      L.quiz('ส่วนลด "ซื้อครบ 300 บาท OR เป็นสมาชิก" ซื้อ 250 บาทแต่เป็นสมาชิก ได้ส่วนลดไหม', ['ได้', 'ไม่ได้', 'ต้องซื้อครบ 300 ก่อน'], 0, 'เท็จ OR จริง = จริง เพราะ OR ต้องการเงื่อนไขที่เป็นจริงเพียงข้อเดียว');
    },
  },

  6: {
    idea: 'บล็อก "วาดรูป (n) (size)" ฟังก์ชันเดียววาดได้ทุกรูปหลายเหลี่ยม เพราะมีพารามิเตอร์ มุมหมุนแต่ละครั้ง = 360 ÷ n',
    build(L) {
      L.cam(0, 14, 3, 0, 0, 0); L.floor(30);
      let n = 5, size = 4, petals = 1;
      const g = L.group();
      const turtle = L.group({ y: 0.4 }); L.cone({ r: 0.3, h: 0.7, color: C.amber, rx: -Math.PI / 2, parent: turtle });
      const rT = L.readout('มุมหมุนแต่ละครั้ง'), rS = L.readout('มุมรวมครบรอบ'), rC = L.readout('คำสั่งที่เรียก');
      const code = L.label('', { x: -9, y: 0.5, z: -4, cls: 'code' });
      async function draw() {
        L.clearGroup(g); const gen = L.gen; turtle.rotation.y = -Math.PI / 2;
        let x = -size / 2, z = size * 0.8, h = 0;
        for (let p = 0; p < petals; p++) {
          for (let i = 0; i < n; i++) {
            const nx = x + Math.cos(h) * size, nz = z - Math.sin(h) * size;
            const l = L.line([[x, 0.08, z], [x, 0.08, z]], PALETTE[p % PALETTE.length]); g.add(l);
            const sx = x, sz = z;
            await L.anim(petals > 1 ? 60 : 260, (k) => { L.setLine(l, [[sx, 0.08, sz], [sx + (nx - sx) * k, 0.08, sz + (nz - sz) * k]]); turtle.position.set(sx + (nx - sx) * k, 0.4, sz + (nz - sz) * k); });
            if (!L.alive(gen)) return;
            x = nx; z = nz; h += (2 * Math.PI) / n; turtle.rotation.y = h - Math.PI / 2;
          }
          h += (2 * Math.PI) / petals;
        }
      }
      function info() {
        rT((360 / n).toFixed(1) + '°'); rS('360°'); rC(petals > 1 ? `ดอกไม้ (${petals}) → วาดรูป ${petals} ครั้ง` : `วาดรูป (${n}) (${size * 25})`);
        code.set(`define วาดรูป (n) (size)\n  pen down\n  repeat (n)\n    move (size) steps\n    turn (360 / n) degrees\n  pen up\n\nเรียกใช้: วาดรูป (${n}) (${size * 25})` + (petals > 1 ? `\n\ndefine ดอกไม้ (กลีบ)\n  repeat (กลีบ)\n    วาดรูป (${n}) (${size * 25})\n    turn (360 / กลีบ)` : ''));
      }
      L.slider('n = จำนวนเหลี่ยม', { min: 3, max: 12, value: 5 }, (v) => { n = v; info(); });
      L.slider('size = ความยาวด้าน', { min: 1, max: 6, step: 0.5, value: 4, fmt: (v) => v * 25 + ' ก้าว' }, (v) => { size = v; info(); });
      L.slider('จำนวนกลีบ (ซ้อนฟังก์ชัน)', { min: 1, max: 12, value: 1 }, (v) => { petals = v; info(); });
      L.buttons([['วาด', draw]]);
      info(); draw();
      L.steps([
        { t: 'พารามิเตอร์เหมือน "ช่องกรอกในฟอร์ม" สั่งชานม สูตรชงเดิม แต่ผลต่างกันตามที่กรอก n คือช่องจำนวนเหลี่ยม size คือช่องความยาว' },
        { t: 'เดินรอบรูปครบหนึ่งรอบ ต้องหมุนรวม 360° เสมอ ห้าเหลี่ยมหมุน 5 ครั้ง จึงหมุนครั้งละ 360 ÷ 5 = 72°' },
        { t: 'ลองตั้ง n = 12 แล้วกดวาด ได้รูปที่เกือบเป็นวงกลม ค่า 12 ที่ใส่ตอนเรียกใช้เรียกว่า "อาร์กิวเมนต์"' },
        { t: 'เลื่อนจำนวนกลีบเป็น 8 ฟังก์ชัน "ดอกไม้" เรียกใช้ "วาดรูป" ซ้ำแล้วหมุนนิดหนึ่ง ได้ลวดลายสวย ๆ นี่คือการซ้อนฟังก์ชัน' },
      ]);
      L.quiz('แปดเหลี่ยมต้องหมุนครั้งละกี่องศา', ['45°', '60°', '135°'], 0, '360 ÷ 8 = 45° (มุมที่หมุนไม่ใช่มุมภายใน)');
    },
  },

  7: {
    idea: 'ค่าแท็กซี่แบบขั้นบันได กิโลแรก 35 บาท กม. 1–10 กม.ละ 6.50 เกิน 10 กม. กม.ละ 7 เลื่อนระยะทางแล้วดูว่าแต่ละช่วงคิดเงินอย่างไร',
    build(L) {
      L.cam(0, 5, 19, 0, 3, 0); L.floor(36);
      const ax = L.axes({ w: 14, h: 6, x: -7, xmin: 0, xmax: 20, ymin: 0, ymax: 180, xticks: [0, 1, 5, 10, 15, 20], yticks: [0, 50, 100, 150], xlabel: 'ระยะทาง (กม.)', ylabel: 'ค่าโดยสาร (บาท)' });
      const fare = (d) => (d <= 0 ? 0 : 35 + Math.max(0, Math.min(d, 10) - 1) * 6.5 + Math.max(0, d - 10) * 7);
      const pts = []; for (let d = 0; d <= 20; d += 0.25) pts.push([ax.sx(d), ax.sy(fare(d)), 0]);
      L.line(pts, C.amber);
      const segs = [L.box({ w: 0.6, h: 1, d: 0.6, color: C.teal }), L.box({ w: 0.6, h: 1, d: 0.6, color: C.blue }), L.box({ w: 0.6, h: 1, d: 0.6, color: C.violet })];
      const tags = ['ช่วง 1: กม.แรก', 'ช่วง 2: 6.50 บาท/กม.', 'ช่วง 3: 7 บาท/กม.'].map((t, i) => L.label(t, { cls: 'tag side', color: [C.teal, C.blue, C.violet][i] }));
      const car = L.box({ w: 0.7, h: 0.35, d: 0.45, color: C.amber, y: 0.2, z: 1.2 });
      const r1 = L.readout('กม.แรก'), r2 = L.readout('กม. ที่ 2–10'), r3 = L.readout('ส่วนที่เกิน 10 กม.'), rT = L.readout('รวมค่าโดยสาร');
      const S = 6 / 180;
      function upd(d) {
        if (d < 0) { rT('ข้อมูลผิด! ระยะทางติดลบ', 'bad'); return; }
        const a = d > 0 ? 35 : 0, b = Math.max(0, Math.min(d, 10) - 1) * 6.5, c = Math.max(0, d - 10) * 7;
        let y = 0; [a, b, c].forEach((v, i) => { const h = Math.max(0.001, v * S); segs[i].scale.y = h; segs[i].position.set(ax.sx(d) + 0.6, y + h / 2, 0); tags[i].position.set(ax.sx(d) + 1, y + h / 2, 0); tags[i].visible = v > 0; y += h; });
        car.position.x = ax.sx(d);
        r1(a.toFixed(2)); r2(`${Math.max(0, Math.min(d, 10) - 1).toFixed(1)} × 6.5 = ${b.toFixed(2)}`); r3(`${Math.max(0, d - 10).toFixed(1)} × 7 = ${c.toFixed(2)}`); rT(fare(d).toFixed(2) + ' บาท', 'good');
      }
      const sl = L.slider('ระยะทาง', { min: 0, max: 20, step: 0.5, value: 12.5, unit: 'กม.' }, upd);
      L.buttons([['ทดสอบ 0.5', () => sl.set(0.5)], ['ค่าขอบ 1', () => sl.set(1)], ['ค่าขอบ 10', () => sl.set(10)], ['12.5', () => sl.set(12.5)], ['−3 (ผิด)', () => upd(-3)]]);
      L.steps([
        { t: 'วิเคราะห์: ข้อมูลเข้า = ระยะทาง ข้อมูลออก = ค่าโดยสาร เงื่อนไข = 3 ช่วงราคา (เส้นสีเหลืองคือกราฟค่าโดยสาร)' },
        { t: 'คิดแบบขั้นบันได: 12.5 กม. = 35 + (9 × 6.5) + (2.5 × 7) = 35 + 58.5 + 17.5 = 111 บาท ดูแท่ง 3 สีที่ซ้อนกัน' },
        { t: 'สังเกตกราฟ: ช่วงหลัง 10 กม. เส้นชันขึ้นนิดหนึ่ง เพราะราคาต่อกิโลแพงขึ้น' },
        { t: 'ทดสอบ "ค่าขอบ" 1 กม. และ 10 กม. บั๊กชอบซ่อนตรงรอยต่อ ถ้าเขียน < แทน ≤ ผิดจะได้ราคาผิดตรงนี้ และต้องดักค่าติดลบด้วย' },
      ]);
      L.quiz('นั่งแท็กซี่ 5 กม. จ่ายเท่าไร', ['32.50 บาท', '61 บาท', '67.50 บาท'], 1, '35 + (4 × 6.5) = 35 + 26 = 61 บาท (กิโลแรกคิดเหมา 35 แล้ว)');
    },
  },

  8: {
    idea: 'ถอดคอมพิวเตอร์ออกเป็นชิ้น ๆ แล้วดูข้อมูลวิ่งจาก หน่วยรับเข้า → CPU ⇄ RAM → หน่วยแสดงผล และลองดูว่า "ไฟดับ" แล้วงานใน RAM หายอย่างไร',
    build(L) {
      L.cam(0, 7, 13, 0, 1, 0); L.floor(30);
      const parts = [
        { n: 'คีย์บอร์ด/เมาส์ (Input)', c: C.sky, x: -6, z: 0, w: 2.4, h: 0.3, d: 1, info: 'หน่วยรับเข้า: รับคำสั่งและข้อมูลจากผู้ใช้ เหมือน "วัตถุดิบที่ส่งเข้าครัว"' },
        { n: 'CPU (CU + ALU)', c: C.amber, x: -1.5, z: -1, w: 1.2, h: 0.3, d: 1.2, info: 'หน่วยประมวลผลกลาง: CU ควบคุมการทำงาน ALU คิดเลขและเปรียบเทียบ เหมือน "แม่ครัว"' },
        { n: 'RAM (หน่วยความจำหลัก)', c: C.green, x: 1.5, z: -1, w: 2.6, h: 0.3, d: 0.5, info: 'ที่ทำงานชั่วคราว เร็วมาก แต่ไฟดับแล้วข้อมูลหาย เหมือน "เขียง"' },
        { n: 'SSD (หน่วยความจำรอง)', c: C.violet, x: 0, z: 2.2, w: 1.8, h: 0.25, d: 1.2, info: 'เก็บข้อมูลถาวร ปิดเครื่องไม่หาย เหมือน "ตู้เย็น"' },
        { n: 'จอภาพ/ลำโพง (Output)', c: C.pink, x: 6, z: 0, w: 2.4, h: 1.6, d: 0.2, info: 'หน่วยแสดงผล: นำผลลัพธ์ออกมาให้เห็น/ได้ยิน เหมือน "อาหารที่เสิร์ฟ"' },
      ];
      const info = L.readout('ชิ้นส่วนที่เลือก', 'คลิกชิ้นส่วนในฉาก');
      const meshes = parts.map((p) => {
        const m = L.box({ w: p.w, h: p.h, d: p.d, color: p.c, x: p.x, y: p.h / 2 + 0.2, z: p.z });
        L.label(p.n, { parent: m, y: p.h / 2 + 0.45, cls: 'tag' });
        L.onClick(m, () => { info(p.info); meshes.forEach((x) => L.glow(x, x === m, 0x444444)); });
        return m;
      });
      L.arrow([-4.6, 0.6, 0], [-2.3, 0.6, -0.9], C.white); L.arrow([-0.8, 0.6, -1.2], [0.1, 0.6, -1.2], C.white); L.arrow([0.1, 0.6, -0.8], [-0.8, 0.6, -0.8], C.white);
      L.arrow([2.9, 0.6, -0.9], [4.7, 0.6, -0.1], C.white); L.arrow([0.8, 0.5, 1.5], [1.3, 0.5, -0.6], 0x9fb4c4);
      const ramData = L.group();
      function fillRam(n) { L.clearGroup(ramData); for (let i = 0; i < n; i++) ramData.add(L.box({ w: 0.35, h: 0.35, d: 0.35, color: C.lime, x: 0.6 + i * 0.45, y: 0.75, z: -1 })); }
      async function play() {
        const g = L.gen; const s = L.sphere({ r: 0.25, color: C.white, x: -6, y: 0.8, z: 0, emissive: 0x444444 });
        const path = [[-1.5, 0.9, -1], [1.5, 0.9, -1], [-1.5, 0.9, -1], [6, 1.2, 0]];
        for (const p of path) { if (!(await L.moveTo(s, ...p, 650))) return; if (p[0] === 1.5) fillRam(4); }
        L.remove(s); if (L.alive(g)) info('กดปุ่มตัวอักษร → CPU ประมวลผล ⇄ RAM เก็บงานชั่วคราว → ขึ้นบนจอ');
      }
      L.buttons([['พิมพ์ตัวอักษร 1 ตัว', play], ['บันทึกงาน (Ctrl+S)', () => { fillRam(4); info('คัดลอกงานจาก RAM ไปเก็บใน SSD แล้ว ไฟดับก็ไม่หาย'); L.glow(meshes[3], true, 0x332255); }],
        ['ไฟดับ!', () => { fillRam(0); info('ไฟดับ: ข้อมูลใน RAM หายหมด งานที่ยังไม่บันทึกหายไปด้วย', 'bad'); }]]);
      fillRam(4);
      L.steps([
        { t: 'ระบบคอมพิวเตอร์ = ฮาร์ดแวร์ + ซอฟต์แวร์ + บุคลากร (และข้อมูล กระบวนการ) ฉากนี้คือฮาร์ดแวร์ 5 หน่วย คลิกแต่ละชิ้นเพื่ออ่านหน้าที่' },
        { t: 'นึกถึงห้องครัว: วัตถุดิบเข้า (Input) → แม่ครัว (CPU) → เขียง (RAM) → ตู้เย็น (SSD) → อาหารเสิร์ฟ (Output)', f: () => L.flyTo(0, 7, 13, 0, 1, 0) },
        { t: 'กด "พิมพ์ตัวอักษร 1 ตัว" ดูข้อมูลวิ่งตามลูกศร สังเกตว่า CPU กับ RAM คุยกันไปมา', f: () => L.flyTo(-1, 5, 7, 0, 0.5, -1) },
        { t: 'กด "ไฟดับ!" กล่องเขียวใน RAM หายหมด นี่คือเหตุผลที่งานที่ยังไม่กดบันทึกหายตอนไฟดับ' },
      ]);
      L.quiz('ทำไมงานที่ยังไม่บันทึกจึงหายเมื่อไฟดับ', ['เพราะอยู่ใน RAM ซึ่งข้อมูลหายเมื่อไม่มีไฟ', 'เพราะ SSD เสีย', 'เพราะ CPU ลบทิ้ง'], 0, 'RAM เป็นหน่วยความจำชั่วคราว ต้องบันทึกลง SSD/หน่วยความจำรองจึงจะอยู่ถาวร');
    },
  },

  9: {
    idea: 'หอคอยซอฟต์แวร์: ฮาร์ดแวร์อยู่ล่างสุด ระบบปฏิบัติการเป็นตัวกลาง ซอฟต์แวร์ประยุกต์อยู่บนสุด แล้วจัดซอฟต์แวร์ลงชั้นตามลิขสิทธิ์',
    build(L) {
      L.cam(-2, 6, 13, 0, 2, 0); L.floor(30);
      const st = L.stack([
        { name: 'ฮาร์ดแวร์ (CPU RAM จอ)', color: C.slate, h: 0.6 },
        { name: 'ไดรเวอร์ (ให้เครื่องรู้จักอุปกรณ์)', color: C.blue, h: 0.4 },
        { name: 'ระบบปฏิบัติการ Windows / Android / iOS', color: C.teal, h: 0.6 },
        { name: 'โปรแกรมอรรถประโยชน์ (สแกนไวรัส บีบอัดไฟล์)', color: C.violet, h: 0.4 },
        { name: 'ซอฟต์แวร์ประยุกต์ LINE Canva Word เกม', color: C.amber, h: 0.6 },
      ], { x: -3, w: 4, d: 3 });
      L.label('ซอฟต์แวร์ระบบ', { x: -6, y: 1.4, cls: 'axis' });
      const bins = ['ลิขสิทธิ์ (ซื้อ)', 'ฟรีแวร์', 'แชร์แวร์ (ลองฟรี)', 'โอเพนซอร์ส'].map((n, i) => {
        const b = L.box({ w: 1.8, h: 0.5, d: 1.8, color: [C.red, C.green, C.orange, C.sky][i], x: 3.2 + (i % 2) * 2.4, y: 0.25, z: -1.4 + Math.floor(i / 2) * 2.8, opacity: 0.85 });
        L.label(n, { parent: b, y: 0.6, cls: 'tag' }); return b;
      });
      const apps = [['Photoshop', 0], ['LINE', 1], ['WinRAR', 2], ['LibreOffice', 3], ['Microsoft Office', 0], ['GIMP', 3], ['VLC', 3], ['Zoom (ใช้ฟรี)', 1]];
      const chips = apps.map(([n], i) => { const c = L.box({ w: 0.6, h: 0.3, d: 0.6, color: C.white, x: 2 + (i % 4) * 1.2, y: 3.6, z: -1 + Math.floor(i / 4) * 1.4 }); c.lbl = L.label(n, { parent: c, y: 0.4, cls: 'tick' }); return c; });
      const rS = L.readout('แอปที่จัดแล้ว', '0 / 8');
      let k = 0;
      async function sortNext() {
        if (k >= apps.length) return; const [n, bin] = apps[k], c = chips[k], b = bins[bin], slot = apps.slice(0, k).filter((a) => a[1] === bin).length;
        L.color(c, [C.red, C.green, C.orange, C.sky][bin]);
        await L.moveTo(c, b.position.x - 0.45 + (slot % 2) * 0.9, 0.7 + Math.floor(slot / 2) * 0.35, b.position.z, 700); k++; rS(k + ' / 8');
      }
      L.buttons([['แยกชั้นออก', () => st.explode(0.8)], ['รวมชั้น', () => st.explode(0)], ['จัดแอปถัดไปลงกล่อง', sortNext]]);
      L.steps([
        { t: 'ซอฟต์แวร์ระบบทำงานเบื้องหลังให้เครื่องใช้ได้: ไดรเวอร์ ระบบปฏิบัติการ โปรแกรมอรรถประโยชน์ กด "แยกชั้นออก" เพื่อดูทีละชั้น', f: () => st.explode(0.8) },
        { t: 'ถ้าไม่มีระบบปฏิบัติการ แอปด้านบนก็วางอยู่บนฮาร์ดแวร์ไม่ได้ เล่น TikTok ไม่ได้เลย' },
        { t: 'ซอฟต์แวร์ประยุกต์คือสิ่งที่เราใช้ทำงาน: ใช้งานทั่วไป (LINE, Canva) และใช้งานเฉพาะ (ระบบขายของหน้าร้าน)', f: () => L.flyTo(-2, 6, 13, 0, 2, 0) },
        { t: 'กด "จัดแอปถัดไปลงกล่อง" ทายก่อนว่าแต่ละแอปอยู่กล่องไหน โอเพนซอร์สใช้ฟรีและเปิดโค้ด ส่วนโปรแกรมเถื่อน/แคร็กผิดกฎหมายและมักแฝงไวรัส', f: () => L.flyTo(4.5, 7, 9, 4.5, 0.5, 0) },
      ]);
      L.quiz('โปรแกรมสแกนไวรัสเป็นซอฟต์แวร์ประเภทใด', ['ซอฟต์แวร์ประยุกต์', 'ซอฟต์แวร์ระบบ (โปรแกรมอรรถประโยชน์)', 'ฮาร์ดแวร์'], 1, 'โปรแกรมสแกนไวรัสช่วยดูแลเครื่อง จึงเป็นโปรแกรมอรรถประโยชน์ในกลุ่มซอฟต์แวร์ระบบ');
    },
  },

  10: {
    idea: 'ส่งไฟล์ผ่านเครือข่าย LAN → MAN → WAN ปรับขนาดไฟล์และความเร็วเน็ต แล้วดูเวลาที่ใช้จริง (เวลา = MB × 8 ÷ Mbps) พร้อมเทียบคลาวด์แบบพิซซ่า',
    build(L) {
      L.cam(0, 9, 15, 0, 0, 0); L.floor(36);
      const zone = (x, r, c, t) => { L.cyl({ r, h: 0.05, color: c, x, y: 0.03, opacity: 0.35 }); L.label(t, { x, y: 0.3, z: r + 0.4, cls: 'tag', color: c }); };
      zone(-7, 2.4, C.teal, 'LAN ห้องคอมพิวเตอร์'); zone(0, 3, C.blue, 'MAN จังหวัดเลย'); zone(7, 2.6, C.violet, 'WAN อินเทอร์เน็ต');
      const pc = L.box({ w: 0.9, h: 0.7, d: 0.6, color: C.sky, x: -7.6, y: 0.4 }); L.label('ผู้ส่ง', { parent: pc, y: 0.7, cls: 'tick' });
      const rt = L.box({ w: 0.8, h: 0.3, d: 0.5, color: C.white, x: -5.6, y: 0.2 }); L.label('Router', { parent: rt, y: 0.5, cls: 'tick' });
      const isp = L.box({ w: 0.9, h: 1.3, d: 0.9, color: C.blue, x: 0, y: 0.65 }); L.label('ผู้ให้บริการเน็ต', { parent: isp, y: 1, cls: 'tick' });
      const globe = L.sphere({ r: 1.4, color: C.violet, x: 7, y: 1.5, opacity: 0.85 }); L.label('เซิร์ฟเวอร์ปลายทาง', { parent: globe, y: 1.8, cls: 'tick' });
      L.line([[-7.6, 0.5, 0], [-5.6, 0.3, 0], [0, 0.6, 0], [7, 1.2, 0]], 0x9fb4c4);
      let mb = 100, mbps = 20;
      const rT = L.readout('เวลาที่ใช้ (โดยประมาณ)'), rF = L.readout('วิธีคิด');
      const calc = () => { const s = (mb * 8) / mbps; rT(s >= 60 ? (s / 60).toFixed(1) + ' นาที' : s.toFixed(1) + ' วินาที', s > 60 ? 'warn' : 'good'); rF(`${mb} × 8 ÷ ${mbps} = ${s.toFixed(1)} วินาที`); };
      L.slider('ขนาดไฟล์', { min: 1, max: 2000, value: 100, unit: 'MB' }, (v) => { mb = v; calc(); });
      L.slider('ความเร็วเน็ต', { min: 1, max: 500, value: 20, unit: 'Mbps' }, (v) => { mbps = v; calc(); });
      async function send() {
        const s = (mb * 8) / mbps, ms = Math.min(6000, Math.max(800, s * 120)), g = L.gen;
        const p = L.box({ w: 0.35, h: 0.35, d: 0.35, color: C.amber, x: -7.6, y: 0.9, emissive: 0x553300 });
        for (const [x, y] of [[-5.6, 0.7], [0, 1.3], [7, 3.1]]) if (!(await L.moveTo(p, x, y, 0, ms / 3))) return;
        L.remove(p); if (L.alive(g)) rT('ส่งถึงแล้ว · ' + (s >= 60 ? (s / 60).toFixed(1) + ' นาที' : s.toFixed(1) + ' วินาที'), 'good');
      }
      L.buttons([['ส่งไฟล์', send]]);
      const pizza = L.stack([{ name: 'ฮาร์ดแวร์/ศูนย์ข้อมูล', color: C.slate }, { name: 'ระบบปฏิบัติการ', color: C.blue }, { name: 'แพลตฟอร์ม', color: C.teal }, { name: 'ซอฟต์แวร์ที่ใช้', color: C.amber }], { x: 0, z: 6, w: 3, d: 2 });
      const who = L.label('', { x: 0, y: 2.6, z: 6, cls: 'tag' });
      L.select('คลาวด์แบบไหน (แบบพิซซ่า)', ['IaaS เช่าครัวทำเอง', 'PaaS ซื้อแป้งสำเร็จมาอบ', 'SaaS สั่งพิซซ่ามากินเลย (Google Docs)'], (i) => {
        const top = [0, 2, 3][i]; pizza.items.forEach((b, k) => L.color(b, k <= top ? C.slate : C.amber));
        who.set(['IaaS: ผู้ให้บริการดูแลฮาร์ดแวร์ เราดูแลชั้นสีส้มเอง', 'PaaS: ผู้ให้บริการดูแลถึงแพลตฟอร์ม เราสร้างแอปเอง', 'SaaS: ผู้ให้บริการดูแลทุกชั้น เราแค่ใช้'][i]);
      }, 2);
      L.steps([
        { t: 'องค์ประกอบการสื่อสาร 5 อย่าง: ผู้ส่ง ผู้รับ ข้อมูล สื่อกลาง และโพรโทคอล (กติกาที่ตกลงกัน)', f: () => L.flyTo(0, 9, 15, 0, 0, 0) },
        { t: 'LAN = ในห้อง/อาคาร · MAN = ในเมือง เช่น เชื่อมโรงเรียนในจังหวัดเลย · WAN = ข้ามประเทศ อินเทอร์เน็ตคือ WAN ที่ใหญ่ที่สุด' },
        { t: 'ไฟล์วัดเป็น "ไบต์" เน็ตวัดเป็น "บิตต่อวินาที" ต้องคูณ 8 ก่อน: คลิป 100 MB เน็ต 20 Mbps → 800 ÷ 20 = 40 วินาที กด "ส่งไฟล์"' },
        { t: 'คลาวด์ = ใช้คอมพิวเตอร์ของคนอื่นผ่านเน็ต ชั้นสีเทาคือที่ผู้ให้บริการดูแล Google Docs เป็น SaaS ใช้ได้ทันที', f: () => L.flyTo(0, 6, 13, 0, 1, 6) },
      ]);
      L.quiz('รูป 10 MB ส่งด้วยเน็ต 20 Mbps ใช้เวลากี่วินาที', ['0.5 วินาที', '2 วินาที', '4 วินาที'], 2, '10 × 8 = 80 Mb ÷ 20 Mbps = 4 วินาที');
    },
  },
};
