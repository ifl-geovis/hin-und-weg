#!/usr/bin/env sh
npm clean-install
cp -r extra/types/*  node_modules/@types/
cp -r extra/react-i18next/*  node_modules/react-i18next/
