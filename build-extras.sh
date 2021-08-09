#!/usr/bin/env sh
find src/ | grep '.css$' | sed 's/^/cp /' | sed 's/$/ dist/' | sh

# themes
sed 's/@theme@/luna-amber/g' index.html > dist/luna-amber.html
sed 's/@theme@/luna-blue/g' index.html > dist/luna-blue.html
sed 's/@theme@/luna-green/g' index.html > dist/luna-green.html
sed 's/@theme@/luna-pink/g' index.html > dist/luna-pink.html
sed 's/@theme@/nova-colored/g' index.html > dist/nova-colored.html
sed 's/@theme@/nova-dark/g' index.html > dist/nova-dark.html
sed 's/@theme@/nova-light/g' index.html > dist/nova-light.html
sed 's/@theme@/rhea/g' index.html > dist/rhea.html