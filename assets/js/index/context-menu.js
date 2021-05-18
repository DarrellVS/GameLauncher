function openCustomContextMenu(event, el, id, isFavorite) {
    event.preventDefault();

    // Remove existing context menus
    removeContextMenu()

    document.body.insertAdjacentHTML('afterbegin', `
    <context-menu>
        <div class="item" onclick="${isFavorite ? `removeFromFavorites(${id});` : `addToFavorites(${id});`} removeContextMenu()">
            ${isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        </div>
        <div class="item" onclick="removeGame(${id})">
            Remove
        </div>
        <div class="item">
            Edit
        </div>
    </context-menu>
    `)

    var bodyRect = document.body.getBoundingClientRect(),
        elemRect = el.getBoundingClientRect(),
        y = Math.round(elemRect.top - bodyRect.top) + 50,
        x = event.clientX + 5;
    document.querySelector('context-menu').style.transform = `translate(${x}px, ${y}px)`;
}

function removeContextMenu() {
    document.querySelector('context-menu')?.remove();
}