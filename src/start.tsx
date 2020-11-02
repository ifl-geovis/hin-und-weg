import alasql from 'alasql';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import AppView from './view/App';
import Settings from './settings';

function setupDB() {
	const DB = alasql;
	DB('CREATE DATABASE hin_und_weg');
	DB('USE hin_und_weg');
	DB('CREATE TABLE matrices (Nach STRING,Von STRING ,Jahr STRING ,Wert FLOAT);');
	return DB;
}

Settings.load();

ReactDOM.render(<AppView db={setupDB()} />, document.getElementById('root'));
