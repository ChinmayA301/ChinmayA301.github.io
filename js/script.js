// Typing effect for header
new Typed("#typed", {
    strings: ["Hello, my name is"],
    typeSpeed: 50,
    backSpeed: 25,
    loop: false
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth"
        });
    });
});

// Scroll reveal effect for sections
const sections = document.querySelectorAll("section");
window.addEventListener("scroll", () => {
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const triggerHeight = window.innerHeight / 1.3;
        if (sectionTop < triggerHeight) {
            section.classList.add("active");
        } else {
            section.classList.remove("active");
        }
    });
});

// Back-to-top button functionality
const backToTopButton = document.createElement("button");
backToTopButton.id = "back-to-top";
backToTopButton.textContent = "↑ Top";
document.body.appendChild(backToTopButton);

window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
        backToTopButton.style.display = "block";
    } else {
        backToTopButton.style.display = "none";
    }
});

backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// Skill hover effect
document.querySelectorAll(".skill-box").forEach(box => {
    box.addEventListener("mouseenter", () => {
        box.innerHTML = `<p>${box.dataset.skill}</p>`;
    });
    box.addEventListener("mouseleave", () => {
        box.innerHTML = `<i class="fas fa-code fa-3x"></i><p>${box.querySelector("p").textContent.split(" ")[0]}</p>`;
    });
});
