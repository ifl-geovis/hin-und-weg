#!/bin/sh
VERSION=1.3.2
./clean.sh
npm run build
electron-packager --platform=win32,darwin,linux .
zip -r "hin&weg-$VERSION-linux.zip" hin-und-weg-linux-x64/
zip -r "hin&weg-$VERSION-windows.zip" hin-und-weg-win32-x64/
zip -r "hin&weg-$VERSION-mac.zip" hin-und-weg-darwin-x64/
