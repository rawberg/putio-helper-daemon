#!/bin/sh

DEFAULT_WATCHDIR="$USER/Dropbox/torrents"
DEFAULT_DOWNLOADDIR="$USER/Videos"

if [ ! -d "config" ]; then
    mkdir config
    chown config $USER:$USER
fi

if [ ! -e "config/default.js" ]; then
  printf "module.exports = {
    watchDir: process.env.HOME + \"/Dropbox/torrents\",
    downloadDir: process.env.HOME + \"/Videos\",
    putioToken: \"\"\n}" > config/default.js
fi