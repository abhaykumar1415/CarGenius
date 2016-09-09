/* global angular */
angular.module('CarGenie')
.directive('storeLocatorMap', function(){
    return {
        restrict: 'E',
        templateUrl: 'templates/partials/store_locator/infomap.html',
        link: function(scope, el, attrs){
            if(angular.isDefined(scope.mapdata)){
                scope.mapInfo = {
                    id: scope.mapdata.data.entity.id,
                    title: scope.mapdata.data.entity.title,
                    image: scope.mapdata.data.entity.image,
                    address: scope.mapdata.data.entity.address,
                    phone: scope.mapdata.data.entity.phone,
                    city: scope.mapdata.data.entity.city,
                    state: scope.mapdata.data.entity.state,
                    zipcode: scope.mapdata.data.entity.zipcode
                };
                
            }
        }
    };
})
.directive('uiGmapGoogleMap', ['$document', function($document) {
    return {
        link: function(scope, element, attr) {
            element.on('click', function(event){
                event.preventDefault();
                event.stopPropagation();
                var mapUrl = $("a[title='Click to see this area on Google Maps']")[0].href;
                window.open(mapUrl, '_system');
            });
        }
    };
}])
.directive('locations', function(){
    return {
        templateUrl: 'templates/partials/store_locator/locations.html',
    };
})
.directive('hoursOperation', function(){
    return {
        restrict: 'E',
        templateUrl: 'templates/partials/store_locator/hours_operation.html',
        link: function(scope, el, attrs){
            if(angular.isDefined(scope.mapdata)){
                scope.hoursOperationInfo = {
                    hours_operation: scope.mapdata.data.entity.hourofoperation
                };
                console.log(scope.mapdata);
            }
        }
    };
});