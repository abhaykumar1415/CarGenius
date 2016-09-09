/* global angular */
angular.module('CarGenie')
.service('CarsSrv', ['$http', '$q', '$ionicLoading', '$localStorage', '$cordovaSQLite',  function($http, $q, $ionicLoading, $localStorage, $cordovaSQLite) {
    
    /**
     * Funciton to get the status cars cache for this user
     * If need invalidation, this function will invalidate 
     * the cars cche before to start request to get info for related selects
     *  
     * @author Sebastian <sebastian@serfe.com>
     *  
     * @returns {promise}
     */
    this.validateCache = function(){
        $ionicLoading.show({
            template: 'Loading.. please wait..'
        });
        var request = {
            method: 'GET',
            url: cgApiUri + '/me',
            headers: {'Content-Type': 'application/json'},
        };
        //no matter the resut of this api call, the app must continue running
        return $http(request).then(
                function(data){//successCallback
                    /**
                     * Check response here and invalidate the cache if is needed
                     */                    
                    $ionicLoading.hide();
                    return this.getMakes();
                },
                function(data){//errorCallback
                    $ionicLoading.hide();                    
                    return this.getMakes();                    
                }
        );
    };
    /**
     * Funciton to get car makes
     *  
     * @author Bruno <bruno@serfe.com>
     *  
     * @returns {undefined}
     */
    this.getMakes = function(eval){
        /**
         * Get Makes cache
         */
        var query = "SELECT * FROM make ORDER BY title ASC";
        $cordovaSQLite.execute(db, query, []).then(function(res) {
            if(res.rows.length > 0) {
                var makesArray = [];
                for(var i = 0; i < res.rows.length; i++) {
                    makesArray.push(res.rows.item(i));
                }
                var data = {
                    data : { entities : makesArray}
                };
                if(typeof(eval) == 'function') {
                    eval(data);
                }
                //return data;
            } else {
                console.log("No results found");
            }
        }, function (err) {
            console.error(err);
        });
    };
    
    /**
     * Function to get models by selected make id.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {undefined}
     */

    this.getModelsByMake = function(makeId, eval){
        /**
         * Get Makes cache
         */
        var query = "SELECT * FROM model WHERE make_id = " + makeId + " ORDER BY title ASC";
        $cordovaSQLite.execute(db, query, []).then(function(res) {
            if(res.rows.length > 0) {
                var modelsArray = [];
                for(var i = 0; i < res.rows.length; i++) {
                    modelsArray.push(res.rows.item(i));
                }
                var data = {
                    data : { entities : modelsArray}
                };
                if(typeof(eval) == 'function') {
                    eval(data);
                }
                //return data;
            } else {
                console.log("No results found");
            }
        }, function (err) {
            console.error(err);
        });
    };
    
    /**
     * Function to get years by selected model id.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {undefined}
     */
    this.getYearsByModel = function(modelId, eval){
        /**
         * Get Makes cache
         */
        var query = "SELECT * FROM model_year WHERE model_id = " + modelId + " ORDER BY year_number ASC";
        $cordovaSQLite.execute(db, query, []).then(function(res) {
            if(res.rows.length > 0) {
                var yearsArray = [];
                for(var i = 0; i < res.rows.length; i++) {
                    yearsArray.push(res.rows.item(i));
                }
                var data = {
                    data : { entities : yearsArray}
                };
                if(typeof(eval) == 'function') {
                    eval(data);
                }
                //return data;
            } else {
                console.log("No results found");
            }
        }, function (err) {
            console.error(err);
        });
    };
    
    /**
     * Function to get mileages by selected year id.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {undefined}
     */
    this.getMileagesByYear = function(yearId, eval){
        /**
         * Get Makes cache
         */
        var query = "SELECT * FROM mileage WHERE model_year_id = " + yearId + " ORDER BY mileage ASC";
        $cordovaSQLite.execute(db, query, []).then(function(res) {
            if(res.rows.length > 0) {
                var mileagesArray = [];
                for(var i = 0; i < res.rows.length; i++) {
                    mileagesArray.push(res.rows.item(i));
                }
                var data = {
                    data : { entities : mileagesArray}
                };
                if(typeof(eval) == 'function') {
                    eval(data);
                }
                //return data;
            } else {
                console.log("No results found");
            }
        }, function (err) {
            console.error(err);
        });
    };
    
}]);