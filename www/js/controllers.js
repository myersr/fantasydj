angular.module('starter.controllers', [])

    .controller('AppCtrl', function($scope, $ionicModal, $timeout) {

      // With the new view caching in Ionic, Controllers are only called
      // when they are recreated or on app start, instead of every page change.
      // To listen for when this page is active (for example, to refresh data),
      // listen for the $ionicView.enter event:
      //$scope.$on('$ionicView.enter', function(e) {
      //});
      var appId = "85D3AA52-808B-FC81-FF8F-16455B72F700";
      var jsSecretKey = "0EE87A4C-79D9-40CF-FFAF-2D77BE200000";
      var versionNum = "v1";
      Backendless.initApp(appId, jsSecretKey, versionNum);


      $scope.menuOptions = [
        {name: 'Search', link:'search', class: 'item-dark'},
        {name: 'Browse', link: 'browse', class: 'item-dark'},
        {name: 'Playlists', link: 'playlists', class: 'item-dark'}];

      var activeMenu = "Playlists";
      $scope.toggle = function(name){
        activeMenu = name;
      }

      $scope.className = function(name){
        var className = 'item-dark';

        if (activeMenu === name){
          className = 'item-royal';
        }

        return className;
    };



      // Form data for the login modal
      $scope.loginData = {};

      // Create the login modal that we will use later
      $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modal = modal;
      });

      // Triggered in the login modal to close it
      $scope.closeLogin = function() {
        $scope.modal.hide();
      };

      // Open the login modal
      $scope.login = function() {
        $scope.modal.show();
      };

      // Perform the login action when the user submits the login form
      $scope.doLogin = function() {
        console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function() {
          $scope.closeLogin();
        }, 1000);
      };
    })

    .controller('PlaylistsCtrl', function($scope) {
      $scope.playlists = [
        { title: 'Reggae', id: 1 },
        { title: 'Chill', id: 2 },
        { title: 'Dubstep', id: 3 },
        { title: 'Indie', id: 4 },
        { title: 'Rap', id: 5 },
        { title: 'Cowbell', id: 6 }
      ];
      $scope.isDownloadActive = false;




    })

    .controller('login', function($scope, $stateParams) {
      $scope.createUser = function(newuser){
        console.log(newuser.username)
        //Backendless.UserService.register( user, asyncCallback );

      }
    });
