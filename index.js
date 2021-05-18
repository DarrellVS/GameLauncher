require('dotenv').config()
const { app, BrowserWindow, dialog, globalShortcut, ipcMain } = require('electron')

// Include the ipc main handler
require('./utils/ipc-handler')(ipcMain, dialog)

const isDist = false;

app.whenReady().then(() => {
    if (isDist) globalShortcut.register("CommandOrControl+R", () => {
        console.log("CommandOrControl+R is pressed: Shortcut Disabled");
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) WindowManager.create('index')
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})