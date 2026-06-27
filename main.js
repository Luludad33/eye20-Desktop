const { app, BrowserWindow, Tray, Menu, nativeImage, Notification, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;

// --- tray icon generators ---
function createTrayIcon() {
  const size = 16;
  const canvas = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const cx = 8, cy = 8, r1 = 7, r2 = 3;
      const d = Math.hypot(x - cx, y - cy);
      if (d <= r1 && d > r2) {
        canvas[i] = 16; canvas[i + 1] = 185; canvas[i + 2] = 129; canvas[i + 3] = 255;
      } else if (d <= r2) {
        canvas[i] = 0; canvas[i + 1] = 0; canvas[i + 2] = 0; canvas[i + 3] = 0;
      } else {
        canvas[i] = 0; canvas[i + 1] = 0; canvas[i + 2] = 0; canvas[i + 3] = 0;
      }
    }
  }
  return nativeImage.createFromBuffer(canvas, { width: size, height: size });
}

function createDoneTrayIcon() {
  const size = 16;
  const canvas = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const cx = 8, cy = 8;
      const d = Math.hypot(x - cx, y - cy);
      if (d <= 7) {
        // golden checkmark — all green filled
        canvas[i] = 255; canvas[i + 1] = 193; canvas[i + 2] = 7; canvas[i + 3] = 255;
      } else {
        canvas[i] = 0; canvas[i + 1] = 0; canvas[i + 2] = 0; canvas[i + 3] = 0;
      }
    }
  }
  return nativeImage.createFromBuffer(canvas, { width: size, height: size });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 440,
    height: 660,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    title: '20-20-20 护眼助手',
    icon: createTrayIcon().resize({ width: 32, height: 32 }),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.setMenu(null);
  mainWindow.loadFile('index.html');

  // minimize to tray instead of closing
  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('show', () => {
    if (process.platform === 'darwin') {
      tray?.setHighlightMode('always');
    }
  });

  // --- IPC handlers for session lifecycle ---
  ipcMain.on('round-update', (_e, { round, maxCycles }) => {
    tray?.setToolTip(`20-20-20 护眼助手 - 第 ${round}/${maxCycles} 轮`);
    // reset to normal icon on new session
    if (round === 1) {
      tray?.setImage(createTrayIcon());
    }
  });

  ipcMain.on('session-complete', () => {
    tray?.setImage(createDoneTrayIcon());
    tray?.setToolTip('20-20-20 护眼助手 - 今日护眼完成 ✅');
    // native desktop notification
    if (mainWindow) {
      const notif = new Notification({
        title: '✅ 护眼会话完成',
        body: '恭喜完成 3 轮护眼！记得定时看看远处哦 👁',
      });
      notif.show();
    }
  });
}

function createTray() {
  tray = new Tray(createTrayIcon());
  tray.setToolTip('20-20-20 护眼助手');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

// --- prevent multiple instances ---
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    createTray();
  });
}

app.on('window-all-closed', () => {
  // don't quit — keep running in tray
});
