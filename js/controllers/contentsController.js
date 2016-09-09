/* global angular */
angular.module('CarGenie')
.controller('ContentsCtrl',function($scope, ContentSrv) {
    
    var contentAboutProm = ContentSrv.getContentById(1);
    var contentPrivacyProm = ContentSrv.getContentById(2);
    var contentTermsProm = ContentSrv.getContentById(3);
    
    contentAboutProm.then(function(about){
        $scope.aboutInfo = about.data.entity;
        contentPrivacyProm.then(function(privacy){
            $scope.privacyInfo = privacy.data.entity;
            contentTermsProm.then(function(terms){      
                $scope.termsInfo = terms.data.entity;
            });
        });
    });
    
});