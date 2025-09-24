// wwwroot/js/home.js

/* ===== Tilt on project cards ===== */
(function () {
    const cards = document.querySelectorAll('.card-tilt');
    if (!cards.length) return;
    const maxDeg = 5, glow = '0 18px 60px rgba(111,66,193,.28)';
    cards.forEach(card => {
        let rect;
        function set(e) {
            rect = rect || card.getBoundingClientRect();
            const x = e.clientX - rect.left, y = e.clientY - rect.top;
            const rx = ((y - rect.height / 2) / rect.height) * -maxDeg;
            const ry = ((x - rect.width / 2) / rect.width) * maxDeg;
            card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
            card.style.boxShadow = glow;
        }
        function reset() { rect = null; card.style.transform = 'translateY(0)'; card.style.boxShadow = ''; }
        card.addEventListener('mousemove', set);
        card.addEventListener('mouseleave', reset);
    });
})();

/* ===== Animated Globe (canvas) ===== */
(function () {
    const c = document.getElementById('globeCanvas');
    if (!c) return;
    const ctx = c.getContext('2d');

    let DPR, size, R, t = 0;
    let points = [], orbits = [];

    function resize() {
        DPR = window.devicePixelRatio || 1;
        size = c.parentElement.clientWidth;
        size = Math.min(size, 540);
        c.width = size * DPR;
        c.height = size * DPR;
        c.style.width = size + 'px';
        c.style.height = size + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(DPR, DPR);
        R = (size / 2) * 0.82;

        const COUNT = Math.floor(900 * (size / 640));
        points = Array.from({ length: COUNT }, () => {
            const u = Math.random(), v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            return { theta, phi, r: Math.random() * 1.4 + 0.6 };
        });

        orbits = [
            { tilt: 0.35, w: 1.6, speed: 0.7 },
            { tilt: -0.5, w: 1.2, speed: 1.0 },
            { tilt: 0.9, w: 0.8, speed: 1.3 }
        ];
    }

    function proj(theta, phi, rotY) {
        const x3 = Math.sin(phi) * Math.cos(theta + rotY);
        const z3 = Math.sin(phi) * Math.sin(theta + rotY);
        const y3 = Math.cos(phi);
        const x2 = (size / 2) + x3 * R;
        const y2 = (size / 2) + y3 * R;
        const d = (z3 + 1.8) / 2.8;
        return { x: x2, y: y2, d };
    }

    function drawBackgroundGlow() {
        const cx = size / 2, cy = size / 2;
        const g = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.02);
        g.addColorStop(0, 'rgba(25,46,92,0.85)');
        g.addColorStop(1, 'rgba(7,12,24,0.9)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

        const h = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.3);
        h.addColorStop(0, 'rgba(120,160,255,.12)');
        h.addColorStop(1, 'rgba(120,160,255,0)');
        ctx.fillStyle = h;
        ctx.beginPath(); ctx.arc(cx, cy, R * 1.28, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = 'rgba(0,0,0,.45)';
        ctx.beginPath(); ctx.ellipse(cx, cy + R * 0.92, R * 0.9, R * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    }

    function drawGrid(rotY) {
        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(130,170,255,.25)';
        for (let i = 0; i < 12; i++) {
            const th = (i / 12) * Math.PI * 2 + rotY * 0.6;
            ctx.beginPath();
            for (let j = -Math.PI / 2; j <= Math.PI / 2; j += Math.PI / 90) {
                const p = proj(th, j + Math.PI / 2, 0);
                if (j === -Math.PI / 2) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
            }
            ctx.globalAlpha = 0.6; ctx.stroke();
        }
        for (let i = -4; i <= 4; i++) {
            const phi = (i / 5) * (Math.PI / 2) + Math.sin(rotY * 0.6) * 0.02;
            ctx.beginPath();
            for (let th = 0; th <= Math.PI * 2 + 0.01; th += Math.PI / 90) {
                const p = proj(th, phi + Math.PI / 2, rotY);
                if (th === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
            }
            ctx.globalAlpha = 0.45; ctx.stroke();
        }
        ctx.restore();
    }

    function drawOrbits(rotY) {
        ctx.save();
        ctx.strokeStyle = 'rgba(87,140,255,.85)';
        ctx.lineWidth = 1.6;
        const t = performance.now();
        [{ tilt: 0.35, w: 1.6, speed: 0.7 },
        { tilt: -0.5, w: 1.2, speed: 1.0 },
        { tilt: 0.9, w: 0.8, speed: 1.3 }].forEach((o, idx) => {
            const phase = (t * 0.002 * o.speed) + idx;
            ctx.beginPath();
            for (let a = 0; a <= Math.PI * 2 + 0.01; a += Math.PI / 180) {
                const theta = a + phase, phi = Math.sin(a * o.w) * o.tilt;
                const p = proj(theta, phi + Math.PI / 2, rotY);
                if (a === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
            }
            ctx.globalAlpha = 0.65; ctx.stroke();
        });
        ctx.restore();
    }

    function drawPoints(rotY) {
        points.forEach(p => {
            const pr = proj(p.theta, p.phi, rotY);
            const r = p.r * (0.7 + pr.d * 0.6);
            ctx.globalAlpha = 0.28 + pr.d * 0.7;
            ctx.fillStyle = 'rgba(150,180,255,.95)';
            ctx.beginPath(); ctx.arc(pr.x, pr.y, r, 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    function tick() {
        ctx.clearRect(0, 0, size, size);
        const rotY = performance.now() * 0.003;
        drawBackgroundGlow();
        drawGrid(rotY);
        drawOrbits(rotY);
        drawPoints(rotY);
        requestAnimationFrame(tick);
    }

    window.addEventListener('resize', resize);
    resize(); tick();
})();

/* ===== Stars inside contact card ===== */
(function () {
    const canvas = document.getElementById('contactStars');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let DPR = 1, W = 0, H = 0, stars = [], tick = 0;

    function resize() {
        DPR = window.devicePixelRatio || 1;
        const b = canvas.getBoundingClientRect();
        canvas.width = Math.floor(b.width * DPR);
        canvas.height = Math.floor(b.height * DPR);
        canvas.style.width = b.width + 'px';
        canvas.style.height = b.height + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(DPR, DPR);
        W = b.width; H = b.height;

        const COUNT = Math.floor((W * H) / 12000);
        stars = Array.from({ length: COUNT }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            r: Math.random() * 1.2 + .4, a: Math.random() * 0.6 + .2,
            vx: (Math.random() - .5) * 0.25, vy: (Math.random() - .5) * 0.25
        }));
    }

    function step() {
        ctx.clearRect(0, 0, W, H);
        const g = ctx.createRadialGradient(W * 0.65, H * 0.3, 0, W * 0.65, H * 0.3, Math.max(W, H) * 0.8);
        g.addColorStop(0, 'rgba(120,160,255,.08)');
        g.addColorStop(1, 'rgba(120,160,255,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

        for (const s of stars) {
            s.x += s.vx; s.y += s.vy;
            if (s.x < -2) s.x = W + 2; if (s.x > W + 2) s.x = -2;
            if (s.y < -2) s.y = H + 2; if (s.y > H + 2) s.y = -2;
            const tw = Math.sin((tick / 30) + s.x * 0.01 + s.y * 0.01) * 0.35 + 0.65;
            ctx.globalAlpha = s.a * tw; ctx.fillStyle = 'rgba(160,190,255,.95)';
            ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;

        ctx.strokeStyle = 'rgba(140,170,255,.14)'; ctx.lineWidth = 1;
        for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < i + 6 && j < stars.length; j++) {
                const a = stars[i], b = stars[(j * 7) % stars.length];
                const dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
                if (d < 9000) { ctx.globalAlpha = .12; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
            }
        }
        ctx.globalAlpha = 1; tick++; requestAnimationFrame(step);
    }

    window.addEventListener('resize', resize);
    resize(); step();
})();

/* ===== قبل الإرسال: نكوّن Name من First/Last ===== */
(function () {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
        const fn = (document.getElementById('firstName')?.value || '').trim();
        const ln = (document.getElementById('lastName')?.value || '').trim();
        const full = [fn, ln].filter(Boolean).join(' ');
        const hidden = document.getElementById('fullNameHidden');
        if (hidden) hidden.value = full;
        if (!form.checkValidity()) {
            e.preventDefault(); e.stopPropagation();
            form.classList.add('was-validated');
        }
    }, false);
})();
