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
      $routeProvider.        
        when('/', {
            templateUrl: 'views/home.view.html'
        })
        .otherwise('/404');
    }    

})();