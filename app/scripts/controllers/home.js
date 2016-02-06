'use strict';

/**
 * @ngdoc function
 * @name frontEndApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the frontEndApp
 */
angular.module('frontEndApp')
  .controller('HomeCtrl', function ($http, $location) {

    var home = this;

    home.pseudo="";
    home.email="";
    home.password="";
    home.passwordConfirm="";
    home.userExists = false;
    home.http = $http;

    home.getUserByPseudo = function(){
      home.http.get("http://localhost:8080/users/"+home.pseudo).then(

        function successCallback(response){
          home.userExists = (response.data !== "");
          if(! home.userExists){
            home.createUser();
          }
          // this callback will be called asynchronously
          // when the response is available
        }, function errorCallback(response) {
          console.error;
          // called asynchronously if an error occurs
          // or server returns response with an error status
        }
      );
    };

    home.createUser = function(){
      var data = {
        pseudo: home.pseudo,
        email: home.email,
        password: home.password
      };
      console.log(data);
      home.http.post('http://localhost:8080/users/',data).then(
        function successCallback(response){
          console.log(response);
          $location.path("/arrangement");
        }, function errorCallback(response) {
          console.log("Error : "+response);
          // called asynchronously if an error occurs
          // or server returns response with an error status
        }
      );
    };

    home.inscription = function(){
      home.getUserByPseudo();
    }
  });
