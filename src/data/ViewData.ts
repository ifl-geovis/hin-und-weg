import BaseData from './BaseData';

/**
	Represents the views of the Dashboard.
 */
export default class ViewData {

	private basedata: BaseData;

	private dashboards: string[] = [];
	private showCenter: string = '1';
	private showMap: boolean = true;

	constructor(basedata: BaseData) {
		this.basedata = basedata;
	}

	public setDashboardView(index: number, view: string) {
		this.dashboards[index] = view;
	}

	public getDashboardView(index: number): string {
		return this.dashboards[index];
	}

	public setShowCenter(showCenter: string) {
		this.showCenter = showCenter;
	}

	public getShowCenter(): string {
		return this.showCenter;
	}

	public setShowMap(showMap: boolean) {
		this.showMap = showMap;
	}

	public getShowMap(): boolean {
		return this.showMap;
	}

	public gatherViewData()
	{
		let results: any = {};
		results.dashboards = this.dashboards;
		results.showCenter = this.showCenter;
		results.showMap = this.showMap;
		return results;
	}

	public restoreViewData(data: any)
	{
		if (!data) return;
		this.dashboards = data.dashboards;
		this.showCenter = data.showCenter;
		this.showMap = data.showMap;
	}

}