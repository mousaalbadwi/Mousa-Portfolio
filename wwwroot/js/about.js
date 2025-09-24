// wwwroot/js/about.js

// ===== Certificates (Book) =====
(async function () {
    const flipHost = document.getElementById('certsFlip');
    if (!flipHost) return;

    const fallbackGrid = document.getElementById('certsFallback');
    const toolbar = document.getElementById('bookToolbar');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // حمّل بيانات الشهادات
    let items = [];
    try {
        const res = await fetch('/data/certificates.json', { cache: 'no-store' });
        items = await res.json();
    } catch { items = []; }

    // Fallback Grid
    function renderFallback() {
        if (!fallbackGrid) return;
        fallbackGrid.innerHTML = items.map(it => `
      <div class="cert-card" data-aos="zoom-in"
           style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);
                  border-radius:14px;padding:.75rem">
        <img src="${it.image}" alt="${it.title}"
             style="width:100%;height:220px;object-fit:cover;border-radius:10px;margin-bottom:.5rem">
        <div class="fw-semibold">${it.title}</div>
        <div class="text-muted small">${it.issuer || ''} ${it.date ? ' · ' + it.date : ''}</div>
        <p class="mb-0">${it.desc || ''}</p>
      </div>
    `).join('');
        fallbackGrid.hidden = false;
        if (toolbar) toolbar.hidden = true;
    }

    if (!items.length || prefersReduced) return renderFallback();

    // تحميل مكتبة PageFlip مع باك-أب محلي
    async function ensureLib() {
        if (window.St && window.St.PageFlip) return true;
        const tryLoad = (src) => new Promise((ok, err) => {
            const s = document.createElement('script');
            s.src = src; s.async = true;
            s.onload = ok; s.onerror = err;
            document.head.appendChild(s);
        });
        try {
            await tryLoad('https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.min.js');
        } catch {
            await tryLoad('/lib/pageflip/page-flip.browser.min.js');
        }
        return !!(window.St && window.St.PageFlip);
    }
    if (!(await ensureLib())) return renderFallback();

    // حساب حجم واقعي للكتاب (3:2 Desktop, 4:5 Mobile)
    function getBookSize() {
        const rim = flipHost.parentElement; // .book-rim
        const W = rim.getBoundingClientRect().width;
        const isMobile = window.matchMedia('(max-width: 576px)').matches;
        const ratio = isMobile ? (4 / 5) : (2 / 3); // height/width = 2/3 (أفقي), 4/5 (طولي)
        const width = Math.min(1000, Math.max(360, Math.round(W)));
        const height = Math.round(width * ratio);
        return { width, height };
    }

    // بناء صفحات الكتاب
    const fragment = document.createDocumentFragment();

    const cover = document.createElement('div');
    cover.className = 'page p-3 d-flex align-items-center justify-content-center';
    cover.innerHTML = `
    <div class="text-center">
      <div class="display-6 fw-bold mb-1">Certificates</div>
      <div class="text-soft">Tap or drag to flip</div>
    </div>`;
    fragment.appendChild(cover);

    for (const it of items) {
        const page = document.createElement('div');
        page.className = 'page p-2 p-md-3';
        page.innerHTML = `
      <figure>
        <img src="${it.image}" alt="${it.title}">
        <figcaption>
          <div class="fw-semibold">${it.title}</div>
          <div class="text-muted small mb-1">${it.issuer || ''} ${it.date ? ' · ' + it.date : ''}</div>
          <p class="mb-0">${it.desc || ''}</p>
        </figcaption>
      </figure>`;
        fragment.appendChild(page);
    }

    flipHost.innerHTML = '';
    flipHost.appendChild(fragment);

    // تهيئة PageFlip بأبعاد محسوبة + ظلال قوية
    const { width, height } = getBookSize();
    const flip = new St.PageFlip(flipHost, {
        width, height,
        size: 'stretch',
        minWidth: 320, maxWidth: 1400, maxHeight: 1600,
        showCover: true, drawShadow: true,
        mobileScrollSupport: true, useMouseEvents: true, flippingTime: 900
    });
    flip.loadFromHTML(document.querySelectorAll('#certsFlip .page'));

    // أزرار التحكم
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const btnFS = document.getElementById('btnFS');

    if (btnPrev && btnNext && btnFS) {
        toolbar.hidden = false;
        btnPrev.onclick = () => flip.flipPrev();
        btnNext.onclick = () => flip.flipNext();
        btnFS.onclick = () => document.documentElement.requestFullscreen?.();
    }

    // تحديث الحجم عند تغيير عرض الإطار
    let rid = null;
    const onResize = () => {
        cancelAnimationFrame(rid);
        rid = requestAnimationFrame(() => {
            const s = getBookSize();
            try { flip.setSize?.(s.width, s.height); } catch { /* بعض النسخ لا تدعم setSize */ }
        });
    };
    window.addEventListener('resize', onResize);

    // أمان إضافي: لو حدث خطأ أثناء اللعب
    let degraded = false;
    flip.on?.('error', () => { if (!degraded) { degraded = true; renderFallback(); } });
})();

// ===== Featured Projects inside About =====
(async function renderFeatured() {
    const grid = document.getElementById('featGrid');
    if (!grid) return;

    let projects = [];
    try {
        const res = await fetch('/data/projects.json', { cache: 'no-store' });
        projects = await res.json();
    } catch { projects = []; }

    const featured = projects
        .filter(p => p.featured)
        .sort((a, b) => (a.featured_order ?? 999) - (b.featured_order ?? 999));

    if (!featured.length) {
        grid.innerHTML = '<div class="text-muted">No featured projects yet.</div>';
        return;
    }

    grid.innerHTML = featured.map(p => `
    <article class="feat-card" data-aos="zoom-in"
             style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);
                    border-radius:14px;overflow:hidden;backdrop-filter:blur(6px)">
      <img class="feat-thumb" src="${p.image}" alt="${p.title}"
           style="width:100%;height:148px;object-fit:cover">
      <div class="feat-body" style="padding:.85rem">
        <div class="feat-title" style="font-weight:700;font-size:1rem;margin-bottom:.25rem">${p.title}</div>
        <div class="text-soft small mb-1">${p.desc ?? ''}</div>
        <div class="feat-tech mb-2" style="font-size:.8rem;opacity:.85">${(p.tech || []).join(' · ')}</div>
        <div class="feat-links">
          ${p.repo ? `<a href="${p.repo}" target="_blank" rel="noopener">GitHub</a>` : ''}
          ${p.live ? `<a href="${p.live}" target="_blank" rel="noopener">Live</a>` : ''}
        </div>
      </div>
    </article>
  `).join('');
})();
