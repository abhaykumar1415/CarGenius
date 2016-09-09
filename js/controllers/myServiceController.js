/* global angular */
angular.module('CarGenie')
.controller('MyHomeSweepStakeCtrl', function($scope,PopupSrv) {
    $scope.sweepStakePop_up=function(){
        //PopupSrv.showAlert('<h1>zxczc</h1>','Connection error. Please make sure that you can access the internet on your device and try again.');
        $(".backdrop").addClass("visible active");
        $(".sweepStakePopMainPageOuter").show();
    }
})
.controller('MyServiceSelectCtrl', function($scope, $localStorage, carList, UtilsSrv, $cordovaSQLite) {
    /**
     * Search and show vehicle list.
     * 
     * GET CARS MUST RETRIEVE INFORMATION ONLINE EVERY TIME!
     * ALL CRUD OPERATIONS MUST BE PERFORMED ONLINE!
     */
     $scope.cars = [];
     $scope.showAddMessage = false;
    /**
     * Get car data from the server.
     * 
     * @type @exp;MyServiceSrv@call;getCarList
     */
    if(carList.data != null){
        var parseProm = UtilsSrv.parseAPICarGetListResponse(carList.data.vehicles);
        parseProm.then(function(cars){
            if(angular.isDefined(carList.data.vehicles) && carList.data.vehicles.length < 6){
                $scope.showAddMessage = true;
            } else if(angular.isUndefined(carList.data.vehicles)){
                $scope.showAddMessage = true;
            }
            $scope.cars = cars;
            $localStorage.cars = cars;
        });
    }

    if(typeof analytics !== undefined) { analytics.trackView("My Services"); }

})
.controller('MyServiceAddEditCtrl', function($scope, $stateParams, $location, $translate, $localStorage, PopupSrv, MyServiceSrv, UtilsSrv) {
    
    $scope.isEdit = false;
    $scope.fw = {}; //form wrapper
    $scope.form = {invalid: true};
    $scope.cars = [];
    $scope.mCarInfo = {};

    if(typeof analytics != 'undefined') { analytics.trackView("My Services - Add / Edit Vehicle"); }

    if(angular.isDefined($stateParams.car_id) && $stateParams.car_id != null){
        $scope.isEdit = true;
        //search car localstorage by id
        var key = UtilsSrv.getArrayKeyFromObjectId($localStorage.cars, $stateParams.car_id);
        $scope.mCarInfo = $localStorage.cars[key];
    }
    /**
     * Function to save the car through API and hadle the response.
     * @param {type} carData
     * @param {type} ev
     * @returns {undefined}
     */
    $scope.saveCar = function(carData, ev){
        //check this event.
        ev.preventDefault();
        /**
         * Validations depends of the add or edit.
         */
        //Save data in the API / the function handle the add or update internally.
        var saveProm = MyServiceSrv.saveCarData(carData);
        saveProm.then(function(data){
            console.log(data)
            /**
             * This should be in the model but is not possbile because the translate provider doesn't work correctly.
             */
            if(data != null){
                /* Show messages */
                var transProm = $translate(['WARNING','NOT_FOUND','CONNECTION_ERROR','AN_ERROR_HAS_OCCURRED_TRYING_TO_SAVE_THE_VEHICLE', 'THE_CAR_HAS_BEEN_CREATED', 'THE_CAR_HAS_BEEN_UPDATED','UPDATED']);
                transProm.then(function(transStrings){
                    if(data.status == 0){
                        data.title = transStrings.WARNING;
                        data.message = transStrings.CONNECTION_ERROR;
                    } else if(data.status == 400) {
                        data.title = transStrings.BAD_REQUEST;
                        data.message = transStrings.AN_ERROR_HAS_OCCURRED_TRYING_TO_SAVE_THE_VEHICLE;
                    } else if(data.status == 404) {
                        data.title = transStrings.NOT_FOUND;
                        data.message = transStrings.AN_ERROR_HAS_OCCURRED_TRYING_TO_SAVE_THE_VEHICLE;
                    } else if(data.status == 201){
                        data.title = data.statusText;
                        data.message = transStrings.THE_CAR_HAS_BEEN_CREATED;
                    } else if(data.status == 204){
                        data.title = transStrings.UPDATED;
                        data.message = transStrings.THE_CAR_HAS_BEEN_UPDATED;
                    }
                    if(data.status != 401){
                        PopupSrv.showAlert(data.title, data.message);
                    }
                    $location.path('/my-service');
                });
            }
        });
        if($scope.isEdit){
            var key = UtilsSrv.getArrayKeyFromObjectId($localStorage.cars, $stateParams.car_id);
            $scope.cars[key] = carData;
        } else {
            $scope.cars.push(carData);
        }
        //Only if the car is saved in the API will be saved in the local storage of the device.
        $scope.saveDataToLocalStorage(carData);
        carData = {};
    };
    
    /**
     * Function to save data in the local storage of the device.
     * 
     * @param {type} data
     * @returns {undefined}
     */
    $scope.saveDataToLocalStorage = function(data){
        var cars = $localStorage.cars;
        if(typeof cars == 'undefined'){
            cars = [];
        } 
        /** if user edit **/
        if(angular.isDefined($stateParams.car_id) && $stateParams.car_id != null){
            var key = UtilsSrv.getArrayKeyFromObjectId($localStorage.cars, $stateParams.car_id);
            $localStorage.cars[key] = cars[key];
        }

        $localStorage.cars = cars;
    };
    
    /**
     * Function to delete a car.
     */
    $scope.deleteCar = function(carId){
        var key = UtilsSrv.getArrayKeyFromObjectId($localStorage.cars, $stateParams.car_id);
        var transProm = $translate(['MY_SERVICE_DELETE_ARE_YOU_SURE','MY_SERVICE_DELETE_YOU_ARE_GOING_TO_DELETE_THE_CAR', 'MY_SERVICE_DELETE_ARE_YOU_SURE_YOU_WANT_TO_PERFORM_THIS_ACTION']);
        transProm.then(function(tranStrings){
            var callback = {
                FunctionName: 'deleteCar',
                id: carId
            }
            PopupSrv.showConfirm(
                    tranStrings.MY_SERVICE_DELETE_ARE_YOU_SURE,
                    tranStrings.MY_SERVICE_DELETE_YOU_ARE_GOING_TO_DELETE_THE_CAR + ' ' + 
                        $localStorage.cars[key].make.title + ' ' + $localStorage.cars[key].model.title
                        + ', ' + tranStrings.MY_SERVICE_DELETE_ARE_YOU_SURE_YOU_WANT_TO_PERFORM_THIS_ACTION, ['MyServiceSrv'], callback, 'my-service');
        });
    };

    /**
     * Function to add a car (save it) then prompt insurance photo page
     * Need to save the car, get the new list from server, reload localstorage
     * Then we will be able to proceed to insurance photo page
     *
     * See Take Insurance Card Photo button on Add Vehicle page
     */
    $scope.addAndTakePicture = function(carData, ev) {
        // Save the car
        ev.preventDefault();
        var saveProm = MyServiceSrv.saveCarData(carData);
        saveProm.then(function(data) {
            // after saving data, get new list of cars
            var listProm = MyServiceSrv.getCarList();
            listProm.then(function(cars){
                // parse car list and save it to local storage (we need it for the insurance photo page)
                var parseProm = UtilsSrv.parseAPICarGetListResponse(cars.data.vehicles);
                parseProm.then(function(sendToLocal) {
                    $localStorage.cars = sendToLocal;
                });
                // get array index of newly added vehicle
                var idx = cars.data.vehicles.length - 1;
                // go to the URL with new ID
                $location.path('/my-service/scan-insurance-card/' + cars.data.vehicles[idx].id);
            });
        });
    };

    /**
     * Function to redirect to the maintenance schedule page
     */
    $scope.goToMaintenancePage = function(carInfo) {
        $location.path("/my-maintenance/car/" + carInfo);
    }
})
.controller('MyServiceReminderHistoryIndexCtrl', function($scope, $stateParams, $localStorage, UtilsSrv) {
    $scope.mCarInfo = {};

    if(typeof analytics != 'undefined') { analytics.trackView("My Services - Reminder / History"); }
    
    if(angular.isDefined($stateParams.car_id) && $stateParams.car_id != null){
        //search car localstorage by id
        var key = UtilsSrv.getArrayKeyFromObjectId($localStorage.cars, $stateParams.car_id);
        $scope.mCarInfo = $localStorage.cars[key];
    } 
})
.controller('MyServiceListRemindersCtrl', function($scope, $stateParams, $localStorage, UtilsSrv, reminderList) {
    $scope.mCarInfo = {};
    $scope.reminders = {};

    if(typeof analytics != 'undefined') { analytics.trackView("My Services - List Reminders"); }
     
    if(typeof reminderList.data.entities != 'undefined'){
        $scope.reminders = reminderList.data.entities.items;
    }
    
    if(angular.isDefined($stateParams.car_id) && $stateParams.car_id != null){
        //search car localstorage by id
        var key = UtilsSrv.getArrayKeyFromObjectId($localStorage.cars, $stateParams.car_id);
        $scope.mCarInfo = $localStorage.cars[key];
    } 
})
.controller('MyServiceListHistoryCtrl', function($scope, $stateParams, $localStorage, UtilsSrv, reminderHistoryList) {
    $scope.mCarInfo = {};
    $scope.remindersHistory = {};

    if(typeof analytics != 'undefined') { analytics.trackView("My Services - List History"); }
     
    if(typeof reminderHistoryList.data.entities != 'undefined'){
       $scope.remindersHistory = reminderHistoryList.data.entities.items;
    }
    
    if(angular.isDefined($stateParams.car_id) && $stateParams.car_id != null){
        //search car localstorage by id
        var key = UtilsSrv.getArrayKeyFromObjectId($localStorage.cars, $stateParams.car_id);
        $scope.mCarInfo = $localStorage.cars[key];
    } 
})
.controller('MyServiceAddEditReminderCtrl', function($scope, $stateParams, $localStorage, $translate, $location, PopupSrv, UtilsSrv, MyServiceSrv) {
     
     $scope.isEdit = false;
     $scope.mCarInfo = {};
     $scope.mReminder = {};
     $scope.fw = {}; //form wrapper

    if(typeof analytics != 'undefined') { analytics.trackView("My Services - Add / Edit Reminders"); }

    if(angular.isDefined($stateParams.car_id) && $stateParams.car_id != null){
        //search car localstorage by id
        var key = UtilsSrv.getArrayKeyFromObjectId($localStorage.cars, $stateParams.car_id);
        $scope.mCarInfo = $localStorage.cars[key];
    } 
    if(angular.isDefined($stateParams.reminder_id) && $stateParams.reminder_id != null){
        $scope.isEdit = true;
        //search car localstorage by id
        var reminderProm = MyServiceSrv.getReminderById($stateParams.reminder_id);
        reminderProm.then(function(reminderData){
            $scope.mReminder = reminderData.data.entity;
            $scope.curReminder = "Car Genius Reminder: " + $scope.mReminder.title;
            var date_array = reminderData.data.entity.date_of_event.split('T');
            $scope.curStart = new Date(date_array[0]);
        });
    }
    
    $scope.saveReminder = function(mReminder, ev){
        ev.preventDefault();
        var saveProm = MyServiceSrv.saveReminderData(mReminder, $scope.mCarInfo.id);
        saveProm.then(function(data){
            /**
             * This should be in the model but is not possbile because the translate provider doesn't work correctly.
             */
            if(data != null){
                /* Show messages */
                var transProm = $translate(['WARNING','NOT_FOUND','CONNECTION_ERROR','AN_ERROR_HAS_OCCURRED_TRYING_TO_SAVE_THE_REMINDER', 'THE_REMINDER_HAS_BEEN_CREATED', 'THE_REMINDER_HAS_BEEN_UPDATED','UPDATED']);
                transProm.then(function(transStrings){
                    if(data.status == 0){
                        data.title = transStrings.WARNING; 
                        data.message = transStrings.CONNECTION_ERROR;
                    } else if(data.status == 400) {
                        data.title = transStrings.BAD_REQUEST;
                        data.message = transStrings.AN_ERROR_HAS_OCCURRED_TRYING_TO_SAVE_THE_REMINDER;
                    } else if(data.status == 404) {
                        data.title = transStrings.NOT_FOUND;
                        data.message = transStrings.AN_ERROR_HAS_OCCURRED_TRYING_TO_SAVE_THE_REMINDER;
                    } else if(data.status == 201){
                        data.title = data.statusText;
                        data.message = transStrings.THE_REMINDER_HAS_BEEN_CREATED;

                        var title = "Car Genius Reminder: " + mReminder.title;
                        var location = null;
                        var notes = mReminder.description + ", Mileage: " + mReminder.mileage;
                        var start = new Date(mReminder.date_of_event);
                        var end = new Date();
                        end.setDate(start.getDate() + 1);
                        end.setHours(0, [minutes=0], [seconds=0], [ms=0]);

                        window.plugins.calendar.createEvent(title, location, notes, start, end);

                    } else if(data.status == 204){
                        data.title = transStrings.UPDATED;
                        data.message = transStrings.THE_REMINDER_HAS_BEEN_UPDATED;

                        var curEnd = new Date();
                        $scope.curStart.setHours(0, [minutes=0], [seconds=0], [ms=0]);
                        curEnd.setDate($scope.curStart.getDate() + 1);
                        curEnd.setHours(0, [minutes=0], [seconds=0], [ms=0]);

                        var deleteSuccess = function(message) {
                            var title = "Car Genius Reminder: " + mReminder.title;
                            var location = null;
                            var notes = mReminder.description + ", Mileage: " + mReminder.mileage;

                            if(typeof mReminder.date_of_event == 'string') {
                                var date_array = mReminder.date_of_event.split('T');
                                start = new Date(date_array[0]);
                            } else { start = new Date(mReminder.date_of_event) };

                            start.setHours(0, [minutes=0], [seconds=0], [ms=0]);
                            var end = new Date();
                            end.setDate(start.getDate() + 1);
                            end.setHours(0, [minutes=0], [seconds=0], [ms=0]);

                            window.plugins.calendar.createEvent(title, location, notes, start, end);
                        };

                        window.plugins.calendar.deleteEvent($scope.curReminder, null, null, $scope.curStart, curEnd, deleteSuccess);

                    } 
                    if(data.status != 401){
                        PopupSrv.showAlert(data.title, data.message);
                    }
                    $location.path('/my-service/list-reminders/'+$scope.mCarInfo.id);
                });
            }
        });
    };
    
    /**
     * Function to delete a reminder.
     */
    $scope.deleteReminder = function(reminderId){
        var reminderProm = MyServiceSrv.getReminderById($stateParams.reminder_id);
        reminderProm.then(function(reminderData){
            $scope.mReminder = reminderData.data.entity;
            var transProm = $translate(['MY_SERVICE_DELETE_ARE_YOU_SURE','MY_SERVICE_DELETE_YOU_ARE_GOING_TO_DELETE_THE_REMINDER', 'MY_SERVICE_DELETE_ARE_YOU_SURE_YOU_WANT_TO_PERFORM_THIS_ACTION']);
            transProm.then(function(tranStrings){
                var callback = {
                    FunctionName: 'deleteReminder',
                    id: reminderId
                };

                var curEnd = new Date();
                $scope.curStart.setHours(0, [minutes = 0], [seconds = 0], [ms = 0]);
                curEnd.setDate($scope.curStart.getDate() + 1);
                curEnd.setHours(0, [minutes = 0], [seconds = 0], [ms = 0]);
                window.plugins.calendar.deleteEvent($scope.curReminder, null, null, $scope.curStart, curEnd);

                PopupSrv.showConfirm(
                        tranStrings.MY_SERVICE_DELETE_ARE_YOU_SURE,
                        tranStrings.MY_SERVICE_DELETE_YOU_ARE_GOING_TO_DELETE_THE_REMINDER + ' ' + $scope.mReminder.title
                            + ', ' + tranStrings.MY_SERVICE_DELETE_ARE_YOU_SURE_YOU_WANT_TO_PERFORM_THIS_ACTION, ['MyServiceSrv'], callback, 'my-service/list-reminders/' + $scope.mCarInfo.id);
            });
        });
    };

    $scope.createEventOnReminder = function(){
        window.plugin.Calendar.createEvent(title, loc, notes, start, end, onSuccess, onError);
    };
    
})
.controller('MyServiceAddEditHistoryCtrl', function($scope, $stateParams, $localStorage, $translate, $location, PopupSrv, UtilsSrv, MyServiceSrv) {
    
    $scope.isEdit = false;
    $scope.mCarInfo = {};
    $scope.mHistory = {};
    $scope.fw = {}; //form wrapper

    if(typeof analytics != 'undefined') { analytics.trackView("My Services - Add / Edit History"); }
    
    if(angular.isDefined($stateParams.car_id) && $stateParams.car_id != null){
        //search car localstorage by id
        var key = UtilsSrv.getArrayKeyFromObjectId($localStorage.cars, $stateParams.car_id);
        $scope.mCarInfo = $localStorage.cars[key];
    } 
    
    if(angular.isDefined($stateParams.reminder_history_id) && $stateParams.reminder_history_id != null){
        $scope.isEdit = true;
        //search car localstorage by id
        var reminderProm = MyServiceSrv.getReminderById($stateParams.reminder_history_id);
        reminderProm.then(function(reminderData){
            $scope.mHistory = reminderData.data.entity;
        });
    } 
    
     $scope.saveHistory = function(mHistory, ev){
        ev.preventDefault();
        var dateValidationProm = MyServiceSrv.checkIfGreaterThanServerDate(mHistory.date_of_event)
        dateValidationProm.then(function(result){
            var transProm = $translate(['WARNING','NOT_FOUND','CONNECTION_ERROR','AN_ERROR_HAS_OCCURRED_TRYING_TO_SAVE_THE_HISTORY', 'THE_HISTORY_HAS_BEEN_CREATED', 'THE_HISTORY_HAS_BEEN_UPDATED','UPDATED', 'THE_HISTORY_DATE_IS_EQUAL_OR_GREATER_THAN']);
            transProm.then(function(transStrings){
                if(result === true){
                    PopupSrv.showAlert(transStrings.WARNING, transStrings.THE_HISTORY_DATE_IS_EQUAL_OR_GREATER_THAN);
                } else {
                    var saveProm = MyServiceSrv.saveReminderHistoryData(mHistory, $scope.mCarInfo.id);
                    saveProm.then(function(data){
                        /**
                         * This should be in the model but is not possbile because the translate provider doesn't work correctly.
                         */
                        if(data != null){
                            /* Show messages */
                            if(data.status == 0){
                                data.title = transStrings.WARNING; 
                                data.message = transStrings.CONNECTION_ERROR;
                            } else if(data.status == 400) {
                                data.title = transStrings.BAD_REQUEST;
                                data.message = transStrings.AN_ERROR_HAS_OCCURRED_TRYING_TO_SAVE_THE_HISTORY;
                            } else if(data.status == 404) {
                                data.title = transStrings.NOT_FOUND;
                                data.message = transStrings.AN_ERROR_HAS_OCCURRED_TRYING_TO_SAVE_THE_HISTORY;
                            } else if(data.status == 201){
                                data.title = data.statusText;
                                data.message = transStrings.THE_HISTORY_HAS_BEEN_CREATED;
                            } else if(data.status == 204){
                                data.title = transStrings.UPDATED;
                                data.message = transStrings.THE_HISTORY_HAS_BEEN_UPDATED;
                            } 
                            if(data.status != 401){
                                PopupSrv.showAlert(data.title, data.message);
                            }
                            $location.path('/my-service/list-history/'+$scope.mCarInfo.id);
                        }
                    });
                }
            });
        });
    };
    
    /**
     * Function to delete a reminder history.
     */
    $scope.deleteReminderHistory = function(reminderId){
        var reminderProm = MyServiceSrv.getReminderById($stateParams.reminder_id);
        reminderProm.then(function(reminderData){
            $scope.mReminder = reminderData.data.entity;
            var transProm = $translate(['MY_SERVICE_DELETE_ARE_YOU_SURE','MY_SERVICE_DELETE_YOU_ARE_GOING_TO_DELETE_THE_HISTORY', 'MY_SERVICE_DELETE_ARE_YOU_SURE_YOU_WANT_TO_PERFORM_THIS_ACTION']);
            transProm.then(function(tranStrings){
                var callback = {
                    FunctionName: 'deleteReminder',
                    id: reminderId
                }
                PopupSrv.showConfirm(
                        tranStrings.MY_SERVICE_DELETE_ARE_YOU_SURE,
                        tranStrings.MY_SERVICE_DELETE_YOU_ARE_GOING_TO_DELETE_THE_HISTORY + ' ' + $scope.mHistory.title
                            + ', ' + tranStrings.MY_SERVICE_DELETE_ARE_YOU_SURE_YOU_WANT_TO_PERFORM_THIS_ACTION, ['MyServiceSrv'], callback, 'my-service/list-history/' + $scope.mCarInfo.id);
            });
        });
    };
})
.controller('MyServiceCameraCtrl', function ($scope, $location, $stateParams, $translate, $localStorage, $cordovaCamera, UtilsSrv, PopupSrv, $http, $ionicLoading, $timeout) {    

    $scope.serverURI = cgServerUri;
    $scope.imageLoaded = false;
    $scope.currentTime = new Date();
    $scope.imgURI = undefined;
    $ionicLoading.hide();

    if(typeof analytics != 'undefined') { analytics.trackView("My Services - Camera"); }
    
    if(angular.isDefined($stateParams.car_id) && $stateParams.car_id != null){
        //search car localstorage by id
        var key = UtilsSrv.getArrayKeyFromObjectId($localStorage.cars, $stateParams.car_id);
        $scope.mCarInfo = $localStorage.cars[key];
    }
    
    /**
     * Get the image and decode before upload.
     */
    if(typeof $stateParams.img_uri != 'undefined' && $stateParams.img_uri != 'undefined' && $stateParams.img_uri != null){
        $scope.imgURI = atob($stateParams.img_uri);
    }

    /**
     * Check if an image exist in the server
     * @param {type} car_id
     * @returns {undefined}
     */
    $scope.isImage = function(car_id){
        UtilsSrv.isImage($scope.serverURI+"/insurance_card_images/insurance_card_vehicle_"+car_id+".jpg").then(function(response) {
            if(response === true){
                $scope.imageLoaded = response;
            }
        });
    };
    
    /**
     * Function to enter in camera mode and set the deafault image options
     * to take the picture with device camera.
     * 
     * @author Bruno <bruno@serfe.com>
     * 
     * @returns {message} / An alert popup message inroming the result of the process to the user.
     */
    $scope.takePicture = function(takePicture) {
        UtilsSrv.isImage($scope.serverURI+"/insurance_card_images/insurance_card_vehicle_"+$scope.mCarInfo.id+".jpg").then(function(imageExists) {
            $ionicLoading.show({
                template: "Loading image.. Please wait.."
            });
            if(imageExists && !takePicture){
                $ionicLoading.hide();
                $location.path('/my-service/insurance-card-snaptshot/' + $scope.mCarInfo.id + '/');
            } else {
                var options = { 
                    quality: 75, 
                    destinationType: Camera.DestinationType.DATA_URL, 
                    sourceType: Camera.PictureSourceType.CAMERA, 
                    allowEdit: false,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 300,
                    targetHeight: 300,
                    saveToPhotoAlbum: false,
                    correctOrientation: true
                };
 
                $cordovaCamera.getPicture(options).then(function(imageData) {
                    $ionicLoading.hide();
                    $timeout(function(){
                        $scope.imgURI = "data:image/jpeg;base64," + imageData;
                        $location.path('/my-service/insurance-card-snaptshot/'+$scope.mCarInfo.id+'/'+btoa($scope.imgURI));
                    }, 1500);
                }, function(err) {
                    $ionicLoading.hide();
                    // An error occured. Show a message to the user
                    console.log(err); /* Do not remove this console log - for debug purposes in case of error */
                    var transProm = $translate(['ERROR','AN_ERROR_HAS_OCCURRED_PLEASE_TRY_AGAIN']);
                    transProm.then(function(transStrings){
                        PopupSrv.showAlert(transStrings.ERROR,  transStrings.AN_ERROR_HAS_OCCURRED_PLEASE_TRY_AGAIN); 
                    });
                });
            }
        });
    };
    
    /** 
     *  Function to submit the object to Parse using the REST API
     *  Notice that the Content-Type specified
     *  in the headers is currently "plain/text"
     *
     *  @author Bruno <bruno@serfe.com>
     *  
     *  @returns {message} / An alert popup message inroming the result of the process to the user.
     */
    $scope.sendPicture = function() {
        $ionicLoading.show({
            template: "Uploading.. Please wait.."
        });
        /**
         * Set camera image uri to post.
         * @type @exp;$scope@pro;imgURI
         */
        var data = {cameraImage: $scope.imgURI};
        
        /**
         * Free $scope var imgURI to keep the new behavior working
         */
        $scope.imgURI = undefined;
        
        /**
         * Only send param if is set from the url
         */
        if(angular.isDefined($stateParams.car_id) && $stateParams.car_id != null){
            data.vehicleId = $stateParams.car_id;
        }
        // Upload the image file via post to RESTApi
        $http.post(cgApiUri + "/insurance/save_card", {data: data}, {
            headers: {"Accept": "application/json"}
        })
        .success(function(result) {
            $ionicLoading.hide();
            $location.path('/my-service');
        })
        .error(function(error) {
            $ionicLoading.hide();
            console.log(error); /* Do not remove this console log - for debug purposes in case of error */
            var transProm = $translate(['ERROR','AN_ERROR_HAS_OCCURRED_PLEASE_TRY_AGAIN']);
            transProm.then(function(transStrings){
                PopupSrv.showAlert(transStrings.ERROR,  transStrings.AN_ERROR_HAS_OCCURRED_PLEASE_TRY_AGAIN); 
            });
        });
    };
});