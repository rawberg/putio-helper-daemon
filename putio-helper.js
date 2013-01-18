#!/usr/bin/env node

var DirectoryWatcher = require('directory-watcher'),
    util = require('util'),
    fs = require('fs'),
    wrench = require('wrench'),
    config = require('config'),
    FormData = require('form-data'),
    S = require('string');

var form;

function _onFileAdded(files) {

    files.forEach(function (file, index, files) {
        if(S(file).endsWith('.torrent')) {
            form = new FormData();
            form.append('file', fs.createReadStream(config.watchDir + '/' + file));
            form.submit({
                method: 'POST',
                protocol: 'https:',
                port: '443',
                hostname: 'api.put.io',
                path: '/v2/files/upload?oauth_token=' + config.putioToken
            }, function(err, res) {
                console.log('error');
                console.log(util.inspect(err));
            });
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
