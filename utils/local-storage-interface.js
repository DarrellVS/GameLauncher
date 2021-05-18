const { BrowserWindow, ipcMain, app } = require('electron')

// Import window manager and create a new instance
const WinManager = require('./window-manager')
const WindowManager = new WinManager();

const store = require('./store')
let globalEvent = undefined;

app.whenReady().then(() => {
    WindowManager.create('localStorage')

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) WindowManager.create('localStorage')
    })
})

ipcMain.on('localstorage-announce', (event, data) => {
    globalEvent = event;
    store.setStore(JSON.parse(data))

    WindowManager.create('index')
})

module.exports = {
    updateStore: () => {
        const s = store.getStore();
        globalEvent.reply('localstorage-update', s)
    }
}