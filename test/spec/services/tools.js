'use strict';

describe('Service: Tools', function () {

  // load the service's module
  beforeEach(module('frontEndApp'));

  // instantiate service
  var Tools;
  beforeEach(inject(function (_Tools_) {
    Tools = _Tools_;
  }));

  it('should do something', function () {
    expect(!!Tools).toBe(true);
  });

});
