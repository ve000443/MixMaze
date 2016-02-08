angular.module('frontEndApp').controller('ModalSaveCtrl', function ($scope, $uibModalInstance, items) {
  $scope.name = items;

  $scope.ok = function () {
    $uibModalInstance.close($scope.name);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.keyPressed = function(evt){
    if(evt.keyCode === 13) $scope.ok();
  };
});
