

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
var redirect_uri = 'http://localhost:8100/'; // Your redirect uri
var scopes_api = 'user-read-private user-read-email playlist-read-private playlist-modify-private playlist-modify-public playlist-read-collaborative'
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

  /*
  sets the spotify client codes
   */
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


  /*
  Authentication Factory
  Written by Roy Myers
  Performs the various authentication through spotify developers api
  Used promises in the form of $q and http requests
   */
  .factory('authenticationFact',['$http', '$log', '$q', '$window', function($http,$log, $q,$window){
    var authenticationFact = {};
    var url ="https://accounts.spotify.com/authorize?client_id=" + encodeURIComponent(client_id) + "&response_type=token&redirect_uri="+
                  encodeURIComponent(redirect_uri) +"&scope="+encodeURIComponent(scopes_api)//+"&show_dialog=true"
    var data;
    var authorized;

    //function authDataCallback(authData) {
    //  if (authData) {
    //    console.log("User " + authData.uid + " is logged in with " + authData.provider);
    //  } else {
    //    console.log("User is logged out");
    //  }
    //}

    authenticationFact.queryData = function(authToken){
      //var defer = $q.defer();
      return $q(function(resolve, reject) {
        //$log.log("Before Call")
        //$log.log("token: ", authToken)
        $http({
          url: "https://api.spotify.com/v1/me",
          method: "Get",
          headers: {
            'Authorization': 'Bearer ' + authToken
          }
        }).then(function successCallback(res) {
          data = res.data;
          authorized = true;
          //ref.onAuth(authDataCallback)
          //$log.log("data: ",data)
          //$log.log("After Call Success", data)
          resolve("promise resolved in queryData")
          //return data;
          //return defer.promise;
        }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          $log.log("Call Error Authentication: ",response)
          reject("404 error in queryData")
        })
      });

    }
    authenticationFact.setToken = function(tken){
      token =tken
      localStorage.setItem('spotify-token', tken);
    }

    authenticationFact.getToken = function(){
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



  /*
   Author: Roy Myers
   firebaseFact
   */
  .factory('firebaseFact',['$http', '$log', '$q', '$window', 'authenticationFact', function($http,$log, $q,$window, authenticationFact){
    var firebaseFact = [];
    var currentUser;
    var firebaseData = [];

    firebaseFact.isRegistered = function(){
      return $q(function(resolve, reject) {
        var spotData = authenticationFact.getData()
        var fireUsers = new Firebase('https://fantasydj.firebaseio.com/users')
        fireUsers.once("value", function (snapshot) {
          //$log.log("inside Promise", snapshot.child(spotData.id).exists())
          var isRegistered = snapshot.child(spotData.id).exists();
          resolve(isRegistered);
        })//end once promise
      });//end $q
    }


    firebaseFact.registerUser = function(){
      return $q(function(resolve, reject) {
        var spotData = authenticationFact.getData() //.email
        //$log.log(spotData.id)
        var user = new Firebase('https://fantasydj.firebaseio.com/users/' + spotData.id );
        var randUID = Math.floor((Math.random() * 10000000) + 1);//This needs to be updated to check the database for repitions
        user.set({UID: randUID, SUID: spotData.id, email: spotData.email, usrName: spotData.display_name})
        $log.log("New registered User: ",user)
        resolve(user)
      });//end $q
    }

    return firebaseFact;
  }])


// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//                                        Factory for search :: Thomas Brower
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  .factory('searchFact',['$log', '$http','$q', function($log, $http, $q){
    var searchFact = []
    var searchResults = []

    searchFact.areFetched = function(){
      if(searchResults.length != 0){
        return true;
      }else {
        return false;
      }
    }

    searchFact.getSearchResults = function(searchInput){
      return $q(function(resolve, reject) {

        $http({
          url: "https://api.spotify.com/v1/search?q="+ encodeURIComponent(searchInput) + "&type=artist,album,track",
          method: "Get",
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }).then(function successCallback(res) {
          searchResults = res.data
          $log.log("searchfetched", searchResults)
          resolve(searchResults)

        }, function errorCallback(response) {
          $log.log("Call Error Search: ",response)
          reject("400 error in getSearchData")
        })
      });
    }


    searchFact.getInheritResults = function(searchInput, type){
      return $q(function(resolve, reject) {

        $http({
          url: "https://api.spotify.com/v1/search?q="+ encodeURIComponent(searchInput) + "&type=" + type,
          method: "Get",
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }).then(function successCallback(res) {
          searchResults = res.data
          $log.log("searchfetched", searchResults)
          resolve(searchResults)

        }, function errorCallback(response) {
          $log.log("Call Error Search: ",response)
          reject("400 error in getSearchData")
        })
      });
    }

    return searchFact;
  }])



// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Return Factory !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  Written by:  Thomas Brower   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  .factory('spotifyFact',['$log', '$http','$q', function($log, $http, $q){
    var spotifyFact = []
    var searchValue = []

    spotifyFact.areFetched = function(){
      if(searchValue.length != 0){
        //$log.log("true", playlists)
        return true;
      }else {
        return false;
      }
    }

    spotifyFact.getArtistResults = function(searchValue){
      return $q(function(resolve, reject) {

        $http({
          url: "https://api.spotify.com/v1/artists/"+ searchValue + "/top-tracks?country=US",
          method: "Get",
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }).then(function successCallback(res) {
          searchValue = res.data
          $log.log("searchfetched", searchValue)
          resolve(searchValue)

        }, function errorCallback(response) {

          $log.log("Call Error Search: ",response)
          reject("400 error in getArtistResults")
        })
      });
    }


  spotifyFact.getTrackResults = function(searchValue){
    return $q(function(resolve, reject) {

      $http({
        url: "https://api.spotify.com/v1/tracks/"+ searchValue,
        method: "Get",
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }).then(function successCallback(res) {
        searchValue = res.data
        $log.log("searchfetched", searchValue)
        resolve(searchValue)

      }, function errorCallback(response) {

        $log.log("Call Error Search: ",response)
        reject("400 error in getTrackResults")
      })
    });
  }




    spotifyFact.getAlbumResults = function(searchValue){
      return $q(function(resolve, reject) {

        $http({
          url: "https://api.spotify.com/v1/albums/"+ searchValue,
          method: "Get",
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }).then(function successCallback(res) {
          searchValue = res.data
          $log.log("searchfetched", searchValue)
          resolve(searchValue)

        }, function errorCallback(response) {

          $log.log("Call Error Search: ",response)
          reject("400 error in getAlbumResults")
        })
      });
    }


    return spotifyFact;
  }])


// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Add Playlist Factory  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  By: Thomas Brower    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


  .factory('addPlaylist',['$log', '$http','$q', 'authenticationFact', function($log, $http, $q, authenticationFact){
    var playlistsFact = []
    var playlists = []
    var userData = authenticationFact.getData();

    addPlaylist.areFetched = function(){
      if(playlists.length != 0){
        //$log.log("true", playlists)
        return true;
      }else {
        return false;
      }
    }
    addPlaylist.getPlaylists = function(){
      return playlists;
    }

    addPlaylist.getPlaylistsData = function(){
      return $q(function(resolve, reject) {
        //$log.log("Before Call")
        userData = authenticationFact.getData();
        //$log.log("userData: ", userData)
        $http({
          url: "https://api.spotify.com/v1/users/"+ userData.id + "/playlists" ,
          method: "post",
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }).then(function successCallback(res) {
          //$log.log("pre assign", res.data)
          playlists = res.data.items
          $log.log("playlistsfetched",playlists)
          resolve("playlists fetched")

        }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          $log.log("Call Error Playlists: ",response)
          reject(response)
        })
        //return playlists;
        //https://api.spotify.com/v1/users/{user_id}/playlists
      });
    }


    var getLinkbyId = function(playlistId) {
      for (var i = 0; i < playlists.length; i++) {
        if (playlists[i].id == playlistId) {
          return playlists[i].href
        }
      }
    }


    addPlaylist.getPlaylistData = function(playlistId){
      return $q(function(resolve, reject) {
        var playlistLink = getLinkbyId(playlistId)
        $log.log("after For loop: ", playlistLink)
        //var userData = authenticationFact.getData();
        //$log.log("userData: ", userData)
        $http({
          url: playlistLink,//"GET https://api.spotify.com/v1/users/"+ userData.id +"/playlists/"+ playlistId + "/playlists",
          method: "Get",
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }).then(function successCallback(res) {
          //need to create dictionary with keys so that we can loop through quickly possibly
          playlistData = res.data;
          //$log.log("playlist",playlistData)
          resolve(playlistData)

        }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          $log.log("Call Error single Playlist: ",response)
          reject(response)//"Sorry, we have encountered an error grabbing your playlist.")
        })
        //return playlists;
        //https://api.spotify.com/v1/users/{user_id}/playlists
      });
    }
    addPlaylist.getPlaylist = function(playlistId){

    }

    addPlaylist.getSong = function(index){
      return songs[index];
    }

    return playlistsFact;
  }])


// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


  /*
  playlistsFact written by Roy Myer
  Returns the playlists of a user
  get Call
  using $q as promises
   */
  .factory('playlistsFact',['$log', '$http','$q', 'authenticationFact', function($log, $http, $q, authenticationFact){
    var playlistsFact = []
    var playlists = []
    var userData = authenticationFact.getData();

    playlistsFact.areFetched = function(){
      if(playlists.length != 0){
        //$log.log("true", playlists)
        return true;
      }else {
        return false;
      }
    }
    playlistsFact.getPlaylists = function(){
      return playlists;
    }

    playlistsFact.getPlaylistsData = function(){
      return $q(function(resolve, reject) {
        //$log.log("Before Call")
        userData = authenticationFact.getData();
        //$log.log("userData: ", userData)
        $http({
          url: "https://api.spotify.com/v1/users/"+ userData.id + "/playlists",
          method: "Get",
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }).then(function successCallback(res) {
          //$log.log("pre assign", res.data)
          playlists = res.data.items
          $log.log("playlistsfetched",playlists)
          resolve("playlists fetched")

        }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          $log.log("Call Error Playlists: ",response)
          reject(response)
        })
        //return playlists;
        //https://api.spotify.com/v1/users/{user_id}/playlists
      });
    }

    /*
    getLinkbyId function
    Written by Roy Myers
    Loops through an array and returns an item of a list
    that matches the id input.
     */
    var getLinkbyId = function(playlistId) {
      for (var i = 0; i < playlists.length; i++) {
        if (playlists[i].id == playlistId) {
          return playlists[i].href
        }
      }
    }
    /*
   playlistFact written by Roy Myers
   Returns the playlist data of a playlist by playlist id
   get Call
   using $q as promises
    */

    playlistsFact.getPlaylistData = function(playlistId){
      return $q(function(resolve, reject) {
        var playlistLink = getLinkbyId(playlistId)
        $log.log("after For loop: ", playlistLink)
        //var userData = authenticationFact.getData();
        //$log.log("userData: ", userData)
        $http({
          url: playlistLink,//"GET https://api.spotify.com/v1/users/"+ userData.id +"/playlists/"+ playlistId + "/playlists",
          method: "Get",
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }).then(function successCallback(res) {
          //need to create dictionary with keys so that we can loop through quickly possibly
          playlistData = res.data;
          //$log.log("playlist",playlistData)
          resolve(playlistData)

        }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          $log.log("Call Error single Playlist: ",response)
          reject(response)//"Sorry, we have encountered an error grabbing your playlist.")
        })
        //return playlists;
        //https://api.spotify.com/v1/users/{user_id}/playlists
      });
    }
    playlistsFact.getPlaylist = function(playlistId){

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
        url: '/search',
        views: {
          'menuContent': {
            templateUrl: 'templates/search.html',
            controller: 'searchCtrl'

          }
        },
        data:{
          link:'Search'
        }
      })

      .state('app.info', {
        url: '/search/info/:searchValue',
        views:{
        'menuContent':{
          templateUrl: 'templates/cardView.html',
          controller: 'searchCtrl'

        }
      },
      data: {
        link:'Card'
      }
      })

      .state('app.artistCard', {
        url: '/search/artistCard/:searchValue',
        views:{
        'menuContent':{
          templateUrl: 'templates/artistCard.html',
          controller: 'searchCtrl'

        }
      },
      data: {
        link:'ArtistCard'
      }
      })

      .state('app.albumCard', {
        url: '/search/albumCard/:searchValue',
        views:{
        'menuContent':{
          templateUrl: 'templates/albumCard.html',
          controller: 'searchCtrl'

        }
      },
      data: {
        link:'AlbumCard'
      }
      })            


      .state('app.more', {
        url: '/search/more?type=value1&input=value2',
        views:{
        'menuContent':{
          templateUrl: 'templates/moreSearch.html',
          controller: 'searchCtrl'
        }
      },
      data: {
        link:'More'
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
        url: '/browse/myLeagues/:playlistId',
        views: {
          'menuContent': {
            templateUrl: 'templates/myLeagues.html',
            controller: 'PlaylistCtrl'
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
      });
    //$urlRouterProvider.when('/access_token','/app/playlists')
    // if none of the above states are matched, use this as the fallback
    //$urlRouterProvider.otherwise('/app/playlists')//'#/app/playlists');
    //$locationProvider.html5Mode(true);
  });
