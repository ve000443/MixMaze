'use strict';

describe('Service: Persistence', function () {

  // load the service's module
  beforeEach(module('frontEndApp'));

  // instantiate service
  var Persistence;
  beforeEach(inject(function (_Persistence_) {
    Persistence = _Persistence_;
  }));

  it('should do something', function () {
    expect(!!Persistence).toBe(true);
  });

});
