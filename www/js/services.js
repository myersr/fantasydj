/**
 * Created by roy on 5/7/16.
 */
/*
 Authentication Factory
 Written by Roy Myers
 Performs the various authentication through spotify developers api
 Used promises in the form of $q and http requests
 */
angular.module('starter.services', ['ionic', 'starter.controllers','ngCordova','spotify','ngCordovaOauth','firebase'])
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
          if(res.data.display_name === null)
          {
            data.display_name = "Spotify Display Name Not Set"
          }
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
   Author: Roy Myers, Thomas Bower, Daniel Harper
   firebaseFact
   performs multiple functions using firebaseio backend
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
        user.set({UID: randUID, SUID: spotData.id, email: spotData.email, usrName: spotData.display_name, djPoints:0, bracketWins:0, bracketLosses:0, championships:0})
        $log.log("New registered User: ",user)
        resolve(user)
      });//end $q
    }
// <-------------------------------------------------- Written by Thomas Brower ------------------------------------------------------->
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! With contributions !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! from both Daniel Harper !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! and Roy Myers !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    firebaseFact.setUserData = function(){
      return $q(function(resolve, reject) {
        var spotData = authenticationFact.getData() //.email
        var users = new Firebase('https://fantasydj.firebaseio.com/users');
        var user = users.child(spotData.id);
        user.once("value", function(snapshot){
          if(snapshot.exists()){
            currentUser = snapshot.val();
            resolve("USER FOUND");
          }
          else{
            reject(currentUser + " does not exist");
          }
        }, function (err) {
          // code to handle read error
          reject(err);
        })
      }); //end of promise
    }

    firebaseFact.getUser = function()
    {
      return currentUser;
    }


    firebaseFact.addLeague = function(newLeague)
    {
      return $q(function(resolve,reject)
      {
        var spotData = authenticationFact.getData();
        var compId = Math.floor((Math.random() * 10000000) + 1);
        var date = new Date();
        var startWeek = new Date(date.getTime())
        var endWeek = new Date(date.getTime() + (60*60*24*7*1000));
        var endTime = endWeek.toString("MM-dd-yyyy").slice(0,15);
        var startTime = startWeek.toString("MM-dd-yyyy").slice(0,15);
        var nPlayers = newLeague.numPlayers;
        var participation = newLeague.filter;
        var name = newLeague.compName;


        var league = new Firebase('https://fantasydj.firebaseio.com/leagues/' + compId)
        if(participation)
        {
          // set flag equal to true
          var roundsArray = [];
          var competitorList = [];
          $log.log("Reaches inside if")

          //Set Round 1 by if the admin is playing or not (player 1)
          $log.log("IF WAS TRUE");
          var player1 = {
            SUID: spotData.id,
            name: spotData.display_name,
            playlistId: ""};
          var player2 = {
            SUID: "",
            name: "",
            playlistId: ""};
          var player3 = {
            SUID: "",
            name: "",
            playlistId: ""};
          var player4 = {
            SUID: "",
            name: "",
            playlistId: ""};
          var tempList = {
            player1,
            player2,
            player3,
            player4
          };
          competitorList = tempList;
          roundsArray.push(tempList);
          $log.log("roundsArray true:",roundsArray);

          //Set round 2 to two blank players (set to winners of round 1)
          var player5 = {
            SUID: "",
            name: "",
            playlistId: ""};
          var player6 = {
            SUID: "",
            name: "",
            playlistId: ""};
          var tempList  = {
            player5,
            player6
          };
          roundsArray.push(tempList);

          //Set round 3 (winner) to blank player7 (winner from round 2)
          var player7 = {
            SUID: "",
            name: "",
            playlistId: ""
          };
          roundsArray.push(player7);

          league.set({ID: compId, name: name, competitorList: competitorList, end: endTime, start: startTime, numRounds: nPlayers, userName: spotData.display_name, rounds: roundsArray})
          $log.log("league set inside of if")

        } else
        {
          // set flag equal to true
          var roundsArray = [];
          var competitorList = [];
          $log.log("Reaches inside if")
          var player1 = {
            SUID: "",
            name: "",
            playlistId: ""};
          var player2 = {
            SUID: "",
            name: "",
            playlistId: ""};
          var player3 = {
            SUID: "",
            name: "",
            playlistId: ""};
          var player4 = {
            SUID: "",
            name: "",
            playlistId: ""};
          var tempList = {
            player1,
            player2,
            player3,
            player4
          };
          competitorList = tempList;
          roundsArray.push(tempList);
          $log.log("roundsArray true:",roundsArray);

          //Set round 2 to two blank players (set to winners of round 1)
          var player5 = {
            SUID: "",
            name: "",
            playlistId: ""};
          var player6 = {
            SUID: "",
            name: "",
            playlistId: ""};
          var tempList  = {
            player5,
            player6
          };
          roundsArray.push(tempList);

          //Set round 3 (winner) to blank player7 (winner from round 2)
          var player7 = {
            SUID: "",
            name: "",
            playlistId: ""
          };
          roundsArray.push(player7);

          league.set({ID: compId, name: name, competitorList: competitorList, end: endTime, start: startTime, numRounds: nPlayers, userName: spotData.display_name, rounds: roundsArray})
          $log.log("league set inside of if")
        };
        $log.log("New league set: ", league);
        resolve("SUCCESS");
      })
    }



// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// <----------------------------------------------------------------------------------------------------------------------------------->
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


    //Author: Daniel Harper
    //Returns a competition based on the compId if it exists
    firebaseFact.getLeague = function(compId){
      return $q(function(resolve, reject) {
        var league = new Firebase("https://fantasydj.firebaseio.com/leagues");
        league.once("value", function(snapshot){
          if(snapshot.child(compId).exists()){
            var theComp = snapshot.child(compId).val();
            resolve(theComp);
          }
          else{
            reject("filtered league does not exist");
          }
        }, function (err) { // code to handle read error
          reject(err);
        })
      }); //end of promise
    }

    //Author: Daniel Harper
    //Returns a list of leagues to be displayed
    firebaseFact.getLeagues = function() {
      return $q(function (resolve, reject) {
        $log.log("no")
        var leagues = new Firebase("https://fantasydj.firebaseio.com/leagues");
        leagues.once("value", function (snapshot) {
          if (snapshot.exists()) {
            var theComp = snapshot.val();
            resolve(theComp);
          }
          else {
            reject("Could not reach leagues database ");
          }
        }, function (err) {  // code to handle read error
          reject(err);
        })
      }); //end of promise
    }

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  Thomas Brower  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    firebaseFact.getFilteredLeagues = function() {
      return $q(function (resolve, reject) {
        var spotData = authenticationFact.getData() // return the users spotify data
        var league = spotData.id
        var filtered = new Firebase("https://fantasydj.firebaseio.com/leagues");
        // NEED TO LOOK WITHIN CHILDREN OF LEAGUES
        filtered.once("value", function (snapshot) {
          if (snapshot.exists()) {
            var theComp = snapshot.val();
            var theFilteredComp = [];
            //accountInfo = authenticationFact.getData();
            firebaseInfo = firebaseFact.getUser();
            //$log.log("accountInfo:",accountInfo);
            var mySUID = firebaseInfo.SUID;
            for (var key in theComp) {
              //$log.log("theComp loop:",theComp[key].competitorList);
              for (var ckey in theComp[key].competitorList) {
                if (theComp[key].competitorList[ckey].SUID === league){
                  theFilteredComp.push(theComp[key]);
                }
              }
              //if theComp[key].competitorList
              // Use `key` and `value`
            }
            //$log.log("filtered theComp:", theFilteredComp);
            resolve(theFilteredComp);
          }
          else {
            reject("Could not reach filtered leagues database ");
          }
        }, function (err) {
          reject(err);
        })
      });
    }

    firebaseFact.addPlaylist = function(playlist){
      return $q(function(resolve,reject)
      {

        var spotData = authenticationFact.getData() // return the users spotify data
        var newPlaylist = new Firebase('https://fantasydj.firebaseio.com/users/' + spotData.id + '/playlists/' + playlist.id);
        newPlaylist.set({ name: playlist.name, league: "null"})
        $log.log("New playlist created in database: ", newPlaylist)
        resolve(playlist.id)


      })
    }


    firebaseFact.getFirePlaylists = function(){
      return $q(function(resolve,reject)
      {
        var spotData = authenticationFact.getData()
        var playlistInfo = new Firebase('https://fantasydj.firebaseio.com/users/' + spotData.id + '/playlists');
        $log.log(playlistInfo)
        playlistInfo.once("value", function(snapshot)
        {

          var fireList = snapshot.val();
          resolve(fireList);

        })
      })
    }

    return firebaseFact;
  }])


  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //                                                   Search Factory : Thomas Brower
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
          $log.log("search2fetched", searchResults)
          resolve(searchResults)

        }, function errorCallback(response) {
          $log.log("Call Error Search results: ",response)
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
          $log.log("inheritfetched", searchResults)
          resolve(searchResults)

        }, function errorCallback(response) {
          $log.log("Call Error Search inherit: ",response)
          reject("400 error in getSearchData")
        })
      });
    }

    return searchFact;
  }])




  /*
   Author: Roy Myers
   Contributions made by: Thomas Brower
   spotifyFact -
   Uses the Spotify Api to perform multiple functions.
   Also stores instances of user data.
   */
  .factory('spotifyFact',['$log', '$http','$q', function($log, $http, $q){
    var spotifyFact = []
    var searchValue = []

    spotifyFact.areFetched = function(){
      if(searchValue.length != 0){
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
          $log.log("artistfetched", searchValue)
          resolve(searchValue)

        }, function errorCallback(response) {

          $log.log("Call Error Search Artist result: ",response)
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
          $log.log("tracksfetched", searchValue)
          resolve(searchValue)

        }, function errorCallback(response) {

          $log.log("Call Error Search track results: ",response)
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
          $log.log("albumfetched", searchValue)
          resolve(searchValue)

        }, function errorCallback(response) {

          $log.log("Call Error Search album results: ",response)
          reject("400 error in getAlbumResults")
        })
      });
    }


    return spotifyFact;
  }])


  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Add Playlist Factory  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  By: Thomas Brower    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


  .factory('addFact',['$log', '$http','$q', 'authenticationFact', function($log, $http, $q, authenticationFact){
    var addFact = []
    var playlists = []
    var userData = authenticationFact.getData();

    addFact.areFetched = function(){
      if(playlists.length != 0){
        return true;
      }else {
        return false;
      }
    }
    addFact.getPlaylists = function(){
      return playlists;
    }

    addFact.createPlaylist = function(newplaylistname, userID){
      return $q(function(resolve, reject) {

        $log.log("playlist name: ", newplaylistname);
        $http({
          url: "https://api.spotify.com/v1/users/"+ userID + "/playlists" ,
          method: "POST",
          headers: {
            'Authorization': 'Bearer ' + token,
            "Content-Type": "application/json"
          },
          data: {
            'name': (newplaylistname),
            'public': true

          }
        }).then(function successCallback(res) {
          playlists = res
          $log.log("playlistscreated",playlists)
          $log.log("response: ", res)
          resolve(playlists)

        }, function errorCallback(response) {
          $log.log("Call Error Playlist not created: ",response)
          reject(response)
        })
      });
    }


    var getLinkbyId = function(playlistId) {
      for (var i = 0; i < playlists.length; i++) {
        if (playlists[i].id == playlistId) {
          return playlists[i].href
        }
      }
    }


    addFact.getPlaylistData = function(playlistId){
      return $q(function(resolve, reject) {
        var playlistLink = getLinkbyId(playlistId)
        $log.log("after For loop: ", playlistLink)
        $http({
          url: playlistLink,
          method: "Get",
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }).then(function successCallback(res) {
          playlistData = res.data;
          resolve(playlistData)

        }, function errorCallback(response) {
          $log.log("Call Error single Playlist: ",response)
          reject(response)//"Sorry, we have encountered an error creating your playlist.")
        })
      });
    }
    addFact.getPlaylist = function(playlistId){

    }

    addFact.getSong = function(index){
      return songs[index];
    }

    return addFact;
  }])


  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


  /*
   Author Roy Myers
   playlistsFact -
   Returns users playlist from spotify

   using $q as promises
   */
  .factory('playlistsFact',['$log', '$http','$q', 'authenticationFact', 'firebaseFact', function($log, $http, $q, authenticationFact, firebaseFact){
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

//  !!!!!!!!!!!!!!!!!!!!!!!!!! Thomas Brower !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    var matchingPlaylists = function(list1, array1)
    {
      if((list1 === null) || (array1.length < 1)){
        return []
      }
      var arrayLength = array1.length;
      var matches = [];
      var keys = Object.keys(list1);
      $log.log("true dat: ",array1)

      for (var i = 0; i < arrayLength; i++)
      {
        for (var j = 0; j < keys.length; j++)
        {
          if(array1[i].id === keys[j])
          {
            // do stuff
            matches[matches.length] = array1[i];
          }
        }
      }
      return matches;
    }


    playlistsFact.addTrack = function(playlistId, uri)
    {
      return $q(function(resolve, reject) {
        $log.log("playlist ID in addTrackFact: ", playlistId);
        userData = authenticationFact.getData();
        $http({
          url: "https://api.spotify.com/v1/users/"+ userData.id + "/playlists/" + playlistId + "/tracks?uris=" + uri,
          method: "POST",
          headers: {
            'Authorization': 'Bearer ' + token,
          }
        }).then(function successCallback(res)
        {
          playlists = res
          $log.log("response: ", res)
          resolve(playlists)

        }, function errorCallback(response)
        {
          $log.log("Call Error Playlist not created: ",response)
          reject(response)
        })
      });
    }



// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


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
          var firePromise = firebaseFact.getFirePlaylists();
          firePromise.then(function(response)
          {
            list1 = response
            var array1 = res.data.items
            //playlist = res.data.items
            playlists = matchingPlaylists(list1, array1)
            $log.log("playlistsfetched",playlists)
            resolve("playlists fetched")
          })


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

    playlistsFact.getPlaylistData = function(playlistId, spotID){
      return $q(function(resolve, reject) {
        var playlistLink = getLinkbyId(playlistId)
        $log.log("after For loop: ", playlistLink)
        //var userData = authenticationFact.getData();
        //$log.log("userData: ", userData)
        $http({
          url: "https://api.spotify.com/v1/users/"+ spotID +"/playlists/"+ playlistId,
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
