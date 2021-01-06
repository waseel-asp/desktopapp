const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
        },
        icon: 'images/desktop_app_icon.ico'
    });
    mainWindow.loadFile('login/loginui.html');
    mainWindow.on('closed', function() {
        mainWindow = null;
    });
    mainWindow.once('ready-to-show', () => {
        autoUpdater.checkForUpdatesAndNotify();
    });
    mainWindow.webContents.on('did-finish-load', function() {
        mainWindow.webContents.executeJavaScript(`isLoggedIn();
        
        function isLoggedIn(){
            const token = localStorage.getItem('access_token');
            if(token != null){
            const expire_time = new Date(localStorage.getItem('expire_time'));
            if((expire_time.getTime() < new Date().getTime())){
                alert("Token is expired. Please again sign in.")
                window.location.href = "../login/loginui.html";
            }else{
                console.log("valid");
            }
            }
        }
        `);
    });
    mainWindow.on('close', function(e){        
       console.log("on close..");
    });
    
    
}

app.allowRendererProcessReuse = false;

app.on('ready', () => {
    createWindow();
});

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});


autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
});

