angular.module('starter.controllers', [])

  .controller('indexController', function($scope, $log, $q, $state, $ionicLoading, authenticationFact, playlistsFact){
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
        //$log.log("hash",hash)
        if(!hash){
          $state.go('app.playlists')
        }else if (hash.includes("access_token")) {
          $scope.showLoading();
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
              $scope.hideLoading();
              $state.go("app.playlists")
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

  .controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout,$log, $ionicLoading, $q, $http, $location,$state, Spotify, authenticationFact) {

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
    //$rootScope.$on("ionicView.beforeEnter", function(){
    //  $log.log("help")
    //})

    //if(!authenticationFact.isAuthorized() && authenticationFact.hasToken())
    //{
    //
    //  //var defer = $q.defer();
    //  $log.log("inside token length")
    //  var tken = authenticationFact.getToken()
    //  authenticationFact.queryData(tken)
    //  $scope.accountInfo = authenticationFact.getData();
    //  console.log($scope.accountInfo.images[0]);
    //}

    //$scope.$on('$stateChangeStart', function($q) {
    //  // Code you want executed every time view is opened
    //  currentState = $state.current.data.link;
    //  $log.log("currentState: ", currentState)
    //
    //  if(!authenticationFact.isAuthorized()){
    //    var tken = authenticationFact.getToken()
    //    var promise =authenticationFact.queryData(tken);
    //    promise.then(function(response){
    //      $log.log(response)
    //    })
    //  }
    //
    //})


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

  .controller('PlaylistsCtrl', function($scope, $state, $log, $ionicLoading, $ionicPopup, playlistsFact) {
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

  .controller('PlaylistCtrl', function($scope, $stateParams, $log,$ionicLoading, $ionicPopup, playlistsFact) {
    $scope.audio = new Audio();

    showLoading = function() {
      $ionicLoading.show({
        template: '<i class="ion-loading-c"> Grabbing Playlist </i>',
        noBackdrop: false
      });
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
      var playlistPromise = playlistsFact.getPlaylistData($stateParams.playlistId);
      playlistPromise.then(function (response) {
        $log.log("Response i controller: ",response)
        $scope.playlist = response;
        $log.log(response.tracks.items[0].track.album.images[2].url);
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


// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//                                                      Search Ctrl             
//                                                Written by: Thomas Brower
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  .controller('searchCtrl', function($scope, $log, $stateParams, $ionicLoading, $ionicPlatform, $q, $state, searchFact, spotifyFact){
    $scope.platform = ionic.Platform.platform();

    $scope.isArtist = false;
    $scope.isTrack = false;
    $scope.isAlbum = false;
    $scope.track = "track"
    $scope.album = "album"
    $scope.artist = "artist"

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

    $scope.go = function(input, type){
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



  //.controller('PlaylistCtrl', function($scope, $stateParams, $log, playlistsFact) {
  //  $scope.isDownloadActive = false;
  //  $scope.playlists = playlistsFact.getPlaylists();
  //  $log.log($scope.playlists)
  //  //$scope.song = $scope.songs[0]
  //
  //
  //
  //
  //
  //})

  .controller('login', function($scope, $stateParams, $log, $firebaseArray, $ionicPlatform, $ionicPopup, authenticationFact){
    $scope.platform = ionic.Platform.platform();

    $scope.performLogin = function(){
      authenticationFact.login()
      //https://accounts.spotify.com/authorize
    }



  })



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


  });
