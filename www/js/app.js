
angular.module('md_gate', ['ionic', 'md_gate.controllers','angularMoment'])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.cordova && window.cordova.InAppBrowser){
      window.open= window.cordova.InAppBrowser.open;
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
    .state('app.login', {
    url: '/login',
    views:{
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl',
        controllerAs:'login'
      }
    }
  })
    .state('app.seller', {
      url: '/seller',
      views: {
        'menuContent': {
          templateUrl: 'templates/registerSeller.html',
          controller: 'RegisterCtrl',
          controllerAs:'register'
        }
      }
    })
    .state('app.buyer', {
      url: '/buyer',
      views: {
        'menuContent': {
          templateUrl: 'templates/registerBuyer.html',
          controllerAs:'register'
        }
      }
    })
    .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })
  .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html'
        }
      }
    })
    .state('app.home', {
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'templates/home.html',
          controller: 'HomeCtrl',
          controllerAs:'home'
        }
      }
    })

  .state('app.category', {
    url: '/category/:categoryId',
    views: {
      'menuContent': {
        templateUrl: 'templates/category.html',
        controller: 'CategoryCtrl',
        controllerAs:'c'
      }
    }
  });
  $urlRouterProvider.otherwise('/app/home');
});
