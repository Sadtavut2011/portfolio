// ── SCROLL STABILITY ──
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// ── LANGUAGE SWITCHER ──
window.currentLang = sessionStorage.getItem('lang') || 'en';

window.toggleLanguage = function () {
  const newLang = window.currentLang === 'en' ? 'th' : 'en';
  setLanguage(newLang);
};

window.setLanguage = function (lang) {
  window.currentLang = lang;
  sessionStorage.setItem('lang', lang);
  document.documentElement.lang = lang;

  const indicator = document.getElementById('lang-indicator');
  if (indicator) {
    indicator.innerText = lang.toUpperCase();
  }

  const textEls = document.querySelectorAll('[data-en][data-th]');
  textEls.forEach(el => {
    // If element contains HTML, use innerHTML, else innerText
    // But since some have HTML in data-en/data-th, we can use innerHTML
    el.innerHTML = el.getAttribute(`data-${lang}`);
  });
};

// ── COMPONENT LOADER ──
async function loadComponent(id, file) {
  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML = html;
      
      // If we loaded header, re-initialize language and nav functionality
      if (id === 'header-placeholder') {
         setLanguage(window.currentLang); // Apply current lang to new nav
         initNavToggle();
         initHeaderScroll();
      } else if (id === 'footer-placeholder') {
         setLanguage(window.currentLang); // Apply current lang to new footer
      }
    }
  } catch (error) {
    console.error('Error loading component:', error);
  }
}

// ── NAV TOGGLE ──
function initNavToggle() {
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.querySelector('nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('nav-open');
    });
  }
}

function initHeaderScroll() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  
  // Find any sections that have a light background (currently only .section-about)
  const lightSections = document.querySelectorAll('.section-about');

  const updateNavColor = () => {
    const navRect = nav.getBoundingClientRect();
    const navCenterY = navRect.top + (navRect.height / 2);
    
    let isOverLight = false;
    
    // Check if the center of the nav is over any light section
    lightSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (navCenterY >= rect.top && navCenterY <= rect.bottom) {
        isOverLight = true;
      }
    });

    if (isOverLight) {
      // Over light background -> text must be dark
      nav.classList.add('nav-dark');
    } else {
      // Over dark background -> text must be light
      nav.classList.remove('nav-dark');
    }
  };

  window.addEventListener('scroll', updateNavColor);
  // Trigger once on load
  updateNavColor();
}

// ── CUSTOM CURSOR ──
function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });
  
  const addHover = () => cursor.classList.add('hover');
  const removeHover = () => cursor.classList.remove('hover');

  document.querySelectorAll('a, button, .lang-switch, .work-ph-card, .case-study, .nav-menu-toggle, .lightbox-close')
    .forEach(el => {
      el.addEventListener('mouseenter', addHover);
      el.addEventListener('mouseleave', removeHover);
    });
}

// ── INITIALIZATION ──
document.addEventListener('DOMContentLoaded', () => {
  // Load components
  loadComponent('header-placeholder', 'header.html');
  loadComponent('footer-placeholder', 'footer.html');
  
  // Apply initial language state to any body elements
  setLanguage(window.currentLang);

  // Initialize cursor
  initCursor();

  // Add transition to body wrapper if present
  document.body.classList.add('page-transition');
});
