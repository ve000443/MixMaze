'use strict';

/**
 * @ngdoc service
 * @name frontEndApp.Rating
 * @description
 * # Rating
 * Service in the frontEndApp.
 */
angular.module('frontEndApp')
  .service('Rating', function ($rootScope, $http) {
    $rootScope.noteMix = function(rate){
      if($rootScope.user.name === null){
        console.log("not connected");
      }
      else{
        var star = {mixName : $rootScope.mixName, userName: $rootScope.user.name, star : rate};
        $http.get($rootScope.endpoint + '/star/' + $rootScope.mixName + "/" + $rootScope.user.name).then(
          function successCallback(response) {
            console.log(response.data);
            if(response.data.length === 0){
              $http.post($rootScope.endpoint + '/star', star).then(
                function successCallback(response) {
                  console.log("star added");
                }, function errorCallback(response) {
                  console.log("Error : " + response);
                }
              );
            }
            else{
              $http.put($rootScope.endpoint + '/star', star).then(
                function successCallback(response) {
                  console.log("star modified");
                }, function errorCallback(response) {
                  console.log("Error : " + response);
                }
              );
            }
          }, function errorCallback(response) {
            console.log("Error : " + response);
          }
        );
      }
    };

    $rootScope.hoveringOver = function(value) {
      $rootScope.overStar = value;
    };
  });
