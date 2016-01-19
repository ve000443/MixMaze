'use strict';


angular.module('frontEndApp')
  .controller('ArrangementCtrl', function ($timeout) {

    var vm = this;
    vm.generalVolume = 80;

    vm.listOfSound = [
      'tracks/synth.mp3',
      'tracks/vocal.mp3',
      'tracks/drums.mp3'
    ];

    vm.listOfWaves = [];

    vm.volume = 1;

    vm.smState = [];
    vm.nbSolo = 0;

    vm.init = function(){
      vm.displayWaves();
      for(var i = 0; i < vm.listOfSound.length; i++){
        vm.smState[i] = null;
      }
    };

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

        vm.wavesurfer.on('seek', function(progress){
          if (vm.seeking === true) return;
          vm.seeking = true;
          var willPlay = false;
          vm.listOfWaves.forEach(function(wave){
            willPlay = wave.getCurrentTime() - wave.getDuration() === 0 || willPlay;
          });
          vm.listOfWaves.forEach(function(wave){
            wave.seekTo(progress);
            if(willPlay) wave.play();
          });
          vm.seeking = false;
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

    vm.updateTrackVolume = function(index){
      vm.listOfWaves[index].setVolume(vm.sliders['slider'+index]/100 * vm.generalVolume/100);
    };

    vm.updateAllTracksVolume = function(value){
      vm.generalVolume = value;
      for(var i = 0; i < vm.listOfWaves.length; i++){
        // gerer le volume
        vm.updateTrackVolume(i);
      }
    };

    vm.displayWaves = function(){
      $timeout(vm.initWaves, 0)
    };

    vm.playPause = function(){
      vm.wavesurfer.playPause();
    };

    vm.stop = function(){
      vm.wavesurfer.stop();
    };

    vm.updateVolume = function(track, value){
      vm.wavesurfer.setVolume(value);
    };

    vm.mute = function(track){
      vm.listOfWaves[track].toggleMute();

    };

    vm.updateSm = function(track, value){
      console.log(track + ", " + value);
      if(value == 'solo' && vm.nbSolo == 0 && vm.smState[track] != 'solo'){
        vm.smState[track] = 'solo';
        vm.nbSolo++;
        for(var i = 0; i < vm.smState.length; i++){
          if(i != track){
            vm.smState[i] = 'mute';
          }
        }
      } else if(value == 'solo' && vm.nbSolo > 0 && vm.smState[track] != 'solo'){
        vm.smState[track] = 'solo';
        vm.nbSolo++;
      } else if(value == 'mute' && vm.nbSolo > 0 && vm.smState[track] == 'mute'){
        vm.smState[track] = 'solo';
        vm.nbSolo++;
      } else if(value == 'mute' && vm.smState[track] == 'solo'){
        vm.smState[track] = 'mute';
        vm.nbSolo--;
      } else if(value == 'solo' && vm.smState[track] == 'solo' && vm.nbSolo > 1){
        vm.smState[track] = 'mute';
        vm.nbSolo--;
      } else if(value == 'solo' && vm.smState[track] == 'solo' && vm.nbSolo == 1){
        for(var i = 0; i < vm.smState.length; i++) {
          vm.smState[i] = null;
        }
        vm.nbSolo--;
      } else if(value == 'mute' && vm.nbSolo == 0 && vm.smState[track] == null){
        vm.smState[track] = 'mute';
      } else if(value == 'mute' && vm.nbSolo == 0 && vm.smState[track] == 'mute'){
        vm.smState[track] = null;
      }
    };

    vm.solo = function(track){
      for(var i = 0; i < vm.listOfWaves.length; i++){
        if(i != track){
          vm.listOfWaves[i].toggleMute();
        }
      }
    };

    vm.updatePan = function(track, value){

      console.log("updatePan(" + track + "," + value + ")");
      /*// Add panner
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
      onChange();*/
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

    };



    var knobs = document.getElementsByTagName('webaudio-knob');
    for (var i = 0; i < knobs.length; i++) {
      var knob = knobs[i];
      knob.addEventListener('change', function(e) {
        //console.log(e.target.value);
      });
    }

    var sliderGeneral = document.getElementById('sliderGeneral');
    sliderGeneral.addEventListener('change', function(e) {
      //console.log("volume general : " + e.target.value);
      var value = e.target.value;
      vm.updateAllTracksVolume(value);
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

    vm.sliders = {};

    vm.volumeStart = function(){
      if(vm.slidersInitialized) return;
      vm.slidersInitialized = true;

      var keys = Object.keys(vm.sliders);

      keys.forEach(function(key){
        document.getElementById(key).addEventListener('change', function(e){
          vm.sliders[key] = e.target.value;
          vm.updateTrackVolume(key.split('r')[1]);
        });
      });
    };

    vm.init();
  });
