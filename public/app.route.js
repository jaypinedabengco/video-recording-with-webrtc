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
          template: '<video-interview-with-webrtc></video-interview-with-webrtc>'
        })
        .when('/simple-webrtc/recorded-videos', {
          template: '<recorded-videos-list></recorded-videos-list>'
        })        
        .when('/tag-game', {
          template: '<tag-game></tag-game>'
        })        
        .otherwise('/404');
    }    

})();