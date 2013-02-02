#!/usr/local/bin/node

var DirectoryWatcher = require('directory-watcher'),
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    execFile = require('child_process').execFile,
    bunyan = require('bunyan'),
    wrench = require('wrench'),
    config = require('config'),
    FormData = require('form-data'),
    S = require('string');


var form;
var rootPath = path.dirname(__filename);

var osxNotifierPath = path.join(rootPath, '/node_modules/node-osx-notifier/osx/terminal-notifier-info.app/Contents/MacOS/terminal-notifier');
var outLogger = bunyan.createLogger({
    name: 'putio-helper',
    streams: [{
        level: 'info',
        path: rootPath + '/messages/out.log'
    }]
});

var devLogger = bunyan.createLogger({
    name: 'putio-helper',
    streams: [{
        level: 'debug',
        path: rootPath + '/messages/dev.log'
    }]
});

function _onFileUploaded(err, res) {
    res.setEncoding('utf8');
    var resChunks = '';
    if(err) {
        devLogger.error(err);
    } else {
        res.on('data', function(resData) {
            resChunks += resData;
        });

        res.on('end', function() {
            var resData;
            try {
                resData = JSON.parse(resChunks);
            } catch(e) {
                resData = {};
            }

            if(resData.transfer && resData.transfer.name) {
                outLogger.info('uploaded ' + resData.transfer.name + ' to Put.io');
                var notifyArgs = ["-title", "Put.io Helper", "-subtitle", "Added Torrent to Put.io", "-message", resData.transfer.name];
                execFile(osxNotifierPath, notifyArgs, function(err, stdout) {
                    if(err) {
                        devLogger.error(err);
                    }
                });
            }
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
            devLogger.error('error (' + err + ') creating directory: ' + watchDir + ' (exiting)');
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
