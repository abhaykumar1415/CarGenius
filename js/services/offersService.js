/* global angular */
angular.module('CarGenie')
.service('OffersSrv', ['$http', '$q', '$ionicLoading', function($http, $q, $ionicLoading) {

    /**
     * Function to get all offers from the server.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {$q@call;defer.promise}
     */
    this.getOffersList = function(){
        $ionicLoading.show({
            template: 'Loading.. please wait..'
        });
        var request = {
            method: 'GET',
            url: cgApiUri + '/offer/list',
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
     * Function to get an offer passing the offer id.
     * 
     * @param {int} offerId / The offer id to search.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {$q@call;defer.promise}
     */
    this.getOfferById = function(offerId){
        $ionicLoading.show({
            template: 'Loading.. please wait..'
        });
        var request = {
            method: 'GET',
            url: cgApiUri + '/offer/read/' + offerId,
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
     * 
     * TODO: add header.
     * 
     * @param {type} userId
     * @returns {$q@call;defer.promise}
     */
    this.getSponsorsList = function(){
        $ionicLoading.show({
            template: 'Loading.. please wait..'
        });
        var request = {
            method: 'GET',
            url: cgApiUri + '/sponsor/list',
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


