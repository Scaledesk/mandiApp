(function() {
  var app = angular.module('md_gate');
  app.controller('AppCtrl', function ($scope, $ionicModal, Authentication,User, $state, $timeout) {
    $scope.isAuthenticate = function () {
      return Authentication.isLoggedIn();
    };
    $scope.logout = function () {
      if(User.logout()){
        $state.go('app.home');
      }
      /*User.logout().then(function(){
        window.localStorage['token'] = '';
        $state.go('app.home');
        });*/
    };
  });

  app.controller('mainWalkthroughCtrl', function ($scope, $state,$ionicViewSwitcher, Authentication,$ionicHistory) {
    var vm = this;
    vm.navigateTo = function (stateName,objectData) {
      if ($ionicHistory.currentStateName() != stateName) {
        $ionicHistory.nextViewOptions({
          disableAnimate: false,
          disableBack: true
        });
        //Next view animate will display in back direction
        $ionicViewSwitcher.nextDirection('back');
        $state.go(stateName, {
          isAnimated: objectData,
        });
      }
    }; // End of navigateTo.
    vm.getStarted=function(){
      vm.navigateTo('app.home',true);
      window.localStorage['SkipIntro'] = 'true';
    };
  });

  app.controller('HomeCtrl', function ($scope, Authentication, $state,Product) {
    var vm = this;
  });

  app.controller('CategoryCtrl', function ($scope,$http, $stateParams,Product) {
    var vm = this;
    var id  = $stateParams.categoryId;
    vm.products = [];
    Product.get().then(function(res){
      vm.products = res.data.product_list;
    });
  });


  app.controller('ProductCtrl', function ($scope,$http, $stateParams,Product) {
    var vm = this;
    var id  = $stateParams.productId;
    vm.products = [];
    Product.getChildProduct(id).then(function(res){
     vm.p = res.data.data_list;
     console.log(res);
     console.log(vm.p);
     });

    vm.loadOlderStories = function(){
      console.log('vhhgcvsghcvsdhchsdvchgvcghsd');
      var params = {};
      if(vm.products.length>0){
        params['after'] = vm.products[vm.products.length-1].name;
      }
      Product.loadStories(params, function(olderProducts){
        vm.products = vm.products.concat(olderProducts);
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    vm.openLink = function (url) {
      window.open(url,'_blank');
    };


  });


  app.controller('RegisterCtrl', function ($scope, Authentication) {

    var vm = this;
    vm.userData = {};

    vm.doSellerRegistration = function () {
      vm.userData.is_seller = true;
      vm.userData.is_buyer = false;
      Authentication.registration(vm.userData).then(function (data) {
        vm.userData = {};
        console.log(data);
      });
    };
    vm.doBuyerRegistration = function () {
      vm.userData.is_buyer = true;
      vm.userData.is_seller = false;
      Authentication.registration(vm.userData).then(function (data) {
        vm.userData = {};
        console.log(data);
      });
    };

  });


  app.controller('LoginCtrl', function ($scope, $state, Authentication,$ionicHistory) {
    var vm = this;
    if (Authentication.isLoggedIn()) {
      console.log('dsbcgsvdcscd');
      $state.go('app.home');
    }
    vm.alreadyMember = false;
    vm.doLogin = function (data) {
      $ionicHistory.nextViewOptions({historyRoot:true});
      Authentication.login(data).then(function (response) {
        console.log(response);
        if (response.data.status) {
          window.localStorage['token'] = response.data.token;
          vm.alreadyMember = false;
          $state.go('app.home');
        }
      });
    }
  });

  app.controller('FaqCtrl', function ($scope) {
    // var vm = this;
      $scope.items = [{
        title: 'What is mandigate',
        text: 'It is a commodity marketplace for agricultural produce where farmers/bulk sellers/licensee agents can list their products and buyers (industrialists, wholesale dealers, etc.) can review and place their bulk orders through online portal or mobile app. The unique proposition of this model is direct ordering of the farm fresh items without multiple intermediaries charging their high margins. The buyers have option to order products from different locations from pan India. Also, farmers get vast market to sell their produce. In this model, buyers can expect the quality products as we individually go and verify the commodity before transshipment.We have integrated supply chain for timely delivery and reduction of wastage in transportation of goods.'
      },{
        title: 'How can i update my informaiton?',
        text: 'It is easy to update your MandiGate account and view your orders any time through My Account.'

      },{
        title: 'How i know my order has been confirmed',
        text: 'Once your order has been logged and payment authorization has been received, the seller counter confirms the receipt of the order in part/Full quantity and begins processing it. You will receive an email containing the details of your order when the seller receives it and confirms the same. In this mail you will be provided with a unique Order ID (eg. ODR01202130213), a listing of the item(s) you have ordered and the expected delivery time. You will also be notified when the seller Transships produce(s) to you. Shipping details will be provided with the respective tracking number(s).'
      },{
        title: 'Can I order a product that is Out of Stock',
        text: 'Unfortunately, products listed as Out of Stock are not available for sale. Please use the Notify Me feature to be informed of the products availability with sellers on MandiGate'
      },{
        title: '5',
        text: 'Lorem ipsum dolor sit'
      }];

      /*
       * if given group is the selected group, deselect it
       * else, select the given group
       */
      $scope.toggleItem= function(item) {
        if ($scope.isItemShown(item)) {
          $scope.shownItem = null;
        } else {
          $scope.shownItem = item;
        }
      };
      $scope.isItemShown = function(item) {
        return $scope.shownItem === item;
      };

    });

}());
