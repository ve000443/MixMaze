'use strict';

/**
 * @ngdoc service
 * @name frontEndApp.Tools
 * @description
 * # Tools
 * Service in the frontEndApp.
 */
angular.module('frontEndApp')
  .service('Tools', function ($rootScope, $uibModal, $http) {
    var tools = this;

    tools.openModal = function(template, controller, resolve, thenFct, otherwiseFct, size){
      var defaultFct = function(){
        $rootScope.hasModalOpen = false;
      };
      $rootScope.hasModalOpen = true;

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'views/' + template + '.html',
        controller: controller,
        size: size,
        resolve: resolve
      });

      modalInstance.result.then(thenFct === undefined ? defaultFct : thenFct, otherwiseFct === undefined ? defaultFct : otherwiseFct);
    };

    tools.blur = function(event){
      event.target.blur();
    };

    tools.getPercent = function(current, total){
      return Math.round(current/total*100);
    };

    tools.timeFormat = function (duration){
      return tools.pad(Math.floor(duration/60), 2) + ":" + tools.pad(Math.floor(duration%60), 2);
    };

    tools.nameRecover = function(str){
      var splitted = str.split("/");
      return splitted[splitted.length - 1].split(".")[0];
    };

    tools.randomColor = function(alpha) {
      return 'rgba(' + [
          ~~(Math.random() * 255),
          ~~(Math.random() * 255),
          ~~(Math.random() * 255),
          alpha || 1
        ] + ')';
    };

    tools.pad = function(num, size) {
      var s = num+"";
      while (s.length < size) s = "0" + s;
      return s;
    };

    tools.isSelected = function(region){
      return region.id === $rootScope.selectedRegionName;
    };

    tools.undo = function() {
      if ($rootScope.previous.length === 0) return;
      $rootScope.next.push($rootScope.jsonify());
      $rootScope.deselectRegion();
      var previousState = $rootScope.previous.pop();
      $rootScope.loadAllEffects(previousState);
    };

    tools.redo = function() {
      if ($rootScope.next.length === 0) return;
      $rootScope.savePrevious(true);
      $rootScope.deselectRegion();
      var nextState = $rootScope.next.pop();
      $rootScope.loadAllEffects(nextState);
    }
  });
