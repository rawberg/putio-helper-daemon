#!/usr/bin/env node

var DirectoryWatcher = require('directory-watcher'),
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    execFile = require('child_process').execFile,
    wrench = require('wrench'),
    config = require('config'),
    FormData = require('form-data'),
    S = require('string');

var form;
var rootPath = path.dirname(__filename);
var osxNotifierPath = path.join(rootPath, '/node_modules/node-osx-notifier/osx/terminal-notifier-info.app/Contents/MacOS/terminal-notifier');

function _onFileUploaded(err, res) {
    res.setEncoding('utf8');
    if(err) {
        console.log(err);
    } else {
        res.on('data', function(resData) {
            var notifyArgs = ["-title", "Put.io Helper", "-subtitle", "Added Torrent to Put.io", "-message", resData.transfer.name];
            execFile(osxNotifierPath, notifyArgs, function(error, stdout) {
                if(error) {
                    console.log(error);
                }
            });
        });
    }
};

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
            }, _onFileUploaded);
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
