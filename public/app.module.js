'use strict';
(function(){
    // Define the `app` module
    angular.module('app', [

        //external modules
        'ngMaterial',
        'ngRoute',
        'ngMessages',
      
        //base modules
        'app.service.module', 
        'app.dataservice.module',       
        'app.component.module',
        'app.directive.module', 
        'app.constant.module', 
        'app.filter.module'
            
    ]);
    
})();

