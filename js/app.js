// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

/* global mainModule, cgApiUri, cgApiProtocol, cgApiPort, cgApiDomainName */
var debug = false;

/* API Protocol */
var cgApiProtocol = 'http';

/* API Port */
var cgApiPort = '';

/* API Domain Name */
var cgApiDomainName = 'api.cargenieapp.com';
//var cgApiDomainName = 'cargenie2.dev.sudjam.com';

/* SERVER URL */
var cgServerUri = cgApiProtocol + '://' + cgApiDomainName + ':' + cgApiPort;

/* API URI */
var cgApiUri = cgApiProtocol + '://' + cgApiDomainName + ':' + cgApiPort + '/api';

/* AD SERVER Domain name */
var cgAdServerDomainName = 'cargenads.cpdev.sudjam.com';

/* AD SERVER URI */
var cgAdServerUri = cgApiProtocol + '://' + cgAdServerDomainName + '/delivery/asyncspc.php';

/* Android Sender Id */
var androidSenderId = '205433243225';

var db = null;

var mainModule = angular.module('CarGenie', ['ionic'

        , 'ngIOS9UIWebViewPatch'


        , 'ngCordova'


        , 'uiGmapgoogle-maps'


        , 'ngStorage'


        , 'CGServices'


        , 'GeneralDirectives'


        , 'ui.bootstrap.datetimepicker'


        , 'angular-jwt'


        , 'ui.mask'


        , 'pascalprecht.translate'
    ])
    .run(function($rootScope, $ionicPlatform, $ionicPopup, PopupSrv, $cordovaPush, $http, $cordovaDevice, $timeout, $cordovaSQLite, $localStorage) {
        $ionicPlatform.ready(function() {
            //try{
            //    ga_storage._setAccount('UA-66221320-1');
            //    ga_storage._trackPageview('home');
            //    ga_storage._trackEvent('home', 'home', 'home', '1');
            //} catch (e) {
            //    console.log(e.message);
            //}

            if (typeof analytics != 'undefined') {
                analytics.startTrackerWithId("UA-66221320-1");
                //analytics.debugMode();
            } else {
                console.log("Google Analytics Unavailable");
            }

            if (typeof analytics != 'undefined') {
                analytics.trackView("Home");
            }

            /**
             * Wait until all ionic platform, plugins, device are ready.
             * 
             * @returns {undefined}
             */
            $timeout(function() {
                $cordovaDevice.getDevice();
                $cordovaDevice.getCordova();
                $cordovaDevice.getModel();
                $cordovaDevice.getPlatform();
                $cordovaDevice.getUUID();
                $cordovaDevice.getVersion();
            }, 5000);

            $rootScope.offline = false;
            $rootScope.$watch(
                function checkNetworkConnection() {
                    if (window.Connection) {
                        if (navigator.connection.type == Connection.NONE && !$rootScope.offline) {
                            $rootScope.offline = true;
                            $ionicPopup.alert({
                                    title: "Car Genius connection loss",
                                    content: "Please connect to wifi or data network to complete this action."
                                })
                                .then(function(result) {
                                    ionic.Platform.exitApp();
                                });
                        }
                    }
                }
            );

            /**
             * Global function to show the object list as is (without sorting in alphabetical order).
             * 
             * @param {type} obj
             * @returns {Array|Function.keys|Function|Function.arr}
             */
            $rootScope.unsorted = function(obj) {
                obj = angular.copy(obj);
                if (!obj) {
                    return [];
                }
                return Object.keys(obj);
            };
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();
            }

            /**
             * Initiaize push notification plugin.
             */
            if (typeof PushNotification != 'undefined') {
                var push = PushNotification.init({
                    "android": {
                        "senderID": androidSenderId
                    },
                    "ios": {
                        "sound": "true"
                    }
                });

                /**
                 * Event listener to receive messages notifications.
                 * 
                 * Possible params:
                 *    - data.message
                 *    - data.title
                 *    - data.count
                 *    - data.sound
                 *    - data.image
                 *    - data.additionalData
                 */
                push.on('notification', function(data) {
                    /**
                     * Show alert message informing the event.
                     */
                    if (data.title != '' && data.message != '') {
                        PopupSrv.showAlert(data.title, data.message);
                    }
                });

                /**
                 * Event listener on error.
                 */
                push.on('error', function(e) {
                    PopupSrv.showAlert('Error', e.message);
                });

                push.on('registration', function(data) {
                    //console.log('registration event: ' + data.registrationId);

                    var oldRegId = localStorage.getItem('registrationId');
                    if (oldRegId !== data.registrationId) {
                        // Save new registration ID
                        localStorage.setItem('registrationId', data.registrationId);
                        // post to server
                        if (typeof $localStorage.userToken != 'undefined') {
                            //console.log("sending push notification id" + localStorage.getItem('registrationId'));
                            var sendData = {
                                "registrationId": localStorage.getItem('registrationId'),
                                "userId": $localStorage.user.id
                            };
                            $http.post(cgApiUri + "/register_gcm", {
                                "data": sendData
                            }, {
                                headers: {
                                    "Accept": "application/json"
                                }
                            });
                        }
                    }
                });
            }

            $ionicPlatform.on('resume', function() {
                db = window.sqlitePlugin.openDatabase({
                    name: "makes_models.db",
                    location: 2,
                    createFromLocation: 1
                });
            });

            $ionicPlatform.on('pause', function() {
                db.close();
            });

            if (db == null) {
                db = window.sqlitePlugin.openDatabase({
                    name: "makes_models.db",
                    location: 2,
                    createFromLocation: 1
                });
            }

            var admobid = {};
            if (/(android)/i.test(navigator.userAgent)) { // for android & amazon-fireos
                admobid = {
                    banner: 'ca-app-pub-5763339179685383/1069246557', // or DFP format "/6253334/dfp_example_ad"
                    interstitial: 'ca-app-pub-5763339179685383/9896816155'
                };
            } else if (/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
                admobid = {
                    banner: 'ca-app-pub-5763339179685383/1069246557',
                    interstitial: 'ca-app-pub-5763339179685383/9896816155'
                };
            }

            if (AdMob) AdMob.createBanner({
                adId: admobid.banner,
                position: AdMob.AD_POSITION.BOTTOM_CENTER,
                autoShow: true
            });

            if (AdMob) AdMob.prepareInterstitial({
                adId: admobid.interstitial,
                autoShow: false
            });

        });
    });


var mymodal = angular.module('mymodal', []);



/*function showPopUp(){
    PopupSrv.showAlert(tranStrings.SERVICE_FAIL, tranStrings.INVALID_LOGIN);
}*/