angular.module('starter.controllers', [])

    .controller('AppCtrl', function($scope,$rootScope, $ionicModal, $timeout,$log, $ionicLoading, $q, $http, $location, Spotify, authenticationFact) {

      // With the new view caching in Ionic, Controllers are only called
      // when they are recreated or on app start, instead of every page change.
      // To listen for when this page is active (for example, to refresh data),
      // listen for the $ionicView.enter event:
      var currentState;
      $rootScope.$on('$stateChangeStart',
        function(event, toState, toParams, fromState, fromParams){
          currentState = toState.data.link;
          $log.log(currentState)

          // do something
        })
      //$scope.$on('$ionicView.enter', function(e) {
      //});
      //var showLoading = function() {
      //  $ionicLoading.show({
      //    template: '<i class="ion-loading-c"></i>',
      //    noBackdrop: true
      //  });
      //}
      //
      //var hideLoading = function() {
      //  $ionicLoading.hide();
      //}

      // set loading to true first time while we retrieve songs from server.
      //showLoading();

      //$log.log(logtoken)
        //.then(function(){
        //  if(logtoken.getToken() === false){
        //    hideLoading();
        //  }else {
        //    $log.log("token true/null")
        //  }
        //});


      Spotify.getAlbum('0sNOF9WDwhWunNAHPD3Baj').then(function (data) {
        console.log(data);
      });


      $scope.performLogin = function(){
        authenticationFact.login()
        //https://accounts.spotify.com/authorize


        //Spotify.login();
        //var test = $http.get("https://accounts.spotify.com/authorize?client_id=" + client_id + "&response_type=code&redirect_uri="+
        //  encodeURIComponent(redirect_uri) +"&scopes="+encodeURIComponent(scopes_api)).success(function (res) {
        //  return res;
        //});
      }

      Spotify.getCurrentUser().then(function (data) {
        console.log(data);
      });
      $scope.accountItems = [

      ]

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



      // Form data for the login modal
      $scope.loginData = {};

      // Create the login modal that we will use later
      $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modal = modal;
      });

      // Triggered in the login modal to close it
      $scope.closeLogin = function() {
        $scope.modal.hide();
      };

      // Open the login modal
      $scope.login = function() {
        $scope.modal.show();
      };

      // Perform the login action when the user submits the login form
      $scope.doLogin = function() {
        console.log('Doing login', $scope.loginData);



          function login(callback) {
            function getLoginURL($scope) {
              return 'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID +
                '&redirect_uri=' + encodeURIComponent(redirect_uri) +
                '&scope=' + encodeURIComponent(scopes.join(' ')) +
                '&response_type=token';
            }

            var url = getLoginURL([
              'user-read-email'
            ]);

            var width = 450,
              height = 730,
              left = (screen.width / 2) - (width / 2),
              top = (screen.height / 2) - (height / 2);

            window.addEventListener("message", function(event) {
              var hash = JSON.parse(event.data);
              if (hash.type == 'access_token') {
                callback(hash.access_token);
              }
            }, false);

            var w = window.open(url,
              'Spotify',
              'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
            );

          }

          function getUserData(accessToken) {
            return $.ajax({
              url: 'https://api.spotify.com/v1/me',
              headers: {
                'Authorization': 'Bearer ' + accessToken
              }
            });
          }

          var templateSource = document.getElementById('result-template').innerHTML,
            template = Handlebars.compile(templateSource),
            resultsPlaceholder = document.getElementById('result'),
            loginButton = document.getElementById('btn-login');

          loginButton.addEventListener('click', function() {
            login(function(accessToken) {
              getUserData(accessToken)
                .then(function(response) {
                  loginButton.style.display = 'none';
                  resultsPlaceholder.innerHTML = template(response);
                });
            });
          });
      };
    })

    .controller('PlaylistsCtrl', function($scope) {
      $scope.playlists = [
        { title: 'Reggae', id: 1 },
        { title: 'Chill', id: 2 },
        { title: 'Dubstep', id: 3 },
        { title: 'Indie', id: 4 },
        { title: 'Rap', id: 5 },
        { title: 'Cowbell', id: 6 }
      ];
      $scope.isDownloadActive = false;




    })

    .controller('login', function($scope, $stateParams, $ionicModal, $timeout,$log, Spotify, $ionicPlatform, $ionicPopup, $ionicLoading, $q){ //$cordovaOauth, ) {

      $scope.performLogin = function(){
        Spotify.login();

      }


      //Called after login to update
      $scope.updateInfo = function() {
        Spotify.getCurrentUser().then(function (data) {
          $scope.getUserPlaylists(data.id);
        }, function(error) {
          $scope.performLogin();
        });
      };

      $ionicPlatform.ready(function() {
      var storedToken = window.localStorage.getItem('spotify-token');
      if (storedToken !== null) {
        Spotify.setAuthToken(storedToken);
        $scope.updateInfo();
      } else {
        $scope.performLogin();
      }
    });


      $scope.createUser = function(newuser){
        console.log(newuser.username)
        Backendless.UserService.register(user, asyncCallback);

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
