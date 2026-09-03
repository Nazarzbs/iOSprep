// Генератор mock.html — прогін контрольних питань під таймер.
// Викликається з gen_prep_html.js; джерело питань — ті самі prep_data_*.js.
const fs = require("fs");
const path = require("path");

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

module.exports = function build(pillars) {
  const LABEL = { swift: "Swift", swiftui: "SwiftUI", uikit: "UIKit", adj: "Суміжне" };
  const bank = [];
  for (const { key, data } of pillars) {
    data.topics.forEach((topic, i) => {
      const topicId = `${key}-${i}`;
      topic.qs.forEach((item, j) => {
        const isObj = typeof item !== "string";
        bank.push({
          id: `${topicId}:${j}`,
          pillar: key,
          pillarLabel: LABEL[key] || key,
          topic: topic.name,
          topicId,
          p: topic.p,
          q: isObj ? item.q : item,
          a: isObj ? (Array.isArray(item.a) ? item.a : [item.a]).filter(Boolean) : [],
          code: isObj && item.code ? item.code : [],
        });
      });
    });
  }
  const withAnswers = bank.filter(q => q.a.length || q.code.length).length;
  const json = JSON.stringify(bank).replace(/</g, "\\u003c");

  const html = `<!doctype html>
<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Мок-співбесіда — прогін контрольних питань під таймер</title>
<style>
  :root {
    --ground: #FAFBFC; --card: #FFFFFF; --ink: #1B2430; --muted: #5A6B7E;
    --faint: #8B99A9; --line: #E3E8EE; --accent: #F05138; --accent-deep: #C93C27;
    --accent-wash: #FEF0ED; --good: #2E7D4F; --good-wash: #EAF5EE;
    --warn: #B7791F; --warn-wash: #FBF3E3; --info: #2B6CB0; --info-wash: #EBF2FA;
    --code-bg: #232936; --code-ink: #E8ECF1;
    --sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
    --mono: ui-monospace, "SF Mono", SFMono-Regular, Menlo, monospace;
  }
  html { background: var(--ground); }
  body { font-family: var(--sans); color: var(--ink); line-height: 1.55; margin: 0; -webkit-font-smoothing: antialiased; }
  .wrap { max-width: 820px; margin: 0 auto; padding: 34px 20px 90px; }
  .eyebrow { font-family: var(--mono); font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--accent-deep); margin-bottom: 10px; }
  h1 { font-size: clamp(24px, 4vw, 32px); font-weight: 800; letter-spacing: -.02em; line-height: 1.13; margin: 0 0 10px; }
  .lede { font-size: 15px; color: var(--muted); max-width: 66ch; margin: 0 0 22px; }
  a.back { font-size: 13px; font-weight: 600; color: var(--info); text-decoration: none; }

  .panel { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 18px 20px; }
  .row { display: flex; flex-wrap: wrap; gap: 18px; margin-bottom: 14px; }
  .fld { display: flex; flex-direction: column; gap: 5px; }
  .fld label { font-family: var(--mono); font-size: 10.5px; letter-spacing: .09em; text-transform: uppercase; color: var(--faint); font-weight: 700; }
  select { font-family: var(--sans); font-size: 13.5px; padding: 7px 10px; border: 1px solid var(--line); border-radius: 9px; background: var(--ground); color: var(--ink); }
  .btn { font-family: var(--sans); font-size: 14px; font-weight: 700; cursor: pointer; padding: 10px 20px; border-radius: 999px; border: 1px solid var(--ink); background: var(--ink); color: #fff; }
  .btn:hover { background: #000; }
  .btn.ghost { background: var(--card); color: var(--muted); border-color: var(--line); font-weight: 600; }
  .btn.ghost:hover { color: var(--ink); border-color: var(--faint); }
  .btn:disabled { opacity: .45; cursor: not-allowed; }

  .bankline { font-size: 12.5px; color: var(--muted); margin-top: 12px; display: flex; flex-wrap: wrap; gap: 12px; }
  .chip { font-family: var(--mono); font-size: 11.5px; padding: 3px 9px; border-radius: 999px; border: 1px solid var(--line); background: var(--ground); }
  .chip.know { color: var(--good); border-color: #CBE5D3; background: var(--good-wash); }
  .chip.shaky { color: var(--warn); border-color: #EBD9B0; background: var(--warn-wash); }
  .chip.no { color: var(--accent-deep); border-color: #F6CFC6; background: var(--accent-wash); }

  .qhead { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
  .counter { font-family: var(--mono); font-size: 12.5px; color: var(--faint); font-variant-numeric: tabular-nums; }
  .topiclab { font-size: 12.5px; color: var(--muted); }
  .prio { font-family: var(--mono); font-size: 10.5px; font-weight: 700; letter-spacing: .05em; padding: 2px 9px; border-radius: 999px; }
  .prio.P0 { background: var(--accent-wash); color: var(--accent-deep); border: 1px solid #F6CFC6; }
  .prio.P1 { background: var(--warn-wash); color: var(--warn); border: 1px solid #EBD9B0; }
  .prio.P2 { background: var(--info-wash); color: var(--info); border: 1px solid #C4D9EE; }
  .timer { margin-left: auto; font-family: var(--mono); font-size: 19px; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--good); }
  .timer.warn { color: var(--warn); }
  .timer.over { color: var(--accent-deep); }

  .qtext { font-size: 19px; font-weight: 700; line-height: 1.4; letter-spacing: -.01em; margin: 0 0 18px; max-width: 60ch; }
  .ans { background: var(--good-wash); border: 1px solid #CBE5D3; border-radius: 11px; padding: 12px 16px; margin-bottom: 16px; }
  .ans .blk-t { font-family: var(--mono); font-size: 10.5px; letter-spacing: .09em; text-transform: uppercase; font-weight: 700; color: var(--good); margin-bottom: 6px; }
  .ans p { font-size: 14px; margin: 0 0 7px; color: #38556B; max-width: 76ch; }
  .ans p:last-child { margin-bottom: 0; }
  .ans.none p { color: var(--muted); font-style: italic; }
  pre { background: var(--code-bg); color: var(--code-ink); border-radius: 10px; padding: 12px 14px; overflow-x: auto; font-family: var(--mono); font-size: 12px; line-height: 1.5; margin: 8px 0 0; }
  .rate { display: flex; flex-wrap: wrap; gap: 9px; align-items: center; }
  .rate .btn { padding: 9px 16px; font-size: 13.5px; }
  .b-know { background: var(--good); border-color: var(--good); }
  .b-know:hover { background: #256B41; }
  .b-shaky { background: var(--warn); border-color: var(--warn); }
  .b-shaky:hover { background: #9C6716; }
  .b-no { background: var(--accent-deep); border-color: var(--accent-deep); }
  .b-no:hover { background: #A93220; }
  .sidelinks { margin-top: 14px; font-size: 12.5px; display: flex; gap: 14px; flex-wrap: wrap; }
  .sidelinks a, .sidelinks button { color: var(--info); background: none; border: none; padding: 0; font: inherit; cursor: pointer; text-decoration: none; }

  .sum { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin: 16px 0 20px; }
  .stat { background: var(--ground); border: 1px solid var(--line); border-radius: 11px; padding: 12px 14px; }
  .stat b { display: block; font-size: 25px; font-weight: 800; font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
  .stat span { font-size: 12px; color: var(--muted); }
  .weak { margin: 0; padding-left: 18px; }
  .weak li { font-size: 13.5px; padding: 3px 0; }
  .weak a { color: var(--info); text-decoration: none; }
  .weak em { color: var(--faint); font-style: normal; font-size: 12px; }
  footer { margin-top: 40px; font-size: 12.5px; color: var(--faint); border-top: 1px solid var(--line); padding-top: 14px; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
<div class="wrap">
  <div class="eyebrow">iOS Interview Prep · прогін</div>
  <h1>Мок-співбесіда</h1>
  <p class="lede">Питання йдуть по одному, таймер тікає. Проговорюєш відповідь уголос за 1–2 хвилини, тоді відкриваєш еталон і чесно оцінюєш себе. Оцінки зберігаються: наступного разу першими прийдуть ті, де ти плавав.</p>
  <p><a class="back" href="prep.html">← Теорія (${bank.length} питань, ${withAnswers} з відповіддю)</a> &nbsp;·&nbsp; <a class="back" href="interview.html">Розмовна частина →</a></p>

  <div class="panel" id="setup">
    <div class="row">
      <div class="fld"><label>Розділ</label>
        <select id="fPillar">
          <option value="all">Усі</option>
          <option value="swift">Swift</option>
          <option value="swiftui">SwiftUI</option>
          <option value="uikit">UIKit</option>
          <option value="adj">Суміжне</option>
        </select>
      </div>
      <div class="fld"><label>Пріоритет</label>
        <select id="fPrio">
          <option value="all">Усі</option>
          <option value="P0">Лише P0</option>
          <option value="P0P1">P0 + P1</option>
        </select>
      </div>
      <div class="fld"><label>Порядок</label>
        <select id="fMode">
          <option value="smart">Розумний — слабкі першими</option>
          <option value="random">Випадковий</option>
          <option value="weak">Лише слабкі та нові</option>
          <option value="order">За порядком тем</option>
        </select>
      </div>
      <div class="fld"><label>Довжина</label>
        <select id="fCount">
          <option value="10">10 питань</option>
          <option value="20" selected>20 питань</option>
          <option value="40">40 питань</option>
          <option value="0">Усі</option>
        </select>
      </div>
    </div>
    <button class="btn" id="start">Почати прогін</button>
    <div class="bankline" id="bankline"></div>
  </div>

  <div class="panel" id="quiz" hidden>
    <div class="qhead">
      <span class="counter" id="counter"></span>
      <span class="prio" id="qprio"></span>
      <span class="topiclab" id="qtopic"></span>
      <span class="timer" id="timer">0:00</span>
    </div>
    <p class="qtext" id="qtext"></p>
    <div id="ansWrap" hidden></div>
    <div class="rate" id="rateRow" hidden>
      <button class="btn b-know" data-r="know">✅ Знав</button>
      <button class="btn b-shaky" data-r="shaky">🤔 Плавав</button>
      <button class="btn b-no" data-r="no">❌ Не знав</button>
    </div>
    <button class="btn" id="reveal">Показати відповідь</button>
    <div class="sidelinks">
      <a id="openTopic" href="#" target="_blank" rel="noopener">Відкрити тему в теорії ↗</a>
      <button id="skip">Пропустити</button>
      <button id="finish">Завершити прогін</button>
    </div>
  </div>

  <div class="panel" id="result" hidden>
    <h2 style="margin:0 0 4px;font-size:19px">Прогін завершено</h2>
    <p class="lede" id="resLede" style="margin-bottom:10px"></p>
    <div class="sum" id="resSum"></div>
    <div id="weakWrap" hidden>
      <div class="eyebrow" style="margin-bottom:8px">Що повторити</div>
      <ul class="weak" id="weakList"></ul>
    </div>
    <div class="row" style="margin:18px 0 0">
      <button class="btn" id="againWeak">Прогнати слабкі ще раз</button>
      <button class="btn ghost" id="againNew">Новий прогін</button>
    </div>
  </div>

  <footer>Оцінки й час зберігаються локально у браузері (localStorage). Питання беруться з тих самих даних, що й теорія.</footer>
</div>

<script>
(function () {
  const BANK = ${json};
  const KEY = "ios-prep-mock-v1";
  const $ = id => document.getElementById(id);

  let stats = {};
  try { stats = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(stats)); } catch (e) {} };

  let queue = [], pos = 0, t0 = 0, tick = null, run = [];

  function bankline() {
    const c = { know: 0, shaky: 0, no: 0, fresh: 0 };
    BANK.forEach(q => { const s = stats[q.id]; c[s ? s.r : "fresh"]++; });
    $("bankline").innerHTML =
      '<span class="chip">' + BANK.length + ' питань у банку</span>' +
      '<span class="chip know">знав: ' + c.know + '</span>' +
      '<span class="chip shaky">плавав: ' + c.shaky + '</span>' +
      '<span class="chip no">не знав: ' + c.no + '</span>' +
      '<span class="chip">ще не питали: ' + c.fresh + '</span>';
  }

  const rank = q => {
    const s = stats[q.id];
    if (!s) return 1;
    return s.r === "no" ? 0 : s.r === "shaky" ? 0.5 : 3;
  };

  function build() {
    const pillar = $("fPillar").value, prio = $("fPrio").value;
    const mode = $("fMode").value, n = parseInt($("fCount").value, 10);
    let list = BANK.filter(q =>
      (pillar === "all" || q.pillar === pillar) &&
      (prio === "all" || (prio === "P0" ? q.p === "P0" : q.p !== "P2")));
    if (mode === "weak") list = list.filter(q => rank(q) <= 1);
    if (mode === "weak") mode = "smart";
    if (mode === "smart") list = list.map(q => [q, rank(q) + Math.random() * 0.49]).sort((a, b) => a[1] - b[1]).map(x => x[0]);
    else if (mode === "random") list = list.map(q => [q, Math.random()]).sort((a, b) => a[1] - b[1]).map(x => x[0]);
    return n ? list.slice(0, n) : list;
  }

  function fmt(sec) { return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0"); }

  function startTimer() {
    t0 = Date.now();
    const el = $("timer");
    const upd = () => {
      const s = Math.floor((Date.now() - t0) / 1000);
      el.textContent = fmt(s);
      el.className = "timer" + (s >= 120 ? " over" : s >= 60 ? " warn" : "");
    };
    upd();
    clearInterval(tick);
    tick = setInterval(upd, 1000);
  }

  function show() {
    const q = queue[pos];
    $("counter").textContent = "питання " + (pos + 1) + " / " + queue.length;
    $("qprio").textContent = q.p;
    $("qprio").className = "prio " + q.p;
    $("qtopic").textContent = q.pillarLabel + " · " + q.topic;
    $("qtext").textContent = q.q;
    $("openTopic").href = "prep.html#" + q.topicId;
    $("ansWrap").hidden = true;
    $("rateRow").hidden = true;
    $("reveal").hidden = false;
    startTimer();
  }

  function reveal() {
    const q = queue[pos];
    const has = q.a.length || q.code.length;
    let inner = '<div class="ans' + (has ? '' : ' none') + '"><div class="blk-t">' + (has ? 'Еталон' : 'Відповіді ще нема') + '</div>';
    if (has) {
      inner += q.a.map(p => "<p>" + p.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</p>").join("");
      if (q.code.length) inner += "<pre>" + q.code.join("\\n").replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</pre>";
    } else {
      inner += "<p>Для цього питання еталонної відповіді ще не написано — відкрий тему в теорії і звірся з блоками.</p>";
    }
    $("ansWrap").innerHTML = inner + "</div>";
    $("ansWrap").hidden = false;
    $("reveal").hidden = true;
    $("rateRow").hidden = false;
  }

  function rate(r) {
    const q = queue[pos];
    const sec = Math.floor((Date.now() - t0) / 1000);
    const prev = stats[q.id];
    stats[q.id] = { r: r, t: sec, n: (prev && prev.n || 0) + 1, last: Date.now() };
    save();
    run.push({ q: q, r: r, t: sec });
    next();
  }

  function next() {
    pos++;
    if (pos >= queue.length) return finish();
    show();
  }

  function finish() {
    clearInterval(tick);
    $("quiz").hidden = true;
    $("result").hidden = false;
    const c = { know: 0, shaky: 0, no: 0 };
    let total = 0;
    run.forEach(x => { c[x.r]++; total += x.t; });
    const answered = run.length || 1;
    $("resLede").textContent = run.length
      ? "Пройдено " + run.length + " питань за " + fmt(total) + ", у середньому " + fmt(Math.round(total / answered)) + " на питання."
      : "Жодного питання не оцінено.";
    $("resSum").innerHTML =
      '<div class="stat"><b style="color:var(--good)">' + c.know + '</b><span>знав</span></div>' +
      '<div class="stat"><b style="color:var(--warn)">' + c.shaky + '</b><span>плавав</span></div>' +
      '<div class="stat"><b style="color:var(--accent-deep)">' + c.no + '</b><span>не знав</span></div>' +
      '<div class="stat"><b>' + Math.round(c.know / answered * 100) + '%</b><span>впевнених відповідей</span></div>';
    const weak = run.filter(x => x.r !== "know");
    $("weakWrap").hidden = !weak.length;
    $("againWeak").hidden = !weak.length;
    $("weakList").innerHTML = weak.map(x =>
      '<li><a href="prep.html#' + x.q.topicId + '" target="_blank" rel="noopener">' + x.q.q.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</a> " +
      '<em>— ' + x.q.topic + " · " + fmt(x.t) + "</em></li>").join("");
    bankline();
  }

  function launch(list) {
    if (!list.length) { alert("За цими фільтрами питань немає."); return; }
    queue = list; pos = 0; run = [];
    $("setup").hidden = true; $("result").hidden = true; $("quiz").hidden = false;
    show();
  }

  $("start").addEventListener("click", () => launch(build()));
  $("reveal").addEventListener("click", reveal);
  $("skip").addEventListener("click", next);
  $("finish").addEventListener("click", finish);
  document.querySelectorAll("#rateRow .btn").forEach(b => b.addEventListener("click", () => rate(b.dataset.r)));
  $("againNew").addEventListener("click", () => { $("result").hidden = true; $("setup").hidden = false; });
  $("againWeak").addEventListener("click", () => {
    const ids = new Set(run.filter(x => x.r !== "know").map(x => x.q.id));
    launch(BANK.filter(q => ids.has(q.id)));
  });
  document.addEventListener("keydown", e => {
    if ($("quiz").hidden) return;
    if (e.code === "Space" && !$("reveal").hidden) { e.preventDefault(); reveal(); }
    else if (!$("rateRow").hidden && ["1", "2", "3"].includes(e.key)) rate({ "1": "know", "2": "shaky", "3": "no" }[e.key]);
  });

  bankline();
})();
</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(__dirname, "..", "mock.html"), html);
  console.log("mock.html:", bank.length, "питань,", withAnswers, "з відповіддю,", (html.length / 1024).toFixed(0) + " KB");
};
