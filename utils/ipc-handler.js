const IGDB = require('./igdb')
const store = require('./store')
const SpawnedProcess = require('./process-handler')
const localStorage = require('./local-storage-interface')
let igdb = new IGDB(process.env.IGDB_CLIENT_ID, process.env.IGDB_CLIENT_SECRET)

module.exports = (ipcMain, dialog) => {
    ipcMain.on('request-init-data', event => {
        event.reply('init-data', {
            username: store.getUser().username,
            games: store.getGames(),
            favoriteGames: store.getFavoriteGames()
        })

        store.removeGame(1)
    })

    ipcMain.on('request-game-data', (event, id) => {
        event.reply('game-data', store.getGame(id))
    })

    // ======== add game ======== //

    ipcMain.on('request-game-covers', async (event, query) => {
        let data = await igdb.getGameCovers(query);
        event.reply('game-covers', data);
    })

    ipcMain.on('request-game-info', async (event, game) => {
        let data = await igdb.getGameInfo(game);
        event.reply('add-game-info', data);
    })

    ipcMain.on('request-file-path', async event => {
        let res = await dialog.showOpenDialog({ properties: ['openFile'] })
        if (res.canceled === true) return event.reply('file-path', { code: 400, message: 'File picker was canceled' })
        event.reply('file-path', { code: 200, filePath: res.filePaths[0] })
    })

    ipcMain.on('add-game', async (event, game) => {
        if (store.contains(game.name)) return event.reply('error', 'A game with that name already exists')
        let id = await store.addGame(game)

        // Add game to installed list
        event.reply('add-installed-game', { id, game })

        // Sync localStorage
        localStorage.updateStore()
    })

    // ======== remove game  ======== //

    ipcMain.on('remove-game', async (event, id) => {
        if (store.isGameRunning(id)) return console.log('Game is running')
        store.removeGame(id);
        
        // Sync localStorage
        localStorage.updateStore()
    })

    // ======== control game ======== //

    ipcMain.on('start-game', async (event, id) => {
        let filepath = await store.getFilepath(id);
        new SpawnedProcess(filepath, id, event)
    })

    ipcMain.on('toggle-favorite', (event, id) => {
        store.toggleFavorite(id)

        // Sync localStorage
        localStorage.updateStore()
    })
}