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
                  var fireUserPromise = firebaseFact.setUserData();

                  fireUserPromise.then(function(response)
                  {
                    $scope.hideLoading();
                    $state.go("app.playlists")
                  })


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
  .controller('loginCtrl', function($scope, $cordovaOauth, $stateParams, $log, $ionicPlatform, $ionicPopup, $ionicLoading, $state, firebaseFact, authenticationFact){
    $scope.showLoading = function() {
      $ionicLoading.show({
        template: '<i class="ion-loading-c">Fetching User Account</i>',
        noBackdrop: false
      });
    }

    $scope.hideLoading = function() {
      $ionicLoading.hide();
    }

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

    $scope.mobileLogin = function(){
      var scopes_api = ['user-read-private user-read-email','playlist-read-private','playlist-modify-private','playlist-modify-public','playlist-read-collaborative']
      var client_id = 'be9a8fc1e71c45edb1cbf4d69759d6d3';

      var oauthPromise = $cordovaOauth.spotify(client_id, scopes_api)
      oauthPromise.then(function(response){
        $scope.showLoading();
        var isUser;
        window.localStorage.setItem("access_token", response.access_token);
        var token = response.access_token;
        authenticationFact.setToken(token)
        //localStorage.setItem('spotify-token', token);
        if(!authenticationFact.isAuthorized()) {
          var tken = authenticationFact.getToken()
          $log.log(tken)
          var promise = authenticationFact.queryData(token);
          promise.then(function (response) {
            $log.log(response)
            //initialize promise
            var promiseReg = firebaseFact.isRegistered();
            //finishing the promise
            promiseReg.then(function (response) {
              $log.log("inside isRegistered promise: ", response)
              isUser = response;
              if (isUser) {
                $scope.hideLoading();
                $state.go("app.playlists")
              } else { //if not a registered user, send to registry page.
                $scope.hideLoading();
                $state.go("confirmation")
              }

            })
          })
        }
      }, function(error) {
        $ionicPopup.alert({
          title: 'Error',
          content:error
        })
      })
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
        var fireUserPromise = firebaseFact.setUserData();

        fireUserPromise.then(function(response)
        {
          hideLoading();
          $state.go("app.playlists")
        })
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
      {name: 'My Leagues', link:'#/app/myLeagues', class: 'item-dark'},
      {name: 'Leader Boards', link: '#/app/browse', class: 'item-dark'},
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
  .controller('PlaylistsCtrl', function($scope, $state, $log, $ionicLoading, $ionicPopup, $stateParams,authenticationFact, playlistsFact) {
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
    $scope.SPID = authenticationFact.getData().id;

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

  .controller('PlaylistCtrl', function($scope, $stateParams, $log,$ionicLoading, $state, $ionicPopup, authenticationFact, playlistsFact) {
    $scope.audio = new Audio();

    showLoading = function() {
      $ionicLoading.show({
        template: '<i class="ion-loading-c"> Grabbing Playlist </i>',
        noBackdrop: false
      });
    }

    $scope.goTo = function(playlistId)
    {
      $state.go('app.search', {PID:playlistId})
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
      var userData = authenticationFact.getData();
      var playlistPromise = playlistsFact.getPlaylistData($stateParams.playlistId, userData.id);
      playlistPromise.then(function (response) {
        //$log.log("Response i controller: ",response)
        $scope.playlist = response;
        $state.transitionTo($state.current, $stateParams, {
          reload: true,
          inherit: false,
          notify: true
        })
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
  .controller('AccountCtrl', function($scope,$log, authenticationFact, firebaseFact) {
    if(authenticationFact.isAuthorized())
    {
      //var defer = $q.defer();
      $log.log("ACCOUNT CALL")
      //var tken = authenticationFact.getToken()
      //authenticationFact.queryData(tken)
      $scope.accountInfo = authenticationFact.getData();
      $scope.firebaseInfo = firebaseFact.getUser();
      console.log("accountInfo:",$scope.accountInfo);
      console.log("firebaseInfo:",$scope.firebaseInfo);
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
      var leaguePromise = firebaseFact.getLeagues();
      leaguePromise.then(function(response){
        //$log.log(response);
        $scope.leagues = response;
        $log.log("leagues:",$scope.leagues);
        hideLoading();
      },function(res){
        $log.log("RES:",res);
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

  .controller('searchCtrl', function($scope, $log, $stateParams, $ionicLoading, $ionicPlatform, $q, $state, searchFact, authenticationFact, spotifyFact, playlistsFact){
    $scope.platform = ionic.Platform.platform();

    $scope.pId = $stateParams.PID;
    $scope.picIndex;
    var platformPic = function(){
      if($scope.platform == 'android'){
        $scope.picIndex = 1;
      } else{
        $scope.picIndex = 2
      }

    }


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

    $scope.addTo = function(uri)
    {
      var pId = $stateParams.PID;
      // call add to playlist Fact
      var addPromise = playlistsFact.addTrack(pId, uri)
      addPromise.then(function(response)
      {
        $scope.item = response;
        $log.log(response);
        $state.go('app.playlist',{playlistId:pId})
      })

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

    $scope.go = function(input, type) {
      var userData = authenticationFact.getData()
      var pId = $stateParams.PID;
      $state.go('app.more', {PID: pId ,type: type, input: input})

    }

    $scope.artistload = function(){
      $scope.playlistId = $stateParams.PID;
      //artist promise
      var pId = $stateParams.PID;
      var artistPromise = spotifyFact.getArtistResults($stateParams.searchValue)
      artistPromise.then(function(response){
        $scope.item = response;
        $log.log($scope.item);
      })
      $log.log("PID passed from search-artist: ", $stateParams.PID);

    }


    $scope.trackload = function(){
      //track promise
      var pId = $stateParams.PID;
      var trackPromise = spotifyFact.getTrackResults($stateParams.searchValue)
      trackPromise.then(function(response){
        $scope.item = response;
        platformPic();
        $scope.trackImg = $scope.item.album.images[$scope.picIndex].url
        $log.log($scope.item);
      })
      $log.log("PID passed from search-track: ", $stateParams.PID);

    }

    $scope.albumload = function(){
      //album promise
      var pId = $stateParams.PID;
      var albumPromise = spotifyFact.getAlbumResults($stateParams.searchValue)
      albumPromise.then(function(response){
        $scope.item = response;
        $log.log($scope.item);
      })
      $log.log("PID passed from search-album: ", $scope.playlistId);

    }

    $scope.inheritload = function(){
      $scope.showLoading();
      $scope.playlistId = $stateParams.PID;
      $scope.playlistId = $stateParams.PID;
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
      platformPic();
      $scope.playlistId = $stateParams.PID;
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
          //platformPic();
          //$scope.dataArtistsImg = $scope.item.images[$scope.picIndex].url
        }

        $scope.returnDataTracks = response.tracks.items;
        if($scope.returnDataTracks.length > 0)
        {
          $scope.isTrack = true;
          //platformPic();
          //$scope.dataTracksImg = $scope.item.album.images[$scope.picIndex].url

        }
        $log.log($scope.returnDataTracks);

        $scope.returnDataAlbum = response.albums.items;
        if($scope.returnDataAlbum.length > 0)
        {
          $scope.isAlbum = true;
          //platformPic();
          //$scope.dataAlbumImg = $scope.item.images[$scope.picIndex].url
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

    $scope.addLeague = function(newLeague)
    {
      $scope.showLoading();
      var userData = authenticationFact.getData();
      var addPromise = firebaseFact.addLeague(newLeague);
      addPromise.then(function(response)
      {
        $log.log("SUCCESS on add")
        $scope.hideLoading();
        $state.go("app.myLeagues")

        //$scope.returnData = response;
      }, function(reason) {
        hideLoading();
        $ionicPopup.alert({
          title: 'reason',
          content: reason.message
        })
        // console.log( "error message - " + err.message );
        // console.log( "error code - " + err.statusCode );
      })
    }


    $scope.loadFilter = function(){
      showLoading();
      var filterPromise = firebaseFact.getFilteredLeagues();
      $log.log("hitting filter load")
      filterPromise.then(function(response){
        hideLoading();
        $log.log(response)
        $scope.filtered = response;

      }, function(reason) {
        hideLoading();
        $ionicPopup.alert({
          title: 'reason',
          content: reason
        })
        // console.log( "error message - " + err.message );
        // console.log( "error code - " + err.statusCode );
      })
    }


    $scope.load = function(){
      showLoading();
      $log.log("hitting league load")
      var leaguePromise = firebaseFact.getLeagues();
      leaguePromise.then(function(response){
        hideLoading();
        $log.log(response)
        $scope.leagues = response;
        $log.log("leagues",$scope.leagues);

      }, function(reason) {
        hideLoading();
        $ionicPopup.alert({
          title: 'reason',
          content: reason
        })
        // console.log( "error message - " + err.message );
        // console.log( "error code - " + err.statusCode );
      })
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
          $state.go("app.playlist", {playlistId: response} );
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
    $scope.load = function(){
      $log.log("BracketCtrl.load called");
      var compId = $stateParams.compId;
      var competitionPromise = firebaseFact.getLeague(compId);
      $log.log("Competition Promise:",competitionPromise);
      competitionPromise.then(function(response){
        console.log("response:",response);
        $scope.competitionName = response.name;
        $scope.round1 = response.rounds[0];
        $scope.round2 = response.rounds[1];
        $scope.round3 = response.rounds[2];
        $scope.noRounds = response.noRounds;
        //console.log("round1:",response.rounds[0]);
        //console.log("round2:",response.rounds[1]);
        //console.log("round3:",response.rounds[2]);
        //console.log("compRounds",$scope.competitionRounds);
        //console.log("noRounds",$scope.noRounds);
      });
    }

    /*
     $scope.$on('$ionicView.enter', function(ev) {
     so.lockOrientation('landscape');
     });
     $scope.$on('$ionicView.leave', function(ev) {
     so.unlockOrientation();
     });
     */


  })

  .controller('LeaguesCtrl', function($scope,$log,$state,$stateParams,firebaseFact) {
    //var so = cordova.plugins.screenorientation;
    var leaguesPromise = firebaseFact.getLeagues();
    leaguesPromise.then(function(response){
      console.log("response:",response);
      $scope.leagues = response;
    });

  });
