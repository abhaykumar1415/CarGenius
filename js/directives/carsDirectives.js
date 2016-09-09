/* global angular */
angular.module('CarGenie')
.directive('carsSelects', function($location, $localStorage, $timeout, $stateParams, CarsSrv, UtilsSrv){
    return {
        restrict: 'E',
        templateUrl: 'templates/partials/cars_selects/cars_selects.html',
        scope: {formName: '=', modelName: '=', makes:'=', years:'=', models:'=', mileages:'=', isGray:'@'},
        link: function(scope, el, attrs) {
            /**
             * Get makes
             */

            var makesFunc = function(makes){
                if(makes.data != null && angular.isDefined(makes.data.entities) && makes.data.entities.length > 0){
                    /**
                     * Fill makes selector
                     */
                    scope.makes = makes.data.entities;
                    //Set selector values empty in order to reload child selectors.
                    $('#makesSelect').change(function(){
                        $('#modelsSelect').val("");
                        $('#yearsSelect').val("");
                        $('#mileagesSelect').val("");
                        scope.formName.$invalid = true;
                    });
                    $('#yearsSelect').val("");


                    /**
                     * Set selected value if is edit section.
                     */
                    var sessJson = sessionStorage.getItem('sessCarInfo');
                    var sessCarInfo = {};
                    if(typeof sessJson != 'undefined' && sessJson != 'undefined'){
                        sessCarInfo = JSON.parse(sessJson);
                    }
                    if(typeof $stateParams.car_id == 'undefined' && typeof sessCarInfo != 'undefined' && sessCarInfo != 'undefined' && typeof scope.modelName.make != 'undefined' && sessCarInfo != null){
                        scope.modelName.make.id = sessCarInfo.make.id;
                        scope.updateModels(scope.modelName.make.id);
                    } else {
                        var mProm = UtilsSrv.setSelectedValueInCarSelector(scope, 'make', $localStorage.cars, $stateParams.car_id);
                        mProm.then(function (makeId) {
                            scope.updateModels(makeId);
                        });
                    }
                } else if(makes.status == 0){
                    UtilsSrv.showConnectionErrorMessageAndRedirect("/");
                }
            };
            var cmp = CarsSrv.getMakes(makesFunc);

            /**
             * Function to update models selector based on make selected.
             * 
             * @param {int} makeId / The car make to search models.
             * 
             * @author Bruno <bruno@serfe.com>
             *
             * @returns {undefined}
             */
            scope.updateModels = function(makeId){
                /* Set selectors to black */
                scope.$watch('make', function(){
                    //scope.isGray = false;
                });
                /**
                 * Fill model selector
                 */
                var modelFunc = function(models){
                    if(models.data != null && angular.isDefined(models.data.entities) && models.data.entities.length > 0){
                        scope.models = models.data.entities;
                        //console.log(scope.formName)
                        //Set selector values empty in order to reload child selectors.
                        $('#modelsSelect').change(function(){
                            $('#yearsSelect').val("");
                            $('#mileagesSelect').val("");
                            scope.formName.$invalid = true;
                        });
                        $('#yearsSelect').val("");


                        /**
                         * Set selected value if is edit section.
                         */
                        var sessJson = sessionStorage.getItem('sessCarInfo');
                        var sessCarInfo = {};
                        if(typeof sessJson != 'undefined' && sessJson != 'undefined'){
                            sessCarInfo = JSON.parse(sessJson);
                        }
                        if(typeof $stateParams.car_id == 'undefined' && typeof sessCarInfo != 'undefined' && sessCarInfo != 'undefined' && typeof scope.modelName.model != 'undefined' && sessCarInfo != null){
                            (angular.isDefined(sessCarInfo.model) ? scope.modelName.model.id = sessCarInfo.model.id : '');
                            scope.updateYears(scope.modelName.model.id);
                        } else {
                            var mProm = UtilsSrv.setSelectedValueInCarSelector(scope, 'model', $localStorage.cars, $stateParams.car_id);
                            mProm.then(function(modelId){
                                scope.updateYears(modelId);
                            });
                        }
                    } else if(models.status == 0){
                        UtilsSrv.showConnectionErrorMessageAndRedirect("/");
                    }
                };
                var cmmp = CarsSrv.getModelsByMake(makeId, modelFunc);

            };
            
            /**
             * Function to update years selector based on model selected.
             * 
             * @param {int} modelId / The car model to search years.
             * 
             * @author Bruno <bruno@serfe.com>
             * 
             * @returns {undefined}
             */

            scope.updateYears = function(modelId){
                /**
                 * Fill year selector
                 */
                var yearFunc = function(years){
                    if(years.data != null && angular.isDefined(years.data.entities)){
                        scope.years = years.data.entities;

                        //Set selector values empty in order to reload child selectors.
                        $('#yearsSelect').change(function(){
                            $('#mileagesSelect').val("");
                            scope.formName.$invalid = true;
                        });

                        /**
                         * Set selected value if is edit section.
                         */
                        var sessJson = sessionStorage.getItem('sessCarInfo');
                        var sessCarInfo = {};
                        if(typeof sessJson != 'undefined' && sessJson != 'undefined'){
                            sessCarInfo = JSON.parse(sessJson);
                        }
                        if(typeof $stateParams.car_id == 'undefined' && typeof sessCarInfo != 'undefined' && sessCarInfo != 'undefined' && typeof scope.modelName.year != 'undefined' && sessCarInfo != null){
                            (angular.isDefined(sessCarInfo.year) ? scope.modelName.year.id = sessCarInfo.year.id : '');
                            scope.updateMileages(scope.modelName.year.id);
                        } else {
                            var mProm = UtilsSrv.setSelectedValueInCarSelector(scope, 'year', $localStorage.cars, $stateParams.car_id);
                            mProm.then(function(yearId){
                                if(angular.isDefined(yearId)){
                                    scope.updateMileages(yearId);
                                }
                            });
                        }
                    } else if(years.status == 0){
                        UtilsSrv.showConnectionErrorMessageAndRedirect("/");
                    }
                };

                var cyp =  CarsSrv.getYearsByModel(modelId, yearFunc);

            };

            /**
             * Function to update mileages selector based on year selected.
             * 
             * @param {int} yearId / The car year to search mileages.
             * 
             * @author Bruno <bruno@serfe.com>
             * 
             * @returns {undefined}
             */

            scope.updateMileages = function(yearId){
                /**
                 * Fill year selector
                 */
                var mileagesFunc = function(mileages){
                    /**
                     * Set selected value if is edit section.
                     */
                    var sessJson = sessionStorage.getItem('sessCarInfo');
                    var sessCarInfo = {};
                    if(typeof sessJson != 'undefined' && sessJson != 'undefined'){
                        sessCarInfo = JSON.parse(sessJson);
                    }
                    if(mileages.data != null && angular.isDefined(mileages.data.entities)){
                        scope.mileages = mileages.data.entities;
                        UtilsSrv.setSelectedValueInCarSelector(scope, 'mileage', $localStorage.cars, $stateParams.car_id);
                    } else if(mileages.status == 0){
                        UtilsSrv.showConnectionErrorMessageAndRedirect("/");
                    }
                };
                var cyp =  CarsSrv.getMileagesByYear(yearId, mileagesFunc);
            };
        }
    };
})