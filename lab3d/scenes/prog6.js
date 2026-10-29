// ม.6 การเขียนโปรแกรม (Python)
import { C, PALETTE } from '../engine.js';

const r2 = (v) => Math.round(v * 100) / 100;
const codeBlock = (L, lines, o = {}) => {
  const g = L.group({ x: o.x ?? -6, y: o.y ?? 0, z: o.z ?? 0 });
  const rows = lines.map((t, i) => { const b = L.box({ w: o.w ?? 4.6, h: 0.42, d: 0.5, color: 0x22323f, y: (lines.length - i) * 0.5, parent: g, edgeOpacity: 0.15 }); b.lbl = L.label(t, { parent: b, x: -(o.w ?? 4.6) / 2 + 0.15, cls: 'code' }); b.lbl.center.set(0, 0.5); return b; });
  return { g, rows, mark(i, c) { rows.forEach((r, k) => L.color(r, k === i ? c : 0x22323f)); } };
};

export default {
  1: {
    idea: 'Interpreter แปลทีละบรรทัดแล้วทำทันที (เหมือนล่าม) ส่วน Compiler แปลทั้งไฟล์ก่อนแล้วค่อยรัน (เหมือนแปลหนังสือทั้งเล่ม) ลองใส่บรรทัดที่ผิดแล้วดูว่าแต่ละแบบหยุดตรงไหน',
    build(L) {
      L.cam(0, 5, 17, 0, 2, 0); L.floor(30);
      const lines = ['print("สวัสดี เลยอนุกูลวิทยา")', 'x = 7 // 2', 'print(x)', 'print("ผลคือ" x)', 'print("จบ")'];
      let bug = true;
      const cb = codeBlock(L, lines, { x: -4.2 });
      const out = L.label('', { x: 5.2, y: 2.4, cls: 'code' }); L.label('ผลลัพธ์บนจอ', { x: 5.2, y: 3.6, cls: 'tag' });
      const tr = L.box({ w: 1.4, h: 1.4, d: 1.4, color: C.violet, x: 1.4, y: 1.6 }); const trL = L.label('', { parent: tr, y: 1.1, cls: 'tag' });
      const rE = L.readout('ข้อผิดพลาด', '–');
      const fixed = () => lines.map((l, i) => (i === 3 && !bug ? 'print("ผลคือ", x)' : l));
      function show() { cb.rows.forEach((r, i) => r.lbl.set(fixed()[i])); out.set(''); rE('–'); cb.mark(-1); }
      async function interp() {
        show(); trL.set('Interpreter (ล่าม)'); const g = L.gen; let o = [];
        for (let i = 0; i < lines.length; i++) {
          cb.mark(i, C.blue); if (!(await L.wait(550))) return;
          if (i === 3 && bug) { cb.mark(i, C.red); rE('SyntaxError บรรทัด 4: ลืมเครื่องหมาย , — บรรทัด 1–3 ทำไปแล้ว', 'bad'); return; }
          if (i === 0) o.push('สวัสดี เลยอนุกูลวิทยา'); if (i === 2) o.push('3'); if (i === 3) o.push('ผลคือ 3'); if (i === 4) o.push('จบ');
          out.set(o.join('\n'));
        }
        rE('ไม่มี', 'good');
      }
      async function comp() {
        show(); trL.set('Compiler (แปลทั้งเล่ม)'); const g = L.gen;
        for (let i = 0; i < lines.length; i++) { cb.mark(i, C.amber); if (!(await L.wait(250))) return; if (i === 3 && bug) { cb.mark(i, C.red); rE('แปลไม่ผ่านที่บรรทัด 4 — ยังไม่มีบรรทัดไหนได้รันเลย', 'bad'); return; } }
        cb.mark(-1); out.set('สวัสดี เลยอนุกูลวิทยา\n3\nผลคือ 3\nจบ'); rE('ไม่มี (แปลเสร็จแล้วรันทีเดียว)', 'good');
      }
      L.toggle('บรรทัดที่ 4 มีบั๊ก (ลืม ,)', true, (v) => { bug = v; show(); });
      L.buttons([['รันแบบ Interpreter (Python)', interp], ['รันแบบ Compiler', comp]]);
      L.steps([
        { t: 'คอมเข้าใจแค่ 0 กับ 1 เราจึงเขียนภาษาระดับสูงอย่าง Python แล้วให้ "ตัวแปลภาษา" แปลให้เครื่อง' },
        { t: 'กด "รันแบบ Interpreter" Python แปลแล้วทำทีละบรรทัด ผลออกมาทีละบรรทัด และหยุดเมื่อเจอบรรทัดที่ผิด เหมือนล่ามที่แปลไปพูดไป' },
        { t: 'กด "รันแบบ Compiler" แปลทั้งไฟล์ก่อน ถ้ามีบรรทัดผิดแม้แต่บรรทัดเดียว ยังไม่มีผลลัพธ์ออกมาเลย' },
        { t: 'Error ไม่ใช่ศัตรู มันบอกว่าผิดบรรทัดไหน อ่านก่อนถาม ใช้ AI ให้ "อธิบาย" Error ไม่ใช่ "ทำแทน" (Explain → Try → Check)' },
      ]);
      show();
      L.quiz('print(7 // 2) ได้ผลอะไร', ['3.5', '3', '1'], 1, '// คือหารปัดเศษทิ้ง 7 // 2 = 3 (ส่วน 7 % 2 = 1 คือเศษ)');
    },
  },

  2: {
    idea: 'ตัวแปรคือกล่องที่มีป้ายชื่อ สีกล่องบอกชนิดข้อมูล int float str bool ลองดูว่า input() ได้ "ข้อความ" เสมอ "5" + "5" จึงได้ "55" และดูตัวดำเนินการ // % ** เป็นภาพ',
    build(L) {
      L.cam(0, 6, 14, 0, 1.5, 0); L.floor(30);
      const typeC = { int: C.blue, float: C.teal, str: C.amber, bool: C.pink };
      const vars = [['name', '"มะลิ"', 'str'], ['age', '17', 'int'], ['height', '1.62', 'float'], ['is_member', 'True', 'bool']];
      vars.forEach(([n, v, t], i) => { const b = L.box({ w: 1.6, h: 1.2, d: 1.6, color: typeC[t], x: -6 + i * 2.2, y: 0.6, opacity: 0.85 }); L.label(n, { parent: b, y: 0.95, cls: 'tag' }); L.label(`${v}<br><small>${t}</small>`, { parent: b, cls: 'plain' }); });
      const rI = L.readout('a + b เมื่อมาจาก input()'), rC = L.readout('หลังแปลงด้วย int()');
      let castOn = false;
      L.toggle('แปลงด้วย int(input()) ก่อนบวก', false, (v) => { castOn = v; rI(v ? '5 + 5 = 10' : '"5" + "5" = "55"', v ? 'good' : 'bad'); rC(v ? 'type → int' : 'type → str (ข้อความต่อกัน)'); });
      const g = L.group({ x: 3.5 });
      let a = 7, b = 2, op = 0;
      const rO = L.readout('ผลลัพธ์');
      function ops() {
        L.clearGroup(g); const ops = ['+', '-', '*', '/', '//', '%', '**'], sym = ops[op];
        const res = [a + b, a - b, a * b, r2(a / b), Math.floor(a / b), a % b, a ** b][op];
        rO(`${a} ${sym} ${b} = ${res}`, 'good');
        if (sym === '//' || sym === '%' || sym === '/') {
          const q = Math.floor(a / b), rem = a % b; let k = 0;
          for (let i = 0; i < q; i++) for (let j = 0; j < b; j++, k++) L.box({ w: 0.4, h: 0.4, d: 0.4, color: PALETTE[i % PALETTE.length], x: j * 0.5, y: 0.25 + i * 0.5, parent: g, edges: false });
          for (let j = 0; j < rem; j++) L.box({ w: 0.4, h: 0.4, d: 0.4, color: C.red, x: (b + 0.6 + j * 0.5), y: 0.25, parent: g, edges: false });
          g.add(L.label(`แบ่ง ${a} ชิ้น เป็นกลุ่มละ ${b} ได้ ${q} กลุ่ม (//) เหลือเศษ ${rem} (%)`, { x: 1, y: Math.max(q, 1) * 0.5 + 0.6, cls: 'tag' }));
        } else g.add(L.label(`${a} ${sym} ${b} = ${res}`, { x: 1, y: 1.5, cls: 'big' }));
      }
      L.slider('a', { min: 1, max: 20, value: 7 }, (v) => { a = v; ops(); });
      L.slider('b', { min: 1, max: 6, value: 2 }, (v) => { b = v; ops(); });
      L.select('ตัวดำเนินการ', ['+', '-', '*', '/', '//', '%', '**'], (i) => { op = i; ops(); }, 4);
      L.steps([
        { t: 'ตัวแปรคือกล่องมีป้ายชื่อ ใส่ค่าด้วย = เช่น age = 17 สีบอกชนิดข้อมูล: int จำนวนเต็ม · float ทศนิยม · str ข้อความ · bool จริง/เท็จ', f: () => L.flyTo(-2.7, 4, 9, -2.7, 0.8, 0) },
        { t: 'input() ส่งค่ากลับมาเป็น str เสมอ ถ้าพิมพ์ 5 กับ 5 แล้วบวกกัน จะได้ "55" (ต่อข้อความ) ต้อง int(input()) ก่อน ลองเปิดตัวเลือกด้านขวา' },
        { t: 'ตัวดำเนินการ // คือหารปัดเศษทิ้ง % คือเศษ ลองเลือก // หรือ % แล้วเลื่อน a b ดูการแบ่งกล่องเป็นกลุ่ม', f: () => L.flyTo(4, 5, 9, 4.5, 1.5, 0) },
        { t: 'ตัวอย่างใช้จริง: ค่ารถสองแถวรวม 250 บาท หาร 4 คน: 250 // 4 = 62 บาท เหลือเศษ 250 % 4 = 2 บาท', f: () => L.flyTo(0, 6, 14, 0, 1.5, 0) },
      ]);
      ops();
      L.quiz('ผลของ type(input("อายุ: ")) คืออะไร', ['int', 'str', 'float'], 1, 'input() คืนค่าเป็นข้อความ (str) เสมอ ต้องแปลงเองด้วย int() หรือ float()');
    },
  },

  3: {
    idea: 'ผังงาน if–elif–else ตัดเกรดเป็นทางแยก ปล่อยลูกบอลคะแนนให้กลิ้งผ่านเงื่อนไขทีละข้อ เงื่อนไขแรกที่เป็นจริงจะได้ทำ ที่เหลือข้ามหมด',
    build(L) {
      L.cam(-1, 6, 18, -1, 2.5, 0); L.floor(36);
      const conds = [['score >= 80', 80, 'เกรด 4'], ['score >= 70', 70, 'เกรด 3'], ['score >= 60', 60, 'เกรด 2'], ['score >= 50', 50, 'เกรด 1']];
      const nodes = conds.map(([t], i) => { const d = L.box({ w: 1.3, h: 1.3, d: 0.4, color: C.violet, x: -6 + i * 3, y: 4, rz: Math.PI / 4 }); L.label(`if ${t}` .replace('if', i ? 'elif' : 'if'), { x: -6 + i * 3, y: 5.3, cls: 'tag' }); return d; });
      const outs = conds.map(([, , g], i) => { const b = L.box({ w: 1.6, h: 0.6, d: 0.6, color: C.green, x: -6 + i * 3, y: 1, z: 0 }); L.label(g, { parent: b, y: 0.6, cls: 'tag' }); return b; });
      const els = L.box({ w: 1.6, h: 0.6, d: 0.6, color: C.red, x: 6, y: 1 }); L.label('else: เกรด 0', { parent: els, y: 0.6, cls: 'tag' });
      conds.forEach((_, i) => { L.arrow([-6 + i * 3, 3.3, 0], [-6 + i * 3, 1.5, 0], C.green, 0.25); L.arrow([-5.2 + i * 3, 4, 0], [-3.8 + i * 3, 4, 0], 0xef5b5b, 0.25); });
      L.label('จริง ↓', { x: -6.6, y: 2.4, cls: 'tick' }); L.label('เท็จ →', { x: -4.5, y: 4.4, cls: 'tick' });
      let sc = 72; const rR = L.readout('ผลลัพธ์'), rN = L.readout('เงื่อนไขที่ถูกตรวจ');
      async function drop() {
        const g = L.gen; const ball = L.sphere({ r: 0.3, color: C.amber, x: -8, y: 4, emissive: 0x442200 }); const bl = L.label(String(sc), { parent: ball, y: 0.55, cls: 'tag' }); let checked = 0;
        for (let i = 0; i < conds.length; i++) {
          if (!(await L.moveTo(ball, -6 + i * 3, 4.9, 0.6, 450))) return; checked++;
          L.glow(nodes[i], true, sc >= conds[i][1] ? 0x225533 : 0x552222);
          if (sc >= conds[i][1]) { await L.moveTo(ball, -6 + i * 3, 1.6, 0.6, 450); rR(conds[i][2], 'good'); rN(checked + ' ข้อ (ที่เหลือข้าม)'); return; }
        }
        await L.moveTo(ball, 6, 1.6, 0.6, 450); rR('เกรด 0', 'bad'); rN(checked + ' ข้อ');
      }
      L.slider('score', { min: 0, max: 100, value: 72 }, (v) => { sc = v; nodes.forEach((n) => L.glow(n, false)); });
      L.buttons([['ปล่อยลูกบอลคะแนน', drop]]);
      L.label('if score >= 80:\n    grade = 4\nelif score >= 70:\n    grade = 3\nelif score >= 60:\n    grade = 2\nelif score >= 50:\n    grade = 1\nelse:\n    grade = 0', { x: -9.5, y: 1.2, z: 2, cls: 'code' });
      L.steps([
        { t: 'ปล่อยลูกบอล 72 คะแนน ตรวจ if แรก ≥ 80? เท็จ ไปทางขวา → elif ≥ 70? จริง ลงไปได้เกรด 3 และไม่ตรวจข้อที่เหลือเลย' },
        { t: 'ลำดับสำคัญมาก ถ้าเขียน >= 50 ไว้ข้อแรก คนได้ 95 ก็จะได้เกรด 1 เพราะเงื่อนไขแรกจริงแล้วหยุด ต้องเรียงจากมากไปน้อย' },
        { t: 'ทดสอบค่าขอบ: 80, 79, 50, 49 บั๊กชอบซ่อนตรงรอยต่อ ถ้าเขียน > แทน >= คน 80 พอดีจะได้เกรดผิด' },
        { t: 'Python ใช้การย่อหน้า (indent) 4 ช่องบอกว่าคำสั่งไหนอยู่ใน if ย่อหน้าผิดคือ IndentationError' },
      ]);
      L.quiz('score = 50 ได้เกรดอะไรจากโค้ดนี้', ['เกรด 0', 'เกรด 1', 'เกรด 2'], 1, '50 >= 80, 70, 60 เป็นเท็จ แต่ 50 >= 50 เป็นจริง จึงได้เกรด 1');
    },
  },

  4: {
    idea: 'for i in range(start, stop, step) จุดไฟทีละช่อง พร้อมตัวแปรสะสม total และ while ที่ทำซ้ำจนเงื่อนไขเป็นเท็จ (ระวังลูปไม่รู้จบ)',
    build(L) {
      L.cam(0, 6, 14, 0, 1, 0); L.floor(36);
      let st = 1, sp = 11, step = 1; const g = L.group();
      const rR = L.readout('ค่าที่ได้จาก range'), rT = L.readout('total (สะสม)'), rI = L.readout('รอบที่');
      const code = L.label('', { x: -7.5, y: 4.2, cls: 'code' });
      function draw() { L.clearGroup(g); for (let v = 0; v <= 20; v++) { const b = L.box({ w: 0.55, h: 0.3, d: 0.8, color: 0x2b3a46, x: -6 + v * 0.62, y: 0.15, parent: g }); b.v = v; g.add(L.label(String(v), { x: b.position.x, y: 0.55, cls: 'tick' })); } code.set(`total = 0\nfor i in range(${st}, ${sp}, ${step}):\n    total = total + i\nprint(total)`); const vals = []; for (let v = st; step > 0 ? v < sp : v > sp; v += step) vals.push(v); rR(vals.length ? `[${vals.join(', ')}]` : 'ว่าง (ไม่ทำเลย)'); }
      async function run() {
        draw(); const gg = L.gen; let total = 0, k = 0;
        for (let v = st; step > 0 ? v < sp : v > sp; v += step) {
          const b = g.children.find((x) => x.v === v); if (b) { L.color(b, C.amber); L.tween(b.scale, { y: 3 }, 200); b.position.y = 0.45; }
          total += v; k++; rT(total); rI(k); if (!(await L.wait(380))) return;
        }
      }
      L.slider('start', { min: 0, max: 10, value: 1 }, (v) => { st = v; draw(); });
      L.slider('stop (ไม่รวมตัวนี้)', { min: 1, max: 21, value: 11 }, (v) => { sp = v; draw(); });
      L.slider('step', { min: 1, max: 5, value: 1 }, (v) => { step = v; draw(); });
      L.buttons([['รัน for loop', run]]);
      const w = L.group({ z: 3 }); const coin = [];
      const rW = L.readout('while: ออมเงินจนครบ 500 บาท');
      async function whileRun(inf) {
        L.clearGroup(w); let money = 0, day = 0; const gg = L.gen;
        while (money < 500) {
          if (!inf) money += 60; day++; L.cyl({ r: 0.3, h: 0.12, color: C.amber, x: -6 + (day % 20) * 0.62, y: 0.1 + Math.floor(day / 20) * 0.15, parent: w });
          rW(inf ? `วันที่ ${day}: money = ${money} — ลืมเพิ่มเงิน! ลูปไม่จบ` : `วันที่ ${day}: money = ${money}`, inf ? 'bad' : '');
          if (!(await L.wait(220))) return; if (inf && day >= 30) { rW('หยุดเอง: ลูปไม่รู้จบ (กด Ctrl+C / Interrupt ใน Colab)', 'bad'); return; }
        }
        rW(`ครบ 500 ในวันที่ ${day} (เงิน ${money} บาท)`, 'good');
      }
      L.buttons([['รัน while (ออมวันละ 60)', () => whileRun(false)], ['while ที่ลืมเพิ่มค่า', () => whileRun(true)]]);
      L.steps([
        { t: 'range(1, 11) ได้ 1 ถึง 10 ไม่รวม 11 เป็นจุดที่นักเรียนพลาดบ่อยที่สุด ดูช่องสีเหลืองตอนกด "รัน for loop"' },
        { t: 'total = total + i คือ "ตัวแปรสะสม" เหมือนกระปุกออมสิน ทุกรอบหยอดเพิ่ม 1+2+…+10 = 55' },
        { t: 'ลอง step = 2 ได้เลขคี่ 1,3,5,7,9 ลอง start มากกว่า stop ได้ช่วงว่าง ลูปไม่ทำเลยสักรอบ' },
        { t: 'while ทำซ้ำ "ตราบใดที่เงื่อนไขยังจริง" ถ้าลืมเปลี่ยนค่าในลูป เงื่อนไขจริงตลอด = ลูปไม่รู้จบ ลองกดปุ่มที่สอง', f: () => L.flyTo(0, 6, 12, 0, 0.5, 3) },
      ]);
      draw();
      L.quiz('for i in range(2, 10, 3) ได้ค่า i อะไรบ้าง', ['2, 5, 8', '2, 5, 8, 11', '3, 6, 9'], 0, 'เริ่ม 2 เพิ่มทีละ 3: 2, 5, 8 ค่าถัดไป 11 เกิน stop (10) จึงหยุด');
    },
  },

  5: {
    idea: 'ฟังก์ชันคือเครื่องจักรที่มีช่องรับค่า (พารามิเตอร์) และส่งผลลัพธ์ออกด้วย return ลองเรียก calc_bill(หน่วยไฟ) และดูว่าตัวแปรข้างในฟังก์ชันอยู่ในฟองของมันเอง (local scope)',
    build(L) {
      L.cam(-2, 5, 16, -2, 2, 0); L.floor(30);
      const mach = L.box({ w: 3.6, h: 2.4, d: 2.2, color: C.violet, y: 1.8, opacity: 0.9 }); L.label('def calc_bill(units, rate=4.2):', { parent: mach, y: 1.6, cls: 'code' });
      const bubble = L.sphere({ r: 1.5, color: C.sky, y: 1.8, opacity: 0.18 }); const lv = L.label('', { x: 0, y: 1.8, cls: 'tick' });
      const inA = L.cyl({ r: 0.3, h: 0.9, color: C.slate, x: -2.3, y: 2.5, rz: Math.PI / 2 }); L.label('units', { parent: inA, y: 0.6, cls: 'tick' });
      const inB = L.cyl({ r: 0.3, h: 0.9, color: C.slate, x: -2.3, y: 1.2, rz: Math.PI / 2 }); L.label('rate', { parent: inB, y: 0.6, cls: 'tick' });
      L.cyl({ r: 0.35, h: 0.9, color: C.slate, x: 2.3, y: 1.8, rz: Math.PI / 2 }); L.label('return', { x: 2.7, y: 2.5, cls: 'tick' });
      let units = 150, rate = 4.2, useDefault = true;
      const rC = L.readout('การเรียกใช้'), rR = L.readout('ค่าที่ return'), rS = L.readout('print(cost) นอกฟังก์ชัน');
      L.label('def calc_bill(units, rate=4.2):\n    cost = units * rate\n    return round(cost, 2)\n\nbill = calc_bill(150)\nprint(bill)', { x: -8.5, y: 4.4, cls: 'code' });
      function sig() { rC(useDefault ? `calc_bill(${units})` : `calc_bill(${units}, ${rate})`); }
      async function call() {
        const g = L.gen; const r = useDefault ? 4.2 : rate;
        const a = L.sphere({ r: 0.28, color: C.amber, x: -5, y: 2.5 }), b = L.sphere({ r: 0.22, color: useDefault ? C.slate : C.amber, x: -5, y: 1.2 });
        L.label(String(units), { parent: a, y: 0.5, cls: 'tag' }); L.label(useDefault ? '4.2 (ค่าเริ่มต้น)' : String(r), { parent: b, y: 0.45, cls: 'tag' });
        await Promise.all([L.moveTo(a, -0.6, 2.2, 0, 600), L.moveTo(b, -0.6, 1.4, 0, 600)]); if (!L.alive(g)) return;
        lv.set(`local: units=${units}, rate=${r}<br>cost=${r2(units * r)}`); await L.wait(700); L.remove(a); L.remove(b);
        const o = L.sphere({ r: 0.32, color: C.green, x: 0.6, y: 1.8 }); L.label(String(r2(units * r)), { parent: o, y: 0.55, cls: 'tag' });
        await L.moveTo(o, 5, 1.8, 0, 600); rR(r2(units * r) + ' บาท', 'good'); lv.set(''); rS("NameError: name 'cost' is not defined (cost อยู่ในฟองของฟังก์ชันเท่านั้น)", 'bad'); await L.wait(900); L.remove(o);
      }
      L.slider('units (หน่วยไฟ)', { min: 0, max: 500, step: 10, value: 150 }, (v) => { units = v; sig(); });
      L.toggle('ใช้ค่าเริ่มต้น rate = 4.2', true, (v) => { useDefault = v; sig(); });
      L.slider('rate (บาท/หน่วย)', { min: 2, max: 8, step: 0.1, value: 4.2 }, (v) => { rate = v; sig(); });
      L.buttons([['เรียกใช้ฟังก์ชัน', call]]);
      L.steps([
        { t: 'def สร้างฟังก์ชัน units และ rate คือพารามิเตอร์ (ช่องรับค่า) ตอนเรียก calc_bill(150) ค่า 150 คืออาร์กิวเมนต์' },
        { t: 'rate=4.2 คือค่าเริ่มต้น ไม่ส่งมาก็ใช้ 4.2 ปิดตัวเลือกแล้วเลื่อน rate เพื่อส่งค่าเอง' },
        { t: 'return ส่งผลลัพธ์ "ออกมา" ให้ใช้ต่อได้ ต่างจาก print ที่แค่แสดงบนจอ ฟังก์ชันที่ไม่มี return จะคืนค่า None' },
        { t: 'ตัวแปร cost เกิดและตายในฟองของฟังก์ชัน (local scope) เรียกจากข้างนอกจะเจอ NameError ต้องรับค่าที่ return มาเก็บในตัวแปรเอง' },
      ]);
      sig();
      L.quiz('ฟังก์ชันที่ไม่มีคำสั่ง return จะคืนค่าอะไร', ['0', 'None', 'ค่าตัวแปรตัวสุดท้าย'], 1, 'Python คืนค่า None ถ้าไม่มี return');
    },
  },

  6: {
    idea: 'List คือชั้นวางกล่องที่มีเลขลำดับเริ่มที่ 0 (และนับถอยหลังด้วย -1) ส่วน Dictionary คือตู้ล็อกเกอร์ที่เปิดด้วย "คีย์" ลอง append pop sort และค้นหาด้วยคีย์',
    build(L) {
      L.cam(0, 6, 14, 0, 1.5, 0); L.floor(36);
      let lst = ['ข้าวปุ้น', 'ส้มตำ', 'ไก่ย่าง', 'ข้าวเหนียว'];
      const pool = ['ลาบ', 'ต้มแซ่บ', 'ข้าวหลาม', 'กล้วยตาก', 'มะขามหวาน'];
      const g = L.group({ z: -1.5 }); const rL = L.readout('menu'), rI = L.readout('menu[index]');
      let idx = 0;
      function draw() {
        L.clearGroup(g); L.box({ w: lst.length * 1.5 + 0.4, h: 0.15, d: 1.4, color: 0x6b5b45, x: -6 + (lst.length * 1.5) / 2 - 0.2, y: 0.07, parent: g, edges: false });
        lst.forEach((v, i) => { const b = L.box({ w: 1.3, h: 1, d: 1, color: i === ((idx % lst.length) + lst.length) % lst.length ? C.amber : C.teal, x: -6 + i * 1.5 + 0.55, y: 0.65, parent: g }); g.add(L.label(v, { x: b.position.x, y: 1.4, cls: 'tag' })); g.add(L.label(`${i} / ${i - lst.length}`, { x: b.position.x, y: 0.1, z: 0.8, cls: 'tick' })); });
        rL(`[${lst.map((x) => `'${x}'`).join(', ')}]  len = ${lst.length}`);
        const k = idx < 0 ? lst.length + idx : idx; rI(k >= 0 && k < lst.length ? `menu[${idx}] = '${lst[k]}'` : `IndexError: list index out of range`, k >= 0 && k < lst.length ? 'good' : 'bad');
      }
      L.slider('index', { min: -6, max: 6, value: 0 }, (v) => { idx = v; draw(); });
      L.buttons([['append()', () => { if (lst.length < 8) lst.push(pool[lst.length % pool.length]); draw(); }], ['pop()', () => { lst.pop(); draw(); }], ['sort()', () => { lst.sort((a, b) => a.localeCompare(b, 'th')); draw(); }]]);
      const prices = { 'ข้าวปุ้น': 40, 'ส้มตำ': 35, 'ไก่ย่าง': 60, 'ข้าวเหนียว': 10 };
      const dg = L.group({ x: 4, z: 1.5 }); const lockers = {};
      Object.entries(prices).forEach(([k, v], i) => { const b = L.box({ w: 1.2, h: 1.4, d: 1, color: C.slate, x: (i % 2) * 1.4, y: 0.7 + Math.floor(i / 2) * 1.5, parent: dg }); L.label(`'${k}'`, { parent: b, y: 0.5, cls: 'tick' }); b.val = L.label('', { parent: b, z: 0.6, cls: 'tag' }); lockers[k] = b; });
      const rD = L.readout('prices[key]');
      L.select('เปิดล็อกเกอร์ด้วยคีย์', [...Object.keys(prices), 'ขนมจีน (ไม่มีคีย์นี้)'], (i) => {
        const k = [...Object.keys(prices), 'ขนมจีน'][i]; Object.values(lockers).forEach((b) => { L.color(b, C.slate); b.val.set(''); });
        if (lockers[k]) { L.color(lockers[k], C.amber); lockers[k].val.set(prices[k] + ' บาท'); rD(`prices['${k}'] = ${prices[k]}`, 'good'); }
        else rD(`KeyError: 'ขนมจีน' → ใช้ prices.get('ขนมจีน', 0) ได้ 0`, 'bad');
      });
      L.steps([
        { t: 'List เก็บหลายค่าเรียงลำดับ เลขกล่องเริ่มที่ 0 ไม่ใช่ 1 กล่องแรกคือ menu[0] เลื่อน index ดู', f: () => L.flyTo(-3, 5, 9, -3, 0.8, -1.5) },
        { t: 'เลขติดลบนับจากท้าย menu[-1] คือตัวสุดท้ายเสมอ ลองเลื่อน index เกินความยาว จะเจอ IndexError' },
        { t: 'append() เพิ่มท้าย pop() เอาตัวท้ายออก sort() เรียงลำดับ len() บอกจำนวน กดปุ่มดูกล่องเปลี่ยน' },
        { t: 'Dictionary เก็บคู่ คีย์ : ค่า เหมือนตู้ล็อกเกอร์ เปิดด้วยชื่อ ไม่ใช่เลขลำดับ prices["ส้มตำ"] ได้ 35 ถ้าไม่มีคีย์จะ KeyError ใช้ .get() ปลอดภัยกว่า', f: () => L.flyTo(4.7, 4, 8, 4.7, 1.4, 1.5) },
      ]);
      draw();
      L.quiz("menu = ['ข้าวปุ้น', 'ส้มตำ', 'ไก่ย่าง'] แล้ว menu[-1] คืออะไร", ["'ข้าวปุ้น'", "'ไก่ย่าง'", 'IndexError'], 1, 'index -1 คือตัวสุดท้ายของ list');
    },
  },

  7: {
    idea: 'ตารางข้อมูลค่าไฟของบ้าน 12 เดือนเป็นกล่องสามมิติ ลองคำสั่ง pandas: กรองแถว เรียงลำดับ จัดกลุ่มหาค่าเฉลี่ย แล้วดูตารางเปลี่ยนตาม',
    build(L) {
      L.cam(0, 9, 13, 0, 0, 0); L.floor(36);
      const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      const units = [180, 210, 290, 360, 340, 250, 220, 210, 205, 200, 170, 175];
      const season = ['หนาว', 'หนาว', 'ร้อน', 'ร้อน', 'ร้อน', 'ฝน', 'ฝน', 'ฝน', 'ฝน', 'ฝน', 'หนาว', 'หนาว'];
      const sc = { 'ร้อน': C.red, 'ฝน': C.blue, 'หนาว': C.sky };
      const rows = months.map((m, i) => { const h = units[i] / 80; const b = L.box({ w: 0.8, h, d: 0.8, color: sc[season[i]], x: -6 + i * 1.1, y: h / 2 }); b.lbl = L.label(`${m}<br>${units[i]}`, { parent: b, y: h / 2 + 0.45, cls: 'tick' }); b.i = i; return b; });
      const rC = L.readout('คำสั่ง pandas'), rO = L.readout('ผลลัพธ์');
      const avgG = L.group();
      async function reset() { L.clearGroup(avgG); await Promise.all(rows.map((b) => { b.visible = true; return L.moveTo(b, -6 + b.i * 1.1, b.position.y, 0, 400); })); }
      L.buttons([
        ['df.head()', async () => { await reset(); rows.forEach((b) => (b.visible = b.i < 5)); rC('df.head()'); rO('แสดง 5 แถวแรก'); }],
        ['กรอง units > 250', async () => { await reset(); rows.forEach((b) => { if (units[b.i] <= 250) L.moveTo(b, b.position.x, b.position.y, 3, 400); }); rC("df[df['units'] > 250]"); rO(`เหลือ ${units.filter((u) => u > 250).length} แถว: มี.ค. เม.ย. พ.ค.`, 'good'); }],
        ['เรียงมากไปน้อย', async () => { await reset(); const ord = [...rows].sort((a, b) => units[b.i] - units[a.i]); await Promise.all(ord.map((b, k) => L.moveTo(b, -6 + k * 1.1, b.position.y, 0, 600))); rC("df.sort_values('units', ascending=False)"); rO('เดือนที่ใช้ไฟมากสุด: เม.ย. 360 หน่วย', 'good'); }],
        ['groupby ฤดู → mean', async () => {
          await reset(); const gs = ['ร้อน', 'ฝน', 'หนาว'];
          await Promise.all(rows.map((b) => { const k = gs.indexOf(season[b.i]), n = rows.filter((x) => season[x.i] === season[b.i]).indexOf(b); return L.moveTo(b, -5 + k * 4 + (n % 3) * 0.9, b.position.y, -1 + Math.floor(n / 3) * 1, 600); }));
          const txt = gs.map((s) => { const v = units.filter((_, i) => season[i] === s); const m = v.reduce((a, b) => a + b, 0) / v.length; const h = m / 80; L.box({ w: 2.8, h: 0.06, d: 2.6, color: C.amber, x: -4.1 + gs.indexOf(s) * 4, y: h, z: -0.5, parent: avgG, opacity: 0.6 }); avgG.add(L.label(`${s} เฉลี่ย ${Math.round(m)}`, { x: -4.1 + gs.indexOf(s) * 4, y: h + 0.4, z: 1.2, cls: 'tag' })); return `${s} ${Math.round(m)}`; });
          rC("df.groupby('season')['units'].mean()"); rO(txt.join(' · '), 'good');
        }],
        ['รีเซ็ต', async () => { await reset(); rC('df'); rO('12 แถว × 3 คอลัมน์ (month, units, season)'); }],
      ]);
      rC('df = pd.read_csv("bill.csv")'); rO('12 แถว × 3 คอลัมน์ (month, units, season)');
      L.steps([
        { t: 'ไฟล์ CSV คือตารางข้อความที่คั่นด้วยจุลภาค pd.read_csv() อ่านเข้ามาเป็น DataFrame แต่ละกล่องคือ 1 แถว (1 เดือน) ความสูงคือหน่วยไฟ' },
        { t: 'กรองแถว: df[df["units"] > 250] เดือนที่ไม่ผ่านเงื่อนไขถอยออกไป เหลือหน้าร้อน 3 เดือน' },
        { t: 'เรียงลำดับ sort_values และจัดกลุ่ม groupby แล้วหาค่าเฉลี่ย mean() ใช้ตอบคำถาม "ฤดูไหนเปลืองไฟที่สุด"' },
        { t: 'ให้ Gemini ใน Colab ช่วยเขียนคำสั่ง pandas ได้ แต่อ่านทีละบรรทัดและตรวจผลกับข้อมูลจริงทุกครั้ง' },
      ]);
      L.quiz('คำสั่งใดเลือกเฉพาะแถวที่ units มากกว่า 250', ["df['units'] > 250", "df[df['units'] > 250]", "df.sort_values('units')"], 1, 'ต้องใส่เงื่อนไขไว้ใน df[ ] เพื่อกรองแถว ข้อแรกได้แค่ True/False ของแต่ละแถว');
    },
  },

  8: {
    idea: 'บั๊ก 3 แบบ: SyntaxError (เขียนผิดไวยากรณ์ รันไม่ได้เลย) RuntimeError (รันแล้วพังกลางทาง) LogicError (รันได้แต่คำตอบผิด) และตาข่าย try–except ที่รับ Error ไว้ไม่ให้โปรแกรมล้ม',
    build(L) {
      L.cam(0, 5, 14, 0, 2, 0); L.floor(30);
      const progs = {
        Syntax: [['age = int(input("อายุ: ")', 'SyntaxError: ลืมวงเล็บปิด ) — รันไม่ได้ตั้งแต่แรก'], 0],
        Runtime: [['age = int(input("อายุ: "))', 'ValueError: invalid literal for int() — ผู้ใช้พิมพ์ "สิบเจ็ด"'], 1],
        Logic: [['avg = a + b / 2', 'ไม่มี Error แต่ (60 + 80 / 2) = 100 ผิด! ต้องเป็น (a + b) / 2 = 70'], 2],
      };
      let kind = 'Runtime', net = false;
      const line = L.box({ w: 7, h: 0.6, d: 0.6, color: 0x22323f, y: 4.5 }); const lt = L.label('', { parent: line, cls: 'code' });
      const netM = L.plane({ w: 5, h: 3, color: C.green, rx: -Math.PI / 2, y: 1.2, opacity: 0.35 }); L.label('try: … except ValueError:', { x: 0, y: 1.4, z: 1.7, cls: 'code' });
      const rE = L.readout('ผลการรัน'), rH = L.readout('วิธีแก้');
      function show() { const [[c]] = progs[kind]; lt.set(c); netM.visible = net; rE('–'); rH('–'); }
      async function run() {
        show(); const g = L.gen; const [[, msg], t] = progs[kind];
        if (t === 0) { L.color(line, C.red); rE(msg, 'bad'); rH('อ่านเลขบรรทัด นับวงเล็บเปิด–ปิดให้ครบ'); await L.wait(700); L.color(line, 0x22323f); return; }
        if (t === 2) { L.color(line, C.amber); rE(msg, 'warn'); rH('ทดสอบด้วยค่าที่รู้คำตอบ แล้วเทียบ ใส่วงเล็บให้ถูก'); await L.wait(700); L.color(line, 0x22323f); return; }
        const err = L.sphere({ r: 0.35, color: C.red, y: 4, emissive: 0x551111 }); L.label('ValueError', { parent: err, y: 0.6, cls: 'tag' });
        if (net) { await L.moveTo(err, 0, 1.4, 0, 700); rE('จับ Error ได้: print("กรุณาพิมพ์ตัวเลข") แล้วถามใหม่', 'good'); rH('try–except ทำให้โปรแกรมไม่ล้ม'); }
        else { await L.moveTo(err, 0, 0.3, 0, 900); rE(msg + ' → โปรแกรมหยุดทำงาน', 'bad'); rH('ครอบด้วย try–except หรือตรวจข้อมูลก่อนแปลง'); }
        await L.wait(800); L.remove(err);
      }
      L.select('ชนิดบั๊ก', ['Syntax', 'Runtime', 'Logic'], (i) => { kind = ['Syntax', 'Runtime', 'Logic'][i]; show(); }, 1);
      L.toggle('ครอบด้วย try–except (ตาข่ายสีเขียว)', false, (v) => { net = v; show(); });
      L.buttons([['รันโปรแกรม', run]]);
      L.steps([
        { t: 'SyntaxError: เขียนผิดไวยากรณ์ เช่น ลืมวงเล็บ ลืม : หลัง if Python ไม่ยอมรันเลย อ่านเลขบรรทัดที่ Error บอก' },
        { t: 'Runtime: โค้ดถูก แต่ข้อมูลตอนรันทำให้พัง เช่น ผู้ใช้พิมพ์ "สิบเจ็ด" แทน 17 ลูกบอลแดงตกพื้น = โปรแกรมล้ม' },
        { t: 'เปิด try–except แล้วรันใหม่ ตาข่ายรับ Error ไว้ โปรแกรมบอกผู้ใช้ดี ๆ แล้วถามใหม่' },
        { t: 'Logic: อันตรายที่สุดเพราะไม่มี Error เลย แต่คำตอบผิด ต้องทดสอบด้วยค่าที่รู้คำตอบอยู่แล้ว ให้ AI ช่วยอธิบาย Error ได้ แต่ต้องเข้าใจและทดสอบเอง' },
      ]);
      show();
      L.quiz('avg = a + b / 2 เมื่อ a=60, b=80 ได้ 100 เป็นบั๊กชนิดใด', ['SyntaxError', 'Runtime Error', 'Logic Error'], 2, 'โปรแกรมรันได้ไม่มี Error แต่ลำดับการคำนวณผิด หารก่อนบวก');
    },
  },

  9: {
    idea: 'แตกโครงงาน "คิดค่าไฟบ้านเรา" เป็นฟังก์ชันย่อย แล้วเทียบการพัฒนา 2 แบบ: เขียนรวดเดียว 100 บรรทัดแล้วค่อยรัน กับ เขียนทีละฟังก์ชันแล้วทดสอบทันที',
    build(L) {
      L.cam(0, 7, 14, 0, 2, 0); L.floor(36);
      const root = L.box({ w: 3.4, h: 0.7, d: 1, color: C.amber, y: 5 }); L.label('โปรแกรมคิดค่าไฟบ้านเรา', { parent: root, y: 0.6, cls: 'tag' });
      const fns = [['รับข้อมูลเครื่องใช้ไฟฟ้า', 'input_devices()'], ['คำนวณหน่วยไฟ/เดือน', 'units_per_month(w, h)'], ['คิดค่าไฟ', 'calc_bill(units)'], ['สรุปอันดับ', 'report(data)'], ['บันทึก CSV', 'save_csv(data)']];
      const nodes = fns.map(([n, f], i) => { const x = -6 + i * 3; const b = L.box({ w: 2.4, h: 0.6, d: 0.9, color: C.slate, x, y: 2.6 }); L.label(`${n}<br><small>${f}</small>`, { parent: b, y: 0.65, cls: 'tag' }); L.line([[0, 4.65, 0], [x, 2.9, 0]], 0x9fb4c4, 0.7); return b; });
      const rB = L.readout('บั๊กที่เจอ'), rT = L.readout('เวลาหาบั๊ก');
      L.label('ผู้ใช้ · ข้อมูลเข้า · ข้อมูลออก · ฟังก์ชัน', { x: 0, y: 6.2, cls: 'axis' });
      async function bigBang() {
        const g = L.gen; nodes.forEach((n) => L.color(n, C.slate)); rB('–'); rT('–');
        for (const n of nodes) { L.color(n, C.violet); if (!(await L.wait(250))) return; }
        nodes.forEach((n, i) => { if (i === 1 || i === 3) L.color(n, C.red); });
        rB('3 บั๊กปนกัน ไม่รู้ว่าอยู่ฟังก์ชันไหน', 'bad'); rT('นาน (ต้องไล่ทั้งโปรแกรม)', 'bad');
      }
      async function inc() {
        const g = L.gen; nodes.forEach((n) => L.color(n, C.slate)); let found = 0;
        for (let i = 0; i < nodes.length; i++) {
          L.color(nodes[i], C.violet); if (!(await L.wait(400))) return;
          if (i === 1 || i === 3) { L.color(nodes[i], C.red); found++; rB(`เจอบั๊กใน ${fns[i][1]} ทันที`, 'warn'); if (!(await L.wait(500))) return; }
          L.color(nodes[i], C.green);
        }
        rB(`${found} บั๊ก แก้ครบระหว่างทาง`, 'good'); rT('สั้น (รู้ทันทีว่าพังตรงไหน)', 'good');
      }
      L.buttons([['เขียนรวดเดียวแล้วค่อยรัน', bigBang], ['เขียนทีละฟังก์ชัน + ทดสอบทันที', inc]]);
      L.steps([
        { t: 'ก่อนเปิด Colab ตอบ 4 ข้อ: ใครคือผู้ใช้ · รับข้อมูลอะไร · แสดงผลอะไร · มีฟังก์ชันอะไรบ้าง (Decomposition)' },
        { t: 'กด "เขียนรวดเดียว" ทุกฟังก์ชันเขียนเสร็จพร้อมกัน พอรันเจอบั๊กหลายจุดปนกัน หาไม่เจอว่าพังตรงไหน' },
        { t: 'กด "ทีละฟังก์ชัน" เขียนเสร็จหนึ่งฟังก์ชันทดสอบทันที เจอบั๊กก็รู้ทันทีว่าอยู่ในฟังก์ชันนั้น แก้แล้วค่อยไปต่อ' },
        { t: 'โครงงานที่ดี "เล็กแต่เสร็จ" ดีกว่า "ใหญ่แต่ไม่เสร็จ" ใช้ AI เป็นที่ปรึกษา และบันทึก AI Use Log ทุกครั้ง' },
      ]);
      L.quiz('ทำไมควรเขียนทีละฟังก์ชันแล้วทดสอบทันที', ['เพราะพิมพ์เร็วกว่า', 'เพราะเจอบั๊กเร็วและรู้ว่าพังตรงไหน', 'เพราะ Python บังคับ'], 1, 'ขอบเขตที่ต้องหาบั๊กแคบลงเหลือฟังก์ชันเดียว');
    },
  },

  10: {
    idea: 'ตารางกรณีทดสอบของฟังก์ชัน calc_bill: ค่าปกติ ค่าขอบ และค่าผิดรูปแบบ กดรันทดสอบแล้วดูช่องเขียว/แดง พร้อมแก้บั๊กให้ผ่านครบ',
    build(L) {
      L.cam(0, 11, 10, 0, 0, 0.8); L.floor(30);
      const tests = [['ปกติ', 'calc_bill(100)', '420.0'], ['ปกติ', 'calc_bill(250)', '1050.0'], ['ค่าขอบ', 'calc_bill(0)', '0.0'], ['ค่าขอบ', 'calc_bill(150, 0)', '0.0'], ['ผิดรูปแบบ', 'calc_bill(-5)', 'ValueError'], ['ผิดรูปแบบ', 'calc_bill("abc")', 'TypeError']];
      let fixedNeg = false, fixedType = false;
      const cells = tests.map(([k, c, e], i) => { const x = -4.5 + (i % 3) * 4.5, z = -1.4 + Math.floor(i / 3) * 3.4; const b = L.box({ w: 4, h: 0.4, d: 2.2, color: C.slate, x, y: 0.2, z }); L.label(`<b>${k}</b><br>${c}<br>คาดว่า: ${e}`, { parent: b, y: 0.6, cls: 'tag' }); return b; });
      const rP = L.readout('ผ่าน'), rC = L.readout('ความครอบคลุม');
      L.label('def calc_bill(units, rate=4.2):\n    if not isinstance(units, (int, float)):\n        raise TypeError(...)\n    if units < 0:\n        raise ValueError(...)\n    return round(units * rate, 2)', { x: -7.5, y: 1, z: -4.5, cls: 'code' });
      async function run() {
        let pass = 0;
        for (let i = 0; i < tests.length; i++) {
          L.color(cells[i], C.amber); if (!(await L.wait(300))) return;
          const ok = i < 4 || (i === 4 && fixedNeg) || (i === 5 && fixedType);
          L.color(cells[i], ok ? C.green : C.red); if (ok) pass++; rP(`${pass} / ${tests.length}`, pass === tests.length ? 'good' : 'warn');
        }
        rC(`ทดสอบครบ 3 กลุ่ม: ปกติ · ค่าขอบ · ผิดรูปแบบ`, 'good');
      }
      L.toggle('เพิ่มการตรวจ units < 0', false, (v) => (fixedNeg = v));
      L.toggle('เพิ่มการตรวจชนิดข้อมูล', false, (v) => (fixedType = v));
      L.buttons([['รันชุดทดสอบ', run]]);
      L.steps([
        { t: 'กรณีทดสอบมี 3 กลุ่ม: ค่าปกติ · ค่าขอบ (0 หรือรอยต่อของช่วง) · ค่าผิดรูปแบบ (ติดลบ ตัวอักษร) กดรันชุดทดสอบ' },
        { t: 'ค่าปกติกับค่าขอบผ่าน แต่ -5 กับ "abc" ไม่ผ่าน โปรแกรมคิดค่าไฟติดลบได้ ซึ่งผิดความจริง' },
        { t: 'เปิดตัวเลือกการตรวจทั้ง 2 ข้อแล้วรันใหม่ ผ่านครบ 6/6 ฟังก์ชันที่ดีต้องรับมือข้อมูลแปลก ๆ ได้' },
        { t: 'วันนำเสนอ: สาธิตโปรแกรมจริง อธิบายโค้ดของตัวเองได้ทุกบรรทัด แสดงผลทดสอบ และ AI Use Log ว่าใช้ AI ช่วยตรงไหน ตรวจ/แก้อะไรเอง' },
      ]);
      L.quiz('ค่าใดเป็น "ค่าขอบ" ของฟังก์ชันคิดค่าไฟ', ['calc_bill(100)', 'calc_bill(0)', 'calc_bill(250)'], 1, '0 คือขอบล่างของข้อมูลที่ยอมรับได้ บั๊กมักซ่อนอยู่ที่ขอบ');
    },
  },
};
