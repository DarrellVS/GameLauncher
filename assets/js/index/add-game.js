let searchTimeout = undefined;
let covers = [];
let gameScheme = {
    name: undefined,
    filePath: undefined,
    storyline: undefined,
    summary: undefined,
    rating: undefined,
    screenshots: [],
    covers: undefined,
    websites: undefined
}

let isSubmitted = false;

function showAddGameModal() {
    if (isSubmitted) return;
    gameScheme = {
        name: undefined,
        filePath: undefined,
        storyline: undefined,
        summary: undefined,
        rating: undefined,
        screenshots: [],
        covers: undefined,
        websites: undefined
    }

    document.querySelector('body').insertAdjacentHTML('afterbegin', `
    <modal class="add-game" id="add-game-modal">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x close-icon" viewBox="0 0 16 16" onclick="closeAddGameModal()">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
        <div class="inputs">
            <div class="input-group">
                <label for="game-title">Game Title</label>
                <input type="text" id="game-title-input" name="title" onkeyup="resetSearchTimeout(this)">
            </div>
            <button onclick="selectExecutable()">Select Executable</button>
        </div>
        <div id="add-game-covers"></div>

        <button id="submit-button" style="display: none;" onclick="submitData()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
            </svg>
        </button>
    </modal>
    `)
}

function closeAddGameModal() {
    if (isSubmitted) return;
    document.getElementById('add-game-modal')?.remove();
}

function resetSearchTimeout(input) {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        searchForCovers(input)
        checkProgress();
    }, 500)
}

function searchForCovers(input) {
    const query = input.value.trim();
    gameScheme.name = query;
    ipcRenderer.send('request-game-covers', query)
}

function selectExecutable() {
    ipcRenderer.send('request-file-path')
}

function setCover(index) {
    gameScheme.covers = covers[index]
    checkProgress();
}

function submitData() {
    if (isSubmitted) return;
    if (gameScheme.name === undefined || gameScheme.filePath === undefined || gameScheme.covers === undefined) return console.error('Fill out all elements before submitting');
    isSubmitted = true;
    let btn = document.getElementById('submit-button');
    btn.style.display = 'none';
    ipcRenderer.send('request-game-info', gameScheme.name)
}

function checkProgress() {
    if (isSubmitted) return;
    if (gameScheme.name === undefined || gameScheme.filePath === undefined || gameScheme.covers === undefined) return;
    let btn = document.getElementById('submit-button');
    btn.style.display = 'block';
}

ipcRenderer.on('game-covers', (event, data) => {
    if (data.code !== 200) return;
    let container = document.getElementById('add-game-covers');
    container.innerHTML = '';
    covers = data.covers;
    data.covers.forEach((c, index) => {
        if (index !== 0) gameScheme.screenshots.push(c.large.replace('t_cover_big', 't_screenshot_huge'))
        container.insertAdjacentHTML(`beforeend`, `
            <img src="${c.large}" style="height: 10rem;" onclick="setCover(${index})">
        `)
    });
})

ipcRenderer.on('file-path', (event, data) => {
    if (data.code === 200) gameScheme.filePath = data.filePath;
    checkProgress();
})

ipcRenderer.on('add-game-info', (event, data) => {
    gameScheme.storyline = data.storyline;
    gameScheme.summary = data.summary;
    gameScheme.websites = data.websites;
    gameScheme.rating = data.rating;
    ipcRenderer.send('add-game', gameScheme)
    isSubmitted = false;
    closeAddGameModal();
})

window.addEventListener('mousedown', (e) => {
    if (isSubmitted) return;
    if (!document.getElementById('add-game-modal')?.contains(e.target)) closeAddGameModal();
    if (!document.querySelector('context-menu')?.contains(e.target)) document.querySelector('context-menu')?.remove();
});