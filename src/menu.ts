import { app, Menu, BrowserWindow } from "electron";

import Config from "./config";
import Log from './log';

import { TFunction } from "i18next";
import i18nConfig from "./i18n/i18nConfig";

export default class MainMenu
{

	public static MENU: boolean = Config.getValue("global", "menu");

	private static  menuTemplate = (i18n:any) => {
		let template : Electron.MenuItemConstructorOptions[] = [];
		template.push
		({
			label: i18n.t('menu.file'),
			submenu:
			[
				{
					label: i18n.t('menu.open'),
					click(event, window, content) {MainMenu.execute("project-open", "project-open", event, window, content);},
				},
				{
					label: i18n.t('menu.save'),
					click(event, window, content) {MainMenu.execute("project-save", "project-save", event, window, content);},
				},
				{
					label: i18n.t('menu.import'),
					enabled: false,
				},
				{
					label: i18n.t('menu.export'),
					submenu:
					[
						{
							id: 'export-png',
							label: i18n.t('menu.png'),
							click(event, window, content) {MainMenu.execute("export-image", "png", event, window, content);},
						},
						{
							id: 'export-jpeg',
							label: i18n.t('menu.jpeg'),
							click(event, window, content) {MainMenu.execute("export-image", "jpeg", event, window, content);},
						},
					]
				},
				{
					type: 'separator'
				},
				{
					label: i18n.t('menu.zoomIn'),
					accelerator: (process.platform === 'darwin') ? 'CommandOrControl+Plus' : 'CommandOrControl+L',
					role: 'zoomIn'
				},
				{
					label: i18n.t('menu.zoomOut'),
					role: 'zoomOut'
				},
				{
					label: i18n.t('menu.zoomReset'),
					role: 'resetZoom'
				},
				{
					type: 'separator'
				},
				{
					label: i18n.t('menu.print'),
					click(event, window, content) {MainMenu.print(event, window, content);}
				},
				{
					type: 'separator'
				},
				{
					label: i18n.t('menu.quit'),
					role: 'quit'
				}
			]
		},
		{
			// label: 'Ansichten',
			label: i18n.t('menu.views'),
			submenu:
			[
				{
					// label: 'Einzelansicht',
					label: i18n.t('menu.singleView'),
					click(event, window, content) {MainMenu.execute("dashboard", "s1", event, window, content);}
				},
				{
					// label: 'oben 1 unten 1',
					label: i18n.t('menu.1up1down'),
					click(event, window, content) {MainMenu.execute("dashboard", "t1b1", event, window, content);}
				},
				{
					// label: 'links 1 rechts 1',
					label: i18n.t('menu.1left1right'),
					click(event, window, content) {MainMenu.execute("dashboard", "l1r1", event, window, content);}
				},
				{
					// label: 'oben 1 unten 2',
					label: i18n.t('menu.1up2down'),
					click(event, window, content) {MainMenu.execute("dashboard", "t1b2", event, window, content);}
				},
				{
					// label: 'oben 2 unten 1',
					label: i18n.t('menu.2up1down'),
					click(event, window, content) {MainMenu.execute("dashboard", "t2b1", event, window, content);}
				},
				{
					// label: 'links 1 rechts 2',
					label: i18n.t('menu.1left2right'),
					click(event, window, content) {MainMenu.execute("dashboard", "l1r2", event, window, content);}
				},
				{
					// label: '3× vertikal',
					label: i18n.t('menu.3vertical'),
					click(event, window, content) {MainMenu.execute("dashboard", "v3", event, window, content);}
				},
				{
					// label: 'Viertel',
					label: i18n.t('menu.4Views'),
					click(event, window, content) {MainMenu.execute("dashboard", "l2r2", event, window, content);}
				},
				{
					// label: 'Vergleich',
					label: i18n.t('menu.comparison'),
					click(event, window, content) {MainMenu.execute("dashboard", "cls1rs1", event, window, content);}
				},
			]
		},
		{
			// label: 'Visualisierungen',
			label: i18n.t('menu.visualizations'),
			submenu:
			[
				{
					id: 'map',
					// label: 'Karte',
					label: i18n.t('menu.map'),
					enabled: false,
					click(event, window, content) {MainMenu.execute("viewswitcher", "map", event, window, content);},
				},
				{
					id: 'table',
					// label: 'Tabelle',
					label: i18n.t('menu.table'),
					enabled: false,
					click(event, window, content) {MainMenu.execute("viewswitcher", "table", event, window, content);},
				},
				{
					id: 'd3-timeline',
					// label: 'Zeitreihen',
					label: i18n.t('menu.timeline'),
					enabled: false,
					click(event, window, content) {MainMenu.execute("viewswitcher", "d3-timeline", event, window, content);},
				},
				{
					// label: 'Diagramm',
					label: i18n.t('menu.diagrams'),
					submenu:
					[
						{
							id: 'd3-chord',
							// label: 'Chord',
							label: i18n.t('menu.chord'),
							enabled: false,
							click(event, window, content) {MainMenu.execute("viewswitcher", "d3-chord", event, window, content);},
						},
						{
							id: 'd3-sankey',
							// label: 'Sankey',
							label: i18n.t('menu.sankey'),
							enabled: false,
							click(event, window, content) {MainMenu.execute("viewswitcher", "d3-sankey", event, window, content);},
						},
						{
							id: 'd3-bar',
							// label: 'Balken',
							label: i18n.t('menu.barchart'),
							enabled: false,
							click(event, window, content) {MainMenu.execute("viewswitcher", "d3-bar", event, window, content);},
						},
					]
				}
			]
		},
		{
			// label: 'Analysen',
			label: i18n.t('menu.analysis'),
			submenu:
			[
				{
					id: 'statistics',
					// label: 'Statistiken',
					label: i18n.t('menu.statistics'),
					enabled: false,
					click(event, window, content) {MainMenu.execute("viewswitcher", "statistics", event, window, content);},
				},
				{
					id: 'index',
					// label: 'Indexwert',
					label: i18n.t('menu.indexVal'),
					enabled: false,
					click(event, window, content) {MainMenu.execute("viewswitcher", "index", event, window, content);},
				},
			]
		},
		{
			label: i18n.t('menu.languages'),
			// label:'Sprachen',
			submenu:
			[
				{
					// label: 'Deutsch',
					label: i18n.t('menu.german'),
					type: 'radio',
					checked: i18n.language === 'de',
					click: () => {
						Log.debug("DEUTSCH!!!!");
						i18n.changeLanguage('de');
					}
				},
				{
					label: i18n.t('menu.english'),
					// label: 'English',
					type: 'radio',
					checked: i18n.language === 'en',
					click: () => {
						Log.debug("ENGLISH!!!!");
						i18n.changeLanguage('en');
					}
				}
			]
		},
		{
			// label: 'Einstellungen',
			label: i18n.t('menu.settings'),
			submenu:
			[
				{
					// label: 'Einstellungen',
					label: i18n.t('menu.settings'),
					click(event, window, content) {
						MainMenu.execute("dashboard", "s1", event, window, content);
						MainMenu.execute("viewswitcher", "settings", event, window, content);
					},
				},
			],
		},
		{
			// label: 'Hilfe',
			label: i18n.t('menu.help'),
			submenu:
			[
				{
					// label: 'hin&&weg Webseite',
					label: i18n.t('menu.website'),
					click(event, window, content) {MainMenu.website("https://hin-und-weg.online/", window);}
				},
				{
					// label: 'Dokumentation',
					label: i18n.t('menu.doc'),
					enabled: false,
				},
				{
					// label: 'Tutorials',
					label: i18n.t('menu.tutorials'),
					enabled: false,
				},
				{
					// label: 'Kontexthilfe',
					label: i18n.t('menu.contextHelp'),
					enabled: false,
				},
				{
					type: 'separator'
				},
				{
					id: 'projektinfo',
					// label: 'Projektinfo',
					label: i18n.t('menu.projectInfo'),
					enabled: false,
					click(event, window, content) {MainMenu.execute("viewswitcher", "projektinfo", event, window, content);},
				},
				{
					id: 'systeminfo',
					// label: 'Systeminfo',
					label: i18n.t('menu.systemInfo'),
					enabled: false,
					click(event, window, content) {MainMenu.execute("viewswitcher", "systeminfo", event, window, content);},
				},
			]
		});
		return template;
	};

	public static getMainMenu(i18n: any): Menu | null
	{
		if (MainMenu.MENU) return Menu.buildFromTemplate(MainMenu.menuTemplate(i18n));
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

if (MainMenu.MENU) {
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
}