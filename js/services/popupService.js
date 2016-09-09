/* global angular */
angular.module('CarGenie').service('PopupSrv', function ($ionicPopup, $ionicBackdrop, $location, $injector) {
    /**
     * Alert dialog box.
     * 
     * @param {type} title
     * @param {type} message
     * @returns {undefined}
     */
    this.showAlert = function (title, message) {
        var alertPopup = $ionicPopup.alert({
            title: title,
            template: message,
            buttons: [{
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                }]
        });
        alertPopup.then(function (res) {
            //alert callback;
        });
    };
    
     /**
     * Confirm dialog box.
     * 
     * @param {type} title
     * @param {type} message
     * @returns {undefined}
     */
     // A confirm dialog
    this.showConfirm = function (title, message, service, callback, returnPath) {
        $ionicPopup.confirm({
            title: title,
            template: message,
            buttons: [{
                    text: '<b>Cancel</b>',
                    type: 'button-dark'},
                {
                    text: '<b>OK</b>',
                    type: 'button-assertive',
                    onTap: function (evRes) {
                        if (evRes) {
                            var srv = service.map($injector.get);
                            var fncName = callback.FunctionName;
                            var id = callback.id;
                            var cbRes = srv[0][fncName](id);
                            delete srv;
                            delete fncName;
                            delete id;
                            cbRes.then(function (result) {
                                if (result && result.status != 401) {
                                    var alert = $ionicPopup.alert({
                                        title: result.title,
                                        template: result.message,
                                        buttons: [{
                                                text: '<b>OK</b>',
                                                type: 'button-assertive',
                                            }]
                                    });
                                    alert.then(function(){
                                       if(returnPath){
                                           $location.path(returnPath);
                                       } 
                                    });
                                } else if(result.status == 401){
                                    $location.path(returnPath);
                                }
                            });
                        }
                    }
                }
            ]
        });
        $ionicBackdrop.release();
    };
});