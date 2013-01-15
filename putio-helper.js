#!/usr/bin/env node

var DirectoryWatcher = require('directory-watcher'),
    util = require('util'),
    fs = require('fs'),
    wrench = require('wrench'),
    config = require('config');


function _onFileAdded(files) {
    files.forEach(function (file, index, files) {
        if(file.endsWith('.torrent')) {
            console.log('valid torrent filed %s added \n', file);
        }
    });
}

var StartTorrentHelper = function() {
    var watchDir = config.watchDir;

    if(!fs.existsSync(watchDir)) {
        try {
            wrench.mkdirSyncRecursive(watchDir, 0755);
        } catch(err) {
            console.log('error (' + err + ') creating directory: ' + watchDir + ' (exiting)');
            process.exit();
        }
    }

    DirectoryWatcher.create(watchDir, function(err, watcher) {
        watcher.on('added', _onFileAdded);
    });

    return process;
}

module.exports.StartTorrentHelper = StartTorrentHelper;

if (require.main === module) {
    StartTorrentHelper();
    if(process.send) {
        process.send('started');
    }
}
