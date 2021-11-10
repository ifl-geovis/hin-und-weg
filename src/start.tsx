import alasql from 'alasql';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import AppView from './view/App';
import Settings from './settings';

function setupDB() {
	const DB = alasql;
	// for #4863 using https://github.com/agershun/alasql/wiki/User-Defined-Functions
	DB.aggr.MYSUM = function(value, accumulator, stage) {
		if(stage == 1) {
			// first call of aggregator - for first line
			let newAccumulator = value;
			return newAccumulator;
		} else if(stage == 2) {
			// for every line in the group
			if (isNaN(accumulator)) return value;
			if (isNaN(value)) return accumulator;
			accumulator = accumulator + value;
			return accumulator;
		} else if(stage == 3) {
			// Post production - please note that value will be undefined
			return accumulator;
		}
	}
	// for #6344 using https://github.com/agershun/alasql/wiki/User-Defined-Functions
	DB.aggr.MYAVG = function(value, series, stage) {
		if(stage == 1) {
			// first call of aggregator - for first line
			let newSeries = [];
			if (!isNaN(value)) newSeries.push(value);
			return newSeries;
		} else if(stage == 2) {
			// for every line in the group
			if (!isNaN(value)) series.push(value);
			return series;
		} else if(stage == 3) {
			// Post production - please note that value will be undefined
			if ((typeof series == 'undefined') || (series.length === 0)) return Number.NaN;
			let sum = 0;
			for (let val of series) sum += val;
			return sum / series.length;
		}
	}
	DB('CREATE DATABASE hin_und_weg');
	DB('USE hin_und_weg');
	DB('CREATE TABLE matrices (Nach STRING, Von STRING, Jahr STRING, Wert FLOAT, RateVon FLOAT, RateNach FLOAT);');
	DB('CREATE TABLE population (Area STRING, Jahr STRING, Wert FLOAT);');
	DB('CREATE INDEX matrices_index ON matrices(Jahr);');
	DB('CREATE INDEX population_index ON population(Jahr);');
	return DB;
}

Settings.load();

ReactDOM.render(<AppView db={setupDB()} />, document.getElementById('root'));
