const { BrowserWindow, ipcMain, app } = require('electron')
const path = require('path')
var windows = {};

class WindowManager {
    constructor() { }

    create(window) {
        switch (window) {
            case 'index':
                this.#createWindow('index', 1400, 860, true)
                break;

            case 'localStorage':
                this.#createWindow('localStorage', 1000, 1000, true, false)
                break;

            default:
                throw new Error('No window with that name')
        }
    }

    destroy(window) {
        // Validate
        if (windows[window] === undefined) throw new Error('Could not destroy window: not present.')

        // Close and delete
        windows[window].close();
        delete windows[window];
    }

    quit() {
        app.quit();
    }

    show(window) {
        // Validate
        if (windows[window] === undefined) throw new Error('Could not show window: not present.')
        windows[window].show()
    }

    getWindows() {
        return windows
    }

    #createWindow(filename, width = 1400, height = 860, preloader = false, show = true, frame = false) {
        // Validate
        if (filename === undefined) throw new Error('You must specify a filename in order to create a window')

        // BrowserWindow options
        let options;
        if (preloader) {
            options = {
                width,
                height,
                frame,
                show,
                icon: 'images/icons/icon.png',
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                    enableRemoteModule: true,
                    preload: path.join(__dirname, `../assets/js/${filename}/preload.js`)
                }
            }
        } else {
            options = {
                width,
                height,
                frame,
                show,
                icon: 'images/icons/icon.png'
            }
        }

        // Create the browser window
        windows.main = new BrowserWindow(options)

        // Load the html doc.
        windows.main.loadFile(path.join(__dirname, `../assets/html/${filename}.html`))
    }
}

module.exports = WindowManager;