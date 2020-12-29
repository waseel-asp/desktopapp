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
   const notification = document.getElementById('notification');
   const message = document.getElementById('message');
   const restartButton = document.getElementById('restart-button');
   ipcRenderer.on('update_available', () => {
       ipcRenderer.removeAllListeners('update_available');
       message.innerText = 'A new update is available. Downloading now...';
       notification.classList.remove('hidden');
       loginCard.classList.add('login-card-disable');
       username.disabled = true;
       password.disabled = true;
       radioButton.forEach(ele => {
           ele.disabled = true;
       });
       loginButton.disabled = true;
   });
   ipcRenderer.on('update_downloaded', () => {
       ipcRenderer.removeAllListeners('update_downloaded');
       message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
       restartButton.classList.remove('hidden');
       notification.classList.remove('hidden');
       loginCard.classList.add('login-card-disable');
       username.disabled = true;
       password.disabled = true;
       radioButton.forEach(ele => {
           ele.disabled = true;
       });
       loginButton.disabled = true;
   });

//    function closeNotification() {
//        notification.classList.add('hidden');
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