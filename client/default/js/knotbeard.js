/**
 * Created by mx² on 15/01/16.
 */


angular.module('knotbeard', ['ngRoute', 'kb.controllers'])
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/episodes.html', {
         templateUrl: '/episodes.html',
         controller: 'episodes'
      }); 
    $routeProvider
      .when('/add-serie.html', {
         templateUrl: '/add-serie.html',
         controller: 'add-serie'
      });
    $routeProvider
      .when('index.html', {
         templateUrl: 'index.html',
         controller: 'series'
      }); 
    $locationProvider.html5Mode(true).hashPrefix("!");
  }]);
angular.module('kb.controllers', [])
  .controller('series', ['$scope', '$http',
    function($scope, $http) {
      $http({method: "GET", url: "/api/Series"}).
        then(function(response) {
          $scope.series = response.data;
        }, function(error) {
          $scope.series = [];
        });
    }
  ])
  .controller('add-serie', ['$scope', '$http', '$window',
    function($scope, $http, $window) {
      $scope.databaseSearch = function () {
        //@TODO: Get this url from handler config and img too
        $http({method: "GET", url: "/api/Series/api/database/search?q=" + $scope.query}).
          then(function(response) {
            $scope.series = response.data;
          }, function(error) {
            $scope.series = [];
          });
      }
      $scope.databaseLoad = function (id) {
      console.log('ID', id);
        //@TODO: Get this url from handler config and img too
        $http({method: "POST", url: "/api/Series/api/database/load", data:{id:id}}).
          then(function(response) {
            //$window.location.href = '/index.html';
          }, function(error) {
          console.log('ERROR', error);
            $scope.series = [];
          });
      }
    }
  ])
  .controller('episodes', ['$scope', '$http', '$location',
    function($scope, $http, $location) {
      var id = $location.search().id;
      $http({method: "GET", url: "/api/Series/" + id + "/Episodes", data:{id:id}}).
        then(function(response) {
      console.log('RESPONSE', response);
          $scope.episodes = response.data;
        }, function(error) {
          $scope.episodes = [];
        });
    }
  ])


