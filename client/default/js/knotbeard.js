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
    }]);


