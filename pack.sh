#!/bin/sh
VERSION=2.1.0
./clean.sh
./setup.sh
npm run build

# create installations
npx electron-packager --platform=darwin ./ --icon=assets/hinundweg_logo_2_32.icns
npx electron-packager --platform=win32,linux . --icon=assets/huw-logo_32

# cleanup and fix mac installation
rm -rf hin-und-weg-darwin-x64/hin-und-weg.app/Contents/Resources/app/.*
rm -rf hin-und-weg-darwin-x64/hin-und-weg.app/Contents/Resources/app/testdata/
mv hin-und-weg-darwin-x64/hin-und-weg.app/Contents/Resources/app/distdata hin-und-weg-darwin-x64/Beispieldaten
mv hin-und-weg-darwin-x64/hin-und-weg.app/Contents/Resources/app/offline hin-und-weg-darwin-x64/
# cleanup and fix win installation
rm -rf hin-und-weg-win32-x64/resources/app/.*
rm -rf hin-und-weg-win32-x64/resources/app/testdata/
mv hin-und-weg-win32-x64/resources/app/distdata hin-und-weg-win32-x64/Beispieldaten
mv hin-und-weg-win32-x64/resources/app/offline hin-und-weg-win32-x64/
cp -r hin-und-weg-win32-x64/resources/app/locales/ hin-und-weg-win32-x64/
# cleanup and fix linux installation
rm -rf hin-und-weg-linux-x64/resources/app/.*
rm -rf hin-und-weg-linux-x64/resources/app/testdata/
mv hin-und-weg-linux-x64/resources/app/distdata hin-und-weg-linux-x64/Beispieldaten
mv hin-und-weg-linux-x64/resources/app/offline hin-und-weg-linux-x64/
cp -r hin-und-weg-linux-x64/resources/app/locales/ hin-und-weg-linux-x64/

# package distributions
zip -r "hin&weg-$VERSION-linux.zip" hin-und-weg-linux-x64/
zip -r "hin&weg-$VERSION-windows.zip" hin-und-weg-win32-x64/
zip -r "hin&weg-$VERSION-mac.zip" hin-und-weg-darwin-x64/
