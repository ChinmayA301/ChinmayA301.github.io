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

// Year
document.getElementById("year").textContent = new Date().getFullYear();

let projectCache = [];

function renderProjects(projects) {
    const grid = document.getElementById("projectsGrid");
    if (!grid) return;
    if (!projects.length) {
        grid.innerHTML = `<p class="text-muted small">No projects found yet.</p>`;
        return;
    }
    grid.innerHTML = projects.map(p => `
      <div class="col-md-6">
        <a ${p.link ? `href="${p.link}" target="_blank"` : ""} class="project-box card shadow-sm h-100">
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
        const res = await fetch("data/experience.json", { cache: "no-store" });
        const items = await res.json();
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
    return items.map(item => `
      <div class="timeline-item card">
        <div class="card-body">
          <h3 class="h5 mb-1">${item.title}</h3>
          <p class="mb-1"><strong>${item.org}</strong> | ${item.time}</p>
          ${item.location ? `<p class="mb-2 small text-muted">${item.location}</p>` : ""}
          <ul class="mb-0 small text-muted ps-3">
            ${(item.bullets || []).map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>
      </div>
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
        const res = await fetch("data/experience.json", { cache: "no-store" });
        const items = await res.json();
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
    try {
        const ideas = await loadJsonWithOverrides("future_ideas", "data/future_ideas.json");
        if (!ideas.length) {
            grid.innerHTML = `<p class="text-muted small">No future ideas available yet.</p>`;
            return;
        }
        grid.innerHTML = ideas.map(i => `
      <div class="col-lg-6">
        <article class="idea-card card h-100">
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
        </article>
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

const LOCAL_KEY_PREFIX = "portfolio_upload_";
const SESSION_TOKEN_KEY = "portfolio_github_token";
const GITHUB_DEFAULTS = {
    owner: "ChinmayA301",
    repo: "ChinmayA301.github.io",
    branch: "main"
};

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
    const res = await fetch(fallbackPath, { cache: "no-store" });
    return res.json();
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
        const res = await fetch(fallbackPath, { cache: "no-store" });
        const data = await res.json();
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
        title: "Projects",
        description: "Flagship builds, rapid prototypes, and live systems.",
        href: "projects.html",
        metric: "12+ builds",
        tone: "primary",
        x: 12,
        y: 20
    },
    {
        title: "Project Reports",
        description: "Long-form case studies with context, evaluation, and results.",
        href: "reports.html",
        metric: "Deep dives",
        tone: "accent",
        x: 58,
        y: 16
    },
    {
        title: "Coursework",
        description: "Academic projects, deliverables, and research notes.",
        href: "coursework.html",
        metric: "MS + B.Tech",
        tone: "neutral",
        x: 78,
        y: 48
    },
    {
        title: "Future Ideas",
        description: "Concept briefs and research directions pre-implementation.",
        href: "ideas.html",
        metric: "Idea backlog",
        tone: "accent",
        x: 35,
        y: 56
    },
    {
        title: "Experience",
        description: "Work timeline + education history in separate views.",
        href: "experience.html",
        metric: "Industry + Research",
        tone: "primary",
        x: 8,
        y: 68
    },
    {
        title: "Resume",
        description: "Role-specific resume downloads for targeted applications.",
        href: "resumes.html",
        metric: "6 roles",
        tone: "neutral",
        x: 62,
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
