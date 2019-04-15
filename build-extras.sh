#!/usr/bin/env sh
find src/ | grep '.css$' | sed 's/^/cp /' | sed 's/$/ dist/' | sh