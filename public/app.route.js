'use strict';
(function(){

  /*
  * Routes
  */
  angular
    .module('app')
    .config(AppRouteConfig);

    /////

    AppRouteConfig.$inject = ['$locationProvider' ,'$routeProvider']
    function AppRouteConfig($locationProvider, $routeProvider) {


      //Routing
      $locationProvider.hashPrefix('!');
      $routeProvider
        .when('/', {
          templateUrl : '/views/home.view.html'
        })
        .when('/simple-chat', {
          template: '<simple-chat></simple-chat>'
        })
        .when('/simple-webrtc', {
          template: '<simple-webrtc></simple-webrtc>'
        })
        .when('/tag-game', {
          template: '<tag-game></tag-game>'
        })        
        .otherwise('/404');
    }    

})();