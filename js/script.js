// Typed headline
new Typed("#typed", {
    strings: ["Hello, my name is"],
    typeSpeed: 42,
    backSpeed: 22,
    loop: false,
    showCursor: false
});

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

// Render Projects from JSON
async function loadProjects() {
    const grid = document.getElementById("projectsGrid");
    if (!grid) return;
    try {
        const res = await fetch("data/projects.json", { cache: "no-store" });
        const projects = await res.json();
        grid.innerHTML = projects.map(p => `
      <div class="col-md-6">
        <a ${p.link ? `href="${p.link}" target="_blank"` : ""} class="project-box card shadow-sm h-100">
          <div class="card-body">
            <h3 class="h5">${p.title}</h3>
            <p class="mb-2 small text-muted">${p.description}</p>
            ${(p.tags || []).map(t => `<span class="badge bg-secondary-subtle text-secondary me-1">${t}</span>`).join('')}
          </div>
        </a>
      </div>
    `).join("");
    } catch (e) {
        grid.innerHTML = `<p class="text-danger small">Could not load projects.</p>`;
        console.error("Projects load error:", e);
    }
}

// Render Experience from JSON
async function loadExperience() {
    const wrap = document.getElementById("experienceTimeline");
    if (!wrap) return;
    try {
        const res = await fetch("data/experience.json", { cache: "no-store" });
        const items = await res.json();
        wrap.innerHTML = items.map(item => `
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
    } catch (e) {
        wrap.innerHTML = `<p class="text-danger small">Could not load experience.</p>`;
        console.error("Experience load error:", e);
    }
}

loadProjects();
loadExperience();

// Header background + text color shift on scroll
const hero = document.querySelector("hero");
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
