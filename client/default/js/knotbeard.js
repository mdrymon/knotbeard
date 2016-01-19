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
  .controller('add-serie', ['$scope', '$http',
    function($scope, $http) {
        $scope.databaseSearch = function () {
          //@TODO: Get this url from handler config and img too
          $http({method: "GET", url: "/api/Series/api/database/search?q=" + $scope.query}).
            then(function(response) {
              $scope.series = response.data.responses;
            }, function(error) {
              $scope.series = [];
            });
        }
    }]);


