'use strict';

/**
 * @ngdoc service
 * @name frontEndApp.Session
 * @description
 * # Session
 * Service in the frontEndApp.
 */
angular.module('frontEndApp')
  .service('Session', function ($rootScope, $cookieStore) {
    $rootScope.user = {
      name: ($cookieStore.get("user") !== undefined) ? $cookieStore.get("user") : null,
      role: ($cookieStore.get("role") !== undefined) ? $cookieStore.get("role") : "guest"
    };

    $rootScope.hasRights = function(level){
      var res = false;
      //noinspection FallThroughInSwitchStatementJS
      switch(level){
        case 0:
          res = res || $rootScope.user.role === 'member';
        case 1:
          res = res || $rootScope.user.role === 'moderator';
        default:
          res = res || $rootScope.user.role === 'admin';
      }
      return res;
    };

    $rootScope.hasOwnership = function(){
      return $rootScope.user.name === $rootScope.owner;
    };

    $rootScope.logOut = function(){
      $cookieStore.put('user', undefined);
      $cookieStore.put('role', undefined);
      $rootScope.user.name = null;
      $rootScope.user.role = 'guest';
    };

  });
