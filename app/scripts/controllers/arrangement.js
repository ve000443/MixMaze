'use strict';


angular.module('frontEndApp')
  .controller('ArrangementCtrl', function ($timeout) {

    var vm = this;

    vm.listOfSound = [
      'tracks/synth.mp3',
      'tracks/vocal.mp3',
      'tracks/drums.mp3'
    ];

    vm.listOfWaves = [];

    vm.volume = 1;

    vm.initWaves = function() {
      for (var i = 0; i < vm.listOfSound.length; i++) {
        var cont = '#wave' + i;
        vm.wavesurfer = WaveSurfer.create({
          container: cont,
          waveColor: '#bbb',
          progressColor: '#347'
        });

        vm.wavesurfer.on('ready', function () {
          console.log("song ready");
        });

        vm.wavesurfer.load(vm.listOfSound[i]);

        vm.listOfWaves.push(vm.wavesurfer);
      }
    };


    vm.playAllTracks = function(){
      for(var i = 0; i < vm.listOfWaves.length; i++){
        vm.listOfWaves[i].playPause();
      }
    };

    vm.stopAllTracks = function(){
      for(var i = 0; i < vm.listOfWaves.length; i++){
        vm.listOfWaves[i].stop();
      }
    };

    vm.displayWaves = function(){
      $timeout(vm.initWaves, 0)
    };
    vm.displayWaves();

    vm.playPause = function(){
      vm.wavesurfer.playPause();
    };

    vm.stop = function(){
      vm.wavesurfer.stop();
    };

    vm.updateVolume = function(track, value){
      vm.wavesurfer.setVolume(value);
    };


    // Panner
    /*(function () {
      // Add panner
      vm.wavesurfer.panner = vm.wavesurfer.backend.ac.createPanner();
      vm.wavesurfer.backend.setFilter(vm.wavesurfer.panner);

      // Bind panner slider
      // @see http://stackoverflow.com/a/14412601/352796
      var onChange = function () {
        var xDeg = parseInt(slider.value);
        var x = Math.sin(xDeg * (Math.PI / 180));
        vm.wavesurfer.panner.setPosition(x, 0, 0);
      };
      var slider = document.querySelector('[data-action="pan"]');
      slider.addEventListener('input', onChange);
      slider.addEventListener('change', onChange);
      onChange();
    }());*/



    nx.onload = function() {

      nx.colorize("accent", "#347");
      nx.colorize("border", "#bbb");
      nx.colorize("fill", "#eee");

      /*slider1.on('*', function (data) {
        var value = data.value / 100;
        vm.updateVolume(1, value);
      });
      slider1.set({
        value: 80
      });

      solo.on('*', function (data) {
        console.log(data.value);
      });

      mute.on('*', function (data) {
        console.log(data.value);
      });*/

    }



    var knobs = document.getElementsByTagName('webaudio-knob');
    for (var i = 0; i < knobs.length; i++) {
      var knob = knobs[i];
      knob.addEventListener('change', function(e) {
        console.log(e.target.value);
      });
    }

    var slider1 = document.getElementById('slider1');
    slider1.addEventListener('change', function(e) {
      console.log(e.target.value);
      var value = e.target.value / 100;
      vm.updateVolume(1, value);
    });

    // Add panner
    /*vm.wavesurfer.panner = vm.wavesurfer.backend.ac.createPanner();
    vm.wavesurfer.backend.setFilter(vm.wavesurfer.panner);

    var pan1 = document.getElementById('pan1');
    pan1.addEventListener('change', function(e){
      console.log(e.target.value);
      var xDeg = parseInt(pan1.value);
      var x = Math.sin(xDeg * (Math.PI / 180));
      vm.wavesurfer.panner.setPosition(x, 0, 0);
    });*/

  });
