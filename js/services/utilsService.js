/* global angular */
angular.module('CarGenie')
.service('UtilsSrv', ['$q', '$location', '$translate', '$timeout', 'PopupSrv', function($q, $location, $translate, $timeout, PopupSrv) {
	/**
	 * Function to get the key of an array of objects
	 * searching from a particular object id property.
	 *
	 * @author Bruno <bruno@serfe.com>
	 *
	 * @returns {undefined}
	 */
	this.getArrayKeyFromObjectId = function(arrOfObjects, idToSearchIn){
			var keySearched = '?';
			angular.forEach(arrOfObjects ,function(obj, key){
				angular.forEach(obj ,function(value, k){
					if(k == 'id' && value == idToSearchIn){
						keySearched = key;
					}
				});
			});
			return keySearched;
	};

	/**
	 * Function to show connection error message and redirect to "redirectUrl" param.
	 *
	 * @param {type} redirectUrl / The url path to redirect.
	 *
	 * @author Bruno <bruno@serfe.com>
	 *
	 * @returns {undefined}
	 */
	this.showConnectionErrorMessageAndRedirect = function(redirectUrl){
		var transProm = $translate(['WARNING', 'CONNECTION_ERROR']);
		 transProm.then(function(tranStrings){
			 PopupSrv.showAlert(tranStrings.WARNING, tranStrings.CONNECTION_ERROR);
			 $location.path(redirectUrl);
		 });
	};

	/**
	 * Function to set selected value for car selects.
	 *
	 * @param {angular scope object} scope / scope with selects information.
	 * @param {string} entity / the entity to set value (make, model, year or mileage).
	 * @param {array} carsArray / the cars array to search value.
	 * @param {int} car_id / the car id we are setting.
	 * @param {string} timeout / optional timeout to delay the set of the value.
	 *
	 * @author Bruno <bruno@serfe.com>
	 *
	 * @returns {$q@call;defer.promise}
	 */
	this.setSelectedValueInCarSelector = function(scope, entity, carsArray, car_id, timeout){
		var def = $q.defer();
		if(angular.isUndefined(timeout)){
			timeout = 0;
		}
		if(angular.isDefined(car_id) && car_id != null){
			//search car localstorage by id
			var key = this.getArrayKeyFromObjectId(carsArray, car_id);
			var mCarInfo = carsArray[key];
			var entityId = parseInt(mCarInfo[entity].id);
			$timeout(function(){//wait until ionic load vars to ensure the select is filled correctly.
				if(angular.isDefined(mCarInfo[entity].id)){
				   scope.modelName[entity].id = entityId; /* set selected value*/
				   def.resolve(entityId);
				}
			},timeout);
		}
		return def.promise;
	};

	/**
	 * Function to parse the vehicle list retrieved from the API
	 * and adapt to the current implementation in the app.
	 *
	 * @param {type} vehiclesList / The vehicle list to parse.
	 *
	 * @author Bruno <bruno@serfe.com>
	 *
	 * @returns {$q@call;defer.promise}
	 */
	this.parseAPICarGetListResponse = function(vehiclesList){
		var def = $q.defer();
		var carsTmp =  vehiclesList;
		/**
		 * Parse API data retrieved.
		 */
		angular.forEach(carsTmp, function(mainObj, key){
			carsTmp[key].year = {id: mainObj.modelyear.id, year_number: mainObj.modelyear.year_number};
			carsTmp[key].model = {id: mainObj.modelyear.model.id, title: mainObj.modelyear.model.title};
			carsTmp[key].make = {id: mainObj.modelyear.model.make.id, title: mainObj.modelyear.model.make.title};
			delete carsTmp[key].modelyear;
		});
		def.resolve(carsTmp);
		return def.promise;
	};

	/**
	 * Check if is an image resource
	 *
	 * @param {type} src
	 * @returns {$q@call;defer.promise}
	 */
	 this.isImage = function(src) {
		var deferred = $q.defer();

		var image = new Image();
		image.onerror = function() {
			deferred.resolve(false);
		};
		image.onload = function() {
			deferred.resolve(true);
		};
		image.src = src;

		return deferred.promise;
	};



	this.emptyCarsCache = function(localStorage){
		//avoid undefined error message -- just in case
		if(angular.isDefined(localStorage.user.invalidate_cache_cars)){
			localStorage.user.invalidate_cache_cars = false;
		}
		//empty and "unset"
		localStorage.makes = {};
		localStorage.models = {};
		localStorage.years = {};
		localStorage.mileages = {};
		delete localStorage.makes;
		delete localStorage.models;
		delete localStorage.years;
		delete localStorage.mileages;
	};


}]);
