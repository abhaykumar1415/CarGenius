/* global angular */
angular.module('CarGenie')
.service('AdSrv', ['$http', '$q', '$ionicLoading', function($http, $q, $ionicLoading) {
        
    /**
     * Function to get an ad by zone id from the server.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {$q@call;defer.promise}
     */
    this.getAdByZone = function(zoneId){
        $ionicLoading.show({
            template: 'Loading.. please wait..'
        });
        var request = {
            method: 'GET',
            url: cgAdServerUri + '?zones=' + zoneId,
            skipAuthorization: true,
            headers: {'Content-Type': 'application/json'},
        };
        return $http(request).then(function(data){
            $ionicLoading.hide();
            return data;
        },
        function(data){
            $ionicLoading.hide();
            return data;
        });
    };
        
}]);



