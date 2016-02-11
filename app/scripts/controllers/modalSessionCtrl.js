angular.module('frontEndApp').controller('ModalSessionCtrl', function ($scope, $uibModalInstance, $http, $cookieStore, $rootScope, operation) {

  $scope.operation = operation;

  $scope.pseudo = "";
  $scope.email = "";
  $scope.password = "";
  $scope.passwordConfirm = "";
  $scope.userExists = false;
  $scope.http = $http;

  $scope.pseudoConnection = "";
  $scope.passwordConnection = "";
  $scope.goodConnection = true;
  $scope.badConfirmation = false;

  $scope.submit = function () {
    if (operation === 'signup') $scope.createUser();
    else $scope.connect();
  };

  $scope.createUser = function () {
    $scope.badConfirmation = $scope.password !== $scope.passwordConfirm;
    if (!$scope.badConfirmation) {

      var data = {
        pseudo: $scope.pseudo,
        email: $scope.email,
        password: $scope.password
      };
      $scope.http.get($rootScope.endpoint + "/users/" + $scope.pseudo).then(
        function successCallback(response) {
          $scope.userExists = (response.data !== "");
          if (!$scope.userExists) {
            $scope.http.post($rootScope.endpoint + '/users/', data).then(
              function successCallback(response) {
                $cookieStore.put("user", data.pseudo);
                $cookieStore.put("role", 'member');
                $rootScope.user.name= data.pseudo;
                $rootScope.user.role= 'member';
                $rootScope.isReadonly = false;
                $scope.ok();
              }, function errorCallback(response) {
              }
            );
          }
        }, function errorCallback(response) {
        }
      );
    }
  };

  $scope.connect = function () {
    $scope.http.get($rootScope.endpoint + "/users/" + $scope.pseudo).then(
      function successCallback(response) {
        var exists = (response.data !== "");
        var user = response.data;
        $scope.goodConnection = exists && (user.password === $scope.password);
        if ($scope.goodConnection) {
          $cookieStore.put("user", user.pseudo);
          $cookieStore.put("role", user.role);
          $rootScope.user.name= user.pseudo;
          $rootScope.user.role= user.role;
          $rootScope.isReadonly = false;
          $scope.ok();
        }
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

  $scope.keyPressed = function (evt) {
    if (evt.keyCode === 13) $scope.submit();
  };
});
