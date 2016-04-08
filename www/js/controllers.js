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

    var currentState;// = $state.current.data.link;;
    //$log.log("current State: ",currentState);
    //$log.log("controller Data log: ", authenticationFact.getData())
    //event.preventDefault(); //This will cancel the transition
    // transitionTo() promise will be rejected with
    // a 'transition prevented' error
    //$rootScope.$on('$stateChangeSuccess',
    $rootScope.$on('$stateChangeSuccess',
      function(event, toState, toParams, fromState, fromParams, options){
        currentState = toState.data['link'];
        $log.log("Changed")


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
    //$scope.isDownloadActive = false;

    $scope.playlists = playlistsFact.getPlaylistsData();
    $log.log("Playlists List: ", playlists[0].name);




  })
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
