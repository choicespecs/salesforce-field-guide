/* Salesforce Field Guide — shared page chrome.
   Each chapter is its own HTML page containing only <main class="content">. This script adds the
   top bar, chapter nav, "On this page" list, previous/next links, code blocks and diagrams. */

const CHAPTERS = [
  ["Start", [["index", "Overview"]]],
  ["Foundations", [["fundamentals", "Platform fundamentals"], ["data-model", "Data model"], ["formulas", "Formulas & validation rules"], ["security", "Security & sharing"]]],
  ["Administration", [["admin", "Admin essentials"], ["reports", "Reports & dashboards"], ["sales-service", "Sales & Service processes"]]],
  ["Automation", [["flow", "Flow"], ["order-of-execution", "Order of execution"]]],
  ["Apex", [["apex", "Apex language"], ["triggers", "Triggers"], ["async-apex", "Asynchronous Apex"], ["testing", "Testing Apex"]]],
  ["Data access", [["soql", "SOQL & SOSL"], ["limits", "Governor limits & performance"]]],
  ["User interface", [["lwc", "Lightning Web Components"]]],
  ["Integration", [["integration", "APIs & callouts"], ["events", "Platform Events & CDC"]]],
  ["Delivery", [["devops", "DevOps & the sf CLI"]]],
  ["Products", [["catalog", "Product catalog"], ["agentforce", "Agentforce & Data 360"]]],
  ["Reference", [["decisions", "Which one do I pick?"], ["errors", "Errors & gotchas"], ["glossary", "Glossary"], ["resources", "Docs & certifications"]]]
];
const FLAT = CHAPTERS.flatMap(([g, items]) => items.map(([id, title]) => ({ id, title, group: g })));
const SITE = "Salesforce Field Guide";

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} }
};

/* theme (runs before paint as far as a deferred script can) */
const savedTheme = store.get("sfg-theme");
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
const isDark = () => document.documentElement.dataset.theme
  ? document.documentElement.dataset.theme === "dark"
  : matchMedia("(prefers-color-scheme: dark)").matches;

/* ---------- code blocks: <script type="text/plain" data-lang="apex" data-title="..."> ---------- */
const KW = {
  apex: "abstract|after|before|break|catch|class|continue|delete|do|else|enum|extends|final|finally|for|global|if|implements|insert|instanceof|interface|merge|new|null|override|private|protected|public|return|static|super|switch|this|throw|trigger|try|undelete|update|upsert|virtual|void|when|while|with|without|sharing|inherited|true|false|on|transient",
  js: "async|await|break|case|catch|class|const|continue|default|else|export|extends|false|finally|for|from|function|if|import|let|new|null|return|static|super|switch|this|throw|true|try|undefined|while|get|set",
  soql: "SELECT|FROM|WHERE|AND|OR|NOT|IN|LIKE|LIMIT|OFFSET|ORDER|BY|GROUP|HAVING|ASC|DESC|NULLS|FIRST|LAST|WITH|USER_MODE|SYSTEM_MODE|SECURITY_ENFORCED|FOR|UPDATE|VIEW|REFERENCE|TYPEOF|WHEN|THEN|ELSE|END|INCLUDES|EXCLUDES|FIND|IN|RETURNING|ALL|FIELDS|ROWS|COUNT|SUM|AVG|MIN|MAX|COUNT_DISTINCT|ROLLUP|CUBE|TRUE|FALSE|NULL|AS",
};
function highlight(text, lang) {
  const out = [];
  const lines = text.split("\n");
  const kw = KW[lang === "lwc" ? "js" : lang];
  const kwRe = kw ? new RegExp("\\b(" + kw + ")\\b", lang === "soql" ? "g" : "g") : null;
  for (const line of lines) {
    // find comment start outside of strings
    let inS = null, cut = -1;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inS) { if (ch === "\\") { i++; continue; } if (ch === inS) inS = null; continue; }
      if (ch === "'" || ch === '"' || (ch === "`" && lang !== "bash")) { inS = ch; continue; }
      if ((lang === "apex" || lang === "js" || lang === "lwc" || lang === "soql") && ch === "/" && line[i + 1] === "/") { cut = i; break; }
      if ((lang === "bash" || lang === "yaml") && ch === "#" && (i === 0 || /\s/.test(line[i - 1]))) { cut = i; break; }
      if ((lang === "soql" || lang === "sql") && ch === "-" && line[i + 1] === "-") { cut = i; break; }
      if (lang === "xml" && line.startsWith("<!--", i)) { cut = i; break; }
      if (lang === "formula" && ch === "/" && line[i + 1] === "*") { cut = i; break; }
    }
    const code = cut >= 0 ? line.slice(0, cut) : line;
    const cmt = cut >= 0 ? line.slice(cut) : "";
    let h = "";
    const parts = code.split(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/);
    parts.forEach((p, i) => {
      if (i % 2) { h += '<span class="tok-s">' + esc(p) + "</span>"; return; }
      let e = esc(p);
      if (kwRe && lang !== "xml" && lang !== "bash" && lang !== "json" && lang !== "text") {
        e = e.replace(kwRe, m => (lang === "soql" && m !== m.toUpperCase()) ? m : '<span class="tok-k">' + m + "</span>");
      }
      h += e;
    });
    if (cmt) h += '<span class="tok-c">' + esc(cmt) + "</span>";
    out.push(h);
  }
  return out.join("\n");
}
const LANGS = { apex: "Apex", js: "JavaScript", lwc: "JavaScript", soql: "SOQL", sosl: "SOSL", bash: "Shell", xml: "XML", json: "JSON", html: "HTML", formula: "Formula", yaml: "YAML", text: "Text", http: "HTTP" };
function buildCode(node) {
  const lang = node.dataset.lang || "text";
  let text = node.textContent.replace(/^\n+|\s+$/g, "");
  const indent = Math.min(...text.split("\n").filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
  if (indent > 0 && isFinite(indent)) text = text.split("\n").map(l => l.slice(indent)).join("\n");
  const fig = document.createElement("figure");
  fig.className = "code";
  fig.innerHTML = '<figcaption><span><span class="lang"></span><span class="ttl"></span></span><button class="copy" type="button">Copy</button></figcaption><pre><code></code></pre>';
  fig.querySelector(".lang").textContent = LANGS[lang] || lang;
  if (node.dataset.title) fig.querySelector(".ttl").textContent = " · " + node.dataset.title;
  fig.querySelector("code").innerHTML = highlight(text, lang === "sosl" ? "soql" : lang === "html" ? "xml" : lang);
  fig.querySelector(".copy").addEventListener("click", e => {
    const b = e.currentTarget;
    navigator.clipboard?.writeText(text).then(() => { b.textContent = "Copied"; setTimeout(() => (b.textContent = "Copy"), 1200); }, () => {});
  });
  node.replaceWith(fig);
}

/* ---------- chrome ---------- */
function slug(s) { return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

function buildChrome() {
  const main = document.querySelector("main.content");
  if (!main) return;
  const cur = document.body.dataset.page || "index";
  const idx = FLAT.findIndex(c => c.id === cur);

  const top = document.createElement("header");
  top.className = "topbar";
  top.innerHTML = `
    <button class="iconbtn menubtn" type="button" aria-expanded="false" aria-controls="sidenav">Menu</button>
    <a class="brand" href="index.html"><i>SF</i><span>${SITE}</span></a>
    <div class="search"><input id="q" type="search" placeholder="Search every page…  ( / )" aria-label="Search every page" autocomplete="off"><div class="results" id="results" hidden></div></div>
    <span class="spacer"></span>
    <button class="iconbtn" type="button" id="themeBtn">Theme</button>`;

  const nav = document.createElement("nav");
  nav.className = "sidenav"; nav.id = "sidenav"; nav.setAttribute("aria-label", "Chapters");
  nav.innerHTML = CHAPTERS.map(([g, items]) => `<h4>${esc(g)}</h4>` + items.map(([id, t]) =>
    `<a href="${id}.html"${id === cur ? ' aria-current="page"' : ""}>${esc(t)}</a>`).join("")).join("");

  const layout = document.createElement("div");
  layout.className = "layout";
  main.parentNode.insertBefore(layout, main);
  layout.append(nav, main);
  document.body.insertBefore(top, layout);

  // breadcrumbs
  if (idx > 0) {
    const c = FLAT[idx];
    main.insertAdjacentHTML("afterbegin", `<div class="crumbs"><a href="index.html">${SITE}</a> / ${esc(c.group)}</div>`);
  }

  // headings get ids; "On this page"
  const hs = [...main.querySelectorAll("h2")];
  hs.forEach(h => { if (!h.id) h.id = slug(h.textContent); });
  if (hs.length > 1) {
    const op = document.createElement("aside");
    op.className = "onpage";
    op.innerHTML = "<b>On this page</b>" + hs.map(h => `<a href="#${h.id}">${esc(h.textContent)}</a>`).join("");
    layout.append(op);
    const links = [...op.querySelectorAll("a")];
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-10% 0px -80% 0px" });
    hs.forEach(h => io.observe(h));
  }

  // previous / next
  if (idx >= 0) {
    const prev = FLAT[idx - 1], next = FLAT[idx + 1];
    let p = '<nav class="pager" aria-label="Previous and next chapter">';
    if (prev) p += `<a class="prev" href="${prev.id}.html"><small>← Previous</small>${esc(prev.title)}</a>`;
    if (next) p += `<a class="next" href="${next.id}.html"><small>Next →</small>${esc(next.title)}</a>`;
    p += "</nav>";
    main.insertAdjacentHTML("beforeend", p);
  }
  main.insertAdjacentHTML("beforeend", `<footer class="foot">${SITE} — an independent study reference, not affiliated with or endorsed by Salesforce. Limits and features change three times a year; when this guide and the official docs disagree, trust the docs.</footer>`);

  // menu, theme
  const mb = top.querySelector(".menubtn");
  mb.addEventListener("click", () => { const o = nav.classList.toggle("open"); mb.setAttribute("aria-expanded", o); });
  top.querySelector("#themeBtn").addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = next; store.set("sfg-theme", next);
    if (document.querySelector(".mermaid")) location.reload();
  });

  setupSearch(top.querySelector("#q"), top.querySelector("#results"));
}

/* ---------- search across all pages (index in assets/search-index.js) ---------- */
function setupSearch(input, box) {
  let results = [], sel = 0, loaded = false;
  function load(cb) {
    if (window.SEARCH_INDEX) return cb();
    if (loaded) return;
    loaded = true;
    const s = document.createElement("script");
    s.src = "assets/search-index.js";
    s.onload = cb;
    document.head.append(s);
  }
  function snippet(text, w) {
    const i = text.indexOf(w);
    if (i < 0) return "";
    const s = Math.max(0, i - 60);
    return (s ? "…" : "") + text.slice(s, i + w.length + 90) + "…";
  }
  function paint() { box.querySelectorAll("a").forEach((a, i) => a.classList.toggle("sel", i === sel)); }
  function run() {
    const q = input.value.trim().toLowerCase();
    if (!q) { box.hidden = true; return; }
    load(() => {
      const terms = q.split(/\s+/);
      results = [];
      for (const p of window.SEARCH_INDEX) {
        if (!p.text) p.text = p.intro + " " + p.sections.map(s => s.h.toLowerCase() + " " + s.t).join(" ");
        // page-level match, plus best section within the page
        let score = 0, ok = true;
        const t = p.title.toLowerCase();
        for (const w of terms) {
          if (t.includes(w)) score += 20;
          else if (p.text.includes(w)) score += 1;
          else { ok = false; break; }
        }
        if (!ok) continue;
        let best = null;
        for (const s of p.sections) {
          const st = s.h.toLowerCase();
          let ss = 0;
          for (const w of terms) { if (st.includes(w)) ss += 5; else if (s.t.includes(w)) ss += 1; else { ss = -1; break; } }
          if (ss > 0 && (!best || ss > best.ss)) best = { ...s, ss };
        }
        results.push({ p, best, score: score + (best ? best.ss : 0) });
      }
      results.sort((a, b) => b.score - a.score);
      results = results.slice(0, 12);
      sel = 0;
      box.innerHTML = results.length ? results.map(r => {
        const url = r.p.url + (r.best ? "#" + r.best.id : "");
        const where = r.best ? " › " + esc(r.best.h) : "";
        return `<a href="${url}"><b>${esc(r.p.title)}</b>${where}<span>${esc(snippet(r.best ? r.best.t : r.p.text, terms[0]))}</span></a>`;
      }).join("") : '<div class="none">No pages match.</div>';
      box.hidden = false;
      paint();
    });
  }
  input.addEventListener("input", run);
  input.addEventListener("focus", run);
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, results.length - 1); paint(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); paint(); }
    else if (e.key === "Enter") { const a = box.querySelectorAll("a")[sel]; if (a) location.href = a.href; }
    else if (e.key === "Escape") { input.value = ""; box.hidden = true; input.blur(); }
  });
  document.addEventListener("click", e => { if (!input.parentNode.contains(e.target)) box.hidden = true; });
  document.addEventListener("keydown", e => {
    if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
  });
}

/* ---------- filterable lists (catalog, glossary) ---------- */
function setupFilter(inputSel, itemSel, countSel, chipsSel) {
  const input = document.querySelector(inputSel);
  if (!input) return;
  const items = [...document.querySelectorAll(itemSel)];
  const count = document.querySelector(countSel);
  const chips = chipsSel ? document.querySelector(chipsSel) : null;
  let cat = "All";
  if (chips) {
    const cats = ["All", ...new Set(items.map(i => i.dataset.cat))];
    chips.innerHTML = cats.map(c => `<button class="chip" type="button" aria-pressed="${c === "All"}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
    chips.addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      cat = b.dataset.c; chips.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-pressed", x === b)); apply();
    });
  }
  function apply() {
    const q = input.value.trim().toLowerCase();
    let n = 0;
    items.forEach(i => {
      const show = (cat === "All" || i.dataset.cat === cat) && (!q || i.textContent.toLowerCase().includes(q));
      i.hidden = !show; if (show) n++;
    });
    document.querySelectorAll("[data-letter]").forEach(l => {
      l.hidden = !items.some(i => !i.hidden && i.dataset.l === l.dataset.letter);
    });
    if (count) count.textContent = `${n} of ${items.length}`;
  }
  input.addEventListener("input", apply);
  apply();
}

/* ---------- boot ---------- */
document.querySelectorAll('script[type="text/plain"][data-lang]').forEach(buildCode);
buildChrome();
setupFilter("#catQ", ".card[data-cat]", "#catCount", "#catChips");
setupFilter("#glQ", ".gloss > div[data-l]", "#glCount");

if (document.querySelector(".mermaid")) {
  const s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js";
  s.onload = () => {
    mermaid.initialize({ startOnLoad: false, theme: isDark() ? "dark" : "neutral", securityLevel: "strict", fontFamily: "Source Sans 3, system-ui, sans-serif" });
    mermaid.run({ querySelector: ".mermaid" });
  };
  document.head.append(s);
}
// a hash link to a heading on another page: scroll after chrome is built
if (location.hash) { const t = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (t) t.scrollIntoView(); }
