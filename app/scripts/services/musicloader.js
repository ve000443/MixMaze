'use strict';

/**
 * @ngdoc service
 * @name frontEndApp.MusicLoader
 * @description
 * # MusicLoader
 * Service in the frontEndApp.
 */
angular.module('frontEndApp')
  .service('MusicLoader', function ($rootScope, $http) {
    $rootScope.bufferLoader = undefined;
    $rootScope.ctx = undefined;

    this.loadMusics = function(){
      $http.get($rootScope.endpoint + "/musics").then(
        function successCallback(response) {
          $rootScope.musics = response.data;
          $rootScope.musics.forEach(function (o) {
          });

        }, function errorCallback(response) {
          console.error(response);
        }
      );
    };

    $rootScope.loadSamples = function() {
      var audioContext = window.AudioContext || window.webkitAudioContext;

      $rootScope.ctx = new audioContext();

      $rootScope.loadAllSoundSamples();
    };

    $rootScope.loadRemoteSamples = function (selectedMusic) {
      $rootScope.stopAllTracks();
      $rootScope.initVar();

      $http.get($rootScope.endpoint + "/musics/" + selectedMusic).then(
        function successCallback(response) {
          $rootScope.songName = selectedMusic;

          $rootScope.pistes = response.data.musicFiles;
          $rootScope.parseStorage();
          $rootScope.pistes.forEach(function (p) {
            $rootScope.listOfSound.push("http://xythe.xyz/mixmaze" + response.data.musicPath + "/" + p);
          });

          $rootScope.loadSamples();
        }, function errorCallback(response) {
          console.error(response);
        });
    };

    $rootScope.loadAllSoundSamples = function() {
      $rootScope.bufferLoader = new BufferLoader(
        $rootScope.ctx,
        $rootScope.listOfSound
      );

      $rootScope.bufferLoader.load();
    };

    var BufferLoader = function(context, urlList) {
      this.context = context;
      this.urlList = urlList;
      this.bufferList = [];
      this.loadCount = 0;
    };

    BufferLoader.prototype.loadBuffer = function (url, index) {
      // Load buffer asynchronously
      console.log('file : ' + url + " loading and decoding");

      var request = new XMLHttpRequest();
      request.open("GET", url, true);

      request.responseType = "arraybuffer";

      var loader = this;

      request.onload = function () {

        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
          request.response,
          function (buffer) {
            $rootScope.decode += 1;
            $rootScope.$digest();
            console.log("Loaded and decoded track " + (loader.loadCount + 1) +
              "/" + loader.urlList.length + "...");

            if (!buffer) {
              alert('error decoding file data: ' + url);
              return;
            }
            loader.bufferList[index] = buffer;

            if (++loader.loadCount == loader.urlList.length)
              $rootScope.initWaves();

          },
          function (error) {
            console.error('decodeAudioData error', error);
          }
        );
      };

      request.onprogress = function (e) {
        if (e.total !== 0) {
          var percent = (e.loaded * 100) / e.total;
          if (percent === 100) {
            $rootScope.download += 1;
            $rootScope.$digest();
          }
          console.log("loaded " + percent + " % of file " + index);
        }
      };

      request.onerror = function () {
        alert('BufferLoader: XHR error');
      };

      request.send();
    };

    BufferLoader.prototype.load = function () {
      console.log("Loading " + this.urlList.length + "track(s)... please wait...");
      $rootScope.nbTrack = this.urlList.length;
      for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
    };
  });
