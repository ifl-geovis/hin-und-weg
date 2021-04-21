import assert from "assert";
import fs from "fs";
import { Feature, FeatureCollection, GeoJsonProperties, Geometry } from "geojson";
import * as Proj4 from "proj4";
import R from "ramda";
import * as reproject from "reproject";
import * as shapefile from "shapefile";
import Log from "../log";

export default class Geodata {

	public static read(path: string, callback: (data: Geodata) => void, failure: (reason: any) => void) {
		Log.trace("Geodata.read:", path);
		let result = shapefile.read(path, path.replace(".shp", ".dbf"), { encoding: "UTF-8"});
		Log.trace("Geodata.read shapefile.read result:", result);
		result.then((data) => {
			Log.trace("Geodata.read result.then data:", data);
			let projection = fs.readFileSync(path.replace(".shp", ".prj")).toString();
			if (projection == null || projection === undefined) {
				projection = Proj4.WGS84;
			}
			Log.trace("Geodata.read result.then projection:", projection);
			callback(Geodata.createGeodata(data, projection));
		}, (reason) => {failure(reason);});
	}

	private static createGeodata = (features: FeatureCollection<Geometry>, projection: string | Proj4.ProjectionDefinition): Geodata => {
		return new Geodata(features, projection);
	}

	public projection: string | Proj4.ProjectionDefinition;
	protected featureCollection: FeatureCollection<Geometry>;

	constructor(featureCollection: FeatureCollection<Geometry>, projection: string|Proj4.ProjectionDefinition) {
		this.featureCollection = featureCollection;
		this.projection = projection;
	}

	public count(): number {
		return R.length(this.featureCollection.features)
	}

	public fields(): string[] {
		assert(R.not(R.isEmpty(this.featureCollection.features)), "data.features is empty");
		const first = R.head(this.featureCollection.features)!;
		return R.keys(first.properties) as string[];
	}

	public attributes(): GeoJsonProperties[] {
		return R.map((feature) => feature.properties, this.featureCollection.features)
	}

	public getFeatureCollection(): FeatureCollection {
		return this.featureCollection;
	}

	public getFeatures(): Array<Feature<Geometry, GeoJsonProperties>> {
		return this.getFeatureCollection().features;
	}

	public getGeometryOf(index: number): Geometry {
		return this.getFeatureOf(index).geometry;
	}

	public getFeatureOf(index: number): Feature {
		assert(this.featureCollection && this.featureCollection.features, "There has to be at least on feature");
		assert(index >= 0  && index < this.count(), "Index should be between 0 and " + this.count());
		return this.featureCollection.features[index];
	}

	public getValueFor(index: number, key: string): number| string| null {
		const props = this.getFeatureOf(index).properties;
		if (props && props[key]) {
			return props[key];
		}
		return null;
	}

	public getFeatureByFieldValue(fieldName: string, fieldValue: string|number): Feature {
		return R.find((feature: Feature) =>
				feature.properties![fieldName] === fieldValue,this.featureCollection.features)!;
	}

	public transformToWGS84(): Geodata {
		if (this.projection === Proj4.WGS84) {
			return this;
		}
		return new Geodata(reproject.reproject(this.featureCollection, this.projection, Proj4.WGS84), Proj4.WGS84);
	}
}
