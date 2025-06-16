document.addEventListener('DOMContentLoaded', () => {
    const pages = Array.from(document.querySelectorAll('.page'));

    // Find the index of the page closest to the top of the viewport
    function getCurrentPageIndex() {
        return pages.findIndex(page => {
            const rect = page.getBoundingClientRect();
            // consider “current” if its top is within ± half a viewport height
            return rect.top >= -window.innerHeight/2 && rect.top <= window.innerHeight/2;
        });
    }

    document.addEventListener('keydown', e => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

        e.preventDefault();
        let idx = getCurrentPageIndex();
        if (idx === -1) idx = 0;  // fallback to first page

        if (e.key === 'ArrowDown' && idx < pages.length - 1) {
            idx++;
        } else if (e.key === 'ArrowUp' && idx > 0) {
            idx--;
        }

        pages[idx].scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById("scroll-to-comments").addEventListener("click", () => {
        document.querySelector(".page2").scrollIntoView({ behavior: "smooth" });
    });
});