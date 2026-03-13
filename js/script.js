// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const themeIcon = document.querySelector('.theme-icon');

// Load saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    themeIcon.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    body.classList.toggle('light-theme');

    if (body.classList.contains('dark-theme')) {
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
});

// Language toggle functionality
const langToggle = document.getElementById('lang-toggle');
const langText = document.querySelector('.lang-text');
const aboutEn = document.getElementById('about-en');
const aboutPt = document.getElementById('about-pt');
const materialsToggle = document.getElementById('materials-toggle');
const materialsWrapper = materialsToggle?.closest('.dropdown');
const materialsLabel = document.getElementById('link-classes-en');
const materialsItemSubtitle = document.getElementById('materials-item-subtitle');
const papersLink = document.getElementById('link-papers-en');
const vitaeLink = document.getElementById('link-vitae-en');
const blogLink = document.getElementById('link-blog-en');

const translations = {
    en: {
        classes: 'Materials',
        papers: 'Papers',
        vitae: 'Vitae',
        blog: 'Blog',
        langCode: 'PT'
    },
    pt: {
        classes: 'Materiais',
        papers: 'Artigos',
        vitae: 'Currículo',
        blog: 'Blog',
        langCode: 'EN'
    }
};

let currentLang = 'pt';

// Load saved language preference
const savedLang = localStorage.getItem('language');
if (savedLang === 'en') {
    toggleLanguage();
}

langToggle.addEventListener('click', () => {
    toggleLanguage();
});

materialsToggle?.addEventListener('click', () => {
    const isOpen = materialsWrapper.classList.toggle('open');
    materialsToggle.setAttribute('aria-expanded', String(isOpen));
});

document.addEventListener('click', (event) => {
    if (!materialsWrapper || materialsWrapper.contains(event.target)) {
        return;
    }

    closeMaterialsDropdown();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeMaterialsDropdown();
        materialsToggle?.focus();
    }
});

function toggleLanguage() {
    if (currentLang === 'en') {
        currentLang = 'pt';
        aboutEn.style.display = 'none';
        aboutPt.style.display = 'block';
        document.documentElement.lang = 'pt';
    } else {
        currentLang = 'en';
        aboutEn.style.display = 'block';
        aboutPt.style.display = 'none';
        document.documentElement.lang = 'en';
    }

    // Update link texts
    if (materialsLabel) {
        materialsLabel.textContent = translations[currentLang].classes;
    }

    if (materialsItemSubtitle) {
        materialsItemSubtitle.textContent = translations[currentLang].materialItemSubtitle;
    }

    if (papersLink) {
        papersLink.textContent = translations[currentLang].papers;
    }

    if (vitaeLink) {
        vitaeLink.textContent = translations[currentLang].vitae;
    }

    if (blogLink) {
        blogLink.textContent = translations[currentLang].blog;
    }

    // Update language toggle button
    langText.textContent = translations[currentLang].langCode;

    // Save preference
    localStorage.setItem('language', currentLang);
}

function closeMaterialsDropdown() {
    if (!materialsWrapper || !materialsToggle) {
        return;
    }

    materialsWrapper.classList.remove('open');
    materialsToggle.setAttribute('aria-expanded', 'false');
}
