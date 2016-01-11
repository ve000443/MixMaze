'use strict';


angular.module('frontEndApp')
  .controller('WaveSurferTestCtrl', function ($rootScope) {

    var wavesurfer = WaveSurfer.create({
      container: '#wave',
      waveColor: 'violet',
      progressColor: 'purple'
    });

    wavesurfer.on('ready', function () {
      wavesurfer.play();
    });

    wavesurfer.load('cloud_beat.wav');
  });
