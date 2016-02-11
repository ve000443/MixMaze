'use strict';

/**
 * @ngdoc service
 * @name frontEndApp.Effects
 * @description
 * # Effects
 * Service in the frontEndApp.
 */
angular.module('frontEndApp')
  .service('Effects', function ($rootScope) {
    $rootScope.activateEffects = function(region) {
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
    };

    $rootScope.deactivateEffects = function(region) {
      if (region.id === $rootScope.selectedRegionName) $rootScope.checkLoop();
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
    };

    $rootScope.evolveEffects = function (progress) {
      $rootScope.progress = Math.ceil(progress);

      var keys = Object.keys($rootScope.activeEffects);
      var region;
      var start, end, volume, res;
      keys.forEach(function (key) {
        region = $rootScope.activeEffects[key].region;
        var subKeys = Object.keys($rootScope.activeEffects[key]);
        subKeys.forEach(function (subKey) {
          switch (subKey) {
            case "fadein":
              start = region.start;
              end = region.end;
              volume = $rootScope.sliders['slider' + region.wavesurfer.container.id.split("wave")[1]] / 100 * $rootScope.generalVolume / 100;
              res = Math.min((progress - start) * volume / (end - start), volume);
              region.wavesurfer.setVolume(res);
              break;
            case "fadeout":
              start = region.start;
              end = region.end;
              volume = $rootScope.sliders['slider' + region.wavesurfer.container.id.split("wave")[1]] / 100 * $rootScope.generalVolume / 100;
              res = Math.max(volume - volume * ((progress - start) / (end - start)), 0);
              region.wavesurfer.setVolume(res);
              break;
            default:
          }
        });
      });
      $rootScope.$digest();
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
  });
