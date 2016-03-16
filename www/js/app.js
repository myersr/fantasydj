

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var client_id = 'be9a8fc1e71c45edb1cbf4d69759d6d3';
var client_secret ='9b25b58435784d3cb34c048879e77aeb';
var redirect_uri = 'http://localhost:8100/#/app/account'; // Your redirect uri
var scopes_api = 'user-read-private playlist-read-private playlist-modify-private playlist-modify-public Access-Control-Allow-Origin'


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
  .factory('authenticationFact',['$http', '$log', '$q', function($http,$log, $q){
    var authenticationFact = {};
    var url ="https://accounts.spotify.com/authorize?client_id=" + client_id + "&response_type=code&redirect_uri="+
                  encodeURIComponent(redirect_uri) +"&scopes="+encodeURIComponent(scopes_api)

        //window.location = url;

    authenticationFact.login = function () {
      return window.location = url;
      $log.log($location.absUrl())

    };

    authenticationFact.getData = function() {
      var test = $http.get(urlBase + client_id + "&response_type=code&redirect_uri="+
                  encodeURIComponent(redirect_uri) +"&scopes="+encodeURIComponent(scopes_api)).success(function (res) {
        return res;
      });
      $log.log(test);
    }
      return authenticationFact;
  }])

  .config(function($stateProvider, $urlRouterProvider) {
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

      .state('app.single', {
        url: '/playlists/:playlistId',
        views: {
          'menuContent': {
            templateUrl: 'templates/playlist.html',
            controller: 'PlaylistCtrl'
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/playlists');
  });
