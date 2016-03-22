

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var client_id = 'be9a8fc1e71c45edb1cbf4d69759d6d3';
var client_secret ='9b25b58435784d3cb34c048879e77aeb';
var redirect_uri = 'http://localhost:8100/#/app/account'; // Your redirect uri
var scopes_api = 'user-read-private playlist-read-private playlist-modify-private playlist-modify-public Access-Control-Allow-Origin'
var token;
var refreshToken;
var expire;


angular.module('starter', ['ionic', 'starter.controllers','spotify', 'ngCordova','ngCordovaOauth','firebase'])

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
    SpotifyProvider.setScope('user-read-private playlist-read-private playlist-modify-private playlist-modify-public');
    // If you already have an auth token
    SpotifyProvider.setAuthToken(client_secret);
  })
  .factory('authenticationFact',['$http', '$log', '$q', '$window', function($http,$log, $q,$window){
    var authenticationFact = {};
    var url ="https://accounts.spotify.com/authorize?client_id=" + client_id + "&response_type=code&redirect_uri="+
                  encodeURIComponent(redirect_uri) +"&scopes="+encodeURIComponent(scopes_api)


        //window.location = url;

    authenticationFact.login = function () {
      return $window.location = url;
      $log.log($location.absUrl())

    };
    authenticationFact.getToken = function(finalCode){
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: finalCode,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };

      $http.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {

          var access_token = body.access_token,
            refresh_token = body.refresh_token;

          var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
          };
      //$http({
      //  url: 'https://accounts.spotify.com/api/token',
      //  method: "POST",
      //  data: JSON.stringify({grant_type: "authorization_code", code: finalCode, redirect_uri :redirect_uri}),
      //  headers: {'Authorization': btoa(client_id +':'+client_secret)}
      //});
      //$log.log(JSON.stringify({grant_type: "authorization_code", code: finalCode, redirect_uri :redirect_uri}))
      //var data = $.param({
      //  json: JSON.stringify({
      //    grant_type: authorization_code
      //  })
      //});

    }

    authenticationFact.getData = function() {
      var test = $http.get(urlBase + client_id + "&response_type=code&redirect_uri="+
                  encodeURIComponent(redirect_uri) +"&scopes="+encodeURIComponent(scopes_api)).success(function (res) {
        return res;
      });
      $log.log(test);
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

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl',
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
    $urlRouterProvider.otherwise('/app/playlists');
    //$locationProvider.html5Mode(true).hashPrefix('!');
  });
