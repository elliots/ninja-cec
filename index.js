var util = require('util'),
  stream = require('stream'),
  spawn = require('child_process').spawn,
  fs = require('fs'),
  _ = require('underscore'),
  byline = require('byline');

util.inherits(CECClientDriver,stream);
util.inherits(CECClientDevice,stream);

//console.log('CEC Driver firing up!');

function CECClientDriver(opts,app) {

  var self = this;

  app.on('client::up',function(){
    self.emit('register', new CECClientDevice());
  });

}

function CECClientDevice() {

  var self = this;

  this.writeable = true;
  this.readable = true;
  this.V = 0;
  this.D = 14;
  this.G = 0;

  this._cec = spawn('cec-client');

  var parsers = {
    press : /key pressed: ([^(]+) \(/,
    release : /key released: ([^(]+) \(/
  };

  byline(this._cec.stdout).on('data', function(line) {
    //console.log('CEC >> ' + line);

    for (var event in parsers) {
      var match = line.match(parsers[event]);
      if (match) {
        var data = match[1] + '-' + event;
        self.emit('data', data);
      }
    }

  });

}

CECClientDevice.prototype.write = function(data) {
  // This doesn't work yet! Need to fix it....
  this._cec.stdin.write(data + "\n");
};


module.exports = CECClientDriver;
