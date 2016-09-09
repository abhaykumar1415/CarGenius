/* global angular */
angular.module('CGServices', [])
.service('StoreLocatorSrv', ['$http', '$q', '$ionicLoading', function($http, $q, $ionicLoading) {
        
    /**
     * Function to get a single location using zipcode.
     * 
     * @param {int} zipcode / The zipcode to search store.
     * @param {int} distance / The distance to search store (in miles).
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {$q@call;defer.promise}
     */
    this.getLocationByZip = function(zipcode, distance){
        $ionicLoading.show({
            template: 'Loading.. please wait..'
        });
        var request = {
            method: 'GET',
            url: cgApiUri + '/location/search?zipcode='+zipcode+'&distance='+distance+'&limit=6',
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
    
    /**
     * Function to get the location info passing the id.
     * 
     * 
     * @param {int} id / The location id to search.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {$q@call;defer.promise}
     */
    this.getLocationById = function(id){
        var request = {
            method: 'GET',
            url: cgApiUri + '/location/' + id + '/show',
            headers: {'Content-Type': 'application/json'},
        };
        return $http(request).then(function(data){
            return data;
        },
        function(data){
            return data;
        });
    };
}]);