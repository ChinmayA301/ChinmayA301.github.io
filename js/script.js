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

const PORTFOLIO_SIGNAL_MODEL = {
    skills: [
        { key: "rag", label: "RAG / Retrieval", color: "#8ad1ff" },
        { key: "evaluation", label: "Evaluation", color: "#ffc46f" },
        { key: "governance", label: "Governance", color: "#9df2d0" },
        { key: "analytics", label: "Analytics Engineering", color: "#9dc2ff" },
        { key: "product", label: "Product Systems", color: "#f3a6ff" },
        { key: "trust", label: "Trust Signals", color: "#ff9c8a" }
    ],
    projects: {
        "Aegis AI Governance & Readiness Platform": {
            skills: ["governance", "evaluation", "product"],
            roles: { dataScientist: 2, aiEngineer: 3, strategy: 5, governance: 5 }
        },
        "PolyRAG: Multi-Model Governance RAG": {
            skills: ["rag", "evaluation", "governance"],
            roles: { dataScientist: 3, aiEngineer: 5, strategy: 3, governance: 5 }
        },
        "TransferSignal": {
            skills: ["product", "trust", "evaluation"],
            roles: { dataScientist: 3, aiEngineer: 4, strategy: 3, governance: 2 }
        },
        "Operations Control Tower": {
            skills: ["analytics", "evaluation", "product"],
            roles: { dataScientist: 4, aiEngineer: 2, strategy: 4, governance: 2 }
        },
        "Healthcare Readmission Risk with Fairness & Calibration": {
            skills: ["evaluation", "governance", "analytics"],
            roles: { dataScientist: 5, aiEngineer: 3, strategy: 3, governance: 5 }
        },
        "Tabular ML Benchmark: Human FE vs AutoML": {
            skills: ["evaluation", "analytics", "product"],
            roles: { dataScientist: 5, aiEngineer: 4, strategy: 3, governance: 3 }
        },
        "Longitudinal Diabetes Risk Modeling with Neighborhood Deprivation": {
            skills: ["evaluation", "analytics", "governance"],
            roles: { dataScientist: 5, aiEngineer: 3, strategy: 2, governance: 4 }
        },
        "Public-Sector AI Readiness & Efficiency Evaluation": {
            skills: ["governance", "evaluation", "product"],
            roles: { dataScientist: 4, aiEngineer: 4, strategy: 5, governance: 5 }
        },
        "Financial Document Intelligence (FinBizInfo)": {
            skills: ["rag", "analytics", "governance"],
            roles: { dataScientist: 3, aiEngineer: 4, strategy: 3, governance: 4 }
        },
        "Data Science Career Audit": {
            skills: ["analytics", "evaluation", "trust"],
            roles: { dataScientist: 4, aiEngineer: 2, strategy: 5, governance: 2 }
        },
        "SignalGraph": {
            skills: ["trust", "analytics", "evaluation"],
            roles: { dataScientist: 4, aiEngineer: 3, strategy: 4, governance: 3 }
        },
        "Wax Seal Trust Provenance": {
            skills: ["trust", "governance", "product"],
            roles: { dataScientist: 2, aiEngineer: 4, strategy: 4, governance: 5 }
        }
    },
    governanceRadar: [
        { label: "Policy & controls", value: 88 },
        { label: "Risk registers", value: 84 },
        { label: "Human review", value: 80 },
        { label: "Evidence trails", value: 86 },
        { label: "Evaluation", value: 90 },
        { label: "Monitoring", value: 76 }
    ],
    roleLabels: [
        { key: "dataScientist", label: "Data Scientist" },
        { key: "aiEngineer", label: "AI Engineer" },
        { key: "strategy", label: "Strategy" },
        { key: "governance", label: "Governance" }
    ]
};

const AI_BENCHMARK_PULSE_SEARCHES = [
    {
        key: "llm",
        label: "LLM evaluation",
        query: "llm evaluation benchmark language:Python stars:>50",
        color: "#8ad1ff"
    },
    {
        key: "rag",
        label: "RAG evaluation",
        query: "rag evaluation benchmark language:Python stars:>20",
        color: "#9df2d0"
    },
    {
        key: "agent",
        label: "Agent evaluation",
        query: "agent evaluation benchmark language:Python stars:>10",
        color: "#ffc46f"
    },
    {
        key: "ml",
        label: "ML benchmarking",
        query: "machine learning benchmark evaluation language:Python stars:>50",
        color: "#f3a6ff"
    }
];

let aiPulseChartState = null;

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
    }[char]));
}

function loadTwitterWidgets(root) {
    if (!root?.querySelector(".twitter-tweet")) return;
    if (window.twttr?.widgets?.load) {
        window.twttr.widgets.load(root);
        return;
    }
    if (document.getElementById("twitter-widgets-js")) return;
    const script = document.createElement("script");
    script.id = "twitter-widgets-js";
    script.async = true;
    script.src = "https://platform.twitter.com/widgets.js";
    script.charset = "utf-8";
    script.onload = () => window.twttr?.widgets?.load?.(root);
    document.body.appendChild(script);
}

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

function renderProjects(projects, options = {}) {
    const gridId = options.gridId || "projectsGrid";
    const columnClass = options.columnClass || "col-md-6";
    const grid = document.getElementById(gridId);
    if (!grid) return;
    if (!projects.length) {
        grid.innerHTML = `<p class="text-muted small">No projects found yet.</p>`;
        return;
    }
    grid.innerHTML = projects.map(p => {
        const link = p.link || p.tweetUrl || "";
        const tags = (p.tags || []).map(t => `<span class="badge bg-secondary-subtle text-secondary me-1">${escapeHtml(t)}</span>`).join("");
        const actions = (p.links || []).filter(item => item && item.url && item.label);
        const actionLinks = actions.length ? `
            <div class="project-actions mt-3">
                ${actions.map(item => `
                    <a class="project-cta" href="${escapeHtml(item.url)}" ${/^https?:\/\//i.test(item.url) ? 'target="_blank" rel="noopener"' : ""}>${escapeHtml(item.label === "GitHub" ? "Explore implementation" : item.label)}</a>
                `).join("")}
            </div>
        ` : "";
        const status = p.status ? `<p class="project-status mb-2">${escapeHtml(p.status)}</p>` : "";
        const contributionText = p.contribution || p.role || "";
        const contributionLabel = p.contribution ? "Contribution" : "Role";
        const role = contributionText ? `<p class="project-role"><strong>${contributionLabel}</strong>${escapeHtml(contributionText)}</p>` : "";
        const result = p.result ? `<p class="project-result"><strong>Result</strong>${escapeHtml(p.result)}</p>` : "";
        const why = p.why ? `<p class="project-why"><strong>Operational relevance</strong>${escapeHtml(p.why)}</p>` : "";
        const stack = p.stack ? `<p class="project-stack"><strong>Tools</strong>${escapeHtml(p.stack)}</p>` : "";
        const projectMeta = role || stack ? `<div class="project-signal-meta">${role}${stack}</div>` : "";
        const privacy = p.privacy ? `<p class="project-privacy">${escapeHtml(p.privacy)}</p>` : "";
        const tweetEmbed = p.tweetUrl ? `
            <div class="project-embed mt-3">
                <blockquote class="twitter-tweet" data-media-max-width="560">
                    <p lang="en" dir="ltr">${escapeHtml(p.tweetText || p.title)}</p>
                    &mdash; Chinmay A (@Ch_Aurora3)
                    <a href="${escapeHtml(p.tweetUrl)}">${escapeHtml(p.tweetDate || "April 7, 2026")}</a>
                </blockquote>
            </div>
        ` : "";
        const tweetCta = p.tweetUrl ? `
            <a class="project-cta" href="${escapeHtml(p.tweetUrl)}" target="_blank" rel="noopener">Open video post</a>
        ` : "";
        const projectActions = [actionLinks, tweetCta].filter(Boolean).join("");
        const cardBody = `
            <div class="card-body">
                <h3 class="h5">${escapeHtml(p.title)}</h3>
                ${status}
                <p class="mb-2 small text-muted">${escapeHtml(p.problem || p.description)}</p>
                ${projectMeta}
                ${result}
                ${why}
                ${privacy}
                <div class="project-tags">${tags}</div>
                ${tweetEmbed}
                ${projectActions}
            </div>
        `;
        return `
          <div class="${columnClass}">
            ${p.tweetUrl
                ? `<article class="project-box card shadow-sm h-100">${cardBody}</article>`
                : actions.length
                    ? `<article class="project-box card shadow-sm h-100">${cardBody}</article>`
                    : link
                        ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener" class="project-box card shadow-sm h-100">${cardBody}</a>`
                        : `<article class="project-box card shadow-sm h-100">${cardBody}</article>`}
          </div>
        `;
    }).join("");
    loadTwitterWidgets(grid);
    applyStagger(grid.querySelectorAll(".project-box"));
}

function buildProjectFilters(projects) {
    const filterWrap = document.getElementById("projectsFilter");
    if (!filterWrap) return;
    const paths = [
        { key: "all", label: "All work" },
        { key: "data-science", label: "Data Science" },
        { key: "analytics", label: "Analytics" },
        { key: "applied-ai", label: "Applied AI" },
        { key: "responsible-ai", label: "Responsible AI" }
    ];
    const params = new URLSearchParams(window.location.search);
    const requestedPath = params.get("path");
    const activePath = paths.some(path => path.key === requestedPath) ? requestedPath : "all";
    filterWrap.innerHTML = paths.map(path => `
      <button class="filter-pill ${path.key === activePath ? "active" : ""}" data-path="${path.key}">${path.label}</button>
    `).join("");
    applyStagger(filterWrap.querySelectorAll(".filter-pill"));

    const renderPath = path => {
        const filtered = path === "all"
            ? projectCache
            : projectCache.filter(project => (project.paths || []).includes(path));
        renderProjects(filtered);
    };

    renderPath(activePath);

    filterWrap.querySelectorAll(".filter-pill").forEach(btn => {
        btn.addEventListener("click", () => {
            filterWrap.querySelectorAll(".filter-pill").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const path = btn.getAttribute("data-path") || "all";
            const nextUrl = new URL(window.location.href);
            if (path === "all") nextUrl.searchParams.delete("path");
            else nextUrl.searchParams.set("path", path);
            window.history.replaceState({}, "", nextUrl);
            renderPath(path);
        });
    });
}

function getPortfolioProfiles(projects) {
    const model = PORTFOLIO_SIGNAL_MODEL.projects;
    return Object.keys(model)
        .map(title => {
            const project = projects.find(item => item.title === title);
            if (!project) return null;
            return {
                ...model[title],
                title,
                description: project.description,
                status: project.status,
                link: project.link || (project.links || [])[0]?.url || "",
                tags: project.tags || []
            };
        })
        .filter(Boolean);
}

function getSkillByKey(key) {
    return PORTFOLIO_SIGNAL_MODEL.skills.find(skill => skill.key === key);
}

function renderSkillProjectGraph(profiles) {
    const skills = PORTFOLIO_SIGNAL_MODEL.skills.filter(skill =>
        profiles.some(profile => profile.skills.includes(skill.key))
    );
    const height = Math.max(360, Math.max(skills.length, profiles.length) * 54 + 70);
    const skillStep = skills.length > 1 ? (height - 90) / (skills.length - 1) : 1;
    const projectStep = profiles.length > 1 ? (height - 90) / (profiles.length - 1) : 1;
    const skillPositions = new Map(skills.map((skill, idx) => [skill.key, 45 + idx * skillStep]));
    const projectPositions = new Map(profiles.map((profile, idx) => [profile.title, 45 + idx * projectStep]));
    const edges = profiles.flatMap(profile => profile.skills.map(skillKey => {
        const skill = getSkillByKey(skillKey);
        const y1 = skillPositions.get(skillKey);
        const y2 = projectPositions.get(profile.title);
        return `<path class="skill-edge" d="M 130 ${y1} C 250 ${y1}, 355 ${y2}, 480 ${y2}" stroke="${skill?.color || "#8ad1ff"}" />`;
    }));
    const skillNodes = skills.map(skill => `
        <g class="skill-node" transform="translate(24 ${skillPositions.get(skill.key)})">
            <circle r="8" fill="${skill.color}" />
            <text x="18" y="5">${escapeHtml(skill.label)}</text>
        </g>
    `).join("");
    const projectNodes = profiles.map(profile => `
        <g class="project-node" transform="translate(496 ${projectPositions.get(profile.title)})">
            <circle r="6" />
            <text x="16" y="-2">${escapeHtml(profile.title)}</text>
            <text x="16" y="15" class="project-node-meta">${escapeHtml(profile.status || "Portfolio project")}</text>
        </g>
    `).join("");
    return `
        <article class="portfolio-panel portfolio-panel-wide">
            <div class="portfolio-panel-header">
                <div>
                    <p class="eyebrow">Skill-to-project graph</p>
                    <h3>Bipartite evidence map</h3>
                </div>
                <span>${profiles.length} projects</span>
            </div>
            <div class="skill-graph-wrap" role="img" aria-label="Bipartite graph connecting portfolio skills to selected projects">
                <svg class="skill-graph" viewBox="0 0 760 ${height}" preserveAspectRatio="xMinYMin meet">
                    <line class="graph-rail" x1="130" y1="24" x2="130" y2="${height - 24}" />
                    <line class="graph-rail" x1="480" y1="24" x2="480" y2="${height - 24}" />
                    ${edges.join("")}
                    ${skillNodes}
                    ${projectNodes}
                </svg>
            </div>
            <div class="graph-legend">
                ${skills.map(skill => `<span style="--legend-color:${skill.color}">${escapeHtml(skill.label)}</span>`).join("")}
            </div>
        </article>
    `;
}

function getRadarPoint(index, total, value, radius, center) {
    const angle = (Math.PI * 2 * index / total) - Math.PI / 2;
    const scaledRadius = radius * (value / 100);
    return {
        x: center + Math.cos(angle) * scaledRadius,
        y: center + Math.sin(angle) * scaledRadius,
        labelX: center + Math.cos(angle) * (radius + 34),
        labelY: center + Math.sin(angle) * (radius + 34)
    };
}

function renderGovernanceRadar() {
    const dimensions = PORTFOLIO_SIGNAL_MODEL.governanceRadar;
    const center = 170;
    const radius = 104;
    const total = dimensions.length;
    const rings = [25, 50, 75, 100].map(value => {
        const points = dimensions.map((_, idx) => {
            const point = getRadarPoint(idx, total, value, radius, center);
            return `${point.x},${point.y}`;
        }).join(" ");
        return `<polygon class="radar-ring" points="${points}" />`;
    }).join("");
    const axes = dimensions.map((dimension, idx) => {
        const outer = getRadarPoint(idx, total, 100, radius, center);
        return `
            <line class="radar-axis" x1="${center}" y1="${center}" x2="${outer.x}" y2="${outer.y}" />
            <text class="radar-label" x="${outer.labelX}" y="${outer.labelY}">${escapeHtml(dimension.label)}</text>
        `;
    }).join("");
    const valuePoints = dimensions.map((dimension, idx) => {
        const point = getRadarPoint(idx, total, dimension.value, radius, center);
        return `${point.x},${point.y}`;
    }).join(" ");
    const average = Math.round(dimensions.reduce((sum, item) => sum + item.value, 0) / dimensions.length);
    return `
        <article class="portfolio-panel">
            <div class="portfolio-panel-header">
                <div>
                    <p class="eyebrow">Governance maturity radar</p>
                    <h3>Controls readiness</h3>
                </div>
                <span>${average}/100</span>
            </div>
            <div class="radar-wrap" role="img" aria-label="Governance maturity radar across policy, risk, review, evidence, evaluation, and monitoring">
                <svg class="radar-chart" viewBox="0 0 340 340">
                    ${rings}
                    ${axes}
                    <polygon class="radar-area" points="${valuePoints}" />
                    ${dimensions.map((dimension, idx) => {
                        const point = getRadarPoint(idx, total, dimension.value, radius, center);
                        return `<circle class="radar-dot" cx="${point.x}" cy="${point.y}" r="4"><title>${escapeHtml(dimension.label)}: ${dimension.value}/100</title></circle>`;
                    }).join("")}
                </svg>
            </div>
            <div class="radar-dimensions">
                ${dimensions.map(item => `
                    <div>
                        <span>${escapeHtml(item.label)}</span>
                        <strong>${item.value}</strong>
                    </div>
                `).join("")}
            </div>
        </article>
    `;
}

function getRoleClass(score) {
    if (score >= 5) return "role-score-strong";
    if (score >= 4) return "role-score-good";
    if (score >= 3) return "role-score-medium";
    return "role-score-light";
}

function renderRoleFitMatrix(profiles) {
    const roleLabels = PORTFOLIO_SIGNAL_MODEL.roleLabels;
    return `
        <article class="portfolio-panel portfolio-panel-wide">
            <div class="portfolio-panel-header">
                <div>
                    <p class="eyebrow">Role fit matrix</p>
                    <h3>Projects mapped to target signals</h3>
                </div>
                <span>1-5 fit</span>
            </div>
            <div class="role-matrix-wrap">
                <table class="role-matrix">
                    <thead>
                        <tr>
                            <th scope="col">Project</th>
                            ${roleLabels.map(role => `<th scope="col">${escapeHtml(role.label)}</th>`).join("")}
                        </tr>
                    </thead>
                    <tbody>
                        ${profiles.map(profile => `
                            <tr>
                                <th scope="row">
                                    ${profile.link
                                        ? `<a href="${escapeHtml(profile.link)}" target="_blank" rel="noopener">${escapeHtml(profile.title)}</a>`
                                        : escapeHtml(profile.title)}
                                </th>
                                ${roleLabels.map(role => {
                                    const score = profile.roles[role.key] || 0;
                                    return `
                                        <td>
                                            <span class="role-score ${getRoleClass(score)}" aria-label="${escapeHtml(role.label)} fit ${score} out of 5">
                                                <span style="width:${score * 20}%"></span>
                                            </span>
                                            <strong>${score}</strong>
                                        </td>
                                    `;
                                }).join("")}
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </article>
    `;
}

function renderPortfolioIntelligence(projects) {
    const wrap = document.getElementById("portfolioIntelligence");
    if (!wrap) return;
    const profiles = getPortfolioProfiles(projects);
    if (!profiles.length) {
        wrap.innerHTML = `<p class="text-muted small">Portfolio signal map will appear after projects load.</p>`;
        return;
    }
    wrap.innerHTML = `
        ${renderSkillProjectGraph(profiles)}
        <div class="portfolio-split">
            ${renderGovernanceRadar()}
            ${renderRoleFitMatrix(profiles)}
        </div>
    `;
    applyStagger(wrap.querySelectorAll(".portfolio-panel"));
}

function getQuarterKey(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Unknown";
    const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
    return `${date.getUTCFullYear()} Q${quarter}`;
}

function getQuarterIndex(key) {
    const match = String(key).match(/^(\d{4}) Q([1-4])$/);
    if (!match) return 0;
    return Number(match[1]) * 4 + Number(match[2]);
}

function formatCompactNumber(value) {
    return new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: value >= 1000 ? 1 : 0
    }).format(value || 0);
}

function formatDateShort(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

async function fetchAiPulseLane(lane) {
    const url = new URL("https://api.github.com/search/repositories");
    url.searchParams.set("q", lane.query);
    url.searchParams.set("sort", "updated");
    url.searchParams.set("order", "desc");
    url.searchParams.set("per_page", "20");
    const response = await fetch(url.toString(), {
        headers: { Accept: "application/vnd.github+json" },
        cache: "no-store"
    });
    if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status} for ${lane.label}`);
    }
    const payload = await response.json();
    return (payload.items || []).map(item => ({
        lane: lane.key,
        laneLabel: lane.label,
        laneColor: lane.color,
        name: item.full_name,
        description: item.description || "",
        url: item.html_url,
        stars: item.stargazers_count || 0,
        forks: item.forks_count || 0,
        openIssues: item.open_issues_count || 0,
        language: item.language || "Unknown",
        createdAt: item.created_at,
        updatedAt: item.updated_at
    }));
}

function buildAiPulseDataset(items) {
    const deduped = Array.from(
        items.reduce((map, item) => {
            const existing = map.get(item.name);
            if (!existing || item.stars > existing.stars) {
                map.set(item.name, item);
            }
            return map;
        }, new Map()).values()
    ).sort((a, b) => b.stars - a.stars);

    const quarterKeys = Array.from(new Set(deduped.map(item => getQuarterKey(item.createdAt))))
        .filter(key => key !== "Unknown")
        .sort((a, b) => getQuarterIndex(a) - getQuarterIndex(b));
    const labels = quarterKeys.slice(-12);
    const firstVisibleIndex = labels.length ? getQuarterIndex(labels[0]) : 0;
    const lanes = AI_BENCHMARK_PULSE_SEARCHES.map(lane => {
        const laneItems = deduped.filter(item => item.lane === lane.key);
        let carry = laneItems
            .filter(item => getQuarterIndex(getQuarterKey(item.createdAt)) < firstVisibleIndex)
            .reduce((sum, item) => sum + item.stars, 0);
        const points = labels.map(label => {
            const quarterStars = laneItems
                .filter(item => getQuarterKey(item.createdAt) === label)
                .reduce((sum, item) => sum + item.stars, 0);
            carry += quarterStars;
            return carry;
        });
        return { ...lane, points, totalStars: laneItems.reduce((sum, item) => sum + item.stars, 0), count: laneItems.length };
    });

    return {
        labels,
        lanes,
        repos: deduped.slice(0, 10),
        totalStars: deduped.reduce((sum, item) => sum + item.stars, 0),
        repoCount: deduped.length,
        updatedAt: new Date()
    };
}

function drawAiPulseChart(canvas, dataset) {
    if (!canvas || !dataset?.labels?.length) return;
    const parent = canvas.parentElement;
    const width = Math.max(620, parent?.clientWidth || 720);
    const height = 330;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const pad = { top: 26, right: 28, bottom: 52, left: 68 };
    const chartWidth = width - pad.left - pad.right;
    const chartHeight = height - pad.top - pad.bottom;
    const allValues = dataset.lanes.flatMap(lane => lane.points);
    const maxValue = Math.max(...allValues, 1);
    const xFor = idx => pad.left + (dataset.labels.length === 1 ? 0 : (idx / (dataset.labels.length - 1)) * chartWidth);
    const yFor = value => pad.top + chartHeight - (value / maxValue) * chartHeight;

    ctx.font = "12px Space Grotesk, sans-serif";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillStyle = "rgba(208, 216, 230, 0.7)";
    for (let i = 0; i <= 4; i += 1) {
        const value = (maxValue / 4) * i;
        const y = yFor(value);
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(width - pad.right, y);
        ctx.stroke();
        ctx.fillText(formatCompactNumber(Math.round(value)), 12, y + 4);
    }

    const labelInterval = Math.max(1, Math.ceil(dataset.labels.length / 5));
    dataset.labels.forEach((label, idx) => {
        const lastIndex = dataset.labels.length - 1;
        if (idx !== 0 && idx !== lastIndex && idx % labelInterval !== 0) return;
        if (idx !== lastIndex && lastIndex - idx < labelInterval) return;
        const x = xFor(idx);
        ctx.fillStyle = "rgba(208, 216, 230, 0.68)";
        const offset = idx === dataset.labels.length - 1 ? 48 : 22;
        ctx.fillText(label, x - offset, height - 20);
    });

    dataset.lanes.forEach(lane => {
        if (!lane.points.some(Boolean)) return;
        ctx.beginPath();
        lane.points.forEach((value, idx) => {
            const x = xFor(idx);
            const y = yFor(value);
            if (idx === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.lineWidth = 2.4;
        ctx.strokeStyle = lane.color;
        ctx.stroke();

        lane.points.forEach((value, idx) => {
            if (idx !== lane.points.length - 1 && idx % 3 !== 0) return;
            ctx.beginPath();
            ctx.arc(xFor(idx), yFor(value), 3.2, 0, Math.PI * 2);
            ctx.fillStyle = lane.color;
            ctx.fill();
        });
    });
}

function renderAiPulse(dataset) {
    const wrap = document.getElementById("aiBenchmarkPulse");
    if (!wrap) return;
    const topRepo = dataset.repos[0];
    wrap.innerHTML = `
        <article class="ai-pulse-panel">
            <div class="ai-pulse-chart-head">
                <div>
                    <p class="eyebrow">Current traction index</p>
                    <h3>Evaluation and benchmarking repo cohorts</h3>
                </div>
                <span>Updated ${escapeHtml(dataset.updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))}</span>
            </div>
            <div class="ai-pulse-grid">
                <div class="ai-pulse-chart-card">
                    <div class="ai-pulse-chart-scroll">
                        <canvas id="aiPulseCanvas" aria-label="Live AI evaluation benchmark tracking graph"></canvas>
                    </div>
                    <div class="ai-pulse-legend">
                        ${dataset.lanes.map(lane => `<span style="--legend-color:${lane.color}">${escapeHtml(lane.label)}</span>`).join("")}
                    </div>
                    <p class="ai-pulse-note">Source: live GitHub repository search. Values are current stars accumulated by repository creation cohort, not historical star counts.</p>
                </div>
                <aside class="ai-pulse-side">
                    <div class="ai-pulse-stats">
                        <div><span>Tracked repos</span><strong>${dataset.repoCount}</strong></div>
                        <div><span>Total stars</span><strong>${formatCompactNumber(dataset.totalStars)}</strong></div>
                        <div><span>Top signal</span><strong>${escapeHtml(topRepo?.name || "n/a")}</strong></div>
                    </div>
                    <div class="ai-pulse-table-wrap">
                        <table class="ai-pulse-table">
                            <thead>
                                <tr>
                                    <th scope="col">Repository</th>
                                    <th scope="col">Lane</th>
                                    <th scope="col">Stars</th>
                                    <th scope="col">Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${dataset.repos.map(repo => `
                                    <tr>
                                        <th scope="row"><a href="${escapeHtml(repo.url)}" target="_blank" rel="noopener">${escapeHtml(repo.name)}</a></th>
                                        <td>${escapeHtml(repo.laneLabel)}</td>
                                        <td>${formatCompactNumber(repo.stars)}</td>
                                        <td>${formatDateShort(repo.updatedAt)}</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                </aside>
            </div>
        </article>
    `;
    aiPulseChartState = dataset;
    drawAiPulseChart(document.getElementById("aiPulseCanvas"), dataset);
    applyStagger(wrap.querySelectorAll(".ai-pulse-panel"));
}

function renderAiPulseError(message) {
    const wrap = document.getElementById("aiBenchmarkPulse");
    if (!wrap) return;
    wrap.innerHTML = `
        <article class="ai-pulse-panel ai-pulse-error">
            <p class="eyebrow">Live ingest unavailable</p>
            <h3>GitHub signals could not be loaded</h3>
            <p>${escapeHtml(message)} Refresh again in a moment, or check the browser/network rate limit.</p>
        </article>
    `;
}

async function loadAiBenchmarkPulse() {
    const wrap = document.getElementById("aiBenchmarkPulse");
    if (!wrap) return;
    const refresh = document.getElementById("refreshAiPulse");
    if (refresh) {
        refresh.disabled = true;
        refresh.textContent = "Loading";
    }
    wrap.innerHTML = `<p class="text-muted small mb-0">Loading live AI evaluation signals...</p>`;
    try {
        const results = await Promise.all(AI_BENCHMARK_PULSE_SEARCHES.map(fetchAiPulseLane));
        const dataset = buildAiPulseDataset(results.flat());
        renderAiPulse(dataset);
    } catch (error) {
        console.error("AI benchmark pulse load error:", error);
        renderAiPulseError(error.message || "The live data request failed.");
    } finally {
        if (refresh) {
            refresh.disabled = false;
            refresh.textContent = "Refresh";
        }
    }
}

// Render Projects from JSON
async function loadProjects() {
    const grid = document.getElementById("projectsGrid");
    const featuredGrid = document.getElementById("featuredProjectsGrid");
    if (!grid && !featuredGrid) return;
    try {
        const projects = await loadJsonWithOverrides("projects", "data/projects.json");
        projectCache = Array.isArray(projects) ? [...projects].sort((a, b) => {
            if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
            return (a.featured_order || 99) - (b.featured_order || 99);
        }) : [];
        if (grid) {
            renderProjects(projectCache);
            buildProjectFilters(projectCache);
            renderPortfolioIntelligence(projectCache);
        }
        if (featuredGrid) {
            const featuredProjects = projectCache
                .filter(project => project.featured)
                .sort((a, b) => (a.featured_order || 99) - (b.featured_order || 99));
            renderProjects(featuredProjects, {
                gridId: "featuredProjectsGrid",
                columnClass: "col-md-6 col-xl-4"
            });
        }
    } catch (e) {
        if (grid) grid.innerHTML = `<p class="text-danger small">Could not load projects.</p>`;
        if (featuredGrid) featuredGrid.innerHTML = `<p class="text-danger small">Could not load selected work.</p>`;
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
        const isEdu = title.includes("m.s.") || title.includes("b.tech") || title.includes("b.tech.")
            || title.includes("master") || title.includes("bachelor");
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
        const current = workItems.find(item => (item.org || "").toLowerCase().includes("hennepin")) || workItems[0];
        const latestEdu = eduItems.find(item => (item.title || "").toLowerCase().includes("m.s.")) || eduItems[0];
        if (currentRoleEl && current) {
            currentRoleEl.innerHTML = `
        <p class="eyebrow">Selected Experience</p>
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
loadAiBenchmarkPulse();

const refreshAiPulse = document.getElementById("refreshAiPulse");
if (refreshAiPulse) {
    refreshAiPulse.addEventListener("click", loadAiBenchmarkPulse);
}

window.addEventListener("resize", () => {
    if (!aiPulseChartState) return;
    window.clearTimeout(window.aiPulseResizeTimer);
    window.aiPulseResizeTimer = window.setTimeout(() => {
        drawAiPulseChart(document.getElementById("aiPulseCanvas"), aiPulseChartState);
    }, 150);
});

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
        const featured = Array.isArray(reports)
            ? reports.find(report => report.featured === true) || reports[0]
            : null;
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
    const locationName = document.getElementById("heroGlobeLocationName");
    const locationNote = document.getElementById("heroGlobeLocationNote");
    const locationChips = document.getElementById("heroGlobeLocationChips");
    const previewCanvas = document.getElementById("heroGlobePreviewCanvas");
    const modalCanvas = document.getElementById("heroGlobeModalCanvas");
    if (!trigger || !modal || !previewCanvas || !modalCanvas) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const locations = [
        { name: "New Delhi", lat: 28.6139, lon: 77.2090, note: "Home" },
        { name: "Chennai", lat: 13.0827, lon: 80.2707, note: "College" },
        { name: "Minneapolis", lat: 44.9778, lon: -93.2650, note: "Current home" },
        { name: "Dubai", lat: 25.2048, lon: 55.2708, note: "Second home" },
        { name: "Miami", lat: 25.7617, lon: -80.1918, note: "Internship location" },
        { name: "NYC", lat: 40.7128, lon: -74.0060, note: "Future home" }
    ];
    const landPolygons = [
        [
            [-168, 72], [-160, 70], [-152, 68], [-145, 64], [-140, 60], [-136, 56], [-132, 52], [-129, 48],
            [-127, 44], [-125, 40], [-123, 36], [-121, 33], [-117, 32], [-113, 31], [-108, 29], [-103, 27],
            [-97, 25], [-92, 22], [-88, 19], [-85, 18], [-82, 20], [-80, 24], [-80, 28], [-82, 31], [-85, 34],
            [-89, 38], [-94, 42], [-99, 47], [-104, 52], [-110, 57], [-117, 62], [-126, 66], [-138, 70], [-150, 72]
        ],
        [
            [-81, 12], [-79, 10], [-77, 8], [-75, 4], [-74, 0], [-72, -5], [-70, -10], [-68, -15], [-66, -20],
            [-64, -25], [-62, -30], [-60, -35], [-58, -40], [-55, -46], [-52, -51], [-49, -53], [-46, -50],
            [-45, -44], [-46, -38], [-48, -32], [-50, -25], [-53, -18], [-56, -10], [-60, -3], [-64, 2], [-69, 6], [-75, 9]
        ],
        [
            [-10, 72], [-4, 72], [2, 70], [8, 68], [16, 66], [22, 63], [27, 59], [31, 55], [34, 50], [34, 46],
            [30, 43], [24, 41], [18, 41], [14, 43], [10, 46], [6, 49], [1, 51], [-4, 50], [-7, 47], [-8, 43],
            [-7, 39], [-5, 36], [-1, 37], [5, 39], [10, 41], [16, 42], [22, 42], [28, 40], [34, 37], [40, 34],
            [44, 31], [42, 28], [36, 28], [29, 30], [21, 31], [14, 31], [8, 30], [2, 33], [-4, 38], [-8, 45], [-11, 53], [-14, 61]
        ],
        [
            [-18, 34], [-14, 32], [-10, 30], [-7, 26], [-5, 21], [-3, 16], [-1, 10], [1, 5], [4, 0], [7, -5],
            [10, -10], [13, -15], [16, -20], [20, -25], [24, -29], [28, -32], [32, -34], [36, -33], [40, -29],
            [43, -24], [46, -18], [48, -11], [47, -4], [45, 2], [42, 8], [38, 14], [34, 19], [29, 24], [23, 28],
            [16, 31], [8, 33], [0, 34]
        ],
        [
            [34, 34], [40, 38], [47, 41], [54, 44], [62, 47], [70, 50], [78, 53], [86, 55], [95, 56], [104, 55],
            [114, 54], [123, 51], [132, 49], [141, 46], [149, 43], [156, 39], [160, 34], [156, 30], [149, 28],
            [141, 26], [132, 24], [123, 21], [114, 18], [106, 14], [98, 11], [90, 9], [82, 11], [76, 16], [72, 22],
            [68, 28], [62, 30], [56, 30], [50, 28], [45, 28], [40, 30], [36, 32]
        ],
        [
            [112, -12], [116, -16], [121, -19], [127, -21], [133, -23], [139, -26], [145, -30], [150, -35],
            [152, -40], [147, -41], [140, -39], [133, -35], [127, -31], [121, -27], [116, -22], [112, -17]
        ]
    ];
    const boundaryLines = [
        [[-125, 49], [-96, 49], [-95, 26]],
        [[-79, 8], [-71, -4], [-66, -16], [-60, -32]],
        [[-8, 54], [2, 51], [14, 47], [24, 41]],
        [[-17, 15], [0, 17], [16, 12], [32, 4]],
        [[34, 32], [48, 40], [62, 46], [78, 52]],
        [[72, 23], [84, 20], [96, 20], [108, 18], [120, 17]],
        [[113, -22], [128, -25], [141, -31]]
    ];
    function updateLocationDetails(location) {
        if (!locationName || !locationNote || !location) return;
        locationName.textContent = location.name;
        locationNote.textContent = location.note;
        if (locationChips) {
            Array.from(locationChips.children).forEach((chip) => {
                chip.classList.toggle("is-active", chip.textContent === location.name);
                chip.setAttribute("aria-pressed", chip.textContent === location.name ? "true" : "false");
            });
        }
    }

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
            hoveredLocation: null,
            selectedLocation: options.selectedLocation ?? null,
            pointerMoved: false,
            lastVisibleLocations: [],
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

        function drawProjectedLandPolygon(polygon, radius) {
            ctx.beginPath();
            let started = false;
            let visiblePoints = 0;
            for (let i = 0; i < polygon.length; i += 1) {
                const current = polygon[i % polygon.length];
                const next = polygon[(i + 1) % polygon.length];
                const steps = Math.max(
                    2,
                    Math.ceil(Math.max(Math.abs(next[0] - current[0]), Math.abs(next[1] - current[1])) / 3)
                );
                for (let step = 0; step < steps; step += 1) {
                    const t = step / steps;
                    const lon = current[0] + (next[0] - current[0]) * t;
                    const lat = current[1] + (next[1] - current[1]) * t;
                    const point = project(lat, lon, radius);
                    if (point.depth <= 0.015) {
                        if (visiblePoints > 2) {
                            ctx.closePath();
                        }
                        started = false;
                        continue;
                    }
                    if (!started) {
                        ctx.moveTo(point.x, point.y);
                        started = true;
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                    visiblePoints += 1;
                }
            }
            if (visiblePoints < 3) return;
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        function drawLand(radius) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(state.width / 2, state.height / 2, radius * 0.995, 0, Math.PI * 2);
            ctx.clip();

            ctx.fillStyle = "rgba(91, 169, 122, 0.58)";
            ctx.strokeStyle = "rgba(226, 247, 229, 0.28)";
            ctx.lineWidth = 1.2;
            landPolygons.forEach((polygon) => drawProjectedLandPolygon(polygon, radius));

            ctx.fillStyle = "rgba(185, 221, 153, 0.34)";
            [
                [[-6, 55], [-2, 58], [1, 55], [-2, 51]],
                [[72, 8], [79, 10], [82, 6], [78, 1], [73, 4]],
                [[45, -13], [50, -16], [49, -24], [44, -25], [43, -18]],
                [[96, 5], [103, 2], [106, -4], [101, -8], [96, -3]],
                [[138, 36], [143, 40], [146, 35], [142, 31], [138, 33]],
                [[170, -34], [178, -39], [173, -45], [166, -42], [165, -37]]
            ].forEach((polygon) => drawProjectedLandPolygon(polygon, radius));

            boundaryLines.forEach((line) => {
                ctx.beginPath();
                let started = false;
                line.forEach(([lon, lat]) => {
                    const point = project(lat, lon, radius);
                    if (point.depth <= 0.02) {
                        started = false;
                        return;
                    }
                    if (!started) {
                        ctx.moveTo(point.x, point.y);
                        started = true;
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                });
                ctx.strokeStyle = "rgba(221, 241, 230, 0.26)";
                ctx.lineWidth = 1;
                ctx.stroke();
            });
            ctx.restore();
        }

        function drawPins(radius) {
            const visible = locations
                .map((location) => ({ location, point: project(location.lat, location.lon, radius) }))
                .sort((a, b) => a.point.depth - b.point.depth);
            state.lastVisibleLocations = visible.map(({ location, point }) => ({
                location,
                x: point.x,
                y: point.y,
                depth: point.depth,
                radius: point.depth > 0 ? 9 : 5
            }));

            visible.forEach(({ location, point }) => {
                const alpha = point.depth > 0 ? 0.95 : 0.18;
                const isActive = state.selectedLocation?.name === location.name || state.hoveredLocation?.name === location.name;
                const dotRadius = point.depth > 0 ? 4.6 * state.glow : 3.2;
                ctx.beginPath();
                ctx.fillStyle = isActive
                    ? `rgba(255, 214, 138, ${Math.min(alpha + 0.08, 1)})`
                    : `rgba(255, 185, 92, ${alpha})`;
                ctx.arc(point.x, point.y, isActive ? dotRadius + 1.5 : dotRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.strokeStyle = isActive
                    ? `rgba(255, 214, 138, ${point.depth > 0 ? 0.72 : 0.18})`
                    : `rgba(138, 209, 255, ${point.depth > 0 ? 0.42 : 0.1})`;
                ctx.lineWidth = isActive ? 2 : 1.4;
                ctx.arc(point.x, point.y, dotRadius + (isActive ? 8 : 5.5), 0, Math.PI * 2);
                ctx.stroke();

                if (state.showLabels && point.depth > 0 && isActive) {
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

            drawLand(radius);
            drawGrid(radius);
            drawPins(radius);

            ctx.beginPath();
            ctx.strokeStyle = "rgba(138, 209, 255, 0.22)";
            ctx.lineWidth = 10;
            ctx.arc(centerX, centerY, radius * 1.01, -0.85, 0.85);
            ctx.stroke();
        }

        function getNearestLocation(clientX, clientY) {
            const rect = canvas.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            let nearest = null;
            let nearestDistance = Infinity;
            state.lastVisibleLocations.forEach((item) => {
                if (item.depth <= 0.05) return;
                const distance = Math.hypot(item.x - x, item.y - y);
                if (distance < item.radius + 8 && distance < nearestDistance) {
                    nearest = item.location;
                    nearestDistance = distance;
                }
            });
            return nearest;
        }

        function setActiveLocation(location, { locked = false } = {}) {
            if (locked) {
                state.selectedLocation = location;
            } else {
                state.hoveredLocation = location;
            }
            if (options.onLocationChange) {
                options.onLocationChange(location || state.selectedLocation || locations[2]);
            }
            canvas.style.cursor = location ? "pointer" : (state.interactive ? "grab" : "default");
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
            state.pointerMoved = false;
            canvas.setPointerCapture(event.pointerId);
            state.startX = event.clientX;
            state.startY = event.clientY;
        }

        function onPointerMove(event) {
            if (!state.interactive) return;

            if (!state.dragging) {
                const hovered = getNearestLocation(event.clientX, event.clientY);
                setActiveLocation(hovered, { locked: false });
                return;
            }

            if (state.pointerId !== event.pointerId) return;
            const deltaX = event.clientX - state.startX;
            const deltaY = event.clientY - state.startY;
            state.pointerMoved = state.pointerMoved || Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3;
            state.rotationY += deltaX * 0.008;
            state.rotationX += deltaY * 0.006;
            state.startX = event.clientX;
            state.startY = event.clientY;
            state.velocityY = deltaX * 0.0007;
            state.velocityX = deltaY * 0.0005;
        }

        function onPointerUp(event) {
            if (!state.interactive || state.pointerId !== event.pointerId) return;
            if (!state.pointerMoved) {
                const clicked = getNearestLocation(event.clientX, event.clientY);
                if (clicked) {
                    setActiveLocation(clicked, { locked: true });
                }
            }
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
            canvas.addEventListener("pointerleave", () => {
                state.hoveredLocation = null;
                canvas.style.cursor = "grab";
                if (options.onLocationChange) {
                    options.onLocationChange(state.selectedLocation || locations[2]);
                }
            });
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
        rotationX: -0.2,
        selectedLocation: locations[2],
        onLocationChange: updateLocationDetails
    });
    updateLocationDetails(locations[2]);

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
        y: 20,
        z: 34,
        cluster: "Research"
    },
    {
        title: "Experience",
        description: "Work timeline + education history in separate views.",
        href: "/experience/",
        metric: "Industry + Research",
        tone: "primary",
        x: 48,
        y: 14,
        z: 56,
        cluster: "Evidence"
    },
    {
        title: "Projects",
        description: "Flagship builds, rapid prototypes, and live systems.",
        href: "/projects/",
        metric: "12+ builds",
        tone: "primary",
        x: 78,
        y: 24,
        z: 82,
        cluster: "Builds"
    },
    {
        title: "Product and Venture Lab",
        description: "Theses, problem explorations, prototypes, and archived directions labeled by maturity.",
        href: "/ideas/",
        metric: "Staged exploration",
        tone: "accent",
        x: 28,
        y: 58,
        z: 72,
        cluster: "Venture"
    },
    {
        title: "Coursework",
        description: "Academic projects, deliverables, and research notes.",
        href: "/coursework/",
        metric: "MS + B.Tech",
        tone: "neutral",
        x: 58,
        y: 52,
        z: 44,
        cluster: "Academic"
    },
    {
        title: "Project Reports",
        description: "Long-form case studies with context, evaluation, and results.",
        href: "/reports/",
        metric: "Deep dives",
        tone: "accent",
        x: 78,
        y: 66,
        z: 62,
        cluster: "Evidence"
    },
    {
        title: "Resume",
        description: "Role-specific resume downloads for targeted applications.",
        href: "/resumes/",
        metric: "Role-specific",
        tone: "neutral",
        x: 10,
        y: 78,
        z: 26,
        cluster: "Profile"
    }
];

function renderTiles() {
    const grid = document.getElementById("tilesGrid");
    if (!grid) return;
    const nodes = TILE_SECTIONS.map((tile, idx) => `
        <a class="scatter-node scatter-${tile.tone}" href="${tile.href}"
          style="left:${tile.x}%; top:${tile.y}%; --z:${tile.z}; --node-scale:${0.88 + tile.z / 420}; --node-delay:${idx * 40}ms;">
          <span class="scatter-depth-line" aria-hidden="true"></span>
          <span class="scatter-blob" aria-hidden="true"></span>
          <span class="scatter-label">
            <span class="tile-metric">${tile.cluster} · ${tile.metric}</span>
            <span class="tile-title">${tile.title}</span>
            <span class="tile-desc">${tile.description}</span>
          </span>
        </a>
      `).join("");
    grid.innerHTML = `
      <div class="scatter-plane" aria-hidden="true">
        <span class="scatter-axis axis-x">Build depth</span>
        <span class="scatter-axis axis-y">Public evidence</span>
        <span class="scatter-axis axis-z">Career signal</span>
      </div>
      ${nodes}
    `;
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
            node.style.setProperty("--mx", `${offsetX}px`);
            node.style.setProperty("--my", `${offsetY}px`);
        });
    };

    const reset = () => {
        nodes.forEach(node => {
            node.style.setProperty("--mx", "0px");
            node.style.setProperty("--my", "0px");
        });
    };

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("mouseleave", reset);
}
