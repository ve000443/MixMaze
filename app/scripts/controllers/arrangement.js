'use strict';


angular.module('frontEndApp')
  .controller('ArrangementCtrl', function ($http, $timeout, $rootScope) {
    var vm = this;
    vm.listOfSound = [];
    var bufferLoader;
    var ctx;
    vm.nbReadyTracks = 0;

    vm.delayTime = 0;
    vm.feedbackGain = 0;
    vm.filterDetune = 0;
    vm.filterDrequency = 0;
    vm.filterGain = 0;

    vm.generalVolume = 80;
    vm.effects = {};
    vm.activeEffects = {};
    vm.listOfWaves = [];
    vm.smState = [];
    vm.nbSolo = 0;
    vm.songName = "";

    $rootScope.selectedRegionName = "";
    $rootScope.selectedRegion = null;

    var knobDelayTime = document.getElementById('delayTime');
    knobDelayTime.addEventListener('change', function(e) {
      var value = e.target.value;
      vm.delayTime = value;
      var delay = vm.listOfWaves[1].backend.ac.createDelay();
      delay.delayTime.value = vm.delayTime;
      var feedback = vm.listOfWaves[1].backend.ac.createGain();
      feedback.gain.value = vm.feedbackGain;
      delay.connect(feedback);
      feedback.connect(delay);
      vm.listOfWaves[1].backend.setFilter(delay);
    });

    var knobFeedbackGain = document.getElementById('feedbackGain');
    knobFeedbackGain.addEventListener('change', function(e) {
      var value = e.target.value;
      vm.feedbackGain = value;
      var delay = vm.listOfWaves[1].backend.ac.createDelay();
      delay.delayTime.value = vm.delayTime;
      var feedback = vm.listOfWaves[1].backend.ac.createGain();
      feedback.gain.value = vm.feedbackGain;
      delay.connect(feedback);
      feedback.connect(delay);
      vm.listOfWaves[1].backend.setFilter(delay);
    });

    var knobFilterDetune = document.getElementById('filterDetune');
    knobFilterDetune.addEventListener('change', function(e) {
      var value = e.target.value;
      vm.filterDetune = value;
      var biquadFilter = vm.listOfWaves[1].backend.ac.createBiquadFilter();
      biquadFilter.type = "lowshelf";
      biquadFilter.frequency.value = vm.filterFrequency;
      biquadFilter.gain.value = vm.filterGain;
      biquadFilter.detune.value = vm.filterDetune;
      vm.listOfWaves[1].backend.setFilter(biquadFilter);
    });

    var knobFilterFrequency = document.getElementById('filterFrequency');
    knobFilterFrequency.addEventListener('change', function(e) {
      var value = e.target.value;
      vm.filterFrequency = value;
      var biquadFilter = vm.listOfWaves[1].backend.ac.createBiquadFilter();
      biquadFilter.type = "lowshelf";
      biquadFilter.frequency.value = vm.filterFrequency;
      biquadFilter.gain.value = vm.filterGain;
      biquadFilter.detune.value = vm.filterDetune;
      vm.listOfWaves[1].backend.setFilter(biquadFilter);
    });

    var knobFilterGain = document.getElementById('filterGain');
    knobFilterGain.addEventListener('change', function(e) {
      var value = e.target.value;
      vm.filterGain = value;
      var biquadFilter = vm.listOfWaves[1].backend.ac.createBiquadFilter();
      biquadFilter.type = "lowshelf";
      biquadFilter.frequency.value = vm.filterFrequency;
      biquadFilter.gain.value = vm.filterGain;
      biquadFilter.detune.value = vm.filterDetune;
      vm.listOfWaves[1].backend.setFilter(biquadFilter);
    });

    /**
     * Random RGBA color.
     */
    function randomColor(alpha) {
      return 'rgba(' + [
          ~~(Math.random() * 255),
          ~~(Math.random() * 255),
          ~~(Math.random() * 255),
          alpha || 1
        ] + ')';
    }


    $http.get("http://xythe.xyz:8080/musics").then(

      function successCallback(response){
        $rootScope.musics = response.data;
        $rootScope.musics.forEach(function(o){
        });

        // this callback will be called asynchronously
        // when the response is available
      }, function errorCallback(response) {
        console.error;
        // called asynchronously if an error occurs
        // or server returns response with an error status
      });



    vm.loadSamples = function(){
      vm.listOfSound = [];
      $http.get("http://xythe.xyz:8080/musics/" + $("#selectedMusic option:selected").text().trim()).then(
        function successCallback(response){
          vm.songName = $("#selectedMusic option:selected").text().trim();
          console.log(response.data);
          $rootScope.pistes = response.data.musicFiles;

          $rootScope.pistes.forEach(function(p){
            vm.listOfSound.push("http://xythe.xyz/mixmaze" + response.data.musicPath + "/" + p);
            console.log("http://xythe.xyz/mixmaze" + response.data.musicPath + "/" + p);
          });
          //====================================A enlever quand on veut vraiment lire depuis serv=================================
          vm.listOfSound=[
            'tracks/synth.mp3',
            'tracks/vocal.mp3',
            'tracks/drums.mp3',
          ];
          //======================================================================================================================

          var audioContext = window.AudioContext || window.webkitAudioContext;

          ctx = new audioContext();

          loadAllSoundSamples();
          // this callback will be called asynchronously
          // when the response is available
        }, function errorCallback(response) {
          console.error;
          // called asynchronously if an error occurs
          // or server returns response with an error status
        });

    };

    function loadAllSoundSamples() {
      // onSamplesDecoded will be called when all samples
      // have been loaded and decoded, and the decoded sample will
      // be its only parameter (see function above)
      bufferLoader = new BufferLoader(
        ctx,
        vm.listOfSound
      );

      // start loading and decoding the files
      bufferLoader.load();
    }

    function BufferLoader(context, urlList) {
      this.context = context;
      this.urlList = urlList;
      this.bufferList = [];
      this.loadCount = 0;
    }

    BufferLoader.prototype.loadBuffer = function(url, index) {
      // Load buffer asynchronously
      console.log('file : ' + url + " loading and decoding");

      var request = new XMLHttpRequest();
      request.open("GET", url, true);

      request.responseType = "arraybuffer";

      var loader = this;

      request.onload = function() {

        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
          request.response,
          function(buffer) {
            console.log("Loaded and decoded track " + (loader.loadCount+1) +
              "/" +  loader.urlList.length + "...");

            if (!buffer) {
              alert('error decoding file data: ' + url);
              return;
            }
            loader.bufferList[index] = buffer;

            if (++loader.loadCount == loader.urlList.length)
              vm.init();

          },
          function(error) {
            console.error('decodeAudioData error', error);
          }
        );
      };

      request.onprogress = function(e) {
        if(e.total !== 0) {
          var percent = (e.loaded * 100) / e.total;

          console.log("loaded " + percent  + " % of file " + index);
        }
      };

      request.onerror = function() {
        alert('BufferLoader: XHR error');
      };

      request.send();
    };

    BufferLoader.prototype.load = function() {
      console.log("Loading " + this.urlList.length + "track(s)... please wait...");
      for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
    };

    vm.init = function(){
      vm.initWaves();
      for(var i = 0; i < vm.listOfSound.length; i++){
        vm.smState[i] = null;
      }
      console.log(vm.listOfWaves[1]);

      /*var biquadFilter = vm.listOfWaves[1].backend.ac.createBiquadFilter();
      biquadFilter.type = "lowshelf";
      biquadFilter.frequency.value = 1000;
      biquadFilter.gain.value = 25;
      console.log(biquadFilter);
      vm.listOfWaves[1].backend.setFilter(biquadFilter);*/
    };

    function activateEffects(region) {
      var effects = vm.effects[region.id];
      var keys = Object.keys(effects);
      var effect = {region: region};
      keys.forEach(function(key){
        switch(key){
          case 'mute':
                if(vm.effects[region.id].mute && !region.wavesurfer.isMuted){
                  region.wavesurfer.toggleMute();
                }
                else if (!vm.effects[region.id].mute && region.wavesurfer.isMuted){
                  region.wavesurfer.toggleMute();
                }
                break;
          default:
            effect[key] = effects[key];
        }
      });
      vm.activeEffects[region.id] = effect;
    }

    function deactivateEffects(region) {
      var waveId = region.wavesurfer.container.id.split("wave")[1];

      if(vm.effects[region.id].mute && region.wavesurfer.isMuted){
        region.wavesurfer.toggleMute();
      }
      else if (!vm.effects[region.id].mute && !region.wavesurfer.isMuted){
        region.wavesurfer.toggleMute();
      }

      delete vm.activeEffects[region.id];

      if(vm.smState[waveId] === "mute" && !region.wavesurfer.isMuted) region.wavesurfer.toggleMute();
      else if(vm.smState[waveId] !== "mute" && region.wavesurfer.isMuted) region.wavesurfer.toggleMute();

      if(vm.effects[region.id].fadeout) {
        region.wavesurfer.setVolume(vm.sliders['slider'+region.wavesurfer.container.id.split("wave")[1]]/100 * vm.generalVolume/100);
      }
    }

    function evolveEffects(progress){
      var keys = Object.keys(vm.activeEffects);
      var region;
      keys.forEach(function(key){
        region = vm.activeEffects[key].region;
        var subKeys = Object.keys(vm.activeEffects[key]);
        subKeys.forEach(function(subKey){
          switch(subKey){
            case "fadein":
                  var start = region.start;
                  var end = region.end;
                  var volume = vm.sliders['slider'+region.wavesurfer.container.id.split("wave")[1]]/100 * vm.generalVolume/100;
                  var res = Math.min((progress - start) * volume / (end - start), volume);
                  region.wavesurfer.setVolume(res);
                  break;
            case "fadeout":
                  var start = region.start;
                  var end = region.end;
                  var volume = vm.sliders['slider'+region.wavesurfer.container.id.split("wave")[1]]/100 * vm.generalVolume/100;
                  var res = Math.max(volume - volume * ((progress - start) / (end - start)), 0);
                  region.wavesurfer.setVolume(res);
                  break;
            default:
          }
          //console.log("toto");
        });
        //console.log(vm.activeEffects[key]);
      });
    }

    function checkReadiness(){
      if(vm.nbReadyTracks === vm.listOfSound.length){
        vm.listOfWaves.forEach(function(wave){
          wave.toggleInteraction();
        });
      }
    }

    vm.initWaves = function() {
      for (var i = 0; i < vm.listOfSound.length; i++) {
        var cont = '#wave' + i;

        vm.listOfWaves.push(WaveSurfer.create({
          container: cont,
          waveColor: '#bbb',
          progressColor: '#347'
        }));
        vm.listOfWaves[i].toggleInteraction();

        if(i === 0){
          vm.listOfWaves[i].on('audioprocess', evolveEffects);
        }

        vm.listOfWaves[i].on('ready', function () {
          console.log("song ready");
          vm.nbReadyTracks = vm.nbReadyTracks + 1;
          checkReadiness();
          $(".progress-bar").attr("style","width:" + ((vm.nbReadyTracks / vm.listOfSound.length) * 100) + "%");
          $rootScope.$digest();
        });

        vm.listOfWaves[i].on('seek', function(progress){
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

        vm.listOfWaves[i].enableDragSelection({
          color: randomColor(0.6)
        });

        vm.listOfWaves[i].on('region-click', function (region, e) {
          e.stopPropagation();
          selectRegion(region);
          $rootScope.$digest();
          // Play on click, loop on shift click
          //e.shiftKey ? region.playLoop() : region.play();
        });
        //vm.wavesurfer.on('region-click', editAnnotation);

        vm.listOfWaves[i].on('region-updated', function(region, e){
          if(region.end - region.start < 0.5) return;
          selectRegion(region);
          if(vm.effects[region.id] === undefined)
            vm.effects[region.id] = {};
          $rootScope.$digest();
        });

        vm.listOfWaves[i].on('region-in', activateEffects);
        vm.listOfWaves[i].on('region-out', deactivateEffects);

        //vm.wavesurfer.on('region-removed', saveRegions);
        //vm.wavesurfer.on('region-in', showNote);

        vm.listOfWaves[i].load(vm.listOfSound[i]);

        //vm.listOfWaves.push(vm.wavesurfer);
      }
    };

    function selectRegion(region){
      $rootScope.deselectRegion();
      $rootScope.selectedRegion = region;
      $rootScope.selectedRegionName = region.id;
      region.element.className += " selected";
    }

    $rootScope.deselectRegion = function(){
      if($rootScope.selectedRegion !== null){
        $rootScope.selectedRegion.element.className = $rootScope.selectedRegion.element.className.replace(' selected', '');
        $rootScope.selectedRegion = null;
        $rootScope.selectedRegionName = "";
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
      if(vm.smState[index] == "mute"){
        vm.smState[index] = null;
      }
      vm.listOfWaves[index].setVolume(vm.sliders['slider'+index]/100 * vm.generalVolume/100);
    };

    vm.updateAllTracksVolume = function(value){
      vm.generalVolume = value;
      for(var i = 0; i < vm.listOfWaves.length; i++){
        // gerer le volume
        vm.updateTrackVolume(i);
      }
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
      console.log(vm.listOfWaves[track].isMuted);
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
      vm.manageSoloMute(vm.smState);
    };

    vm.reinitSm = function(){
      for(var i = 0; i < vm.smState.length; i++){
        vm.smState[i] = null;
        vm.nbSolo = 0;
      }
      vm.manageSoloMute(vm.smState);
    };

    vm.manageSoloMute = function(smState){
      for(var i = 0; i < smState.length; i++){
        if(smState[i] == 'mute' && vm.listOfWaves[i].isMuted != true){
          vm.listOfWaves[i].toggleMute();
        } else if(smState[i] == 'solo' && vm.listOfWaves[i].isMuted == true
          || smState[i] == null && vm.listOfWaves[i].isMuted == true){
          vm.listOfWaves[i].toggleMute();
        }
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

    vm.nameRecover = function(str){
      var splitted = str.split("/");
      return splitted[splitted.length - 1].split(".")[0];
    };

    /**
     * Save regions to localStorage.
     */
    $rootScope.saveRegions = function() {
      var res = {};
      vm.listOfWaves.forEach(function(wavesurfer, index){
        res[vm.nameRecover(vm.listOfSound[index])] = Object.keys(wavesurfer.regions.list).map(function (id) {
          var region = wavesurfer.regions.list[id];
          return {
            start: region.start,
            end: region.end,
            attributes: region.attributes,
            data: region.data,
            effects: vm.effects[region.id]
          };
        });
      });
      localStorage[vm.songName] = JSON.stringify(res);
      console.log(localStorage[vm.songName]);
    };

    /**
     * Load regions from localStorage.
     */
    $rootScope.loadRegions = function(regions) {
      if(localStorage[vm.songName] === undefined) return;
      regions = JSON.parse(localStorage[vm.songName]);
      //vm.effects = {};
      vm.listOfWaves.forEach(function(wavesurfer, index){
        wavesurfer.clearRegions();
        var piste = vm.nameRecover(vm.listOfSound[index]);
        regions[piste].forEach(function(region){
          region.color = randomColor(0.5);
          wavesurfer.addRegion(region);
        });
      });
      //regions.forEach(function (region) {
      //  region.color = randomColor(0.1);
      //  wavesurfer.addRegion(region);
      //});
    }
  });
