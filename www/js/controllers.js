(function() {
  var app = angular.module('md_gate.controllers', []);
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

  app.controller('HomeCtrl', function ($scope, Authentication, $state,Product) {
    var vm = this;
    Product.get().then(function(res){
      vm.products = res.data.product_list;
    });
  });

  app.controller('CategoryCtrl', function ($scope,$http, $stateParams,Product) {
    var vm = this;
    var id  = $stateParams.categoryId;

    vm.products = [];


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



    /*Product.getChildProduct(id).then(function(res){
      vm.products = res.data.data_list;
      console.log(vm.products);
    });*/
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
}());
