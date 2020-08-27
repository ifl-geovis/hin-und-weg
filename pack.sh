#!/bin/sh
VERSION=1.4.1
./clean.sh
npm run build
electron-packager --platform=win32,darwin,linux .
rm -rf hin-und-weg-darwin-x64/hin-und-weg.app/Contents/Resources/app/.svn
rm -rf hin-und-weg-win32-x64/resources/app/.svn
rm -rf hin-und-weg-linux-x64/resources/app/.svn
zip -r "hin&weg-$VERSION-linux.zip" hin-und-weg-linux-x64/
zip -r "hin&weg-$VERSION-windows.zip" hin-und-weg-win32-x64/
zip -r "hin&weg-$VERSION-mac.zip" hin-und-weg-darwin-x64/
