// Typed headline
if (document.querySelector("#typed")) {
    new Typed("#typed", {
        strings: ["Hello, Welcome to the world of.."],
        typeSpeed: 92,
        backSpeed: 22,
        loop: false,
        showCursor: true
    });
}

const CONSULTATIVE_AI_ENDPOINT = "https://rag.chinmayarora.com";
const CONSULT_STATUS_STEPS = [
    "Connecting to Cloudflare...",
    "Scanning company signals...",
    "Researching operating pressure points...",
    "Finding matches in projects and lab ventures...",
    "Synthesizing a concise pitch..."
];

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (href && href.startsWith("#")) {
            e.preventDefault();
            document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
        }
    });
});

// Section reveal
const sections = document.querySelectorAll(".section");
const reveal = () => {
    const trigger = window.innerHeight * 0.82;
    sections.forEach(sec => {
        const top = sec.getBoundingClientRect().top;
        if (top < trigger) sec.classList.add("active");
    });
};
window.addEventListener("scroll", reveal);
window.addEventListener("load", reveal);

// Back-to-top (optional)
const backToTopButton = document.createElement("button");
backToTopButton.id = "back-to-top";
backToTopButton.textContent = "↑ Top";
document.body.appendChild(backToTopButton);
const toggleTop = () => backToTopButton.style.display = window.scrollY > 200 ? "block" : "none";
window.addEventListener("scroll", toggleTop);
backToTopButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
toggleTop();

const consultativeAiModal = document.getElementById("consultativeAiModal");
const openConsultativeAi = document.getElementById("openConsultativeAi");
const closeConsultativeAi = document.getElementById("closeConsultativeAi");
const consultativeAiOverlay = document.getElementById("consultativeAiOverlay");
const consultativeAiForm = document.getElementById("consultativeAiForm");
const consultStatusLog = document.getElementById("consultStatusLog");
const consultationResult = document.getElementById("consultationResult");
const consultativeAiSubmit = document.getElementById("consultativeAiSubmit");
let consultStatusTimer = null;

function setConsultModalState(isOpen) {
    if (!consultativeAiModal) return;
    consultativeAiModal.classList.toggle("hidden", !isOpen);
    consultativeAiModal.classList.toggle("flex", isOpen);
    consultativeAiModal.setAttribute("aria-hidden", String(!isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
}

function appendConsultStatus(message, tone = "neutral") {
    if (!consultStatusLog) return;
    const palette = {
        neutral: "text-slate-300 border-white/8 bg-white/[0.03]",
        success: "text-emerald-200 border-emerald-400/20 bg-emerald-400/10",
        error: "text-rose-200 border-rose-400/20 bg-rose-400/10"
    };
    const row = document.createElement("div");
    row.className = `mb-2 rounded-2xl border px-3 py-2 ${palette[tone] || palette.neutral}`;
    row.textContent = message;
    consultStatusLog.appendChild(row);
    consultStatusLog.scrollTop = consultStatusLog.scrollHeight;
}

function resetConsultationUi() {
    if (consultStatusLog) {
        consultStatusLog.innerHTML = "";
    }
    if (consultationResult) {
        consultationResult.innerHTML = `<p class="m-0 text-slate-400">Your personalized pitch and matched portfolio evidence will appear here.</p>`;
    }
}

function startConsultStatusFeed(companyName) {
    if (consultStatusTimer) {
        clearInterval(consultStatusTimer);
    }
    const queue = [
        CONSULT_STATUS_STEPS[0],
        `Researching ${companyName}...`,
        "Consulting Aegis Lab...",
        "Reviewing project and blog matches...",
        CONSULT_STATUS_STEPS[4]
    ];
    let index = 0;
    appendConsultStatus(queue[index]);
    consultStatusTimer = window.setInterval(() => {
        index += 1;
        if (index >= queue.length) {
            clearInterval(consultStatusTimer);
            consultStatusTimer = null;
            return;
        }
        appendConsultStatus(queue[index]);
    }, 900);
}

function stopConsultStatusFeed() {
    if (consultStatusTimer) {
        clearInterval(consultStatusTimer);
        consultStatusTimer = null;
    }
}

function renderConsultationResult(payload) {
    if (!consultationResult) return;
    const matches = (payload.portfolio_matches || []).slice(0, 3);
    consultationResult.innerHTML = `
        <div class="space-y-4">
            <div class="rounded-[20px] border border-sky-300/15 bg-sky-300/10 p-4">
                <p class="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-100">Pitch</p>
                <p class="m-0 text-sm leading-7 text-slate-100">${payload.pitch || "No pitch returned."}</p>
            </div>
            <div>
                <p class="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Matched Evidence</p>
                <div class="space-y-2">
                    ${matches.map(match => `
                        <a class="block rounded-[18px] border border-white/10 bg-white/[0.04] p-3 text-slate-200 no-underline transition hover:bg-white/[0.08]" href="${match.url || "/"}" target="_blank" rel="noopener">
                            <p class="mb-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">${match.source || "portfolio"}</p>
                            <p class="mb-1 text-sm font-semibold text-white">${match.title || "Portfolio Match"}</p>
                            <p class="m-0 text-sm text-slate-300">${match.summary || ""}</p>
                        </a>
                    `).join("") || `<p class="m-0 text-slate-400">No supporting matches returned.</p>`}
                </div>
            </div>
        </div>
    `;
}

async function handleConsultativeAiSubmit(event) {
    event.preventDefault();
    if (!consultativeAiForm || !consultativeAiSubmit) return;
    const formData = new FormData(consultativeAiForm);
    const visitorName = (formData.get("visitor_name") || "").toString().trim();
    const companyName = (formData.get("company_name") || "").toString().trim();
    if (!visitorName || !companyName) return;

    resetConsultationUi();
    startConsultStatusFeed(companyName);
    consultativeAiSubmit.disabled = true;
    consultativeAiSubmit.textContent = "Working...";
    let timeoutId;

    try {
        const endpoint = consultativeAiForm.dataset.endpoint || CONSULTATIVE_AI_ENDPOINT;
        const controller = new AbortController();
        timeoutId = window.setTimeout(() => controller.abort(), 20000);
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                visitor_name: visitorName,
                company_name: companyName,
                job_title: "decision maker"
            })
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(payload.error || `Consultation request failed (${response.status}).`);
        }

        stopConsultStatusFeed();
        appendConsultStatus("Pitch ready.", "success");
        renderConsultationResult(payload);
    } catch (error) {
        stopConsultStatusFeed();
        const message = error.name === "AbortError"
            ? "The consultation request timed out. Please try again."
            : (error.message || "The consultation request failed.");
        appendConsultStatus(message, "error");
        if (consultationResult) {
            consultationResult.innerHTML = `<p class="m-0 text-rose-200">${message}</p>`;
        }
    } finally {
        if (timeoutId) {
            window.clearTimeout(timeoutId);
        }
        consultativeAiSubmit.disabled = false;
        consultativeAiSubmit.textContent = "Generate Pitch";
    }
}

if (openConsultativeAi) {
    openConsultativeAi.addEventListener("click", () => {
        resetConsultationUi();
        setConsultModalState(true);
    });
}
if (closeConsultativeAi) {
    closeConsultativeAi.addEventListener("click", () => setConsultModalState(false));
}
if (consultativeAiOverlay) {
    consultativeAiOverlay.addEventListener("click", () => setConsultModalState(false));
}
if (consultativeAiForm) {
    consultativeAiForm.addEventListener("submit", handleConsultativeAiSubmit);
}
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        setConsultModalState(false);
    }
});

// Year
document.getElementById("year").textContent = new Date().getFullYear();

let projectCache = [];

const LOCAL_KEY_PREFIX = "portfolio_upload_";
const SESSION_TOKEN_KEY = "portfolio_github_token";
const GITHUB_DEFAULTS = {
    owner: "ChinmayA301",
    repo: "ChinmayA301.github.io",
    branch: "main"
};

async function fetchJsonStrict(path) {
    const urls = resolveJsonUrls(path);
    const errors = [];
    for (const url of urls) {
        try {
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) {
                errors.push(`Fetch failed ${res.status} ${res.statusText} for ${url}`);
                continue;
            }
            const text = await res.text();
            if (!text.trim()) {
                errors.push(`Empty response for ${url}`);
                continue;
            }
            return JSON.parse(text);
        } catch (err) {
            errors.push(`Invalid JSON from ${url}: ${err.message}`);
        }
    }
    throw new Error(errors.join(" | "));
}

function resolveJsonUrls(path) {
    if (!path) {
        throw new Error("JSON path is required");
    }
    if (/^https?:\/\//i.test(path)) {
        return [path];
    }
    const normalized = path.replace(/^\.?\//, "");
    const candidates = [];
    candidates.push(new URL(`/${normalized}`, window.location.origin).toString());
    candidates.push(new URL(normalized, window.location.href).toString());

    const firstSegment = window.location.pathname.split("/").filter(Boolean)[0];
    if (firstSegment && !normalized.startsWith(`${firstSegment}/`)) {
        candidates.push(new URL(`/${firstSegment}/${normalized}`, window.location.origin).toString());
    }

    return Array.from(new Set(candidates));
}

function renderProjects(projects) {
    const grid = document.getElementById("projectsGrid");
    if (!grid) return;
    const githubProfile = "https://github.com/ChinmayA301";
    if (!projects.length) {
        grid.innerHTML = `<p class="text-muted small">No projects found yet.</p>`;
        return;
    }
    grid.innerHTML = projects.map(p => `
      <div class="col-md-6">
        <a href="${p.link || githubProfile}" target="_blank" rel="noopener" class="project-box card shadow-sm h-100">
          <div class="card-body">
            <h3 class="h5">${p.title}</h3>
            <p class="mb-2 small text-muted">${p.description}</p>
            ${(p.tags || []).map(t => `<span class="badge bg-secondary-subtle text-secondary me-1">${t}</span>`).join("")}
          </div>
        </a>
      </div>
    `).join("");
    applyStagger(grid.querySelectorAll(".project-box"));
}

function buildProjectFilters(projects) {
    const filterWrap = document.getElementById("projectsFilter");
    if (!filterWrap) return;
    const tags = new Set();
    projects.forEach(p => (p.tags || []).forEach(t => tags.add(t)));
    const tagList = ["All", ...Array.from(tags).sort()];
    filterWrap.innerHTML = tagList.map(tag => `
      <button class="filter-pill ${tag === "All" ? "active" : ""}" data-filter="${tag}">${tag}</button>
    `).join("");
    applyStagger(filterWrap.querySelectorAll(".filter-pill"));

    filterWrap.querySelectorAll(".filter-pill").forEach(btn => {
        btn.addEventListener("click", () => {
            filterWrap.querySelectorAll(".filter-pill").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const filter = btn.getAttribute("data-filter");
            if (filter === "All") {
                renderProjects(projectCache);
                return;
            }
            const filtered = projectCache.filter(p => (p.tags || []).includes(filter));
            renderProjects(filtered);
        });
    });
}

// Render Projects from JSON
async function loadProjects() {
    const grid = document.getElementById("projectsGrid");
    if (!grid) return;
    try {
        const projects = await loadJsonWithOverrides("projects", "data/projects.json");
        projectCache = Array.isArray(projects) ? projects : [];
        renderProjects(projectCache);
        buildProjectFilters(projectCache);
    } catch (e) {
        grid.innerHTML = `<p class="text-danger small">Could not load projects.</p>`;
        console.error("Projects load error:", e);
    }
}

// Render Experience from JSON
async function loadExperience() {
    const wrap = document.getElementById("experienceTimeline");
    const workWrap = document.getElementById("workTimeline");
    const eduWrap = document.getElementById("educationTimeline");
    if (!wrap && !workWrap && !eduWrap) return;
    try {
        const items = await fetchJsonStrict("data/experience.json");
        if (!items.length) {
            if (wrap) wrap.innerHTML = `<p class="text-muted small">No experience entries available yet.</p>`;
            if (workWrap) workWrap.innerHTML = `<p class="text-muted small">No work experience available yet.</p>`;
            if (eduWrap) eduWrap.innerHTML = `<p class="text-muted small">No education entries available yet.</p>`;
            return;
        }
        if (wrap) {
            wrap.innerHTML = renderTimelineItems(items);
        }
        if (workWrap || eduWrap) {
            const { workItems, eduItems } = splitExperience(items);
            if (workWrap) workWrap.innerHTML = renderTimelineItems(workItems);
            if (eduWrap) eduWrap.innerHTML = renderTimelineItems(eduItems);
        }
    } catch (e) {
        if (wrap) wrap.innerHTML = `<p class="text-danger small">Could not load experience.</p>`;
        if (workWrap) workWrap.innerHTML = `<p class="text-danger small">Could not load work experience.</p>`;
        if (eduWrap) eduWrap.innerHTML = `<p class="text-danger small">Could not load education.</p>`;
        console.error("Experience load error:", e);
    }
}

function renderTimelineItems(items) {
    const linkedInProfile = "https://www.linkedin.com/in/chinmay-arora-27682211b/";
    return items.map(item => `
      <a class="timeline-item card text-decoration-none" href="${linkedInProfile}" target="_blank" rel="noopener">
        <div class="card-body text-white">
          <h3 class="h5 mb-1">${item.title}</h3>
          <p class="mb-1"><strong>${item.org}</strong> | ${item.time}</p>
          ${item.location ? `<p class="mb-2 small text-muted">${item.location}</p>` : ""}
          <ul class="mb-0 small text-muted ps-3">
            ${(item.bullets || []).map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>
      </a>
    `).join("");
}

function splitExperience(items) {
    const eduItems = [];
    const workItems = [];
    items.forEach(item => {
        const title = (item.title || "").toLowerCase();
        const org = (item.org || "").toLowerCase();
        const isEdu = title.includes("m.s.") || title.includes("b.tech") || title.includes("b.tech.")
            || org.includes("university") || org.includes("institute");
        if (isEdu) {
            eduItems.push(item);
        } else {
            workItems.push(item);
        }
    });
    return { workItems, eduItems };
}

async function loadHighlights() {
    const currentRoleEl = document.getElementById("currentRole");
    const educationEl = document.getElementById("educationHighlight");
    if (!currentRoleEl && !educationEl) return;
    try {
        const items = await fetchJsonStrict("data/experience.json");
        const { workItems, eduItems } = splitExperience(items);
        const current = workItems.find(item => (item.time || "").toLowerCase().includes("present")) || workItems[0];
        const latestEdu = eduItems[0];
        if (currentRoleEl && current) {
            currentRoleEl.innerHTML = `
        <p class="eyebrow">Current Position</p>
        <h3 class="h5 mb-1">${current.title}</h3>
        <p class="mb-1"><strong>${current.org}</strong> | ${current.time}</p>
        ${current.location ? `<p class="small text-muted mb-2">${current.location}</p>` : ""}
        <ul class="mb-0 small text-muted ps-3">
          ${(current.bullets || []).slice(0, 2).map(b => `<li>${b}</li>`).join('')}
        </ul>
      `;
        }
        if (educationEl && latestEdu) {
            educationEl.innerHTML = `
        <p class="eyebrow">Education</p>
        <h3 class="h5 mb-1">${latestEdu.title}</h3>
        <p class="mb-1"><strong>${latestEdu.org}</strong> | ${latestEdu.time}</p>
        ${latestEdu.location ? `<p class="small text-muted mb-2">${latestEdu.location}</p>` : ""}
        <ul class="mb-0 small text-muted ps-3">
          ${(latestEdu.bullets || []).slice(0, 2).map(b => `<li>${b}</li>`).join('')}
        </ul>
      `;
        }
    } catch (err) {
        console.error("Highlights load error:", err);
    }
}

// Render Project Reports (long-form case studies)
async function loadProjectReports() {
    const wrap = document.getElementById("projectReports");
    if (!wrap) return;
    try {
        const reports = await loadJsonWithOverrides("project_reports", "data/project_reports.json");
        if (!reports.length) {
            wrap.innerHTML = `<p class="text-muted small">No reports available yet.</p>`;
            return;
        }
        wrap.innerHTML = reports.map(r => `
      <article class="report-card">
        <header class="report-header">
          <div>
            <h3 class="h4 mb-1">${r.title}</h3>
            ${r.subtitle ? `<p class="report-subtitle mb-2">${r.subtitle}</p>` : ""}
          </div>
          <div class="report-meta">
            ${r.timeframe ? `<span>${r.timeframe}</span>` : ""}
            ${r.role ? `<span>${r.role}</span>` : ""}
            ${r.status ? `<span>${r.status}</span>` : ""}
          </div>
        </header>
        ${r.summary ? `<p class="report-summary">${r.summary}</p>` : ""}
        ${(r.sections || []).map(s => `
          <section class="report-section">
            <h4 class="h6">${s.title}</h4>
            ${s.text ? `<p>${s.text}</p>` : ""}
            ${(s.bullets || []).length ? `<ul>${s.bullets.map(b => `<li>${b}</li>`).join("")}</ul>` : ""}
          </section>
        `).join("")}
        <div class="report-footer">
          ${(r.stack || []).map(t => `<span class="badge bg-secondary-subtle text-secondary me-1">${t}</span>`).join("")}
          ${(r.tags || []).map(t => `<span class="badge bg-secondary-subtle text-secondary me-1">${t}</span>`).join("")}
        </div>
        ${(r.artifacts || []).length ? `
          <div class="report-links">
            ${(r.artifacts || []).map(a => a.link
                ? `<a class="btn btn-outline-light btn-sm me-2" href="${a.link}" target="_blank" rel="noopener">${a.label}</a>`
                : `<span class="btn btn-outline-light btn-sm me-2 disabled">${a.label}</span>`).join("")}
          </div>` : ""}
        ${(r.visual_path || r.pdf_path) ? `
        <div class="report-links">
          ${r.visual_path ? `<a class="btn btn-outline-light btn-sm me-2" href="${r.visual_path}" target="_blank" rel="noopener">Open Visual</a>` : ""}
          ${r.pdf_path ? `<a class="btn btn-outline-light btn-sm me-2" href="${r.pdf_path}" target="_blank" rel="noopener">Open PDF</a>` : ""}
        </div>` : ""}
      </article>
    `).join("");
        applyStagger(wrap.querySelectorAll(".report-card"));
    } catch (e) {
        wrap.innerHTML = `<p class="text-danger small">Could not load project reports.</p>`;
        console.error("Project reports load error:", e);
    }
}

// Render Coursework Projects
async function loadCourseworkProjects() {
    const grid = document.getElementById("courseworkProjects");
    if (!grid) return;
    try {
        const items = await loadJsonWithOverrides("coursework_projects", "data/coursework_projects.json");
        if (!items.length) {
            grid.innerHTML = `<p class="text-muted small">No coursework projects available yet.</p>`;
            return;
        }
        grid.innerHTML = items.map(p => `
      <div class="col-lg-6">
        <article class="course-card card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between flex-wrap gap-2">
              <h3 class="h5 mb-0">${p.title}</h3>
              ${p.term ? `<span class="course-meta">${p.term}</span>` : ""}
            </div>
            ${p.course ? `<p class="course-subtitle mb-2">${p.course}</p>` : ""}
            ${p.summary ? `<p class="mb-2">${p.summary}</p>` : ""}
            ${(p.focus || []).length ? `
              <div class="mb-2">
                <h4 class="h6 mb-1">Focus</h4>
                <ul class="mb-0">${p.focus.map(f => `<li>${f}</li>`).join("")}</ul>
              </div>` : ""}
            ${(p.deliverables || []).length ? `
              <div class="mb-2">
                <h4 class="h6 mb-1">Deliverables</h4>
                <ul class="mb-0">${p.deliverables.map(d => `<li>${d}</li>`).join("")}</ul>
              </div>` : ""}
            <div class="course-tags">
              ${(p.tools || []).map(t => `<span class="badge bg-secondary-subtle text-secondary me-1">${t}</span>`).join("")}
            </div>
            ${(p.links || []).length ? `
              <div class="mt-3">
                ${p.links.map(l => l.url
                    ? `<a class="btn btn-outline-light btn-sm me-2" href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`
                    : `<span class="btn btn-outline-light btn-sm me-2 disabled">${l.label}</span>`).join("")}
              </div>` : ""}
          </div>
        </article>
      </div>
    `).join("");
        applyStagger(grid.querySelectorAll(".course-card"));
    } catch (e) {
        grid.innerHTML = `<p class="text-danger small">Could not load coursework projects.</p>`;
        console.error("Coursework load error:", e);
    }
}

// Render Future Ideas
async function loadFutureIdeas() {
    const grid = document.getElementById("futureIdeas");
    if (!grid) return;
    const blogHomePath = "/blog/";
    try {
        const ideas = await loadJsonWithOverrides("future_ideas", "data/future_ideas.json");
        if (!ideas.length) {
            grid.innerHTML = `<p class="text-muted small">No future ideas available yet.</p>`;
            return;
        }
        grid.innerHTML = ideas.map(i => `
      <div class="col-lg-6">
        <a class="idea-card card h-100 text-decoration-none" href="${blogHomePath}" target="_blank" rel="noopener">
          <div class="card-body">
            <div class="d-flex justify-content-between flex-wrap gap-2">
              <h3 class="h5 mb-0">${i.title}</h3>
              ${i.status ? `<span class="idea-meta">${i.status}</span>` : ""}
            </div>
            ${i.one_liner ? `<p class="idea-subtitle mb-2">${i.one_liner}</p>` : ""}
            ${(i.motivation || i.proposed_approach) ? `
              <div class="mb-2">
                ${i.motivation ? `<p><strong>Motivation:</strong> ${i.motivation}</p>` : ""}
                ${i.proposed_approach ? `<p><strong>Proposed approach:</strong> ${i.proposed_approach}</p>` : ""}
              </div>` : ""}
            ${i.potential_impact ? `<p><strong>Potential impact:</strong> ${i.potential_impact}</p>` : ""}
            ${(i.planned_artifacts || []).length ? `
              <div class="mb-2">
                <h4 class="h6 mb-1">Planned artifacts</h4>
                <ul class="mb-0">${i.planned_artifacts.map(a => `<li>${a}</li>`).join("")}</ul>
              </div>` : ""}
            ${i.ip_note ? `<p class="idea-ip"><strong>IP note:</strong> ${i.ip_note}</p>` : ""}
            <div class="idea-tags">
              ${(i.tags || []).map(t => `<span class="badge bg-secondary-subtle text-secondary me-1">${t}</span>`).join("")}
            </div>
          </div>
        </a>
      </div>
    `).join("");
        applyStagger(grid.querySelectorAll(".idea-card"));
    } catch (e) {
        grid.innerHTML = `<p class="text-danger small">Could not load future ideas.</p>`;
        console.error("Future ideas load error:", e);
    }
}

// Render Resumes
async function loadResumes() {
    const grid = document.getElementById("resumesGrid");
    if (!grid) return;
    try {
        const resumes = await loadJsonWithOverrides("resumes", "data/resumes.json");
        if (!resumes.length) {
            grid.innerHTML = `<p class="text-muted small">No resumes available yet.</p>`;
            return;
        }
        grid.innerHTML = resumes.map(r => `
      <div class="col-md-6 col-lg-4">
        <div class="resume-card card h-100">
          <div class="card-body">
            <p class="eyebrow">${r.role || "Resume"}</p>
            <h3 class="h5">${r.title}</h3>
            ${r.summary ? `<p class="small text-muted">${r.summary}</p>` : ""}
            ${(r.tags || []).length ? `
              <div class="mb-3">
                ${(r.tags || []).map(t => `<span class="badge bg-secondary-subtle text-secondary me-1">${t}</span>`).join("")}
              </div>` : ""}
            ${r.file ? `
              <a class="btn btn-outline-light btn-sm" href="${r.file}" target="_blank" rel="noopener" download>
                Download PDF
              </a>` : ""}
          </div>
        </div>
      </div>
    `).join("");
        applyStagger(grid.querySelectorAll(".resume-card"));
    } catch (e) {
        grid.innerHTML = `<p class="text-danger small">Could not load resumes.</p>`;
        console.error("Resumes load error:", e);
    }
}

loadProjects();
loadExperience();
loadProjectReports();
loadCourseworkProjects();
loadFutureIdeas();
loadCaseStudy();
loadResumes();
loadHighlights();

function applyStagger(elements) {
    elements.forEach((el, idx) => {
        el.classList.add("stagger-item");
        el.style.transitionDelay = `${idx * 40}ms`;
        requestAnimationFrame(() => el.classList.add("is-visible"));
    });
}

async function loadCaseStudy() {
    const wrap = document.getElementById("caseStudy");
    if (!wrap) return;
    try {
        const reports = await loadJsonWithOverrides("project_reports", "data/project_reports.json");
        const featured = Array.isArray(reports) ? reports[0] : null;
        if (!featured) return;
        const bulletSource = (featured.sections || []).find(s => (s.bullets || []).length) || {};
        wrap.innerHTML = `
      <article class="case-hero">
        <p class="eyebrow">Case Study</p>
        <h3>${featured.title}</h3>
        ${featured.subtitle ? `<p>${featured.subtitle}</p>` : ""}
        ${featured.summary ? `<p>${featured.summary}</p>` : ""}
        <div class="case-meta">
          ${featured.timeframe ? `<span>${featured.timeframe}</span>` : ""}
          ${featured.role ? `<span>${featured.role}</span>` : ""}
          ${featured.status ? `<span>${featured.status}</span>` : ""}
        </div>
      </article>
      <article class="case-panel">
        <h4>Deep Dive</h4>
        ${(featured.sections || []).map(s => `
          <div class="mb-3">
            <strong>${s.title}</strong>
            ${s.text ? `<p class="mb-1">${s.text}</p>` : ""}
          </div>
        `).join("")}
        ${(bulletSource.bullets || []).length ? `
          <ul>${bulletSource.bullets.map(b => `<li>${b}</li>`).join("")}</ul>
        ` : ""}
      </article>
    `;
        applyStagger(wrap.querySelectorAll(".case-hero, .case-panel"));
    } catch (e) {
        wrap.innerHTML = `<p class="text-danger small">Could not load featured case study.</p>`;
        console.error("Case study load error:", e);
    }
}

// Upload helpers (client-side only)
const uploadForm = document.getElementById("uploadForm");
const uploadTarget = document.getElementById("uploadTarget");
const uploadFile = document.getElementById("uploadFile");
const uploadText = document.getElementById("uploadText");
const uploadStatus = document.getElementById("uploadStatus");
const downloadUpload = document.getElementById("downloadUpload");
const clearUpload = document.getElementById("clearUpload");
const githubPublishForm = document.getElementById("githubPublishForm");
const githubOwner = document.getElementById("githubOwner");
const githubRepo = document.getElementById("githubRepo");
const githubBranch = document.getElementById("githubBranch");
const githubPath = document.getElementById("githubPath");
const githubToken = document.getElementById("githubToken");
const githubCommitMsg = document.getElementById("githubCommitMsg");
const githubStatus = document.getElementById("githubStatus");

async function loadJsonWithOverrides(key, fallbackPath) {
    const stored = localStorage.getItem(`${LOCAL_KEY_PREFIX}${key}`);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch (err) {
            console.warn("Invalid stored JSON, falling back.", err);
        }
    }
    return fetchJsonStrict(fallbackPath);
}

function setUploadStatus(message, isError = false) {
    if (!uploadStatus) return;
    uploadStatus.textContent = message;
    uploadStatus.classList.toggle("text-danger", isError);
}

function setGithubStatus(message, isError = false) {
    if (!githubStatus) return;
    githubStatus.textContent = message;
    githubStatus.classList.toggle("text-danger", isError);
}

async function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

function downloadJsonFile(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

async function handleUploadSubmit(e) {
    e.preventDefault();
    if (!uploadTarget) return;
    const target = uploadTarget.value;
    let raw = uploadText?.value?.trim();

    if (!raw && uploadFile?.files?.length) {
        try {
            raw = await readFileAsText(uploadFile.files[0]);
        } catch (err) {
            setUploadStatus("Could not read file.", true);
            return;
        }
    }

    if (!raw) {
        setUploadStatus("Paste JSON or upload a file first.", true);
        return;
    }

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            setUploadStatus("JSON must be an array of items.", true);
            return;
        }
        localStorage.setItem(`${LOCAL_KEY_PREFIX}${target}`, JSON.stringify(parsed));
        setUploadStatus("Upload saved. Refreshing sections...");
        await refreshAllSections();
    } catch (err) {
        setUploadStatus("Invalid JSON. Please check formatting.", true);
    }
}

async function refreshAllSections() {
    await Promise.all([
        loadProjects(),
        loadProjectReports(),
        loadCourseworkProjects(),
        loadFutureIdeas()
    ]);
}

function getFallbackPath(target) {
    return {
        projects: "data/projects.json",
        project_reports: "data/project_reports.json",
        coursework_projects: "data/coursework_projects.json",
        future_ideas: "data/future_ideas.json",
        resumes: "data/resumes.json"
    }[target];
}

function getDefaultGithubPath(target) {
    const fallbackPath = getFallbackPath(target);
    return fallbackPath || "data/projects.json";
}

function getCurrentGithubConfig() {
    return {
        owner: githubOwner?.value?.trim() || GITHUB_DEFAULTS.owner,
        repo: githubRepo?.value?.trim() || GITHUB_DEFAULTS.repo,
        branch: githubBranch?.value?.trim() || GITHUB_DEFAULTS.branch,
        path: githubPath?.value?.trim() || "data/projects.json",
        message: githubCommitMsg?.value?.trim() || "Update portfolio data"
    };
}

function encodeBase64(input) {
    return btoa(unescape(encodeURIComponent(input)));
}

async function getDatasetForPublish(target) {
    const textValue = uploadText?.value?.trim();
    if (textValue) {
        const parsed = JSON.parse(textValue);
        if (!Array.isArray(parsed)) {
            throw new Error("JSON must be an array.");
        }
        return parsed;
    }
    return loadJsonWithOverrides(target, getFallbackPath(target));
}

async function publishToGithub(e) {
    e.preventDefault();
    if (!uploadTarget) return;
    const token = githubToken?.value?.trim() || sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) {
        setGithubStatus("GitHub token required.", true);
        return;
    }

    sessionStorage.setItem(SESSION_TOKEN_KEY, token);

    const target = uploadTarget.value;
    if (githubPath && !githubPath.value.trim()) {
        githubPath.value = getDefaultGithubPath(target);
    }

    const { owner, repo, branch, path, message } = getCurrentGithubConfig();
    if (!owner || !repo || !branch || !path) {
        setGithubStatus("Owner, repo, branch, and path are required.", true);
        return;
    }

    let data;
    try {
        data = await getDatasetForPublish(target);
    } catch (err) {
        setGithubStatus(err.message || "Invalid JSON.", true);
        return;
    }

    setGithubStatus("Publishing to GitHub...");

    const apiBase = "https://api.github.com";
    const fileUrl = `${apiBase}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}`;
    let sha = null;

    try {
        const getRes = await fetch(`${fileUrl}?ref=${encodeURIComponent(branch)}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }
        });
        if (getRes.ok) {
            const fileData = await getRes.json();
            sha = fileData.sha;
        } else if (getRes.status !== 404) {
            const errBody = await getRes.json().catch(() => ({}));
            setGithubStatus(errBody.message || "Failed to read existing file.", true);
            return;
        }
    } catch (err) {
        setGithubStatus("Network error while reading GitHub file.", true);
        return;
    }

    try {
        const payload = {
            message,
            content: encodeBase64(JSON.stringify(data, null, 4)),
            branch
        };
        if (sha) payload.sha = sha;

        const putRes = await fetch(fileUrl, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!putRes.ok) {
            const errBody = await putRes.json().catch(() => ({}));
            setGithubStatus(errBody.message || "Publish failed.", true);
            return;
        }

        setGithubStatus("Published to GitHub successfully.");
    } catch (err) {
        setGithubStatus("Network error while publishing.", true);
    }
}

async function handleDownload() {
    if (!uploadTarget) return;
    const target = uploadTarget.value;
    const stored = localStorage.getItem(`${LOCAL_KEY_PREFIX}${target}`);
    if (stored) {
        downloadJsonFile(`${target}.json`, JSON.parse(stored));
        setUploadStatus("Downloaded stored JSON.");
        return;
    }
    try {
        const fallbackPath = getFallbackPath(target);
        const data = await fetchJsonStrict(fallbackPath);
        downloadJsonFile(`${target}.json`, data);
        setUploadStatus("Downloaded default JSON.");
    } catch (err) {
        setUploadStatus("Could not download JSON.", true);
    }
}

function handleClearUpload() {
    if (!uploadTarget) return;
    const target = uploadTarget.value;
    localStorage.removeItem(`${LOCAL_KEY_PREFIX}${target}`);
    setUploadStatus("Stored upload cleared. Refreshing sections...");
    refreshAllSections();
}

if (uploadForm) {
    uploadForm.addEventListener("submit", handleUploadSubmit);
}
if (downloadUpload) {
    downloadUpload.addEventListener("click", handleDownload);
}
if (clearUpload) {
    clearUpload.addEventListener("click", handleClearUpload);
}
if (githubPublishForm) {
    githubPublishForm.addEventListener("submit", publishToGithub);
}

if (githubOwner && !githubOwner.value) githubOwner.value = GITHUB_DEFAULTS.owner;
if (githubRepo && !githubRepo.value) githubRepo.value = GITHUB_DEFAULTS.repo;
if (githubBranch && !githubBranch.value) githubBranch.value = GITHUB_DEFAULTS.branch;
if (githubPath && !githubPath.value && uploadTarget) {
    githubPath.value = getDefaultGithubPath(uploadTarget.value);
}
if (uploadTarget && githubPath) {
    uploadTarget.addEventListener("change", () => {
        if (!githubPath.value.trim()) {
            githubPath.value = getDefaultGithubPath(uploadTarget.value);
        }
    });
}

applyStagger(document.querySelectorAll(".tile-card"));

function setupHeroGlobe() {
    const trigger = document.getElementById("heroGlobeToggle");
    const modal = document.getElementById("heroGlobeModal");
    const modalOverlay = document.getElementById("heroGlobeModalOverlay");
    const modalClose = document.getElementById("heroGlobeClose");
    const inlineCanvas = document.getElementById("heroGlobeCanvas");
    const previewCanvas = document.getElementById("heroGlobePreviewCanvas");
    const modalCanvas = document.getElementById("heroGlobeModalCanvas");
    if (!trigger || !modal || !inlineCanvas || !previewCanvas || !modalCanvas) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const locations = [
        { name: "New Delhi", lat: 28.6139, lon: 77.2090 },
        { name: "Chennai", lat: 13.0827, lon: 80.2707 },
        { name: "Minneapolis", lat: 44.9778, lon: -93.2650 },
        { name: "Dubai", lat: 25.2048, lon: 55.2708 },
        { name: "Miami", lat: 25.7617, lon: -80.1918 },
        { name: "NYC", lat: 40.7128, lon: -74.0060 }
    ];
    const continentPolygons = [
        [
            [-168, 72], [-150, 70], [-138, 63], [-128, 55], [-124, 48], [-123, 42], [-117, 34],
            [-112, 31], [-106, 28], [-97, 24], [-90, 18], [-83, 12], [-82, 24], [-86, 31],
            [-95, 40], [-104, 49], [-112, 58], [-126, 67], [-145, 72]
        ],
        [
            [-81, 12], [-77, 8], [-74, 1], [-70, -6], [-66, -14], [-63, -24], [-60, -35], [-56, -45],
            [-52, -54], [-47, -52], [-45, -38], [-49, -22], [-54, -7], [-60, 2], [-69, 8], [-76, 10]
        ],
        [
            [-10, 72], [4, 70], [18, 67], [28, 60], [35, 52], [38, 44], [32, 38], [22, 35], [15, 40],
            [10, 45], [2, 48], [-4, 44], [-6, 36], [-1, 41], [8, 43], [18, 46], [28, 42], [36, 36],
            [42, 31], [48, 26], [38, 20], [29, 22], [18, 24], [10, 29], [2, 31], [-5, 36], [-12, 43],
            [-16, 55], [-14, 64]
        ],
        [
            [-18, 34], [-10, 30], [-5, 20], [-3, 8], [2, 0], [8, -8], [14, -18], [20, -26], [28, -31],
            [34, -34], [40, -28], [45, -20], [48, -8], [44, 4], [36, 14], [28, 22], [18, 28], [8, 32], [0, 35]
        ],
        [
            [34, 34], [45, 40], [60, 47], [78, 55], [96, 57], [118, 53], [136, 49], [150, 44], [160, 36],
            [150, 28], [132, 24], [116, 18], [104, 10], [92, 9], [82, 16], [76, 24], [68, 28], [58, 26],
            [48, 22], [42, 27], [38, 33]
        ],
        [
            [112, -12], [118, -18], [126, -22], [136, -26], [146, -34], [151, -41], [144, -40], [134, -35],
            [124, -30], [116, -24], [112, -18]
        ]
    ];

    function createGlobe(canvas, options = {}) {
        const ctx = canvas.getContext("2d");
        const state = {
            rotationY: options.rotationY ?? -0.7,
            rotationX: options.rotationX ?? -0.15,
            velocityY: 0,
            velocityX: 0,
            dragging: false,
            pointerId: null,
            autorotate: options.autorotate ?? true,
            interactive: options.interactive ?? false,
            radiusFactor: options.radiusFactor ?? 0.38,
            showLabels: options.showLabels ?? false,
            glow: options.glow ?? 1,
            labelScale: options.labelScale ?? 1,
            width: 0,
            height: 0,
            dpr: Math.min(window.devicePixelRatio || 1, 2)
        };

        function resize() {
            const rect = canvas.getBoundingClientRect();
            state.width = Math.max(rect.width, 10);
            state.height = Math.max(rect.height, 10);
            state.dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(state.width * state.dpr);
            canvas.height = Math.round(state.height * state.dpr);
            ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
        }

        function project(lat, lon, radius) {
            const phi = lat * Math.PI / 180;
            const theta = lon * Math.PI / 180 + state.rotationY;
            let x = Math.cos(phi) * Math.sin(theta);
            let y = Math.sin(phi);
            let z = Math.cos(phi) * Math.cos(theta);

            const cosX = Math.cos(state.rotationX);
            const sinX = Math.sin(state.rotationX);
            const y2 = y * cosX - z * sinX;
            const z2 = y * sinX + z * cosX;

            return {
                x: state.width / 2 + x * radius,
                y: state.height / 2 - y2 * radius,
                depth: z2
            };
        }

        function drawGrid(radius) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "rgba(138, 209, 255, 0.14)";
            const latitudes = [-60, -30, 0, 30, 60];
            const longitudes = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];

            latitudes.forEach((lat) => {
                ctx.beginPath();
                let started = false;
                for (let lon = -180; lon <= 180; lon += 6) {
                    const point = project(lat, lon, radius);
                    if (point.depth <= 0) {
                        started = false;
                        continue;
                    }
                    if (!started) {
                        ctx.moveTo(point.x, point.y);
                        started = true;
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                }
                ctx.stroke();
            });

            longitudes.forEach((lon) => {
                ctx.beginPath();
                let started = false;
                for (let lat = -90; lat <= 90; lat += 4) {
                    const point = project(lat, lon, radius);
                    if (point.depth <= 0) {
                        started = false;
                        continue;
                    }
                    if (!started) {
                        ctx.moveTo(point.x, point.y);
                        started = true;
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                }
                ctx.stroke();
            });
        }

        function drawContinents(radius) {
            continentPolygons.forEach((polygon) => {
                const visiblePoints = polygon
                    .map(([lon, lat]) => project(lat, lon, radius))
                    .filter((point) => point.depth > -0.12);
                if (visiblePoints.length < 3) return;

                ctx.beginPath();
                visiblePoints.forEach((point, index) => {
                    if (index === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                });
                ctx.closePath();
                ctx.fillStyle = "rgba(104, 180, 142, 0.28)";
                ctx.strokeStyle = "rgba(214, 239, 224, 0.28)";
                ctx.lineWidth = 1;
                ctx.fill();
                ctx.stroke();
            });
        }

        function drawPins(radius) {
            const visible = locations
                .map((location) => ({ location, point: project(location.lat, location.lon, radius) }))
                .sort((a, b) => a.point.depth - b.point.depth);

            visible.forEach(({ location, point }) => {
                const alpha = point.depth > 0 ? 0.95 : 0.18;
                const dotRadius = point.depth > 0 ? 4.6 * state.glow : 3.2;
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 185, 92, ${alpha})`;
                ctx.arc(point.x, point.y, dotRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.strokeStyle = `rgba(138, 209, 255, ${point.depth > 0 ? 0.42 : 0.1})`;
                ctx.lineWidth = 1.4;
                ctx.arc(point.x, point.y, dotRadius + 5.5, 0, Math.PI * 2);
                ctx.stroke();

                if (state.showLabels && point.depth > 0) {
                    const labelX = point.x + 12;
                    const labelY = point.y - 12;
                    const fontSize = 12 * state.labelScale;
                    ctx.font = `600 ${fontSize}px "Space Grotesk", sans-serif`;
                    const textWidth = ctx.measureText(location.name).width;
                    const labelWidth = textWidth + 18;
                    const labelHeight = 24 * state.labelScale;

                    ctx.fillStyle = "rgba(11, 12, 16, 0.82)";
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.roundRect(labelX, labelY - labelHeight + 2, labelWidth, labelHeight, 10);
                    ctx.fill();
                    ctx.stroke();
                    ctx.fillStyle = "rgba(247, 249, 252, 0.96)";
                    ctx.fillText(location.name, labelX + 9, labelY - 8);
                }
            });
        }

        function draw() {
            ctx.clearRect(0, 0, state.width, state.height);
            const radius = Math.min(state.width, state.height) * state.radiusFactor;
            const centerX = state.width / 2;
            const centerY = state.height / 2;

            ctx.fillStyle = "rgba(3, 6, 12, 0.92)";
            ctx.fillRect(0, 0, state.width, state.height);

            const stars = 34;
            for (let i = 0; i < stars; i += 1) {
                const starX = ((i * 97) % state.width);
                const starY = ((i * 53) % state.height);
                const starSize = (i % 3) + 0.7;
                ctx.fillStyle = `rgba(226, 236, 255, ${0.1 + (i % 5) * 0.05})`;
                ctx.beginPath();
                ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
                ctx.fill();
            }

            const gradient = ctx.createRadialGradient(
                centerX - radius * 0.35,
                centerY - radius * 0.4,
                radius * 0.15,
                centerX,
                centerY,
                radius * 1.15
            );
            gradient.addColorStop(0, "rgba(84, 166, 255, 0.32)");
            gradient.addColorStop(0.55, "rgba(19, 56, 102, 0.58)");
            gradient.addColorStop(1, "rgba(5, 12, 24, 0.88)");

            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.strokeStyle = "rgba(255,255,255,0.12)";
            ctx.lineWidth = 1.2;
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();

            drawContinents(radius);
            drawGrid(radius);
            drawPins(radius);

            ctx.beginPath();
            ctx.strokeStyle = "rgba(138, 209, 255, 0.22)";
            ctx.lineWidth = 10;
            ctx.arc(centerX, centerY, radius * 1.01, -0.85, 0.85);
            ctx.stroke();
        }

        function animate() {
            if (state.autorotate && !state.dragging && !prefersReducedMotion) {
                state.rotationY += 0.0035;
            }
            state.rotationY += state.velocityY;
            state.rotationX += state.velocityX;
            state.rotationX = Math.max(-0.9, Math.min(0.9, state.rotationX));
            state.velocityY *= 0.92;
            state.velocityX *= 0.92;
            draw();
            requestAnimationFrame(animate);
        }

        function onPointerDown(event) {
            if (!state.interactive) return;
            state.dragging = true;
            state.pointerId = event.pointerId;
            canvas.setPointerCapture(event.pointerId);
            state.startX = event.clientX;
            state.startY = event.clientY;
        }

        function onPointerMove(event) {
            if (!state.interactive || !state.dragging || state.pointerId !== event.pointerId) return;
            const deltaX = event.clientX - state.startX;
            const deltaY = event.clientY - state.startY;
            state.rotationY += deltaX * 0.008;
            state.rotationX += deltaY * 0.006;
            state.startX = event.clientX;
            state.startY = event.clientY;
            state.velocityY = deltaX * 0.0007;
            state.velocityX = deltaY * 0.0005;
        }

        function onPointerUp(event) {
            if (!state.interactive || state.pointerId !== event.pointerId) return;
            state.dragging = false;
            canvas.releasePointerCapture(event.pointerId);
            state.pointerId = null;
        }

        if (state.interactive) {
            canvas.style.touchAction = "none";
            canvas.addEventListener("pointerdown", onPointerDown);
            canvas.addEventListener("pointermove", onPointerMove);
            canvas.addEventListener("pointerup", onPointerUp);
            canvas.addEventListener("pointercancel", onPointerUp);
        }

        resize();
        draw();
        requestAnimationFrame(animate);
        window.addEventListener("resize", resize);

        return {
            resize,
            draw,
            state
        };
    }

    const inlineGlobe = createGlobe(inlineCanvas, {
        autorotate: true,
        interactive: false,
        radiusFactor: 0.4,
        glow: 1
    });
    const previewGlobe = createGlobe(previewCanvas, {
        autorotate: true,
        interactive: false,
        radiusFactor: 0.42,
        glow: 1.15,
        showLabels: false
    });
    const modalGlobe = createGlobe(modalCanvas, {
        autorotate: true,
        interactive: true,
        radiusFactor: 0.43,
        glow: 1.2,
        showLabels: true,
        labelScale: 1.04,
        rotationY: -0.25,
        rotationX: -0.2
    });

    let closeTimeout = null;
    function openModal() {
        if (closeTimeout) {
            window.clearTimeout(closeTimeout);
        }
        trigger.classList.add("is-flipped");
        window.setTimeout(() => {
            modal.hidden = false;
            modal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
            window.requestAnimationFrame(() => {
                inlineGlobe.resize();
                inlineGlobe.draw();
                previewGlobe.resize();
                previewGlobe.draw();
                modalGlobe.resize();
                modalGlobe.draw();
                window.requestAnimationFrame(() => {
                    modalGlobe.resize();
                    modalGlobe.draw();
                });
            });
        }, 360);
    }

    function closeModal() {
        modal.setAttribute("aria-hidden", "true");
        modal.hidden = true;
        document.body.style.overflow = "";
        closeTimeout = window.setTimeout(() => {
            trigger.classList.remove("is-flipped");
        }, 120);
    }

    trigger.addEventListener("click", openModal);
    modalOverlay?.addEventListener("click", closeModal);
    modalClose?.addEventListener("click", closeModal);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modal.hidden) {
            closeModal();
        }
    });
}

setupHeroGlobe();

// Header background + text color shift on scroll
const hero = document.querySelector(".hero");
window.addEventListener("scroll", () => {
    if (window.scrollY > 80) {
        hero?.classList.add("scrolled");
    } else {
        hero?.classList.remove("scrolled");
    }
});


// Contact form (Formspree)
const form = document.getElementById("contactForm");
const msg = document.getElementById("formMsg");
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        msg.textContent = "Sending...";
        try {
            const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { "Accept": "application/json" } });
            if (res.ok) {
                msg.textContent = "Thanks! Your message has been sent.";
                form.reset();
            } else {
                msg.textContent = "Something went wrong. Please try again or email me directly.";
            }
        } catch (err) {
            msg.textContent = "Network error. Please try again later.";
        }
    });
}
const TILE_SECTIONS = [
    {
        title: "Blog",
        description: "BLUF-first technical posts with TL;DR and implementation details.",
        href: "/blog/",
        metric: "New posts",
        tone: "accent",
        x: 16,
        y: 16
    },
    {
        title: "Experience",
        description: "Work timeline + education history in separate views.",
        href: "/experience/",
        metric: "Industry + Research",
        tone: "primary",
        x: 48,
        y: 16
    },
    {
        title: "Projects",
        description: "Flagship builds, rapid prototypes, and live systems.",
        href: "/projects/",
        metric: "12+ builds",
        tone: "primary",
        x: 78,
        y: 20
    },
    {
        title: "The Lab",
        description: "A space to explore and visibilize future ideas pre-implementation.",
        href: "/ideas/",
        metric: "Idea backlog",
        tone: "accent",
        x: 28,
        y: 54
    },
    {
        title: "Coursework",
        description: "Academic projects, deliverables, and research notes.",
        href: "/coursework/",
        metric: "MS + B.Tech",
        tone: "neutral",
        x: 58,
        y: 52
    },
    {
        title: "Project Reports",
        description: "Long-form case studies with context, evaluation, and results.",
        href: "/reports/",
        metric: "Deep dives",
        tone: "accent",
        x: 78,
        y: 58
    },
    {
        title: "Resume",
        description: "Role-specific resume downloads for targeted applications.",
        href: "/resumes/",
        metric: "6 roles",
        tone: "neutral",
        x: 10,
        y: 74
    }
];

function renderTiles() {
    const grid = document.getElementById("tilesGrid");
    if (!grid) return;
    grid.innerHTML = TILE_SECTIONS.map((tile, idx) => `
      <a class="scatter-node scatter-${tile.tone}" href="${tile.href}"
        style="left:${tile.x}%; top:${tile.y}%; --node-delay:${idx * 40}ms;">
        <span class="scatter-blob" aria-hidden="true"></span>
        <span class="scatter-label">
          <span class="tile-metric">${tile.metric}</span>
          <span class="tile-title">${tile.title}</span>
          <span class="tile-desc">${tile.description}</span>
        </span>
      </a>
    `).join("");
    applyStagger(grid.querySelectorAll(".scatter-node"));
    bindScatterMotion(grid);
}

renderTiles();

function bindScatterMotion(container) {
    const nodes = Array.from(container.querySelectorAll(".scatter-node"));
    if (!nodes.length) return;

    const handleMove = (event) => {
        const rect = container.getBoundingClientRect();
        const mx = event.clientX - rect.left;
        const my = event.clientY - rect.top;
        nodes.forEach(node => {
            const nx = node.offsetLeft + node.offsetWidth / 2;
            const ny = node.offsetTop + node.offsetHeight / 2;
            const dx = mx - nx;
            const dy = my - ny;
            const dist = Math.hypot(dx, dy) || 1;
            const strength = Math.max(0, 140 - dist) / 140;
            const offsetX = (dx / dist) * strength * 10;
            const offsetY = (dy / dist) * strength * 10;
            node.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        });
    };

    const reset = () => {
        nodes.forEach(node => {
            node.style.transform = "";
        });
    };

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("mouseleave", reset);
}
