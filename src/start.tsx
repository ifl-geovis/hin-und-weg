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
			var newAccumulator =  value;
			return newAccumulator;
		} else if(stage == 2) {
			// for every line in the group
			if (isNaN(accumulator)) return value;
			if (isNaN(value)) return accumulator;
			accumulator = accumulator + value;
			return accumulator;
		} else if(stage == 3) {
			// Post production - please nota that value Will be undefined
			return accumulator;
		}
	}
	DB('CREATE DATABASE hin_und_weg');
	DB('USE hin_und_weg');
	DB('CREATE TABLE matrices (Nach STRING, Von STRING, Jahr STRING, Wert FLOAT);');
	DB('CREATE TABLE population (Area STRING, Jahr STRING, Wert FLOAT);');
	DB('CREATE INDEX matrices_index ON matrices(Jahr);');
	DB('CREATE INDEX population_index ON population(Jahr);');
	return DB;
}

Settings.load();

ReactDOM.render(<AppView db={setupDB()} />, document.getElementById('root'));
