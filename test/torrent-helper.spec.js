#!/usr/bin/env node

var should = require('should'),
    util = require('util'),
    wrench = require('wrench'),
    fs = require('fs'),
    config = require('config'),
    sinon = require('sinon'),
    rewire = require('rewire'),
    fork = require('child_process').fork,
    exec = require('child_process').exec;


describe('Torrent Helper Specs\n', function() {

    describe('PutioHelper', function() {

        describe('starting with the default "watch" directory', function() {

            var testBasePath = '/tmp/Dropbox';
            var testDefaultPath = testBasePath + '/torrents';
            var thProcess;
            before(function(done) {
                if(fs.existsSync(testDefaultPath)) {
                    wrench.rmdirSyncRecursive(testDefaultPath);
                }
                thProcess = fork('./torrent-helper.js', [], {silent: false, env: {'HOME': '/tmp'}});
                thProcess.on('message', function(msg) {
                    if(msg == 'started') {
                        done();
                    }
                })
            });

            it('should create the default watch directory if it doesn\'t already exist', function() {
                fs.existsSync(testDefaultPath).should.be.true;
            });

            after(function(done) {
                if(fs.existsSync(testBasePath)) {
                    wrench.rmdirSyncRecursive(testBasePath);
                }
                thProcess.kill();
                fs.unlinkSync('config/runtime.json');
                done();
            });
        });

        describe('starting with a custom specified "watch" directory', function() {

            var testCustomPath = '/tmp/custom-test-dir';
            var torrentHelper, thProcess;
            before(function(done) {
                if(fs.existsSync(testCustomPath)) {
                    wrench.rmdirSyncRecursive(testCustomPath);
                }

                torrentHelper = rewire('torrent-helper');
                torrentHelper.__set__('config.watchDir', testCustomPath);
                thProcess = torrentHelper.StartTorrentHelper();
                done();
            });

            it('should create the custom watch directory if it doesn\'t already exist', function() {
                fs.existsSync(testCustomPath).should.be.true;
            });

            after(function(done) {
                if(fs.existsSync(testCustomPath)) {
                    wrench.rmdirSyncRecursive(testCustomPath);
                }
                fs.unlinkSync('config/runtime.json');
                done();
            });
        });

        describe('_onFileAdded', function() {

            var testCustomPath = '/tmp/test-on-file-added-dir';
            var sampleFileName = 'sample-file.txt';
            var sampleFilePath = testCustomPath + '/' + sampleFileName;
            var torrentHelper, thProcess, execChild;
            before(function(done) {
                if(fs.existsSync(testCustomPath)) {
                    wrench.rmdirSyncRecursive(testCustomPath);
                }

                torrentHelper = rewire('torrent-helper');
                torrentHelper.__set__('config.watchDir', testCustomPath);
                torrentHelper.__set__('_onFileAdded', sinon.spy());
                thProcess = torrentHelper.StartTorrentHelper();
                done();
            });

            it('should be called when a file is added to the watchDir', function(done) {
                execChild = exec('touch ' + sampleFilePath,
                    function (error, stdout, stderr) {
                        if (error == null) {
                            torrentHelper.__get__('_onFileAdded').calledOnce.should.be.true;
                            torrentHelper.__get__('_onFileAdded').calledWith([sampleFileName]).should.be.true;
                            done();
                        } else {
                            done(new Error('unable to create test file'));
                        }
                    }
                );
            });

            after(function(done) {
                if(fs.existsSync(testCustomPath)) {
                    wrench.rmdirSyncRecursive(testCustomPath);
                }
                fs.unlinkSync('config/runtime.json');
                execChild.kill();
                done();
            });
        });

    });
});