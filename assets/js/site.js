/* ── Config ── */
// Paste your deployed Apps Script Web App URL below after running setupSheets().
// Extensions → Apps Script → Deploy → New deployment → Web app → Copy URL
const APPS_SCRIPT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyPUZFPgYGRzQSCx-eB3NknKOMS5FTOEWU1zFh0KPZAKyXGnr8UJsc6q-pEHvEj3vkk/exec';
const ADMIN_TEST_USERNAME = 'aniz';
const ADMIN_TEST_PASSWORD = 'Welcome2026';
const ADMIN_SESSION_KEY = 'aniz-admin-authenticated';

/* ── Path helper (pages/ is one level deep, root is zero) ── */
const PATH_PREFIX = (location.pathname.includes('/pages/') || location.pathname.includes('/admin/')) ? '../' : '';

if (location.pathname.includes('/admin/') && !location.pathname.endsWith('/admin/login.html')) {
  if (sessionStorage.getItem(ADMIN_SESSION_KEY) !== 'true') {
    location.replace('login.html');
  }
}

async function loadDataFile(name) {
  try {
    const res = await fetch(`${PATH_PREFIX}data/${name}.json`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

function resolveSiteHref(href) {
  if (!href || /^(https?:|mailto:|tel:|#)/.test(href)) return href;
  if (href.startsWith('/')) return href;
  return `${PATH_PREFIX}${href}`;
}

/* ── Default announcement banners (used if admin hasn't set any) ── */
const DEFAULT_BANNERS = [
  {
    text: '🏆 Dr. Hardik Pipalia receives the APHA Outstanding Practice in Public Health Ethics Award.',
    linkText: null,
    linkHref: null,
    active: true,
  },
  {
    text: 'AIDS Walk Atlanta 5K & Music Festival — support ANIZ and local HIV/AIDS services.',
    linkText: 'Learn more',
    linkHref: 'https://www.aniz.org/aidswalk2025',
    active: true,
  },
];

/* ── Default team data (seed for admin; update photo paths to match actual files) ── */
const DEFAULT_TEAM = [
  { name: 'Zina Age', title: 'President / Founder / CEO', photo: 'assets/images/team/589-1554150005694.webp' },
  { name: 'Keisha Brown', title: 'Deputy Director', photo: 'assets/images/team/591-keisha-2-1.webp' },
  { name: 'Dr. Hardik Pipalia', title: 'Director of Research & Evaluation', photo: 'assets/images/team/593-dr_-p.webp' },
  { name: 'Kadi Paragan-Singh', title: 'Senior Administrative Manager', photo: 'assets/images/team/595-kadi.webp' },
  { name: 'Tyasia Henry', title: 'Office Manager', photo: 'assets/images/team/597-tyasia.webp' },
  { name: 'Julius Green II', title: 'Financial Bookkeeper', photo: 'assets/images/team/599-julius.webp' },
  { name: 'Maxine Wright', title: 'Finance Admin / Outreach', photo: 'assets/images/team/601-max.webp' },
  { name: 'Travis Scott', title: 'Community Engagement Supervisor', photo: 'assets/images/team/603-travis.webp' },
  { name: 'Antwan Sirmons', title: 'Peer Support Specialist', photo: 'assets/images/team/605-antwan.webp' },
  { name: 'Brandon Ingersoll', title: 'Lead Case Manager', photo: 'assets/images/team/607-brandon.webp' },
];

/* ── Announcement banner ── */
(async function initBanner() {
  const bar = document.querySelector('.announce-bar');
  if (!bar) return;

  const stored = JSON.parse(localStorage.getItem('aniz:banners') || 'null');
  const active = stored ? stored.filter(b => b.active) : [];
  const dataBanners = await loadDataFile('banners');
  const jsonActive = Array.isArray(dataBanners)
    ? dataBanners.filter(b => b.active).sort((a, b) => (a.priority || 99) - (b.priority || 99))
    : [];
  const BANNERS = active.length > 0 ? active : (jsonActive.length > 0 ? jsonActive : DEFAULT_BANNERS);

  let idx = 0;
  let paused = false;
  const msg = bar.querySelector('.announce-msg');
  const lnk = bar.querySelector('.announce-link');
  let pauseBtn = bar.querySelector('.announce-pause');
  if (!pauseBtn && BANNERS.length > 1) {
    pauseBtn = document.createElement('button');
    pauseBtn.className = 'announce-pause';
    pauseBtn.type = 'button';
    pauseBtn.setAttribute('aria-pressed', 'false');
    pauseBtn.textContent = 'Pause';
    bar.insertBefore(pauseBtn, bar.querySelector('.announce-close'));
  }

  function show(i) {
    const b = BANNERS[i];
    msg.textContent = b.text + ' ';
    if (lnk) {
      if (b.linkText && b.linkHref) {
        lnk.href = resolveSiteHref(b.linkHref);
        lnk.textContent = b.linkText;
        lnk.hidden = false;
      } else {
        lnk.hidden = true;
      }
    }
  }

  show(0);
  if (BANNERS.length > 1) {
    setInterval(() => {
      if (paused) return;
      idx = (idx + 1) % BANNERS.length;
      show(idx);
    }, 6000);
  }

  pauseBtn?.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.setAttribute('aria-pressed', String(paused));
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  });

  bar.querySelector('.announce-close')?.addEventListener('click', () => {
    bar.hidden = true;
  });
})();

/* ── Mobile hamburger ── */
document.querySelector('.nav-toggle')?.addEventListener('click', function (e) {
  e.stopPropagation();
  const links = document.getElementById('nav-links');
  const open = !links.classList.contains('open');
  links.classList.toggle('open', open);
  this.setAttribute('aria-expanded', String(open));
});

function closeNavDropdowns(except = null) {
  document.querySelectorAll('.nav-item.open').forEach(el => {
    if (el === except) return;
    el.classList.remove('open');
    el.querySelector('.drop-toggle')?.setAttribute('aria-expanded', 'false');
  });
}

function toggleNavDropdown(item, forceOpen = null) {
  if (!item) return false;
  const btn = item.querySelector('.drop-toggle');
  const shouldOpen = forceOpen ?? !item.classList.contains('open');
  closeNavDropdowns(item);
  item.classList.toggle('open', shouldOpen);
  btn?.setAttribute('aria-expanded', String(shouldOpen));
  return shouldOpen;
}

/* ── Dropdown toggles ── */
document.querySelectorAll('.drop-toggle').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    toggleNavDropdown(btn.closest('.nav-item'));
  });
});

document.querySelectorAll('.nav-item.has-drop > a').forEach(link => {
  link.addEventListener('click', e => {
    const item = link.closest('.nav-item');
    const isCompactNav = window.matchMedia('(max-width: 820px), (hover: none)').matches;
    if (isCompactNav && item && !item.classList.contains('open')) {
      e.preventDefault();
      e.stopPropagation();
      toggleNavDropdown(item, true);
    }
  });
});

document.querySelector('.nav-links')?.addEventListener('click', e => {
  e.stopPropagation();
});

document.addEventListener('click', () => {
  closeNavDropdowns();
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeNavDropdowns();
  const links = document.getElementById('nav-links');
  const toggle = document.querySelector('.nav-toggle');
  links?.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
});

/* ── Dynamic content: replace static HTML with admin-managed data ── */
(async function renderDynamic() {

  // ── Team ──
  const teamData = JSON.parse(localStorage.getItem('aniz:team') || 'null');
  const peopleEl = document.querySelector('.people');
  if (teamData && Array.isArray(teamData) && peopleEl) {
    peopleEl.innerHTML = teamData.map(p => {
      const photoHtml = p.photo
        ? `<img src="${PATH_PREFIX}${p.photo}" alt="${p.name}">`
        : `<div class="avatar-initials" aria-hidden="true">${p.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>`;
      return `<article>${photoHtml}<strong>${p.name}</strong><span>${p.title}</span></article>`;
    }).join('');
  }

  // ── Events ──
  const storedEvents = JSON.parse(localStorage.getItem('aniz:events') || 'null');
  const fileEvents = await loadDataFile('events');
  const eventsData = Array.isArray(storedEvents) ? storedEvents : fileEvents;
  const eventsGrid = document.getElementById('events-dynamic');
  if (eventsData && Array.isArray(eventsData) && eventsGrid) {
    if (eventsData.length === 0) {
      eventsGrid.innerHTML = '<p style="color:var(--muted);grid-column:1/-1">No upcoming events at the moment. Check back soon or follow us on social media.</p>';
    } else {
      eventsGrid.innerHTML = eventsData.map(e => {
        const imgHtml = e.image
          ? `<img src="${PATH_PREFIX}${e.image}" alt="${e.title}">`
          : '';
        const showStatus = e.status && !(e.status === 'annual' && /^annual/i.test(e.date || ''));
        const status = showStatus ? `<span class="event-status">${e.status}</span>` : '';
        const metaDate = e.date ? `<span>${e.date}${e.time ? ' | ' + e.time : ''}</span>` : '';
        const metaLoc = e.location ? `<span>${e.location}</span>` : '';
        const linkHtml = e.link ? `<a class="button small" href="${e.link}" target="_blank" rel="noopener">View event</a>` : '';
        return `<article class="card event-card">${imgHtml}<div class="event-body"><div class="event-meta">${[status, metaDate, metaLoc].filter(Boolean).join(' ')}</div><h3>${e.title}</h3><p>${e.description}</p>${linkHtml}</div></article>`;
      }).join('');
    }
  }

  // ── Gallery ──
  const storedGallery = JSON.parse(localStorage.getItem('aniz:gallery') || 'null');
  const fileGallery = await loadDataFile('gallery');
  const galleryData = Array.isArray(storedGallery) ? storedGallery : fileGallery;
  const galleryGrid = document.querySelector('.gallery-grid');
  if (galleryData && Array.isArray(galleryData) && galleryGrid) {
    let visibleCount = Math.min(24, galleryData.length);
    const renderGallery = () => {
      galleryGrid.innerHTML = galleryData.slice(0, visibleCount).map(img =>
        `<img loading="lazy" decoding="async" src="${PATH_PREFIX}${img.src}" alt="${img.alt || ''}" data-category="${img.category || ''}">`
      ).join('');
      initLightbox();
    };
    renderGallery();
    if (galleryData.length > visibleCount) {
      const loadMore = document.createElement('button');
      loadMore.type = 'button';
      loadMore.className = 'button gallery-load-more';
      loadMore.textContent = 'Load more photos';
      galleryGrid.insertAdjacentElement('afterend', loadMore);
      loadMore.addEventListener('click', () => {
        visibleCount = Math.min(visibleCount + 24, galleryData.length);
        renderGallery();
        if (visibleCount >= galleryData.length) loadMore.remove();
      });
    }
  }

})();

/* ── Gallery lightbox ── */
function initLightbox() {
  const grid = document.querySelector('.gallery-grid');
  const box = document.getElementById('lightbox');
  if (!grid || !box) return;

  const imgs = Array.from(grid.querySelectorAll('img'));
  const lbImg = box.querySelector('.lightbox-img');
  let current = 0;

  function open(i) {
    current = i;
    lbImg.src = imgs[i].src;
    lbImg.alt = imgs[i].alt;
    box.classList.add('open');
    box.querySelector('.lightbox-close').focus();
    document.body.style.overflow = 'hidden';
  }

  function close() {
    box.classList.remove('open');
    document.body.style.overflow = '';
    imgs[current]?.focus();
  }

  imgs.forEach((img, i) => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', img.alt || 'View photo ' + (i + 1));
    img.addEventListener('click', () => open(i));
    img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(i); });
  });

  box.querySelector('.lightbox-close')?.addEventListener('click', close);
  box.querySelector('.lightbox-prev')?.addEventListener('click', () => open((current - 1 + imgs.length) % imgs.length));
  box.querySelector('.lightbox-next')?.addEventListener('click', () => open((current + 1) % imgs.length));
  box.addEventListener('click', e => { if (e.target === box) close(); });

  document.addEventListener('keydown', e => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') open((current - 1 + imgs.length) % imgs.length);
    if (e.key === 'ArrowRight') open((current + 1) % imgs.length);
  });
}

// Init lightbox for static gallery (dynamic gallery re-calls this after render)
initLightbox();

/* ── Smart forms ── */
document.querySelectorAll('.smart-form').forEach(form => {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const status = form.querySelector('.form-status');
    btn.disabled = true;
    const data = Object.fromEntries(new FormData(form).entries());
    data.sheet = form.dataset.sheet;
    data.timestamp = new Date().toISOString();
    try {
      if (APPS_SCRIPT_ENDPOINT) {
        await fetch(APPS_SCRIPT_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(data),
        });
      } else {
        const key = 'aniz:' + form.dataset.formType;
        const rows = JSON.parse(localStorage.getItem(key) || '[]');
        rows.push(data);
        localStorage.setItem(key, JSON.stringify(rows));
      }
      status.textContent = 'Thank you — your submission has been received. We will be in touch soon.';
      form.reset();
    } catch (err) {
      status.textContent = 'Something went wrong. Please call ANIZ directly at (404) 521-2410.';
    } finally {
      btn.disabled = false;
    }
  });
});

/* ── Mailing list form ── */
document.querySelectorAll('.mail-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const msg = form.querySelector('.mail-status');
    if (!input || !input.value) return;
    const subs = JSON.parse(localStorage.getItem('aniz:mailing') || '[]');
    subs.push({ email: input.value, ts: new Date().toISOString() });
    localStorage.setItem('aniz:mailing', JSON.stringify(subs));
    input.value = '';
    if (msg) msg.textContent = "You're subscribed!";
  });
});

/* ── Donation click tracking ── */
document.querySelectorAll('[data-track-donation]').forEach(a => {
  a.addEventListener('click', () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'donation_click', destination: a.href });
  });
});

/* ── Admin login ── */
document.querySelector('.login-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.currentTarget;
  const status = form.querySelector('.form-status');
  const username = form.elements.username?.value.trim();
  const password = form.elements.password?.value;
  if (username === ADMIN_TEST_USERNAME && password === ADMIN_TEST_PASSWORD) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    location.href = 'dashboard.html';
  } else if (status) {
    status.textContent = 'Incorrect username or password.';
  }
});

document.querySelectorAll('[data-admin-logout]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    location.href = 'login.html';
  });
});

/* ── Admin dashboard metrics ── */
if (location.pathname.endsWith('/admin/dashboard.html')) {
  const map = {
    'Volunteer submissions': 'aniz:volunteer',
    'Client intake submissions': 'aniz:client-intake',
    'Appointment requests': ['aniz:mental-health', 'aniz:hiv-testing', 'aniz:prep-care'],
    'Event registrations': 'aniz:event-registration',
    'Contact form submissions': 'aniz:contact',
  };
  document.querySelectorAll('[data-metric]').forEach(el => {
    const key = map[el.dataset.metric];
    const keys = Array.isArray(key) ? key : [key];
    el.textContent = keys.reduce((n, k) => n + JSON.parse(localStorage.getItem(k) || '[]').length, 0);
  });
}

/* ── Expose defaults for admin seed use ── */
window.ANIZ_DEFAULTS = { team: DEFAULT_TEAM };
