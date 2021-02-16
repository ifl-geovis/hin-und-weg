import { app, Menu, BrowserWindow } from "electron";
import Config from "./config";

export default class MainMenu
{

	private static template: Electron.MenuItemConstructorOptions[] =
	[
		{
			label: 'Anwendung',
			submenu:
			[
				{
					label: 'Projekt öffnen'
				},
				{
					label: 'Projekt speichern'
				},
				{
					label: 'Import'
				},
				{
					label: 'Export'
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
					label: 'Karte',
					//click(event, window, content) {MainMenu.execute("viewswitcher", "map", event, window, content);},
				},
				{
					label: 'Tabelle',
					//click(event, window, content) {MainMenu.execute("viewswitcher", "table", event, window, content);},
				},
				{
					label: 'Zeitreihen',
					//click(event, window, content) {MainMenu.execute("viewswitcher", "d3-timeline", event, window, content);},
				},
				{
					label: 'Diagramm',
					submenu:
					[
						{
							label: 'Chord',
							//click(event, window, content) {MainMenu.execute("viewswitcher", "d3-chord", event, window, content);},
						},
						{
							label: 'Sankey',
							//click(event, window, content) {MainMenu.execute("viewswitcher", "d3-sankey", event, window, content);},
						},
						{
							label: 'Balken',
							//click(event, window, content) {MainMenu.execute("viewswitcher", "d3-bar", event, window, content);},
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
					label: 'Statistiken',
					//click(event, window, content) {MainMenu.execute("viewswitcher", "statistics", event, window, content);},
				},
				{
					label: 'räumliche Aggregation',
					submenu:
					[
						{
							label: 'Flächen auswählen'
						},
						{
							label: 'Aggregation'
						},
						{
							label: 'Aggregation zurücknehmen'
						},
						{
							label: 'Aggregation als CSV exportieren'
						}
					]
				},
				{
					label: 'Datenbank',
					//click(event, window, content) {MainMenu.execute("viewswitcher", "db", event, window, content);}
				}
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
					label: 'Dokumentation'
				},
				{
					label: 'Tutorials'
				},
				{
					label: 'Kontexthilfe'
				},
				{
					type: 'separator'
				},
				{
					label: 'Projektinfo',
					//click(event, window, content) {MainMenu.execute("viewswitcher", "projektinfo", event, window, content);},
				},
				{
					label: 'Systeminfo',
					//click(event, window, content) {MainMenu.execute("viewswitcher", "systeminfo", event, window, content);},
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