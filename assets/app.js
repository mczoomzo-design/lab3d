/* ห้องเรียนคอมพิวเตอร์ — router และหน้าแสดงผล */
(function () {
  const D = window.COURSE;
  const $app = document.getElementById("app");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // theme
  const tb = document.getElementById("themeBtn");
  try { const t = localStorage.getItem("theme"); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
  tb.onclick = () => {
    const cur = document.documentElement.dataset.theme ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const nx = cur === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nx;
    try { localStorage.setItem("theme", nx); } catch (e) {}
  };

  const subj = id => D.subjects.find(s => s.id === id);
  const allPlans = s => s.units.flatMap(u => u.plans.map(p => Object.assign({ unit: u }, p)));

  function home() {
    const basic = D.subjects.filter(s => s.kind === "พื้นฐาน");
    const extra = D.subjects.filter(s => s.kind !== "พื้นฐาน");
    const card = s => `<a class="card subj" href="#/${s.id}">
      <div class="ic">${s.icon}</div>
      <div><span class="lv" style="background:${s.color}">${s.short}</span><span class="muted">${s.code} · ${s.kind}</span></div>
      <h3 style="margin:6px 0">${esc(s.name)}</h3>
      <div class="muted" style="font-size:14px">${s.units.length} หน่วย · ${allPlans(s).length} แผน · 40 ชั่วโมง</div></a>`;
    $app.innerHTML = `
      <section class="hero">
        <h1>เครื่องมือการเรียนรู้ ภาคเรียนที่ ${D.term}/${D.year}</h1>
        <p style="margin:0">เลือกรายวิชา → เลือกแผน/บทเรียน → ใช้เครื่องมือ ตัวอย่าง เครื่องคำนวณ และ Prompt AI ได้ทันทีบนเบราว์เซอร์
        ไม่ต้องติดตั้งโปรแกรม ไม่ต้องสมัครสมาชิก ใช้ได้ทั้งคอมพิวเตอร์และมือถือ</p>
      </section>
      <h2>รายวิชาพื้นฐาน (ตามหนังสือ สสวท.)</h2><div class="grid">${basic.map(card).join("")}</div>
      <h2>รายวิชาเพิ่มเติม (บูรณาการ AI ฟรี)</h2><div class="grid">${extra.map(card).join("")}</div>`;
  }

  function subjectPage(s) {
    const units = s.units.map(u => `
      <div class="unit"><h3><span class="pill">หน่วยที่ ${u.no}</span>${esc(u.name)}</h3>
      <div class="plans">${u.plans.map(p => `
        <a class="card plan" href="#/${s.id}/${p.no}">
          <div class="no" style="background:${s.color}">${p.no}</div>
          <div><b>${esc(p.title)}</b><div class="muted" style="font-size:14px">${p.hours} ชม. · ${s.mode === "ind" ? esc(p.ind) : "ผลการเรียนรู้ข้อ " + esc(p.ind)}${p.act ? " · " + esc(p.act) : ""}</div>
          <div style="margin-top:4px">${p.tools.map(t => `<span class="pill">🛠 ${esc(TOOLS.titleOf(t))}</span>`).join("")}</div></div>
        </a>`).join("")}</div></div>`).join("");
    const sched = `<div class="scroll"><table class="t"><tr><th>สัปดาห์</th><th>แผน</th><th>เรื่อง</th><th>ชม.</th></tr>
      ${s.schedule.map(r => `<tr><td>${r.week}</td><td>${r.plan ?? "-"}</td><td>${r.plan ? `<a href="#/${s.id}/${r.plan}">${esc(r.title)}</a>` : `<b>${esc(r.title)}</b>`}</td><td>${r.hours}</td></tr>`).join("")}
      </table></div>`;
    $app.innerHTML = `
      <div class="crumb"><a href="#/">รายวิชา</a> › ${esc(s.name)} ${s.short}</div>
      <section class="hero" style="border-left:6px solid ${s.color}">
        <div style="font-size:40px">${s.icon}</div>
        <h1>${esc(s.name)} ${s.short}</h1>
        <div><span class="pill">${s.code}</span><span class="pill">รายวิชา${s.kind}</span><span class="pill">40 ชั่วโมง · 1.0 หน่วยกิต</span></div>
        ${s.book ? `<p class="muted" style="margin:8px 0 0">📘 ${esc(s.book)}</p>` : ""}
      </section>
      <details class="card"><summary><b>คำอธิบายรายวิชา และ${s.mode === "ind" ? "ตัวชี้วัด" : "ผลการเรียนรู้"}</b></summary>
        <p>${esc(s.desc)}</p>
        <ol>${s.indicators.map(i => `<li>${s.mode === "ind" ? `<b>${esc(i.code)}</b> ` : ""}${esc(i.text)}</li>`).join("")}</ol>
      </details>
      ${units}
      <h2>กำหนดการสอน</h2>${sched}`;
  }

  function planPage(s, no) {
    const ps = allPlans(s);
    const i = ps.findIndex(p => p.no === no);
    const p = ps[i];
    if (!p) return subjectPage(s);
    const prev = ps[i - 1], next = ps[i + 1];
    $app.innerHTML = `
      <div class="crumb"><a href="#/">รายวิชา</a> › <a href="#/${s.id}">${esc(s.name)} ${s.short}</a> › แผนที่ ${p.no}</div>
      <section class="hero" style="border-left:6px solid ${s.color}">
        <div class="muted">หน่วยที่ ${p.unit.no} ${esc(p.unit.name)}</div>
        <h1>แผนที่ ${p.no} ${esc(p.title)}</h1>
        <span class="pill">⏱ ${p.hours} ชั่วโมง</span><span class="pill">🎯 ${s.mode === "ind" ? esc(p.ind) : "ผลการเรียนรู้ข้อ " + esc(p.ind)}</span>
        ${p.act ? `<span class="pill">📘 ${esc(p.act)}</span>` : ""}
      </section>
      <div class="two">
        <div class="card"><h3 style="margin-top:0">📌 สาระสำคัญ</h3><p style="margin:0">${esc(p.essence)}</p></div>
        <div class="card"><h3 style="margin-top:0">🧭 หัวข้อที่เรียน</h3><ul class="clean">${p.topics.map(t => `<li>${esc(t)}</li>`).join("")}</ul></div>
      </div>
      <div class="box"><b>💡 ตัวอย่าง:</b> <span style="white-space:pre-wrap">${esc(p.example)}</span></div>
      <a class="card" href="lab3d/index.html#${s.id}-${p.no}" target="_blank" rel="noopener" style="display:block;border-left:6px solid ${s.color}"><b>🧊 สื่อ 3 มิติของแผนนี้ ↗</b><div class="muted">เปิดแล็บสามมิติ หมุน ซูม ทดลอง พร้อมอธิบายทีละขั้นและคำถามเช็กความเข้าใจ</div></a>
      <h2>🛠 เครื่องมือ / เครื่องคำนวณ / แบบฝึก</h2>
      <div id="tools"></div>
      ${p.worksheets && p.worksheets.length ? `<h2>📄 ใบงานของแผนนี้</h2><div class="chips">${p.worksheets.map(w => `<span class="pill">ใบงานที่ ${esc(w.code)} ${esc(w.title)} · ${w.kind === "เดี่ยว" ? "งานเดี่ยว" : "งานกลุ่ม"} ${w.score} คะแนน</span>`).join("")}</div><p class="hint muted">รับใบงานฉบับพิมพ์จากครู หรือใน Google Classroom</p>` : ""}
      ${p.test && p.test.length ? `<h2>📝 แบบทดสอบหลังเรียน (${p.test.length} ข้อ)</h2><div class="card" id="ptest"></div>` : ""}
      <h2>🤖 ใช้ AI ช่วยเรียน (ฟรี)</h2>
      <div class="card">${p.ai.map(a => `<div class="prompt" style="margin:8px 0">${esc(a)}<button class="sm ghost" data-copy="${esc(a)}">คัดลอก</button></div>`).join("")}
        <p class="hint muted" style="margin:6px 0 0">ใช้ได้กับ Gemini · ChatGPT · Microsoft Copilot (บัญชีฟรี) — ตรวจสอบคำตอบของ AI ทุกครั้ง ไม่ใส่ข้อมูลส่วนตัว และระบุว่าใช้ AI ส่วนไหน</p></div>
      ${p.links.length ? `<h2>🔗 แหล่งเรียนรู้/เครื่องมือฟรี</h2><div class="chips">${p.links.map(l => `<a class="chip" target="_blank" rel="noopener" href="${esc(l.u)}">${esc(l.t)} ↗</a>`).join("")}</div>` : ""}
      <div class="navpn noprint">
        ${prev ? `<a class="card" href="#/${s.id}/${prev.no}">← แผนที่ ${prev.no} ${esc(prev.title)}</a>` : "<span></span>"}
        ${next ? `<a class="card" href="#/${s.id}/${next.no}">แผนที่ ${next.no} ${esc(next.title)} →</a>` : ""}
      </div>`;
    const box = document.getElementById("tools");
    p.tools.forEach(t => TOOLS.mount(box, t));
    const pt = document.getElementById("ptest");
    if (pt) TOOLS.quiz(pt, p.test);
  }

  function toolsPage() {
    const used = {};
    D.subjects.forEach(s => allPlans(s).forEach(p => p.tools.forEach(t => {
      (used[t] = used[t] || []).push({ s, p });
    })));
    const list = Object.keys(used).sort((a, b) => TOOLS.titleOf(a).localeCompare(TOOLS.titleOf(b), "th"));
    $app.innerHTML = `<h1>เครื่องมือทั้งหมด (${list.length})</h1>
      <p class="muted">คลิกเพื่อเปิดใช้งาน — แต่ละเครื่องมือผูกกับแผนการสอนที่ใช้</p>
      <div class="grid">${list.map(t => `<a class="card" href="#/tool/${encodeURIComponent(t)}"><b>🛠 ${esc(TOOLS.titleOf(t))}</b>
        <div class="muted" style="font-size:14px">${used[t].map(x => `${x.s.short} ${x.s.name} แผน ${x.p.no}`).join("<br>")}</div></a>`).join("")}</div>`;
  }

  function toolPage(t) {
    $app.innerHTML = `<div class="crumb"><a href="#/tools">เครื่องมือทั้งหมด</a></div><div id="tools"></div>`;
    TOOLS.mount(document.getElementById("tools"), t);
  }

  function aiPage() {
    const ai = [
      ["Gemini", "https://gemini.google.com/", "ถาม-ตอบ สรุป สร้างภาพ ช่วยเขียนโค้ด (บัญชี Google)"],
      ["ChatGPT", "https://chatgpt.com/", "ถาม-ตอบ เขียน วางแผน อธิบายโค้ด (รุ่นฟรี)"],
      ["Microsoft Copilot / Designer", "https://copilot.microsoft.com/", "ถาม-ตอบ สร้างภาพ (บัญชี Microsoft)"],
      ["Google Colab + Gemini", "https://colab.research.google.com/", "เขียน/รัน Python ฟรีบนคลาวด์ มีผู้ช่วย AI"],
      ["Google Stitch", "https://stitch.withgoogle.com/", "ออกแบบหน้าจอ UI จากคำอธิบาย ส่งออกโค้ด"],
      ["Canva for Education", "https://www.canva.com/education/", "ออกแบบกราฟิก สไลด์ วิดีโอ + Magic Studio ฟรีสำหรับครู/นักเรียน"],
      ["Teachable Machine", "https://teachablemachine.withgoogle.com/", "สอน AI จำแนกภาพ/เสียง ไม่ต้องเขียนโค้ด"],
      ["CapCut / Clipchamp", "https://www.capcut.com/", "ตัดต่อวิดีโอ ซับไตเติลอัตโนมัติ"],
      ["Photopea", "https://www.photopea.com/", "แต่งภาพบนเว็บ คล้าย Photoshop"],
      ["GitHub Pages", "https://pages.github.com/", "เผยแพร่เว็บไซต์ฟรี"],
    ];
    $app.innerHTML = `<h1>🤖 AI และเครื่องมือฟรีที่ใช้ในห้องเรียน</h1>
      <div class="box"><b>กติกา AI ในห้องเรียน (Explain → Try → Check)</b><ol style="margin:6px 0">
        <li>ให้ AI <b>อธิบาย</b>/บอกใบ้ก่อน ไม่ให้ทำแทนทั้งหมด</li>
        <li>ลอง<b>ทำเอง</b> แล้วใช้ AI ตรวจหรือเสนอแนะ</li>
        <li><b>ตรวจสอบ</b>ข้อเท็จจริงกับแหล่งข้อมูลจริง และระบุว่าใช้ AI ส่วนใด</li>
        <li>ไม่ใส่ข้อมูลส่วนตัว (เลขบัตร ที่อยู่ รหัสผ่าน ภาพเพื่อน) ลงใน AI</li></ol></div>
      <div class="grid">${ai.map(a => `<a class="card" target="_blank" rel="noopener" href="${a[1]}"><b>${a[0]} ↗</b><div class="muted" style="font-size:14px">${a[2]}</div></a>`).join("")}</div>
      <h2>สร้าง Prompt</h2><div id="tools"></div>`;
    TOOLS.mount(document.getElementById("tools"), "prompt:general");
  }

  function route() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
    window.scrollTo(0, 0);
    if (!parts.length) return home();
    if (parts[0] === "tools") return toolsPage();
    if (parts[0] === "tool") return toolPage(parts.slice(1).join("/"));
    if (parts[0] === "ai") return aiPage();
    const s = subj(parts[0]);
    if (!s) return home();
    if (parts[1]) return planPage(s, +parts[1]);
    subjectPage(s);
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-copy]");
    if (!b) return;
    navigator.clipboard?.writeText(b.dataset.copy).then(() => { b.textContent = "คัดลอกแล้ว ✓"; setTimeout(() => b.textContent = "คัดลอก", 1500); });
  });
  addEventListener("hashchange", route);
  route();
})();
