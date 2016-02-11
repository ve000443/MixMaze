'use strict';

/**
 * @ngdoc service
 * @name frontEndApp.Persistence
 * @description
 * # Persistence
 * Service in the frontEndApp.
 */
angular.module('frontEndApp')
  .service('Persistence', function ($rootScope, $http, Tools) {
    $rootScope.storeMixInDatabase = function (name) {
      $rootScope.mixName = name;
      //var json = jsonifyRegions();
      var json = $rootScope.jsonify();
      var mix = {
        owner: $rootScope.user.name,
        name: $rootScope.mixName,
        music: $rootScope.songName,
        data: json
      };
      $http.post($rootScope.endpoint + '/mix/', mix).then(
        function successCallback(response) {
          $rootScope.parseStorage();
        }, function errorCallback(response) {
          console.log("Error : " + response);
        });
    };

    $rootScope.savePrevious = function (fromRedo){
      if ($rootScope.isTracking) {
        //$rootScope.previous.push(jsonifyRegions());
        $rootScope.previous.push($rootScope.jsonify());
        if(!fromRedo) $rootScope.next = [];
      }
    };

    $rootScope.save = function () {
      if (!Boolean($rootScope.mixName)) {
        $rootScope.saveAs();
      } else {
        $rootScope.updateMix($rootScope.mixName);
      }
    };

    $rootScope.saveAs = function () {
      var thenFct = function (name) {
        $rootScope.hasModalOpen = false;
        $rootScope.mixName = name;
        $rootScope.owner = $rootScope.user.name;
        $rootScope.rate = 0;
        $rootScope.storeMixInDatabase(name);
        $rootScope.hasModalOpen = false;
      };

      var resolve = {
        items: function () {
          return $rootScope.mixName;
        }
      };

      Tools.openModal('modalSave', 'ModalSaveCtrl', resolve, thenFct);
    };

    $rootScope.updateMix = function (name) {
      var json = $rootScope.jsonify();
      console.log($rootScope.user.name);
      var mix = {owner: $rootScope.user.name, name: name, music: $rootScope.songName, data: json};

      $http.put($rootScope.endpoint + '/mix/', mix).then(
        function successCallback(response) {
          console.log("mix updated");
          $rootScope.parseStorage();
        }, function errorCallback(response) {
          console.log("Error : " + response);
        }
      );
    };

    // Modale for mix deletion
    $rootScope.deleteMixModal = function (mixName) {
      $rootScope.openModalDelete('mix', mixName);
    };

    $rootScope.openModalDeleteUser = function (name) {
      $rootScope.openModalDelete('user', name);
    };

    $rootScope.openModalDelete = function (targetType, name){
      var thenFct = function(name){
        if(targetType === 'user') $rootScope.deleteUser(name);
        else  $rootScope.deleteMix(name);
      };

      var resolve = {
        items: function(){
          return name === undefined ? (targetType === 'user' ? $rootScope.user.name : $rootScope.mixName) : name;
        }
      };

      Tools.openModal('modalDelete', 'ModalSaveCtrl', resolve, thenFct);
    };

    $rootScope.deleteMix = function (mixName) {
      mixName = mixName === undefined ? $rootScope.mixName : mixName;
      $http.delete($rootScope.endpoint + '/mix/' + mixName + '/' + $rootScope.user.name).then(
        function successCallback(response) {
          console.log("mix deleted");
          $rootScope.parseStorage();
          if(mixName === $rootScope.mixName) {
            $rootScope.mixName = '';
            $rootScope.owner = '';
            $rootScope.rating = 0;
          }
        }, function errorCallback(response) {
          console.log("Error : " + response);
        }
      );
    };

    $rootScope.deleteUser = function(name){
      if(name === undefined) return;
      $http.delete($rootScope.endpoint + '/users/' + name + '/' + $rootScope.user.name).then(
        function successCallback(response) {
          console.log("user deleted");
        }, function errorCallback(response) {
          console.log("Error : " + response);
        }
      );
    };

    $rootScope.openModalLogIn = function(){
      var resolve = {operation:function(){return 'login';}};
      Tools.openModal('modalSession', 'ModalSessionCtrl', resolve);
    };

    $rootScope.openModalSignUp = function(){
      var resolve = {operation:function(){return 'signup';}};
      Tools.openModal('modalSession', 'ModalSessionCtrl', resolve);
    };

    $rootScope.loadMix = function(mixName) {
      $rootScope.savePrevious();
      $rootScope.mixName = mixName;
      $rootScope.owner = $rootScope.mixOwner[mixName];
      $rootScope.loadAllEffects($rootScope.mixData[mixName]);
      $rootScope.rate = $rootScope.mixStar[mixName];
    };

    $rootScope.jsonify = function(){
      var res = {};
      res.tracks = JSON.parse($rootScope.jsonifyTrackEffects());
      res.regions = JSON.parse($rootScope.jsonifyRegions());
      return JSON.stringify(res);
    };

    $rootScope.loadAllEffects = function(state){
      state = state === undefined ? JSON.parse($rootScope.mixData) : JSON.parse(state);

      $rootScope.loadTrackEffects(state.tracks);
      $rootScope.loadRegions(state.regions);
    };

    $rootScope.jsonifyTrackEffects = function(){
      var res = [];
      $rootScope.tracks.forEach(function(track){
        res.push(track);
      });
      return JSON.stringify(res);
    };

    $rootScope.loadTrackEffects = function(effects){
      if (typeof effects === 'string')
        effects = JSON.parse(effects);

      $rootScope.tracks = effects;
      if($rootScope.trackSelected !== null ){
        document.getElementById('filterLimiter').setValue($rootScope.tracks[$rootScope.trackSelected].hardLimiterValue);
        document.getElementById('delayTime').setValue($rootScope.tracks[$rootScope.trackSelected].delayTime);
        document.getElementById('feedbackGain').setValue($rootScope.tracks[$rootScope.trackSelected].delayFeedbackGain);
        document.getElementById('filterDetune').setValue($rootScope.tracks[$rootScope.trackSelected].filterDetune);
        document.getElementById('filterFrequency').setValue($rootScope.tracks[$rootScope.trackSelected].filterFrequency);
        document.getElementById('filterGain').setValue($rootScope.tracks[$rootScope.trackSelected].filterGain);
      }
    };

    $rootScope.jsonifyRegions = function() {
      var res = {};
      $rootScope.listOfWaves.forEach(function (wavesurfer, index) {
        res[Tools.nameRecover($rootScope.listOfSound[index])] = Object.keys(wavesurfer.regions.list).map(function (id) {
          var region = wavesurfer.regions.list[id];
          var effects = {};
          try {
            Object.keys($rootScope.effects[region.id]).forEach(function (key) {
              effects[key] = $rootScope.effects[region.id][key];
            });
          } catch (ex) {
          }
          return {
            start: region.start,
            end: region.end,
            attributes: region.attributes,
            data: region.data,
            effects: effects,
            id: region.id,
            isSelected: region.id === $rootScope.selectedRegionName
          };
        });
      });
      return JSON.stringify(res);
    };

    $rootScope.saveRegions = function () {
      localStorage[$rootScope.songName] = $rootScope.jsonifyRegions();
    };

    $rootScope.loadRegions = function (regions) {
      $rootScope.isTracking = false;
      if (regions === undefined) {
        if (localStorage[$rootScope.songName] === undefined) return;
        $rootScope.deselectRegion();
        regions = JSON.parse(localStorage[$rootScope.songName]);
      }
      else if (typeof regions === 'string')
        regions = JSON.parse(regions);
      $rootScope.effects = {};
      $rootScope.listOfWaves.forEach(function (wavesurfer, index) {
        wavesurfer.clearRegions();
        var piste = Tools.nameRecover($rootScope.listOfSound[index]);
        if (regions[piste] !== undefined) {
          regions[piste].forEach(function (region) {
            region.color = wavesurfer.color;
            wavesurfer.addRegion(region);
            var keys = Object.keys(wavesurfer.regions.list);
            var newRegion = wavesurfer.regions.list[keys[keys.length - 1]];
            if (region.isSelected) {
              $rootScope.selectRegion(newRegion);
            }
            $rootScope.effects[newRegion.id] = region.effects;
          });
        }
      });
      $rootScope.isTracking = true;
    };

    $rootScope.parseStorage = function() {
      $rootScope.listOfMix = [];
      $http.get($rootScope.endpoint + "/mix/" + $rootScope.songName).then(
        function successCallback(response) {
          response.data.forEach(function (key) {
            $rootScope.listOfMix.push(key.name);
            $rootScope.mixData[key.name] = key.data;
            $rootScope.mixOwner[key.name] = key.owner;

            $http.get($rootScope.endpoint + '/star/' + key.name).then(
              function successCallback(response) {
                var valueStar = 0;
                response.data.forEach(function (mix){
                  valueStar += mix.star;
                });
                $rootScope.mixStar[key.name] = valueStar / response.data.length;

              }, function errorCallback(response) {
                console.log("Error : " + response);
              }
            );
          });
        }, function errorCallback(response) {
          console.error(response);
        }
      )
    };

    $rootScope.clearStorage = function () {
      Object.keys(localStorage).forEach(function (key) {
        if (key.indexOf("MixMaze_") > -1) {
          delete localStorage[key];
        }
      });
      $rootScope.listOfMix = [];
    };
  });
