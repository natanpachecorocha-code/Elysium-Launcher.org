(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!reducedMotion.matches) {
        const revealTargets = document.querySelectorAll("main > section, main article");

        if ("IntersectionObserver" in window && revealTargets.length) {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                });
            }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });

            revealTargets.forEach((element, index) => {
                element.classList.add("site-reveal");
                element.style.setProperty("--site-reveal-delay", `${Math.min(index % 5, 4) * 65}ms`);
                revealObserver.observe(element);
            });

            document.documentElement.classList.add("site-motion-ready");
        }

    }

    document.querySelectorAll(".elysium-preview").forEach((carousel) => {
        const slides = Array.from(carousel.querySelectorAll(".elysium-slide"));
        if (slides.length < 2) return;

        let currentSlide = Math.max(0, slides.findIndex((slide) => slide.classList.contains("active")));
        let paused = false;

        slides.forEach((slide, index) => {
            slide.classList.toggle("active", index === currentSlide);
            slide.classList.toggle("next", index !== currentSlide);
            slide.classList.remove("prev");
        });

        const advance = () => {
            if (paused || document.hidden || reducedMotion.matches) return;

            const current = slides[currentSlide];
            const nextSlide = (currentSlide + 1) % slides.length;
            const next = slides[nextSlide];

            // Reposition the slide that exited on the left without animating
            // it across the carousel before it enters from the right.
            next.style.transition = "none";
            next.classList.remove("prev");
            next.classList.add("next");
            next.offsetWidth;
            next.style.removeProperty("transition");

            requestAnimationFrame(() => {
                current.classList.remove("active");
                current.classList.add("prev");
                next.classList.remove("next");
                next.classList.add("active");
            });

            currentSlide = nextSlide;
        };

        carousel.addEventListener("mouseenter", () => { paused = true; });
        carousel.addEventListener("mouseleave", () => { paused = false; });
        carousel.addEventListener("focusin", () => { paused = true; });
        carousel.addEventListener("focusout", (event) => {
            if (!carousel.contains(event.relatedTarget)) paused = false;
        });

        window.setInterval(advance, 5000);
    });
})();
