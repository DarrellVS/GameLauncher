const { ipcRenderer, desktopCapturer, remote } = require('electron')
const { Menu } = remote;

ipcRenderer.on('game-data', (event, data) => setGameDetails(data))

ipcRenderer.on('add-installed-game', (event, data) => {
    const container = document.getElementById('installed-games-container');
    const amountContainer = document.getElementById('installed-amount');
    amountContainer.innerText = parseInt(amountContainer.innerText) + 1;

    container.insertAdjacentHTML('beforeend', `
        <div class="item game-id-${data.id}" onclick="setActive(${data.id})" oncontextmenu="openCustomContextMenu(event, this, ${data.id}, false)">
            <div class="cover" style="background-image: url('${data.game.covers.small}')"></div> ${data.game.name}
        </div>
    `)
})

function setActive(id) {
    const sideNav = document.getElementById('side-nav');
    const items = sideNav.querySelectorAll('.dropdown-container > .item')
    items.forEach(i => {
        i.classList.remove('active')
        if (i.classList.contains(`game-id-${id}`)) i.classList.add('active');
    });

    ipcRenderer.send('request-game-data', id)
}

function setGameDetails(game) {
    const playbutton = document.getElementById('play-button')
    playbutton.setAttribute('current-id', game.id);

    document.getElementById('game-cover').style.backgroundImage = `url('${game.covers.large}')`;
    document.getElementById('game-name').innerText = game.name;
    document.getElementById('playtime').innerText = msToHHMMSS(game.playTime);
    document.getElementById('last-played').innerText = game.lastPlayed == null ? 'Never' : isToday(game.lastPlayed) ? 'Today' : new Date(game.lastPlayed).toLocaleString();
    document.getElementById('cover-favorite-icon').style.display = game.isFavorite ? 'block' : 'none';
    document.getElementById('left-content-column').innerHTML = '';
    document.getElementById('right-content-column').innerHTML = '';

    setPlayingState(playbutton, game.isPlaying)

    // game.friendsPlaying = []
    game.friendsPlaying = [{
        username: 'Tering',
        tag: 6969,
        avatars: {
            small: 'https://images.igdb.com/igdb/image/upload/t_cover_small/co2ec4.jpg'
        }
    }]

    if (game.summary !== undefined) setSummary(game);
    if (game.storyline !== undefined) setStoryline(game);
    if (game.friendsPlaying !== undefined) setPlayingFriends(game.friendsPlaying)
    if (game.screenshots.length !== 0) setScreenshots(game);
}

function msToHHMMSS(ms) {
    // 1 ms to seconds 
    var seconds = Math.round(ms / 1000);
    // 2- Extract hours:
    var hours = parseInt(seconds / 3600); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    var minutes = parseInt(seconds / 60); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = seconds % 60;
    let resString = '';
    if (hours !== 0) resString += `${hours} h, `
    if (minutes !== 0) resString += `${minutes} min, `
    return resString += `${seconds} sec`;
}

function isToday(ms) {
    const date = new Date(ms)
    const today = new Date()
    return date.getDate() == today.getDate() &&
        date.getMonth() == today.getMonth() &&
        date.getFullYear() == today.getFullYear()
}

function startGame(el) {
    let id = el.getAttribute('current-id');
    if (id === undefined) return console.error('Could not start game, no ID defined;');
    ipcRenderer.send('start-game', id)
    setPlayingState(el, true)
}

function addToFavorites(id) {
    const el = document.querySelector(`.game-id-${id}`);
    el.setAttribute('oncontextmenu', `openCustomContextMenu(event, this, ${id}, true)`)
    let clonedEl = el.cloneNode(true);
    document.getElementById(`favorite-games-container`).appendChild(clonedEl)

    ipcRenderer.send('toggle-favorite', id)
    updateAmounts(true);
}

function removeFromFavorites(id) {
    let el = document.querySelector(`.game-id-${id}`);
    el.remove();
    el = document.querySelector(`.game-id-${id}`);
    el.setAttribute('oncontextmenu', `openCustomContextMenu(event, this, ${id}, false)`)

    ipcRenderer.send('toggle-favorite', id)
    updateAmounts(false);
}

function updateAmounts(addedToFav) {
    // Update favorite counter
    const favoriteAmount = document.getElementById('favorites-amount');
    const favAmount = parseInt(favoriteAmount.innerText);
    favoriteAmount.innerText = addedToFav ? favAmount + 1 : favAmount - 1;
}

function removeGame(id) {
    ipcRenderer.send('remove-game', id);
}






function setSummary(game) {
    document.getElementById('left-content-column').insertAdjacentHTML('beforeend', `
    <div class="item">
        <p class="title">Game Description</p>
        <div class="content">
            <p class="title">
                ${game.name}: Description
            </p>
            <p>
                ${game.summary}
            </p>
        </div>
    </div>
    `)
}

function setStoryline(game) {
    document.getElementById('left-content-column').insertAdjacentHTML('beforeend', `
    <div class="item">
        <p class="title">Game Storyline</p>
        <div class="content">
            <p class="title">
                ${game.name}: Storyline
            </p>
            <p>
                ${game.storyline}
            </p>
        </div>
    </div>
    `)
}

function setPlayingFriends(friends) {
    const parent = document.createElement('div');
    parent.className = 'item';

    const title = document.createElement('p')
    title.className = 'title';
    title.innerText = 'Friends Who Play'
    parent.appendChild(title)

    const list = document.createElement('div');
    list.className = 'friends-playing-list';

    if (friends.length === 0) {
        let heading = document.createElement('p')
        heading.className = 'no-friends-playing';
        heading.innerText = 'None of your friends have played this game'
        parent.appendChild(heading);
        document.getElementById('right-content-column').appendChild(parent);
        return;
    }

    friends.forEach(f => {
        const imgdiv = document.createElement('div')
        imgdiv.style.backgroundImage = `url('${f.avatars.small}')`;
        imgdiv.setAttribute('data-tooltip-title', `${f.username}#${f.tag}`)
        imgdiv.setAttribute('onmouseover', `showTooltip(this)`)
        imgdiv.setAttribute('onmouseleave', `hideTooltips()`)
        list.appendChild(imgdiv);
    });
    parent.appendChild(list);
    document.getElementById('right-content-column').appendChild(parent);
}

function setScreenshots(game) {
    const parent = document.createElement('div');
    parent.className = 'item';

    const title = document.createElement('p')
    title.className = 'title';
    title.innerText = 'Screenshots'
    parent.appendChild(title)

    game.screenshots.forEach(s => {
        const img = document.createElement('img')
        img.setAttribute('src', s)
        parent.appendChild(img);
    });

    document.getElementById('right-content-column').appendChild(parent);
}

function setPlayingState(playbutton, state) {
    playbutton.innerHTML = state ? `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
    </svg> Running` : `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
    class="bi bi-play-fill" viewBox="0 0 16 16">
        <path
            d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
    </svg> Play
    `
}

ipcRenderer.on('update-playtime', (event, data) => {
    document.getElementById('playtime').innerText = msToHHMMSS(data.newPlaytime);
    document.getElementById('last-played').innerText = 'Today';

    const playbutton = document.getElementById('play-button');
    currentID = playbutton.getAttribute('current-id');
    if (currentID == data.id) setPlayingState(playbutton, false)
})