

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
/*
 Roy Myers
 All the various static id's
 Will be moved and hidden in development
 */
var client_id = 'be9a8fc1e71c45edb1cbf4d69759d6d3';
var client_secret ='9b25b58435784d3cb34c048879e77aeb';
var redirect_uri;// = 'http://localhost:8100/'; // Your redirect uri
var scopes_api = 'user-read-private user-read-email playlist-read-private playlist-modify-private playlist-modify-public playlist-read-collaborative'
var ref = new Firebase("https://fantasydj.firebaseio.com")
var firebase_secret = 'NQcYGN8O7OUtovRdkjMgt5t75Sj8vMnkGMtKNj3C'
var token;
var set = false;


angular.module('starter', ['ionic', 'starter.services', 'starter.controllers','ngCordova','spotify','ngCordovaOauth','firebase'])

  /*
  Run configs
   */
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

  /*
  Author: Roy Myers
  sets redirect_uri depending upon device
   sets the spotify client codes
   */
  .config(function (SpotifyProvider) {
    SpotifyProvider.setClientId(client_id);
    if(ionic.Platform.platform() === 'android'){
      redirect_uri = 'http://localhost/callback';
    }else{
      redirect_uri = 'http://localhost:8100/';
    }
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



  .config(function($stateProvider, $urlRouterProvider,$locationProvider) {
    $stateProvider
      .state('test',{
        url:'/',
        templateUrl: 'index.html',
        controller: 'indexController'
      })

      .state('confirmation',{
        url:'/confirm',
        templateUrl:'templates/confirmAccount.html',
        controller: 'confirmationCtrl',
        onEnter: function($state, $log, authenticationFact){
          if(!authenticationFact.isAuthorized()){
            $state.go("login")
          }
        }

      })

      .state('login', {
        url: '/login',
        templateUrl: 'templates/loginPage.html',
        controller: 'loginCtrl',
        data:{
          link:'Login'
        }
      })


      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl',
        onEnter: function($state, $log, authenticationFact, $ionicLoading,playlistsFact){
          if(!authenticationFact.isAuthorized()){
            $state.go("login")
          }
        },

        data:{
          link:'App'
        }
      })

      .state('app.account', {
        url: '/account',
        views: {
          'menuContent': {
            templateUrl: 'templates/account.html',
            controller: 'AccountCtrl'
          }
        },
        data:{
          link:'Account'
        }
      })
      .state('app.search', {
        url: '/:PID/search',
        views: {
          'menuContent': {
            templateUrl: 'templates/search.html',
            controller: 'searchCtrl'

          }
        },
        data:{
          link:'Playlists'
        }
      })

      .state('app.info', {
        url: '/:PID/search/info/:searchValue',
        views:{
          'menuContent':{
            templateUrl: 'templates/cardView.html',
            controller: 'searchCtrl'

          }
        },
        data: {
          link:'Playlist'
        }
      })

      .state('app.artistCard', {
        url: '/:PID/search/artistCard/:searchValue',
        views:{
          'menuContent':{
            templateUrl: 'templates/artistCard.html',
            controller: 'searchCtrl'

          }
        },
        data: {
          link:'Playlist'
        }
      })

      .state('app.albumCard', {
        url: '/:PID/search/albumCard/:searchValue',
        views:{
          'menuContent':{
            templateUrl: 'templates/albumCard.html',
            controller: 'searchCtrl'

          }
        },
        data: {
          link:'Playlist'
        }
      })


      .state('app.more', {
        url: '/:PID/search/more?type=value1&input=value2',
        views:{
          'menuContent':{
            templateUrl: 'templates/moreSearch.html',
            controller: 'searchCtrl'
          }
        },
        data: {
          link:'Playlist'
        }
      })


      .state('app.browse', {
        url: '/browse',
        views: {
          'menuContent': {
            templateUrl: 'templates/browse.html',
            controller: 'leagueCtrl'
          }
        },
        data:{
          link:'Leader Boards'
        }
      })
      /*
       Author: Roy Myers
       join league controller
       */
      .state('app.join', {
        url:'/league/join',
        views:{
          'menuContent': {
            templateURl: 'templates/joinLeague.html',
            controller: 'joinCtrl'
          }
        }

      })

      .state('app.playlists', {
        url: '/playlists',
        //onEnter: function($state, $log, authenticationFact){
        //  $log.log("hitting playlists", $state.current)
        //
        //},
        views: {
          'menuContent': {
            templateUrl: 'templates/playlists.html',
            controller: 'PlaylistsCtrl',
          }
        },
        data:{
          link:'Playlists'
        }
      })


      .state('app.myLeagues', {
        url: '/myLeagues',
        views: {
          'menuContent': {
            templateUrl: 'templates/myLeagues.html',
            controller: 'leagueCtrl'
          }
        },
        data: {
          link: 'myLeagues'
        }
      })

      .state('app.newLeague', {
        url: '/Leagues',
        views: {
          'menuContent': {
            templateUrl: 'templates/newLeague.html',
            controller: 'leagueCtrl'
          }
        },
        data: {
          link: 'myLeagues'
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
      })

      .state('app.bracket', {
        url: '/leagues/:compId',
        views: {
          'menuContent': {
            templateUrl: 'templates/bracket.html',
            controller: 'BracketCtrl'
          }
        },
        data: {
          link: 'Leagues'
        }
      })
      .state('app.leagues', {
        url: '/leagues',
        views: {
          'menuContent': {
            templateUrl: 'templates/leagues.html',
            controller: 'LeaguesCtrl'
          }
        },
        data: {
          link: 'Leagues'
        }
      });
    //$urlRouterProvider.when('/access_token','/app/playlists')
    // if none of the above states are matched, use this as the fallback
    //$urlRouterProvider.otherwise('/app/playlists')//'#/app/playlists');
    //$locationProvider.html5Mode(true);
  });
