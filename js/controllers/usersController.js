/* global angular */
angular.module('CarGenie')
.controller('usersCtrl', function($scope, $location, $localStorage, $http, UsersService, PopupSrv, jwtHelper, $translate, UtilsSrv) {

    if(typeof analytics != 'undefined') { analytics.trackView("Users"); }

    /**
     * Function to perform the user login.
     * 
     * @param {object} user / The user email and password to perform the login.
     * @returns {undefined}
     */
    $scope.login = function(user, ev) {
        ev.preventDefault();
        UsersService.loginUser(user)
          .then(function(loginResult) {
              if(typeof loginResult.data != 'undefined' && loginResult.data !== false){
                //Set token in localstorage
                $localStorage.userToken = loginResult.data.token;
                //Set user information in local storage.
                $localStorage.user = jwtHelper.decodeToken(loginResult.data.token);
                
                if($localStorage.user.invalidate_cache_cars){
                    UtilsSrv.emptyCarsCache($localStorage);
                }                
                $location.path('/my-service');
                $scope.sendData(localStorage.getItem('registrationId'), $localStorage.user.id);
            }
        },function(data) {
            var transProm = $translate(['LOGIN_FAIL', 'INVALID_EMAIL']);
            transProm.then(function(tranStrings){
                PopupSrv.showAlert(tranStrings.LOGIN_FAIL, tranStrings.INVALID_EMAIL);
                $location.path('/users/login');
            }); 
        });
    };
    
    /**
     * Initiaize push notification plugin.
     */
    $scope.sendData = function(regId, userId){
        //console.log("push notification registration sent" + regId);
        var data = {"registrationId": regId, "userId": userId};
        $http.post(cgApiUri + "/register_gcm", {"data": data}, {
            headers: {"Accept": "application/json"}
        });
    };


})
.controller('forgotPasswordCtrl', function($scope, $location, $localStorage, $http, UsersService, PopupSrv, jwtHelper, $translate, UtilsSrv) {
    //if(typeof analytics !== undefined) { analytics.trackView("User Registration"); }
    //analytics.trackView("User Registration");

    if(typeof analytics != 'undefined') { analytics.trackView("Forgot Password"); }

    /**
     * Send email to the user in order to generate new password.
     *
     * @param {string} email / The user email.
     * @returns {undefined}
     */
    $scope.recoveryPassword = function(email){
        UsersService.sendRecoveryEmail(email).
        then(function(data){
            var transProm = $translate('EMAIL_SENT');
            transProm.then(function(tranStrings){
                PopupSrv.showAlert(tranStrings,data.data.valid_username);
                $location.path('/users/login');
            });
        }, function(){
            var transProm = $translate(['ERROR', 'EMAIL_NOT_SENT']);
            transProm.then(function(tranStrings){
                PopupSrv.showAlert(tranStrings.ERROR, tranStrings.EMAIL_NOT_SENT);
                $location.path('/users/forgot-password');
            });
        });
    };

})
.controller('registerCtrl', function($scope, $location, $localStorage, $http, UsersService, PopupSrv, jwtHelper, $translate, UtilsSrv) {
    //if(typeof analytics !== undefined) { analytics.trackView("User Registration"); }
    //analytics.trackView("User Registration");

    if(typeof analytics != 'undefined') { analytics.trackView("User Registration"); }

    $scope.goToPrivacyLink = function() {
        window.open('http://cargeniusapp.com/privacy/', '_system');
    };

    /**
     * Add new user method, also this action add a listener for push notifications.
     *
     * @param {object} user / The user data.
     * @param {eventHandler} ev
     * @returns {undefined}
     */
    $scope.register = function(user, ev){
        ev.preventDefault();
        //Save data in the API
        if(user.password === user.confirmpassword){
            UsersService.saveUser(user).then(function(data){
                var transProm = $translate(['USER_SAVED', 'REGISTER_COMPLETE']);
                transProm.then(function(tranStrings){
                    PopupSrv.showAlert(tranStrings.USER_SAVED, tranStrings.REGISTER_COMPLETE);
                    $location.path('/users/login');
                });

                $scope.sendData(localStorage.getItem('registrationId'), $localStorage.user.id);

            },function(error){
                var transProm = $translate('USER_NOT_SAVED');
                var template = '';

                if(typeof(error.data.errors.children.email.errors)=== 'object'){
                    template += error.data.errors.children.email.errors + '.';
                }
                if(typeof(error.data.errors.children.name.errors)=== 'object'){
                    template += error.data.errors.children.name.errors + '.';
                }
                if(typeof(error.data.errors.children.lastname.errors)=== 'object'){
                    template += error.data.errors.children.lastname.errors + '.';
                }

                transProm.then(function(tranStrings){
                    PopupSrv.showAlert(tranStrings,template);
                    $location.path('/users/registration');
                });
            });
        } else {
            var transProm = $translate(['INCORRECT_PASSWORD', 'PASSWORDS_MUST_MATCH']);
            transProm.then(function(tranStrings){
                PopupSrv.showAlert(tranStrings.INCORRECT_PASSWORD, tranStrings.PASSWORDS_MUST_MATCH);
                $location.path('/users/registration');
            });
            return;
        }
    };
});
