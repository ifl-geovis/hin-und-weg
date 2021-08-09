import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import Log from './log';
import Config from './config';
import MainMenu from './menu';
import Settings from './settings';

let mainWindow: Electron.BrowserWindow;

function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		height: 960,
		width: 1400,
		// tslint:disable-next-line: object-literal-sort-keys
		title: 'hin&weg ' + Config.getVersion(),
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true
		},
	});

	// and load the index.html of the app.
	Settings.load();
	let style = Settings.getValue('global', 'style');
	mainWindow.loadFile(path.join(__dirname, './' + style + '.html'));

	// set main menu
	Menu.setApplicationMenu(MainMenu.getMainMenu());

	// Open the DevTools.
	if (Config.getValue('global', 'devtools')) {
		mainWindow.webContents.openDevTools({ mode: 'undocked' });
	}

	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	//if (process.platform !== "darwin") {
	app.quit();
	//}
});

app.on('activate', () => {
	// On OS X it"s common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});

app.setPath("appData", app.getAppPath() + "/../" + Config.getValue('global', 'datadir'));

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
Log.debug('Started hin&weg application ');
