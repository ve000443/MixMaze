angular.module('frontEndApp').controller('ModalUserCtrl', function ($scope, $uibModalInstance, $rootScope, $http) {
  $scope.details = {};

  $http.get("http://xythe.xyz:8080/users").then(
    function successCallback(response){
      $rootScope.listOfUsers = response.data;
    }, function errorCallback(response) {
    }
  );

  $scope.getUserDetails = function(pseudo){
    $http.get("http://xythe.xyz:8080/users/" + pseudo).then(
      function successCallback(response){
        $scope.details = response.data;
      }, function errorCallback(response) {
      }
    );
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
