var myApp = angular.module('myApp', []); // Taking Angular Application in Javascript Variable

//use parent controller to cooperate event(s) between sub controllers
myApp.controller("parentCtrl",
function ($scope) {
    $scope.$on("LoginCtrlChanged", 
    function (event, msg) {
        console.log("parent", msg);
        $scope.$broadcast("LoginCtrlChangedFromParrent", msg);
    });
})

myApp.controller('LoginCtrl', ['$scope', '$http', function ($scope, $http){
    $scope.loggedin = false;
    
    $scope.login = function() {
    // Preparing the login Data from the Angular Model to send to the Server. 
        var formData = {
          'username' : $scope.username,
          'pwd' : $scope.pwd
        };
        //alert($scope.email);

        $http({
            method: 'POST',
            url: '/login',
            data:  formData
          })
          .success(function (data, status, headers, config) {
            $scope.currentuser=data.currentuser;
            $scope.status = data.message;
          })
          .error(function (data, status, headers, config) {
          });
          if ($scope.currentuser){
            $scope.loggedin=false;
            document.getElementById('UserListCtrl').style.display = 'none';
          }else{
            $scope.loggedin=true;
            document.getElementById('UserListCtrl').style.display = 'block';
          };
          //tell parent controller something happened
          $scope.$emit("LoginCtrlChanged", $scope.loggedin);
    };
    //user logout
    $scope.logout = function() {
        $http({
            method: 'GET',
            url: '/logout'
            })
        $scope.loggedin=false;
        $scope.username='';
        $scope.pwd='';
        $scope.loggedin=false;
        document.getElementById('UserListCtrl').style.display = 'none';
    };
    
}]);

//user management part
myApp.controller('UserListCtrl', ['$scope','$http', function ($scope, $http) {
  
    $scope.loggedin1=false;
	//listen to parent event that logged in or out
    $scope.$on("LoginCtrlChangedFromParrent",
      function (event, msg) {
          console.log("UserListCtrl", msg);
          $scope.loggedin1 = msg;
      });
      
    // get user list
    $scope.list = function() {$http({
          method: 'GET',
          url: '/listusers'
        })
        .success(function (data, status, headers, config) {
          $scope.users = data;
        })
        .error(function (data, status, headers, config) {
          // something went wrong :(
        });
    };
    $scope.list();
    
    $scope.userfilter = "";
  
    //add user via post
    $scope.save = function() {
    // Preparing the Json Data from the Angular Model to send to the Server. 
        var formData = {
          'username' : $scope.username,
          'pwd' : $scope.pwd,
    	  'confirmpwd':$scope.confirmpwd,
    	  'email' : $scope.email
        };
        //alert($scope.email);

        $http({
            method: 'POST',
            url: '/newuser',
            data:  formData
          })
          .success(function (data, status, headers, config) {
            $scope.list();
            $scope.status = data.message;
          })
          .error(function (data, status, headers, config) {
          });
          
    };
    
    //delete user
    $scope.deleteUser = function(index){
        if(!confirm('Do you want to delete?')){return};
        $http({
            method: 'get',
            url: '/deleteuser/'+$scope.users[index]._id
          })
          .success(function (data, status, headers, config) {
            $scope.list();
            $scope.status = data.message;
          })
          .error(function (data, status, headers, config) {
            $scope.status = data.message;
          });
    };

  
}]);
