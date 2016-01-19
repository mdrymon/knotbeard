/**
 * Created by mx² on 15/01/16.
 */


angular.module('knotbeard', [])
  .controller('series', ['$scope', '$http',
    function($scope, $http) {
        $http({method: "GET", url: "/api/Series"}).
          then(function(response) {
            $scope.series = response.data;
          }, function(error) {
            $scope.series = [];
          });
    }])
  .controller('add-serie', ['$scope', '$http', '$window',
    function($scope, $http, $window) {
        $scope.databaseSearch = function () {
          //@TODO: Get this url from handler config and img too
          $http({method: "GET", url: "/api/Series/api/database/search?q=" + $scope.query}).
            then(function(response) {
              $scope.series = response.data.responses;
            }, function(error) {
              $scope.series = [];
            });
        }
        $scope.databaseLoad = function (id) {
        console.log('ID', id);
          //@TODO: Get this url from handler config and img too
          $http({method: "POST", url: "/api/Series/api/database/load", data:{id:id}}).
            then(function(response) {
              $window.location.href = '/index.html';
            }, function(error) {
            console.log('ERROR', error);
              $scope.series = [];
            });
        }
    }]);


