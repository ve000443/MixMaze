angular.module('frontEndApp').controller('ModalMixManagementCtrl', function ($scope, $uibModalInstance, $rootScope, $http) {
  $scope.details = [];
  $scope.mixes = {};

  $http.get("http://xythe.xyz:8080/musics").then(
    function successCallback(response){
      $rootScope.musics = response.data;
    }, function errorCallback(response) {
    }
  );

  $scope.getSongMixes = function(songName){
    console.log("http://xythe.xyz:8080/mix/"+songName);
    $http.get("http://xythe.xyz:8080/mix/"+songName).then(
      function successCallback(response){
        $scope.details = response.data;
      }, function errorCallback(response) {
      }
    )
  };

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
