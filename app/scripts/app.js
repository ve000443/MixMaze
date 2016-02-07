'use strict';

/**
 * @ngdoc overview
 * @name frontEndApp
 * @description
 * # frontEndApp
 *
 * Main module of the application.
 */
angular
  .module('frontEndApp', [
    'ngAnimate',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/home', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl',
        controllerAs: 'home'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/loadSong', {
        templateUrl: 'views/loadSong.html',
        controller: 'LoadSongCtrl',
        controllerAs: 'loadSong'
      })
      .when('/upload', {
        templateUrl: 'views/upload.html',
        controller: 'UploadCtrl',
        controllerAs: 'upload'
      })
      .when('/waveSurferTest', {
        templateUrl: 'views/wavesurfertest.html',
        controller: 'WaveSurferTestCtrl',
        controllerAs: 'waveSurferTest'
      })
      .when('/', {
        templateUrl: 'views/arrangement.html',
        controller: 'ArrangementCtrl',
        controllerAs: 'arrangement'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
