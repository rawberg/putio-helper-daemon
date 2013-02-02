Put.io Helper Daemon
====================

Nodejs daemon for watching a directory and automagically uploading torrent files to Put.io for cloud torrenting.


### Status - (OSX Only) Ready for Hacking
I'm currently using this everyday to handle automatic uploads from OSX to Put.io. I'd like to add support for automatically downloading files as well. It's currently OSX only because it uses Mountain Lion notifications and installs a Launchd script. Also file paths use forward slashes. It should be trivial to add support for Linux and other platforms. I'll accept pull requests as long as they include tests.

### Install (OSX)
    git clone git@github.com:rawberg/putio-helper-daemon.git putio-helper-daemon
    cd putio-helper-daemon
    npm install -g
    vi /usr/local/share/npm/lib/node_modules/putio-helper-daemon/config/default.js (add your oauth token)

### Install Notes
- don't forget to add your [Put.io oauth token](https://api.put.io/v2/docs/#obtain-access-token) to the default.js config file (see last step of install).
- eventually I'd like the post install script to handle obtaining the oauth token

### Tests
- written with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js/)/[Chai](http://chaijs.com/)
- run them from the root directory via `make test`

### License
[GPL 3.0](http://opensource.org/licenses/GPL-3.0)
