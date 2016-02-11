'use strict';

describe('Service: MusicLoader', function () {

  // load the service's module
  beforeEach(module('frontEndApp'));

  // instantiate service
  var MusicLoader;
  beforeEach(inject(function (_MusicLoader_) {
    MusicLoader = _MusicLoader_;
  }));

  it('should do something', function () {
    expect(!!MusicLoader).toBe(true);
  });

});
