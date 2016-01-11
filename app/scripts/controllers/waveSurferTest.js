'use strict';


angular.module('frontEndApp')
  .controller('WaveSurferTestCtrl', function ($rootScope) {

    var vm = this;

    vm.listOfSound = [
      'cloud_beat.wav',
      'instru_stronger_than_me.mp3'
    ];
    vm.volume = 1;



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

    wavesurfer.load('instru_stronger_than_me.mp3');

    vm.playPause = function(){
      wavesurfer.playPause();
    };

    vm.stop = function(){
      wavesurfer.stop();
    };

    vm.updateVolume = function(){
      wavesurfer.setVolume(vm.volume);
    };
  });
