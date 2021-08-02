const { log } = require('console');
const { app, BrowserWindow, ipcMain, globalShortcut, dialog } = require('electron');
const isDev = require('electron-is-dev')
const path = require('path');
let mainWindow;
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

/**
 * init app
 */
app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    minWidth: 830,
    minHeight: 680,
    height: 680,
    // transparent: true, // program cannot set window max when transparent
    backgroundColor: "#3B3B4D", //set bg color
    webPreferences: {
      nodeIntegration: true, //enable to use node in web
      enableRemoteModule: true,
      contextIsolation: false,
      webSecurity: false,
    },
    titleBarStyle: 'customButtonsOnHover',
    frame: false,
    resizable: true,
    icon: path.join(__dirname, '/public/logo128.ico'),
    title: "Cool Music"
  })

  mainWindow.setMenu(null);
  const urlLocation = isDev ? 'http://localhost:3000' : 'dummyurl';
  mainWindow.loadURL(urlLocation);
  mainWindow.setMaximizable(true);
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('max', mainWindow.width)
  })
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('min', mainWindow.width)
  })
})

/**
 * New Action Listener of Change winodw opacity window size open dir and so on
 */
ipcMain.on("setOpacity", async (event, args) => {
  await mainWindow.setOpacity(args);
})
ipcMain.on("setMax", async (event, args) => {
  await mainWindow.maximize();
})
ipcMain.on("setRestore", async (event, args) => {
  await mainWindow.restore();
})
ipcMain.on("setMin", async (event, args) => {
  await mainWindow.minimize();
})
ipcMain.on("setClose", async (event, args) => {
  await mainWindow.close();
  app.quit();
})
ipcMain.on("openFolder", async (event, args) => {
  let fileReturn = await dialog.showOpenDialog({
    "title": "Choose Music DirPath",
    properties: ['openFile', 'openDirectory', 'multiSelections'],
    defaultPath: args
  })
  if (!fileReturn.canceled) {
    await event.reply('asynchronous-reply', fileReturn)
  }
});

/**
 * open devoloper tools in dev
 */
if (isDev) {
  app.whenReady().then(() => {
    const ret = globalShortcut.register('Alt+F12', () => {
      mainWindow.webContents.openDevTools();
    })

    if (!ret) {
      console.log('registration failed')
    }

    console.log("Alt + F12 register success ?", globalShortcut.isRegistered('Alt+F12'))
  })
}