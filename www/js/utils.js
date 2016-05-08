/**
 * Created by roy on 5/7/16.
 */
angular.module('starter.utils', [])
.factory('Utils', function($ionicLoading,$ionicPopup) {

  var Utils = {

    show: function(msg) {
      $ionicLoading.show({
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 500,
        template: '<p class="item-icon-left"> '+ msg +' <ion-spinner icon="lines"/></p>'
      });
    },

    hide: function(){
      $ionicLoading.hide();
    },

    alertshow: function(tit,msg){
      var alertPopup = $ionicPopup.alert({
        title: tit,
        template: msg
      });
      alertPopup.then(function(res) {
        //console.log('Registrado correctamente.');
      });
    }
  };

  return Utils;

});
