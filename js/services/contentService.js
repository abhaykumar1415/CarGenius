/* global angular */
angular.module('CarGenie')
.service('ContentSrv', ['$http', '$q', '$ionicLoading', function($http, $q, $ionicLoading) {
    /**
     * Function to get a content passing the content id.
     * 
     * @param {int} contentId / The content id to search.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {$q@call;defer.promise}
     */
    this.getContentById = function(contentId){
        $ionicLoading.show({
            template: 'Loading.. please wait..'
        });
        var request = {
            method: 'GET',
            url: cgApiUri + '/content/display/' + contentId,
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