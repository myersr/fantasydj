angular.module('starter.controllers', [])

    .controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout,$log, $ionicLoading, $q, $http, $location,$state, Spotify, authenticationFact) {

      // With the new view caching in Ionic, Controllers are only called
      // when they are recreated or on app start, instead of every page change.
      // To listen for when this page is active (for example, to refresh data),
      // listen for the $ionicView.enter event:

      var currentState;
      $scope.$on('$ionicView.enter', function() {
        // Code you want executed every time view is opened
        currentState = $state.current.data.link;
        var token = localStorage.getItem('spotify-token')
        if(!authenticationFact.isAuthorized()){
          $log.log("inside token length")
          authenticationFact.setToken(token)
        }


      })



      $scope.performLogin = function(){
        authenticationFact.login()
        //https://accounts.spotify.com/authorize
      }

      Spotify.getCurrentUser().then(function (data) {
        console.log(data);
      });

      $scope.menuOptions = [
        {name: 'Search', link:'#/app/search', class: 'item-dark'},
        {name: 'Browse', link: '#/app/browse', class: 'item-dark'},
        {name: 'Account', link: '#/app/account', class: 'item-dark'},
        {name: 'Playlists', link: '#/app/playlists', class: 'item-dark'}];




      $scope.className = function(name){
        var className = 'item-dark';

        if (currentState === name){
          className = 'item-royal';
        }

        return className;
    };

    })

    .controller('PlaylistsCtrl', function($scope, playlistsFact) {
      //$scope.playlists = [
      //  { title: 'Reggae', id: 1 },
      //  { title: 'Chill', id: 2 },
      //  { title: 'Dubstep', id: 3 },
      //  { title: 'Indie', id: 4 },
      //  { title: 'Rap', id: 5 },
      //  { title: 'Cowbell', id: 6 }
      //];
      $scope.isDownloadActive = false;

      $scope.playlist = playlistsFact.getPlaylist();




    })
  .controller('PlaylistCtrl', function($scope, $stateParams, $log, playlistsFact) {
    $scope.isDownloadActive = false;
    $scope.song = playlistsFact.getSong($stateParams.playlistId);
    $log.log($scope.song)
    //$scope.song = $scope.songs[0]





  })

    .controller('login', function($scope, $stateParams, $ionicModal, $timeout,$log, Spotify, $ionicPlatform, $ionicPopup, $ionicLoading, $q){ //$cordovaOauth, ) {

      $scope.performLogin = function(){
        Spotify.login();

      }


      //Called after login to update
      $scope.updateInfo = function() {
        Spotify.getCurrentUser().then(function (data) {
          $scope.getUserPlaylists(data.id);
        }, function(error) {
          $scope.performLogin();
        });
      };

      $ionicPlatform.ready(function() {
      var storedToken = window.localStorage.getItem('spotify-token');
      if (storedToken !== null) {
        Spotify.setAuthToken(storedToken);
        $scope.updateInfo();
      } else {
        $scope.performLogin();
      }
    });


      $scope.createUser = function(newuser){
        console.log(newuser.username)
        Backendless.UserService.register(user, asyncCallback);

      }
    });


//http://10.31.23.184:8100
//$timeout(function() {
//      // $timeout to allow animation to complete
//      $scope.currentSong = Recommendations.queue[0];
////    }, 250);
//function asyncGreet(name) {
//  // perform some asynchronous operation, resolve or reject the promise when appropriate.
//  return $q(function(resolve, reject) {
//    setTimeout(function() {
//      if (okToGreet(name)) {
//        resolve('Hello, ' + name + '!');
//      } else {
//        reject('Greeting ' + name + ' is not allowed.');
//      }
//    }, 1000);
//  });
//}
//
//var promise = asyncGreet('Robin Hood');
//promise.then(function(greeting) {
//  alert('Success: ' + greeting);
//}, function(reason) {
//  alert('Failed: ' + reason);
//});
