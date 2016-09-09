/* global angular */
angular.module('CarGenie')
.service('MyServiceSrv', ['$http', '$q', '$ionicLoading', function($http, $q, $ionicLoading) {
    /**
     * Function to set data
     * 
     * @param {object} data
     * 
     * @author Bruno <bruno@serfe.com>
     */
    this.setData = function(data){
        this.data = data;
    };
    
    /**
     * Function to get data previously setted.
     * 
     * @param {object} data
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {object} data
     */
    this.getData = function(data){
        return this.data;
    };
        
    /**
     * Function to create or update car through the API.
     * If the id of the car is passed to the function,
     * an existent car will be updated.
     * 
     * @param {int} carData / the carData with params to pass to endpoint API.
     * 
     * @author Bruno <bruno@serfe.com>
     *   
     * @returns {$q@call;defer.promise}
     */
    this.saveCarData = function(carData){
        $ionicLoading.show({
            template: "Saving.. Please wait.."
        });
        if(angular.isDefined(carData) && angular.isNumber(carData.id) && carData.id != null && carData.id != ''){
            //call for PUT operation.
            var request = {
                method: 'PUT',
                url: cgApiUri + '/vehicle/modify/' + carData.id,
                data: this.generateQueryStringForAddEdit(carData),
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
        } else {
            //call for POST operation.
            var request = {
                method: 'POST',
                url: cgApiUri + '/vehicle/add',
                data: this.generateQueryStringForAddEdit(carData),
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
        }
    };
    
    /**
     * Function to get all cars of the user.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {$q@call;defer.promise}
     */
    this.getCarList = function(){
        $ionicLoading.show({
            template: 'Loading.. please wait..'
        });
        var request = {
            method: 'GET',
            url: cgApiUri + '/vehicle/list',
            headers: {
                'Content-Type': 'application/json'
            },
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
     * Function to delete a car through API.
     * 
     * @param {int} carId / The car id to delete.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {$q@call;defer.promise}
     */
    this.deleteCar = function(carId){
        $ionicLoading.show({
            template: "Processing.. Please wait.."
        });
        if(angular.isDefined(carId) && angular.isNumber(carId) && carId != null && carId != ''){
            //call for PUT operation.
            var request = {
                method: 'DELETE',
                url: cgApiUri + '/vehicle/remove/' + carId,
                headers: {'Content-Type': 'application/json'},
            };
            return $http(request).then(function(data){
                $ionicLoading.hide();
                if(data != null){
                    /* Show messages */
                    if(data.status == 200 || data.status == 204){
                        data.title = data.statusText;
                        data.message = 'The car has been deleted.'
                    }
                }
                return data;
            },
            function(data){
                $ionicLoading.hide();
                if(data != null){
                    /* Show messages */
                    if(data.status == 0){
                        data.title = 'Warning'; 
                        data.message = 'Connection error';
                    } else if(data.status == 404) {
                        data.title = data.status;
                        data.message = 'An error has occurred trying to delete the vehicle.';
                    } 
                }
                return data;
            });
        }
    };
    
    /**
     * Function to match the correct values to send to the API.
     * 
     * @param {object} carData / car data information retrieved from the add/edit page form.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {object} queryObject / The post data object well formed to send to the API.
     */
    this.generateQueryStringForAddEdit = function(carData){
        var mileage = null;
        if(angular.isDefined(carData.mileage) && !angular.isObject(carData.mileage)){
          mileage = carData.mileage;
        } else {
          mileage = carData.mileage.mileage;
        }
            
        var postDataObject = {
            vehicle: {
                mileage: mileage,
                vin: carData.vin, 
                color: carData.color,
                modelyear: carData.year.id,
                insuranceName: carData.insurance_name,
                insuranceNumber: carData.insurance_number,
                insurancePhone: carData.insurance_phone
            }
        };
        return postDataObject;
    };
    
    
    /**
     * This function is to add a reminder through the API.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {undefined}
     */
    this.saveReminderData = function(reminderData, carId){
        $ionicLoading.show({
            template: "Saving.. Please wait.."
        });
        if(angular.isDefined(reminderData) && angular.isNumber(reminderData.id) && reminderData.id != null && reminderData.id != ''){
            //call for PUT operation.
            var request = {
                method: 'PUT',
                url: cgApiUri + '/reminder/modify/' + reminderData.id,
                data: this.generateQueryStringForRminderAddEdit(reminderData, carId),
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
        } else {
            //call for POST operation.
            var request = {
                method: 'POST',
                url: cgApiUri + '/reminder/add',
                data: this.generateQueryStringForRminderAddEdit(reminderData, carId),
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
        }
    };
    
    /**
     * This function is to add a reminder through the API.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {undefined}
     */
    this.saveReminderHistoryData = function(reminderHistoryData, carId){
        $ionicLoading.show({
            template: "Saving.. Please wait.."
        });
        if(angular.isDefined(reminderHistoryData) && angular.isNumber(reminderHistoryData.id) && reminderHistoryData.id != null && reminderHistoryData.id != ''){
            //call for PUT operation.
            var request = {
                method: 'PUT',
                url: cgApiUri + '/reminder/modify/' + reminderHistoryData.id,
                data: this.generateQueryStringForRminderAddEdit(reminderHistoryData, carId),
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
        } else {
            //call for POST operation.
            var request = {
                method: 'POST',
                url: cgApiUri + '/reminder/add',
                data: this.generateQueryStringForRminderAddEdit(reminderHistoryData, carId),
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
        }
    };
    
    
    /**
     * Function to match the correct values to send to the API.
     * 
     * @param {object} reminderData / reminder data information retrieved from the add page form.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {object} queryObject / The post data object well formed to send to the API.
     */
    this.generateQueryStringForRminderAddEdit = function(reminderData, carId){
            var postDataObject = {
            reminder: {
                title: reminderData.title,
                description: reminderData.description || '-',
                dateOfEvent: reminderData.date_of_event, 
                mileage: reminderData.mileage,
                vehicle: carId,
            }
        };
        return postDataObject;
    };
    
    /**
     * Function to get all reminders of the user.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {$q@call;defer.promise}
     */
    this.getReminderList = function(carId){
        $ionicLoading.show({
            template: 'Loading.. please wait..'
        });
        var request = {
            method: 'GET',
            url: cgApiUri + '/reminder/list/' + carId,
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
     * Function to get all reminders history of the user.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {$q@call;defer.promise}
     */
    this.getReminderHistoryList = function(carId){
        $ionicLoading.show({
            template: 'Loading.. please wait..'
        });
        var request = {
            method: 'GET',
            url: cgApiUri + '/reminder/list_old/' + carId,
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
     * This function is get current server date through the API.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {undefined}
     */
    this.getServerDate = function(){
        //call for POST operation.
        var request = {
            method: 'GET',
            url: cgApiUri + '/component/get_current_date',
            headers: {'Content-Type': 'application/json'},
        };
        return $http(request).then(function(data){
            return data;
        },
        function(data){
            return data;
        });
    };
    
    
    /**
     * 
     * @param {type} reminderDate
     * @returns {undefined}
     */
    this.checkIfGreaterThanServerDate = function(reminderDate){
        var def = $q.defer();
        var APIDateProm = this.getServerDate();
        APIDateProm.then(function(APIDate){
            var serverDate = moment().diff(APIDate.data, 'minutes')
            var historyDate = moment().diff(reminderDate, 'minutes')
            if(serverDate > historyDate){
                def.resolve(true);
            }
            def.resolve(false);  
        })
        return def.promise;
    };
    
    /**
     * Function to delete a reminder through API.
     * 
     * @param {int} reminderId / The reminder id to delete.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {$q@call;defer.promise}
     */
    this.deleteReminder = function(reminderId){
        $ionicLoading.show({
            template: "Processing.. Please wait.."
        });
        if(angular.isDefined(reminderId) && angular.isNumber(reminderId) && reminderId != null && reminderId != ''){
            //call for PUT operation.
            var request = {
                method: 'DELETE',
                url: cgApiUri + '/reminder/remove/' + reminderId,
                headers: {'Content-Type': 'application/json'},
            };
            return $http(request).then(function(data){
                $ionicLoading.hide();
                if(data != null){
                    /* Show messages */
                    if(data.status == 200 || data.status == 204){
                        data.title = data.statusText;
                        data.message = 'The reminder/history has been deleted.'
                    }
                }
                return data;
            },
            function(data){
                $ionicLoading.hide();
                if(data != null){
                    /* Show messages */
                    if(data.status == 0){
                        data.title = 'Warning'; 
                        data.message = 'Connection error';
                    } else if(data.status == 404) {
                        data.title = data.status;
                        data.message = 'An error has occurred trying to delete the reminder.';
                    } 
                }
                return data;
            });
        }
    };
    
    /**
     * Function to get the reminder info passing the id.
     * 
     * @param {int} id / The reminder id to search.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {$q@call;defer.promise}
     */
    this.getReminderById = function(id){
        var request = {
            method: 'GET',
            url: cgApiUri + '/reminder/display/' + id,
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


