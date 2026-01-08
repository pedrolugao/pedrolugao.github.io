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

const translations = {
    en: {
        classes: 'Classes',
        papers: 'Papers',
        vitae: 'Vitae',
        blog: 'Blog',
        langCode: 'PT'
    },
    pt: {
        classes: 'Aulas',
        papers: 'Artigos',
        vitae: 'Currículo',
        blog: 'Blog',
        langCode: 'EN'
    }
};

let currentLang = 'en';

// Load saved language preference
const savedLang = localStorage.getItem('language');
if (savedLang === 'pt') {
    toggleLanguage();
}

langToggle.addEventListener('click', () => {
    toggleLanguage();
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
    document.getElementById('link-classes-en').textContent = translations[currentLang].classes;
    document.getElementById('link-papers-en').textContent = translations[currentLang].papers;
    document.getElementById('link-vitae-en').textContent = translations[currentLang].vitae;
    document.getElementById('link-blog-en').textContent = translations[currentLang].blog;

    // Update language toggle button
    langText.textContent = translations[currentLang].langCode;

    // Save preference
    localStorage.setItem('language', currentLang);
}
