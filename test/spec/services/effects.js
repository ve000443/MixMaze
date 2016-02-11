'use strict';

describe('Service: Effects', function () {

  // load the service's module
  beforeEach(module('frontEndApp'));

  // instantiate service
  var Effects;
  beforeEach(inject(function (_Effects_) {
    Effects = _Effects_;
  }));

  it('should do something', function () {
    expect(!!Effects).toBe(true);
  });

});
