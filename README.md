Put.io Helper Daemom
====================

Nodejs daemon for watching a directory and automagically uploading torrent files to Put.io for cloud torrenting.


### Status - (OSX Only) Ready for Hacking
I'm currently using this everyday to handle automatic uploads from OSX to Put.io. I'd like to add support for automatically downloading files as well. It's currently OSX only because it uses Mountain Lion notifications and installs a Launchd script. Also file paths use forward slashes. It should be trivial to add support for Linux and other platforms. I'll accept pull requests as long as they include tests.

### Install (OSX)
    git clone git@github.com:rawberg/putio-helper-daemon.git putio-helper-daemon
    cd putio-helper-daemon
    sudo npm install -g
    
### Tests
- written with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js/)/[Chai](http://chaijs.com/)
- run them from the root directory via `make test`

### License
[GPL 3.0](http://opensource.org/licenses/GPL-3.0)
