'use strict';


angular.module('frontEndApp')
  .controller('WaveSurferTestCtrl', function ($rootScope) {

    var vm = this;

    var wavesurfer = WaveSurfer.create({
      container: '#wave',
      waveColor: 'grey',
      progressColor: 'black'
    });

    /*wavesurfer.init({
      container: document.querySelector('#wave'),
      backend: 'MediaElement'
    });

    document.querySelector('#slider').oninput = function () {
      wavesurfer.zoom(Number(this.value));
    };*/

    wavesurfer.on('ready', function () {
      console.log("song ready");
    });

    wavesurfer.load('cloud_beat.wav');

    vm.playPause = function(){
      wavesurfer.playPause();
    }
  });
