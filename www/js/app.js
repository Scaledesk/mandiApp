(function(){
 var app = angular.module('md_gate', ['ionic', 'md_gate.controllers','angularMoment']);
 app.run(function($ionicPlatform) {
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
});

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('get_started',{
    url: "/mainWalkthrough",
    templateUrl: "templates/mainWalkthrough.html",
    controller: 'mainWalkthroughCtrl',
    controllerAs:'m'
  });
  $stateProvider
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  });
  $stateProvider.state('app.login', {
    url: '/login',
    views:{
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl',
        controllerAs:'login'
      }
    }
  });
  $stateProvider.state('app.seller', {
      url: '/seller',
      views: {
        'menuContent': {
          templateUrl: 'templates/registerSeller.html',
          controller: 'RegisterCtrl',
          controllerAs:'register'
        }
      }
    });
  $stateProvider.state('app.buyer', {
      url: '/buyer',
      views: {
        'menuContent': {
          templateUrl: 'templates/registerBuyer.html',
          controllerAs:'register'
        }
      }
    });
  $stateProvider.state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  });
  $stateProvider.state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html'
        }
      }
    });

  $stateProvider.state('app.home', {
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'templates/home.html',
          controller: 'HomeCtrl',
          controllerAs:'home'
        }
      }
    });

  $stateProvider.state('app.category', {
    url: '/category/:categoryId',
    views: {
      'menuContent': {
        templateUrl: 'templates/category.html',
        controller: 'CategoryCtrl',
        controllerAs:'c'
      }
    }
  });
  $stateProvider.state('app.signup', {
    url: '/signup',
    views: {
      'menuContent': {
        templateUrl: 'templates/signupseller.html'
      }
    }
  });
  $stateProvider.state('app.forget', {
    url: '/forget',
    views: {
      'menuContent': {
        templateUrl: 'templates/forgetPassword.html'
      }
    }
  });
  $stateProvider.state('app.reset', {
    url: '/reset',
    views: {
      'menuContent': {
        templateUrl: 'templates/resetPassword.html'
      }
    }
  });
  $stateProvider.state('app.pdp', {
    url: '/pdp',
    views: {
      'menuContent': {
        templateUrl: 'templates/pdp.html'
      }
    }
  });
  $stateProvider.state('app.aboutus', {
    url: '/aboutus',
    views: {
      'menuContent': {
        templateUrl: 'templates/aboutus.html'
      }
    }
  });
  $stateProvider.state('app.product', {
    url: '/product/:productId',
    views: {
      'menuContent': {
        templateUrl: 'templates/product-list.html'
      }
    }
  });

  $stateProvider.state('app.otp', {
    url: '/otp',
    views: {
      'menuContent': {
        templateUrl: 'templates/otp.html'
      }
    }
  });
  $stateProvider.state('app.orderhistory', {
    url: '/orderhistory',
    views: {
      'menuContent': {
        templateUrl: 'templates/orderHistory.html'
      }
    }
  });
  $stateProvider.state('app.filters', {
    url: '/filters',
    views: {
      'menuContent': {
        templateUrl: 'templates/filters.html'
      }
    }
  });
  $stateProvider.state('app.login1', {
    url: '/login1',
    views: {
      'menuContent': {
        templateUrl: 'templates/login1.html'
      }
    }
  });
  $stateProvider.state('app.example', {
      url: '/example',
      views: {
        'menuContent': {
          templateUrl: 'templates/example.html'
        }
      }
    });


  if(window.localStorage['SkipIntro']==='true'){
    $urlRouterProvider.otherwise('/app/home');
  }else{
    $urlRouterProvider.otherwise("/mainWalkthrough");

  }
});

}());
