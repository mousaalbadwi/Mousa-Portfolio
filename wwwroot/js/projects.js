// wwwroot/js/projects.js
(function () {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.project-card'));
    const segBtns = document.querySelectorAll('.seg-btn');
    const searchInput = document.getElementById('projSearch');
    const noResults = document.getElementById('noResults');

    let active = 'all';
    let q = '';

    function apply() {
        const query = (q || '').trim().toLowerCase();
        let shown = 0;

        cards.forEach(card => {
            const tech = (card.getAttribute('data-tech') || '').toLowerCase();
            const text = (card.getAttribute('data-title') || '').toLowerCase();

            const passFilter = (active === 'all') ||
                tech.split(/\s+/).includes(active.toLowerCase().replace(/\s+/g, '_'));

            const passSearch = !query || text.includes(query);

            const show = passFilter && passSearch;
            card.style.display = show ? '' : 'none';
            if (show) shown++;
        });

        if (noResults) noResults.classList.toggle('d-none', shown !== 0);
    }

    segBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            segBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            active = btn.getAttribute('data-filter') || 'all';
            apply();
        });
    });

    if (searchInput) {
        let t;
        searchInput.addEventListener('input', () => {
            clearTimeout(t);
            t = setTimeout(() => { q = searchInput.value || ''; apply(); }, 120);
        });
    }

    // افتراضي
    (document.querySelector('.seg-btn[data-filter="all"]') || segBtns[0])?.click();
})();
