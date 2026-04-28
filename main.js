const { app, BrowserWindow, session, shell, ipcMain } = require('electron');
const path = require('path');

// ── Empêcher plusieurs instances ──
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 380,
    minHeight: 600,
    title: 'MyKajy',
    // Aucune barre de titre native sur macOS (look moderne)
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Autoriser localStorage (nécessaire pour les données)
      partition: 'persist:mykajy'
    },
    backgroundColor: '#F5F5F0',
    show: false // On attend que la fenêtre soit prête
  });

  // ── Charger l'app ──
  mainWindow.loadFile('index.html');

  // ── Afficher proprement une fois chargé ──
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // ── Ouvrir les liens externes dans le navigateur système ──
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // ── Empêcher la navigation hors de l'app ──
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const appUrl = `file://${path.join(__dirname, 'index.html')}`;
    if (url !== appUrl) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

// ── Résoudre le CORS pour les appels GitHub API ──
// Electron intercepte les requêtes et injecte les bons headers
app.whenReady().then(() => {

  // Header Origin propre pour GitHub API (évite le rejet null origin)
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['https://api.github.com/*'] },
    (details, callback) => {
      details.requestHeaders['Origin'] = 'https://github.com';
      details.requestHeaders['User-Agent'] = 'MyKajy-App/1.0';
      callback({ requestHeaders: details.requestHeaders });
    }
  );

  createWindow();

  // macOS : recréer la fenêtre si on clique sur l'icône du dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// ── Quitter quand toutes les fenêtres sont fermées (sauf macOS) ──
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── Deuxième instance : focus sur la fenêtre existante ──
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// ── IPC : informations système accessibles depuis le renderer ──
ipcMain.handle('get-platform', () => process.platform);
ipcMain.handle('get-version', () => app.getVersion());
