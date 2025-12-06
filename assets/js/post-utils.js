document.addEventListener('DOMContentLoaded', function() {
    const content = document.querySelector('.gh-content');
    if (!content) return;

    const headers = content.querySelectorAll('h1, h2, h3, h4, h5, h6');

    headers.forEach(header => {
        if (!header.id) {
            // Generate ID from text content
            const id = header.textContent
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            header.id = id;
        }

        const anchor = document.createElement('a');
        anchor.href = `#${header.id}`;
        anchor.className = 'header-anchor';
        anchor.innerHTML = '¶';
        anchor.setAttribute('aria-hidden', 'true');

        header.prepend(anchor);
    });
});
