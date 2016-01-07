'use strict';

/**
 * @ngdoc function
 * @name frontEndApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the frontEndApp
 */
angular.module('frontEndApp')
  .controller('UploadCtrl', function (FileUploader, $rootScope) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    this.uploader = new FileUploader();

    // FILTERS

    this.uploader.filters.push({
      name: 'customFilter',
      fn: function(item /*{File|FileLikeObject}*/, options) {
        return this.queue.length < 10;
      }
    });

    // CALLBACKS
    //
    //this.uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
    //  console.info('onWhenAddingFileFailed', item, filter, options);
    //};
    //this.uploader.onAfterAddingFile = function(fileItem) {
    //  console.info('onAfterAddingFile', fileItem);
    //};
    //this.uploader.onAfterAddingAll = function(addedFileItems) {
    //  console.info('onAfterAddingAll', addedFileItems);
    //};
    //this.uploader.onBeforeUploadItem = function(item) {
    //  console.info('onBeforeUploadItem', item);
    //};
    //this.uploader.onProgressItem = function(fileItem, progress) {
    //  console.info('onProgressItem', fileItem, progress);
    //};
    //this.uploader.onProgressAll = function(progress) {
    //  console.info('onProgressAll', progress);
    //};
    //this.uploader.onSuccessItem = function(fileItem, response, status, headers) {
    //  console.info('onSuccessItem', fileItem, response, status, headers);
    //};
    //this.uploader.onErrorItem = function(fileItem, response, status, headers) {
    //  console.info('onErrorItem', fileItem, response, status, headers);
    //};
    //this.uploader.onCancelItem = function(fileItem, response, status, headers) {
    //  console.info('onCancelItem', fileItem, response, status, headers);
    //};
    //this.uploader.onCompleteItem = function(fileItem, response, status, headers) {
    //  console.info('onCompleteItem', fileItem, response, status, headers);
    //};
    //this.uploader.onCompleteAll = function() {
    //  console.info('onCompleteAll');
    //};

    $rootScope.uploader = this.uploader;
  });
