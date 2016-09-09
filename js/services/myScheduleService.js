/* global angular */
angular.module('CarGenie')
.service('MyScheduleSrv', ['$http', '$q', '$ionicLoading', function($http, $q, $ionicLoading) {
    
    /**
     * Function to set data
     * 
     * @param {object} data
     */
    this.setData = function(data){
        this.data = data;
    };
    
    /**
     * Function to get data previously setted.
     * 
     * @param {object} data
     * @returns {object} data
     */
    this.getData = function(data){
        return this.data;
    };
    
    /**
     * Function to get the services filtered by:
     *  
     *  - Make
     *  - Model
     *  - Year
     *  - Mileage
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {$q@call;defer.promise}
     */
    this.getServicesByFilter = function(){
        $ionicLoading.show({
            template: 'Loading.. please wait..'
        });
        var request = {
            method: 'GET',
            url: cgApiUri + '/schedule/search?make='+this.data.make.id+'&model_year_id='+this.data.year.id+'&model='+this.data.model.id+'&mileage_number='+this.data.mileage.mileage,
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
