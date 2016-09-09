/**
 * The purpose of this file is to keep all general directives (commonly used in the application).
 * Specific directives are not allowed here.
 */

/* global angular */
angular.module('GeneralDirectives', [])
.directive('footer', function(){
    return {
        restrict: 'E',
        templateUrl: 'templates/partials/footer/footer.html',
        link: function(scope, el, attrs){
            scope.item = '';
            switch(attrs.activeItem){
               case 'myservice': {scope.itemService = 'active'; break; };
               case 'mymaintenance': { scope.itemMaintenance = 'active'; break; };
               case 'storelocator': { scope.itemStorelocator = 'active'; break; };
               case 'offers': { scope.itemOffers = 'active'; break; };
               default: {};
            }
        }
    };
})
.directive('banner', function(AdSrv){
    return {
        restrict: 'E',
        templateUrl: 'templates/partials/footer/banner.html',
        link: function(scope, el, attrs){
            var zoneProm = null;
            scope.item = '';
            if(attrs.type == 'home'){
                scope.homeBanner = true;
                zoneProm = AdSrv.getAdByZone(1);
            } else if(attrs.type == 'mymaintenance') {
                scope.myMaintenanceBanner = true;
                zoneProm = AdSrv.getAdByZone(2);
            } else if(attrs.type == 'myservice') {
                scope.myServiceBanner = true;
                zoneProm = AdSrv.getAdByZone(2);//still be 2 because ad for this zone is not defined.
            } else if(attrs.type == 'storelocator') {
                scope.storeLocatorBanner = true;
                zoneProm = AdSrv.getAdByZone(2);//still be 2 because ad for this zone is not defined.
            } else if(attrs.type == 'offers') {
                scope.offersBanner = true;
                zoneProm = AdSrv.getAdByZone(2);//still be 2 because ad for this zone is not defined.
            }
            
            if(zoneProm != null && typeof zoneProm != 'undefined'){
                zoneProm.then(function(adData){
                    //TODO: replace string with adData.data.html
                    var tmpBannerData = adData.data[0].html;
                    /**
                     * Extract anchor data only and remove extra div.
                     * 
                     * @type @exp;tmpBannerData@call;indexOf
                     */
                    var startPosDiv = tmpBannerData.indexOf('div');
                    var bannerData = tmpBannerData.slice(0, startPosDiv-1);
                    /**
                     * Register the Ad's URL to variable adURL
                     * Extract <img> element, bind it to html
                     * Register handleAdClick function to anchor
                     */
                    scope.adURL = $(bannerData).attr('href');
                    var imgElement = $('img', $(bannerData));
                    scope.banner = imgElement.prop('outerHTML');
                });
            }
            // Register click function
            scope.handleAdClick = function() {
                window.open(scope.adURL, "_system");
            }
        }
    };
})
.directive('resize', function ($window) { /* http://jsfiddle.net/jaredwilli/SfJ8c/ */
    return function (scope, element) {
        angular.element(document).ready(function () {
            var w = angular.element($window);
            var elem = element;
            scope.getWindowDimensions = function () {
                return {
                    'h': elem[0].clientHeight,
                    'w': elem[0].clientWidth
                };
            };
            scope.$watch(scope.getWindowDimensions, function (newValue) {
                // Reserve height of either Add or Service button block
                var buttonBlock = 0;
                var addButtons = document.querySelector('.myService .serviceAddBlock');
                var serviceButtons = document.querySelector('.myService .serviceEditBlock');
                if (addButtons !== null && scope.isEdit === false) {
                    buttonBlock = addButtons.clientHeight;
                }
                if (serviceButtons !== null && scope.isEdit === true) {
                    buttonBlock = serviceButtons.clientHeight;
                }
                // Retrieve height of container, header and footer
                var containerBlock = document.querySelector('.myServiceContent.scroll-content').clientHeight;
                var containerHeaderBlock = document.querySelector('.myService .contentHeader').clientHeight;
                var footerBlock = 60;
                if (document.querySelector('.bar-footer') != null) {
                    footerBlock = document.querySelector('.bar-footer').clientHeight;
                }
                var heightBlock = containerBlock-containerHeaderBlock-buttonBlock;
                if (footerBlock < 60) {
                    footerBlock = 60;
                }

                // Set available height of scrollable form container
                var newHeight = 0;
                if (newValue.w >0) {
                    newHeight = heightBlock - (footerBlock + 85);
                }
                if (newHeight < 0) {
                    newHeight = 0;
                }
                //console.log('btns '+buttonBlock+', container '+containerBlock+', hdr '+containerHeaderBlock+', ftr '+footerBlock);
                scope.windowHeight = newHeight;
            }, true);

            w.bind('resize', function () {
                scope.$apply();
            });
        });
    }
})
.directive('appLogo', function(){
    return {
        restrict: 'E',
        templateUrl: 'templates/partials/logo/logo.html',
    };
})
.directive('stringToNumber', function() {/* https://docs.angularjs.org/error/ngModel/numfmt */
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        return '' + value;
      });
      ngModel.$formatters.push(function(value) {
        return parseFloat(value, 10);
      });
    }
  };
})
.directive('handleIonicScroll', function($ionicScrollDelegate){ /* http://forum.ionicframework.com/t/how-to-disable-content-scrolling/238/14 */
    return {
        scope: {isEdit: '@'},
        link:function (scope, el, attrs) {
            angular.element(document).ready(function () {
                var ionicContent = el[0].querySelector('.has-header');
                if(attrs.isEdit == 'true'){
                    if(ionicContent.tagName == "ION-CONTENT") {
                        attrs.$$element[0].children[0].setAttribute('scroll','false');
                        $ionicScrollDelegate.getScrollView().options.scrollingY = false;
                    }
                }
            });
        }
    }
}).directive('gotoUrl', function($rootScope, $location){
    return function (scope, el, attrs) {
        el.bind('click', function(){
            $rootScope.$apply(function() {
                $location.path(attrs.gotoUrl);
            });
        });
    };
}).directive('onError', function() {
    return {
        restrict:'A',
        link: function(scope, element, attr) {
            element.on('error', function() {
                element.attr('src', attr.onError);
                element.attr('class', ''); //to remove padding dot when no src
            });
        }
    };
}).directive('replace', function() {
  return {
    require: 'ngModel',
    scope: {
      regex: '@replace',
      with: '@with'
    }, 
    link: function(scope, element, attrs, model) {
      model.$parsers.push(function(val) {
        if (!val) { return; }
        var regex = new RegExp(scope.regex);
        var replaced = val.replace(regex, scope.with); 
        if (replaced !== val) {
          model.$setViewValue(replaced);
          model.$render();
        }         
        return replaced;         
      });
    }
  };
}).directive('lettersOnly', function() {
  return {
    replace: true,
    template: '<input replace="[^a-zA-Z ]" with="">'
  };
}).directive('format', ['$filter', function ($filter) {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;


            ctrl.$formatters.unshift(function (a) {
                return $filter(attrs.format)(ctrl.$modelValue)
            });


            ctrl.$parsers.unshift(function (viewValue) {
                var plainNumber = viewValue.replace(/[^\d|\-+|\.+]/g, '');
                elem.val($filter(attrs.format)(plainNumber));
                return plainNumber;
            });
        }
    };
}]).directive('capitalizeFirst', function($parse) {
   return {
     require: '?ngModel',
     link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
           if (inputValue === undefined) { inputValue = ''; }
           var capitalized = inputValue.charAt(0).toUpperCase() +
                             inputValue.substring(1);
           if(capitalized !== inputValue) {
              modelCtrl.$setViewValue(capitalized);
              modelCtrl.$render();
            }         
            return capitalized;
         }
         modelCtrl.$parsers.push(capitalize);
         capitalize($parse(attrs.ngModel)(scope)); // capitalize initial value
     }
   };
}).directive('capitalize', function() {
   return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
           if(inputValue == undefined) inputValue = '';
           var capitalized = inputValue.toUpperCase();
           if(capitalized !== inputValue) {
              modelCtrl.$setViewValue(capitalized);
              modelCtrl.$render();
            }         
            return capitalized;
         }
         modelCtrl.$parsers.push(capitalize);
         capitalize(scope[attrs.ngModel]);  // capitalize initial value
     }
   };
}).directive('select', function() {
    return {
        restrict: 'E',
        require: '?ngModel',
        link: function(scope, element, attr, ngModelCtrl) {
            if (ngModelCtrl) {
                ngModelCtrl.$isEmpty = function(value) {
                    return !value || value.length === 0;
                }
            }
        }
    }
})
;