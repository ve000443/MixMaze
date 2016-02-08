angular.module('frontEndApp').controller('ModalUserCtrl', function ($scope, $uibModalInstance, $rootScope, $http) {
  $scope.details = {};
  $scope.mixes = {};

  $http.get($rootScope.endpoint + "/users").then(
    function successCallback(response){
      $rootScope.listOfUsers = response.data;
    }, function errorCallback(response) {
    }
  );

  $scope.getUserDetails = function(pseudo){
    $http.get($rootScope.endpoint + "/users/" + pseudo).then(
      function successCallback(response){
        $scope.details = response.data;
      }, function errorCallback(response) {
      }
    );
    $http.get($rootScope.endpoint + "/users/" + pseudo + "/mixes").then(
      function successCallback(response){
        $scope.mixes = response.data;
        $scope.mixes.forEach(function(mix, index){
          getRating(mix.name, index);
        })
      }, function errorCallback(response){
      }
    )
  };

  function getRating(mixName, index){
    $http.get($rootScope.endpoint + "/star/" + mixName).then(
      function successCallback(response) {
        var valueStar = 0;
        response.data.forEach(function (mix){
          valueStar += mix.star;
        });
        $scope.mixes[index].rating = valueStar / response.data.length;
      }
    )
  }

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.keyPressed = function(evt){
    if(evt.keyCode === 13) $scope.ok();
  };
});
