// Modules to control application life and create native browser window
const { Menu, MenuItem, app, BrowserWindow, dialog } = require('electron')
const path = require('path')
const fs = require('fs').promises

function initMenu() {
  const menu = Menu.getApplicationMenu()
  const openMenu = new MenuItem({
    label: 'Open',
    id: 'file-open',
    click: async (_, win) => {
      console.log('before showOpenDialog')
      const result = await dialog.showOpenDialog(win, {
        filters: [{ name: 'Text', extensions: ['txt'] }]
      })
      console.log('after showOpenDialog', result)
      if (result.filePaths.length) {
        const text = await fs.readFile(result.filePaths[0], 'utf8')
        win.webContents.send('open-file', text)
      }
    }
  })
  const fileMenu = menu.items.find(item => item.role === 'filemenu')
  if (fileMenu) {
    fileMenu.submenu.insert(0, openMenu)
  }
  Menu.setApplicationMenu(menu)
}

function createWindow() {
  const testing = process.env.CI === '1'

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: !testing,
      nodeIntegration: testing,
      preload: path.join(__dirname, '../renderer/preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  initMenu()
  createWindow()

  app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit()
})
