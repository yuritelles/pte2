// Utilitário para incluir HTML em um elemento pelo id
function includeHTML(targetId, file) {
  const el = document.getElementById(targetId);
  if (!el) return Promise.resolve(false);

  return fetch(file)
    .then(r => {
      if (!r.ok) throw new Error("Erro ao carregar " + file);
      return r.text();
    })
    .then(html => {
      el.innerHTML = html;
      return true;
    })
    .catch(e => {
      console.error(e);
      return false;
    });
}

// === Menu (mesmo código que você já tinha) ===
function setupDesktopDropdown() {
  const dd   = document.getElementById('roadmapsDropdown');
  const btn  = document.getElementById('roadmapsBtn');
  const menu = document.getElementById('roadmapsMenu');
  if (!dd || !btn || !menu) return;

  const items = Array.from(menu.querySelectorAll('[role="menuitem"]'));

  function openMenu() {
    btn.setAttribute('aria-expanded','true');
    menu.setAttribute('aria-hidden','false');
    items.forEach(i => i.tabIndex = -1);
    if (items[0]) items[0].tabIndex = 0;
  }
  function closeMenu() {
    btn.setAttribute('aria-expanded','false');
    menu.setAttribute('aria-hidden','true');
    items.forEach(i => i.tabIndex = -1);
  }

  dd.addEventListener('mouseenter', openMenu);
  dd.addEventListener('mouseleave', closeMenu);

  btn.addEventListener('keydown', (e)=>{
    const k = e.key;
    if(k === 'ArrowDown' || k === 'Enter' || k === ' ') {
      e.preventDefault();
      openMenu();
      if (items[0]) items[0].focus();
    }
  });

  menu.addEventListener('keydown', (e)=>{
    const itemsArr = items;
    const idx = itemsArr.indexOf(document.activeElement);
    if(e.key === 'Escape'){
      e.preventDefault();
      closeMenu();
      btn.focus();
    }
    else if(e.key === 'ArrowDown'){
      e.preventDefault();
      const next = (idx + 1) % itemsArr.length;
      itemsArr[next].focus();
    }
    else if(e.key === 'ArrowUp'){
      e.preventDefault();
      const prev = (idx - 1 + itemsArr.length) % itemsArr.length;
      itemsArr[prev].focus();
    }
    else if(e.key === 'Home'){
      e.preventDefault();
      itemsArr[0].focus();
    }
    else if(e.key === 'End'){
      e.preventDefault();
      itemsArr[itemsArr.length-1].focus();
    }
  });
}

function setupMobileDrawer() {
  const openBtn = document.getElementById('openDrawer');
  const closeBtn = document.getElementById('closeDrawer');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('overlay');

  if (!openBtn || !closeBtn || !drawer || !overlay) return;

  function lockScroll(lock) {
    document.documentElement.style.overflow = lock ? 'hidden' : '';
    document.body.style.overflow = lock ? 'hidden' : '';
  }

  function trapFocus(e){
    if(e.key !== 'Tab') return;
    const focusables = drawer.querySelectorAll('a,button');
    if(focusables.length === 0) return;
    const first = focusables[0];
    const last  = focusables[focusables.length-1];
    if(e.shiftKey && document.activeElement === first){
      e.preventDefault(); last.focus();
    } else if(!e.shiftKey && document.activeElement === last){
      e.preventDefault(); first.focus();
    }
  }

  function openDrawer(){
    drawer.classList.add('show');
    overlay.classList.add('show');
    overlay.hidden = false;
    drawer.setAttribute('aria-hidden','false');
    openBtn.setAttribute('aria-expanded','true');
    lockScroll(true);
    closeBtn.focus();
    document.addEventListener('keydown', trapFocus);
  }
  function closeDrawer(){
    drawer.classList.remove('show');
    overlay.classList.remove('show');
    setTimeout(()=>overlay.hidden = true, 220);
    drawer.setAttribute('aria-hidden','true');
    openBtn.setAttribute('aria-expanded','false');
    lockScroll(false);
    openBtn.focus();
    document.removeEventListener('keydown', trapFocus);
  }

  openBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && drawer.classList.contains('show')) closeDrawer();
  });
}

// === GTRANSLATE: configura e carrega o script ===
function loadGTranslate() {
  // evita carregar duas vezes por acidente
  if (window._gtranslateLoaded) return;
  window._gtranslateLoaded = true;

  window.gtranslateSettings = {
    default_language: "pt",
    detect_browser_language: true,
    languages: ["pt","en"],
    wrapper_selector: ".gtranslate_wrapper, .gtranslate_wrapper-mobile",
    flag_size: 16,
    alt_flags: { pt: "brazil" },
  };

  const s = document.createElement("script");
  s.src = "https://cdn.gtranslate.net/widgets/latest/flags.js";
  s.defer = true;
  document.head.appendChild(s);
}

function getActiveLanguage() {
  const cookieMatch = document.cookie.match(/(?:^|;)\s*googtrans=([^;]+)/);
  if (cookieMatch) {
    const decoded = decodeURIComponent(cookieMatch[1]);
    const parts = decoded.split("/").filter(Boolean);
    const cookieLang = parts[parts.length - 1];
    if (cookieLang) return cookieLang.split("-")[0];
  }
  const htmlLang = document.documentElement.lang;
  if (htmlLang) return htmlLang.split("-")[0];
  return "pt";
}

function applyGTranslateFilters(wrapper) {
  if (!wrapper) return;
  const currentLang = getActiveLanguage();
  const langNodes = wrapper.querySelectorAll("[data-lang]");
  if (langNodes.length > 0) {
    langNodes.forEach((node) => {
      const lang = node.dataset.lang;
      if (!lang) return;
      node.style.display = lang === currentLang ? "none" : "";
    });
  }
  const current = wrapper.querySelector(".gt-current-lang");
  if (current) {
    current.style.display = "none";
  }
}

function setupGTranslateFilters() {
  const applyAll = () => {
    document
      .querySelectorAll(".gtranslate_wrapper, .gtranslate_wrapper-mobile")
      .forEach((wrapper) => applyGTranslateFilters(wrapper));
  };

  applyAll();

  document.querySelectorAll(".gtranslate_wrapper, .gtranslate_wrapper-mobile").forEach((wrapper) => {
    const observer = new MutationObserver(() => {
      applyAll();
    });
    observer.observe(wrapper, { childList: true, subtree: true });
    wrapper.addEventListener("click", () => {
      setTimeout(applyAll, 400);
    });
  });

  const htmlObserver = new MutationObserver(() => {
    applyAll();
  });
  htmlObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
}

// === Inicialização geral ===
document.addEventListener("DOMContentLoaded", () => {
  // Menu
  includeHTML("menu", "menu.html").then(ok => {
    if (ok) {
      setupDesktopDropdown();
      setupMobileDrawer();
      loadGTranslate();
      setupGTranslateFilters();
    }
  });

  // Footer + GTranslate
  includeHTML("footer", "footer.html").then(ok => {
    if (ok) return;
  });
});
