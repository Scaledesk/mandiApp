(function(){
 var app = angular.module('md_gate', ['ionic','angularMoment','ngCordova','ngMessages']);
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
app.constant("serverConfig", {
  "baseUrl": "http://mandigate.com"
  //"baseUrl": "http://127.0.0.1:8000"
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
        templateUrl: 'templates/login.html'
      }
    }
  });
  $stateProvider.state('app.dashboard', {
    url: '/dashboard',
    views:{
      'menuContent': {
        templateUrl: 'templates/dashboard.html',
        controller: 'DashboardCtrl',
        controllerAs: 'seller'
      }
    }
  });

  $stateProvider.state('app.listSellerItems', {
    url: '/listSellerItems',
    views:{
      'menuContent': {
        templateUrl: 'templates/listSellerItems.html',
        controller: 'ListSellerItemsCtrl',
        controllerAs: 'item'
      }
    }
  });

  $stateProvider.state('app.addStock', {
    url: '/addStock',
    views:{
      'menuContent': {
        templateUrl: 'templates/AddStock.html',
        controller: 'AddStockCtrl',
        controllerAs: 'stock'
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
          controller: 'RegisterCtrl',
          controllerAs:'register'
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
    url: '/pdp/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/pdp.html',
        controller: 'ProductCtrl',
        controllerAs:'p'
      }
    }
  });
  $stateProvider.state('app.aboutUs', {
    url: '/aboutUs',
    views: {
      'menuContent': {
        templateUrl: 'templates/aboutUs.html',

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
        templateUrl: 'templates/otp.html',
        controller: 'OtpCtrl',
        controllerAs:'otp'
      }
    }
  });
  $stateProvider.state('app.orderhistory', {
    url: '/orderhistory',
    views: {
      'menuContent': {
        templateUrl: 'templates/orderHistory.html',
        controller: 'OrderHistoryCtrl',
        controllerAs:'o'
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
        templateUrl: 'templates/login1.html',
        controller: 'LoginCtrl',
        controllerAs:'login'
      }
    }
  });
  $stateProvider.state('app.notification', {
    url: '/notification',
    views: {
      'menuContent': {
        templateUrl: 'templates/notification.html'
      }
    }
  });
  $stateProvider.state('app.faq', {
    url: '/faq',
    views: {
      'menuContent': {
        templateUrl: 'templates/faq.html',
        controller : 'FaqCtrl'
      }
    }
  });
  $stateProvider.state('app.about1', {
    url: '/about1',
    views: {
      'menuContent': {
        templateUrl: 'templates/about1.html'
      }
    }
  });
  $stateProvider.state('app.terms', {
    url: '/terms',
    views: {
      'menuContent': {
        templateUrl: 'templates/terms.html'
      }
    }
  });
  $stateProvider.state('app.privacy', {
    url: '/privacy',
    views: {
      'menuContent': {
        templateUrl: 'templates/privacy.html'
      }
    }
  });
  $stateProvider.state('app.cancel', {
    url: '/cancel',
    views: {
      'menuContent': {
        templateUrl: 'templates/cancellation.html'
      }
    }
  });
  $stateProvider.state('app.account', {
    url: '/account',
    views: {
      'menuContent': {
        templateUrl: 'templates/account.html',
        controller: 'ProfileCtrl',
        controllerAs:'profile'
      }
    }
  });
  $stateProvider.state('app.change', {
    url: '/change',
    views: {
      'menuContent': {
        templateUrl: 'templates/changePassword.html'
      }
    }
  });
  $stateProvider.state('app.edit', {
    url: '/edit',
    views: {
      'menuContent': {
        templateUrl: 'templates/edit.html',
        controller: 'ProfileCtrl',
        controllerAs:'profile'
      }
    }
  });
  $stateProvider.state('app.orp', {
    url: '/orp/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/orp.html',
        controller: 'BookingCtrl',
        controllerAs:'B'
      }
    }
  });
  $stateProvider.state('app.orderDetail', {
    url: '/orderDetail/:orderId',
    views: {
      'menuContent': {
        templateUrl: 'templates/orderDetail.html',
        controller: 'OrderDetail',
        controllerAs:'OD'

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
    if(window.localStorage['is_seller']=='true'){
      $urlRouterProvider.otherwise('/app/dashboard');
    } else {
      $urlRouterProvider.otherwise('/app/home');
    }
  }else{
    $urlRouterProvider.otherwise("/mainWalkthrough");
  }
});

app.run(function($rootScope, $ionicLoading) {
  $rootScope.$on('loading:show', function() {
    $ionicLoading.show({template: '<div class="ui-progress-circular"><ion-spinner class="progress-circular"></ion-spinner></div>'})
  });
  $rootScope.$on('loading:hide', function() {
    $ionicLoading.hide()
  })
});

}());
