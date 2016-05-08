angular.module('starter.controllers', [])

  /*
   Author: Roy Myers
   indexController
   indexController -
   The index app/ is the callback uri from spotify. on that page we parse the auth token and store all the user data.
   If the user is in our database, we continue to playlists, if now we go to confirmation.
   */

  .controller('indexController', function($scope, $log, $q, $state, Utils, authenticationFact, firebaseFact){
    //$log.log(window.location.origin)

    $scope.load = function () {
      //alert(window.location.hash);

      window.onload = function () {
        var hash = window.location.hash;
        hash = hash.toString();
        //$log.log("hash",hash)
        if(!hash){
          $state.go('app.playlists')
        }else if (hash.includes("access_token")) {
          Utils.show("Fetching User Account");
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
                    Utils.hide();
                    $state.go("app.playlists")
                  })


                } else{ //if not a registered user, send to registry page.
                  Utils.hide();
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
   on Mobile it uses ngOauth for spotify authentication
   */
  .controller('loginCtrl', function($scope, $cordovaOauth, $stateParams, $log, $ionicPlatform, $state, Utils, firebaseFact, authenticationFact){

    $scope.platform = ionic.Platform.platform();
    $scope.isAndroid = ionic.Platform.isAndroid();
    $scope.isIos = ionic.Platform.isIOS();
    if(($scope.platform != 'android') && ($scope.platform != 'ios')){
      $log.log("match")
    }
    $log.log("isIOS: ", $scope.isIos, " isAndroid: ", $scope.isAndroid, " platform: ", $scope.platform)
    //$scope.isOther = ionic.Platform.platform();
    $scope.printURI = function(){
      var ure = window.location.origin;
      Utils.alertshow('Uri',ure.toString());
    }

    $scope.performLogin = function(){
      authenticationFact.login()
      //https://accounts.spotify.com/authorize
    }

    $scope.mobileLogin = function(){
      var scopes_api = ['user-read-private user-read-email','playlist-read-private','playlist-modify-private','playlist-modify-public','playlist-read-collaborative']
      var client_id = 'be9a8fc1e71c45edb1cbf4d69759d6d3';

      var oauthPromise = $cordovaOauth.spotify(client_id, scopes_api);
      oauthPromise.then(function(response){
        Utils.show("Loading Playlists");
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
                Utils.hide();
                $state.go("app.playlists")
              } else { //if not a registered user, send to registry page.
                Utils.hide();
                $state.go("confirmation")
              }

            })
          })
        }
      }, function(error) {
        Utils.alertshow("Error", error);
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
      Utils.show("Registering User");
      var regPromise = firebaseFact.registerUser()
      regPromise.then(function(response){
        $log.log("Registered User")
        var fireUserPromise = firebaseFact.setUserData();

        fireUserPromise.then(function(response)
        {
          Utils.hide();
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
   controlls the side menu
   */
  .controller('AppCtrl', function($scope, $rootScope) {

    var currentState = 'Playlists';// = $state.current.data.link;;
    //$log.log("current State: ",currentState);
    //$log.log("controller Data log: ", authenticationFact.getData())
    //event.preventDefault(); //This will cancel the transition
    // transitionTo() promise will be rejected with
    // a 'transition prevented' error
    //$rootScope.$on('$stateChangeSuccess',

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
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
   pull to refresh
   */
  .controller('PlaylistsCtrl', function($scope, $state, $log, $stateParams, Utils, authenticationFact, playlistsFact) {

    $scope.playlists;// = playlistsFact.getPlaylistsData();
    $scope.SPID = authenticationFact.getData().id;

    $scope.doRefresh = function() {
      //Utils.show("Loading...")
      if (authenticationFact.isAuthorized()) {
        var playlistPromise = playlistsFact.getPlaylistsData();
        playlistPromise.then(function (response) {
          $scope.playlists = playlistsFact.getPlaylists();
          Utils.hide();
          //$state.go("app.playlists", {}, {reload: true})
        }, function(reason) {
          Utils.alertshow("Reason", reason.message);
          //console.log( "error message - " + err.message );
          //console.log( "error code - " + err.statusCode );
        }).finally(function() {
          // Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        });
      } else {
        Utils.hide();
        $state.go("login")
      }

    };

    $scope.load =  function() {
      Utils.show("Loading Playlists");
      //$log.log("yo", playlistsFact.areFetched())
      if (authenticationFact.isAuthorized()) {
        var playlistPromise = playlistsFact.getPlaylistsData();
        playlistPromise.then(function (response) {
          //$log.log("Promise resolved: ", response)
          $scope.playlists = playlistsFact.getPlaylists();
          //$log.log("playlists after call: ", $scope.playlists)
          //$log.log("Playlists List: ", $scope.playlists[0].name);
          Utils.hide();
          //$state.go("app.playlists", {}, {reload: true})
        }, function(reason) {
          Utils.alertshow("Reason", reason.message);
          //console.log( "error message - " + err.message );
          //console.log( "error code - " + err.statusCode );
        })
      } else {
        Utils.hide();
        $state.go("login")
      }
    }

    $scope.choosePlaylist = function(playlistId){
      $log.log("Chose Playlists: ",playlistId);
    }

  })


  /*
   Author: Roy Myers
   findPlaylist
   PlaylistCtrl -
   grabs and lists all songs in a playlist
   includes pull to reload
   */

  .controller('PlaylistCtrl', function($scope, $stateParams, $log, $state, Utils, authenticationFact, playlistsFact) {
    $scope.audio = new Audio();

    $scope.goTo = function(playlistId)
    {
      $state.go('app.search', {PID:playlistId})
    }

    $scope.playlist;
    $scope.doRefresh = function() {
      if (authenticationFact.isAuthorized()) {
        Utils.show("Grabbing Playlist");
        var userData = authenticationFact.getData();
        var playlistPromise = playlistsFact.getPlaylistData($stateParams.playlistId, userData.id);
        playlistPromise.then(function (response) {
          //$log.log("Response i controller: ",response)
          $scope.playlist = response;
          Utils.hide();
          $state.transitionTo($state.current, $stateParams, {
            reload: true,
            inherit: false,
            notify: true
          })
        }, function(reason) {
          hideLoading();
          Utils.alertshow("Reason", reason.message);
        }).finally(function() {
          // Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        });
      } else {
        Utils.hide();
        $state.go("login")
      }

    };


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

    $scope.$on('$ionicView.enter', function() {
      // Code you want executed every time view is opened
      console.log($scope.$ionicView)
    })
    $scope.load = function(){
      Utils.show("Grabbing Playlist");
      var userData = authenticationFact.getData();
      var playlistPromise = playlistsFact.getPlaylistData($stateParams.playlistId, userData.id);
      playlistPromise.then(function (response) {
        //$log.log("Response i controller: ",response)
        $scope.playlist = response;
        Utils.hide();
        $state.transitionTo($state.current, $stateParams, {
          reload: true,
          inherit: false,
          notify: true
        })
      }, function(reason) {
        Utils.hide();
        Utils.alertshow("Reason", reason.message);
        //console.log( "error message - " + err.message );
        //console.log( "error code - " + err.statusCode );
      })
    }
  })

  /*
   Author: Daniel Harper
   findPlaylist
   AccountCtrl -
   Pulls firbase data as well as spotify data
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


  /*
   Author: Roy Myers
   findPlaylist
   AccountCtrl -
   Pulls firbase data as well as spotify data
   */
  .controller('joinCtrl', function ($scope, $log, Utils, spotifyFact, firebaseFact) {

    $log.log("hitting Ctrl")
    $scope.leagues;

    $scope.load = function(){
      Utils.show("Loading open Leagues");
      $log.log("hitting load")
      var leaguePromise = firebaseFact.getLeagues();
      leaguePromise.then(function(response){
        //$log.log(response);
        $scope.leagues = response;
        $log.log("leagues:",$scope.leagues);
        Utils.hide();
      },function(res){
        $log.log("RES:",res);
        Utils.hide();
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

  .controller('searchCtrl', function($scope, $log, $stateParams, $ionicPlatform, $q, $state, Utils, searchFact, authenticationFact, spotifyFact, playlistsFact){
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
        $state.go('app.playlist',{playlistId:pId}, {reload:true})
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
      Utils.show("One Moment");
      $scope.playlistId = $stateParams.PID;
      $log.log("type: ", $stateParams.type);
      var promise = searchFact.getInheritResults($stateParams.input, $stateParams.type);
      promise.then(function(response){
        //$log.log(response);
        $scope.returnData = response;
        //$log.log($scope.returnData);

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

        //$log.log($scope.isArtist, $scope.isTrack, $scope.isAlbum);
        Utils.hide();
      })
    }

    $scope.performSearch = function(searchInput){
      platformPic();
      $scope.playlistId = $stateParams.PID;
      // assign somehting to be displayed (promise)
      // use ionic loading to wait while its being assigned
      Utils.show("Getting Results...");

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

        Utils.hide();
      })
    }


    $scope.inheritSearch = function(newsearch){
      // assign somehting to be displayed (promise)
      // use ionic loading to wait while its being assigned
      Utils.show("Loading...");
      $log.log("type: ", $stateParams.type);
      var promise = searchFact.getInheritResults(newsearch, $stateParams.type);
      promise.then(function(response){
        $log.log(response);
        $scope.returnData = response;
        $log.log($scope.returnData);


        Utils.hide();
      })
    }

  })

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!    League Controller     !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!    By: Thomas Brower     !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!    Contributions by:     !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!        Roy Myers         !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!



  .controller('leagueCtrl', function($scope, $log, $stateParams, $ionicPlatform, $q, $state, Utils, searchFact, addFact, authenticationFact, firebaseFact) {
    $scope.platform = ionic.Platform.platform();
    $scope.filtered;

    $scope.loadFilter = function(){
      Utils.show("Loading your Leagues");
      var filterPromise = firebaseFact.getFilteredLeagues();
      $log.log("hitting filter load")
      setTimeout(function() {
        filterPromise.then(function (response) {

          $scope.filtered = response;
          setTimeout(function () {
            //MEssage here
            Utils.hide();
          }, 5000);
          Utils.hide();

        }, function (reason) {
          Utils.hide();
          Utils.alertshow("Reason", reason.message);
          // console.log( "error message - " + err.message );
          // console.log( "error code - " + err.statusCode );
        })
      })
    }





    $scope.go = function(input, type){
      $state.go('app.more', {type: type, input: input})

    }


    $scope.getNewName = function()
    {

      $scope.showPopup = function() {
        $scope.newplaylistname = {};
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
                  //don't allow the user to close unless he enters something (name)
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
      Utils.show("Adding League");
      var userData = authenticationFact.getData();
      var addPromise = firebaseFact.addLeague(newLeague);
      addPromise.then(function(response)
      {
        $log.log("SUCCESS on add")
        Utils.hide();
        $state.go("app.myLeagues")

        //$scope.returnData = response;
      }, function(reason) {
        Utils.hide();
        Utils.alertshow("Reason", reason.message);
      })
    }

// Contributed by Roy Myers
    $scope.doRefresh = function() {
      if (authenticationFact.isAuthorized()) {
        var filterPromise = firebaseFact.getFilteredLeagues();
        $log.log("hitting filter load")
        filterPromise.then(function (response) {
          $log.log(response)
          $scope.filtered = response;
          Utils.hide();
          setTimeout(function(){ hideLoading(); }, 2000);

        }, function (reason) {
          Utils.hide();
          Utils.alertshow("Reason", reason.message)
        }).finally(function () {
          // Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        })
      } else {
        Utils.hide();
        $state.go("login")
      }
    }


    $scope.load = function(){
      Utils.show("Grabbing Leagues");
      $log.log("hitting league load")
      var leaguePromise = firebaseFact.getLeagues();
      leaguePromise.then(function(response){
        Utils.hide();
        $log.log(response)
        $scope.leagues = response;
        $log.log("leagues",$scope.leagues);

      }, function(reason) {
        Utils.hide();
        Utils.alertshow("Reason", reason.message);
        // console.log( "error message - " + err.message );
        // console.log( "error code - " + err.statusCode );
      })
    }

    $scope.createPlaylist = function(newplaylistname)
    {
      Utils.show("Creating Playlist");
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
          Utils.hide();
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




  // Author: Daniel Harper
  .controller('BracketCtrl', function($scope, $log, $state, $stateParams, Utils, firebaseFact) {
    //var so = cordova.plugins.screenorientation;
    $scope.load = function(){
      $log.log("BracketCtrl.load called");
      Utils.show("Loading Bracket")
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
        Utils.hide();
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


  //Author: Daniel Harper
  .controller('LeaguesCtrl', function($scope,$log,$state,$stateParams,firebaseFact) {
    //var so = cordova.plugins.screenorientation;
    var leaguesPromise = firebaseFact.getLeagues();
    leaguesPromise.then(function(response){
      console.log("response:",response);
      $scope.leagues = response;
    });

  });
