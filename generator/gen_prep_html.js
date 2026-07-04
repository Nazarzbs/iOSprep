const fs = require("fs");

const pillars = [
  { key: "swift", data: require("./prep_data_swift.js") },
  { key: "swiftui", data: require("./prep_data_swiftui.js") },
  { key: "uikit", data: require("./prep_data_uikit.js") },
  { key: "adj", data: require("./prep_data_adjacent.js") },
];

const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const SITE = "https://nazarzbs.github.io/iOSprep/prep.html";
const REPO = "https://github.com/Nazarzbs/iOSprep";

let topicsHTML = "";
let total = 0;

for (const { key, data } of pillars) {
  topicsHTML += `
  <section data-pillar="${key}">
    <div class="pillar-head"><h2>${esc(data.title)}</h2></div>
    <p class="pillar-note">${esc(data.note)}</p>
  `;
  data.topics.forEach((topic, i) => {
    total++;
    const id = `${key}-${i}`;
    const noteBody = `📍 Тема на сайті: ${SITE}#${id}\n\n---\n\n`;
    const noteURL = `${REPO}/discussions/new?category=general&title=${encodeURIComponent(topic.name)}&body=${encodeURIComponent(noteBody)}`;
    const threadsURL = `${REPO}/discussions?discussions_q=${encodeURIComponent('"' + topic.name + '"')}`;
    topicsHTML += `
    <div class="topic" id="${id}" data-id="${id}" data-pillar="${key}" data-prio="${topic.p}">
      <div class="topic-head">
        <input type="checkbox" aria-label="закрито">
        <h3>${esc(topic.name)}</h3>
        <button class="note-btn open-cmt" title="Коментарі до цієї теми">💬</button>
        <a class="note-btn" href="${esc(threadsURL)}" target="_blank" rel="noopener" title="Гілки цієї теми на GitHub">🧵</a>
        <span class="prio ${topic.p}">${topic.p}</span>
      </div>
      <details>
        <summary>Розгорнути тему</summary>
        <div class="topic-body">
          <div class="blk"><div class="blk-t accent">Що це і як працює</div>
            ${topic.what.map(p => `<p>${esc(p)}</p>`).join("")}
          </div>
          <div class="blk"><div class="blk-t accent">Яку проблему вирішує</div>
            <p>${esc(topic.problem)}</p>
          </div>
          <div class="blk"><div class="blk-t accent">Де використовується на практиці</div>
            <ul>${topic.where.map(w => `<li>${esc(w)}</li>`).join("")}</ul>
          </div>
          ${topic.code && topic.code.length ? `
          <div class="blk"><div class="blk-t info">Приклад</div>
            <pre>${esc(topic.code.join("\n"))}</pre>
          </div>` : ""}
          <div class="blk"><div class="blk-t warn">Пастки та типові помилки</div>
            <ul class="warn-list">${topic.traps.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
          </div>
          <div class="blk qs"><div class="blk-t good">Контрольні питання — відповів уголос за 1–2 хв → став ✓</div>
            <ul>${topic.qs.map(q => `<li>${esc(q)}</li>`).join("")}</ul>
          </div>
          <div class="blk cmt-blk">
            <button class="cmt-btn" data-term="${esc(topic.name)}">💬 Показати коментарі до теми</button>
            <button class="cmt-btn code-tpl" title="Скопіювати markdown-заготовку для Swift-коду — встав її в коментар">⌨️ Шаблон коду</button>
            <div class="cmt-slot"></div>
          </div>
        </div>
      </details>
    </div>`;
  });
  topicsHTML += `</section>`;
}

const weeks = [
  ["Тиждень 1", "Swift: памʼять + closures + types", "Value/reference, optionals, properties, closures, ARC і retain cycles. Це половина всіх «валящих» питань. Щодня — одна тема: шість блоків, приклад коду рукою, контрольні питання вголос."],
  ["Тиждень 2", "Swift: конкурентність + протоколи", "GCD (2 дні — найважче), async/await + actors (2 дні), протоколи/generics/dispatch (2 дні). Пиши приклади у Playground — на співбесіді просять код."],
  ["Тиждень 3", "UIKit повністю + суміжне", "Lifecycle, AutoLayout, таблиці — по дню, ти це знаєш з роботи, треба структурувати відповіді. Далі responder chain, navigation, networking, persistence."],
  ["Тиждень 4", "SwiftUI + архітектура + мок-співбесіди", "Data flow та identity (2 дні), layout/navigation/animations (2 дні). Останні 2 дні — прогін по контрольних питаннях уголос, англійською і українською."],
];

const tips = [
  "Кожну теорію привʼязуй до свого досвіду: «weak delegate — у нас в Eatery Club так звʼязані...». У блоках «Де використовується» позначені твої робочі кейси — це готові відповіді.",
  "Структура відповіді: яку проблему вирішує (1 речення) → як працює (2–3 речення) → пастка або приклад з практики. Відповідь «від проблеми» звучить на рівень вище.",
  "Не знаєш — кажи чесно і міркуй уголос: «точно не скажу, але логічно припускаю...» — це цінують більше за мовчання.",
  "Підготуй 3 готові історії: складний баг; фіча, якою пишаєшся (Live Activities!); дедлайн/конфлікт — для поведінкової частини.",
  "Live coding: тренуй руками без автокомпліту — окремий тренажер із 22 завданнями в тебе вже є (iOS_LiveCoding_Trainer.html).",
];

const html = `<!doctype html>
<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>iOS Interview Prep — розширений план: Swift · SwiftUI · UIKit</title>
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
  body { font-family: var(--sans); color: var(--ink); line-height: 1.55; -webkit-font-smoothing: antialiased; }
  .wrap { max-width: 920px; margin: 0 auto; padding: 40px 20px 100px; }
  .eyebrow { font-family: var(--mono); font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--accent-deep); margin-bottom: 10px; }
  h1 { font-size: clamp(25px, 4vw, 35px); font-weight: 800; letter-spacing: -.02em; line-height: 1.13; margin: 0 0 10px; text-wrap: balance; }
  .lede { font-size: 15.5px; color: var(--muted); max-width: 68ch; margin: 0 0 18px; }

  .toolbar { position: sticky; top: 0; z-index: 20; background: var(--ground); padding: 10px 0 12px; border-bottom: 1px solid var(--line); margin-bottom: 8px; }
  .filters { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 10px; }
  .fbtn { font-family: var(--sans); font-size: 13px; font-weight: 600; cursor: pointer; padding: 5px 13px; border-radius: 999px; border: 1px solid var(--line); background: var(--card); color: var(--muted); }
  .fbtn.active { background: var(--ink); color: #fff; border-color: var(--ink); }
  .fbtn.hide-done.active { background: var(--good); border-color: var(--good); }
  .progress-label { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--muted); margin-bottom: 5px; }
  .progress-label b { color: var(--ink); font-variant-numeric: tabular-nums; }
  .pbar { height: 7px; background: #EDF0F3; border-radius: 4px; overflow: hidden; }
  .pbar i { display: block; height: 100%; width: 0; background: linear-gradient(90deg, var(--accent), var(--accent-deep)); transition: width .25s; }

  section { margin-top: 38px; }
  .pillar-head { border-bottom: 2px solid var(--ink); padding-bottom: 6px; margin-bottom: 4px; }
  .pillar-head h2 { font-size: 21px; font-weight: 800; margin: 0; letter-spacing: -.01em; }
  .pillar-note { font-size: 13.5px; color: var(--muted); font-style: italic; margin: 6px 0 16px; max-width: 74ch; }

  .topic { background: var(--card); border: 1px solid var(--line); border-radius: 13px; margin-bottom: 11px; overflow: hidden; scroll-margin-top: 150px; }
  .topic.done { opacity: .6; }
  .topic:target { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-wash); }
  .topic-head { display: grid; grid-template-columns: auto 1fr auto auto auto; gap: 10px; align-items: center; padding: 13px 16px; }
  .note-btn { text-decoration: none; font-size: 15px; line-height: 1; padding: 4px 6px; border-radius: 8px; border: 1px solid transparent; opacity: .55; background: none; cursor: pointer; }
  .note-btn:hover { opacity: 1; border-color: var(--line); background: var(--ground); }
  .cmt-btn { font-family: var(--sans); font-size: 13px; font-weight: 600; cursor: pointer; padding: 7px 14px; border-radius: 999px; border: 1px solid var(--line); background: var(--ground); color: var(--muted); }
  .cmt-btn:hover { border-color: var(--info); color: var(--info); }
  .cmt-slot { margin-top: 10px; }
  .cmt-slot iframe { width: 100%; }
  .topic-head input { width: 19px; height: 19px; accent-color: var(--good); cursor: pointer; }
  .topic-head h3 { margin: 0; font-size: 15.5px; font-weight: 700; }
  .topic.done h3 { text-decoration: line-through; text-decoration-color: var(--faint); color: var(--faint); }
  .prio { font-family: var(--mono); font-size: 10.5px; font-weight: 700; letter-spacing: .05em; padding: 2px 9px; border-radius: 999px; }
  .prio.P0 { background: var(--accent-wash); color: var(--accent-deep); border: 1px solid #F6CFC6; }
  .prio.P1 { background: var(--warn-wash); color: var(--warn); border: 1px solid #EBD9B0; }
  .prio.P2 { background: var(--info-wash); color: var(--info); border: 1px solid #C4D9EE; }

  details { border-top: 1px solid var(--line); }
  details summary { cursor: pointer; padding: 8px 16px; font-size: 13px; font-weight: 600; color: var(--info); list-style: none; user-select: none; background: #FBFCFD; }
  details summary::before { content: "▸ "; }
  details[open] summary::before { content: "▾ "; }
  details[open] summary { border-bottom: 1px solid var(--line); }
  .topic-body { padding: 6px 18px 16px; }

  .blk { margin-top: 12px; }
  .blk-t { font-family: var(--mono); font-size: 10.5px; letter-spacing: .09em; text-transform: uppercase; font-weight: 700; margin-bottom: 5px; }
  .blk-t.accent { color: var(--accent-deep); }
  .blk-t.info { color: var(--info); }
  .blk-t.warn { color: var(--warn); }
  .blk-t.good { color: var(--good); }
  .blk p { margin: 0 0 8px; font-size: 14px; max-width: 78ch; }
  .blk ul { margin: 0; padding-left: 18px; }
  .blk li { font-size: 13.5px; padding: 2px 0; max-width: 76ch; }
  .warn-list li::marker { content: "⚠ "; }
  .qs { background: var(--good-wash); border: 1px solid #CBE5D3; border-radius: 10px; padding: 10px 14px; }

  pre { background: var(--code-bg); color: var(--code-ink); border-radius: 10px; padding: 13px 15px; overflow-x: auto; font-family: var(--mono); font-size: 12.2px; line-height: 1.5; margin: 4px 0 0; }

  .week { display: grid; grid-template-columns: 100px 1fr; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--line); }
  .week:last-child { border-bottom: none; }
  .week .when { font-family: var(--mono); font-size: 12.5px; color: var(--accent-deep); font-weight: 600; padding-top: 2px; }
  .week h3 { margin: 0 0 3px; font-size: 15px; font-weight: 700; }
  .week p { margin: 0; font-size: 13.5px; color: var(--muted); max-width: 74ch; }
  @media (max-width: 560px) { .week { grid-template-columns: 1fr; gap: 3px; } }

  .tips { background: var(--card); border: 1px solid var(--line); border-left: 3px solid var(--accent); border-radius: 12px; padding: 16px 20px; margin-top: 16px; }
  .tips ul { margin: 0; padding-left: 18px; }
  .tips li { font-size: 13.5px; padding: 3px 0; max-width: 76ch; }

  footer { margin-top: 55px; font-size: 12.5px; color: var(--faint); border-top: 1px solid var(--line); padding-top: 14px; }
</style>
</head>
<body>

<div class="wrap">
  <div class="eyebrow">iOS Interview Prep · розширена версія</div>
  <h1>План підготовки до співбесід: 37 тем углиб</h1>
  <p class="lede">Кожна тема — шість блоків: як працює → яку проблему вирішує → де застосовується (з кейсами з твоєї роботи) → код → пастки → контрольні питання. Відповів на контрольні уголос за 1–2 хвилини — став галочку. Прогрес зберігається у браузері.</p>

  <div class="toolbar">
    <div class="filters" id="pillarFilters">
      <button class="fbtn active" data-pillar="all">Усі</button>
      <button class="fbtn" data-pillar="swift">Swift</button>
      <button class="fbtn" data-pillar="swiftui">SwiftUI</button>
      <button class="fbtn" data-pillar="uikit">UIKit</button>
      <button class="fbtn" data-pillar="adj">Суміжне</button>
      <a class="fbtn" href="schedule.html" style="margin-left:auto">📅 Розклад</a>
    </div>
    <div class="filters" id="prioFilters">
      <button class="fbtn active" data-prio="all">Всі пріоритети</button>
      <button class="fbtn" data-prio="P0">Лише P0</button>
      <button class="fbtn" data-prio="P1">Лише P1</button>
      <button class="fbtn" data-prio="P2">Лише P2</button>
      <button class="fbtn hide-done" id="hideDone">Сховати закриті</button>
    </div>
    <div class="progress-label"><span>Закрито тем</span><b id="pcount">0 / ${total}</b></div>
    <div class="pbar"><i id="pfill"></i></div>
  </div>

  ${topicsHTML}
</div>

<script>
(function () {
  const KEY = "ios-prep-deep-v1";
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}

  const topics = Array.from(document.querySelectorAll(".topic"));
  const sections = Array.from(document.querySelectorAll("section[data-pillar]"));
  const count = document.getElementById("pcount");
  const fill = document.getElementById("pfill");
  let pillar = "all", prio = "all", hideDone = false;

  function refresh() {
    let done = 0;
    topics.forEach(el => {
      const isDone = el.classList.contains("done");
      if (isDone) done++;
      const ok = (pillar === "all" || el.dataset.pillar === pillar)
              && (prio === "all" || el.dataset.prio === prio)
              && (!hideDone || !isDone);
      el.style.display = ok ? "" : "none";
    });
    sections.forEach(sec => {
      const visible = sec.querySelectorAll(".topic:not([style*='display: none'])").length;
      sec.style.display = visible ? "" : "none";
    });
    count.textContent = done + " / " + topics.length;
    fill.style.width = (done / topics.length * 100) + "%";
  }

  topics.forEach(el => {
    const box = el.querySelector("input[type=checkbox]");
    if (saved[el.dataset.id]) { box.checked = true; el.classList.add("done"); }
    box.addEventListener("change", () => {
      el.classList.toggle("done", box.checked);
      saved[el.dataset.id] = box.checked;
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
      refresh();
    });
  });

  document.querySelectorAll("#pillarFilters .fbtn").forEach(btn =>
    btn.addEventListener("click", () => {
      document.querySelectorAll("#pillarFilters .fbtn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      pillar = btn.dataset.pillar;
      refresh();
    }));

  document.querySelectorAll("#prioFilters .fbtn[data-prio]").forEach(btn =>
    btn.addEventListener("click", () => {
      document.querySelectorAll("#prioFilters .fbtn[data-prio]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      prio = btn.dataset.prio;
      refresh();
    }));

  document.getElementById("hideDone").addEventListener("click", function () {
    hideDone = !hideDone;
    this.classList.toggle("active", hideDone);
    refresh();
  });

  const GISCUS = { repo: "Nazarzbs/iOSprep", repoId: "R_kgDOTMyapQ", category: "General", categoryId: "DIC_kwDOTMyapc4DAeP9" };
  const CMT_SHOW = "💬 Показати коментарі до теми";

  function loadComments(btn) {
    const slot = btn.parentElement.querySelector(".cmt-slot");
    document.querySelectorAll(".cmt-slot").forEach(s => {
      if (s !== slot && s.innerHTML) {
        s.innerHTML = "";
        s.parentElement.querySelector(".cmt-btn").textContent = CMT_SHOW;
      }
    });
    if (slot.innerHTML) {
      slot.innerHTML = "";
      btn.textContent = CMT_SHOW;
      return;
    }
    const s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.async = true;
    s.crossOrigin = "anonymous";
    const cfg = {
      "data-repo": GISCUS.repo, "data-repo-id": GISCUS.repoId,
      "data-category": GISCUS.category, "data-category-id": GISCUS.categoryId,
      "data-mapping": "specific", "data-term": btn.dataset.term,
      "data-strict": "0", "data-reactions-enabled": "1", "data-emit-metadata": "0",
      "data-input-position": "top", "data-theme": "light", "data-lang": "uk"
    };
    for (const [k, v] of Object.entries(cfg)) s.setAttribute(k, v);
    slot.appendChild(s);
    btn.textContent = "✕ Сховати коментарі";
  }

  document.querySelectorAll(".cmt-btn:not(.code-tpl)").forEach(b => b.addEventListener("click", () => loadComments(b)));

  document.querySelectorAll(".code-tpl").forEach(b => b.addEventListener("click", () => {
    navigator.clipboard.writeText("\\u0060\\u0060\\u0060swift\\n// твій код\\n\\u0060\\u0060\\u0060").then(() => {
      b.textContent = "✓ Скопійовано — встав у коментар (Cmd+V)";
      setTimeout(() => { b.textContent = "⌨️ Шаблон коду"; }, 2500);
    });
  }));

  document.querySelectorAll(".open-cmt").forEach(b => b.addEventListener("click", () => {
    const topic = b.closest(".topic");
    topic.querySelector("details").open = true;
    const cbtn = topic.querySelector(".cmt-btn");
    if (!topic.querySelector(".cmt-slot").innerHTML) loadComments(cbtn);
    setTimeout(() => cbtn.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  }));

  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) {
      const det = target.querySelector("details");
      if (det) det.open = true;
      setTimeout(() => target.scrollIntoView({ block: "start" }), 50);
    }
  }

  refresh();
})();
</script>
</body>
</html>
`;

const path = require("path");
fs.writeFileSync(path.join(__dirname, "..", "prep.html"), html);
console.log("done,", total, "topics,", (html.length / 1024).toFixed(0) + " KB");
