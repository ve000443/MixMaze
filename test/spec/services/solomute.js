'use strict';

describe('Service: SoloMute', function () {

  // load the service's module
  beforeEach(module('frontEndApp'));

  // instantiate service
  var SoloMute;
  beforeEach(inject(function (_SoloMute_) {
    SoloMute = _SoloMute_;
  }));

  it('should do something', function () {
    expect(!!SoloMute).toBe(true);
  });

});
