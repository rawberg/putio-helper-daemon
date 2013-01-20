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
                thProcess = fork('./putio-helper.js', [], {silent: false, env: {'HOME': '/tmp'}});
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

                torrentHelper = rewire('putio-helper');
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

        describe('adding a new file to the watch directory', function() {
            var testCustomPath = '/tmp/test-on-file-added-dir';
            var sampleFileName = 'sample-file.torrent';
            var sampleFilePath = testCustomPath + '/' + sampleFileName;
            var torrentHelper, thProcess, execChild, formSubmitStub, fakeResponse;

            before(function(done) {
                if(fs.existsSync(testCustomPath)) {
                    wrench.rmdirSyncRecursive(testCustomPath);
                }

                torrentHelper = rewire('putio-helper');

                fakeResponse = {
                    encoding: 'utf8',
                    headers: {
                        server: 'nginx',
                        'content-type': 'application/json',
                        'content-length': '712',
                        connection: 'keep-alive',
                        'keep-alive': 'timeout=60',
                        status: '200 OK',
                        srv: 'api'
                    }
                };

                fakeResponse.setEncoding = sinon.stub();
                fakeResponse.on = sinon.stub();
                fakeResponse.on.yieldsOn(fakeResponse, {
                    "status": "OK",
                    "transfer": {
                        "uploaded": 0,
                        "status_message": "In queue",
                        "status": "IN_QUEUE",
                        "name": sampleFileName
                    }
                });

                formSubmitStub = sinon.stub();
                formSubmitStub.callsArgWith(1, null, fakeResponse);

                torrentHelper.__set__('FormData.prototype.submit', formSubmitStub);
                torrentHelper.__set__('config.watchDir', testCustomPath);

                torrentHelper.__set__('_onFileAdded', sinon.spy(torrentHelper.__get__('_onFileAdded')));
                torrentHelper.__set__('_onFileUploaded', sinon.spy(torrentHelper.__get__('_onFileUploaded')));
                torrentHelper.__set__('execFile', sinon.spy());
                thProcess = torrentHelper.StartTorrentHelper();

                execChild = exec('touch ' + sampleFilePath,
                    function (error, stdout, stderr) {
                        if (error == null) {
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

            describe('_onFileAdded', function() {
                it('should be called when a file is added to the watchDir', function(done) {
                    torrentHelper.__get__('_onFileAdded').calledOnce.should.be.true;
                    torrentHelper.__get__('_onFileAdded').calledWith([sampleFileName]).should.be.true;
                    done();
                });

                it('should call FormData.submit to post the file to Put.io', function(done) {
                    torrentHelper.__get__('form.submit').calledOnce.should.be.true;
                    done();
                });
            });

            describe('_onFileUploaded', function() {
                it('should call osx notifier with the message set to the newly added file name', function(done) {
                    torrentHelper.__get__('_onFileUploaded').calledOnce.should.be.true;
                    torrentHelper.__get__('execFile').calledOnce.should.be.true;

                    var execFileSpy = torrentHelper.__get__('execFile');
                    var lastNotifierArg = execFileSpy.lastCall.args[1].length - 1;
                    execFileSpy.lastCall.args[1][lastNotifierArg].should.eql(sampleFileName);
                    done();
                });
            });

        });

    });
});