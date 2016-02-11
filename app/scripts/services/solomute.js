'use strict';

/**
 * @ngdoc service
 * @name frontEndApp.SoloMute
 * @description
 * # SoloMute
 * Service in the frontEndApp.
 */
angular.module('frontEndApp')
  .service('SoloMute', function ($rootScope) {
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
  });
