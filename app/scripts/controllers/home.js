'use strict';

/**
 * @ngdoc function
 * @name frontEndApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the frontEndApp
 */
angular.module('frontEndApp')
  .controller('HomeCtrl', function ($http, $location, $cookies, $cookieStore) {

    var home = this;

    home.pseudo="";
    home.email="";
    home.password="";
    home.passwordConfirm="";
    home.userExists = false;
    home.http = $http;

    home.pseudoConnection = "";
    home.passwordConnection = "";
    home.goodConnection = true;
    home.badConfirmation = false;

    home.createUser = function(){
      home.badConfirmation = home.password !== home.passwordConfirm;
      if(!home.badConfirmation) {

        var data = {
          pseudo: home.pseudo,
          email: home.email,
          password: home.password
        };
        home.http.get("http://localhost:8080/users/" + home.pseudo).then(
          function successCallback(response) {
            home.userExists = (response.data !== "");
            if (!home.userExists) {
              home.http.post('http://localhost:8080/users/', data).then(
                function successCallback(response) {
                  console.log(response);
                  $cookieStore.put("user", data.pseudo);
                  $location.path("/arrangement");
                }, function errorCallback(response) {
                  console.log("Error : " + response);
                  // called asynchronously if an error occurs
                  // or server returns response with an error status
                }
              );
            }
          }, function errorCallback(response) {
            console.error;
            // called asynchronously if an error occurs
            // or server returns response with an error status
          }
        );
      }
    };

    home.connect = function(){
      home.http.get("http://localhost:8080/users/"+home.pseudoConnection).then(
        function successCallback(response){
          var exists = (response.data !== "");
          var user = response.data;
          home.goodConnection = exists && (user.password === home.passwordConnection);
          if(home.goodConnection){
            $cookieStore.put("user", user.pseudo);
            $location.path("/arrangement");
          }
        }, function errorCallback(response) {
          console.error;
          // called asynchronously if an error occurs
          // or server returns response with an error status
        }
      );
    }

    home.inscription = function(){
      home.createUser();
    }

    home.connection = function(){
      home.connect();
    }
  });
