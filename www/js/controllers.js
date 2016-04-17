angular.module('starter.controllers', [])

/*
   Author: Roy Myers
   indexController
   indexController -
   The index app/ is the callback uri from spotify. on that page we parse the auth token and store all the user data.
   If the user is in our database, we continue to playlists, if now we go to confirmation.
   */
  .controller('indexController', function($scope, $log, $q, $state, $ionicLoading, authenticationFact, firebaseFact){
    //$log.log(window.location.origin)
    $scope.showLoading = function() {
      $ionicLoading.show({
        template: '<i class="ion-loading-c">Fetching User Account</i>',
        noBackdrop: false
      });
    }

    $scope.hideLoading = function() {
      $ionicLoading.hide();
    }
    $scope.load = function () {
      //alert(window.location.hash);

      window.onload = function () {
        var hash = window.location.hash;
        hash = hash.toString();
        //$log.log("hash",hash)
        if(!hash){
          $state.go('app.playlists')
        }else if (hash.includes("access_token")) {
          $scope.showLoading();
          var isUser;
          // login success
          //$log.log("Login Success")
          var token = window.location.hash.split('&')[0].split('=')[1];
          authenticationFact.setToken(token)
          //localStorage.setItem('spotify-token', token);
          if(!authenticationFact.isAuthorized()){
            var tken = authenticationFact.getToken()
            var promise = authenticationFact.queryData(token);
            promise.then(function(response){
              $log.log(response)
              //initialize promise
              var userData = authenticationFact.getData();
              var userID = userData.id;
              var promiseReg = firebaseFact.isRegistered();
              //finishing the promise
              promiseReg.then(function(response){
                $log.log("inside isRegistered promise: ", response)
                isUser = response;
                if(isUser) {
                  $scope.hideLoading();
                  $state.go("app.playlists", {SPID: userID})
                } else{ //if not a registered user, send to registry page.
                  $scope.hideLoading();
                  $state.go("confirmation")
                }

              })

              //if already a user take to playlists


              //var promise2 = playlistsFact.getPlaylists();
              //promise2.then(function(response){
              //  $log.log(response)
              //  $state.go("app.playlists", {}, { reload: true })
              //})
              //window.location.assign("http://localhost:8100/#/app/playlists")
            })

          }
          //$log.log("redirecting")

        }else if (hash.includes('error')){// && !hash.includes('/login')) {
          $log.log("failing in first if")
          // login failure
          window.location.assign("http://localhost:8100/#/login");
        }
        //$state.go("app.playlists");
      }
    }
  })

  /*
   Author: Roy Myers
   loginCtrl
   loginCtrl -
   returns the url for spotify authentication
   */
  .controller('loginCtrl', function($scope, $cordovaOauth, $stateParams, $log, $ionicPlatform, $ionicPopup, authenticationFact){

    $scope.platform = ionic.Platform.platform();
    $scope.printURI = function(){
      var ure = window.location.origin;
      $ionicPopup.alert({
        title: 'uri',
        content:ure.toString()
      })
    }

    $scope.performLogin = function(){
      authenticationFact.login()
      //https://accounts.spotify.com/authorize
    }
  })



  /*
   Author: Roy Myers
   confirmationCtrl
   confirmationCtrl -
   If a user logs in for the first time we confirm the details and add them to our database.
   */
  .controller('confirmationCtrl', function($scope,$log,$state, $ionicLoading, authenticationFact, firebaseFact) {
    $scope.platform = ionic.Platform.platform();
    showLoading = function() {
      $ionicLoading.show({
        template: '<i class="ion-loading-c"> Registering User </i>',
        noBackdrop: false
      });
    }

    hideLoading = function() {
      $ionicLoading.hide();
    }
    $scope.load = function () {
      if (authenticationFact.isAuthorized()) {
        //var defer = $q.defer();
        $log.log("ACCOUNT CALL")
        //var tken = authenticationFact.getToken()
        //authenticationFact.queryData(tken)
        $scope.accountInfo = authenticationFact.getData();
        console.log("accountInfo:", $scope.accountInfo);
      } else{
        $state.go("login");
      }
    }
    $scope.confirm = function(){
      showLoading();
      var regPromise = firebaseFact.registerUser()
      regPromise.then(function(response){
        $log.log("Registered User")
        hideLoading();
        $state.go("app.playlists", {SPID:$scope.accountInfo.id})
      })
    }
    $scope.deny = function(){
      authenticationFact.clearData();
      $state.go('login')
    }


  })


  /*
   Author: Roy Myers
   AppCtrl
   PlaylistCtrl -
   grabs and lists all songs in a playlist
   */
  .controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout,$log, $ionicLoading, $q, $http, $location,$state, authenticationFact) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    $scope.showLoading = function() {
      $ionicLoading.show({
        template: '<i class="ion-loading-c"></i>',
        noBackdrop: true
      });
    }
    $scope.hideLoading = function() {
      $ionicLoading.hide();
    }

    var currentState = 'Playlists';// = $state.current.data.link;;
    //$log.log("current State: ",currentState);
    //$log.log("controller Data log: ", authenticationFact.getData())
    //event.preventDefault(); //This will cancel the transition
    // transitionTo() promise will be rejected with
    // a 'transition prevented' error
    //$rootScope.$on('$stateChangeSuccess',
    $rootScope.$on('$stateChangeSuccess',
      function(event, toState, toParams, fromState, fromParams, options){
        currentState = toState.data['link'];

      })



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

  /*
  Author: Roy Myers
  findPlaylists
  PlaylistsCtrl -
  grabs and lists all playlists for a spotify user
   */
  .controller('PlaylistsCtrl', function($scope, $state, $log, $ionicLoading, $ionicPopup, $stateParams, playlistsFact) {
    showLoading = function() {
      $ionicLoading.show({
        template: '<i class="ion-loading-c"> Loading Playlists </i>',
        noBackdrop: false
      });
    }

    hideLoading = function() {
      $ionicLoading.hide();
    }
    $scope.playlists;// = playlistsFact.getPlaylistsData();
    $scope.SPID = $stateParams.SPID;

    $scope.load =  function() {
      showLoading();
      //$log.log("yo", playlistsFact.areFetched())
      if (!playlistsFact.areFetched()) {
        var playlistPromise = playlistsFact.getPlaylistsData();
        playlistPromise.then(function (response) {
          //$log.log("Promise resolved: ", response)
          $scope.playlists = playlistsFact.getPlaylists();
          //$log.log("playlists after call: ", $scope.playlists)
          //$log.log("Playlists List: ", $scope.playlists[0].name);
          hideLoading();
          //$state.go("app.playlists", {}, {reload: true})
        }, function(reason) {
          $ionicPopup.alert({
            title: 'reason',
            content: reason
          })
          //console.log( "error message - " + err.message );
          //console.log( "error code - " + err.statusCode );
        })
      } else {
        hideLoading();
        $state.go("login")
      }
    }

    $scope.choosePlaylist = function(playlistId){
      $log.log(playlistId);
    }

  })


  /*
   Author: Roy Myers
   findPlaylist
   PlaylistCtrl -
   grabs and lists all songs in a playlist
   */

  .controller('PlaylistCtrl', function($scope, $stateParams, $log,$ionicLoading, $state, $ionicPopup, playlistsFact) {
    $scope.audio = new Audio();
    $scope.playlistId = $stateParams.PID

    showLoading = function() {
      $ionicLoading.show({
        template: '<i class="ion-loading-c"> Grabbing Playlist </i>',
        noBackdrop: false
      });
    }

    $scope.goTo = function(playlistId)
    {
      $state.go('app.search', {PID:playlistId})
      $log.log("Playlist Pass-from-playlist-window ID: " + playlistId)
    }

    hideLoading = function() {
      $ionicLoading.hide();
    }
    $scope.playlist;

    // $scope.playTrack = function(trackInfo) {
    //   $scope.audio.src = trackInfo.track.preview_url;
    //   $scope.audio.play();
    // };
   $scope.play = function(trackInfo) {
      $scope.audio.src = trackInfo.track.preview_url;

      if ($scope.audio.src) {
        $scope.audio.play();
      }
    }

  $scope.stop = function() {
    if ($scope.audio.src) {
      $scope.audio.pause();
    }
  }

    $scope.load = function(){
      showLoading();
      var playlistPromise = playlistsFact.getPlaylistData($stateParams.playlistId, $stateParams.SPID);
      playlistPromise.then(function (response) {
        $log.log("Response i controller: ",response)
        $scope.playlist = response;
        //$log.log(response.tracks.items[0].track.album.images[2].url);
        hideLoading();
        //$log.log("Promise resolved: ", response)
        //$scope.playlists = playlistsFact.getPlaylist($stateParams.playlistId);
        //$log.log("playlists after call: ", $scope.playlists)
        //$log.log("Playlists List: ", $scope.playlists[0].name);
        //hideLoading();
        //$state.go("app.playlists", {}, {reload: true})
      }, function(reason) {
        hideLoading();
        $ionicPopup.alert({
          title: 'reason',
          content: reason
        })
        //console.log( "error message - " + err.message );
        //console.log( "error code - " + err.statusCode );
      })
    }

  })

  /*
   Author: Daniel Harper
   findPlaylist
   AccountCtrl -
   grabs and lists all songs in a playlist
   */
  .controller('AccountCtrl', function($scope,$log, authenticationFact) {
    if(authenticationFact.isAuthorized())
    {
      //var defer = $q.defer();
      $log.log("ACCOUNT CALL")
      //var tken = authenticationFact.getToken()
      //authenticationFact.queryData(tken)
      $scope.accountInfo = authenticationFact.getData();
      console.log("accountInfo:",$scope.accountInfo);
    }


  })



  .controller('joinCtrl', function ($scope, $log, $ionicLoading, spotifyFact, firebaseFact) {
    showLoading = function() {
      $ionicLoading.show({
        template: '<i class="ion-loading-c"> Loading open Leagues </i>',
        noBackdrop: false
      });
    }

    hideLoading = function() {
      $ionicLoading.hide();
    }

    $log.log("hitting Ctrl")
    $scope.leagues;

    $scope.load = function(){
      showLoading();
      $log.log("hitting load")
      var leaugePromise = firebaseFact.getLeagues();
      leaugePromise.then(function(response){
        $log.log(response)
        $scope.leagues = response;
        hideLoading();
      })
    }



  })



  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//                                                      Search Ctrl
//                                                Written by: Thomas Brower
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  .controller('searchCtrl', function($scope, $log, $stateParams, $ionicLoading, $ionicPlatform, $q, $state, searchFact, spotifyFact){
    $scope.platform = ionic.Platform.platform();

    $scope.isArtist = false;
    $scope.isTrack = false;
    $scope.isAlbum = false;
    $scope.track = "track";
    $scope.album = "album";
    $scope.artist = "artist";

    $scope.audio = new Audio();

    // $scope.playTrack = function(trackInfo) {
    //   $log.log("bruh: ", trackInfo);
    //   $scope.audio.src = trackInfo.preview_url;
    //   $scope.audio.play();
    // }

  $scope.openSpotify = function(link) {
    window.open(link, '_blank', 'location=yes');
  }

   $scope.play = function(trackInfo) {
      $scope.audio.src = trackInfo.preview_url;

      if ($scope.audio.src) {
        $scope.audio.play();
      }
    }

   $scope.stop = function() {
    if ($scope.audio.src) {
      $scope.audio.pause();
    }
  }

    $scope.go = function(input, type)
    {
      $state.go('app.more', {type: type, input: input})

    }

    $scope.artistload = function(){
      //artist promise
      var artistPromise = spotifyFact.getArtistResults($stateParams.searchValue)
      artistPromise.then(function(response){
        $scope.item = response;
        $log.log($scope.item);
      })

    }


    $scope.trackload = function(){
      //track promise
      var trackPromise = spotifyFact.getTrackResults($stateParams.searchValue)
      trackPromise.then(function(response){
        $scope.item = response;
        $log.log($scope.item);
      })

    }

    $scope.albumload = function(){
      //album promise
      var albumPromise = spotifyFact.getAlbumResults($stateParams.searchValue)
      albumPromise.then(function(response){
        $scope.item = response;
        $log.log($scope.item);
      })

    }

    $scope.inheritload = function(){
      $scope.showLoading();
      $log.log("type: ", $stateParams.type);
      var promise = searchFact.getInheritResults($stateParams.input, $stateParams.type);
      promise.then(function(response){
        $log.log(response);
        $scope.returnData = response;
        $log.log($scope.returnData);

        if($stateParams.type === "artist")
        {
          $scope.isArtist = true;
        }

        if($stateParams.type === "track")
        {
          $scope.isTrack = true;
        }

        if($stateParams.type === "album")
        {
          $scope.isAlbum = true;
        }

        $log.log($scope.isArtist, $scope.isTrack, $scope.isAlbum);
        $scope.hideLoading();
        })
   }

    $scope.performSearch = function(searchInput){
    // assign somehting to be displayed (promise)
    // use ionic loading to wait while its being assigned
      $scope.showLoading();

      var promise = searchFact.getSearchResults(searchInput);
      promise.then(function(response){
        $log.log(response)
        $scope.returnDataArtists = response.artists.items;
        if($scope.returnDataArtists.length > 0)
        {
          $scope.isArtist = true;
        }

        $scope.returnDataTracks = response.tracks.items;
        if($scope.returnDataTracks.length > 0)
        {
          $scope.isTrack = true;

        }
        $log.log($scope.returnDataTracks);

        $scope.returnDataAlbum = response.albums.items;
        if($scope.returnDataAlbum.length > 0)
        {
          $scope.isAlbum = true;
          //$log.log($scope.returnDataAlbum);
        }

        $scope.hideLoading();
        //window.location.reload();
        })
   }


   $scope.inheritSearch = function(newsearch){
    // assign somehting to be displayed (promise)
    // use ionic loading to wait while its being assigned
      $scope.showLoading();
      $log.log("type: ", $stateParams.type);
      var promise = searchFact.getInheritResults(newsearch, $stateParams.type);
      promise.then(function(response){
        $log.log(response);
        $scope.returnData = response;
        $log.log($scope.returnData);


        $scope.hideLoading();
        })
   }

})

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!    League Controller     !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!    By: Thomas Brower     !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!



.controller('leagueCtrl', function($scope, $log, $stateParams, $ionicLoading, $ionicPlatform, $q, $state, $ionicPopup, searchFact, addFact, authenticationFact, firebaseFact) {
    $scope.platform = ionic.Platform.platform();



    $scope.go = function(input, type){
      $state.go('app.more', {type: type, input: input})

    }


  $scope.getNewName = function()
  {

     // Triggered on a button click, or some other target
      $scope.showPopup = function() {
        $scope.newplaylistname = {};
        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
          template: '<input type="text" placeholder="New Playlist Name" ng-model="newplaylistname.name">',
          title: 'Enter Playlist Name',
          subTitle: 'Ex. Workout tunes',
          scope: $scope,
          buttons: [
            { text: 'Cancel' },
            {
              text: '<b>Create</b>',
              type: 'button-positive',
              onTap: function(e) {
                if (!$scope.newplaylistname.name) {
                  //don't allow the user to close unless he enters name
                  $log.log("Input failed: ", $scope.newplaylistname);

                  e.preventDefault();
                } else {
                  $log.log("ID is: ", $scope.newplaylistname);
                  $scope.createPlaylist($scope.newplaylistname.name);
                  //return $scope.newplaylistname.name;
                }
              }
            }
          ]
        })

        myPopup.then(function(res) {
          console.log('Playlist Created!', res);
  })

  }
  $scope.showPopup();
}

  $scope.createPlaylist = function(newplaylistname)
  {
    $scope.showLoading();
    var userData = authenticationFact.getData();
    var promise = addFact.createPlaylist(newplaylistname, userData.id);
      promise.then(function(response)
      {
        $log.log("Created response: ", response);
        $scope.returnData = response;
        $log.log($scope.returnData);
        var addPlayPromise = firebaseFact.addPlaylist($scope.returnData.data);
        addPlayPromise.then(function(response)
         {
           $scope.hideLoading();
           $state.go("app.playlist", {playlistId: response, SPID: userData.id} );
         })

      })

  }
})

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!





.controller('BracketCtrl', function($scope,$log,$state,$stateParams,firebaseFact) {
  //var so = cordova.plugins.screenorientation;
  var compId = $stateParams.compId;

  /*
  $scope.$on('$ionicView.enter', function(ev) {
    so.lockOrientation('landscape');
  });
  $scope.$on('$ionicView.leave', function(ev) {
    so.unlockOrientation();
  });
  */

  var competitionPromise = firebaseFact.getLeague(compId);
  competitionPromise.then(function(response){
    console.log("response:",response);
    $scope.competitionName = response.name;
    $scope.round1 = response.rounds[1];
    $scope.round2 = response.rounds[2];
    $scope.round3 = response.rounds[3];
    $scope.noRounds = response.noRounds;
    console.log("round1:",response.rounds[1]);
    console.log("compRounds",$scope.competitionRounds);
    console.log("noRounds",$scope.noRounds);
  });

})

.controller('LeaguesCtrl', function($scope,$log,$state,$stateParams,firebaseFact) {
  //var so = cordova.plugins.screenorientation;
  var leaguesPromise = firebaseFact.getLeagues();

  leaguesPromise.then(function(response){
    console.log("response:",response);
    $scope.leagues = response;
  });

});
