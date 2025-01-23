// Scroll reveal effect for sections
const sections = document.querySelectorAll("section");

window.addEventListener("scroll", () => {
    sections.forEach((section) => {
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
