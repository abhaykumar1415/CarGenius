/* global mainModule */
mainModule.config(function ($stateProvider, $urlRouterProvider, uiGmapGoogleMapApiProvider, $translateProvider, $httpProvider, jwtInterceptorProvider, $ionicConfigProvider) {
    var flagToken = false;
    jwtInterceptorProvider.tokenGetter = ['$localStorage', '$translate', '$state', 'jwtHelper', '$location', 'PopupSrv', function ($localStorage, $translate, $state, jwtHelper, $location, PopupSrv) {
        return $localStorage.userToken;
    }];

    $ionicConfigProvider.views.swipeBackEnabled(false);

    $httpProvider.interceptors.push('jwtInterceptor');

    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyAUVVw3Mona0QadCC9KlJMQRj8yH2-IAW4'
        , v: '3.17'
        , libraries: ''
        , language: 'en'
        , sensor: 'false'
    , });
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider.state('home', {
        url: '/home'
        , templateUrl: 'templates/index.html'
        , resolve: {
            clearSession: function () {
                sessionStorage.setItem('sessCarInfo', undefined);
            },
            makingSquare: function(){
                $(document).click(function(event) {
                    if($(event.target).attr('class') == "sweepStakePopMainPageOuter" || $(event.target).attr('class') == "backdrop visible active"){
                        $(".sweepStakePopMainPageOuter").hide();
                        $(".sweepStakePopThankPageOuter").hide();
                        $(".backdrop").removeClass("visible active");
                    }
                    else if($(event.target).attr('class') == "enterNow"){
                        $(".sweepStakePopMainPageOuter").hide();
                        $(".sweepStakePopThankPageOuter").show();
                    }
                    else if($(event.target).attr('class') == "OkNow"){
                        $(".sweepStakePopMainPageOuter").hide();
                        $(".sweepStakePopThankPageOuter").hide();
                        $(".backdrop").removeClass("visible active");   
                    }
                });
                $(".sweepStakePopMainPageOuter .sweepStakePopMainPageInner .item-checkbox .checkbox").removeClass("checkbox-circle").addClass("checkbox-square");
            }

        }, 
        controller: 'MyHomeSweepStakeCtrl'
    })

   /* .state('openCustomPopup', {
            url: '/store-locator/select-zip'
            , templateUrl: 'templates/store_locator/step1.html'
            , controller: 'StorelocatorCtrl'
            , resolve:{
                openMainPopUp: function(){
                    PopupSrv.showAlert('Not Found', 'No locations found.');
                }
            }
    })*/


    /*** Store Locator ***/

    .state('select-zip', {
            url: '/store-locator/select-zip'
            , templateUrl: 'templates/store_locator/step1.html'
            , controller: 'StorelocatorCtrl'
        })
    .state('select-preferred-location', {
            url: '/store-locator/select-preferred-location/:zipcode/:distance'
            , templateUrl: 'templates/store_locator/step2.html'
            , controller: 'LocationsCtrl'
            , resolve: {
                locationsByZip: function ($stateParams, $location, StoreLocatorSrv, PopupSrv) {
                    /**
                     * Save zipcode and distance in session
                     */
                    sessionStorage.setItem('map_zipcode', $stateParams.zipcode);
                    sessionStorage.setItem('map_distance', $stateParams.distance);
                    /**
                     * Get promise info
                     */
                    var locationsPromise = StoreLocatorSrv.getLocationByZip($stateParams.zipcode, $stateParams.distance);
                    locationsPromise.then(function (locationsData) { //Evaluate promise
                        if (locationsData.data != null) {
                            if (angular.isUndefined(locationsData.data.entities) || locationsData.data.entities.items.length == 0) {
                                /* Show message */
                                if (locationsData.status == 0) {
                                    PopupSrv.showAlert('Warning', 'Connection error. Please make sure that you can access the internet on your device and try again.');
                                } else if (locationsData.status == 200) {
                                    PopupSrv.showAlert('Not Found', 'No locations found.');
                                } else {
                                    PopupSrv.showAlert(locationsData.statusText, locationsData.data.message);
                                }
                                /* Go to previous step */
                                $location.path('/store-locator/select-zip');
                            }
                        } else {
                            PopupSrv.showAlert('Warning', 'Connection error. Please make sure that you can access the internet on your device and try again.');
                            $location.path('/');
                        }
                    });
                    return locationsPromise;
                }
            }
        })
        .state('display-service-and-map', {
            url: '/store-locator/display-service/:locationId'
            , templateUrl: 'templates/store_locator/step3.html'
            , controller: 'GoogleMapCtrl'
            , resolve: {
                locationById: function ($stateParams, $location, PopupSrv, StoreLocatorSrv) {
                    /**
                     * Get promise info
                     */
                    var mapDataPromise = StoreLocatorSrv.getLocationById($stateParams.locationId);
                    mapDataPromise.then(function (mapData) { //Evaluate promise
                        /* Show message */
                        if (mapData.status == 0) {
                            PopupSrv.showAlert('Warning', 'Connection error. Please make sure that you can access the internet on your device and try again.');
                            $location.path('/store-locator/select-zip');
                        } else if (mapData.status == 500) {
                            PopupSrv.showAlert(mapData.statusText, mapData.data.message);
                            $location.path('/store-locator/select-zip');
                        }
                    });
                    return mapDataPromise;
                }
            }
        })

    /*** My Service ***/

    .state('my-service', {
            url: '/my-service'
            , cache: false
            , templateUrl: 'templates/my_service/index.html'
            , controller: 'MyServiceSelectCtrl'
            , resolve: {
                carList: function ($location, PopupSrv, MyServiceSrv, $translate, $localStorage) {
                    
                    //PopupSrv.showAlert('Not Found', 'No locations found.');

                    var carsPromise = MyServiceSrv.getCarList();
                    carsPromise.then(function (carsData) { //Evaluate promise
                        if (carsData.status === 401 && typeof $localStorage.userToken == 'undefined') {
                            var transProm = $translate(['SERVICE_FAIL', 'INVALID_LOGIN']);
                            transProm.then(function (tranStrings) {
                                PopupSrv.showAlert(tranStrings.SERVICE_FAIL, tranStrings.INVALID_LOGIN);
                                $location.path('/users/login');
                            });
                            return;
                        } else if (carsData.status === 401) {
                            var transProm = $translate(['SESSION', 'YOUR_SESSION_HAS_BEEN_EXPIRED']);
                            transProm.then(function (transStrings) {
                                PopupSrv.showAlert(transStrings.SESSION, transStrings.YOUR_SESSION_HAS_BEEN_EXPIRED);
                                $location.path('/users/login');
                            });
                        }
                        if (carsData.data != null) {
                            if (angular.isUndefined(carsData.data.vehicles) || carsData.data.vehicles.length == 0) {
                                /* Show message */
                                if (carsData.status == 0) {
                                    PopupSrv.showAlert('Warning', 'Connection error. Please make sure that you can access the internet on your device and try again.');
                                } else if (carsData.status == 404) {
                                    //                                PopupSrv.showAlert('Not Found', 'No vehicles found.'); //add proper message in the server.
                                } else if (carsData.status != 200 && carsData.status != 401) {
                                    PopupSrv.showAlert(carsData.statusText, carsData.data.message);
                                }
                                /* Go to previous step */
                                if (carsData.status != 200 && carsData.status != 404 && carsData.status != 401) {
                                    $location.path('/');
                                } else if (carsData.status == 401) {
                                    $location.path('/my-service');
                                }
                            }
                        } else {
                            PopupSrv.showAlert('Warning', 'Connection error. Please make sure that you can access the internet on your device and try again.');
                            $location.path('/');
                        }
                    });
                    return carsPromise;
                }
            }
        })
        .state('edit-vehicle', {
            url: '/my-service/edit-vehicle/:car_id'
            , cache: false
            , params: {
                car_id: {
                    value: null
                }
            }
            , templateUrl: 'templates/my_service/add_edit_vehicle.html'
            , controller: 'MyServiceAddEditCtrl'
        })
        .state('scan-insurance-card', {
            url: '/my-service/scan-insurance-card/:car_id'
            , cache: false
            , reload: true
            , params: {
                car_id: {
                    value: null
                }
            }
            , templateUrl: 'templates/my_service/camera_scan.html'
            , controller: 'MyServiceCameraCtrl'
        })
        .state('insurance-card-snaptshot', {
            url: '/my-service/insurance-card-snaptshot/:car_id/:img_uri'
            , cache: false
            , reload: true
            , params: {
                car_id: {
                    value: null
                }
                , img_uri: {
                    value: null
                }
            }
            , templateUrl: 'templates/my_service/insurance_card.html'
            , controller: 'MyServiceCameraCtrl'
        })
        .state('reminders-and-history', {
            url: '/my-service/reminders-and-history/:car_id'
            , cache: false
            , params: {
                car_id: {
                    value: null
                }
            }
            , templateUrl: 'templates/my_service/reminders_history_index.html'
            , controller: 'MyServiceReminderHistoryIndexCtrl'
        })
        .state('list-reminders', {
            url: '/my-service/list-reminders/:car_id'
            , cache: false
            , params: {
                car_id: {
                    value: null
                }
            }
            , templateUrl: 'templates/my_service/reminders_list.html'
            , controller: 'MyServiceListRemindersCtrl'
            , resolve: {
                reminderList: function ($stateParams, $location, PopupSrv, MyServiceSrv) {
                    var remindersPromise = MyServiceSrv.getReminderList($stateParams.car_id);
                    remindersPromise.then(function (remindersData) { //Evaluate promise
                        if (remindersData.data != null) {
                            if (angular.isUndefined(remindersData.data.entities) || remindersData.data.entities.length == 0) {
                                /* Show message */
                                if (remindersData.status == 0) {
                                    PopupSrv.showAlert('Warning', 'Connection error. Please make sure that you can access the internet on your device and try again.');
                                } else if (remindersData.status == 404) {
                                    //                                PopupSrv.showAlert('Not Found', 'No vehicles found.');
                                } else if (remindersData.status != 200 && remindersData.status != 401) {
                                    PopupSrv.showAlert(remindersData.statusText, remindersData.data.message);
                                }
                                /* Go to previous step */
                                if (remindersData.status != 200 && remindersData.status != 404) {
                                    $location.path('/my-service');
                                }
                            }
                        }
                    });
                    return remindersPromise;
                }
            }
        })
        .state('list-history', {
            url: '/my-service/list-history/:car_id'
            , cache: false
            , params: {
                car_id: {
                    value: null
                }
            }
            , templateUrl: 'templates/my_service/history_list.html'
            , controller: 'MyServiceListHistoryCtrl'
            , resolve: {
                reminderHistoryList: function ($stateParams, $location, PopupSrv, MyServiceSrv) {
                    var remindersHistoryPromise = MyServiceSrv.getReminderHistoryList($stateParams.car_id);
                    remindersHistoryPromise.then(function (remindersHistoryData) { //Evaluate promise
                        if (remindersHistoryData.data != null) {
                            if (angular.isUndefined(remindersHistoryData.data.entities) || remindersHistoryData.data.entities.length == 0) {
                                /* Show message */
                                if (remindersHistoryData.status == 0) {
                                    PopupSrv.showAlert('Warning', 'Connection error. Please make sure that you can access the internet on your device and try again.');
                                } else if (remindersHistoryData.status == 404) {
                                    //                                PopupSrv.showAlert('Not Found', 'No vehicles found.'); //add proper message in the server.
                                } else if (remindersHistoryData.status != 200 && remindersHistoryData.status != 401) {
                                    PopupSrv.showAlert(remindersHistoryData.statusText, remindersHistoryData.data.message);
                                }
                                /* Go to previous step */
                                if (remindersHistoryData.status != 200 && remindersHistoryData.status != 404) {
                                    $location.path('/my-service');
                                }
                            }
                        }
                    });
                    return remindersHistoryPromise;
                }
            }
        })
        .state('add-edit-reminder', {
            url: '/my-service/add-edit-reminder/:car_id/:reminder_id'
            , cache: false
            , params: {
                car_id: {
                    value: null
                }
                , reminder_id: {
                    value: null
                    , squash: true
                }
            }
            , templateUrl: 'templates/my_service/add_edit_reminder.html'
            , controller: 'MyServiceAddEditReminderCtrl'
        })
        .state('add-edit-history', {
            url: '/my-service/add-edit-history/:car_id/:reminder_history_id'
            , cache: false
            , params: {
                car_id: {
                    value: null
                }
                , reminder_history_id: {
                    value: null
                    , squash: true
                }
            }
            , templateUrl: 'templates/my_service/add_edit_history.html'
            , controller: 'MyServiceAddEditHistoryCtrl'
        })

    /*** My Maintenance Schedule ***/

    .state('my-maintenance', {
            url: '/my-maintenance'
            , cache: false
            , templateUrl: 'templates/my_maintenance/index.html'
            , controller: 'MyScheduleCtrl'
            , resolve: {
                clearSession: function () {
                    sessionStorage.setItem('sessCarInfo', undefined);
                }
            }
        })
        .state('my-maintenance/car', {
            url: '/my-maintenance/car/:car_id'
            , params: {
                car_id: {
                    value: null
                }
            }
            , cache: false
            , templateUrl: 'templates/my_maintenance/index.html'
            , controller: 'MyScheduleCtrl'
        })
        .state('my-maintenance-services', {
            url: '/my-maintenance/services/:car_id'
            , cache: false
            , params: {
                car_id: {
                    value: null
                }
            }
            , templateUrl: 'templates/my_maintenance/services_list.html'
            , controller: 'MyScheduleServicesCtrl'
            , resolve: {
                servicesData: function ($location, PopupSrv, MyScheduleSrv, $timeout) {
                    var servicesPromise = MyScheduleSrv.getServicesByFilter();
                    servicesPromise.then(function (servicesData) { //Evaluate promise
                        if (servicesData.data != null) {
                            if (angular.isUndefined(servicesData.data.entities) || servicesData.data.entities.items.length == 0) {
                                /* Show message */
                                if (servicesData.status == 0) {
                                    PopupSrv.showAlert('Warning', 'Connection error. Please make sure that you can access the internet on your device and try again.');
                                } else if (servicesData.status == 200) {
                                    PopupSrv.showAlert('Not Found', 'No services found.');
                                } else {
                                    PopupSrv.showAlert(servicesData.statusText, servicesData.data.message);
                                }
                                /* Go to previous step */
                                $timeout(function () {
                                    $location.path('/my-maintenance');
                                }, 1500);
                            }
                        }
                    });
                    return servicesPromise;
                }
            }
        })

    /*** Offers ***/

    .state('offers', {
            url: '/offers'
            , cache: false
            , controller: 'OffersListCtrl'
            , templateUrl: 'templates/offers/index.html'
            , resolve: {

                makingSquare: function(){
                    $(document).click(function(event) {
                    if($(event.target).attr('class') == "sweepStakePopMainPageOuter" || $(event.target).attr('class') == "backdrop visible active"){
                        $(".sweepStakePopMainPageOuter").hide();
                        $(".sweepStakePopThankPageOuter").hide();
                        $(".backdrop").removeClass("visible active");
                    }
                    else if($(event.target).attr('class') == "enterNow"){
                        $(".sweepStakePopMainPageOuter").hide();
                        $(".sweepStakePopThankPageOuter").show();
                    }
                    else if($(event.target).attr('class') == "OkNow"){
                        $(".sweepStakePopMainPageOuter").hide();
                        $(".sweepStakePopThankPageOuter").hide();
                        $(".backdrop").removeClass("visible active");   
                    }
                });
                $(".sweepStakePopMainPageOuter .sweepStakePopMainPageInner .item-checkbox .checkbox").removeClass("checkbox-circle").addClass("checkbox-square");
                }
            }
        })
        .state('display-offer', {
            url: '/offers/display-offer/:offer_id'
            , cache: false
            , params: {
                offer_id: {
                    value: null
                }
            }
            , templateUrl: 'templates/offers/offer.html'
            , controller: 'OfferCtrl'
        })
        .state('display-sponsors', {
            url: '/offers/display-sponsors'
            , templateUrl: 'templates/offers/sponsors.html'
            , controller: 'SponsorsCtrl'
        })

    /*** Users ***/

    .state('users/login', {
            url: '/users/login'
            , templateUrl: 'templates/users/login.html'
            , controller: 'usersCtrl'
        })
        .state('users/forgot-password', {
            url: '/users/forgot-password'
            , templateUrl: 'templates/users/forgot_password.html'
            , controller: 'forgotPasswordCtrl'
        })
        .state('users/registration', {
            url: '/users/registration'
            , templateUrl: 'templates/users/registration.html'
            , controller: 'registerCtrl'
        })

    /*** Contents ***/

    .state('contents/about', {
            url: '/contents/about'
            , templateUrl: 'templates/contents/about.html'
            , controller: 'ContentsCtrl'
        })
        .state('contents/terms', {
            url: '/contents/terms'
            , templateUrl: 'templates/contents/terms.html'
            , controller: 'ContentsCtrl'
        })
        .state('contents/privacy', {
            url: '/contents/privacy'
            , templateUrl: 'templates/contents/privacy.html'
            , controller: 'ContentsCtrl'
        });

    /*** Default route ***/

    $urlRouterProvider.otherwise('/home');

    /*** Translations ***/

    // Simply register translation table as object hash
    $translateProvider.translations('en', englishTranslations());
    $translateProvider.preferredLanguage("en");
    $translateProvider.fallbackLanguage("en");
    $translateProvider.useSanitizeValueStrategy('sanitize');
});