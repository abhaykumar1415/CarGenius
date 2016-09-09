/* global angular */
angular.module('CarGenie')
/**
 * Index My Schedule controller
 * 
 * @param {object} $scope / The controller scope.
 * @param {service} $location / Location service handler.
 * @param {service} $localStorage / Local storage handler.
 * @param {service} $stateParams / Service to handle url params.
 * @param {service} MyScheduleSrv / My Schdule service to handle API requests.
 * @param {service} UtilsSrv / The Utils service with common and useful funcitons.
 * @returns {undefined}
 */
.controller('MyScheduleCtrl', function($scope, $location, $localStorage, $stateParams, MyScheduleSrv, UtilsSrv, CarsSrv) {
    $scope.mCarInfo = {};

    if(typeof analytics != 'undefined') { analytics.trackView("My Schedule"); }

    /**
     * Keep the searched values in session when use go back
     */
    var sessJson = sessionStorage.getItem('sessCarInfo');
    if(sessJson != 'undefined'){
//        $scope.sessCarInfo = JSON.parse(sessJson);
        sessionStorage.getItem('sessCarInfo', undefined);
    }
    if(angular.isDefined($scope.sessCarInfo)){
        $scope.mCarInfo = $scope.sessCarInfo;
    }
    if(angular.isDefined($stateParams.car_id) && $stateParams.car_id != null){
        //search car localstorage by id
        var key = UtilsSrv.getArrayKeyFromObjectId($localStorage.cars, $stateParams.car_id);
        $scope.mCarInfo = $localStorage.cars[key];

        // Retrieve mileage ID for server request
        var tempCarInfo = $localStorage.cars[key];
        // An Array to hold mileages data
        var mg = {};
        // A list of mileages for the current year id
        var mileagesFunc = function(mileages) {
            mg = mileages.data.entities;
            var newInfo = null;
            for (k in mg) {
                if (tempCarInfo.mileage <= mg[k].mileage) {
                    newInfo = { make: tempCarInfo.make, year: tempCarInfo.year, model: tempCarInfo.model, mileage: mg[k] };
                    $scope.mCarInfo = newInfo;
                    break;
                }
            }
            if (!newInfo) {
                console.log("mileage not found");
            }
            sessionStorage.setItem('sessCarInfo', JSON.stringify($scope.mCarInfo));
        };
        var tempMileage = CarsSrv.getMileagesByYear(tempCarInfo.year.id, mileagesFunc);
    } 
    
    /**
     * Function to get the services list.
     * 
     * @param {object} mCarInfo / The car information.
     * @param {object} ev / event handler.
     * @returns {undefined}
     */
    $scope.getServicesList = function(mCarInfo, ev){
        ev.preventDefault();
        var adSuccess = function(success) {
            console.log(success);
            //window.admob.requestInterstitialAd();
            if(window.AdMob) window.AdMob.prepareInterstitial( {adId:admobid.interstitial, autoShow:false} );
        };
        var adError = function(error) {
            console.log(error);
        };
        MyScheduleSrv.setData(mCarInfo);
        if(angular.isDefined(mCarInfo.id)){
            //window.admob.showInterstitialAd(adSuccess, adError);
            window.AdMob.showInterstitial();
            $location.path('/my-maintenance/services/'+mCarInfo.id);
        } else {
            sessionStorage.setItem('sessCarInfo', JSON.stringify(mCarInfo));
            //window.admob.showInterstitialAd(adSuccess, adError);
            window.AdMob.showInterstitial();
            $location.path('/my-maintenance/services/');
        }
    };
})
/**
 * My Schdule services controller
 * 
 * @param {object} $scope / The controller scope.
 * @param {service} $localStorage / Local storage handler.
 * @param {service} $stateParams / Service to handle url params.
 * @param {service} servicesData / services information obtained from MySchduleSrv service.
 * @param {service} UtilsSrv / The Utils service with common and useful funcitons.
 * @returns {undefined}
 */
.controller('MyScheduleServicesCtrl', function($scope, $localStorage, $stateParams, servicesData, UtilsSrv){
    $scope.mCarInfo = {};

    if(typeof analytics != 'undefined') { analytics.trackView("My Services - Schedule"); }

    var sessJson = sessionStorage.getItem('sessCarInfo');
    if(sessJson != 'undefined'){
        $scope.sessCarInfo = JSON.parse(sessJson);
    }
    if(angular.isDefined($scope.sessCarInfo)){
        $scope.mCarInfo = $scope.sessCarInfo;
    }
    if(angular.isDefined($stateParams.car_id) && $stateParams.car_id != null){
        //search car localstorage by id
        var key = UtilsSrv.getArrayKeyFromObjectId($localStorage.cars, $stateParams.car_id);
        $scope.mCarInfo = $localStorage.cars[key];
    }
    if(angular.isDefined(servicesData.data.entities)){
        $scope.services = servicesData.data.entities.items;
    }
});

