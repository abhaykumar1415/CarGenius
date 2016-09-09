/* global angular */
angular.module('CarGenie')
.controller('StorelocatorCtrl', function($scope, $location) {
    /**
     * Controller for main step. 
     */
    $scope.locationSearch = {};
    /**
     * Keep the data in the form
     */
    $scope.locationSearch.zipcode = sessionStorage.getItem('map_zipcode') || '';
    $scope.locationSearch.distance = sessionStorage.getItem('map_distance') || '';
    
    /**
     * Function that search locations and redirect to display locations.
     * 
     * @param {type} data
     * @returns {undefined}
     */
    $scope.searchLocations = function(data, ev){
       ev.preventDefault();
       $location.path('/store-locator/select-preferred-location/'+ data.zipcode + '/' + data.distance);
    }

    if(typeof analytics != 'undefined') { analytics.trackView("Store Locator"); }

})
.controller('GoogleMapCtrl', function($scope, $location, locationById) {

    if(typeof analytics != 'undefined') { analytics.trackView("Store Locator - Google Maps"); }

    /**
     * Function to show Google map with markers.
     * 
     * @param {json object} mapData / map data with latitude and longitude.
     * @returns {void}
     */
    $scope.showMap = function(mapData){
        if(angular.isDefined(mapData.data.entity) && angular.isDefined(mapData.data.entity)){
            $scope.mapdata = mapData;
            $scope.map = {center: {latitude: mapData.data.entity.latitude, longitude: mapData.data.entity.longitude}, zoom: 18};
            //map general options.
            $scope.options = {scrollwheel: true, draggable: true, rotateControl: true};
            //map marker with coords of the marker and options.
            $scope.marker = {
              id: 0 ,
              coords: {
                latitude: $scope.map.center.latitude,
                longitude: $scope.map.center.longitude
              },
              options: { 
                  draggable: false, 
                  animation: 1 
              }
            };
        }
    };
    
    /**
     * Function used to return to previos page (move to general directives)
     * TODO: move this to route service.
     * 
     * @param {type} url
     * @returns {undefined}
     */
    $scope.backTo = function(url){
      /**
       * Get distnace from session storage
       */
      var map_zipcode = sessionStorage.getItem('map_zipcode');
      var map_distance = sessionStorage.getItem('map_distance');
      var redirectUrl = url.replace(':zipcode/:distance', map_zipcode + '/' + map_distance || '');
      $location.path(redirectUrl);  
    };
    
    /**
     * Check if for the map data.
     */
    if(angular.isDefined(locationById)){
        /* Show the map */
        $scope.showMap(locationById);
    }
}).controller('LocationsCtrl', function($scope, locationsByZip) {

    if(typeof analytics != 'undefined') { analytics.trackView("Store Locator - Locations"); }

    $scope.locationSearch = {};
    
    /**
     * Function to show locations.
     * 
     * @param {json object} locationsData
     * @returns {void}
     */
    $scope.showLocations = function(locationsData){ 
        if(locationsData.data != null && locationsData.data.entities != null){
            $scope.locations = locationsData.data.entities.items;
            $scope.locationsFound = locationsData.data.entities.items.length;
        }
    };

    /**
     * Check if locations object is defined and show locations
     */
    if(angular.isDefined(locationsByZip)){
        $scope.showLocations(locationsByZip);
    }
});

