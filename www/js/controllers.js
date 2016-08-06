(function() {
  var app = angular.module('md_gate');
  app.controller('AppCtrl', function ($scope,$ionicHistory, $ionicModal, Authentication, $state,Profile,$cordovaToast, $timeout) {
    $scope.isAuthenticate = function () {
      return Authentication.isLoggedIn();
    };
    if(Authentication.isLoggedIn()){
      Profile.getProfile().then(function(res){
        $scope.profile = res.data.profile_data;
        /*if($scope.profile.is_seller==true){
          $ionicHistory.nextViewOptions({historyRoot:true});
          $state.go('app.dashboard');
        }*/
        console.log(JSON.stringify($scope.profile));
      });
    }

    $scope.logout = function () {
      Authentication.logoutUser().then(function(data){
        window.localStorage['token'] = '';
        window.localStorage['is_seller'] = undefined;
            /*$cordovaToast.showShortTop('Logout successfully').then(function(success) {
            }, function (error) {
            });*/
        $scope.profile = undefined;
        alert('Logout successfully');
        $state.go('app.home');
      },function(error){
      });
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

  app.controller('CategoryCtrl', function ($scope,$http,$state,Authentication, $stateParams,Product,$ionicModal,serverConfig,$ionicHistory) {
    var vm = this;
     vm.baseUrl = serverConfig.baseUrl;
    vm.sortBy= 'price';
    if(!Authentication.isLoggedIn()){
      $ionicHistory.nextViewOptions({historyRoot:true});
      $state.go('app.login1');
    }
    var id  = $stateParams.categoryId;
    vm.products = [];
    vm.no_stocks = false;
    vm.dt = {
      "c_type":"category",
      "entity_name":id,
      "page_number":0
    };

    vm.loadProduct = function(){
      if(vm.no_stocks){
        $scope.$broadcast('scroll.infiniteScrollComplete');
        return;
      }
      if(vm.products.length>0){
        vm.dt.page_number = vm.dt.page_number+1;
      }
      Product.getProduct(vm.dt).then(function(res){
        if(res.data.status&&res.data.data.total_records>0){
          vm.products = vm.products.concat(res.data.data.all_stocks);
          console.log(JSON.stringify(vm.products));
          $scope.$broadcast('scroll.infiniteScrollComplete');
          if(vm.products.length==res.data.data.total_records){
            vm.no_stocks = true;
          }
        }
      },function(error){
        console.log(error);
        console.log('this controller');
        console.log(this);
      });
    };

    $ionicModal.fromTemplateUrl('templates/filters.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    vm.openModal = function() {
      $scope.modal.show();
    };
    vm.closeModal = function() {
      $scope.modal.hide();
    };
    vm.applyFilter = function(){
      vm.closeModal();
    };
    vm.clearFilter = function(){
      vm.closeModal();
    };


  });

  app.controller('ProductCtrl', function ($scope,$http, $stateParams,Product,serverConfig) {
    var vm = this;
    vm.baseUrl = serverConfig.baseUrl;
    var id  = $stateParams.id;
    vm.product = {};
    Product.getProductDetails(id).then(function(res){
     console.log(res);
      vm.product = res.data;
     });

    /*vm.loadOlderStories = function(){
      var params = {};
      if(vm.products.length>0){
        params['after'] = vm.products[vm.products.length-1].name;
      }
      Product.loadStories(params, function(olderProducts){
        vm.products = vm.products.concat(olderProducts);
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };*/
  });

  app.controller('BookingCtrl', function ($scope,$http,$state, $stateParams,$window,Product,Booking) {
    var vm = this;
    var id  = $stateParams.id;
    vm.product = {};
    vm.order_id = undefined;
    vm.verified = undefined;
    vm.quantity = 1;
    Booking.verifyOrder(id).then(function(res){
          console.log('verify');
          console.log(res);
      if(res.data.bank_verified && res.data.success){
        vm.order_id = res.data.order_id;
        vm.verified = true;
        console.log(vm.verified);
        console.log(vm.order_id);
      } else {
        vm.verified = false;
      }
    },function(){
      console.log('verify error');
      console.log(res);
    });
    Product.getProductDetails(id).then(function(res){
      console.log(res);
      vm.product = res.data;
      console.log(JSON.stringify(vm.product));
    });
    vm.placeOrder = function(qn){
      if(qn==undefined||qn==''||qn==0){
        $window.document.getElementById('quantity').focus();
        return false;
      }
      var dd ={
        "stock_id":id,
        "order_id":vm.order_id,
        "quantity":qn
      };
      Booking.createOrder(dd).then(function(res){
        alert('success '+ JSON.stringify(res));
        $state.go('app.orderhistory');
      },function(err){
        alert('error '+JSON.stringify(err));
      });
    }
  });

  app.controller('OrderHistoryCtrl', function ($scope,$state,Booking,Authentication) {
    var vm = this;
    if(!Authentication.isLoggedIn()){
      $state.go('app.login1');
    }
    vm.ordersDetail = {};
    function getOrderHistory(){
      Booking.getOrderHistory().then(function(res){
        console.log('order history success');
        console.log(JSON.stringify(res));
        vm.ordersDetail = res.data.all_orders_listing;
      },function(err){

      });
    }
    getOrderHistory();
  });

  app.controller('OrderDetail', function ($scope,$state,$stateParams,Booking,Authentication,serverConfig) {
    var vm = this;
    var id  = $stateParams.orderId;
    if(!Authentication.isLoggedIn()){
      $state.go('app.login1');
    }
    vm.baseUrl = serverConfig.baseUrl;
    vm.ordersDetail = {};
    function getOrderDetails(){
      Booking.getOrderDetail(id).then(function(res){
        console.log('order details success');
        console.log(JSON.stringify(res));
        vm.ordersDetail = res.data;
      },function(err){
          alert('error ');
      });
    }
    getOrderDetails();
  });

  app.controller('RegisterCtrl', function ($scope,$state,$ionicHistory,$cordovaToast, Authentication) {
    if (Authentication.isLoggedIn()) {
      $state.go('app.home');
    }
    var vm = this;
    vm.userData = {};
    vm.userData.user_type = 'Individual';
    function registration(){
      $ionicHistory.nextViewOptions({historyRoot:true});
      Authentication.registration(vm.userData).then(function (response) {
        console.log(response);
        if (response.data.status) {
          window.localStorage['token'] = response.data.token;
          alert('Register successfully');
          /*$cordovaToast.showShortTop('Register successfully!').then(function(success) {
          }, function (error) {
            console.log(error);
          });*/
          $state.go('app.otp');
        }
      },function(error){
        alert('Something Wrong!');
        /*$cordovaToast.showShortTop('Something Wrong!').then(function(success) {
        }, function (error) {
          console.log(error);
        });*/
      });
    }
    vm.doSellerRegistration = function () {
      vm.userData.is_seller = true;
      vm.userData.is_buyer = false;
      vm.userData.username = vm.userData.mobile;
      registration();
    };
    vm.doBuyerRegistration = function () {
      vm.userData.is_buyer = true;
      vm.userData.is_seller = false;
      vm.userData.user_type = '';
      vm.userData.username = vm.userData.mobile;
      registration();
    };
  });

  app.controller('OtpCtrl', function ($scope,$state,$ionicHistory,$cordovaToast, Authentication) {
    var vm = this;
    vm.checkOtp = function(num){
      if(num==12345){
        $ionicHistory.nextViewOptions({historyRoot:true});
        /*$cordovaToast.showShortTop('Verified Successfully !').then(function(success) {
          $state.go('app.home');
        }, function (error) {
          console.log(error);
        });*/
        alert('Verified successfully');
        $state.go('app.home');
      }else {
        alert('Otp does not match');
        /*$cordovaToast.showShortTop('Otp does not match !').then(function(success) {
        }, function (error) {
          console.log(error);
        });*/
      }
    };
  });

  app.controller('LoginCtrl', function ($scope,Profile,$rootScope, $state, Authentication,$cordovaToast,$ionicHistory) {
    if (Authentication.isLoggedIn()) {
      $state.go('app.home');
    }
    var vm = this;
    vm.doLogin = function (data) {
     if(vm.loginForm.$invalid){
       alert('invalid username or password');
       /*$cordovaToast.showShortTop('invalid username or password!').then(function(success) {
        });*/
       return false;
     }
      $ionicHistory.nextViewOptions({historyRoot:true});
      $rootScope.$broadcast('loading:show');
      Authentication.login(data).then(function (response) {
        console.log(response);
        if (response.data.status) {
          window.localStorage['token'] = response.data.token;
        alert('login successfully');
          $rootScope.$broadcast('loading:hide');
          /*$cordovaToast.showShortTop('login successfully!').then(function(success) {
            $state.go('app.home');
          });*/
          Profile.getProfile().then(function(res){
            if(res.data.profile_data.is_seller==true){
              $ionicHistory.nextViewOptions({historyRoot:true});
              window.localStorage['is_seller'] = 'true';
              $state.go('app.dashboard');
            } else {
              $state.go('app.home');
            }
          });
        }
      },function(){
        alert('login successfully');
        /*$cordovaToast.showShortTop('invalid username or password!').then(function(success) {
        });*/
      });
    }
  });

  app.controller('FaqCtrl', function ($scope) {
    // var vm = this;
      $scope.items = [
        {
        title: 'What is mandigate',
        text: 'It is a commodity marketplace for agricultural produce where farmers/bulk sellers/licensee agents can list their products and buyers (industrialists, wholesale dealers, etc.) can review and place their bulk orders through online portal or mobile app. The unique proposition of this model is direct ordering of the farm fresh items without multiple intermediaries charging their high margins. The buyers have option to order products from different locations from pan India. Also, farmers get vast market to sell their produce. In this model, buyers can expect the quality products as we individually go and verify the commodity before transshipment.We have integrated supply chain for timely delivery and reduction of wastage in transportation of goods.'
      },{
        title: 'How can i update my information?',
        text: 'It is easy to update your MandiGate account and view your orders any time through My Account.'

      },{
        title: 'How i know my order has been confirmed',
        text: 'Once your order has been logged and payment authorization has been received, the seller counter confirms the receipt of the order in part/Full quantity and begins processing it. You will receive an email containing the details of your order when the seller receives it and confirms the same. In this mail you will be provided with a unique Order ID (eg. ODR01202130213), a listing of the item(s) you have ordered and the expected delivery time. You will also be notified when the seller Transships produce(s) to you. Shipping details will be provided with the respective tracking number(s).'
      },{
        title: 'Can I order a product that is Out of Stock',
        text: 'Unfortunately, products listed as Out of Stock are not available for sale. Please use the Notify Me feature to be informed of the products availability with sellers on MandiGate'
      }, {
        title: 'I am a buyer, how do I know my order has been confirmed?',
        text: 'Once your order has been logged, a unique order id (eg. ODR01202130213), is generated. The order then goes to seller for confirmation. Once seller counter confirms the receipt of the order, the order is considered confirmed. After this, we would need payment authorization for further processing.You will also be notified when the seller Transships product to you. Shipping details will be provided with the respective tracking number(s).'
      },{
        title: 'Why do i see different prices for same product?',
        text: 'A product could be listed under different prices. There could be sellers offering you the same produce but at a different price. That is the nature of the MandiGate marketplace, where different sellers compete for your order.'
      },{
        title:'Who can sell on MandiGate?',
        text:'A Farmer/Aggregator selling agriculture product is welcome. In order to start selling, you need to have the following:PAN Card (Personal PAN for business type “Proprietorship” and Personal + Business PAN for business type as “Company”)Bank account and supporting KYC documents (Address Proof, and Cancelled cheque)Minimum 1000 kg of product to sale.To sell on MandiGate:1. Register yourself at MandiGate.com2. Post your product (s) under specific product categories.3. Once a buyer place order for your posting, confirm the order with quantity/Availability. Our Quality inspector will check the product quality & pack the product and mark it as ‘Ready to Dispatch’. Our logistics partner will load the product and deliver it to the Buyer.4. Once an order is successfully dispatched, MandiGate will settle your payment within 7-14 business days.  '
      },{
        title:'Who takes care of the delivery of my produce?',
        text:'Our logistics partner will pick up the product from you and deliver it to the customer. All you need to do is keep it packed and ready for dispatch.'
      },{
        title:'How and when will I get paid?',
        text:'The payment will be made directly to your bank account through NEFT transactions within 7-14 business days of dispatching an order. The actual payment period will vary depending on how long you have been selling at MandiGate, your customer ratings and number of orders fulfilled.'
      },{
        title:'When can I start selling?',
        text:'After all the required documents have been verified and your seller profile is complete, you can start posting your products and start selling.'
      },{
        title:'How do I manage my orders on MandiGate?' ,
        text:'1. Through our seller dashboard, we make it really easy for you to manage your orders. Whenever a buyer places an order, we send you a sms alert. Once an order is received, confirm the order with quantity/Availability. Our Quality inspector will check the product quality & pack the product and mark it as ‘Ready to Dispatch’. Our logistics partner will load the produce and deliver it to the Buyer.'

      }, {
        title:'How do I post my products on MandiGate?',
        text:'We give you a step-by-step process of how to post your product on MnadiGate.com. It is important to choose the suitable category to list your produce as it will help buyer find your product faster. Based on the category you choose you will be asked to include product details such as variety, type, quantity, price, availability etc.'
      },{
        title:'Does MandiGate buy or sell products themselves such as Grain, Fruits or Vegetables or even Machinery?',
        text:'No, MandiGate does not buy or sell any Product. It is an online market place and provide a supply chain Service for the products traded on the platform. MandiGate has a huge database of seller & buyer for Products and Services and we can help you connect with them with ease for your business needs.'
      },{
        title:'How soon will my enquiry be tended to?' ,
        text:'Your enquiry would be tended to within a maximum of 48 Hours.'

      }
      ];

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

  app.controller('ProfileCtrl', function ($scope, Authentication, $state,Profile) {
    var vm = this;
    if(!Authentication.isLoggedIn()){
      $state.go('app.login1');
    }
    Profile.getProfile().then(function(res){
      console.log('msvhv hjs dvchgsvdch c sch sch s');
      if(res.data.status){
        vm.profileData = res.data.profile_data
      }
    },function(){
    });

    vm.updateProfile = function(){
      if(vm.myForm.$invalid){
        alert('Some thing wrong');
        /*$cordovaToast.showShortTop('invalid username or password!').then(function(success) {
         });*/
        return false;
      }

      Profile.updateProfile(vm.profileData).then(function(res){
        console.log(res.data.status);
        if(res.data.status){
          alert('updated successfully');
          $state.go('app.account');
        }

      });
    };


  });

  app.controller('DashboardCtrl', function ($scope,$stateParams,Product,serverConfig) {
    var vm = this;
    vm.baseUrl = serverConfig.baseUrl;
  });

  app.controller('ListSellerItemsCtrl', function ($scope,$stateParams,Product,serverConfig) {
    var vm = this;
    vm.products = [];
    vm.baseUrl = serverConfig.baseUrl;
    vm.dt = {
      "c_type":"category",
      "entity_name":"fruits",
      "page_number":0
    };
    Product.getProduct(vm.dt).then(function(res){
        vm.products = vm.products.concat(res.data.data.all_stocks);
    },function(error){
    });
  });

  app.controller('AddStockCtrl', function ($scope,$stateParams,Product,serverConfig) {
    var vm = this;
    vm.stockData = {};
    vm.products = [];
    vm.baseUrl = serverConfig.baseUrl;


    vm.addStock = function(){
      if(vm.myForm.$invalid){
        /*$cordovaToast.showShortTop('invalid username or password!').then(function(success) {
         });*/
        return false;
      }
      alert('success')
    };


  });
}());
