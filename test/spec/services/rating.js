'use strict';

describe('Service: Rating', function () {

  // load the service's module
  beforeEach(module('frontEndApp'));

  // instantiate service
  var Rating;
  beforeEach(inject(function (_Rating_) {
    Rating = _Rating_;
  }));

  it('should do something', function () {
    expect(!!Rating).toBe(true);
  });

});
