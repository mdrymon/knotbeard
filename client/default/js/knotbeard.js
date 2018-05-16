// jQuery
/*$(document).ready(function() {
    $('#dt-episodes').dataTable();
} );*/


// Angular
angular.module('knotbeard', ['ngRoute', 'kb.controllers', 'kb.services', 'kb.directives'])
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/episodes.html', {
         templateUrl: '/episodes.html',
         controller: 'episodes'
      }) 
      .when('/add-serie.html', {
         templateUrl: '/add-serie.html',
         controller: 'add-serie'
      })
      .when('index.html', {
         templateUrl: 'index.html',
         controller: 'series'
      }); 
    $locationProvider.html5Mode(true).hashPrefix("!");
  }]);

angular.module('kb.services', [])
  .value('$kb_moment', moment);

angular.module('kb.controllers', [])
  .controller('series', ['$scope', '$http',
    function($scope, $http) {
      $http({method: "GET", url: "/knotbeard-api/Series"}).
        then(function(response) {
        console.log('R', response);
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
        $http({method: "GET", url: "/knotbeard-api/Series/database/search?q=" + $scope.query}).
          then(function(response) {
            $scope.series = response.data;
          }, function(error) {
            $scope.series = [];
          });
      }
      $scope.databaseLoad = function (id) {
      console.log('ID', id);
        //@TODO: Get this url from handler config and img too
        $http({method: "POST", url: "/knotbeard-api/Series/database/load", data:{id:id}}).
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
      $http({method: "GET", url: "/knotbeard-api/Series/" + id + "/Episodes", data:{id:id}}).
        then(function(response) {
          var chunk = {};
          var reverseChunk = {};
          var episodes = response.data.reverse();
          for (var i = 0; i < episodes.length; i++) {
            if (!chunk[' ' + episodes[i].Season]) {
              chunk[' ' + episodes[i].Season] = [];
            }
          }
          var chunkKeys = Object.keys(chunk);
          for (i = 0; i < chunkKeys.length; i++) {
            if (!reverseChunk[chunkKeys[i]]) {
              reverseChunk[chunkKeys[i]] = [];
            }
          }
          for (i = 0; i < episodes.length; i++) {
            reverseChunk[' ' + episodes[i].Season].push(episodes[i]);
          }
          $scope.chunks = reverseChunk;
        }, function(error) {
          $scope.episodes = [];
        });
    }
  ]);

angular.module('kb.directives', [])
  .directive('kbCalendar', ['$kb_moment', function ($moment) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
          var timeData = new Date();
          if (attr['kbCalendar']) {
            timeData = attr['kbCalendar'];
          }
          element.html($moment(timeData).subtract(10, 'days').calendar());
        }
    };
  }])


