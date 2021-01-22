const {
    ipcRenderer
} = require('electron');
const version = document.getElementById('version');

ipcRenderer.send('app_version');
ipcRenderer.on('app_version', (event, arg) => {
    ipcRenderer.removeAllListeners('app_version');
    version.innerText = 'Version ' + arg.version;
});

const loginCard = document.getElementById('login-card');
const username = document.getElementById('username');
const password = document.getElementById('password');
const radioButton = document.getElementsByName('urlOption');
const loginButton = document.getElementById('login-button');
const upnotification = document.getElementById('upnotification');
const message = document.getElementById('message');
const innerMessage = document.getElementById('inner-message');
const restartButton = document.getElementById('restart-button');
const progressPercent = document.getElementById('progress-percent');
const progressSpeed = document.getElementById('progress-speed');
const progressBar = document.getElementById('progress-bar');

ipcRenderer.on('update_available', () => {
    ipcRenderer.removeAllListeners('update_available');
    message.innerText = 'New Update Available';
    innerMessage.innerText = 'Downloading Now';
    restartButton.disabled = true;
    upnotification.classList.remove('hidden');
    loginCard.classList.add('login-card-disable');
    username.disabled = true;
    password.disabled = true;
    radioButton.forEach(ele => {
        ele.disabled = true;
    });
    loginButton.disabled = true;
});
ipcRenderer.on('progress', (event, arg) => {
    // ipcRenderer.removeAllListeners('progress');
    progressBar.style.width = arg.percentage + "%";
    progressPercent.innerText = arg.percentage + " %";
    progressSpeed.innerText =  arg.speed + " Kbps";

});
ipcRenderer.on('update_downloaded', () => {
    ipcRenderer.removeAllListeners('update_downloaded');
    message.innerText = 'New Update Available';
    innerMessage.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
    restartButton.disabled = false;
    upnotification.classList.remove('hidden');
    loginCard.classList.add('login-card-disable');
    username.disabled = true;
    password.disabled = true;
    radioButton.forEach(ele => {
        ele.disabled = true;
    });
    loginButton.disabled = true;
});

//    function closeNotification() {
//        upnotification.classList.add('hidden');
//        loginCard.classList.remove('login-card-disable');
//        username.disabled = false;
//        password.disabled = false;
//        radioButton.forEach(ele => {
//            ele.disabled = false;
//        });
//        loginButton.disabled = false;
//    }

function restartApp() {
    ipcRenderer.send('restart_app');
}