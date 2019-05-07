#!/usr/bin/env sh
npm install
cp -r extra/types/*  node_modules/@types/
cp extra/amcharts/charts.js node_modules/@amcharts/
cp extra/amcharts/core.js node_modules/@amcharts/
cp extra/amcharts/animated.js node_modules/@amcharts/
