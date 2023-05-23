const { log } = require('console');
const { app, BrowserWindow, Menu, ipcMain, shell, webContents } = require('electron');
const path = require('path')
const fs = require('fs')
const os = require('os')
const resizeImg = require('resize-img')

const isMac = process.platform === 'darwin'
const isDevelopment = process.env.NODE_ENV !== 'development'

let mainWindow;

const menu = [
    ...(isMac ? [
        {
            label: app.name,
            submenu: [{
                label: 'About',
                click: createAboutWindow
            }]
        }
    ] : []),
    {
        role: 'fileMenu'
    },
    ...(!isMac ? [
        {
            label: 'Help',
            submenu: [{
                label: 'About',
                click: createAboutWindow
            }]
        }
    ] : []),
]

async function handleResizeImage(event, data) {
    const fileName = path.basename(data.imgPath)
    data.dest = path.join(os.homedir(), 'Pictures', 'Image Resizer')
    try {
        const newImage = await resizeImg(fs.readFileSync(data.imgPath),
            {
                width: +data.width,
                height: +data.height
            }
        )
        if (!fs.existsSync(data.dest))
            fs.mkdirSync(data.dest)

        fs.writeFileSync(path.join(data.dest, fileName), newImage)

        mainWindow.webContents.send('resize:done')

        shell.openPath(data.dest)
    } catch (error) {
        console.log(error);
    }
}

// create the main window
function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: "Image Resizer",
        width: 500,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // open devtools if in development mode
    if (isDevelopment) {
        mainWindow.webContents.openDevTools();
    }

    log({ isDevelopment, isMac })

    ipcMain.handle('news', () => 'pong')
    ipcMain.on('image:resize', handleResizeImage)

    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'))

}

// create the about window
function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        title: "About",
        width: 300,
        height: 300
    })

    aboutWindow.loadFile(path.join(__dirname, 'renderer', 'about.html'))
    log(BrowserWindow.getAllWindows.length)
}

// when app ready
app.whenReady().then(() => {
    createMainWindow()

    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows.length === 0)
            createMainWindow();
    })

    // Remove variable from memory
    mainWindow.on('closed', () => (mainWindow = null));

});

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit()
    }
})