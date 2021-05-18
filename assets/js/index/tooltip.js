function showTooltip(el) {
    let title = el.getAttribute('data-tooltip-title');
    let p = document.createElement('p');
    p.className = 'tooltip';
    p.innerText = title;
    var bodyRect = document.body.getBoundingClientRect(),
        elemRect = el.getBoundingClientRect(),
        y = Math.round(elemRect.top - bodyRect.top) - 55,
        x = Math.round(elemRect.left - bodyRect.left) - elemRect.width / 2 - 8;
    p.style.transform = `translate(${x}px, ${y}px)`;

    document.body.appendChild(p);

    setTimeout(() => {
        p.style.opacity = 1;
    }, 50)
}

function hideTooltips() {
    document.querySelectorAll('.tooltip').forEach(t => {
        t.style.opacity = 0;
        setTimeout(() => {
            t.remove()
        }, 250)
    });
}