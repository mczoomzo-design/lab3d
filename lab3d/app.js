import { createLab } from './engine.js';
import { SUBJECTS } from './catalog.js';

const $ = (s) => document.querySelector(s);
const panel = { controls: $('#controls'), steps: $('#steps'), quiz: $('#quiz'), readouts: $('#readouts') };
const { L, reset } = createLab({ stage: $('#stage'), panel });
const cache = {};
let cur = null;

function subjectNav(sid) {
  $('#subs').innerHTML = SUBJECTS.map((s) => `<button type="button" class="sub ${s.id === sid ? 'on' : ''}" data-s="${s.id}">${s.short} ${s.name}</button>`).join('');
  $('#subs').querySelectorAll('.sub').forEach((b) => (b.onclick = () => (location.hash = b.dataset.s + '-1')));
  const s = SUBJECTS.find((x) => x.id === sid);
  $('#plans').innerHTML = `<h2>${s.short} ${s.name} · ${s.code}</h2>` + s.plans.map((p) =>
    `<button type="button" class="plan" data-n="${p.no}"><b>${String(p.no).padStart(2, '0')}</b><span>${p.title}</span></button>`).join('');
  $('#plans').querySelectorAll('.plan').forEach((b) => (b.onclick = () => (location.hash = sid + '-' + b.dataset.n)));
}

async function open(sid, no) {
  const s = SUBJECTS.find((x) => x.id === sid) || SUBJECTS[0];
  const p = s.plans.find((x) => x.no === no) || s.plans[0];
  if (!cur || cur.sid !== s.id) subjectNav(s.id);
  cur = { sid: s.id, no: p.no };
  document.querySelectorAll('.plan').forEach((b) => b.classList.toggle('on', +b.dataset.n === p.no));
  $('#meta').textContent = `${s.short} ${s.name} · แผนที่ ${p.no} · ${p.unit}`;
  $('#title').textContent = p.title;
  reset();
  try {
    cache[s.id] = cache[s.id] || (await import(`./scenes/${s.id}.js`)).default;
    if (cur.sid !== s.id || cur.no !== p.no) return;
    const sc = cache[s.id][p.no];
    $('#idea').innerHTML = sc.idea;
    sc.build(L);
  } catch (e) {
    console.error(e);
    $('#idea').innerHTML = `<span class="err">เปิดฉากนี้ไม่ได้: ${e.message}</span>`;
  }
}

function route() {
  const m = /^#?([a-z0-9]+)-(\d+)$/.exec(location.hash);
  if (m) open(m[1], +m[2]); else open('m2', 1);
}
addEventListener('hashchange', route);
route();
