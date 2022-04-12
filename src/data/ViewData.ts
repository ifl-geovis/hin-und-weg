import BaseData from './BaseData';

/**
	Represents the views of the Dashboard.
 */
export default class ViewData {

	private basedata: BaseData;

	private dashboards: string[] = [];

	constructor(basedata: BaseData) {
		this.basedata = basedata;
	}

	public setDashboardView(index: number, view: string) {
		this.dashboards[index] = view;
	}

	public getDashboardView(index: number): string {
		return this.dashboards[index];
	}

	public gatherViewData()
	{
		let results: any = {};
		results.dashboards = this.dashboards;
		return results;
	}

}