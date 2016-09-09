/* global angular */
angular.module('CarGenie')
.service('UsersService', ['$http', '$q', '$ionicLoading', function($http, $q, $ionicLoading) {
    /**
     * Function to create or update user through the API.
     * If the id of the user is passed to the function,
     * an existent user will be updated.
     * 
     * @param {int} id
     * 
     * @returns {$q@call;defer.promise}
     */
    this.saveUser = function(userData){
        $ionicLoading.show({
            template: "Saving.. Please wait.."
        });
        var request = {
            method: 'POST',
            url: cgApiUri + '/register',
            data: {fos_user_registration_form: 
                    {email: userData.email,
                   plainPassword: {
                       first: userData.password,
                       second: userData.confirmpassword
                   },
                   name: userData.firstname,
                   lastname: userData.lastname,
                }},
            headers: {'Content-Type': 'application/json'},
        };
        return $http(request).then(function(data){
            $ionicLoading.hide();
            if(data.status === 201){
                return data;
            } else {
                return $q.reject(data);
            }
        },
        function(data){
            $ionicLoading.hide();
            return $q.reject(data);
        });
    };
    
    /**
     * Function to perform the login through API
     * 
     * @param {type} user
     * 
     * @returns {$q@call;defer.promise}
     */
    this.loginUser = function(user){
        $ionicLoading.show({
            template: 'Logging in.. please wait..'
        });
        var request = {
            method: 'POST',
            url: cgApiUri + '/login_check',
            data: {_username: user.email, _password: user.password}, 
            headers: {"Accept": "application/json"}
        };
        return $http(request).then(function(data){//success
            $ionicLoading.hide();
             if(data.code !== 401){
                return data;
            } else {
                return $q.reject(data);
            }
        },
        function(data){//error
            $ionicLoading.hide();
            return $q.reject(data);
        });
    };    
    
    /**
     * Function to recover password through API.
     * 
     * @param {string} email / 
     * 
     * @returns {$q@call;defer.promise}
     */
    this.sendRecoveryEmail= function(user){
        $ionicLoading.show({
            template: 'Processing.. please wait..'
        });
        var request = {
            method: 'POST',
            url: cgApiUri + '/reset-password-request' ,
            data: {username: user},
            headers: {'Content-Type': 'application/json'}
        }; 
        return $http(request).then(function(data){//success
            $ionicLoading.hide();
             if(data.status === 200){
                return data;
            } else if(data.status === 400){
                return $q.reject(data);
            }
        },
        function(data){//error
            $ionicLoading.hide();
            return $q.reject(data);
        });
    };
}]);


