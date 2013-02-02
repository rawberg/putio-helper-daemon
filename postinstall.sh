#!/bin/sh

DEFAULT_WATCHDIR="$HOME/Dropbox/torrents"
DEFAULT_DOWNLOADDIR="$HOME/Videos"
NPM_PATH=$(npm prefix -g)

if [ ! -d "config" ]; then
    mkdir config
fi

if [ ! -d "messages" ]; then
    mkdir messages
fi

if [ ! -e "config/default.js" ]; then
  printf "module.exports = {
    watchDir: \"$DEFAULT_WATCHDIR\",
    downloadDir: \"$DEFAULT_DOWNLOADDIR\",
    putioToken: \"\"\n}" > config/default.js
fi

if [ ! -e "$HOME/Library/LaunchAgents/io.daemontools.putio-helper-daemon.plist" ]; then
    printf '<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
        <dict>
            <key>Label</key>
            <string>io.daemontools.putio</string>
            <key>WorkingDirectory</key>
            <string>'$NPM_PATH'/lib/node_modules/putio-helper-daemon</string>
            <key>ProgramArguments</key>
            <array>
                <string>/usr/local/bin/node</string>
                <string>'$NPM_PATH'/bin/putio-helper-daemon</string>
            </array>
            <key>StartInterval</key>
            <integer>3600</integer>
            <key>KeepAlive</key>
            <true/>
            <key>RunAtLoad</key>
            <true/>
        </dict>
    </plist>' > "$HOME/Library/LaunchAgents/io.daemontools.putio-helper-daemon.plist"
else
    launchctl unload -w "$HOME/Library/LaunchAgents/io.daemontools.putio-helper-daemon.plist"
fi

launchctl load -w "$HOME/Library/LaunchAgents/io.daemontools.putio-helper-daemon.plist"