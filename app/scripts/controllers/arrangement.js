'use strict';


angular.module('frontEndApp')
  .controller('ArrangementCtrl', function ($http, $timeout, $rootScope, $uibModal, $log) {
    var vm = this;
    var bufferLoader;
    var ctx;

    $rootScope.listOfSound = [];
    $rootScope.listOfMix = [];
    $rootScope.nbReadyTracks = 0;

    $rootScope.delayTime = 0;
    $rootScope.feedbackGain = 0;
    $rootScope.filterDetune = 0;
    $rootScope.filterDrequency = 0;
    $rootScope.filterGain = 0;

    $rootScope.generalVolume = 80;
    $rootScope.effects = {};
    $rootScope.activeEffects = {};
    $rootScope.listOfWaves = [];
    $rootScope.smState = [];
    $rootScope.nbSolo = 0;
    $rootScope.songName = "";
    $rootScope.mixName = "";

    $rootScope.sliders = {};

    // HISTORIC
    $rootScope.previous = [];
    $rootScope.next = [];

    $rootScope.selectedRegionName = "";
    $rootScope.selectedRegion = null;
    $rootScope.progress = null;

    // SHORTCUTS
    document.addEventListener("keydown",function(evt){
      //console.log(evt.keyCode);
      switch (evt.keyCode){
        // DELETE
        case 46:
              $rootScope.deleteRegion();
              break;
        // ESCAPE
        case 27:
              $rootScope.deselectRegion();
              break;
        // S
        case 83:
              if(evt.ctrlKey && evt.shiftKey) {
                $rootScope.saveAs();
                evt.preventDefault();
              }
              else if(evt.ctrlKey) {
                $rootScope.save();
                evt.preventDefault();
              }
              break;
        // Z
        case 90:
              if(evt.ctrlKey && evt.shiftKey) redo();
              else if(evt.ctrlKey) undo();
              break;
        // BACKSPACE
        //case 8:
        //      undo();
        //      evt.preventDefault();
        //      break;
        default:
              console.log(evt.keyCode);
      }
      $rootScope.$digest();
    });

    // TODO : Change to match the song
    function parseStorage(){
      $rootScope.listOfMix = [];
      Object.keys(localStorage).forEach(function(key){
        if(key.indexOf("MixMaze_") > -1){
          $rootScope.listOfMix.push(key);
        }
      });
    }

    $rootScope.clearStorage = function(){
      Object.keys(localStorage).forEach(function(key){
        if(key.indexOf("MixMaze_") > -1){
          delete localStorage[key];
        }
      });
      $rootScope.listOfMix = [];
    };
    parseStorage();

    // <editor-fold desc="KNOB EFFECTS MARCOOOOOOOOOO">
    var knobLimiter = document.getElementById('filterLimiter');
    knobLimiter.addEventListener('change', function(e) {
      $rootScope.filterLimiter = e.target.value;

      var source = $rootScope.listOfWaves[1].backend.source;

      if($rootScope.preGain == null && $rootScope.limiter == null) {
        $rootScope.preGain = $rootScope.listOfWaves[1].backend.ac.createGain();
        $rootScope.limiter = $rootScope.listOfWaves[1].backend.ac.createDynamicsCompressor();
      }
      $rootScope.limiter.threshold.value = 0; // this is the pitfall, leave some headroom
      $rootScope.limiter.knee.value = 0.0; // brute force
      $rootScope.limiter.ratio.value = 20.0; // max compression
      $rootScope.limiter.attack.value = 0.005; // 5ms attack
      $rootScope.limiter.release.value = 0.050; // 50ms release
      $rootScope.preGain.gain.value = $rootScope.filterLimiter;
      source.connect($rootScope.preGain);
      $rootScope.preGain.connect($rootScope.limiter);
      $rootScope.limiter.connect($rootScope.listOfWaves[1].backend.ac.destination);
    });

    var knobDelayTime = document.getElementById('delayTime');
    knobDelayTime.addEventListener('change', function(e) {
      var value = e.target.value;
      $rootScope.delayTime = value;
      var delay = $rootScope.listOfWaves[1].backend.ac.createDelay();
      delay.delayTime.value = $rootScope.delayTime;
      var feedback = $rootScope.listOfWaves[1].backend.ac.createGain();
      feedback.gain.value = $rootScope.feedbackGain;
      delay.connect(feedback);
      feedback.connect(delay);
      $rootScope.listOfWaves[1].backend.setFilter(delay);
    });

    var knobFeedbackGain = document.getElementById('feedbackGain');
    knobFeedbackGain.addEventListener('change', function(e) {
      var value = e.target.value;
      $rootScope.feedbackGain = value;
      var delay = $rootScope.listOfWaves[1].backend.ac.createDelay();
      delay.delayTime.value = $rootScope.delayTime;
      var feedback = $rootScope.listOfWaves[1].backend.ac.createGain();
      feedback.gain.value = $rootScope.feedbackGain;
      delay.connect(feedback);
      feedback.connect(delay);
      $rootScope.listOfWaves[1].backend.setFilter(delay);
    });

    var knobFilterDetune = document.getElementById('filterDetune');
    knobFilterDetune.addEventListener('change', function(e) {
      var value = e.target.value;
      $rootScope.filterDetune = value;
      var biquadFilter = $rootScope.listOfWaves[1].backend.ac.createBiquadFilter();
      biquadFilter.type = "lowshelf";
      biquadFilter.frequency.value = $rootScope.filterFrequency;
      biquadFilter.gain.value = $rootScope.filterGain;
      biquadFilter.detune.value = $rootScope.filterDetune;
      $rootScope.listOfWaves[1].backend.setFilter(biquadFilter);
    });

    var knobFilterFrequency = document.getElementById('filterFrequency');
    knobFilterFrequency.addEventListener('change', function(e) {
      var value = e.target.value;
      $rootScope.filterFrequency = value;
      var biquadFilter = $rootScope.listOfWaves[1].backend.ac.createBiquadFilter();
      biquadFilter.type = "lowshelf";
      biquadFilter.frequency.value = $rootScope.filterFrequency;
      biquadFilter.gain.value = $rootScope.filterGain;
      biquadFilter.detune.value = $rootScope.filterDetune;
      $rootScope.listOfWaves[1].backend.setFilter(biquadFilter);
    });

    var knobFilterGain = document.getElementById('filterGain');
    knobFilterGain.addEventListener('change', function(e) {
      var value = e.target.value;
      $rootScope.filterGain = value;
      var biquadFilter = $rootScope.listOfWaves[1].backend.ac.createBiquadFilter();
      biquadFilter.type = "lowshelf";
      biquadFilter.frequency.value = $rootScope.filterFrequency;
      biquadFilter.gain.value = $rootScope.filterGain;
      biquadFilter.detune.value = $rootScope.filterDetune;
      $rootScope.listOfWaves[1].backend.setFilter(biquadFilter);
    });
    // </editor-fold>

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

    $rootScope.zoom = function(zoomLevel){
      $rootScope.listOfWaves.forEach(function(wave){
        wave.zoom(zoomLevel);
      });
    };

    $rootScope.toggled = function(open) {
      $log.log('Dropdown is now: ', open);
    };

    $rootScope.toggleDropdown = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $rootScope.status.isopen = !$rootScope.status.isopen;
    };

    // <editor-fold desc="MUSIC LOADER">
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

    $rootScope.loadSamples = function(){
      $rootScope.listOfSound = [];
      $http.get("http://xythe.xyz:8080/musics/" + $("#selectedMusic option:selected").text().trim()).then(
        function successCallback(response){
          $rootScope.songName = $("#selectedMusic option:selected").text().trim();
          console.log(response.data);
          $rootScope.pistes = response.data.musicFiles;

          $rootScope.pistes.forEach(function(p){
            $rootScope.listOfSound.push("http://xythe.xyz/mixmaze" + response.data.musicPath + "/" + p);
            console.log("http://xythe.xyz/mixmaze" + response.data.musicPath + "/" + p);
          });
          //====================================A enlever quand on veut vraiment lire depuis serv=================================
          $rootScope.listOfSound=[
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
        $rootScope.listOfSound
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
              $rootScope.init();

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
    // </editor-fold>

    $rootScope.init = function(){
      $rootScope.initWaves();
      for(var i = 0; i < $rootScope.listOfSound.length; i++){
        $rootScope.smState[i] = null;
      }

      /*var biquadFilter = $rootScope.listOfWaves[1].backend.ac.createBiquadFilter();
      biquadFilter.type = "lowshelf";
      biquadFilter.frequency.value = 1000;
      biquadFilter.gain.value = 25;
      console.log(biquadFilter);
      $rootScope.listOfWaves[1].backend.setFilter(biquadFilter);*/
    };

    // <editor-fold desc="EFFECTS">
    function activateEffects(region) {
      var effects = $rootScope.effects[region.id];
      var keys = Object.keys(effects);
      var effect = {region: region};
      keys.forEach(function(key){
        switch(key){
          case 'mute':
                if($rootScope.effects[region.id].mute && !region.wavesurfer.isMuted){
                  region.wavesurfer.toggleMute();
                }
                else if (!$rootScope.effects[region.id].mute && region.wavesurfer.isMuted){
                  region.wavesurfer.toggleMute();
                }
                break;
          default:
            effect[key] = effects[key];
        }
      });
      $rootScope.activeEffects[region.id] = effect;
    }

    function deactivateEffects(region) {
      var waveId = region.wavesurfer.container.id.split("wave")[1];

      if($rootScope.effects[region.id].mute && region.wavesurfer.isMuted){
        region.wavesurfer.toggleMute();
      }
      else if (!$rootScope.effects[region.id].mute && !region.wavesurfer.isMuted){
        region.wavesurfer.toggleMute();
      }

      delete $rootScope.activeEffects[region.id];

      if($rootScope.smState[waveId] === "mute" && !region.wavesurfer.isMuted) region.wavesurfer.toggleMute();
      else if($rootScope.smState[waveId] !== "mute" && region.wavesurfer.isMuted) region.wavesurfer.toggleMute();

      if($rootScope.effects[region.id].fadeout) {
        region.wavesurfer.setVolume($rootScope.sliders['slider'+region.wavesurfer.container.id.split("wave")[1]]/100 * $rootScope.generalVolume/100);
      }
    }

    function evolveEffects(progress){
      $rootScope.progress = Math.ceil(progress);

      var keys = Object.keys($rootScope.activeEffects);
      var region;
      keys.forEach(function(key){
        region = $rootScope.activeEffects[key].region;
        var subKeys = Object.keys($rootScope.activeEffects[key]);
        subKeys.forEach(function(subKey){
          switch(subKey){
            case "fadein":
                  var start = region.start;
                  var end = region.end;
                  var volume = $rootScope.sliders['slider'+region.wavesurfer.container.id.split("wave")[1]]/100 * $rootScope.generalVolume/100;
                  var res = Math.min((progress - start) * volume / (end - start), volume);
                  region.wavesurfer.setVolume(res);
                  break;
            case "fadeout":
                  var start = region.start;
                  var end = region.end;
                  var volume = $rootScope.sliders['slider'+region.wavesurfer.container.id.split("wave")[1]]/100 * $rootScope.generalVolume/100;
                  var res = Math.max(volume - volume * ((progress - start) / (end - start)), 0);
                  region.wavesurfer.setVolume(res);
                  break;
            default:
          }
          //console.log("toto");
        });
        //console.log($rootScope.activeEffects[key]);
      });
      $rootScope.$digest();
    }
    // </editor-fold>

    // <editor-fold desc="REGIONS">
    function undo(){
      if($rootScope.previous.length === 0) return;
      $rootScope.deselectRegion();
      $rootScope.next.push(jsonifyRegions());
      var previousState = $rootScope.previous.pop();
      $rootScope.loadRegions(previousState);
    }

    function redo(){
      if($rootScope.next.length === 0) return;
      $rootScope.deselectRegion();
      $rootScope.previous.push(jsonifyRegions());
      var nextState = $rootScope.next.pop();
      $rootScope.loadRegions(nextState);
    }

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

    $rootScope.deleteRegion = function(){
      $rootScope.previous.push(jsonifyRegions());
      if($rootScope.selectedRegion !== null){
        delete $rootScope.effects[$rootScope.selectedRegionName];
        $rootScope.selectedRegion.remove();
        $rootScope.selectedRegion = null;
        $rootScope.selectedRegionName = "";
      }
    };

    $rootScope.toggleEffect = function(effect){
      $rootScope.previous.push(jsonifyRegions());
      $rootScope.effects[$rootScope.selectedRegionName][effect] = !$rootScope.effects[$rootScope.selectedRegionName][effect];

    };

    $rootScope.toggleSoundEffect = function(effect){
      $rootScope.toggleEffect(effect);
      var tmp = ['fadein', 'fadeout', 'mute'];
      Object.keys($rootScope.effects[$rootScope.selectedRegionName]).forEach(function(key){
        if(key !== effect && tmp.indexOf(key) > -1){
          $rootScope.effects[$rootScope.selectedRegionName][key] = false;
        }
      });

    };

    $rootScope.hasEffect = function(effect){
      return $rootScope.effects[$rootScope.selectedRegionName][effect] === true;
    };

    function jsonifyRegions(){
      var res = {};
      $rootScope.listOfWaves.forEach(function(wavesurfer, index){
        res[$rootScope.nameRecover($rootScope.listOfSound[index])] = Object.keys(wavesurfer.regions.list).map(function (id) {
          var region = wavesurfer.regions.list[id];
          var effects = {};
          try {
            Object.keys($rootScope.effects[region.id]).forEach(function (key) {
              effects[key] = $rootScope.effects[region.id][key];
            });
          } catch(ex){
          }
          return {
            start: region.start,
            end: region.end,
            attributes: region.attributes,
            data: region.data,
            effects: effects
          };
        });
      });
      return res;
    }

    /**
     * Save regions to localStorage.
     */
    $rootScope.saveRegions = function() {
      localStorage[$rootScope.songName] = JSON.stringify(jsonifyRegions());
    };

    /**
     * Load regions from localStorage.
     */
    $rootScope.loadRegions = function(regions) {
      if(regions === undefined) {
        if (localStorage[$rootScope.songName] === undefined) return;
        $rootScope.deselectRegion();
        regions = JSON.parse(localStorage[$rootScope.songName]);
      }
      $rootScope.effects = {};
      $rootScope.listOfWaves.forEach(function(wavesurfer, index){
        wavesurfer.clearRegions();
        var piste = $rootScope.nameRecover($rootScope.listOfSound[index]);
        regions[piste].forEach(function(region){
          region.color = wavesurfer.color;
          wavesurfer.addRegion(region);
          var keys = Object.keys(wavesurfer.regions.list);
          var newRegion = wavesurfer.regions.list[keys[keys.length-1]];
          $rootScope.effects[newRegion.id] = region.effects;
        });
      });
    };
    // </editor-fold>

    function checkReadiness(){
      if($rootScope.nbReadyTracks === $rootScope.listOfSound.length){
        $rootScope.listOfWaves.forEach(function(wave){
          wave.toggleInteraction();
        });
        $rootScope.progress = 0;

        $rootScope.duration = Math.ceil($rootScope.listOfWaves[0].getDuration());
      }
    }

    $rootScope.initWaves = function() {
      for (var i = 0; i < $rootScope.listOfSound.length; i++) {
        var cont = '#wave' + i;

        $rootScope.listOfWaves.push(WaveSurfer.create({
          container: cont,
          waveColor: '#bbb',
          progressColor: '#347',
          cursorColor: '#000'
        }));
        $rootScope.listOfWaves[i].toggleInteraction();
        $rootScope.listOfWaves[i].color = randomColor(0.5);

        if(i === 0){
          $rootScope.listOfWaves[i].on('audioprocess', evolveEffects);
        }

        $rootScope.listOfWaves[i].on('ready', function () {
          console.log("song ready");
          $rootScope.nbReadyTracks = $rootScope.nbReadyTracks + 1;
          checkReadiness();
          $(".progress-bar").attr("style","width:" + (($rootScope.nbReadyTracks / $rootScope.listOfSound.length) * 100) + "%");
          $rootScope.$digest();
        });

        $rootScope.listOfWaves[i].on('seek', function(progress){
          if ($rootScope.seeking === true) return;
          $rootScope.seeking = true;
          var willPlay = false;
          $rootScope.listOfWaves.forEach(function(wave){
            willPlay = wave.getCurrentTime() - wave.getDuration() === 0 || willPlay;
          });
          $rootScope.listOfWaves.forEach(function(wave, index){
            if(index === 0) {
              $rootScope.progress = Math.ceil(progress * $rootScope.duration);
            }
            wave.seekTo(progress);
            if(willPlay) wave.play();
          });
          $rootScope.seeking = false;
          $rootScope.$digest();
        });

        $rootScope.listOfWaves[i].enableDragSelection({
          color: $rootScope.listOfWaves[i].color
        });

        $rootScope.listOfWaves[i].on('region-click', function (region, e) {
          e.stopPropagation();
          selectRegion(region);
          $rootScope.$digest();
          // Play on click, loop on shift click
          //e.shiftKey ? region.playLoop() : region.play();
        });

        $rootScope.listOfWaves[i].on('region-dblclick', function (region, e) {
          e.stopPropagation();
          //selectRegion(region);
          //$rootScope.$digest();
          // Play on click, loop on shift click
          e.shiftKey ? region.playLoop() : region.play();
        });
        //$rootScope.wavesurfer.on('region-click', editAnnotation);

        $rootScope.listOfWaves[i].on('region-updated', function(region, e){
          if(region.end - region.start < 0.5) return;
          selectRegion(region);
          if($rootScope.effects[region.id] === undefined)
            $rootScope.effects[region.id] = {};
          $rootScope.$digest();
        });

        $rootScope.listOfWaves[i].on('region-created', function(region, e){
          $rootScope.previous.push(jsonifyRegions());
        });

        $rootScope.listOfWaves[i].on('region-in', activateEffects);
        $rootScope.listOfWaves[i].on('region-out', deactivateEffects);

        //$rootScope.wavesurfer.on('region-removed', saveRegions);
        //$rootScope.wavesurfer.on('region-in', showNote);

        $rootScope.listOfWaves[i].load($rootScope.listOfSound[i]);

        //$rootScope.listOfWaves.push($rootScope.wavesurfer);
      }
    };

    $rootScope.playAllTracks = function(){
      for(var i = 0; i < $rootScope.listOfWaves.length; i++){
        $rootScope.listOfWaves[i].playPause();
      }
    };

    $rootScope.stopAllTracks = function(){
      for(var i = 0; i < $rootScope.listOfWaves.length; i++){
        $rootScope.listOfWaves[i].stop();
      }
      console.log($rootScope.listOfWaves[1]);
      $rootScope.progress = 0;
    };

    $rootScope.updateTrackVolume = function(index){
      if($rootScope.smState[index] == "mute"){
        $rootScope.smState[index] = null;
      }
      $rootScope.listOfWaves[index].setVolume($rootScope.sliders['slider'+index]/100 * $rootScope.generalVolume/100);
    };

    $rootScope.updateAllTracksVolume = function(value){
      $rootScope.generalVolume = value;
      for(var i = 0; i < $rootScope.listOfWaves.length; i++){
        // gerer le volume
        $rootScope.updateTrackVolume(i);
      }
    };

    $rootScope.playPause = function(){
      $rootScope.wavesurfer.playPause();
    };

    $rootScope.stop = function(){
      $rootScope.wavesurfer.stop();
    };

    $rootScope.updateVolume = function(track, value){
      $rootScope.wavesurfer.setVolume(value);
    };

    // <editor-fold desc="SOLO/MUTE">
    $rootScope.mute = function(track){
      $rootScope.listOfWaves[track].toggleMute();
    };

    $rootScope.updateSm = function(track, value){
      console.log($rootScope.listOfWaves[track].isMuted);
      if(value == 'solo' && $rootScope.nbSolo == 0 && $rootScope.smState[track] != 'solo'){
        $rootScope.smState[track] = 'solo';
        $rootScope.nbSolo++;
        for(var i = 0; i < $rootScope.smState.length; i++){
          if(i != track){
            $rootScope.smState[i] = 'mute';
          }
        }
      } else if(value == 'solo' && $rootScope.nbSolo > 0 && $rootScope.smState[track] != 'solo'){
        $rootScope.smState[track] = 'solo';
        $rootScope.nbSolo++;
      } else if(value == 'mute' && $rootScope.nbSolo > 0 && $rootScope.smState[track] == 'mute'){
        $rootScope.smState[track] = 'solo';
        $rootScope.nbSolo++;
      } else if(value == 'mute' && $rootScope.smState[track] == 'solo'){
        $rootScope.smState[track] = 'mute';
        $rootScope.nbSolo--;
      } else if(value == 'solo' && $rootScope.smState[track] == 'solo' && $rootScope.nbSolo > 1){
        $rootScope.smState[track] = 'mute';
        $rootScope.nbSolo--;
      } else if(value == 'solo' && $rootScope.smState[track] == 'solo' && $rootScope.nbSolo == 1){
        for(var i = 0; i < $rootScope.smState.length; i++) {
          $rootScope.smState[i] = null;
        }
        $rootScope.nbSolo--;
      } else if(value == 'mute' && $rootScope.nbSolo == 0 && $rootScope.smState[track] == null){
        $rootScope.smState[track] = 'mute';
      } else if(value == 'mute' && $rootScope.nbSolo == 0 && $rootScope.smState[track] == 'mute'){
        $rootScope.smState[track] = null;
      }
      $rootScope.manageSoloMute($rootScope.smState);
    };

    $rootScope.reinitSm = function(){
      for(var i = 0; i < $rootScope.smState.length; i++){
        $rootScope.smState[i] = null;
        $rootScope.nbSolo = 0;
      }
      $rootScope.manageSoloMute($rootScope.smState);
    };

    $rootScope.manageSoloMute = function(smState){
      for(var i = 0; i < smState.length; i++){
        if(smState[i] == 'mute' && $rootScope.listOfWaves[i].isMuted != true){
          $rootScope.listOfWaves[i].toggleMute();
        } else if(smState[i] == 'solo' && $rootScope.listOfWaves[i].isMuted == true
          || smState[i] == null && $rootScope.listOfWaves[i].isMuted == true){
          $rootScope.listOfWaves[i].toggleMute();
        }
      }
    };

    $rootScope.solo = function(track){
      for(var i = 0; i < $rootScope.listOfWaves.length; i++){
        if(i != track){
          $rootScope.listOfWaves[i].toggleMute();
        }
      }
    };
    // </editor-fold>

    // <editor-fold desc="PANNER">
    $rootScope.updatePan = function(track, value){

      console.log("updatePan(" + track + "," + value + ")");
      /*// Add panner
       $rootScope.wavesurfer.panner = $rootScope.wavesurfer.backend.ac.createPanner();
       $rootScope.wavesurfer.backend.setFilter($rootScope.wavesurfer.panner);

       // Bind panner slider
       // @see http://stackoverflow.com/a/14412601/352796
       var onChange = function () {
       var xDeg = parseInt(slider.value);
       var x = Math.sin(xDeg * (Math.PI / 180));
       $rootScope.wavesurfer.panner.setPosition(x, 0, 0);
       };
       var slider = document.querySelector('[data-action="pan"]');
       slider.addEventListener('input', onChange);
       slider.addEventListener('change', onChange);
       onChange();*/
    };

    // Panner
    /*(function () {
     // Add panner
     $rootScope.wavesurfer.panner = $rootScope.wavesurfer.backend.ac.createPanner();
     $rootScope.wavesurfer.backend.setFilter($rootScope.wavesurfer.panner);

     // Bind panner slider
     // @see http://stackoverflow.com/a/14412601/352796
     var onChange = function () {
     var xDeg = parseInt(slider.value);
     var x = Math.sin(xDeg * (Math.PI / 180));
     $rootScope.wavesurfer.panner.setPosition(x, 0, 0);
     };
     var slider = document.querySelector('[data-action="pan"]');
     slider.addEventListener('input', onChange);
     slider.addEventListener('change', onChange);
     onChange();
     }());*/

    // Add panner
    /*$rootScope.wavesurfer.panner = $rootScope.wavesurfer.backend.ac.createPanner();
     $rootScope.wavesurfer.backend.setFilter($rootScope.wavesurfer.panner);

     var pan1 = document.getElementById('pan1');
     pan1.addEventListener('change', function(e){
     console.log(e.target.value);
     var xDeg = parseInt(pan1.value);
     var x = Math.sin(xDeg * (Math.PI / 180));
     $rootScope.wavesurfer.panner.setPosition(x, 0, 0);
     });*/

    nx.onload = function() {

      nx.colorize("accent", "#347");
      nx.colorize("border", "#bbb");
      nx.colorize("fill", "#eee");

      /*slider1.on('*', function (data) {
       var value = data.value / 100;
       $rootScope.updateVolume(1, value);
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
    // </editor-fold>

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
      $rootScope.updateAllTracksVolume(value);
    });

    $rootScope.volumeStart = function(){
      if($rootScope.slidersInitialized) return;
      $rootScope.slidersInitialized = true;

      var keys = Object.keys($rootScope.sliders);

      keys.forEach(function(key){
        document.getElementById(key).addEventListener('change', function(e){
          $rootScope.sliders[key] = e.target.value;
          $rootScope.updateTrackVolume(key.split('r')[1]);
        });
      });
    };

    $rootScope.nameRecover = function(str){
      var splitted = str.split("/");
      return splitted[splitted.length - 1].split(".")[0];
    };

    // <editor-fold desc="SAVE">
    $rootScope.save = function(){
      if(!Boolean($rootScope.mixName)){
        $rootScope.saveAs();
      } else {
        localStorage['MixMaze_' + $rootScope.mixName] = jsonifyRegions();
        parseStorage();
      }
    };

    /** MODAL */
    $rootScope.saveAs = function (size) {

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'modalSave.html',
        controller: 'ModalInstanceCtrl',
        size: size,
        resolve: {
          items: function () {
            return $rootScope.mixName;
          }
        }
      });

      modalInstance.result.then(function (name) {
        // TODO : change to DB storage
        $rootScope.mixName = name;
        $rootScope.save();
      }, function () {
        //$log.info('Modal dismissed at: ' + new Date());
      });
    };
    // </editor-fold>

    $rootScope.openTrackEffects = function (size) {

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'modalTrackEffects.html',
        controller: 'ModalInstanceCtrl',
        size: size,
        resolve: {
          items: function () {
            return $rootScope.mixName;
          }
        }
      });

      modalInstance.result.then(function (name) {
        // TODO
      }, function () {
        //$log.info('Modal dismissed at: ' + new Date());
      });
    };

    //$('#myModal').on('shown.bs.modal', function () {
    //  $('#nameTextArea').focus();
    //});
  });

angular.module('frontEndApp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, items) {

  $scope.name = items;

  $scope.ok = function () {
    $uibModalInstance.close($scope.name);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.keyPressed = function(evt){
    if(evt.keyCode === 13) $scope.ok();
  }
});
