#!/bin/sh
VERSION=1.5.3
./clean.sh
npm run build
# create installations
electron-packager --platform=win32,darwin,linux .
# cleanup mac installation
rm -rf hin-und-weg-darwin-x64/hin-und-weg.app/Contents/Resources/app/.*
rm -rf hin-und-weg-darwin-x64/hin-und-weg.app/Contents/Resources/app/testdata/testdata-old/
mv hin-und-weg-darwin-x64/hin-und-weg.app/Contents/Resources/app/testdata hin-und-weg-darwin-x64/
mv hin-und-weg-darwin-x64/hin-und-weg.app/Contents/Resources/app/offline hin-und-weg-darwin-x64/
# cleanup win installation
rm -rf hin-und-weg-win32-x64/resources/app/.*
rm -rf hin-und-weg-win32-x64/resources/app/testdata/testdata-old/
mv hin-und-weg-win32-x64/resources/app/testdata hin-und-weg-win32-x64/
mv hin-und-weg-win32-x64/resources/app/offline hin-und-weg-win32-x64/
# cleanup linux installation
rm -rf hin-und-weg-linux-x64/resources/app/.*
rm -rf hin-und-weg-linux-x64/resources/app/testdata/testdata-old/
mv hin-und-weg-linux-x64/resources/app/testdata hin-und-weg-linux-x64/
mv hin-und-weg-linux-x64/resources/app/offline hin-und-weg-linux-x64/
# package distributions
zip -r "hin&weg-$VERSION-linux.zip" hin-und-weg-linux-x64/
zip -r "hin&weg-$VERSION-windows.zip" hin-und-weg-win32-x64/
zip -r "hin&weg-$VERSION-mac.zip" hin-und-weg-darwin-x64/
