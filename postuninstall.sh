#!/bin/sh

if [ -e "$HOME/Library/LaunchAgents/io.daemontools.putio-helper-daemon.plist" ]; then
    rm -f "$HOME/Library/LaunchAgents/io.daemontools.putio-helper-daemon.plist"
fi