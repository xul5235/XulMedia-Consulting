document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. SCROLL REVEAL ANIMATIONS
    // =========================================================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(section => {
        observer.observe(section);
    });

    // =========================================================================
    // 2. NAVBAR SHRINK ON SCROLL
    // =========================================================================
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
    }

    // =========================================================================
    // 3. HAMBURGER MENU
    // =========================================================================
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');

    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            const isOpen = hamburger.classList.toggle('open');
            mobileNav.classList.toggle('open', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                mobileNav.classList.remove('open');
                hamburger.setAttribute('aria-expanded', false);
                document.body.style.overflow = '';
            });
        });
    }

    // =========================================================================
    // 4. FAQ ACCORDION
    // =========================================================================
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const item = button.parentElement;
            const isOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item.open').forEach(openItem => {
                openItem.classList.remove('open');
                openItem.querySelector('.faq-question').setAttribute('aria-expanded', false);
            });
            if (!isOpen) {
                item.classList.add('open');
                button.setAttribute('aria-expanded', true);
            }
        });
    });

    // =========================================================================
    // 5. PROCESS STEP — PREMIUM HOVER REVEAL
    // =========================================================================
    const stepItems = document.querySelectorAll('.process-step-item');
    const imgPanels = document.querySelectorAll('.process-img');

    function activateStep(stepNum) {
        stepItems.forEach(item => item.classList.remove('active'));
        imgPanels.forEach(img => img.classList.remove('active'));
        const targetStep = document.querySelector(`.process-step-item[data-step="${stepNum}"]`);
        const targetImg  = document.querySelector(`.process-img[data-img="${stepNum}"]`);
        if (targetStep) targetStep.classList.add('active');
        if (targetImg)  targetImg.classList.add('active');
    }

    stepItems.forEach(item => {
        // Desktop: hover
        item.addEventListener('mouseenter', () => activateStep(item.dataset.step));
        // Mobile: tap
        item.addEventListener('click', () => activateStep(item.dataset.step));
    });

    // =========================================================================
    // 6. I18N — MULTILANGUAGE ENGINE
    // =========================================================================
    const STORAGE_KEY = 'xulmedia_lang';

    function applyLanguage(lang) {
        if (typeof translations === 'undefined') {
            console.warn('Translations not loaded yet.');
            return;
        }
        const t = translations[lang];
        if (!t) return;

        // Plain text elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key] !== undefined) el.textContent = t[key];
        });

        // HTML elements (contain <br>, <strong>, <a> etc.)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (t[key] !== undefined) el.innerHTML = t[key];
        });

        // Update html lang attribute
        document.documentElement.lang = lang;

        // Update active button state on ALL switchers on the page
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // Persist choice
        localStorage.setItem(STORAGE_KEY, lang);
    }

    // Wire up all lang buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
    });

    // On load: check URL ?lang= parameter, then restore saved language, default to English
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    const savedLang = (['en', 'no', 'es'].includes(langParam)) ? langParam : (localStorage.getItem(STORAGE_KEY) || 'en');
    applyLanguage(savedLang);

    // =========================================================================
    // 7. PERSONAL JOURNAL SHUFFLE ON LOAD (about.html)
    // =========================================================================
    const masonryGrid = document.querySelector('.personal-masonry-grid');
    if (masonryGrid) {
        const items = Array.from(masonryGrid.querySelectorAll('.personal-masonry-item'));
        // Shuffle array order randomly
        items.sort(() => Math.random() - 0.5);
        // Re-insert in new order (moves DOM nodes, doesn't duplicate)
        items.forEach(item => masonryGrid.appendChild(item));
    }

});
