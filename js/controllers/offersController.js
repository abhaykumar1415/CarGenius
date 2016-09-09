/* global angular */
angular.module('CarGenie')
/**
 * Controller to handle offers list.
 * 
 * @param {object} $scope / The controller scope.
 * @param {service} OffersSrv / Offers service to handle API requests.
 * @param {provider} $translate / Translate provider.
 * @param {service} PopupSrv / Service to handle ionic popup.
 * @returns {undefined}
 */
.controller('OffersListCtrl', function($scope, OffersSrv, $translate, PopupSrv) {
    $scope.offers = [];

    if(typeof analytics != 'undefined') { analytics.trackView("My Offers List"); }

    var offerDataPromise = OffersSrv.getOffersList();
    offerDataPromise.then(function(offers){
        if((typeof offers.data == 'undefined' || offers.data == null) || (angular.isUndefined(offers.data.entities) || angular.isDefined(offers.data.entities.items) && 0 == offers.data.entities.items.length)){
            var transProm = $translate(['TITLE_POPUP_OFFERS', 'MESSAGE_POPUP_OFFERS_THERE_ARE_NO_OFFERS_TO_DISPLAY']);
            transProm.then(function(transStrings){
                PopupSrv.showAlert(transStrings.TITLE_POPUP_OFFERS, transStrings.MESSAGE_POPUP_OFFERS_THERE_ARE_NO_OFFERS_TO_DISPLAY);
            });
        } else {
            $scope.offers = offers.data.entities.items;
        }
    });

    $scope.sweepStakePop_up=function(){
        $(".backdrop").addClass("visible active");
        $(".sweepStakePopMainPageOuter").show();
    }
})
/**
 * Controller to handle the single offer view
 * 
 * @param {object} $scope / The controller scope.
 * @param {service} $stateParams / Service to handle url params.
 * @param {service} OffersSrv / Offers service to handle API requests.
 * @returns {undefined}
 */
.controller('OfferCtrl', function($scope, $stateParams, OffersSrv) {
    $scope.offer = {};

    if(typeof analytics != 'undefined') { analytics.trackView("My Offers"); }

    if(typeof $stateParams.offer_id != 'undefined' && $stateParams.offer_id != 'undefined'){
        var offerDataPromise = OffersSrv.getOfferById($stateParams.offer_id);
        offerDataPromise.then(function(offer){
            $scope.offer = offer.data.offer;
            /**
             * Set the image source
             */
            $scope.imageSrc = cgServerUri + offer.data.image_url;
            $scope.gotoOfferLink = function(offerUrl) {
                window.open($scope.offer.url, '_system');
            };
        });
    }
})
/**
 * Controller to handle sponsors
 * 
 * @param {object} $scope / The controller scope.
 * @param {service} OffersSrv / Offers service to handle API requests.
 * @returns {undefined}
 */
.controller('SponsorsCtrl', function($scope, OffersSrv) {
    $scope.sponsors = {};

    if(typeof analytics != 'undefined') { analytics.trackView("Sponsors"); }

    var sponsorsDataPromise = OffersSrv.getSponsorsList();
    sponsorsDataPromise.then(function(sponsors){
        if(sponsors.data != null){
            $scope.sponsors = sponsors.data.entities.items;
        
            /**
             * Set the link and image source
             */
            angular.forEach(sponsors.data.entities.items, function(data, key){
                $scope.sponsors[key].title = data.title;
                $scope.sponsors[key].linkUri = data.url;
                $scope.sponsors[key].imageSrc = cgServerUri + '/sponsor_offer_images/' + data.image_name;
            });
            $scope.serverUri = cgServerUri;
        }
        $scope.gotoSponsorLink = function(url) {
            window.open(url, '_system');
        };
    });
});