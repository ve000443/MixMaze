'use strict';


angular.module('frontEndApp')
  .controller('ArrangementCtrl', function ($http, $timeout, $rootScope, $uibModal, $log, $cookies, $cookieStore, Session, Persistence, Tools, Rating, MusicLoader) {
    var vm = this;
    var local = false;
    $rootScope.endpoint = 'http://' + (local ? "localhost" : "xythe.xyz") + ':8080';

    // Services for HTML
    $rootScope.Tools =  Tools;
    $rootScope.Session =  Session;
    $rootScope.Persistence =  Persistence;
    $rootScope.Rating =  Rating;
    $rootScope.MusicLoader =  MusicLoader;

    $rootScope.initVar = function() {
      $rootScope.listOfSound = [];
      $rootScope.listOfMix = [];
      $rootScope.listOfWaves = [];

      // EFFECTS
      $rootScope.delayTime = 0;
      $rootScope.feedbackGain = 0;
      $rootScope.filterDetune = 0;
      $rootScope.filterDrequency = 0;
      $rootScope.filterGain = 0;
      $rootScope.generalVolume = 100;
      $rootScope.effects = {};
      $rootScope.activeEffects = {};

      // STATE
      $rootScope.smState = [];
      $rootScope.nbSolo = 0;
      $rootScope.songName = "";
      $rootScope.sliders = {};
      $rootScope.progress = null;
      $rootScope.duration = 0;

      // MIX INFOS
      $rootScope.mixData = {};
      $rootScope.mixName = "";
      $rootScope.mixOwner = {};
      $rootScope.mixStar = {};
      $rootScope.owner = "";

      // LOADING
      $rootScope.nbTrack = 0;
      $rootScope.download = 0;
      $rootScope.decode = 0;
      $rootScope.buffer = 0;

      // HISTORIC
      $rootScope.previous = [];
      $rootScope.next = [];

      // REGION SELECTION
      $rootScope.selectedRegionName = "";
      $rootScope.selectedRegion = null;
      vm.isLoopingOnRegion = false;

      // TRACK SELECTION
      $rootScope.trackSelected = null;
      $rootScope.tracks = [];

      // RATING
      $rootScope.rate = 0;
      $rootScope.max = 5;

      // TOGGLERS
      $rootScope.hasModalOpen = false;
      $rootScope.isTracking = true;
      $rootScope.isMoving = false;
      $rootScope.isCreating = false;
      $rootScope.hasClicked = false;
      $rootScope.isLoopingOnTrack = false;
    };

    $rootScope.initVar();
    $rootScope.loadMusics();

    // SHORTCUTS
    document.addEventListener("keydown", function (evt) {
      if ($rootScope.hasModalOpen) return;
      //console.log(evt.keyCode);
      switch (evt.keyCode) {
        // DELETE
        case 46:
          $rootScope.deleteRegion();
          break;
        // ESCAPE
        case 27:
          $rootScope.deselectRegion();
          $rootScope.deselectTrack();
          break;
        // S
        case 83:
          if (evt.ctrlKey && evt.shiftKey) {
            $rootScope.saveAs();
            evt.preventDefault();
          }
          else if (evt.ctrlKey) {
            $rootScope.save();
            evt.preventDefault();
          }
          break;
        // Z
        case 90:
          if (evt.ctrlKey && evt.shiftKey) Tools.redo();
          else if (evt.ctrlKey) Tools.undo();
          break;
        // SPACE
        case 32:
          $rootScope.jsonifyTrackEffects();
          evt.preventDefault();
          break;
        // BACKSPACE
        //case 8:
        //      undo();
        //      evt.preventDefault();
        //      break;
        default:
      }
      $rootScope.$digest();
    });

    // <editor-fold desc="KNOB EFFECTS">
    $rootScope.selectTrack = function (index) {
      $rootScope.deselectRegion();
      $rootScope.trackSelected = index;

      $timeout(function () {

        var knobLimiter = document.getElementById('filterLimiter');
        knobLimiter.addEventListener('change', function (e) {
          $rootScope.filterLimiter = e.target.value;

          $rootScope.tracks[$rootScope.trackSelected].hardLimiterValue = e.target.value;

          var source = $rootScope.listOfWaves[$rootScope.trackSelected].backend.source;

          if ($rootScope.preGain == null && $rootScope.limiter == null) {
            $rootScope.preGain = $rootScope.listOfWaves[$rootScope.trackSelected].backend.ac.createGain();
            $rootScope.limiter = $rootScope.listOfWaves[$rootScope.trackSelected].backend.ac.createDynamicsCompressor();
          }
          $rootScope.limiter.threshold.value = 0; // this is the pitfall, leave some headroom
          $rootScope.limiter.knee.value = 0.0; // brute force
          $rootScope.limiter.ratio.value = 20.0; // max compression
          $rootScope.limiter.attack.value = 0.005; // 5ms attack
          $rootScope.limiter.release.value = 0.050; // 50ms release
          $rootScope.preGain.gain.value = $rootScope.filterLimiter;
          source.connect($rootScope.preGain);
          $rootScope.preGain.connect($rootScope.limiter);
          $rootScope.limiter.connect($rootScope.listOfWaves[$rootScope.trackSelected].backend.ac.destination);
        });

        var knobDelayTime = document.getElementById('delayTime');
        knobDelayTime.addEventListener('change', function (e) {
          var value = e.target.value;
          $rootScope.delayTime = value;

          $rootScope.tracks[$rootScope.trackSelected].delayTime = e.target.value;

          var delay = $rootScope.listOfWaves[$rootScope.trackSelected].backend.ac.createDelay();
          delay.delayTime.value = $rootScope.delayTime;
          var feedback = $rootScope.listOfWaves[$rootScope.trackSelected].backend.ac.createGain();
          feedback.gain.value = $rootScope.feedbackGain;
          delay.connect(feedback);
          feedback.connect(delay);
          $rootScope.listOfWaves[$rootScope.trackSelected].backend.setFilter(delay);
        });

        var knobFeedbackGain = document.getElementById('feedbackGain');
        knobFeedbackGain.addEventListener('change', function (e) {
          var value = e.target.value;
          $rootScope.feedbackGain = value;

          $rootScope.tracks[$rootScope.trackSelected].delayFeedbackGain = e.target.value;

          var delay = $rootScope.listOfWaves[$rootScope.trackSelected].backend.ac.createDelay();
          delay.delayTime.value = $rootScope.delayTime;
          var feedback = $rootScope.listOfWaves[$rootScope.trackSelected].backend.ac.createGain();
          feedback.gain.value = $rootScope.feedbackGain;
          delay.connect(feedback);
          feedback.connect(delay);
          $rootScope.listOfWaves[$rootScope.trackSelected].backend.setFilter(delay);
        });

        var knobFilterDetune = document.getElementById('filterDetune');
        knobFilterDetune.addEventListener('change', function (e) {
          var value = e.target.value;
          $rootScope.filterDetune = value;

          $rootScope.tracks[$rootScope.trackSelected].filterDetune = e.target.value;

          var biquadFilter = $rootScope.listOfWaves[$rootScope.trackSelected].backend.ac.createBiquadFilter();
          biquadFilter.type = "lowshelf";
          biquadFilter.frequency.value = $rootScope.filterFrequency;
          biquadFilter.gain.value = $rootScope.filterGain;
          biquadFilter.detune.value = $rootScope.filterDetune;
          $rootScope.listOfWaves[$rootScope.trackSelected].backend.setFilter(biquadFilter);
        });

        var knobFilterFrequency = document.getElementById('filterFrequency');
        knobFilterFrequency.addEventListener('change', function (e) {
          var value = e.target.value;
          $rootScope.filterFrequency = value;

          $rootScope.tracks[$rootScope.trackSelected].filterFrequency = e.target.value;

          var biquadFilter = $rootScope.listOfWaves[$rootScope.trackSelected].backend.ac.createBiquadFilter();
          biquadFilter.type = "lowshelf";
          biquadFilter.frequency.value = $rootScope.filterFrequency;
          biquadFilter.gain.value = $rootScope.filterGain;
          biquadFilter.detune.value = $rootScope.filterDetune;
          $rootScope.listOfWaves[$rootScope.trackSelected].backend.setFilter(biquadFilter);
        });

        var knobFilterGain = document.getElementById('filterGain');
        knobFilterGain.addEventListener('change', function (e) {
          var value = e.target.value;
          $rootScope.filterGain = value;

          $rootScope.tracks[$rootScope.trackSelected].filterGain = e.target.value;

          var biquadFilter = $rootScope.listOfWaves[$rootScope.trackSelected].backend.ac.createBiquadFilter();
          biquadFilter.type = "lowshelf";
          biquadFilter.frequency.value = $rootScope.filterFrequency;
          biquadFilter.gain.value = $rootScope.filterGain;
          biquadFilter.detune.value = $rootScope.filterDetune;
          $rootScope.listOfWaves[$rootScope.trackSelected].backend.setFilter(biquadFilter);
        });
        // </editor-fold>
        // set knob value
        document.getElementById('filterLimiter').setValue($rootScope.tracks[$rootScope.trackSelected].hardLimiterValue);
        document.getElementById('delayTime').setValue($rootScope.tracks[$rootScope.trackSelected].delayTime);
        document.getElementById('feedbackGain').setValue($rootScope.tracks[$rootScope.trackSelected].delayFeedbackGain);
        document.getElementById('filterDetune').setValue($rootScope.tracks[$rootScope.trackSelected].filterDetune);
        document.getElementById('filterFrequency').setValue($rootScope.tracks[$rootScope.trackSelected].filterFrequency);
        document.getElementById('filterGain').setValue($rootScope.tracks[$rootScope.trackSelected].filterGain);

      }, 100);
    };

    $rootScope.deselectTrack = function () {
      if ($rootScope.trackSelected !== null) {
        try {
          $rootScope.trackSelected = null;
        } catch (ex) {

        }
      }
    };

    $rootScope.zoom = function (zoomLevel) {
      $rootScope.listOfWaves.forEach(function (wave) {
        wave.zoom(zoomLevel);
      });
    };

    $rootScope.toggled = function (open) {
      $log.log('Dropdown is now: ', open);
    };

    $rootScope.toggleDropdown = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $rootScope.status.isopen = !$rootScope.status.isopen;
    };

    // <editor-fold desc="EFFECTS">
    function activateEffects(region) {
      var effects = $rootScope.effects[region.id];
      var keys = Object.keys(effects);
      var effect = {region: region};
      keys.forEach(function (key) {
        switch (key) {
          case 'mute':
            if ($rootScope.effects[region.id].mute && !region.wavesurfer.isMuted) {
              region.wavesurfer.toggleMute();
            }
            else if (!$rootScope.effects[region.id].mute && region.wavesurfer.isMuted) {
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
      if (region.id === $rootScope.selectedRegionName) checkLoop();
      var waveId = region.wavesurfer.container.id.split("wave")[1];

      if ($rootScope.effects[region.id].mute && region.wavesurfer.isMuted) {
        region.wavesurfer.toggleMute();
      }
      else if (!$rootScope.effects[region.id].mute && !region.wavesurfer.isMuted) {
        region.wavesurfer.toggleMute();
      }

      delete $rootScope.activeEffects[region.id];

      if ($rootScope.smState[waveId] === "mute" && !region.wavesurfer.isMuted) region.wavesurfer.toggleMute();
      else if ($rootScope.smState[waveId] !== "mute" && region.wavesurfer.isMuted) region.wavesurfer.toggleMute();

      if ($rootScope.effects[region.id].fadeout) {
        region.wavesurfer.setVolume($rootScope.sliders['slider' + region.wavesurfer.container.id.split("wave")[1]] / 100 * $rootScope.generalVolume / 100);
      }
    }

    function evolveEffects(progress) {
      $rootScope.progress = Math.ceil(progress);

      var keys = Object.keys($rootScope.activeEffects);
      var region;
      keys.forEach(function (key) {
        region = $rootScope.activeEffects[key].region;
        var subKeys = Object.keys($rootScope.activeEffects[key]);
        subKeys.forEach(function (subKey) {
          switch (subKey) {
            case "fadein":
              var start = region.start;
              var end = region.end;
              var volume = $rootScope.sliders['slider' + region.wavesurfer.container.id.split("wave")[1]] / 100 * $rootScope.generalVolume / 100;
              var res = Math.min((progress - start) * volume / (end - start), volume);
              region.wavesurfer.setVolume(res);
              break;
            case "fadeout":
              var start = region.start;
              var end = region.end;
              var volume = $rootScope.sliders['slider' + region.wavesurfer.container.id.split("wave")[1]] / 100 * $rootScope.generalVolume / 100;
              var res = Math.max(volume - volume * ((progress - start) / (end - start)), 0);
              region.wavesurfer.setVolume(res);
              break;
            default:
          }
        });
      });
      $rootScope.$digest();
    }

    $rootScope.selectRegion = function(region) {
      $rootScope.deselectRegion();
      $rootScope.deselectTrack();
      $rootScope.selectedRegion = region;
      $rootScope.selectedRegionName = region.id;
      region.element.className += " selected";
    };

    $rootScope.deselectRegion = function () {
      if ($rootScope.selectedRegion !== null) {
        try {
          $rootScope.selectedRegionName = "";
          vm.isLoopingOnRegion = false;
          $rootScope.selectedRegion.element.className = $rootScope.selectedRegion.element.className.replace(' selected', '');
          $rootScope.selectedRegion = null;
        } catch (ex){

        }
      }
    };

    $rootScope.deleteRegion = function () {
      $rootScope.savePrevious();
      if ($rootScope.selectedRegion !== null) {
        delete $rootScope.effects[$rootScope.selectedRegionName];
        $rootScope.selectedRegion.remove();
        $rootScope.selectedRegion = null;
        $rootScope.selectedRegionName = "";
      }
    };

    $rootScope.toggleEffect = function (effect) {
      $rootScope.savePrevious();
      $rootScope.effects[$rootScope.selectedRegionName][effect] = !$rootScope.effects[$rootScope.selectedRegionName][effect];

    };

    $rootScope.toggleSoundEffect = function (effect) {
      $rootScope.toggleEffect(effect);
      var tmp = ['fadein', 'fadeout', 'mute'];
      Object.keys($rootScope.effects[$rootScope.selectedRegionName]).forEach(function (key) {
        if (key !== effect && tmp.indexOf(key) > -1) {
          $rootScope.effects[$rootScope.selectedRegionName][key] = false;
        }
      });
    };

    $rootScope.hasEffect = function (effect) {
      if ($rootScope.effects[$rootScope.selectedRegionName] !== undefined)
        return $rootScope.effects[$rootScope.selectedRegionName][effect] === true;
    };
    // </editor-fold>

    $rootScope.checkReadiness = function() {
      if ($rootScope.buffer === $rootScope.listOfSound.length) {
        $rootScope.listOfWaves.forEach(function (wave) {
          wave.toggleInteraction();
        });
        $rootScope.progress = 0;
        $rootScope.parseStorage();

        $rootScope.duration = Math.ceil($rootScope.listOfWaves[0].getDuration());
      }
    };

    $rootScope.init = function () {
      $rootScope.initWaves();
      for (var i = 0; i < $rootScope.listOfSound.length; i++) {
        $rootScope.smState[i] = null;
      }
    };

    $rootScope.initWaves = function () {
      for (var i = 0; i < $rootScope.listOfSound.length; i++) {
        var cont = '#wave' + i;

        $rootScope.listOfWaves.push(WaveSurfer.create({
          container: cont,
          waveColor: '#bbb',
          progressColor: '#347',
          cursorColor: '#000'
        }));
        $rootScope.listOfWaves[i].toggleInteraction();
        $rootScope.listOfWaves[i].color = Tools.randomColor(0.5);

        if (i === 0) {
          $rootScope.listOfWaves[i].on('audioprocess', evolveEffects);
        }

        $rootScope.listOfWaves[i].on('ready', function () {
          console.log("song ready");
          $rootScope.buffer += 1;
          $rootScope.checkReadiness();
          $rootScope.$digest();
          // load effects values for each tracks
          var trackEffects = {
            'hardLimiterValue': 0,
            'delayTime': 0,
            'delayFeedbackGain': 0,
            'filterDetune': 0,
            'filterFrequency': 0,
            'filterGain': 0
          };
          $rootScope.tracks.push(trackEffects);
        });

        $rootScope.listOfWaves[i].on('seek', function (progress) {
          if ($rootScope.seeking === true) return;
          $rootScope.seeking = true;
          var willPlay = false;
          $rootScope.listOfWaves.forEach(function (wave) {
            willPlay = wave.getCurrentTime() - wave.getDuration() === 0 || willPlay;
          });
          $rootScope.listOfWaves.forEach(function (wave, index) {
            wave.seekTo(progress);
            if (index === 0) {
              $rootScope.progress = Math.ceil(progress * $rootScope.duration);
            } else if (index === $rootScope.listOfWaves.length - 1) {
              try {
                $rootScope.$digest();
              } catch (ex) {

              }
            }
            if (willPlay) wave.play();
          });
          $rootScope.seeking = false;
        });

        $rootScope.listOfWaves[i].on('finish', function () {
          $rootScope.listOfWaves.forEach(function (wave) {
            wave.stop();
            wave.stop();
            if (isLoopingOnTrack) {
              wave.play();
            }
          });
        });

        $rootScope.listOfWaves[i].enableDragSelection({
          color: $rootScope.listOfWaves[i].color
        });

        $rootScope.listOfWaves[i].on('region-click', function (region, e) {
          if (!Tools.isSelected(region)) {
            e.stopPropagation();
            $rootScope.selectRegion(region);
            $rootScope.$digest();
          }
          $rootScope.hasClicked = true;
        });

        $rootScope.listOfWaves[i].on('region-dblclick', function (region, e) {
          e.stopPropagation();
        });

        $rootScope.listOfWaves[i].on('region-updated', function (region, e) {
          if (!$rootScope.isMoving && (!$rootScope.isCreating || $rootScope.hasClicked)) {
            $rootScope.savePrevious();
            $rootScope.isMoving = true;
          }
          if (region.end - region.start < 0.5) return;
          $rootScope.selectRegion(region);
          if ($rootScope.effects[region.id] === undefined)
            $rootScope.effects[region.id] = {};
          $rootScope.$digest();
        });

        $rootScope.listOfWaves[i].on('region-update-end', function (region) {
          $rootScope.isMoving = false;
          $rootScope.isCreating = false;
          $rootScope.hasClicked = false;
        });

        $rootScope.listOfWaves[i].on('region-created', function (region, e) {
          $rootScope.isCreating = true;
          $rootScope.savePrevious();
        });

        $rootScope.listOfWaves[i].on('region-in', activateEffects);
        $rootScope.listOfWaves[i].on('region-out', deactivateEffects);

        $rootScope.listOfWaves[i].load($rootScope.listOfSound[i]);

      }
    };

    $rootScope.playAllTracks = function () {
      for (var i = 0; i < $rootScope.listOfWaves.length; i++) {
        $rootScope.listOfWaves[i].playPause();
      }
    };

    $rootScope.stopAllTracks = function () {
      $rootScope.listOfWaves.forEach(function (wave) {
        try {
          wave.stop();
        } catch (e) {

        }
      });

      if (vm.isLoopingOnRegion) {
        var nextProgress = $rootScope.selectedRegion.start / $rootScope.listOfWaves[0].getDuration();
        $rootScope.progress = nextProgress;
        $rootScope.listOfWaves[0].seekTo(nextProgress);
      }
      else {
        if($rootScope.progress !== null) $rootScope.progress = 0;
      }
    };

    $rootScope.loopTrack = function (isLooping, event) {
      $rootScope.isLoopingOnTrack = isLooping;
      event.target.blur();
    };

    $rootScope.loopRegion = function (event) {
      if ($rootScope.listOfWaves[0].getCurrentTime() >= $rootScope.selectedRegion.end || $rootScope.listOfWaves[0].getCurrentTime() <= $rootScope.selectedRegion.start) {
        if (vm.isLoopingOnRegion)$rootScope.listOfWaves[0].seekTo($rootScope.selectedRegion.start / $rootScope.listOfWaves[0].getDuration());
      }
      event.target.blur();
    };

    function checkLoop() {
      if (vm.isLoopingOnRegion) {
        $rootScope.listOfWaves[0].seekTo($rootScope.selectedRegion.start / $rootScope.listOfWaves[0].getDuration());
      }
    }

    $rootScope.updateTrackVolume = function (index) {
      if ($rootScope.smState[index] == "mute") {
        $rootScope.smState[index] = null;
      }
      $rootScope.listOfWaves[index].setVolume($rootScope.sliders['slider' + index] / 100 * $rootScope.generalVolume / 100);
    };

    $rootScope.updateAllTracksVolume = function (value) {
      $rootScope.generalVolume = value;
      for (var i = 0; i < $rootScope.listOfWaves.length; i++) {
        $rootScope.updateTrackVolume(i);
      }
    };

    $rootScope.mute = function (track) {
      $rootScope.listOfWaves[track].toggleMute();
    };

    $rootScope.updateSm = function (track, value, event) {
      event.stopPropagation();
      if (value == 'solo' && $rootScope.nbSolo == 0 && $rootScope.smState[track] != 'solo') {
        $rootScope.smState[track] = 'solo';
        $rootScope.nbSolo++;
        for (var i = 0; i < $rootScope.smState.length; i++) {
          if (i != track) {
            $rootScope.smState[i] = 'mute';
          }
        }
      } else if (value == 'solo' && $rootScope.nbSolo > 0 && $rootScope.smState[track] != 'solo') {
        $rootScope.smState[track] = 'solo';
        $rootScope.nbSolo++;
      } else if (value == 'mute' && $rootScope.nbSolo > 0 && $rootScope.smState[track] == 'mute') {
        $rootScope.smState[track] = 'solo';
        $rootScope.nbSolo++;
      } else if (value == 'mute' && $rootScope.smState[track] == 'solo') {
        $rootScope.smState[track] = 'mute';
        $rootScope.nbSolo--;
      } else if (value == 'solo' && $rootScope.smState[track] == 'solo' && $rootScope.nbSolo > 1) {
        $rootScope.smState[track] = 'mute';
        $rootScope.nbSolo--;
      } else if (value == 'solo' && $rootScope.smState[track] == 'solo' && $rootScope.nbSolo == 1) {
        for (var i = 0; i < $rootScope.smState.length; i++) {
          $rootScope.smState[i] = null;
        }
        $rootScope.nbSolo--;
      } else if (value == 'mute' && $rootScope.nbSolo == 0 && $rootScope.smState[track] == null) {
        $rootScope.smState[track] = 'mute';
      } else if (value == 'mute' && $rootScope.nbSolo == 0 && $rootScope.smState[track] == 'mute') {
        $rootScope.smState[track] = null;
      }
      $rootScope.manageSoloMute($rootScope.smState);
    };

    $rootScope.reinitSm = function () {
      for (var i = 0; i < $rootScope.smState.length; i++) {
        $rootScope.smState[i] = null;
        $rootScope.nbSolo = 0;
      }
      $rootScope.manageSoloMute($rootScope.smState);
    };

    $rootScope.manageSoloMute = function (smState) {
      for (var i = 0; i < smState.length; i++) {
        if (smState[i] == 'mute' && $rootScope.listOfWaves[i].isMuted != true) {
          $rootScope.listOfWaves[i].toggleMute();
        } else if (smState[i] == 'solo' && $rootScope.listOfWaves[i].isMuted == true
          || smState[i] == null && $rootScope.listOfWaves[i].isMuted == true) {
          $rootScope.listOfWaves[i].toggleMute();
        }
      }
    };

    $rootScope.solo = function (track) {
      for (var i = 0; i < $rootScope.listOfWaves.length; i++) {
        if (i != track) {
          $rootScope.listOfWaves[i].toggleMute();
        }
      }
    };

    var knobs = document.getElementsByTagName('webaudio-knob');
    for (var i = 0; i < knobs.length; i++) {
      var knob = knobs[i];
      knob.addEventListener('change', function (e) {
      });
    }

    var sliderGeneral = document.getElementById('sliderGeneral');
    sliderGeneral.addEventListener('change', function (e) {
      var value = e.target.value;
      $rootScope.updateAllTracksVolume(value);
    });

    $rootScope.volumeStart = function () {
      if ($rootScope.slidersInitialized) return;
      $rootScope.slidersInitialized = true;

      var keys = Object.keys($rootScope.sliders);

      keys.forEach(function (key) {
        document.getElementById(key).addEventListener('change', function (e) {
          $rootScope.sliders[key] = e.target.value;
          $rootScope.updateTrackVolume(key.split('r')[1]);
        });
      });
    };
  });

