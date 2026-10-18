const { app, BrowserWindow, dialog, Menu } = require('electron');
const path = require('path');

if (!app.requestSingleInstanceLock()) { app.quit(); }

let win;
function createWindow(){
  win = new BrowserWindow({
    width: 1366, height: 800, minWidth: 900, minHeight: 600,
    backgroundColor: '#0a0a0a',
    icon: path.join(__dirname, 'resources', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  Menu.setApplicationMenu(null);
  win.setTitle('Sistema Kumitê Lótus');
  win.loadFile(path.join(__dirname, "www", "index.html"));

  // popups de impressão/chaveamento do app abrem como janelas normais (sem acesso ao sistema)
  win.webContents.setWindowOpenHandler(() => ({
    action: 'allow',
    overrideBrowserWindowOptions: { autoHideMenuBar: true, backgroundColor: '#ffffff', webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true } }
  }));

  // links externos nunca navegam dentro do app
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file://')) e.preventDefault(); });

  // F11 = tela cheia (placar no telão), F12 desligado
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });

  // confirmação antes de fechar
  win.on('close', (e) => {
    const r = dialog.showMessageBoxSync(win, {
      type: 'question', buttons: ['Cancelar', 'Sair'], defaultId: 0, cancelId: 0,
      title: 'Sistema Kumitê Lótus', message: 'Deseja realmente sair do Sistema Kumitê Lótus?',
      detail: 'Os dados ficam salvos neste computador.'
    });
    if (r === 0) e.preventDefault();
  });
}
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
