// Генератор interview.html — розмовна частина співбесіди:
// розповідь про себе, STAR-історії, system design задачі, питання до компанії, англійська.
// Вміст живе в interview_data.js. Викликається з gen_prep_html.js.
const fs = require("fs");
const path = require("path");

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const ul = (items, cls) => `<ul${cls ? ` class="${cls}"` : ""}>${items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`;
const pre = lines => lines && lines.length ? `<pre>${esc(lines.join("\n"))}</pre>` : "";

module.exports = function build() {
  const D = require("./interview_data.js");
  let n = 0;
  const box = (id, title, extra) => `<div class="card" id="${id}"><div class="card-head">
      <input type="checkbox" aria-label="прогнав уголос" data-k="${id}">
      <h3>${esc(title)}</h3>${extra || ""}</div>`;

  // 1. Про себе
  const selfHTML = `
    <section id="self">
      <div class="pillar-head"><h2>${esc(D.self.title)}</h2></div>
      <p class="pillar-note">${esc(D.self.lede)}</p>
      ${D.self.skeleton.map(s => `
      <div class="blk blk-sub"><div class="blk-t info">${esc(s.t)}</div>${ul(s.points)}</div>`).join("")}
      <div class="blk"><div class="blk-t good">Як це звучить разом</div>
        <div class="sample">${D.self.sample.map(p => `<p>${esc(p)}</p>`).join("")}</div>
      </div>
      <div class="blk"><div class="blk-t warn">Чого не робити</div>${ul(D.self.avoid, "warn-list")}</div>
    </section>`;

  // 2. STAR-історії
  const storiesHTML = `
    <section id="stories">
      <div class="pillar-head"><h2>Пʼять історій, які питають завжди</h2></div>
      <p class="pillar-note">${esc(D.storiesLede)}</p>
      ${D.stories.map((s, i) => {
        n++;
        return box(`story-${i}`, s.title) + `
      <details><summary>Розгорнути історію</summary><div class="card-body">
        <div class="blk"><div class="blk-t accent">Питання, після яких її розповідають</div>${ul(s.asks)}</div>
        ${s.star.map(x => `<div class="blk blk-sub"><div class="blk-t info">${esc(x.t)}</div><p>${esc(x.hint)}</p></div>`).join("")}
        <div class="blk"><div class="blk-t good">Приклад-каркас — підставляй свої деталі</div>
          <div class="sample">${s.sample.map(p => `<p>${esc(p)}</p>`).join("")}</div>
        </div>
        <div class="blk"><div class="blk-t warn">Що псує цю історію</div>${ul(s.tips, "warn-list")}</div>
      </div></details></div>`;
      }).join("")}
    </section>`;

  // 3. System design
  const designHTML = `
    <section id="design">
      <div class="pillar-head"><h2>System design — ${D.design.length} задач</h2></div>
      <p class="pillar-note">${esc(D.designLede)}</p>
      ${D.design.map((d, i) => {
        n++;
        return box(`design-${i}`, `${i + 1}. ${d.title}`) + `
      <details><summary>Розгорнути задачу</summary><div class="card-body">
        <div class="blk"><div class="blk-t accent">Як формулює інтервʼюер</div><p class="prompt">${esc(d.prompt)}</p></div>
        <div class="blk"><div class="blk-t info">Що уточнити, перш ніж малювати</div>${ul(d.clarify)}</div>
        ${d.plan.map(p => `<div class="blk blk-sub"><div class="blk-t info">${esc(p.t)}</div>${ul(p.points)}</div>`).join("")}
        ${pre(d.code)}
        <div class="blk"><div class="blk-t warn">Пастки</div>${ul(d.traps, "warn-list")}</div>
        <div class="blk"><div class="blk-t good">Чим сильна відповідь відрізняється від слабкої</div>
          <div class="sample"><p>${esc(d.strong)}</p></div>
        </div>
      </div></details></div>`;
      }).join("")}
    </section>`;

  // 4. Питання до компанії
  const questionsHTML = `
    <section id="questions">
      <div class="pillar-head"><h2>Що спитати самому</h2></div>
      <p class="pillar-note">${esc(D.questionsLede)}</p>
      ${D.questions.map(g => `
      <div class="blk blk-sub"><div class="blk-t info">${esc(g.group)}</div>
        <dl class="qlist">${g.items.map(i => `<dt>${esc(i.q)}</dt><dd>${esc(i.why)}</dd>`).join("")}</dl>
      </div>`).join("")}
      <div class="blk"><div class="blk-t warn">Червоні прапорці у відповідях</div>
        <ul class="warn-list">${D.redflags.map(r => `<li><b>${esc(r.sign)}</b> — ${esc(r.why)}</li>`).join("")}</ul>
      </div>
    </section>`;

  // 5. Англійська
  const englishHTML = `
    <section id="english">
      <div class="pillar-head"><h2>Англійська — готові формулювання</h2></div>
      <p class="pillar-note">${esc(D.englishLede)}</p>
      ${D.english.map(g => `
      <div class="blk blk-sub"><div class="blk-t info">${esc(g.group)}</div>
        <dl class="phrases">${g.items.map(i => `<dt>${esc(i.en)}</dt><dd>${esc(i.ua)}</dd>`).join("")}</dl>
      </div>`).join("")}
    </section>`;

  // 6. Фінал
  const finalHTML = `
    <section id="final">
      <div class="pillar-head"><h2>${esc(D.final.title)}</h2></div>
      <p class="pillar-note">${esc(D.final.lede)}</p>
      <div class="blk"><div class="blk-t info">Формулювання</div>
        <dl class="phrases">${D.final.phrases.map(p => `<dt>${esc(p.say)}</dt><dd>${esc(p.when)}</dd>`).join("")}</dl>
      </div>
      <div class="blk"><div class="blk-t warn">Правила</div>${ul(D.final.rules, "warn-list")}</div>
    </section>`;

  const html = `<!doctype html>
<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Розмовна частина — про себе, історії, system design, англійська</title>
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
  .wrap { max-width: 920px; margin: 0 auto; padding: 38px 20px 100px; }
  .eyebrow { font-family: var(--mono); font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--accent-deep); margin-bottom: 10px; }
  h1 { font-size: clamp(25px, 4vw, 34px); font-weight: 800; letter-spacing: -.02em; line-height: 1.13; margin: 0 0 10px; }
  .lede { font-size: 15.5px; color: var(--muted); max-width: 68ch; margin: 0 0 18px; }

  .toolbar { position: sticky; top: 0; z-index: 20; background: var(--ground); padding: 10px 0 12px; border-bottom: 1px solid var(--line); margin-bottom: 8px; }
  .filters { display: flex; flex-wrap: wrap; gap: 7px; }
  .fbtn { font-family: var(--sans); font-size: 13px; font-weight: 600; text-decoration: none; padding: 5px 13px; border-radius: 999px; border: 1px solid var(--line); background: var(--card); color: var(--muted); }
  .fbtn:hover { color: var(--ink); border-color: var(--faint); }
  .fbtn.home { margin-left: auto; }

  section { margin-top: 40px; scroll-margin-top: 70px; }
  .pillar-head { border-bottom: 2px solid var(--ink); padding-bottom: 6px; margin-bottom: 4px; }
  .pillar-head h2 { font-size: 21px; font-weight: 800; margin: 0; letter-spacing: -.01em; }
  .pillar-note { font-size: 13.5px; color: var(--muted); font-style: italic; margin: 6px 0 16px; max-width: 74ch; }

  .card { background: var(--card); border: 1px solid var(--line); border-radius: 13px; margin-bottom: 11px; overflow: hidden; scroll-margin-top: 80px; }
  .card.done { opacity: .6; }
  .card-head { display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center; padding: 13px 16px; }
  .card-head input { width: 19px; height: 19px; accent-color: var(--good); cursor: pointer; }
  .card-head h3 { margin: 0; font-size: 15.5px; font-weight: 700; }
  .card.done h3 { text-decoration: line-through; text-decoration-color: var(--faint); color: var(--faint); }
  details { border-top: 1px solid var(--line); }
  details summary { cursor: pointer; padding: 8px 16px; font-size: 13px; font-weight: 600; color: var(--info); list-style: none; user-select: none; background: #FBFCFD; }
  details summary::before { content: "▸ "; }
  details[open] summary::before { content: "▾ "; }
  details[open] summary { border-bottom: 1px solid var(--line); }
  .card-body { padding: 6px 18px 16px; }

  .blk { margin-top: 12px; }
  .blk.blk-sub { margin-top: 16px; border-left: 2px solid var(--line); padding-left: 14px; }
  .blk-t { font-family: var(--mono); font-size: 10.5px; letter-spacing: .09em; text-transform: uppercase; font-weight: 700; margin-bottom: 5px; }
  .blk-t.accent { color: var(--accent-deep); }
  .blk-t.info { color: var(--info); }
  .blk-t.warn { color: var(--warn); }
  .blk-t.good { color: var(--good); }
  .blk p { margin: 0 0 8px; font-size: 14px; max-width: 78ch; }
  .blk ul { margin: 0; padding-left: 18px; }
  .blk li { font-size: 13.5px; padding: 2px 0; max-width: 76ch; }
  .warn-list li::marker { content: "⚠ "; }
  .prompt { font-size: 15px; font-weight: 600; max-width: 72ch; }
  .sample { background: var(--good-wash); border: 1px solid #CBE5D3; border-radius: 10px; padding: 11px 15px; }
  .sample p { font-size: 14px; margin: 0 0 8px; color: #38556B; max-width: 76ch; }
  .sample p:last-child { margin-bottom: 0; }

  dl.qlist, dl.phrases { margin: 0; }
  dl.qlist dt, dl.phrases dt { font-size: 14px; font-weight: 700; margin-top: 9px; max-width: 74ch; }
  dl.phrases dt { font-family: var(--mono); font-size: 13px; font-weight: 600; color: var(--info); }
  dl.qlist dd, dl.phrases dd { margin: 2px 0 0; font-size: 13px; color: var(--muted); max-width: 74ch; }

  pre { background: var(--code-bg); color: var(--code-ink); border-radius: 10px; padding: 13px 15px; overflow-x: auto; font-family: var(--mono); font-size: 12.2px; line-height: 1.5; margin: 12px 0 0; }
  footer { margin-top: 55px; font-size: 12.5px; color: var(--faint); border-top: 1px solid var(--line); padding-top: 14px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="eyebrow">iOS Interview Prep · розмовна частина</div>
  <h1>Те, що не спитають у теорії</h1>
  <p class="lede">Половина співбесіди на middle+ — не про dispatch і не про ARC. Це розповідь про себе, пʼять історій із досвіду, «спроєктуй фічу» вголос і питання, які задаєш ти. Тут усе це з каркасами відповідей: прогнав уголос — постав галочку.</p>

  <div class="toolbar"><div class="filters">
    <a class="fbtn" href="#self">Про себе</a>
    <a class="fbtn" href="#stories">Історії</a>
    <a class="fbtn" href="#design">System design</a>
    <a class="fbtn" href="#questions">Питання до компанії</a>
    <a class="fbtn" href="#english">Англійська</a>
    <a class="fbtn" href="#final">Фінал</a>
    <a class="fbtn home" href="prep.html">📖 Теорія</a>
    <a class="fbtn" href="mock.html">🎤 Прогін</a>
  </div></div>

  ${selfHTML}
  ${storiesHTML}
  ${designHTML}
  ${questionsHTML}
  ${englishHTML}
  ${finalHTML}

  <footer>Прогрес (галочки) зберігається локально у браузері. Вміст — <code>generator/interview_data.js</code>.</footer>
</div>
<script>
(function () {
  const KEY = "ios-prep-interview-v1";
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
  document.querySelectorAll(".card").forEach(el => {
    const box = el.querySelector("input[type=checkbox]");
    const k = box.dataset.k;
    if (saved[k]) { box.checked = true; el.classList.add("done"); }
    box.addEventListener("change", () => {
      el.classList.toggle("done", box.checked);
      saved[k] = box.checked;
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
    });
  });
})();
</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(__dirname, "..", "interview.html"), html);
  console.log("interview.html:", D.stories.length, "історій,", D.design.length, "design-задач,",
              D.english.reduce((a, g) => a + g.items.length, 0), "фраз,", (html.length / 1024).toFixed(0) + " KB");
};
