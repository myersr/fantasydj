

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var client_id = 'be9a8fc1e71c45edb1cbf4d69759d6d3';
var client_secret ='9b25b58435784d3cb34c048879e77aeb';
var redirect_uri = 'http://localhost:8100/#/app/account#'; // Your redirect uri
var scopes_api = 'user-read-private playlist-read-private playlist-modify-private playlist-modify-public Access-Control-Allow-Origin'
var ref = new Firebase("https://fantasydj.firebaseio.com")
var firebase_secret = 'NQcYGN8O7OUtovRdkjMgt5t75Sj8vMnkGMtKNj3C'
var token;
var set = false;


angular.module('starter', ['ionic', 'starter.controllers','ngCordova','spotify','ngCordovaOauth','firebase'])

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })

  .config(function (SpotifyProvider) {
    SpotifyProvider.setClientId(client_id);
    SpotifyProvider.setRedirectUri(redirect_uri);
    SpotifyProvider.setScope(scopes_api);

    // If you already have an auth token
    //SpotifyProvider.setAuthToken(client_secret);
  })
  //['spotifyProvider', function (spotifyProvider) {
  //  spotifyProvider.setConfig({
  //    clientId: client_id,
  //    responseType: 'token',
  //    redirectUri: redirect_uri,
  //    state: true,
  //    scope: scopes_api,
  //    showDialog: false
  //  })
  //}])
  .factory('authenticationFact',['$http', '$log', '$q', '$window', function($http,$log, $q,$window){
    var authenticationFact = {};
    var url ="https://accounts.spotify.com/authorize?client_id=" + encodeURIComponent(client_id) + "&response_type=token&redirect_uri="+
                  encodeURIComponent(redirect_uri) +"&scopes="+encodeURIComponent(scopes_api)
    var data;
    var authorized;

    function authDataCallback(authData) {
      if (authData) {
        console.log("User " + authData.uid + " is logged in with " + authData.provider);
      } else {
        console.log("User is logged out");
      }
    }

    authenticationFact.setToken = function(authToken){
      $http({
        url: "https://api.spotify.com/v1/me",
        method: "Get",
        headers: {
                    'Authorization': 'Bearer ' + authToken
                  }
      }).then(function (res){
        data = res.data;
        authorized = true;
        ref.onAuth(authDataCallback)
        $log.log(data)

      })
    }
    authenticationFact.getToken = function(){
      var token = localStorage.getItem('spotify-token');
      return token;
    }
    authenticationFact.hasToken = function(){
      var token = authenticationFact.getToken();
      if(token === 'undefined')
      {
        return false;
      }else {
        return true;
      }
    }

    authenticationFact.isAuthorized = function (){
      if(authorized === true){
        return true;
      }else {
        return false;
      }
    }

    authenticationFact.login = function () {
      return $window.location = url;
      $log.log($location.absUrl())

    };


    authenticationFact.getData = function() {
      return data;
    }

    authenticationFact.spotifyLogin = function(){
       return Spotify.login();
    }
      return authenticationFact;
  }])







  .factory('playlistsFact',['$log', function($log){
    var playlistsFact = []
    var songs = [
        {
          "id": 0,
          "title":"Stealing Cinderella",
          "artist":"Chuck Wicks",
          "image_small":"https://i.scdn.co/image/d1f58701179fe768cff26a77a46c56f291343d68",
          "image_large":"https://i.scdn.co/image/9ce5ea93acd3048312978d1eb5f6d297ff93375d"
        },
        {
          "id": 1,
          "title":"Venom - Original Mix",
          "artist":"Ziggy",
          "image_small":"https://i.scdn.co/image/1a4ba26961c4606c316e10d5d3d20b736e3e7d27",
          "image_large":"https://i.scdn.co/image/91a396948e8fc2cf170c781c93dd08b866812f3a"
        },
        {
          "id": 2,
          "title":"Do It",
          "artist":"Rootkit",
          "image_small":"https://i.scdn.co/image/398df9a33a6019c0e95e3be05fbaf19be0e91138",
          "image_large":"https://i.scdn.co/image/4e47ee3f6214fabbbed2092a21e62ee2a830058a"
        }
        ]
    playlistsFact.getPlaylist = function(){
      return songs;
    }
    playlistsFact.getSong = function(index){
      return songs[index];
    }

    return playlistsFact;
  }])

  .config(function($stateProvider, $urlRouterProvider,$locationProvider) {
    $stateProvider
      .state('test',{
        url:'/',
        templateUrl: 'index.html',
        controller: 'AppCtrl'
      })

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl',
        onEnter: function($state, $log, authenticationFact){
          if(!authenticationFact.hasToken()){
            $state.go('login')
          }
        },
        data:{
          link:'App'
        }
      })

      .state('login', {
        url: '/login',
        templateUrl: 'templates/loginPage.html',
        controller: 'login',
        data:{
          link:'Login'
        }
      })

      .state('app.account', {
        url: '/account?code&error',
        views: {
          'menuContent': {
            templateUrl: 'templates/account.html'
          }
        },
        data:{
          link:'Account'
        }
      })
      .state('app.search', {
        url: '/search',
        views: {
          'menuContent': {
            templateUrl: 'templates/search.html'
          }
        },
        data:{
          link:'Search'
        }
      })

      .state('app.browse', {
        url: '/browse',
        views: {
          'menuContent': {
            templateUrl: 'templates/browse.html'
          }
        },
        data:{
          link:'Browse'
        }
      })
      .state('app.playlists', {
        url: '/playlists',
        views: {
          'menuContent': {
            templateUrl: 'templates/playlists.html',
            controller: 'PlaylistsCtrl'
          }
        },
        data:{
          link:'Playlists'
        }
      })

      .state('app.playlist', {
        url: '/playlist/:playlistId',
        views: {
          'menuContent': {
            templateUrl: 'templates/playlist.html',
            controller: 'PlaylistCtrl'
          }
        },
        data: {
          link: 'Playlists'
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('#/app/playlists');
    //$locationProvider.html5Mode(true);
  });
