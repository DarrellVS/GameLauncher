const { ipcRenderer } = require('electron')

// Request and parse data
ipcRenderer.send('request-init-data')
ipcRenderer.on('init-data', (event, data) => {
    console.log(data);
    fillFavoriteGames(data)
    fillInstalledGames(data)
})

// Fill the favorite games dropdown
function fillFavoriteGames({favoriteGames, games}) {
    const container = document.getElementById('favorite-games-container');
    document.getElementById('favorites-amount').innerText = favoriteGames.length;
    favoriteGames.forEach((g, index) => {
        container.insertAdjacentHTML('beforeend', `
        <div class="item game-id-${g.id} ${index === 0 ? 'active' : ''}" onclick="setActive(${g.id})" oncontextmenu="openCustomContextMenu(event, this, ${g.id}, true)">
            <div class="cover" style="background-image: url('${g.covers.small}')"></div> ${g.name}
        </div>
        `)
    });
}

function fillInstalledGames({favoriteGames, games}) {
    const container = document.getElementById('installed-games-container');
    document.getElementById('installed-amount').innerText = games.length;
    games.forEach(g => {
        container.insertAdjacentHTML('beforeend', `
        <div class="item game-id-${g.id}" onclick="setActive(${g.id})" oncontextmenu="openCustomContextMenu(event, this, ${g.id}, ${g.isFavorite})">
            <div class="cover" style="background-image: url('${g.covers.small}')"></div> ${g.name}
        </div>
        `)
    });

    var firstItem = favoriteGames[0];
    if(firstItem) {
        setGameDetails(firstItem)
        setActive(firstItem)
    } else if(games.length > 0) {
        setGameDetails(games[0])
        setActive(games[0])
    } else {
        console.log('No games installed')
    }
}

function setActive({id}) {
    const sideNav = document.getElementById('side-nav');
    const items = sideNav.querySelectorAll('.dropdown-container > .item')
    items.forEach(i => {
        i.classList.remove('active')
        if (i.classList.contains(`game-id-${id}`)) i.classList.add('active');
    });
}


function setGameDetails(game) {
    document.getElementById('play-button').setAttribute('current-id', game.id);
    document.getElementById('game-cover').style.backgroundImage = `url('${game.covers.large}')`;
    document.getElementById('game-name').innerText = game.name;
    document.getElementById('playtime').innerText = msToHHMMSS(game.playTime);
    document.getElementById('last-played').innerText = game.lastPlayed == null ? 'Never' : isToday(game.lastPlayed) ? 'Today' : new Date(game.lastPlayed).toLocaleString();
    document.getElementById('cover-favorite-icon').style.display = game.isFavorite ? 'block' : 'none';

    if (game.summary !== undefined) setSummary(game);
    if (game.storyline !== undefined) setStoryline(game);
    if (game.friendsPlaying !== undefined) setPlayingFriends(game.friendsPlaying)
    if (game.screenshots.length !== 0) setScreenshots(game);

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