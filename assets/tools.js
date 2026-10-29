/* ห้องเรียนคอมพิวเตอร์ — เครื่องมือการเรียนรู้ทั้งหมด (ไม่มีการเก็บข้อมูลผู้ใช้) */
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const R = {}; // registry: name -> {title, render(body, arg)}
  const def = (name, title, render) => (R[name] = { title, render });
  const fmt = (n, d = 2) => (isFinite(n) ? Number(n).toLocaleString("th-TH", { maximumFractionDigits: d }) : "-");
  const $ = (root, sel) => root.querySelector(sel);
  const $$ = (root, sel) => [...root.querySelectorAll(sel)];

  function mount(host, spec) {
    const [name, arg] = spec.split(":");
    const key = R[spec] ? spec : name;
    const t = R[key];
    const wrap = document.createElement("div");
    wrap.className = "tool";
    if (!t) { wrap.innerHTML = `<div class="card">ไม่พบเครื่องมือ ${esc(spec)}</div>`; host.appendChild(wrap); return; }
    wrap.innerHTML = `<div class="card"><h3>🛠 ${esc(titleOf(spec))}</h3><div class="body"></div></div>`;
    host.appendChild(wrap);
    try { t.render($(wrap, ".body"), arg); } catch (e) { $(wrap, ".body").textContent = "เกิดข้อผิดพลาด: " + e.message; console.error(e); }
  }
  function titleOf(spec) {
    if (R[spec]) return R[spec].title;
    const [name, arg] = spec.split(":");
    const t = R[name];
    if (!t) return spec;
    const sub = SUBTITLES[spec];
    return sub ? `${t.title}: ${sub}` : t.title;
  }
  const SUBTITLES = {
    "quiz:software": "ประเภทซอฟต์แวร์", "quiz:cloud": "บริการคลาวด์", "quiz:datatype": "ชนิดของข้อมูล", "quiz:aisafety": "ใช้ AI อย่างรู้เท่าทัน",
    "order:dsprocess": "กระบวนการวิทยาการข้อมูล", "canvas:design": "แนวคิดเชิงออกแบบ", "canvas:dsproject": "วางแผนโครงงานวิทยาการข้อมูล",
    "rubric:dsproject": "โครงงานวิทยาการข้อมูล", "rubric:web": "โครงงานเว็บไซต์", "rubric:prog": "โครงงานโปรแกรม", "rubric:media": "โครงงานสื่อมัลติมีเดีย",
    "prompt:webbrief": "Website Brief", "prompt:debug": "Debug อย่างรู้เท่าทัน", "prompt:media": "สื่อมัลติมีเดีย", "prompt:image": "สร้างภาพ AI", "prompt:general": "ผู้ช่วยทั่วไป",
    "htmlEditor:html": "HTML", "htmlEditor:css": "CSS", "htmlEditor:js": "JavaScript",
    "python:intro": "เริ่มต้น", "python:vars": "ตัวแปรและตัวดำเนินการ", "python:if": "เงื่อนไข", "python:loop": "การวนซ้ำ", "python:func": "ฟังก์ชัน",
    "python:list": "List/Dict", "python:csv": "ไฟล์ CSV", "python:debug": "ล่าบั๊ก",
    "checklist:crap": "หลักการออกแบบ CRAP", "checklist:slide": "สไลด์ที่ดี",
  };

  // ------------------------------------------------------------ mini plot
  function plot(cv, o) {
    const ctx = cv.getContext("2d"), W = cv.width, H = cv.height, P = 40;
    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue("--ink").trim() || "#222", line = css.getPropertyValue("--line").trim() || "#ddd";
    ctx.clearRect(0, 0, W, H);
    ctx.font = "13px Sarabun, sans-serif";
    let xs = [], ys = [];
    (o.series || []).forEach(s => s.pts.forEach(p => { xs.push(p[0]); ys.push(p[1]); }));
    if (o.bars) { ys = ys.concat(o.bars.map(b => b[1]), [0]); }
    if (!xs.length && !o.bars) return;
    let x0 = o.xmin ?? Math.min(...xs), x1 = o.xmax ?? Math.max(...xs), y0 = o.ymin ?? Math.min(0, ...ys), y1 = o.ymax ?? Math.max(...ys);
    if (x0 === x1) { x0 -= 1; x1 += 1; } if (y0 === y1) { y0 -= 1; y1 += 1; }
    const padY = (y1 - y0) * 0.08; y1 += padY; if (y0 < 0 || !o.zeroY) y0 -= o.zeroY ? 0 : padY;
    const sx = x => P + (x - x0) / (x1 - x0) * (W - P - 15), sy = y => H - P + 10 - (y - y0) / (y1 - y0) * (H - P - 15);
    ctx.strokeStyle = line; ctx.fillStyle = ink; ctx.lineWidth = 1;
    for (let k = 0; k <= 4; k++) {
      const yv = y0 + (y1 - y0) * k / 4, y = sy(yv);
      ctx.beginPath(); ctx.moveTo(P, y); ctx.lineTo(W - 10, y); ctx.stroke();
      ctx.fillText(+yv.toFixed(2), 2, y + 4);
    }
    if (o.bars) {
      const n = o.bars.length, bw = (W - P - 20) / n;
      o.bars.forEach((b, i) => {
        ctx.fillStyle = o.colors ? o.colors[i % o.colors.length] : "#2563eb";
        const y = sy(b[1]), base = sy(Math.max(0, y0));
        ctx.fillRect(P + i * bw + bw * 0.15, y, bw * 0.7, base - y);
        ctx.fillStyle = ink; ctx.textAlign = "center";
        ctx.fillText(String(b[0]).slice(0, 10), P + i * bw + bw / 2, H - 12);
        ctx.fillText(+b[1].toFixed(2), P + i * bw + bw / 2, y - 4); ctx.textAlign = "left";
      });
      return;
    }
    for (let k = 0; k <= 4; k++) { const xv = x0 + (x1 - x0) * k / 4; ctx.fillStyle = ink; ctx.fillText(+xv.toFixed(2), sx(xv) - 8, H - 12); }
    (o.series || []).forEach(s => {
      ctx.strokeStyle = ctx.fillStyle = s.color || "#2563eb"; ctx.lineWidth = 2;
      if (s.line) { ctx.beginPath(); s.pts.forEach((p, i) => i ? ctx.lineTo(sx(p[0]), sy(p[1])) : ctx.moveTo(sx(p[0]), sy(p[1]))); ctx.stroke(); }
      else s.pts.forEach(p => { ctx.beginPath(); ctx.arc(sx(p[0]), sy(p[1]), s.r || 5, 0, 7); s.hollow ? ctx.stroke() : ctx.fill(); });
    });
    if (o.xlabel) { ctx.fillStyle = ink; ctx.textAlign = "right"; ctx.fillText(o.xlabel, W - 10, H - 26); ctx.textAlign = "left"; }
    return { sx, sy, x0, x1, y0, y1, P, W, H };
  }

  // ------------------------------------------------------------ CSV helpers
  function parseCSV(text) {
    const rows = []; let row = [], cur = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cur); rows.push(row); row = []; cur = ""; }
      else cur += c;
    }
    if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
    return rows.filter(r => r.some(x => x.trim() !== ""));
  }
  const toCSV = rows => rows.map(r => r.map(v => /[",\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : v).join(",")).join("\n");
  const isNum = v => v !== null && String(v).trim() !== "" && isFinite(Number(String(v).replace(/,/g, "")));
  const num = v => Number(String(v).replace(/,/g, ""));
  function tableHTML(rows, max = 30, mark) {
    const h = rows[0], b = rows.slice(1, max + 1);
    return `<div class="scroll"><table class="t"><tr>${h.map(x => `<th>${esc(x)}</th>`).join("")}</tr>${b.map((r, i) =>
      `<tr>${h.map((_, j) => `<td style="${mark ? mark(i, j, r[j]) : ""}">${esc(r[j] ?? "")}</td>`).join("")}</tr>`).join("")}</table></div>
      ${rows.length - 1 > max ? `<div class="hint">แสดง ${max} จาก ${rows.length - 1} แถว</div>` : ""}`;
  }
  function download(name, text, type = "text/plain") {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + text], { type }));
    a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const SAMPLE_CSV = `ชื่อ,เพศ,ห้อง,ส่วนสูง,น้ำหนัก,ชั่วโมงอ่านหนังสือ,คะแนนสอบ
ต้น,ช,5/1,172,60,2,68
ฝน,ญ,5/1,158,48,5,85
ปอ,ช,5/2,165,70,1,55
มิว,ญ,5/2,160,52,4,79
บีม,ช,5/1,175,68,3,72
แพรว,ญ,5/3,155,45,6,90
ภูมิ,ช,5/3,1.70,65,2,64
น้ำ,ญ,5/2,,50,3,70
ต้น,ช,5/1,172,60,2,68
เจ,ช,5/3,168,59,0,150
ใบเตย,ญ,5/1,162,49,5,88
ก้อง,ช,5/2,169,63,4,80`;

  // ============================================================ ม.2
  def("newsCheck", "ตรวจข่าวก่อนแชร์ (Fake News Checker)", (b) => {
    const qs = [
      ["หัวข้อข่าวใช้คำเร้าอารมณ์ เช่น ด่วน! แชร์ก่อนลบ! ช็อก!", 2],
      ["ไม่ระบุแหล่งที่มา ผู้เขียน หรือหน่วยงาน", 2],
      ["ไม่ระบุวันที่ หรือเป็นข่าวเก่านำมาแชร์ใหม่", 1],
      ["ลิงก์/ชื่อเว็บแปลก สะกดคล้ายเว็บข่าวจริง", 2],
      ["ค้นหาจากสำนักข่าวหลักหรือหน่วยงานทางการแล้วไม่พบ", 2],
      ["อ้างผลวิจัย/แพทย์ โดยไม่บอกชื่อหรือแหล่งอ้างอิง", 1],
      ["ภาพประกอบดูถูกตัดต่อ หรือค้นภาพย้อนหลังแล้วพบว่าเป็นเหตุการณ์อื่น", 2],
      ["ชักชวนให้โอนเงิน กรอกข้อมูลส่วนตัว หรือคลิกลิงก์", 3],
    ];
    b.innerHTML = `<p class="hint">ติ๊กข้อที่พบในข่าว แล้วดูระดับความเสี่ยง</p>
      ${qs.map((q, i) => `<label style="display:block;margin:4px 0"><input type="checkbox" data-w="${q[1]}"> ${q[0]}</label>`).join("")}
      <div class="out"><span class="big" id="r">0</span> คะแนนความเสี่ยง — <b id="v"></b></div>`;
    const upd = () => {
      const s = $$(b, "input").filter(x => x.checked).reduce((a, x) => a + +x.dataset.w, 0);
      $(b, "#r").textContent = s;
      const v = $(b, "#v");
      if (s >= 6) { v.textContent = "🚫 มีแนวโน้มเป็นข่าวปลอม ห้ามแชร์ แจ้ง/รายงาน"; v.className = "bad"; }
      else if (s >= 3) { v.textContent = "⚠️ น่าสงสัย ตรวจสอบเพิ่มก่อนเชื่อหรือแชร์"; v.className = "warn"; }
      else { v.textContent = "✅ ความเสี่ยงต่ำ แต่ควรตรวจสอบแหล่งที่มาเสมอ"; v.className = "ok"; }
    };
    $$(b, "input").forEach(x => x.onchange = upd); upd();
  });

  def("ccLicense", "เลือกสัญญาอนุญาต Creative Commons", (b) => {
    b.innerHTML = `<div class="row"><label>ชื่อผลงาน <input type="text" id="w" value="ภาพถ่ายภูกระดึงยามเช้า"></label>
      <label>เจ้าของ <input type="text" id="a" value="ด.ญ.ใจดี เรียนเก่ง"></label></div>
      <div class="row">อนุญาตให้ใช้เพื่อการค้า? <select id="nc"><option value="0">ได้</option><option value="1">ไม่ได้ (NC)</option></select>
      อนุญาตให้ดัดแปลง? <select id="d"><option value="y">ได้</option><option value="sa">ได้ แต่ต้องใช้สัญญาเดียวกัน (SA)</option><option value="nd">ไม่ได้ (ND)</option></select></div>
      <div class="out" id="o"></div>`;
    const upd = () => {
      let code = "BY";
      if ($(b, "#nc").value === "1") code += "-NC";
      const d = $(b, "#d").value; if (d === "sa") code += "-SA"; if (d === "nd") code += "-ND";
      const mean = { BY: "ใช้ ดัดแปลง และใช้เชิงพาณิชย์ได้ ต้องให้เครดิต", "BY-SA": "ใช้/ดัดแปลง/การค้าได้ ต้องให้เครดิต และงานดัดแปลงต้องใช้สัญญาเดียวกัน",
        "BY-ND": "ใช้และการค้าได้ ต้องให้เครดิต ห้ามดัดแปลง", "BY-NC": "ใช้และดัดแปลงได้ ต้องให้เครดิต ห้ามใช้เพื่อการค้า",
        "BY-NC-SA": "ใช้และดัดแปลงได้ ต้องให้เครดิต ห้ามการค้า งานดัดแปลงต้องใช้สัญญาเดียวกัน", "BY-NC-ND": "ใช้ได้ต้องให้เครดิต ห้ามการค้า ห้ามดัดแปลง (เข้มงวดที่สุด)" }[code];
      $(b, "#o").innerHTML = `<div class="big">CC ${code} 4.0</div><div>${mean}</div>
        <div class="prompt" style="margin-top:8px">“${esc($(b, "#w").value)}” โดย ${esc($(b, "#a").value)} เผยแพร่ภายใต้สัญญาอนุญาต CC ${code} 4.0 https://creativecommons.org/licenses/${code.toLowerCase()}/4.0/deed.th</div>`;
    };
    $$(b, "input,select").forEach(x => x.oninput = upd); upd();
  });

  def("gridAlgo", "นักวาดแบบแปลน — เขียนอัลกอริทึมบนตาราง", (b) => {
    const N = 10;
    b.innerHTML = `<p class="hint">เขียนคำสั่งทีละบรรทัด: <code>เดิน n</code> <code>ซ้าย</code> <code>ขวา</code> <code>ระบาย</code> <code>ทำซ้ำ n {</code> ... <code>}</code> — ตัวชี้เริ่มที่มุมซ้ายบน หันไปทางขวา</p>
      <div class="two"><div><textarea class="code" id="c">ระบาย
ทำซ้ำ 4 {
  ทำซ้ำ 3 {
    เดิน 1
    ระบาย
  }
  ขวา
}</textarea>
      <div class="row"><button id="run">▶ รัน</button><button class="ghost" id="step">ทีละขั้น</button><button class="ghost" id="clr">ล้าง</button>
      <select id="ex"><option value="">ตัวอย่าง…</option><option>สี่เหลี่ยม 4x4</option><option>บันได</option><option>ตัว L</option></select></div><div class="out" id="msg"></div></div>
      <div><div class="cellgrid" id="g" style="grid-template-columns:repeat(${N},30px)"></div></div></div>`;
    const g = $(b, "#g"); g.innerHTML = Array(N * N).fill("<div></div>").join("");
    const cells = [...g.children];
    const EX = { "สี่เหลี่ยม 4x4": $(b, "#c").value, "บันได": "ระบาย\nทำซ้ำ 5 {\n  เดิน 1\n  ระบาย\n  ขวา\n  เดิน 1\n  ระบาย\n  ซ้าย\n}", "ตัว L": "ขวา\nระบาย\nทำซ้ำ 5 {\n  เดิน 1\n  ระบาย\n}\nซ้าย\nทำซ้ำ 3 {\n  เดิน 1\n  ระบาย\n}" };
    $(b, "#ex").onchange = e => { if (EX[e.target.value]) $(b, "#c").value = EX[e.target.value]; };
    function compile(src) {
      const lines = src.split("\n").map(s => s.trim()).filter(Boolean); let i = 0;
      function block() {
        const out = [];
        while (i < lines.length) {
          const L = lines[i++];
          if (L === "}") return out;
          let m;
          if ((m = L.match(/^ทำซ้ำ\s+(\d+)\s*\{$/))) { const body = block(); for (let k = 0; k < +m[1]; k++) out.push(...body); }
          else if ((m = L.match(/^เดิน\s*(\d*)$/))) for (let k = 0; k < (+m[1] || 1); k++) out.push("F");
          else if (L === "ซ้าย") out.push("L"); else if (L === "ขวา") out.push("R"); else if (L === "ระบาย") out.push("P");
          else throw new Error("ไม่รู้จักคำสั่ง: " + L);
        }
        return out;
      }
      return block();
    }
    let st, prog, pc, timer;
    const reset = () => { cells.forEach(c => { c.style.background = ""; c.textContent = ""; }); st = { x: 0, y: 0, d: 0 }; pc = 0; draw(); };
    const draw = () => { cells.forEach(c => c.textContent = ""); const c = cells[st.y * N + st.x]; if (c) c.textContent = "▶▼◀▲"[st.d]; c && (c.style.fontSize = "16px", c.style.textAlign = "center"); };
    function exec1() {
      const op = prog[pc++];
      if (op === "F") { const dx = [1, 0, -1, 0][st.d], dy = [0, 1, 0, -1][st.d]; st.x += dx; st.y += dy;
        if (st.x < 0 || st.y < 0 || st.x >= N || st.y >= N) throw new Error("ออกนอกตาราง! ตรวจสอบอัลกอริทึม"); }
      if (op === "L") st.d = (st.d + 3) % 4; if (op === "R") st.d = (st.d + 1) % 4;
      if (op === "P") cells[st.y * N + st.x].style.background = "#2563eb";
      draw();
    }
    const msg = t => $(b, "#msg").textContent = t;
    $(b, "#run").onclick = () => { clearInterval(timer); reset(); try { prog = compile($(b, "#c").value); timer = setInterval(() => { try { if (pc >= prog.length) { clearInterval(timer); msg(`เสร็จ ✓ ใช้ ${prog.length} ขั้นตอนพื้นฐาน`); return; } exec1(); } catch (e) { clearInterval(timer); msg("⚠️ " + e.message); } }, 120); } catch (e) { msg("⚠️ " + e.message); } };
    $(b, "#step").onclick = () => { try { if (!prog || pc >= prog.length) { reset(); prog = compile($(b, "#c").value); } exec1(); msg(`ขั้นที่ ${pc}/${prog.length}`); } catch (e) { msg("⚠️ " + e.message); } };
    $(b, "#clr").onclick = () => { clearInterval(timer); prog = null; reset(); msg(""); };
    reset();
  });

  def("sortViz", "เข้าแถวตามความสูง (Bubble Sort Visualizer)", (b) => {
    b.innerHTML = `<div class="row"><label>จำนวนนักเรียน <input type="number" id="n" value="8" min="3" max="20"></label>
      <button id="new" class="ghost">สุ่มใหม่</button><button id="step" class="ghost">ทีละขั้น</button><button id="run">▶ เรียงอัตโนมัติ</button></div>
      <canvas id="cv" width="640" height="240"></canvas><div class="out" id="o"></div>`;
    let a = [], i = 0, j = 0, cmp = 0, sw = 0, timer, done = false;
    const cv = $(b, "#cv");
    function draw(hi = []) {
      const ctx = cv.getContext("2d"); ctx.clearRect(0, 0, cv.width, cv.height);
      const w = cv.width / a.length;
      a.forEach((h, k) => { ctx.fillStyle = hi.includes(k) ? "#f59e0b" : (done || k >= a.length - i ? "#16a34a" : "#2563eb");
        const y = cv.height - 20 - h; ctx.fillRect(k * w + 4, y, w - 8, h); ctx.fillStyle = "#888"; ctx.font = "12px Sarabun"; ctx.fillText(h + 50, k * w + 6, cv.height - 5); });
      $(b, "#o").textContent = `เปรียบเทียบ ${cmp} ครั้ง · สลับ ${sw} ครั้ง ${done ? "— เรียงเสร็จแล้ว ✓" : ""}`;
    }
    function init() { clearInterval(timer); const n = Math.max(3, Math.min(20, +$(b, "#n").value)); a = Array.from({ length: n }, () => 90 + Math.floor(Math.random() * 110)); i = j = cmp = sw = 0; done = false; draw(); }
    function step() {
      if (done) return;
      if (j >= a.length - 1 - i) { j = 0; i++; if (i >= a.length - 1) { done = true; draw(); return; } }
      cmp++; if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; sw++; }
      draw([j, j + 1]); j++;
    }
    $(b, "#new").onclick = init; $(b, "#step").onclick = step;
    $(b, "#run").onclick = () => { clearInterval(timer); timer = setInterval(() => { step(); if (done) clearInterval(timer); }, 200); };
    init();
  });

  def("funcMachine", "เครื่องจักรฟังก์ชัน (My Blocks)", (b) => {
    const F = {
      "คำนวณ BMI (น้ำหนัก, ส่วนสูง ซม.)": { args: ["น้ำหนัก (กก.)", "ส่วนสูง (ซม.)"], d: [55, 165], f: (w, h) => { const v = w / ((h / 100) ** 2); return `${v.toFixed(2)} → ${v < 18.5 ? "ผอม" : v < 23 ? "สมส่วน" : v < 25 ? "ท้วม" : "อ้วน"}`; },
        blocks: "define คำนวณ BMI (w) (h)\nset BMI to (w / ((h/100) * (h/100)))\nif BMI < 18.5 then say ผอม\nelse if BMI < 23 then say สมส่วน ..." },
      "พื้นที่สี่เหลี่ยม (กว้าง, ยาว)": { args: ["กว้าง", "ยาว"], d: [4, 6], f: (a, c) => a * c, blocks: "define พื้นที่ (กว้าง) (ยาว)\nsay (กว้าง * ยาว)" },
      "นักล่าแตงโม: แต้ม (แตงโม, ระเบิด)": { args: ["แตงโมที่เก็บได้", "ระเบิดที่โดน"], d: [12, 2], f: (m, x) => m * 10 - x * 25, blocks: "define คิดแต้ม (แตงโม) (ระเบิด)\nset แต้ม to ((แตงโม * 10) - (ระเบิด * 25))" },
      "แปลงองศาเซลเซียส → ฟาเรนไฮต์": { args: ["°C"], d: [37], f: c => (c * 9 / 5 + 32).toFixed(1) + " °F", blocks: "define C to F (c)\nsay ((c * 9 / 5) + 32)" },
    };
    b.innerHTML = `<div class="row"><select id="s">${Object.keys(F).map(k => `<option>${k}</option>`).join("")}</select></div>
      <div class="two"><div id="in"></div><div><div class="hint">บล็อก Scratch (เทียบเท่า)</div><pre class="out" id="bl"></pre></div></div>
      <div class="out big" id="o"></div>`;
    const upd = () => {
      const k = $(b, "#s").value, fn = F[k];
      $(b, "#in").innerHTML = fn.args.map((a, i) => `<div class="row"><label>${a} <input type="number" step="any" value="${fn.d[i]}"></label></div>`).join("") + `<div class="hint">📥 input → ⚙️ ฟังก์ชัน → 📤 output</div>`;
      $(b, "#bl").textContent = fn.blocks;
      const calc = () => { const v = $$(b, "#in input").map(x => +x.value); $(b, "#o").textContent = "ผลลัพธ์ = " + fn.f(...v); };
      $$(b, "#in input").forEach(x => x.oninput = calc); calc();
    };
    $(b, "#s").onchange = upd; upd();
  });

  def("boolLogic", "ตัวดำเนินการบูลีน AND OR NOT", (b) => {
    b.innerHTML = `<div class="two"><div>
      <h3>ทดลองค่าความจริง</h3>
      <div class="row">A <select id="a"><option value="1">จริง</option><option value="0">เท็จ</option></select>
      <select id="op"><option>AND</option><option>OR</option></select>
      B <select id="b"><option value="1">จริง</option><option value="0">เท็จ</option></select>
      <label><input type="checkbox" id="not"> NOT ผลลัพธ์</label></div><div class="out big" id="o"></div>
      <div id="tt"></div></div>
      <div><h3>สถานการณ์: ทุนการศึกษา</h3>
      <div class="row"><label>เกรดเฉลี่ย <input type="number" id="g" value="3.25" step="0.01"></label></div>
      <div class="row"><label>รายได้ครอบครัว/ปี <input type="number" id="m" value="85000"></label></div>
      <div class="row"><label><input type="checkbox" id="c" checked> ไม่เคยถูกตัดคะแนนความประพฤติ</label></div>
      <pre class="out">ได้ทุน = (เกรด ≥ 3.00) AND (รายได้ &lt; 100000) AND (NOT ถูกตัดคะแนน)</pre>
      <div class="out" id="s"></div></div></div>`;
    const T = v => v ? '<span class="ok">จริง</span>' : '<span class="bad">เท็จ</span>';
    const upd = () => {
      const A = $(b, "#a").value === "1", B = $(b, "#b").value === "1", op = $(b, "#op").value, n = $(b, "#not").checked;
      let r = op === "AND" ? A && B : A || B; if (n) r = !r;
      $(b, "#o").innerHTML = `${n ? "NOT (" : ""}${A ? "จริง" : "เท็จ"} ${op} ${B ? "จริง" : "เท็จ"}${n ? ")" : ""} = ${T(r)}`;
      $(b, "#tt").innerHTML = `<table class="t"><tr><th>A</th><th>B</th><th>A ${op} B</th></tr>${[[1, 1], [1, 0], [0, 1], [0, 0]].map(([x, y]) =>
        `<tr><td>${T(x)}</td><td>${T(y)}</td><td>${T(op === "AND" ? x && y : x || y)}</td></tr>`).join("")}</table>`;
      const g = +$(b, "#g").value >= 3, m = +$(b, "#m").value < 100000, c = $(b, "#c").checked;
      $(b, "#s").innerHTML = `เกรด ≥ 3.00: ${T(g)} · รายได้ &lt; 100,000: ${T(m)} · NOT ถูกตัดคะแนน: ${T(c)}<br><b>ผล: ${g && m && c ? "🎉 ได้รับทุน" : "❌ ไม่ได้รับทุน"}</b>`;
    };
    $$(b, "input,select").forEach(x => x.oninput = upd); upd();
  });

  def("turtlePoly", "บล็อกวาดรูปที่มีพารามิเตอร์", (b) => {
    b.innerHTML = `<div class="row"><label>จำนวนด้าน (n) <input type="number" id="n" value="6" min="3" max="36"></label>
      <label>ความยาว (size) <input type="number" id="s" value="80" min="10" max="200"></label>
      <label>ทำซ้ำหมุน <input type="number" id="r" value="1" min="1" max="36"></label></div>
      <div class="two"><canvas id="cv" width="360" height="360"></canvas>
      <div><div class="hint">บล็อก Scratch</div><pre class="out" id="bl"></pre><div class="out" id="o"></div></div></div>`;
    const upd = () => {
      const n = Math.max(3, +$(b, "#n").value), s = +$(b, "#s").value, r = Math.max(1, +$(b, "#r").value);
      const cv = $(b, "#cv"), ctx = cv.getContext("2d"); ctx.clearRect(0, 0, 360, 360);
      ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2;
      for (let k = 0; k < r; k++) {
        let x = 180, y = 180, ang = k * 360 / r * Math.PI / 180;
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let i = 0; i < n; i++) { x += s * Math.cos(ang); y += s * Math.sin(ang); ctx.lineTo(x, y); ang += 2 * Math.PI / n; }
        ctx.stroke();
      }
      $(b, "#bl").textContent = `define วาดรูป (n) (size)\nrepeat (n)\n  move (size) steps\n  turn ↻ (360 / n) degrees\nend\n\nwhen green flag clicked\npen down\n${r > 1 ? `repeat (${r})\n  วาดรูป (${n}) (${s})\n  turn ↻ (${(360 / r).toFixed(1)}) degrees\nend` : `วาดรูป (${n}) (${s})`}`;
      $(b, "#o").textContent = `มุมที่หมุนแต่ละครั้ง = 360 ÷ ${n} = ${(360 / n).toFixed(2)} องศา`;
    };
    $$(b, "input").forEach(x => x.oninput = upd); upd();
  });

  def("fare", "โปรแกรมคำนวณค่าโดยสาร", (b) => {
    b.innerHTML = `<div class="row"><label>ระยะทาง (กม.) <input type="number" id="d" value="12.5" step="0.1"></label>
      <label>ค่าแรกเข้า (0–1 กม.) <input type="number" id="f" value="35"></label>
      <label>กม. 1–10 (บาท/กม.) <input type="number" id="r1" value="6.5" step="0.5"></label>
      <label>เกิน 10 กม. (บาท/กม.) <input type="number" id="r2" value="7" step="0.5"></label></div>
      <div class="two"><div class="out" id="o"></div><pre class="out" id="alg"></pre></div>`;
    const upd = () => {
      const d = +$(b, "#d").value, f = +$(b, "#f").value, r1 = +$(b, "#r1").value, r2 = +$(b, "#r2").value;
      let cost = f, steps = [`ค่าแรกเข้า ${f} บาท`];
      if (d > 1) { const k = Math.min(d, 10) - 1; cost += k * r1; steps.push(`ช่วง 1–10 กม.: ${fmt(k)} × ${r1} = ${fmt(k * r1)} บาท`); }
      if (d > 10) { const k = d - 10; cost += k * r2; steps.push(`เกิน 10 กม.: ${fmt(k)} × ${r2} = ${fmt(k * r2)} บาท`); }
      $(b, "#o").innerHTML = steps.join("<br>") + `<div class="big">รวม ${fmt(Math.ceil(cost), 0)} บาท</div><div class="hint">(ปัดเศษขึ้น)</div>`;
      $(b, "#alg").textContent = `ask ระยะทาง → d\nset ค่าโดยสาร to ${f}\nif d > 1 then\n  change ค่าโดยสาร by ((min(d,10) - 1) * ${r1})\nif d > 10 then\n  change ค่าโดยสาร by ((d - 10) * ${r2})\nsay ค่าโดยสาร`;
    };
    $$(b, "input").forEach(x => x.oninput = upd); upd();
  });

  def("computerParts", "องค์ประกอบและหลักการทำงานของคอมพิวเตอร์", (b) => {
    const P = {
      "⌨️ หน่วยรับเข้า (Input)": "รับข้อมูล/คำสั่งเข้าสู่ระบบ เช่น แป้นพิมพ์ เมาส์ ไมโครโฟน กล้อง สแกนเนอร์ จอสัมผัส",
      "🧠 หน่วยประมวลผลกลาง (CPU)": "คำนวณและควบคุมการทำงาน ประกอบด้วยหน่วยควบคุม (CU) และหน่วยคำนวณและตรรกะ (ALU) ความเร็ววัดเป็น GHz จำนวนคอร์ยิ่งมากทำงานพร้อมกันได้มาก",
      "⚡ หน่วยความจำหลัก (RAM)": "เก็บข้อมูลและโปรแกรมที่กำลังทำงานชั่วคราว ข้อมูลหายเมื่อปิดเครื่อง ยิ่งมากเปิดหลายโปรแกรมได้ลื่น (งานตัดต่อวิดีโอควร ≥ 8–16 GB)",
      "💾 หน่วยเก็บข้อมูล (Storage)": "เก็บข้อมูลถาวร เช่น SSD (เร็ว) HDD (จุมาก ราคาถูก) แฟลชไดรฟ์ คลาวด์",
      "🖥️ หน่วยแสดงผล (Output)": "แสดงผลลัพธ์ เช่น จอภาพ ลำโพง เครื่องพิมพ์ โปรเจกเตอร์",
      "🎮 การ์ดจอ (GPU)": "ประมวลผลภาพกราฟิก วิดีโอ เกม และงาน AI ได้เร็ว",
      "👩‍💻 บุคลากร / 📄 ซอฟต์แวร์": "ระบบคอมพิวเตอร์ต้องมีฮาร์ดแวร์ ซอฟต์แวร์ และบุคลากร (ผู้ใช้ โปรแกรมเมอร์ ผู้ดูแลระบบ) ทำงานร่วมกัน",
    };
    b.innerHTML = `<pre class="out" style="text-align:center">Input ➜ [ CPU ⇄ RAM ] ➜ Output\n            ⇵\n         Storage</pre>
      <div class="chips">${Object.keys(P).map(k => `<button class="chip">${k}</button>`).join("")}</div><div class="out" id="o">คลิกที่ส่วนประกอบเพื่อดูคำอธิบาย</div>
      <h3>จับคู่: อุปกรณ์นี้คือหน่วยใด?</h3><div id="q"></div>`;
    $$(b, ".chip").forEach(c => c.onclick = () => { $$(b, ".chip").forEach(x => x.classList.remove("on")); c.classList.add("on"); $(b, "#o").textContent = P[c.textContent]; });
    quizInto($(b, "#q"), [
      ["ไมโครโฟน", ["รับเข้า", "ประมวลผล", "แสดงผล", "เก็บข้อมูล"], 0],
      ["SSD 512 GB", ["รับเข้า", "ประมวลผล", "แสดงผล", "เก็บข้อมูล"], 3],
      ["เครื่องพิมพ์", ["รับเข้า", "ประมวลผล", "แสดงผล", "เก็บข้อมูล"], 2],
      ["Intel Core i5 / Ryzen 5", ["รับเข้า", "ประมวลผล", "แสดงผล", "เก็บข้อมูล"], 1],
      ["ข้อมูลใน RAM เมื่อปิดเครื่องจะ…", ["หายไป", "ยังอยู่", "ย้ายไปคลาวด์", "ถูกพิมพ์ออก"], 0],
    ]);
  });

  def("unitConv", "แปลงหน่วยข้อมูล bit / Byte / KB / MB / GB / TB", (b) => {
    const U = ["bit", "Byte", "KB", "MB", "GB", "TB"];
    b.innerHTML = `<div class="row"><input type="number" id="v" value="1" step="any"><select id="u">${U.map((u, i) => `<option ${i === 4 ? "selected" : ""}>${u}</option>`).join("")}</select>
      <label><input type="checkbox" id="si"> ใช้ฐาน 1000 (แบบผู้ผลิตฮาร์ดดิสก์)</label></div><div class="out" id="o"></div>
      <div class="hint">8 bit = 1 Byte · 1 KB = 1024 Byte (ฐาน 2) · ฮาร์ดดิสก์ 1 TB โฆษณา = 10¹² Byte ≈ 931 GB ในวินโดวส์</div>`;
    const upd = () => {
      const k = $(b, "#si").checked ? 1000 : 1024, v = +$(b, "#v").value, ui = U.indexOf($(b, "#u").value);
      const bits = ui === 0 ? v : v * 8 * Math.pow(k, ui - 1);
      $(b, "#o").innerHTML = `<table class="t">${U.map((u, i) => `<tr><td>${u}</td><td><b>${fmt(i === 0 ? bits : bits / 8 / Math.pow(k, i - 1), 6)}</b></td></tr>`).join("")}</table>`;
    };
    $$(b, "input,select").forEach(x => x.oninput = upd); upd();
  });

  def("transferCalc", "คำนวณเวลาในการรับส่งข้อมูล", (b) => {
    b.innerHTML = `<div class="row"><label>ขนาดไฟล์ <input type="number" id="s" value="100" step="any"></label><select id="su"><option>MB</option><option>GB</option><option>KB</option></select>
      <label>ความเร็ว <input type="number" id="r" value="50" step="any"></label><select id="ru"><option>Mbps</option><option>Gbps</option><option>Kbps</option></select></div>
      <div class="out" id="o"></div><div class="hint">ไฟล์วัดเป็น Byte (B ใหญ่) ความเร็วเน็ตวัดเป็น bit/วินาที (b เล็ก) → ต้องคูณ 8 ก่อนหาร</div>`;
    const upd = () => {
      const m = { KB: 1 / 1000, MB: 1, GB: 1000 }, r = { Kbps: 1 / 1000, Mbps: 1, Gbps: 1000 };
      const megabits = +$(b, "#s").value * m[$(b, "#su").value] * 8, sp = +$(b, "#r").value * r[$(b, "#ru").value];
      const t = megabits / sp;
      $(b, "#o").innerHTML = `${fmt(+$(b, "#s").value)} ${$(b, "#su").value} × 8 = ${fmt(megabits)} Mb ÷ ${fmt(sp)} Mbps = <span class="big">${t < 60 ? fmt(t) + " วินาที" : t < 3600 ? fmt(t / 60) + " นาที" : fmt(t / 3600) + " ชั่วโมง"}</span>`;
    };
    $$(b, "input,select").forEach(x => x.oninput = upd); upd();
  });

  // ------------------------------------------------------------ quiz engine
  function quizInto(box, qs) {
    let score = 0, answered = 0;
    box.innerHTML = qs.map((q, i) => `<div class="q" data-i="${i}"><b>${i + 1}. ${esc(q[0])}</b><div class="chips" style="margin-top:6px">${q[1].map((c, j) => `<button class="chip" data-j="${j}">${esc(c)}</button>`).join("")}</div><div class="fb hint"></div></div>`).join("") + `<div class="out" id="sc">คะแนน 0/${qs.length}</div>`;
    $$(box, ".q").forEach(qd => {
      const q = qs[+qd.dataset.i];
      $$(qd, ".chip").forEach(c => c.onclick = () => {
        if (qd.dataset.done) return; qd.dataset.done = 1; answered++;
        const ok = +c.dataset.j === q[2]; if (ok) score++;
        c.style.background = ok ? "var(--ok)" : "var(--bad)"; c.style.color = "#fff";
        $$(qd, ".chip")[q[2]].style.outline = "2px solid var(--ok)";
        $(qd, ".fb").innerHTML = (ok ? "✅ ถูกต้อง " : "❌ ยังไม่ถูก ") + (q[3] ? esc(q[3]) : "");
        $(box, "#sc").textContent = `คะแนน ${score}/${qs.length}` + (answered === qs.length ? (score === qs.length ? " — ยอดเยี่ยม! 🎉" : " — ลองทบทวนข้อที่ผิด") : "");
      });
    });
  }
  const QUIZ = {
    software: [
      ["Windows 11 เป็นซอฟต์แวร์ประเภทใด", ["ระบบปฏิบัติการ", "อรรถประโยชน์", "ประยุกต์"], 0],
      ["โปรแกรมสแกนไวรัส / บีบอัดไฟล์", ["ระบบปฏิบัติการ", "อรรถประโยชน์", "ประยุกต์"], 1, "เป็นซอฟต์แวร์ระบบ ช่วยดูแลเครื่อง"],
      ["Canva / Microsoft Word", ["ระบบปฏิบัติการ", "อรรถประโยชน์", "ประยุกต์"], 2],
      ["Android บนมือถือ", ["ระบบปฏิบัติการ", "อรรถประโยชน์", "ประยุกต์"], 0],
      ["LibreOffice ใช้ฟรี แก้ไขซอร์สโค้ดได้ เรียกว่า", ["ซอฟต์แวร์เสรี/โอเพนซอร์ส", "แชร์แวร์", "ซอฟต์แวร์ลิขสิทธิ์"], 0],
      ["ดาวน์โหลดโปรแกรมเถื่อนจากเว็บที่ไม่ใช่ทางการ เสี่ยงอะไร", ["มัลแวร์และละเมิดลิขสิทธิ์", "เครื่องเร็วขึ้น", "ไม่มีผลใด ๆ"], 0],
    ],
    cloud: [
      ["Google Docs ใช้พิมพ์งานกลุ่มพร้อมกัน เป็นบริการแบบใด", ["SaaS", "PaaS", "IaaS"], 0, "Software as a Service ใช้ซอฟต์แวร์ผ่านเว็บ"],
      ["เช่าเครื่องเซิร์ฟเวอร์เสมือนเพื่อติดตั้งระบบเอง", ["SaaS", "PaaS", "IaaS"], 2],
      ["Google Colab ให้พื้นที่เขียนและรันโปรแกรม", ["SaaS", "PaaS", "IaaS"], 1],
      ["ข้อดีของคลาวด์", ["เข้าถึงได้ทุกที่ทุกอุปกรณ์", "ไม่ต้องใช้อินเทอร์เน็ต", "ปลอดภัย 100%"], 0],
      ["ข้อควรระวังเมื่อแชร์ลิงก์ Google Drive", ["ตั้งสิทธิ์ให้เฉพาะคนที่ต้องการ", "ตั้งเป็นทุกคนแก้ไขได้เสมอ", "ใส่รหัสผ่านไว้ในชื่อไฟล์"], 0],
    ],
    datatype: [
      ["ส่วนสูงของนักเรียน (ซม.)", ["เชิงปริมาณ", "เชิงคุณภาพ"], 0],
      ["สีที่ชอบ", ["เชิงปริมาณ", "เชิงคุณภาพ"], 1],
      ["ระดับความพึงพอใจ มาก/ปานกลาง/น้อย", ["เชิงปริมาณ", "เชิงคุณภาพ (เรียงลำดับได้)"], 1],
      ["จำนวนชั่วโมงที่เล่นเกมต่อวัน", ["เชิงปริมาณ", "เชิงคุณภาพ"], 0],
      ["ข้อมูลที่นักเรียนเก็บเองด้วยแบบสอบถาม", ["ปฐมภูมิ", "ทุติยภูมิ"], 0],
      ["ข้อมูลจาก data.go.th", ["ปฐมภูมิ", "ทุติยภูมิ"], 1],
    ],
    aisafety: [
      ["AI ตอบชื่อบุคคลสำคัญของจังหวัดเลยผิด แต่ดูมั่นใจ เรียกว่า", ["Hallucination", "Deepfake", "Phishing"], 0],
      ["คลิปคนดังชวนลงทุนแต่ปากไม่ตรงเสียง น่าจะเป็น", ["Deepfake", "ข่าวจริง", "โฆษณาทางการ"], 0],
      ["ข้อมูลใดไม่ควรพิมพ์ลงใน AI", ["เลขบัตรประชาชนและรหัสผ่าน", "หัวข้อรายงาน", "คำถามคณิตศาสตร์"], 0],
      ["ใช้ภาพที่ AI สร้างในรายงาน ควรทำอย่างไร", ["ระบุว่าสร้างด้วย AI", "บอกว่าถ่ายเอง", "ไม่ต้องบอก"], 0],
      ["ให้ AI เขียนรายงานทั้งเล่มแล้วส่งครูเลย", ["ไม่เหมาะสม ควรใช้ AI ช่วยคิด/ตรวจ แล้วเขียนเอง", "เหมาะสม", "ทำได้ถ้าไม่มีใครรู้"], 0],
      ["ตรวจสอบข้อมูลจาก AI ได้อย่างไร", ["เทียบกับแหล่งข้อมูลที่น่าเชื่อถือหลายแหล่ง", "ถาม AI ซ้ำจนกว่าจะเชื่อ", "เชื่อเลยเพราะ AI ฉลาด"], 0],
    ],
  };
  def("quiz", "แบบทดสอบ", (b, arg) => quizInto(b, QUIZ[arg] || []));

  // ------------------------------------------------------------ order game
  const ORDER = { dsprocess: ["ตั้งคำถาม / กำหนดปัญหา", "เก็บรวบรวมข้อมูล", "สำรวจและทำความสะอาดข้อมูล", "วิเคราะห์และสร้างแบบจำลอง", "สื่อสารและนำเสนอผลลัพธ์"] };
  def("order", "เรียงลำดับขั้นตอน", (b, arg) => {
    const ans = ORDER[arg]; let cur = [...ans].sort(() => Math.random() - .5);
    b.innerHTML = `<p class="hint">ใช้ปุ่ม ▲▼ เรียงขั้นตอนให้ถูกต้อง แล้วกดตรวจคำตอบ</p><div id="l"></div><button id="ck">ตรวจคำตอบ</button><div class="out" id="o"></div>`;
    const draw = () => {
      $(b, "#l").innerHTML = cur.map((x, i) => `<div class="drag row" style="justify-content:space-between"><span>${i + 1}. ${esc(x)}</span><span><button class="sm ghost" data-u="${i}">▲</button><button class="sm ghost" data-d="${i}">▼</button></span></div>`).join("");
      $$(b, "[data-u]").forEach(x => x.onclick = () => { const i = +x.dataset.u; if (i > 0) { [cur[i - 1], cur[i]] = [cur[i], cur[i - 1]]; draw(); } });
      $$(b, "[data-d]").forEach(x => x.onclick = () => { const i = +x.dataset.d; if (i < cur.length - 1) { [cur[i + 1], cur[i]] = [cur[i], cur[i + 1]]; draw(); } });
    };
    $(b, "#ck").onclick = () => { const ok = cur.filter((x, i) => x === ans[i]).length; $(b, "#o").innerHTML = ok === ans.length ? '<b class="ok">ถูกต้องทั้งหมด 🎉</b>' : `ถูกตำแหน่ง ${ok}/${ans.length} — ลองอีกครั้ง`; };
    draw();
  });

  // ------------------------------------------------------------ canvas / worksheet
  const CANVAS = {
    design: ["1. เข้าใจ (Empathize): ผู้ใช้คือใคร เขาเจอปัญหาอะไร", "2. กำหนดปัญหา (Define): “…(ผู้ใช้)… ต้องการ …(สิ่งที่ต้องการ)… เพราะ …(เหตุผล)…”", "3. สร้างแนวคิด (Ideate): ระดมไอเดียอย่างน้อย 5 ไอเดีย", "4. สร้างต้นแบบ (Prototype): ร่างสิ่งที่จะทำ / ข้อมูลที่ต้องใช้", "5. ทดสอบ (Test): ทดสอบกับใคร วัดผลอย่างไร"],
    dsproject: ["ชื่อโครงงาน", "สมาชิกกลุ่ม", "ปัญหา/คำถามที่ต้องการตอบ", "ข้อมูลที่ต้องใช้ และวิธีเก็บ (แบบสอบถาม/สังเกต/ข้อมูลเปิด)", "วิธีวิเคราะห์ (ค่าเฉลี่ย/สหสัมพันธ์/ถดถอย/K-NN)", "รูปแบบการนำเสนอ (แผนภาพ/อินโฟกราฟิก/คลิป)", "ประโยชน์ต่อโรงเรียน/ชุมชน", "ตารางเวลา 4 สัปดาห์"],
  };
  def("canvas", "แผ่นงานออนไลน์", (b, arg) => {
    const f = CANVAS[arg];
    b.innerHTML = f.map((x, i) => `<div style="margin:8px 0"><b>${esc(x)}</b><textarea data-i="${i}" style="min-height:70px"></textarea></div>`).join("") +
      `<div class="row noprint"><button id="dl">⬇ ดาวน์โหลดเป็นไฟล์ข้อความ</button><button class="ghost" onclick="print()">🖨 พิมพ์</button></div>
      <div class="hint">ข้อมูลไม่ถูกบันทึกในเว็บ — ดาวน์โหลดหรือคัดลอกไปวางใน Google Docs/Classroom</div>`;
    $(b, "#dl").onclick = () => download(`worksheet-${arg}.txt`, f.map((x, i) => `${x}\n${$(b, `[data-i="${i}"]`).value}\n`).join("\n"));
  });

  // ============================================================ ม.5 data science
  function csvInput(b, onData, sample = SAMPLE_CSV) {
    const wrap = document.createElement("div");
    wrap.innerHTML = `<div class="hint">วางข้อมูล CSV (คัดลอกจาก Google Sheets ได้) หรือเลือกไฟล์ .csv</div>
      <textarea class="code" style="min-height:140px">${esc(sample)}</textarea>
      <div class="row"><input type="file" accept=".csv,text/csv"><button>ใช้ข้อมูลนี้</button></div>`;
    b.appendChild(wrap);
    const ta = $(wrap, "textarea");
    const go = () => { const t = ta.value.includes("\t") ? ta.value.replace(/\t/g, ",") : ta.value; onData(parseCSV(t)); };
    $(wrap, "button").onclick = go;
    $(wrap, "input[type=file]").onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { ta.value = t.replace(/^﻿/, ""); go(); }); };
    go();
  }

  def("csvClean", "ทำความสะอาดข้อมูล (Data Cleaning)", (b) => {
    const res = document.createElement("div");
    csvInput(b, rows => {
      const h = rows[0], body = rows.slice(1);
      const seen = new Set(), dup = new Set(), miss = [];
      body.forEach((r, i) => { const k = r.join("|"); if (seen.has(k)) dup.add(i); seen.add(k); r.forEach((v, j) => { if (String(v ?? "").trim() === "") miss.push([i, j]); }); });
      const numCols = h.map((_, j) => body.filter(r => isNum(r[j])).length >= body.length * 0.6);
      const outl = [];
      h.forEach((_, j) => { if (!numCols[j]) return; const v = body.map(r => r[j]).filter(isNum).map(num); const m = mean(v), s = sd(v); body.forEach((r, i) => { if (isNum(r[j]) && s > 0 && Math.abs(num(r[j]) - m) > 2 * s) outl.push([i, j]); }); });
      res.innerHTML = `<div class="out">พบ <b>${body.length}</b> แถว · ค่าว่าง <b class="warn">${miss.length}</b> ช่อง · แถวซ้ำ <b class="bad">${dup.size}</b> แถว · ค่าผิดปกติ (เกิน ±2SD) <b class="bad">${outl.length}</b> ช่อง</div>
        <div class="hint">🟨 ค่าว่าง · 🟥 ค่าผิดปกติ · ขีดฆ่า = แถวซ้ำ</div>
        ${tableHTML(rows, 50, (i, j) => (miss.some(m => m[0] === i && m[1] === j) ? "background:#fde68a;" : "") + (outl.some(m => m[0] === i && m[1] === j) ? "background:#fecaca;" : "") + (dup.has(i) ? "text-decoration:line-through;opacity:.6" : ""))}
        <div class="row"><button id="fix">🧹 ลบแถวซ้ำ + ลบแถวที่มีค่าว่าง + ดาวน์โหลด CSV</button></div>
        <div class="hint">ค่าผิดปกติ ควรตรวจสอบกับแหล่งข้อมูลก่อนตัดสินใจลบหรือแก้ (เช่น 1.70 อาจหมายถึง 170 ซม.)</div>`;
      res.querySelector("#fix").onclick = () => { const clean = [h, ...body.filter((r, i) => !dup.has(i) && !miss.some(m => m[0] === i))]; download("clean.csv", toCSV(clean), "text/csv"); };
    });
    b.appendChild(res);
  });

  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  const sd = a => { const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1 || 1)); };
  const median = a => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
  const quant = (a, q) => { const s = [...a].sort((x, y) => x - y), p = (s.length - 1) * q, lo = Math.floor(p); return s[lo] + (s[Math.ceil(p)] - s[lo]) * (p - lo); };
  const mode = a => { const c = {}; a.forEach(x => c[x] = (c[x] || 0) + 1); const mx = Math.max(...Object.values(c)); return mx === 1 ? "ไม่มี" : Object.keys(c).filter(k => c[k] === mx).join(", "); };
  const corr = (x, y) => { const mx = mean(x), my = mean(y); let a = 0, b = 0, c = 0; x.forEach((v, i) => { a += (v - mx) * (y[i] - my); b += (v - mx) ** 2; c += (y[i] - my) ** 2; }); return a / Math.sqrt(b * c); };

  def("csvExplore", "สำรวจข้อมูล (Data Exploration)", (b) => {
    const res = document.createElement("div");
    csvInput(b, rows => {
      const h = rows[0], body = rows.slice(1);
      const info = h.map((c, j) => { const col = body.map(r => r[j] ?? ""); const nn = col.filter(v => String(v).trim() !== ""); const nums = nn.filter(isNum);
        return { c, n: nn.length, miss: col.length - nn.length, uniq: new Set(nn).size, type: nums.length >= nn.length * 0.8 && nn.length ? "ตัวเลข" : "ข้อความ/หมวดหมู่", nums: nums.map(num) }; });
      res.innerHTML = `<div class="scroll"><table class="t"><tr><th>คอลัมน์</th><th>ชนิด</th><th>มีค่า</th><th>ว่าง</th><th>ค่าไม่ซ้ำ</th><th>ต่ำสุด</th><th>สูงสุด</th></tr>
        ${info.map(i => `<tr><td>${esc(i.c)}</td><td>${i.type}</td><td>${i.n}</td><td class="${i.miss ? "warn" : ""}">${i.miss}</td><td>${i.uniq}</td><td>${i.type === "ตัวเลข" ? fmt(Math.min(...i.nums)) : "-"}</td><td>${i.type === "ตัวเลข" ? fmt(Math.max(...i.nums)) : "-"}</td></tr>`).join("")}</table></div>
        <div class="row">ดูการกระจายของ <select id="col">${info.map((i, k) => `<option value="${k}">${esc(i.c)}</option>`).join("")}</select></div>
        <canvas id="cv" width="640" height="260"></canvas>`;
      const draw = () => {
        const i = info[+res.querySelector("#col").value];
        if (i.type === "ตัวเลข") {
          const v = i.nums, lo = Math.min(...v), hi = Math.max(...v), k = Math.min(8, Math.max(3, Math.ceil(Math.sqrt(v.length)))), w = (hi - lo) / k || 1;
          const bins = Array.from({ length: k }, (_, t) => [`${fmt(lo + t * w, 1)}–${fmt(lo + (t + 1) * w, 1)}`, 0]);
          v.forEach(x => bins[Math.min(k - 1, Math.floor((x - lo) / w))][1]++);
          plot(res.querySelector("#cv"), { bars: bins, zeroY: true });
        } else {
          const c = {}; body.forEach(r => { const x = r[info.indexOf(i)] || "(ว่าง)"; c[x] = (c[x] || 0) + 1; });
          plot(res.querySelector("#cv"), { bars: Object.entries(c).slice(0, 12), zeroY: true, colors: ["#7c3aed", "#2563eb", "#16a34a", "#ea580c", "#db2777"] });
        }
      };
      res.querySelector("#col").onchange = draw; draw();
    });
    b.appendChild(res);
  });

  def("stats", "เครื่องคำนวณสถิติเชิงพรรณนา + สหสัมพันธ์", (b) => {
    b.innerHTML = `<div class="two"><div><b>ข้อมูล X</b> (คั่นด้วยเว้นวรรค/จุลภาค/ขึ้นบรรทัด)<textarea id="x">2 5 1 4 3 6 2 3 0 5 4</textarea></div>
      <div><b>ข้อมูล Y</b> (ไม่บังคับ — ใส่เพื่อหาสหสัมพันธ์)<textarea id="y">68 85 55 79 72 90 64 70 40 88 80</textarea></div></div>
      <button id="go">คำนวณ</button><div id="o"></div><canvas id="cv" width="640" height="300" style="margin-top:8px"></canvas>`;
    const parse = s => s.split(/[\s,]+/).filter(isNum).map(num);
    const row = (n, v) => `<tr><td>${n}</td><td><b>${v}</b></td></tr>`;
    const go = () => {
      const x = parse($(b, "#x").value), y = parse($(b, "#y").value);
      const st = a => [row("จำนวน (n)", a.length), row("ค่าเฉลี่ย (Mean)", fmt(mean(a))), row("มัธยฐาน (Median)", fmt(median(a))), row("ฐานนิยม (Mode)", mode(a)),
        row("ต่ำสุด / สูงสุด", `${fmt(Math.min(...a))} / ${fmt(Math.max(...a))}`), row("พิสัย (Range)", fmt(Math.max(...a) - Math.min(...a))),
        row("Q1 / Q3", `${fmt(quant(a, .25))} / ${fmt(quant(a, .75))}`), row("ส่วนเบี่ยงเบนมาตรฐาน (SD)", fmt(sd(a)))].join("");
      let html = `<div class="two"><table class="t"><tr><th colspan=2>X</th></tr>${x.length ? st(x) : ""}</table>${y.length ? `<table class="t"><tr><th colspan=2>Y</th></tr>${st(y)}</table>` : ""}</div>`;
      if (x.length && y.length === x.length) {
        const r = corr(x, y), a = Math.abs(r);
        html += `<div class="out">สัมประสิทธิ์สหสัมพันธ์ r = <span class="big">${r.toFixed(3)}</span> → ความสัมพันธ์${r > 0 ? "ทางบวก" : "ทางลบ"} ระดับ${a >= .8 ? "สูงมาก" : a >= .6 ? "สูง" : a >= .4 ? "ปานกลาง" : a >= .2 ? "ต่ำ" : "ต่ำมาก/ไม่สัมพันธ์"}<div class="hint">สหสัมพันธ์ ≠ เหตุและผล</div></div>`;
        b.querySelector("#cv").style.display = ""; plot($(b, "#cv"), { series: [{ pts: x.map((v, i) => [v, y[i]]) }] });
      } else { b.querySelector("#cv").style.display = "none"; if (y.length) html += `<div class="warn">จำนวนข้อมูล X และ Y ต้องเท่ากันจึงจะหาสหสัมพันธ์ได้</div>`; }
      $(b, "#o").innerHTML = html;
    };
    $(b, "#go").onclick = go; go();
  });

  def("regression", "ทำนายเชิงตัวเลข: การถดถอยเชิงเส้น", (b) => {
    b.innerHTML = `<div class="hint">ใส่ข้อมูลเป็นคู่ x,y บรรทัดละคู่ (ตัวอย่าง: วันหลังโพสต์, ยอดวิว)</div>
      <textarea id="d" class="code" style="min-height:140px">1,210
2,290
3,400
4,450
5,560
6,620
7,700
8,800</textarea>
      <div class="row"><button id="go">สร้างแบบจำลอง</button><label>ทำนายเมื่อ x = <input type="number" id="px" value="10" step="any"></label></div>
      <div class="out" id="o"></div><canvas id="cv" width="640" height="300"></canvas>`;
    const go = () => {
      const p = $(b, "#d").value.split("\n").map(l => l.split(/[,\t ]+/)).filter(a => isNum(a[0]) && isNum(a[1])).map(a => [num(a[0]), num(a[1])]);
      if (p.length < 2) { $(b, "#o").textContent = "ต้องมีข้อมูลอย่างน้อย 2 คู่"; return; }
      const x = p.map(q => q[0]), y = p.map(q => q[1]), mx = mean(x), my = mean(y);
      const bb = x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0) / x.reduce((s, v) => s + (v - mx) ** 2, 0), a = my - bb * mx;
      const pred = v => a + bb * v, mae = mean(p.map(q => Math.abs(q[1] - pred(q[0])))), r2 = corr(x, y) ** 2;
      const px = +$(b, "#px").value;
      $(b, "#o").innerHTML = `สมการ: <b>y = ${a.toFixed(2)} ${bb >= 0 ? "+" : "−"} ${Math.abs(bb).toFixed(2)}x</b><br>
        เมื่อ x = ${px} ทำนาย y ≈ <span class="big">${fmt(pred(px))}</span><br>
        ความคลาดเคลื่อนเฉลี่ย (MAE) = ${fmt(mae)} · R² = ${r2.toFixed(3)} (${r2 > .8 ? "แบบจำลองอธิบายข้อมูลได้ดี" : r2 > .5 ? "พอใช้" : "ควรหาตัวแปรอื่นเพิ่ม"})`;
      const xmin = Math.min(...x, px), xmax = Math.max(...x, px);
      plot($(b, "#cv"), { series: [{ pts: p }, { pts: [[xmin, pred(xmin)], [xmax, pred(xmax)]], line: true, color: "#dc2626" }, { pts: [[px, pred(px)]], color: "#f59e0b", r: 7 }] });
    };
    $(b, "#go").onclick = go; $(b, "#px").oninput = go; go();
  });

  def("knn", "ทำนายเชิงหมวดหมู่: K-Nearest Neighbors", (b) => {
    b.innerHTML = `<div class="row">เลือกกลุ่มที่จะเพิ่ม: <button class="chip on" data-c="0">🍎 แอปเปิล</button><button class="chip" data-c="1">🍊 ส้ม</button>
      <button class="chip" data-c="2">❓ ทำนาย</button><label>K = <input type="number" id="k" value="3" min="1" max="15"></label><button class="ghost sm" id="clr">ล้าง</button><button class="ghost sm" id="ex">ข้อมูลตัวอย่าง</button></div>
      <canvas id="cv" width="560" height="380" style="cursor:crosshair"></canvas><div class="out" id="o">คลิกบนกราฟเพื่อเพิ่มข้อมูล (แกน X = น้ำหนัก, แกน Y = ความแดงของผิว) แล้วเลือก ❓ คลิกจุดที่ต้องการทำนาย</div>`;
    let pts = [], mode = 0, q = null;
    const C = ["#dc2626", "#f59e0b"], N = ["แอปเปิล", "ส้ม"];
    const cv = $(b, "#cv"), ctx = cv.getContext("2d");
    const ex = () => { pts = []; for (let i = 0; i < 12; i++) { pts.push([120 + Math.random() * 140, 60 + Math.random() * 120, 0]); pts.push([300 + Math.random() * 180, 200 + Math.random() * 140, 1]); } q = null; draw(); };
    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = "#888"; ctx.font = "13px Sarabun"; ctx.fillText("น้ำหนัก →", cv.width - 70, cv.height - 6); ctx.fillText("↑ ความแดง (น้อย)", 4, 14);
      let near = [];
      if (q) {
        const K = Math.max(1, Math.min(pts.length, +$(b, "#k").value));
        near = pts.map(p => [Math.hypot(p[0] - q[0], p[1] - q[1]), p]).sort((a, c) => a[0] - c[0]).slice(0, K);
        const R = near.length ? near[near.length - 1][0] : 0;
        ctx.strokeStyle = "#64748b"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(q[0], q[1], R, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        near.forEach(n => { ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(n[1][0], n[1][1]); ctx.stroke(); });
      }
      pts.forEach(p => { ctx.fillStyle = C[p[2]]; ctx.beginPath(); ctx.arc(p[0], p[1], 7, 0, 7); ctx.fill(); });
      if (q) {
        const votes = [0, 0]; near.forEach(n => votes[n[1][2]]++);
        const win = votes[0] === votes[1] ? -1 : votes[0] > votes[1] ? 0 : 1;
        ctx.fillStyle = win < 0 ? "#64748b" : C[win]; ctx.fillRect(q[0] - 9, q[1] - 9, 18, 18);
        $(b, "#o").innerHTML = near.length ? `K = ${near.length}: เพื่อนบ้านเป็น🍎 ${votes[0]} · 🍊 ${votes[1]} → ทำนายว่า <b>${win < 0 ? "เสมอ (ลองเปลี่ยน K เป็นเลขคี่)" : N[win]}</b>` : "ยังไม่มีข้อมูลฝึก";
      }
    }
    $$(b, "[data-c]").forEach(c => c.onclick = () => { $$(b, "[data-c]").forEach(x => x.classList.remove("on")); c.classList.add("on"); mode = +c.dataset.c; });
    cv.onclick = e => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * cv.width / r.width, y = (e.clientY - r.top) * cv.height / r.height; if (mode === 2) q = [x, y]; else pts.push([x, y, mode]); draw(); };
    $(b, "#k").oninput = draw; $(b, "#clr").onclick = () => { pts = []; q = null; draw(); }; $(b, "#ex").onclick = ex;
    ex(); q = [250, 190]; draw();
  });

  def("chart", "สร้างแผนภูมิ + แนะนำการเลือกแผนภูมิ", (b) => {
    b.innerHTML = `<div class="two"><div><div class="hint">ข้อมูล: ชื่อ,ค่า บรรทัดละรายการ</div><textarea id="d" class="code" style="min-height:160px">จันทร์,12
อังคาร,9
พุธ,15
พฤหัสบดี,7
ศุกร์,18</textarea></div>
      <div><label>ชื่อแผนภูมิ <input type="text" id="t" value="ขยะพลาสติก (กก.) ต่อวัน"></label>
      <div class="row">ชนิด: <select id="k"><option value="bar">แท่ง — เปรียบเทียบ</option><option value="line">เส้น — แนวโน้มตามเวลา</option><option value="pie">วงกลม — สัดส่วนของทั้งหมด</option></select></div>
      <label><input type="checkbox" id="trick"> 🤥 ตัดแกน Y (ไม่เริ่มที่ 0) — ดูว่าภาพชวนเข้าใจผิดอย่างไร</label>
      <div class="box" style="font-size:15px">เปรียบเทียบ → แท่ง · แนวโน้ม → เส้น · สัดส่วน (≤ 5 กลุ่ม) → วงกลม · ความสัมพันธ์ 2 ตัวแปร → แผนภาพการกระจาย</div></div></div>
      <canvas id="cv" width="680" height="340"></canvas><div class="row"><button class="ghost" id="png">⬇ บันทึกภาพ PNG</button></div>`;
    const cols = ["#2563eb", "#16a34a", "#f59e0b", "#db2777", "#7c3aed", "#0891b2", "#ea580c", "#64748b"];
    const draw = () => {
      const data = $(b, "#d").value.split("\n").map(l => l.split(/[,\t]/)).filter(a => a.length > 1 && isNum(a[1])).map(a => [a[0].trim(), num(a[1])]);
      const cv = $(b, "#cv"), ctx = cv.getContext("2d"), k = $(b, "#k").value;
      ctx.clearRect(0, 0, cv.width, cv.height);
      if (k === "pie") {
        const tot = data.reduce((s, d) => s + d[1], 0); let a0 = -Math.PI / 2;
        data.forEach((d, i) => { const a1 = a0 + d[1] / tot * Math.PI * 2; ctx.fillStyle = cols[i % 8]; ctx.beginPath(); ctx.moveTo(220, 180); ctx.arc(220, 180, 130, a0, a1); ctx.fill();
          ctx.fillRect(420, 60 + i * 26, 16, 16); ctx.fillStyle = getComputedStyle(document.body).color; ctx.font = "15px Sarabun"; ctx.fillText(`${d[0]} ${(d[1] / tot * 100).toFixed(1)}%`, 442, 73 + i * 26); a0 = a1; });
      } else if (k === "bar") {
        const lo = $(b, "#trick").checked ? Math.min(...data.map(d => d[1])) * 0.9 : 0;
        plot(cv, { bars: data, ymin: lo, zeroY: !$(b, "#trick").checked, colors: cols });
      } else {
        const g = plot(cv, { series: [{ pts: data.map((d, i) => [i + 1, d[1]]), line: true }, { pts: data.map((d, i) => [i + 1, d[1]]) }], ymin: $(b, "#trick").checked ? undefined : 0 });
      }
      ctx.fillStyle = getComputedStyle(document.body).color; ctx.font = "bold 16px Sarabun"; ctx.fillText($(b, "#t").value, 50, 18);
    };
    $$(b, "input,select,textarea").forEach(x => x.oninput = draw);
    $(b, "#png").onclick = () => { const a = document.createElement("a"); a.href = $(b, "#cv").toDataURL(); a.download = "chart.png"; a.click(); };
    draw();
  });

  // ------------------------------------------------------------ rubric / checklist
  const RUB = {
    dsproject: ["กำหนดปัญหา/คำถามชัดเจน", "เก็บข้อมูลเหมาะสมและเพียงพอ", "ทำความสะอาดและสำรวจข้อมูล", "วิเคราะห์/ทำนายถูกต้อง", "นำเสนอด้วยภาพข้อมูลที่เหมาะสม", "ข้อเสนอแนะมีประโยชน์ต่อชุมชน", "การทำงานเป็นทีม"],
    web: ["เป้าหมายและกลุ่มผู้ใช้ชัดเจน", "Sitemap/Wireframe สอดคล้องกับเว็บจริง", "ออกแบบสวยงาม อ่านง่าย contrast ผ่าน", "Responsive ใช้บนมือถือได้", "โค้ด HTML/CSS/JS ถูกต้อง เข้าใจโค้ด", "เผยแพร่บน GitHub Pages ได้", "อ้างอิง/ให้เครดิต + AI Use Statement", "การนำเสนอ"],
    prog: ["วิเคราะห์ปัญหาและออกแบบอัลกอริทึม", "ใช้เงื่อนไข/วนซ้ำ/ฟังก์ชันเหมาะสม", "ใช้ list/dict หรือไฟล์ข้อมูล", "โปรแกรมทำงานถูกต้อง ทดสอบหลายกรณี", "โค้ดอ่านง่าย ตั้งชื่อดี มีคอมเมนต์", "AI Use Log โปร่งใส", "การนำเสนอและตอบคำถาม"],
    media: ["วางแผน/สตอรีบอร์ดครบถ้วน", "คุณภาพภาพและเสียง", "การตัดต่อและลำดับเรื่อง", "ความคิดสร้างสรรค์", "สื่อสารตรงกลุ่มเป้าหมาย", "เคารพลิขสิทธิ์ + เปิดเผยการใช้ AI", "การทำงานเป็นทีม"],
  };
  def("rubric", "เกณฑ์ประเมิน (Rubric) และประเมินตนเอง", (b, arg) => {
    const it = RUB[arg];
    b.innerHTML = `<p class="hint">ระดับ 4 = ดีมาก · 3 = ดี · 2 = พอใช้ · 1 = ปรับปรุง — ใช้ประเมินตนเอง/เพื่อนประเมิน/ครูประเมิน</p>
      <div class="scroll"><table class="t"><tr><th>รายการประเมิน</th>${[4, 3, 2, 1].map(x => `<th>${x}</th>`).join("")}</tr>
      ${it.map((x, i) => `<tr><td>${i + 1}. ${esc(x)}</td>${[4, 3, 2, 1].map(v => `<td><input type="radio" name="r${arg}${i}" value="${v}" ${v === 3 ? "checked" : ""}></td>`).join("")}</tr>`).join("")}</table></div>
      <div class="out" id="o"></div>`;
    const upd = () => { const s = it.reduce((a, _, i) => a + +b.querySelector(`input[name="r${arg}${i}"]:checked`).value, 0), mx = it.length * 4;
      $(b, "#o").innerHTML = `รวม <span class="big">${s}/${mx}</span> (${(s / mx * 100).toFixed(0)}%) — ${s / mx >= .8 ? "ดีมาก" : s / mx >= .7 ? "ดี" : s / mx >= .5 ? "พอใช้" : "ปรับปรุง"}`; };
    $$(b, "input").forEach(x => x.onchange = upd); upd();
  });
  const CHK = {
    crap: ["Contrast: หัวเรื่องเด่น สีตัดกันชัด", "Repetition: ใช้สี/ฟอนต์/สไตล์ซ้ำอย่างสม่ำเสมอ", "Alignment: ทุกองค์ประกอบจัดแนวตรงกัน", "Proximity: ข้อมูลที่เกี่ยวข้องอยู่ใกล้กัน", "ใช้ฟอนต์ไม่เกิน 2 แบบ", "มีพื้นที่ว่าง (white space) พอ", "ระบุเครดิตภาพ/ภาพ AI"],
    slide: ["1 สไลด์ = 1 ความคิด", "ข้อความไม่เกิน 6 บรรทัด", "ตัวอักษรใหญ่พอ (≥ 24 pt)", "ภาพสื่อความหมาย ความละเอียดดี", "สีพื้นกับตัวอักษรตัดกันชัด", "มีสไลด์สรุป/ข้อคิด", "อ้างอิงแหล่งที่มา", "ซ้อมพูดตามเวลา"],
  };
  def("checklist", "รายการตรวจสอบ", (b, arg) => {
    const it = CHK[arg];
    b.innerHTML = it.map(x => `<label style="display:block;margin:4px 0"><input type="checkbox"> ${esc(x)}</label>`).join("") + `<div class="out" id="o"></div>`;
    const upd = () => { const n = $$(b, "input").filter(x => x.checked).length; $(b, "#o").innerHTML = `ผ่าน ${n}/${it.length} ${n === it.length ? "🎉 พร้อมส่งงาน" : ""}`; };
    $$(b, "input").forEach(x => x.onchange = upd); upd();
  });

  // ============================================================ prompt builders
  const PB = {
    general: { role: ["ครูผู้ช่วยสอน", "ติวเตอร์ใจดี", "บรรณาธิการ", "นักวิเคราะห์ข้อมูล"], task: ["อธิบายเรื่อง", "สรุปเนื้อหา", "สร้างแบบฝึกหัด 5 ข้อพร้อมเฉลย เรื่อง", "ตรวจและให้คำแนะนำงานเรื่อง"], fmt: ["ข้อ ๆ สั้น", "ตาราง", "ตัวอย่างประกอบ 2 ตัวอย่าง", "ภาษาง่ายสำหรับ ม.4"], topic: "หน่วยความจำ RAM และ ROM" },
    webbrief: { role: ["นักออกแบบเว็บไซต์ (UX/UI Designer)", "ที่ปรึกษาด้านการตลาดดิจิทัล"], task: ["เขียน Website Brief สำหรับเว็บ", "เสนอ Sitemap สำหรับเว็บ", "เสนอชุดสีและฟอนต์สำหรับเว็บ", "เขียนเนื้อหาหน้าแรกสำหรับเว็บ"], fmt: ["หัวข้อ: เป้าหมาย/กลุ่มผู้ใช้/หน้าเว็บ/ฟีเจอร์/โทนสี", "ตาราง", "รายการพร้อมเหตุผล"], topic: "แนะนำของดีอำเภอเมืองเลย สำหรับนักท่องเที่ยววัยรุ่น" },
    debug: { role: ["ครูสอนเขียนโปรแกรมที่ไม่เฉลยคำตอบตรง ๆ"], task: ["ช่วยบอกใบ้ว่าโค้ดนี้ผิดที่บรรทัดใดและเพราะอะไร (ห้ามเขียนโค้ดที่แก้แล้วให้)", "อธิบาย Error นี้ด้วยภาษาง่าย", "สร้าง test case 5 กรณีสำหรับฟังก์ชันนี้"], fmt: ["คำใบ้ทีละขั้น", "ข้อ ๆ สั้น"], topic: "วางโค้ดและข้อความ Error ที่นี่" },
    media: { role: ["นักออกแบบสื่อมัลติมีเดีย", "ผู้กำกับวิดีโอสั้น", "นักเขียนบท"], task: ["ระดมไอเดียสื่อประชาสัมพันธ์เรื่อง", "เขียนบทวิดีโอ 60 วินาทีเรื่อง", "เขียนแคปชันโพสต์ 3 แบบเรื่อง"], fmt: ["ตาราง ฉาก/ภาพ/เสียง/เวลา", "ข้อ ๆ", "โทนสนุก เป็นกันเอง"], topic: "ประเพณีผีตาโขน อ.ด่านซ้าย จ.เลย" },
  };
  def("prompt", "ตัวช่วยเขียน Prompt", (b, arg) => {
    if (arg === "image") return imagePrompt(b);
    const p = PB[arg] || PB.general;
    b.innerHTML = `<div class="row"><label>บทบาท <select id="r">${p.role.map(x => `<option>${x}</option>`).join("")}</select></label>
      <label>งาน <select id="t">${p.task.map(x => `<option>${x}</option>`).join("")}</select></label></div>
      <label>หัวข้อ/บริบท<textarea id="c" style="min-height:70px">${esc(p.topic)}</textarea></label>
      <div class="row"><label>รูปแบบผลลัพธ์ <select id="f">${p.fmt.map(x => `<option>${x}</option>`).join("")}</select></label>
      <label>ผู้อ่าน <select id="a"><option>นักเรียนมัธยมปลาย</option><option>นักเรียนมัธยมต้น</option><option>คนทั่วไป</option><option>ครู</option></select></label></div>
      <div class="prompt" id="o"></div>
      <div class="row"><button id="cp">📋 คัดลอก Prompt</button><a class="chip" target="_blank" href="https://gemini.google.com/">เปิด Gemini ↗</a><a class="chip" target="_blank" href="https://chatgpt.com/">เปิด ChatGPT ↗</a><a class="chip" target="_blank" href="https://copilot.microsoft.com/">เปิด Copilot ↗</a></div>
      <div class="hint">สูตร Prompt = บทบาท + งาน + บริบท + รูปแบบ + ผู้อ่าน + ข้อจำกัด</div>`;
    const upd = () => $(b, "#o").textContent = `คุณคือ${$(b, "#r").value}\nงาน: ${$(b, "#t").value} ${$(b, "#c").value}\nผู้อ่าน: ${$(b, "#a").value}\nรูปแบบ: ${$(b, "#f").value}\nข้อจำกัด: ใช้ภาษาไทยที่ถูกต้อง ระบุแหล่งอ้างอิงถ้ามีข้อเท็จจริง ถ้าไม่แน่ใจให้บอกว่าไม่แน่ใจ`;
    $$(b, "select,textarea").forEach(x => x.oninput = upd); upd();
    $(b, "#cp").onclick = () => navigator.clipboard?.writeText($(b, "#o").textContent).then(() => $(b, "#cp").textContent = "คัดลอกแล้ว ✓");
  });
  function imagePrompt(b) {
    const F = { "วัตถุ/เรื่อง": "นาขั้นบันไดยามเช้า มีหมอกบาง ๆ", "สไตล์": ["ภาพถ่ายสมจริง", "ภาพวาดสีน้ำ", "ภาพประกอบ 3D น่ารัก", "ภาพวาดดิจิทัลสีสด", "มินิมอล แบน (flat)"], "แสง": ["แสงเช้าอบอุ่น", "แสงนุ่มกระจาย", "แสงย้อน golden hour", "แสงกลางคืนนีออน"], "มุมกล้อง": ["มุมสูง เลนส์กว้าง", "ระดับสายตา", "โคลสอัป", "มุมต่ำ"], "สัดส่วน": ["16:9", "1:1", "4:5", "9:16"] };
    b.innerHTML = Object.entries(F).map(([k, v]) => `<div class="row"><b style="width:110px">${k}</b>${Array.isArray(v) ? `<select data-k="${k}">${v.map(x => `<option>${x}</option>`).join("")}</select>` : `<input type="text" data-k="${k}" value="${esc(v)}" style="flex:1">`}</div>`).join("") +
      `<div class="row"><b style="width:110px">สิ่งที่ไม่ต้องการ</b><input type="text" id="neg" value="ตัวอักษร ลายน้ำ ใบหน้าบุคคลจริง" style="flex:1"></div>
      <div class="prompt" id="o"></div><div class="row"><button id="cp">📋 คัดลอก</button><a class="chip" target="_blank" href="https://designer.microsoft.com/">Microsoft Designer ↗</a><a class="chip" target="_blank" href="https://gemini.google.com/">Gemini ↗</a><a class="chip" target="_blank" href="https://www.canva.com/">Canva ↗</a></div>
      <div class="hint">⚠️ ห้ามสร้างภาพเลียนแบบบุคคลจริงหรือทำให้เข้าใจผิด และระบุว่า “ภาพสร้างด้วย AI” ทุกครั้ง</div>`;
    const upd = () => { const v = k => b.querySelector(`[data-k="${k}"]`).value; $(b, "#o").textContent = `${v("วัตถุ/เรื่อง")}, ${v("สไตล์")}, ${v("แสง")}, ${v("มุมกล้อง")}, สัดส่วนภาพ ${v("สัดส่วน")}, รายละเอียดคมชัด\nไม่ต้องมี: ${$(b, "#neg").value}`; };
    $$(b, "input,select").forEach(x => x.oninput = upd); upd();
    $(b, "#cp").onclick = () => navigator.clipboard?.writeText($(b, "#o").textContent).then(() => $(b, "#cp").textContent = "คัดลอกแล้ว ✓");
  }

  // ============================================================ web design
  const lum = hex => { const c = hex.replace("#", "").match(/../g).map(x => parseInt(x, 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
  const ratio = (a, c) => { const [x, y] = [lum(a), lum(c)].sort((m, n) => n - m); return (x + .05) / (y + .05); };
  def("contrast", "ตรวจค่าความต่างของสี (WCAG Contrast)", (b) => {
    b.innerHTML = `<div class="row"><label>สีตัวอักษร <input type="color" id="f" value="#ffffff"></label><label>สีพื้นหลัง <input type="color" id="g" value="#facc15"></label><button class="ghost sm" id="sw">สลับ</button></div>
      <div id="pv" style="padding:18px;border-radius:10px;font-size:22px"><b>ของดีเมืองเลย</b><br><span style="font-size:16px">ข้อความตัวอย่างขนาดปกติ อ่านง่ายหรือไม่?</span></div><div class="out" id="o"></div>`;
    const upd = () => { const f = $(b, "#f").value, g = $(b, "#g").value, r = ratio(f, g); $(b, "#pv").style.cssText += `;color:${f};background:${g}`;
      const P = (ok) => ok ? '<span class="ok">ผ่าน ✓</span>' : '<span class="bad">ไม่ผ่าน ✗</span>';
      $(b, "#o").innerHTML = `Contrast = <span class="big">${r.toFixed(2)} : 1</span><br>ข้อความปกติ AA (≥ 4.5) ${P(r >= 4.5)} · ข้อความใหญ่ AA (≥ 3) ${P(r >= 3)} · AAA (≥ 7) ${P(r >= 7)}`; };
    $$(b, "input").forEach(x => x.oninput = upd); $(b, "#sw").onclick = () => { const t = $(b, "#f").value; $(b, "#f").value = $(b, "#g").value; $(b, "#g").value = t; upd(); }; upd();
  });

  def("palette", "สร้างชุดสี (Color Palette)", (b) => {
    b.innerHTML = `<div class="row"><label>สีหลัก <input type="color" id="c" value="#0891b2"></label><select id="m"><option value="comp">คู่ตรงข้าม (Complementary)</option><option value="ana">ใกล้เคียง (Analogous)</option><option value="tri">สามเส้า (Triadic)</option><option value="mono">โทนเดียว (Monochrome)</option></select><button class="ghost sm" id="rnd">สุ่ม</button></div>
      <div class="row" id="o"></div><pre class="out" id="css"></pre>`;
    const hsl = hex => { let [r, g, bb] = hex.slice(1).match(/../g).map(x => parseInt(x, 16) / 255); const mx = Math.max(r, g, bb), mn = Math.min(r, g, bb); let h = 0, s = 0, l = (mx + mn) / 2;
      if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - bb) / d + (g < bb ? 6 : 0) : mx === g ? (bb - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s * 100, l * 100]; };
    const hex = (h, s, l) => { h = ((h % 360) + 360) % 360; s /= 100; l /= 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)); return "#" + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, "0")).join(""); };
    const upd = () => { const [h, s, l] = hsl($(b, "#c").value), m = $(b, "#m").value;
      const P = { comp: [[h, s, l], [h, s, 92], [h + 180, s, l], [h, s * .3, 20], [h + 180, s, 90]], ana: [[h - 30, s, l], [h, s, l], [h + 30, s, l], [h, s * .3, 18], [h, s, 95]],
        tri: [[h, s, l], [h + 120, s, l], [h + 240, s, l], [h, s * .2, 18], [h, s * .2, 96]], mono: [[h, s, 20], [h, s, 35], [h, s, l], [h, s, 75], [h, s, 95]] }[m].map(c => hex(c[0], c[1], Math.max(5, Math.min(97, c[2]))));
      $(b, "#o").innerHTML = P.map(c => `<div class="swatch" style="background:${c};color:${lum(c) > .4 ? "#111" : "#fff"}">${c}</div>`).join("");
      $(b, "#css").textContent = `:root{\n${P.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n")}\n}`; };
    $$(b, "input,select").forEach(x => x.oninput = upd); $(b, "#rnd").onclick = () => { $(b, "#c").value = "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0"); upd(); }; upd();
  });

  def("sitemap", "สร้าง Sitemap จากรายการ", (b) => {
    b.innerHTML = `<div class="two"><div><div class="hint">พิมพ์ชื่อหน้า ใช้การเว้นวรรค 2 ช่อง เพื่อแสดงหน้าย่อย</div><textarea id="d" class="code">หน้าแรก
  เกี่ยวกับเรา
  สถานที่ท่องเที่ยว
    ภูกระดึง
    เชียงคาน
    ภูเรือ
  อาหารท้องถิ่น
  ติดต่อเรา</textarea></div><div class="tree" id="o"></div></div>
      <div class="hint">นำ Sitemap นี้ไปให้ AI/Google Stitch ร่าง Wireframe ของแต่ละหน้าได้</div>`;
    const upd = () => {
      const lines = $(b, "#d").value.split("\n").filter(l => l.trim()).map(l => ({ d: Math.floor(l.match(/^ */)[0].length / 2), t: l.trim() }));
      let html = "", depth = -1;
      lines.forEach(l => { while (depth < l.d) { html += "<ul>"; depth++; } while (depth > l.d) { html += "</ul>"; depth--; } html += `<li><span class="node">${esc(l.t)}</span></li>`; });
      while (depth-- >= 0) html += "</ul>";
      $(b, "#o").innerHTML = html + `<div class="hint">ทั้งหมด ${lines.length} หน้า · ลึก ${Math.max(0, ...lines.map(l => l.d)) + 1} ระดับ</div>`;
    };
    $(b, "#d").oninput = upd; upd();
  });

  const HT = {
    html: `<!DOCTYPE html>
<html lang="th">
<head><meta charset="utf-8"><title>ของดีเมืองเลย</title></head>
<body>
  <header>
    <h1>ของดีเมืองเลย</h1>
    <nav><a href="#">หน้าแรก</a> | <a href="#">ที่เที่ยว</a> | <a href="#">อาหาร</a></nav>
  </header>
  <main>
    <section>
      <h2>ภูกระดึง</h2>
      <p>อุทยานแห่งชาติที่มีชื่อเสียงของ <b>จังหวัดเลย</b></p>
      <ul><li>ทุ่งหญ้าบนยอดภู</li><li>ผาหล่มสัก</li></ul>
    </section>
  </main>
  <footer>© นักเรียน ม.6 โรงเรียนเลยอนุกูลวิทยา</footer>
</body>
</html>`,
    css: `<style>
  body{font-family:sans-serif;margin:0;background:#f0f9ff}
  header{background:#0891b2;color:#fff;padding:16px;text-align:center}
  .cards{display:flex;gap:12px;flex-wrap:wrap;padding:16px}
  .card{flex:1 1 180px;background:#fff;border-radius:12px;padding:12px;box-shadow:0 2px 8px #0002}
  @media (max-width:500px){ header{font-size:14px} }
</style>
<header><h1>ที่เที่ยวเมืองเลย</h1></header>
<div class="cards">
  <div class="card"><h3>ภูกระดึง</h3><p>เดินขึ้นภู 9 กม.</p></div>
  <div class="card"><h3>เชียงคาน</h3><p>ถนนคนเดินริมโขง</p></div>
  <div class="card"><h3>ภูเรือ</h3><p>ทะเลหมอกและอากาศหนาว</p></div>
</div>`,
    js: `<style>
  body{font-family:sans-serif;padding:16px;transition:.3s}
  body.dark{background:#111;color:#eee}
  button{padding:8px 16px;border-radius:8px}
</style>
<h2>แบบทดสอบสั้น</h2>
<p>ภูกระดึงอยู่จังหวัดใด?</p>
<button onclick="check('เลย')">เลย</button>
<button onclick="check('ขอนแก่น')">ขอนแก่น</button>
<p id="result"></p>
<button id="mode">🌙 โหมดมืด</button>
<script>
  let score = 0;
  function check(ans){
    if(ans === 'เลย'){ score++; document.getElementById('result').textContent = 'ถูกต้อง! คะแนน ' + score; }
    else { document.getElementById('result').textContent = 'ยังไม่ถูก ลองใหม่'; }
  }
  document.getElementById('mode').addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });
<\/script>`,
  };
  def("htmlEditor", "โปรแกรมแก้ไขเว็บแบบเห็นผลทันที (Live Editor)", (b, arg) => {
    b.innerHTML = `<div class="two"><div><textarea class="code" id="c" spellcheck="false" style="min-height:330px"></textarea>
      <div class="row"><button class="ghost sm" id="rs">↺ ตัวอย่างเดิม</button><button class="ghost sm" id="dl">⬇ ดาวน์โหลด index.html</button></div></div>
      <div><iframe class="preview" id="pv" sandbox="allow-scripts allow-modals" style="height:330px"></iframe></div></div>
      <div class="hint">แก้โค้ดด้านซ้าย หน้าเว็บด้านขวาจะเปลี่ยนทันที · ลองให้ AI อธิบายโค้ดแต่ละบรรทัด แล้วแก้ไขเอง</div>`;
    const ta = $(b, "#c"); ta.value = HT[arg] || HT.html;
    let t; const upd = () => { clearTimeout(t); t = setTimeout(() => $(b, "#pv").srcdoc = ta.value, 250); };
    ta.oninput = upd; ta.onkeydown = e => { if (e.key === "Tab") { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText("  ", s, ta.selectionEnd, "end"); upd(); } };
    $(b, "#rs").onclick = () => { ta.value = HT[arg] || HT.html; upd(); };
    $(b, "#dl").onclick = () => download("index.html", ta.value, "text/html");
    upd();
  });

  def("flexbox", "ทดลอง CSS Flexbox", (b) => {
    const P = { "flex-direction": ["row", "column", "row-reverse"], "justify-content": ["flex-start", "center", "space-between", "space-around", "flex-end"], "align-items": ["stretch", "flex-start", "center", "flex-end"], "flex-wrap": ["nowrap", "wrap"] };
    b.innerHTML = `<div class="row">${Object.entries(P).map(([k, v]) => `<label>${k} <select data-k="${k}">${v.map(x => `<option>${x}</option>`).join("")}</select></label>`).join("")}<label>gap <input type="number" id="gap" value="8" min="0" max="40"></label></div>
      <div class="flexdemo" id="d">${[1, 2, 3, 4].map(i => `<div>${i}</div>`).join("")}</div><pre class="out" id="css"></pre>`;
    const upd = () => { const s = $$(b, "select").map(x => `${x.dataset.k}: ${x.value};`); s.push(`gap: ${$(b, "#gap").value}px;`);
      $(b, "#d").style.cssText = s.join(""); $(b, "#css").textContent = `.container {\n  display: flex;\n  ${s.join("\n  ")}\n}`; };
    $$(b, "select,input").forEach(x => x.oninput = upd); upd();
  });

  def("ghPages", "ขั้นตอนเผยแพร่เว็บด้วย GitHub Pages", (b) => {
    const steps = ["สมัคร/เข้าสู่ระบบ github.com (ใช้อีเมลนักเรียน)", "กด New repository ตั้งชื่อ เช่น loei-guide เลือก Public", "Add file → Upload files → ลากไฟล์ index.html, style.css, รูปภาพ", "กด Commit changes", "Settings → Pages → Source: Deploy from a branch → Branch: main / (root) → Save", "รอ 1–2 นาที แล้วเปิด URL ที่ได้", "แก้ไขไฟล์ → Commit ใหม่ เว็บจะอัปเดตอัตโนมัติ"];
    b.innerHTML = `<div class="row"><label>ชื่อผู้ใช้ GitHub <input type="text" id="u" value="student01"></label><label>ชื่อ Repository <input type="text" id="r" value="loei-guide"></label></div>
      <div class="out" id="o"></div>${steps.map((s, i) => `<label style="display:block;margin:4px 0"><input type="checkbox"> ${i + 1}. ${esc(s)}</label>`).join("")}
      <div class="hint">ไฟล์หน้าแรกต้องชื่อ <code>index.html</code> (ตัวพิมพ์เล็ก) · ชื่อไฟล์ไม่ควรมีภาษาไทยหรือเว้นวรรค</div>`;
    const upd = () => { const u = $(b, "#u").value.trim().toLowerCase(), r = $(b, "#r").value.trim(); $(b, "#o").innerHTML = `URL เว็บของคุณ: <b>https://${esc(u)}.github.io/${esc(r)}/</b><br>Repository: https://github.com/${esc(u)}/${esc(r)}`; };
    $$(b, "input[type=text]").forEach(x => x.oninput = upd); upd();
  });

  def("credit", "สร้างข้อความอ้างอิง / เครดิต / AI Use Statement", (b) => {
    b.innerHTML = `<div class="row"><select id="k"><option value="img">ภาพ/สื่อจากผู้อื่น</option><option value="ai">ผลงานที่ใช้ AI ช่วย</option><option value="web">เว็บไซต์ (APA)</option></select></div><div id="f"></div><div class="prompt" id="o"></div><button id="cp" class="sm">📋 คัดลอก</button>`;
    const F = { img: [["ชื่อผลงาน", "ทะเลหมอกภูเรือ"], ["เจ้าของ", "Somchai P."], ["แหล่งที่มา (URL)", "https://commons.wikimedia.org/..."], ["สัญญาอนุญาต", "CC BY 4.0"]],
      ai: [["เครื่องมือ AI", "Gemini / Canva Magic Media"], ["ใช้ทำอะไร", "ร่างโครงเนื้อหาและสร้างภาพประกอบหน้าแรก"], ["ส่วนที่ทำเอง", "ตรวจข้อเท็จจริง เรียบเรียงใหม่ ออกแบบและเขียนโค้ด"], ["วันที่ใช้", new Date().toLocaleDateString("th-TH")]],
      web: [["ผู้เขียน/หน่วยงาน", "การท่องเที่ยวแห่งประเทศไทย"], ["ปี", "2568"], ["ชื่อหน้าเว็บ", "เที่ยวจังหวัดเลย"], ["URL", "https://thai.tourismthailand.org/"]] };
    const upd = () => { const v = [...$$(b, "#f input")].map(x => x.value), k = $(b, "#k").value;
      $(b, "#o").textContent = k === "img" ? `ภาพ “${v[0]}” โดย ${v[1]} จาก ${v[2]} ใช้ภายใต้สัญญาอนุญาต ${v[3]}`
        : k === "ai" ? `การใช้ AI: ผลงานนี้ใช้ ${v[0]} ช่วย${v[1]} (${v[3]}) โดยผู้จัดทำ${v[2]} และรับผิดชอบความถูกต้องของเนื้อหาทั้งหมด`
          : `${v[0]}. (${v[1]}). ${v[2]}. สืบค้นเมื่อ ${new Date().toLocaleDateString("th-TH", { dateStyle: "long" })}, จาก ${v[3]}`; };
    const build = () => { $(b, "#f").innerHTML = F[$(b, "#k").value].map(([l, v]) => `<div class="row"><label style="width:100%">${l} <input type="text" value="${esc(v)}" style="width:100%"></label></div>`).join(""); $$(b, "#f input").forEach(x => x.oninput = upd); upd(); };
    $(b, "#k").onchange = build; build();
    $(b, "#cp").onclick = () => navigator.clipboard?.writeText($(b, "#o").textContent);
  });

  // ============================================================ multimedia calculators
  def("imageSize", "คำนวณขนาดไฟล์ภาพ และขนาดงานพิมพ์", (b) => {
    b.innerHTML = `<div class="row"><label>กว้าง (px) <input type="number" id="w" value="1920"></label><label>สูง (px) <input type="number" id="h" value="1080"></label>
      <label>ความลึกสี <select id="bd"><option value="24">24 บิต (RGB)</option><option value="32">32 บิต (RGBA)</option><option value="8">8 บิต (256 สี)</option><option value="1">1 บิต (ขาวดำ)</option></select></label>
      <label>ความละเอียดพิมพ์ <select id="dpi"><option>300</option><option>150</option><option>72</option></select> dpi</label></div><div class="out" id="o"></div>`;
    const upd = () => { const w = +$(b, "#w").value, h = +$(b, "#h").value, bd = +$(b, "#bd").value, dpi = +$(b, "#dpi").value, by = w * h * bd / 8;
      $(b, "#o").innerHTML = `จำนวนพิกเซล = ${fmt(w * h, 0)} (${fmt(w * h / 1e6, 1)} ล้านพิกเซล)<br>
        ขนาดไฟล์ไม่บีบอัด = ${fmt(w)} × ${fmt(h)} × ${bd} ÷ 8 = <span class="big">${fmt(by / 1048576)} MB</span><br>
        ประมาณ JPG (บีบอัด ~10:1) ≈ ${fmt(by / 10 / 1048576)} MB · WebP ≈ ${fmt(by / 14 / 1048576)} MB<br>
        พิมพ์ที่ ${dpi} dpi ได้ขนาด ${fmt(w / dpi)} × ${fmt(h / dpi)} นิ้ว = <b>${fmt(w / dpi * 2.54)} × ${fmt(h / dpi * 2.54)} ซม.</b>`; };
    $$(b, "input,select").forEach(x => x.oninput = upd); upd();
  });

  def("colorPick", "ระบบสี RGB / HEX / CMYK", (b) => {
    b.innerHTML = `<div class="row"><input type="color" id="c" value="#db2777" style="width:80px;height:60px">
      <label>R <input type="range" id="r" min="0" max="255"></label><label>G <input type="range" id="g" min="0" max="255"></label><label>B <input type="range" id="bl" min="0" max="255"></label></div><div class="out" id="o"></div>`;
    const set = hex => { const [r, g, bb] = hex.slice(1).match(/../g).map(x => parseInt(x, 16)); $(b, "#r").value = r; $(b, "#g").value = g; $(b, "#bl").value = bb; show(r, g, bb); };
    const show = (r, g, bb) => { const hex = "#" + [r, g, bb].map(x => (+x).toString(16).padStart(2, "0")).join(""); $(b, "#c").value = hex;
      const k = 1 - Math.max(r, g, bb) / 255, C = k === 1 ? 0 : (1 - r / 255 - k) / (1 - k), M = k === 1 ? 0 : (1 - g / 255 - k) / (1 - k), Y = k === 1 ? 0 : (1 - bb / 255 - k) / (1 - k);
      $(b, "#o").innerHTML = `HEX <b>${hex.toUpperCase()}</b> · RGB(<b>${r}, ${g}, ${bb}</b>) · CMYK(<b>${[C, M, Y, k].map(x => Math.round(x * 100) + "%").join(", ")}</b>)<div class="hint">RGB = แสง (จอภาพ) · CMYK = หมึก (งานพิมพ์) · 1 สี 24 บิต = 8 บิตต่อช่อง × 3 = 16.7 ล้านสี</div>`; };
    $(b, "#c").oninput = e => set(e.target.value); ["#r", "#g", "#bl"].forEach(s => $(b, s).oninput = () => show(+$(b, "#r").value, +$(b, "#g").value, +$(b, "#bl").value));
    set("#db2777");
  });

  def("audioSize", "คำนวณขนาดไฟล์เสียง", (b) => {
    b.innerHTML = `<div class="row"><label>Sample rate <select id="sr"><option value="44100">44.1 kHz (CD)</option><option value="48000">48 kHz (วิดีโอ)</option><option value="22050">22.05 kHz</option><option value="8000">8 kHz (โทรศัพท์)</option></select></label>
      <label>Bit depth <select id="bd"><option>16</option><option>24</option><option>8</option></select></label><label>ช่องเสียง <select id="ch"><option value="2">สเตอริโอ</option><option value="1">โมโน</option></select></label>
      <label>ความยาว (นาที) <input type="number" id="m" value="3" step="0.5"></label><label>MP3 <select id="kb"><option>128</option><option>192</option><option>320</option><option>64</option></select> kbps</label></div><div class="out" id="o"></div>`;
    const upd = () => { const sr = +$(b, "#sr").value, bd = +$(b, "#bd").value, ch = +$(b, "#ch").value, s = +$(b, "#m").value * 60, kb = +$(b, "#kb").value;
      const wav = sr * bd * ch * s / 8, mp3 = kb * 1000 * s / 8;
      $(b, "#o").innerHTML = `WAV (ไม่บีบอัด) = ${fmt(sr, 0)} × ${bd} × ${ch} × ${fmt(s, 0)} ÷ 8 = <span class="big">${fmt(wav / 1048576)} MB</span><br>MP3 ${kb} kbps = ${kb} × 1000 × ${fmt(s, 0)} ÷ 8 = <b>${fmt(mp3 / 1048576)} MB</b> (เล็กลง ${fmt(wav / mp3, 1)} เท่า)`; };
    $$(b, "input,select").forEach(x => x.oninput = upd); upd();
  });

  def("videoSize", "คำนวณขนาดไฟล์วิดีโอ", (b) => {
    const PRE = { "720p (HD)": [1280, 720, 5], "1080p (Full HD)": [1920, 1080, 8], "1080p แนวตั้ง 9:16": [1080, 1920, 8], "4K": [3840, 2160, 35] };
    b.innerHTML = `<div class="row"><label>ความละเอียด <select id="p">${Object.keys(PRE).map(k => `<option>${k}</option>`).join("")}</select></label>
      <label>Bitrate วิดีโอ (Mbps) <input type="number" id="br" step="0.5"></label><label>เสียง (kbps) <input type="number" id="ab" value="128"></label>
      <label>fps <select id="fps"><option>30</option><option>24</option><option>60</option></select></label><label>ความยาว (วินาที) <input type="number" id="s" value="60"></label></div><div class="out" id="o"></div>`;
    const setp = () => { $(b, "#br").value = PRE[$(b, "#p").value][2]; upd(); };
    const upd = () => { const [w, h] = PRE[$(b, "#p").value], br = +$(b, "#br").value, ab = +$(b, "#ab").value, s = +$(b, "#s").value, fps = +$(b, "#fps").value;
      const mb = (br * 1e6 + ab * 1e3) * s / 8 / 1048576, raw = w * h * 3 * fps * s / 1048576;
      $(b, "#o").innerHTML = `${w}×${h} · ${fps} fps · ${s} วินาที = ${fmt(fps * s, 0)} เฟรม<br>ขนาดไฟล์ ≈ (${br} Mbps + ${ab} kbps) × ${s} ÷ 8 = <span class="big">${fmt(mb)} MB</span><br>
        <span class="hint">ถ้าไม่บีบอัดเลยจะใหญ่ถึง ${fmt(raw / 1024)} GB — codec H.264/H.265 จึงสำคัญมาก</span>`; };
    $(b, "#p").onchange = setp; $$(b, "input,#fps").forEach(x => x.oninput = upd); setp();
  });

  def("storyboard", "สร้างสตอรีบอร์ด", (b) => {
    b.innerHTML = `<div class="row"><label>ชื่อเรื่อง <input type="text" id="t" value="แนะนำโรงเรียนเลยอนุกูลวิทยา"></label><label>จำนวนฉาก <input type="number" id="n" value="6" min="1" max="20"></label><button class="ghost noprint" onclick="print()">🖨 พิมพ์</button><button class="ghost noprint" id="dl">⬇ CSV</button></div>
      <div class="sb" id="o"></div><div class="out" id="tot"></div>`;
    const shots = ["Wide shot", "Medium shot", "Close-up", "Over the shoulder", "มุมสูง", "มุมต่ำ"];
    const build = () => { const n = Math.max(1, Math.min(20, +$(b, "#n").value));
      $(b, "#o").innerHTML = Array.from({ length: n }, (_, i) => `<div class="card" style="padding:10px"><b>ฉากที่ ${i + 1}</b><div class="frame">วาด/วางภาพร่าง</div>
        <select>${shots.map(s => `<option>${s}</option>`).join("")}</select> <input type="number" value="5" style="width:60px"> วิ
        <textarea placeholder="ภาพ/การกระทำ" style="min-height:44px"></textarea><textarea placeholder="บทพูด/เสียง/ดนตรี" style="min-height:44px"></textarea></div>`).join("");
      const tot = () => $(b, "#tot").textContent = `ความยาวรวม ${$$(b, "#o input").reduce((s, x) => s + +x.value, 0)} วินาที`;
      $$(b, "#o input").forEach(x => x.oninput = tot); tot(); };
    $(b, "#n").oninput = build; build();
    $(b, "#dl").onclick = () => download("storyboard.csv", toCSV([["ฉาก", "มุมกล้อง", "วินาที", "ภาพ", "เสียง"], ...$$(b, "#o .card").map((c, i) => [String(i + 1), $(c, "select").value, $(c, "input").value, ...$$(c, "textarea").map(t => t.value)])]), "text/csv");
  });

  def("flipbook", "แอนิเมชันเฟรมต่อเฟรม (Flipbook)", (b) => {
    b.innerHTML = `<div class="row"><label>fps <input type="number" id="fps" value="8" min="1" max="30"></label><button id="add" class="ghost sm">+ เฟรมใหม่ (คัดลอกเฟรมเดิม)</button><button id="clr" class="ghost sm">ล้างเฟรมนี้</button><button id="play">▶ เล่น</button><span id="info" class="muted"></span></div>
      <canvas id="cv" width="400" height="260" style="cursor:crosshair;touch-action:none"></canvas>
      <div class="row" id="th"></div><div class="hint">วาดด้วยเมาส์/นิ้ว → เพิ่มเฟรม → ขยับภาพทีละน้อย → เล่น · ${"onion skin"} แสดงเฟรมก่อนหน้าจาง ๆ</div>`;
    const cv = $(b, "#cv"), ctx = cv.getContext("2d"); let frames = [null], cur = 0, drawing = false, timer = null;
    const snap = () => frames[cur] = ctx.getImageData(0, 0, cv.width, cv.height);
    const show = (i, onion = true) => { ctx.clearRect(0, 0, cv.width, cv.height); if (onion && i > 0 && frames[i - 1]) { const tmp = document.createElement("canvas"); tmp.width = cv.width; tmp.height = cv.height; tmp.getContext("2d").putImageData(frames[i - 1], 0, 0); ctx.globalAlpha = .2; ctx.drawImage(tmp, 0, 0); ctx.globalAlpha = 1; }
      if (frames[i]) { const tmp = document.createElement("canvas"); tmp.width = cv.width; tmp.height = cv.height; tmp.getContext("2d").putImageData(frames[i], 0, 0); ctx.drawImage(tmp, 0, 0); }
      $(b, "#info").textContent = `เฟรม ${i + 1}/${frames.length} · ความยาว ${(frames.length / +$(b, "#fps").value).toFixed(2)} วินาที`; };
    const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
    cv.onpointerdown = e => { drawing = true; ctx.beginPath(); ctx.moveTo(...pos(e)); };
    cv.onpointermove = e => { if (!drawing) return; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.strokeStyle = "#db2777"; ctx.lineTo(...pos(e)); ctx.stroke(); };
    cv.onpointerup = cv.onpointerleave = () => { if (drawing) { drawing = false; const keep = ctx.getImageData(0, 0, cv.width, cv.height); frames[cur] = keep; } };
    const thumbs = () => $(b, "#th").innerHTML = frames.map((_, i) => `<button class="chip ${i === cur ? "on" : ""}" data-i="${i}">${i + 1}</button>`).join("");
    $(b, "#th").onclick = e => { const i = e.target.dataset.i; if (i !== undefined) { cur = +i; show(cur); thumbs(); } };
    $(b, "#add").onclick = () => { frames.splice(cur + 1, 0, frames[cur]); cur++; show(cur); thumbs(); };
    $(b, "#clr").onclick = () => { frames[cur] = null; show(cur); };
    $(b, "#play").onclick = () => { if (timer) { clearInterval(timer); timer = null; $(b, "#play").textContent = "▶ เล่น"; show(cur); return; }
      let i = 0; $(b, "#play").textContent = "⏸ หยุด"; timer = setInterval(() => { show(i, false); i = (i + 1) % frames.length; }, 1000 / +$(b, "#fps").value); };
    show(0); thumbs();
  });

  def("timer", "นาฬิกาจับเวลานำเสนอ", (b) => {
    b.innerHTML = `<div class="row"><label>นาที <input type="number" id="m" value="3" min="1"></label><button id="go">▶ เริ่ม</button><button class="ghost" id="rs">รีเซ็ต</button></div><div class="big" id="o" style="font-size:64px;text-align:center"></div>`;
    let left, t = null; const show = () => { const m = Math.floor(Math.abs(left) / 60), s = Math.abs(left) % 60; $(b, "#o").textContent = `${left < 0 ? "-" : ""}${m}:${String(s).padStart(2, "0")}`; $(b, "#o").style.color = left <= 0 ? "var(--bad)" : left <= 30 ? "var(--warn)" : ""; };
    const rs = () => { clearInterval(t); t = null; left = +$(b, "#m").value * 60; show(); $(b, "#go").textContent = "▶ เริ่ม"; };
    $(b, "#go").onclick = () => { if (t) { clearInterval(t); t = null; $(b, "#go").textContent = "▶ ต่อ"; return; } $(b, "#go").textContent = "⏸ พัก"; t = setInterval(() => { left--; show(); }, 1000); };
    $(b, "#rs").onclick = rs; $(b, "#m").oninput = rs; rs();
  });

  def("loopTrace", "ติดตามการทำงานของลูป for + range()", (b) => {
    b.innerHTML = `<div class="row">for i in range(<input type="number" id="a" value="1">, <input type="number" id="z" value="11">, <input type="number" id="s" value="2">):</div>
      <div class="row"><label>สะสมค่า total += <select id="e"><option value="i">i</option><option value="i*i">i*i</option><option value="1">1 (นับจำนวนรอบ)</option></select></label></div><div class="out" id="o"></div>`;
    const upd = () => { const a = +$(b, "#a").value, z = +$(b, "#z").value, s = +$(b, "#s").value, e = $(b, "#e").value;
      if (!s) { $(b, "#o").innerHTML = '<span class="bad">ValueError: range() arg 3 must not be zero</span>'; return; }
      const v = []; for (let i = a; s > 0 ? i < z : i > z; i += s) { v.push(i); if (v.length > 200) break; }
      let tot = 0; const rows = v.slice(0, 30).map((i, k) => { tot += e === "i" ? i : e === "i*i" ? i * i : 1; return `<tr><td>${k + 1}</td><td>${i}</td><td>${tot}</td></tr>`; });
      if (v.length > 30) v.slice(30).forEach(i => tot += e === "i" ? i : e === "i*i" ? i * i : 1);
      $(b, "#o").innerHTML = `ค่า i: [${v.slice(0, 40).join(", ")}${v.length > 40 ? ", …" : ""}] · วน ${v.length} รอบ (หยุดก่อนถึง ${z} — ไม่รวม ${z})<br>total = <b>${tot}</b>
        <table class="t" style="margin-top:6px;max-width:320px"><tr><th>รอบ</th><th>i</th><th>total</th></tr>${rows.join("")}</table>`; };
    $$(b, "input,select").forEach(x => x.oninput = upd); upd();
  });

  // ============================================================ Python (Pyodide)
  const PY = {
    intro: [["สวัสดีชาวโลก", 'print("สวัสดี เลยอนุกูลวิทยา")\nprint("ฉันกำลังเรียน Python", 2569)\n# บรรทัดที่ขึ้นต้นด้วย # คือคอมเมนต์'],
      ["คำนวณง่าย ๆ", "print(7 + 5)\nprint(2 ** 10)\nprint('ค่าเฉลี่ย', (80 + 72 + 95) / 3)"]],
    vars: [["BMI", 'w = float(input("น้ำหนัก (กก.): "))\nh = float(input("ส่วนสูง (ม.): "))\nbmi = w / h ** 2\nprint(f"BMI = {bmi:.2f}")'],
      ["ตัวดำเนินการ", "a, b = 17, 5\nprint(a + b, a - b, a * b)\nprint(a / b, a // b, a % b)\nprint(type(a), type(a / b), type('17'))"]],
    if: [["ตัดเกรด", 'score = int(input("คะแนน: "))\nif score >= 80:\n    print("เกรด 4")\nelif score >= 75:\n    print("เกรด 3.5")\nelif score >= 70:\n    print("เกรด 3")\nelif score >= 50:\n    print("ผ่าน")\nelse:\n    print("เกรด 0 — ซ่อมนะ")'],
      ["ปีอธิกสุรทิน", 'y = int(input("ปี ค.ศ.: "))\nif (y % 4 == 0 and y % 100 != 0) or y % 400 == 0:\n    print(y, "เป็นปีอธิกสุรทิน")\nelse:\n    print(y, "ไม่ใช่")']],
    loop: [["สูตรคูณ", 'n = int(input("แม่: "))\nfor i in range(1, 13):\n    print(f"{n} x {i} = {n*i}")'],
      ["เกมทายตัวเลข", 'import random\nsecret = random.randint(1, 20)\ntries = 0\nwhile True:\n    g = int(input("ทาย 1-20: "))\n    tries += 1\n    if g == secret:\n        print("ถูก! ใช้", tries, "ครั้ง")\n        break\n    print("มากไป" if g > secret else "น้อยไป")']],
    func: [["ฟังก์ชันเกรด", 'def grade(score):\n    if score >= 80: return 4\n    if score >= 70: return 3\n    if score >= 60: return 2\n    if score >= 50: return 1\n    return 0\n\nfor s in [95, 72, 61, 50, 30]:\n    print(s, "->", grade(s))'],
      ["ค่าไฟฟ้า", 'def electric_bill(unit):\n    """คิดค่าไฟแบบขั้นบันได (ตัวอย่างอย่างง่าย)"""\n    if unit <= 150:\n        return unit * 3.25\n    return 150 * 3.25 + (unit - 150) * 4.22\n\nprint(electric_bill(120))\nprint(electric_bill(300))']],
    list: [["List คะแนน", 'scores = [78, 92, 65, 88, 71]\nscores.append(95)\nprint("สูงสุด", max(scores), "ต่ำสุด", min(scores))\nprint("เฉลี่ย", sum(scores) / len(scores))\nprint("เรียง", sorted(scores, reverse=True))'],
      ["Dict นับคำ", 'text = "เลย เมือง เลย ภู เรือ เลย ภู กระดึง"\ncount = {}\nfor w in text.split():\n    count[w] = count.get(w, 0) + 1\nfor k, v in sorted(count.items(), key=lambda x: -x[1]):\n    print(k, v)']],
    csv: [["อ่าน CSV", 'import csv, io\ndata = """name,score\nต้น,78\nฝน,92\nปอ,65\nมิว,88"""\nrows = list(csv.DictReader(io.StringIO(data)))\navg = sum(int(r["score"]) for r in rows) / len(rows)\nprint("ค่าเฉลี่ย", avg)\nfor r in rows:\n    if int(r["score"]) > avg:\n        print(r["name"], "มากกว่าค่าเฉลี่ย")']],
    debug: [["บั๊กที่ 1 (TypeError)", 'age = input("อายุ: ")\nprint("ปีหน้าคุณจะอายุ " + age + 1)'],
      ["บั๊กที่ 2 (Logic)", '# หาค่าเฉลี่ย แต่ผลลัพธ์ผิด ทำไม?\nnums = [10, 20, 30]\ntotal = 0\nfor n in nums:\n    total = n\nprint(total / len(nums))'],
      ["บั๊กที่ 3 (Syntax)", 'for i in range(5)\n    print(i)']],
  };
  let pyodide = null, pyLoading = null;
  function loadPy(status) {
    if (pyodide) return Promise.resolve(pyodide);
    if (pyLoading) return pyLoading;
    status("⏳ กำลังโหลด Python ครั้งแรก (~10 MB) …");
    pyLoading = new Promise((ok, no) => {
      const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/pyodide@0.26.4/pyodide.js";
      s.onload = () => window.loadPyodide({ indexURL: "https://cdn.jsdelivr.net/npm/pyodide@0.26.4/" }).then(p => { pyodide = p; ok(p); }, no); s.onerror = () => no(new Error("โหลดไม่สำเร็จ ตรวจสอบอินเทอร์เน็ต"));
      document.head.appendChild(s);
    });
    return pyLoading;
  }
  def("python", "รัน Python บนเว็บ", (b, arg) => {
    const ex = PY[arg] || PY.intro;
    b.innerHTML = `<div class="row">${ex.map((e, i) => `<button class="chip ${i ? "" : "on"}" data-i="${i}">${esc(e[0])}</button>`).join("")}</div>
      <textarea class="code" id="c" spellcheck="false"></textarea>
      <div class="row"><button id="run">▶ Run</button><button class="ghost sm" id="cp">📋 คัดลอกไป Colab</button><a class="chip" target="_blank" href="https://colab.research.google.com/#create=true">เปิด Colab ↗</a><a class="chip" target="_blank" href="https://pythontutor.com/python-compiler.html#mode=edit">Python Tutor ↗</a></div>
      <pre class="out" id="o">กด Run เพื่อรันโปรแกรม (input() จะเปิดกล่องให้กรอกค่า)</pre>`;
    const ta = $(b, "#c"); ta.value = ex[0][1];
    $$(b, "[data-i]").forEach(c => c.onclick = () => { $$(b, "[data-i]").forEach(x => x.classList.remove("on")); c.classList.add("on"); ta.value = ex[+c.dataset.i][1]; });
    ta.onkeydown = e => { if (e.key === "Tab") { e.preventDefault(); ta.setRangeText("    ", ta.selectionStart, ta.selectionEnd, "end"); } };
    $(b, "#cp").onclick = () => navigator.clipboard?.writeText(ta.value);
    const out = $(b, "#o");
    $(b, "#run").onclick = async () => {
      try {
        const py = await loadPy(t => out.textContent = t);
        out.textContent = "";
        py.setStdout({ batched: s => out.textContent += s + "\n" });
        py.setStderr({ batched: s => out.textContent += s + "\n" });
        py.globals.set("__js_input", (p) => { const v = window.prompt(p || "input:") ?? ""; out.textContent += (p || "") + v + "\n"; return v; });
        await py.runPythonAsync("import builtins\nbuiltins.input = lambda p='': __js_input(p)");
        await py.runPythonAsync(ta.value);
        if (!out.textContent) out.textContent = "(ไม่มีผลลัพธ์)";
      } catch (e) {
        const msg = String(e.message || e).split("\n").filter(l => !/pyodide|_pyodide|File "<exec>", line \d+, in <module>$/.test(l) || /line/.test(l));
        out.innerHTML = `<span class="bad">${esc(msg.slice(-4).join("\n"))}</span>\n<span class="hint">💡 อ่านบรรทัดสุดท้ายของ Error ก่อน แล้วลองถาม AI ให้ “อธิบาย” ไม่ใช่ “แก้ให้”</span>`;
      }
    };
  });

  window.TOOLS = { mount, titleOf, registry: R, quiz: quizInto };
})();
