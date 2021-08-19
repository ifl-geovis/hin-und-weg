import { app, Menu, BrowserWindow } from "electron";

import Config from "./config";
import Log from './log';

export default class MainMenu
{

	private static template: Electron.MenuItemConstructorOptions[] =
	[
		{
			label: 'Anwendung',
			submenu:
			[
				{
					label: 'Projekt öffnen',
					enabled: false,
				},
				{
					label: 'Projekt speichern',
					enabled: false,
				},
				{
					label: 'Import',
					enabled: false,
				},
				{
					label: 'Export',
					submenu:
					[
						{
							id: 'export-png',
							label: 'PNG',
							click(event, window, content) {MainMenu.execute("export-image", "png", event, window, content);},
						},
						{
							id: 'export-jpeg',
							label: 'JPEG',
							click(event, window, content) {MainMenu.execute("export-image", "jpeg", event, window, content);},
						},
						{
							id: 'export-pdf',
							label: 'PDF',
							click(event, window, content) {MainMenu.execute("export-image", "pdf", event, window, content);},
						},
					]
				},
				{
					type: 'separator'
				},
				{
					label: 'Vergrößern',
					accelerator: 'CommandOrControl+=',
					role: 'zoomIn'
				},
				{
					label: 'Verkleinern',
					role: 'zoomOut'
				},
				{
					label: 'Zoom zurücksetzen',
					role: 'resetZoom'
				},
				{
					type: 'separator'
				},
				{
					label: 'Drucken',
					click(event, window, content) {MainMenu.print(event, window, content);}
				},
				{
					type: 'separator'
				},
				{
					label: 'Beenden',
					role: 'quit'
				}
			]
		},
		{
			label: 'Ansichten',
			submenu:
			[
				{
					label: 'Einzelansicht',
					click(event, window, content) {MainMenu.execute("dashboard", "s1", event, window, content);}
				},
				{
					label: 'oben 1 unten 1',
					click(event, window, content) {MainMenu.execute("dashboard", "t1b1", event, window, content);}
				},
				{
					label: 'links 1 rechts 1',
					click(event, window, content) {MainMenu.execute("dashboard", "l1r1", event, window, content);}
				},
				{
					label: 'oben 1 unten 2',
					click(event, window, content) {MainMenu.execute("dashboard", "t1b2", event, window, content);}
				},
				{
					label: 'oben 2 unten 1',
					click(event, window, content) {MainMenu.execute("dashboard", "t2b1", event, window, content);}
				},
				{
					label: 'links 1 rechts 2',
					click(event, window, content) {MainMenu.execute("dashboard", "l1r2", event, window, content);}
				},
				{
					label: '3× vertikal',
					click(event, window, content) {MainMenu.execute("dashboard", "v3", event, window, content);}
				},
				{
					label: 'Viertel',
					click(event, window, content) {MainMenu.execute("dashboard", "l2r2", event, window, content);}
				},
				{
					label: 'Vergleich',
					click(event, window, content) {MainMenu.execute("dashboard", "cls1rs1", event, window, content);}
				},
			]
		},
		{
			label: 'Visualisierungen',
			submenu:
			[
				{
					id: 'map',
					label: 'Karte',
					enabled: false,
					click(event, window, content) {MainMenu.execute("viewswitcher", "map", event, window, content);},
				},
				{
					id: 'table',
					label: 'Tabelle',
					enabled: false,
					click(event, window, content) {MainMenu.execute("viewswitcher", "table", event, window, content);},
				},
				{
					id: 'd3-timeline',
					label: 'Zeitreihen',
					enabled: false,
					click(event, window, content) {MainMenu.execute("viewswitcher", "d3-timeline", event, window, content);},
				},
				{
					label: 'Diagramm',
					submenu:
					[
						{
							id: 'd3-chord',
							label: 'Chord',
							enabled: false,
							click(event, window, content) {MainMenu.execute("viewswitcher", "d3-chord", event, window, content);},
						},
						{
							id: 'd3-sankey',
							label: 'Sankey',
							enabled: false,
							click(event, window, content) {MainMenu.execute("viewswitcher", "d3-sankey", event, window, content);},
						},
						{
							id: 'd3-bar',
							label: 'Balken',
							enabled: false,
							click(event, window, content) {MainMenu.execute("viewswitcher", "d3-bar", event, window, content);},
						},
					]
				}
			]
		},
		{
			label: 'Analysen',
			submenu:
			[
				{
					id: 'statistics',
					label: 'Statistiken',
					enabled: false,
					click(event, window, content) {MainMenu.execute("viewswitcher", "statistics", event, window, content);},
				},
				{
					id: 'db',
					label: 'Datenbank',
					enabled: false,
					click(event, window, content) {MainMenu.execute("viewswitcher", "db", event, window, content);}
				},
				{
					id: 'index',
					label: 'Indexwert',
					enabled: false,
					click(event, window, content) {MainMenu.execute("viewswitcher", "index", event, window, content);},
				},
			]
		},
		{
			label: 'Einstellungen',
			submenu:
			[
				{
					label: 'Einstellungen',
					click(event, window, content) {MainMenu.execute("viewswitcher", "settings", event, window, content);},
				},
			],
		},
		{
			label: 'Hilfe',
			submenu:
			[
				{
					label: 'hin&&weg Webseite',
					click(event, window, content) {MainMenu.website("https://hin-und-weg.online/", window);}
				},
				{
					label: 'Dokumentation',
					enabled: false,
				},
				{
					label: 'Tutorials',
					enabled: false,
				},
				{
					label: 'Kontexthilfe',
					enabled: false,
				},
				{
					type: 'separator'
				},
				{
					id: 'projektinfo',
					label: 'Projektinfo',
					enabled: false,
					click(event, window, content) {MainMenu.execute("viewswitcher", "projektinfo", event, window, content);},
				},
				{
					id: 'systeminfo',
					label: 'Systeminfo',
					enabled: false,
					click(event, window, content) {MainMenu.execute("viewswitcher", "systeminfo", event, window, content);},
				},
			]
		}
	]

	public static MENU: boolean = Config.getValue("global", "menu");

	public static getMainMenu(): Menu | null
	{
		if (MainMenu.MENU) return Menu.buildFromTemplate(MainMenu.template);
		return null;
	}

	private static execute(category: string, item: string, event: any, window: any, content: any)
	{
		window.webContents.send(category, item);
	}

	private static print(event: any, window: any, content: any)
	{
		const options = { landscape: true };
		window.webContents.print(options);
	}

	private static website(url: string, window: any)
	{
		var websiteWindow = new BrowserWindow(
		{
			height: 900,
			width: 1000,
			// tslint:disable-next-line: object-literal-sort-keys
			title: "hin&weg Website",
		});
		websiteWindow.loadURL(url);
		websiteWindow.setMenu(null);
	}

}

const ipc = require('electron').ipcMain;
ipc.on
(
	'menuenable', (event: any, message: string) =>
	{
		// @ts-ignore
		const menuitem = Menu.getApplicationMenu().getMenuItemById(message);
		if (menuitem) menuitem.enabled = true;
	}
)