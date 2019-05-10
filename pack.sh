#!/bin/sh
VERSION=1.0.0
electron-packager --platform=win32,darwin,linux .
zip -r "hin&weg-linux-$VERSION.zip" hin-und-weg-linux-x64/
zip -r "hin&weg-windows-$VERSION.zip" hin-und-weg-win32-x64/
zip -r "hin&weg-mac-$VERSION.zip" hin-und-weg-darwin-x64/