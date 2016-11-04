(function() {
  var app = angular.module('md_gate');
  app.controller('AppCtrl', function ($scope,$ionicHistory,$ionicPopup,$rootScope, $ionicModal, Authentication, $state,Profile,$cordovaToast, $timeout) {
    $scope.isAuthenticate = function () {
      return Authentication.isLoggedIn();
    };
    if(Authentication.isLoggedIn()){
      Profile.getProfile().then(function(res){
        //$scope.profile = res.data.profile_data;
        $rootScope.profile = res.data.profile_data;
        /*if($scope.profile.is_seller==true){
          $ionicHistory.nextViewOptions({historyRoot:true});
          $state.go('app.dashboard');
        }*/
      });
    }


    $rootScope.$on('logged_in', function (event, args) {
      $ionicHistory.nextViewOptions({historyRoot:true});
      Profile.getProfile().then(function(res){
        $rootScope.profile = res.data.profile_data;
        //$scope.profile = res.data.profile_data;
        if(res.data.profile_data.is_seller==true){
          $ionicHistory.nextViewOptions({historyRoot:true});
          window.localStorage['is_seller'] = 'true';
          $state.go('app.dashboard');
        } else {
          $state.go('app.home');
        }
      });
    });

    $scope.logout = function () {

      $ionicPopup.confirm({
        title: 'Mandigate Logout',
        template: 'Are you sure to logout!'
      }).then(function(res){
        if(res){
          $rootScope.$broadcast('loading:show');
          $timeout(function(){
            if(Authentication.logoutUser()){
              window.localStorage['is_seller'] = undefined;
              //$scope.profile = undefined;
              $rootScope.profile = undefined;
              $rootScope.$broadcast('loading:hide');
              $ionicHistory.nextViewOptions({historyRoot:true});
              $state.go('app.home');
            }
          },3000);
        }
      });

      /*Authentication.logoutUser().then(function(data){
        window.localStorage['token'] = '';
        window.localStorage['is_seller'] = undefined;
            /!*$cordovaToast.showShortTop('Logout successfully').then(function(success) {
            }, function (error) {
            });*!/
        $scope.profile = undefined;
        alert('Logout successfully');
        $state.go('app.home');
      },function(error){
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

  app.controller('HomeCtrl', function ($scope,serverConfig,$http, Authentication, $state,Product) {
    var vm = this;
    vm.baseUrl = serverConfig.baseUrl;


    $scope.searchResult = function(query){
      if(query!=''||query!=undefined){
        $state.go('app.searchResult',{query:query});
      }
    };


    $scope.callbackMethod = function(query){
      if(query.length>1){
        var d =[];
         $http.get(vm.baseUrl+'/web/get/search/?search='+query).then(function(res){
          console.log(JSON.stringify(res.data));
          angular.forEach(res.data.data,function(obj){
            console.log(JSON.stringify(obj));
            var dd = {
              product:obj[1]
            };
            d.push(dd);
          });
          console.log(JSON.stringify(d));
          return d;
        });
      }
    };

    $scope.clickedMethod = function (callback) {
      console.log(callback);
    }



  });

  app.controller('SearchCtrl', function ($scope,$http,$state,$rootScope,Authentication, $stateParams,Product,$ionicModal,serverConfig,$ionicHistory) {
    var vm = this;
    vm.baseUrl = serverConfig.baseUrl;
    var id  = $stateParams.query;
    vm.products = [];
    vm.loading = true;

    $rootScope.$broadcast('loading:show');
    Product.getSearchProduct(id).then(function(res){
      vm.products = res.data;
      vm.loading = false;
      $rootScope.$broadcast('loading:hide');
    },function(error){
      vm.loading = false;
      $rootScope.$broadcast('loading:hide');
    });






  });
  app.controller('CategoryCtrl', function ($scope,$filter,$http,$state,Authentication, $stateParams,Product,$ionicModal,serverConfig,$ionicHistory) {
    var vm = this;
    vm.baseUrl = serverConfig.baseUrl;
    vm.sortBy= 'sort';
    vm.loading = true;
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
    vm.min = 0;
    vm.max = 20;
    vm.loadProduct = function(){
      if(vm.no_stocks){
        $scope.$broadcast('scroll.infiniteScrollComplete');
        return;
      }
      if(vm.products.length>0){
        vm.dt.page_number++;
      }
      vm.loading = true;
      Product.getProduct(vm.dt).then(function(res){
        if(res.data.status&&res.data.data.total_records>0){
          vm.products = vm.products.concat(res.data.data.all_stocks);
          console.log(JSON.stringify(vm.products));
          $scope.$broadcast('scroll.infiniteScrollComplete');
          if(vm.products.length==res.data.data.total_records){
            vm.no_stocks = true;
            vm.loading = false;
          }
        }
      },function(error){
        $scope.$broadcast('scroll.infiniteScrollComplete');
        vm.no_stocks = true;
        vm.loading = false;
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
      if(vm.priceChoice =='A'){
        vm.min = 10;
        vm.max = 20;
      } else if(vm.priceChoice =='B') {
        vm.min = 20;
        vm.max = 40;
      } else if(vm.priceChoice =='C'){
        vm.min = 40;
        vm.max = 5000;
      }

      if(vm.sorting=='lowtohigh'){
        vm.products = $filter('orderBy')(vm.products, 'price');

      } else if(vm.sorting=='hightolow'){
        vm.products = $filter('orderBy')(vm.products, 'price',true);
      }





      vm.closeModal();
    };
    vm.clearFilter = function(){
      vm.min = 0;
      vm.max = 20;
      vm.closeModal();
    };


  });

  app.controller('ProductCtrl', function ($scope,$http,Authentication,Booking,$ionicPopup,$state,$rootScope, $stateParams,Product,serverConfig) {
    var vm = this;
    vm.baseUrl = serverConfig.baseUrl;
    var id  = $stateParams.id;
    if(!Authentication.isLoggedIn()){
      $ionicHistory.nextViewOptions({historyRoot:true});
      $state.go('app.login1');
    }
    vm.product = {};
    $rootScope.$broadcast('loading:show');
    Product.getProductDetails(id).then(function(res){
     console.log(JSON.stringify(res));
      vm.product = res.data;
      getLocationDetails(vm.product.pincode);
      $rootScope.$broadcast('loading:hide');
     },function(err){
      $rootScope.$broadcast('loading:hide');
    });


    vm.deleteStock = function(id){
      var dd = {
        "stock_id":id.toString()
      };
      $rootScope.$broadcast('loading:show');
      Product.deleteProductStock(dd).then(function(res){
        console.log(res);
        $rootScope.$broadcast('loading:hide');
        $ionicPopup.alert({
          title: 'Stock Deleted',
          template: 'Your stock deleted successfully!'
        }).then(function(){
          $state.go('app.listSellerItems');
        });
      },function(err){
        $rootScope.$broadcast('loading:hide');
        $ionicPopup.alert({
          title: 'Stock Deleted',
          template: 'Unable to delete, something wrong!'
        }).then(function(){

        });
      });
    };


    function getLocationDetails(pin){
      Booking.getPincodeLocation(pin).then(function(res){
        vm.location = res.data.location;
      }, function(err){
      })
    }




  });

  app.controller('BookingCtrl', function ($scope,$ionicHistory,serverConfig,$http,$state, $stateParams,$window,Product,Booking,$ionicModal,$ionicPopup,$rootScope) {
    var vm = this;
    var id  = $stateParams.id;
    vm.baseUrl = serverConfig.baseUrl;
    vm.product = {};
    vm.order_id = undefined;
    vm.verified = undefined;
    vm.quantity = undefined;
    vm.quantityError = false;
    vm.address = {};








    vm.profile = $rootScope.profile;
    console.log('profile:' + JSON.stringify(vm.profile));
    $rootScope.$broadcast('loading:show');
    $ionicModal.fromTemplateUrl('templates/getQuantity.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.quantityModal = modal;
    });
    vm.loading = true;

    Booking.verifyOrder(id).then(function(res){
          console.log('verify');
          console.log(JSON.stringify(res));
      if(res.data.bank_verified && res.data.success){
        vm.order_id = res.data.order_id;
        vm.verified = true;
        vm.loading = false;
        $rootScope.$broadcast('loading:hide');
        $scope.quantityModal.show();
      } else {
        $rootScope.$broadcast('loading:hide')
        vm.verified = false;
        vm.loading = false;
      }
    },function(){
      vm.loading = false;
      console.log('verify error');
      $rootScope.$broadcast('loading:hide');
      console.log(res);
    });
    Product.getProductDetails(id).then(function(res){
      console.log(res);
      vm.product = res.data;
      console.log(JSON.stringify(vm.product));
    });



    $ionicModal.fromTemplateUrl('templates/getpincode.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.pincodeModal = modal;
    });

    $scope.showpincodemodal=function(){
      $scope.pincodeModal.show();
    };
    $scope.showquantitymodal=function(){
      $scope.quantityModal.show();
    };


    $scope.getQunatity = function(){
      if(vm.quantity<100 ||vm.quantity==undefined || vm.quantity > vm.product.quantity){
        vm.quantityError=true;
        return false;
      }
      else {
        $scope.quantityModal.hide();
          $scope.pincodeModal.show();
      }
    };

    $scope.backQuantity = function(){
      navigator.app.backHistory();
      //$ionicHistory.goBack();
      $scope.quantityModal.hide();
    };


    $scope.backpincode = function(){
      $scope.pincodeModal.hide();
      $scope.quantityModal.show();
    };


    $scope.getAddress = function(){
      vm.submitted = true;
      if(vm.addressForm.$valid){
        console.log(JSON.stringify(vm.address));
        $scope.pincodeModal.hide();
      } else {
        return false;
      }
    };


    $scope.callbackMethod = function(query){
     if(query.length>2)
       return $http.get(vm.baseUrl+'/web/get/pincodes?search='+query);
    };

    $scope.clickedMethod = function(callback){
      //console.log(JSON.stringify(callback.item.pincode));
      var pincode = callback.item.pincode;
      console.log(pincode);
      Booking.getPincodeLocation(pincode).then(function(res){
        vm.address.location = res.data.location;
      }, function(err){
        //alert('invalid pincode');

        console.log(JSON.stringify(err));
      })
    };

    /*vm.openModal = function() {
      $scope.modal.show();
    };
    vm.closeModal = function() {
      $scope.modal.hide();
    };*/



    vm.placeOrder = function(qn){
      if(qn==undefined||qn==''||qn==0){
        $window.document.getElementById('quantity').focus();
        return false;
      }
      $rootScope.$broadcast('loading:show');
      var dd ={
        "stock_id":id,
        "order_id":vm.order_id,
        "quantity":qn,
        "pincode":vm.address.pincode,
        "address":vm.address.address
      };
      Booking.createOrder(dd).then(function(res){
        //alert('success '+ JSON.stringify(res));
        $ionicHistory.nextViewOptions({historyRoot:true});
        $rootScope.$broadcast('loading:hide');
        $ionicPopup.alert({
          title: 'Order Completed',
          template: 'Your Order has been sent for review we will inform you when your order in confirmed!'
        }).then(function(){
          $state.go('app.orderDetail',{orderId:vm.order_id});
        });
      },function(err){
        //alert('error '+JSON.stringify(err));
        $rootScope.$broadcast('loading:hide');
      });
    }
  });

  app.controller('OrderHistoryCtrl', function ($scope,$rootScope,$state,Booking,Authentication,$filter) {
    var vm = this;
    if(!Authentication.isLoggedIn()){
      $state.go('app.login1');
    }

    vm.selected_status = 'awaiting_confirmation';
    vm.ordersDetail = {};
    vm.loading = true;

    function getOrderHistory(){

      $rootScope.$broadcast('loading:show');
      Booking.getOrderHistory().then(function(res){
        console.log('order history success');
        console.log(JSON.stringify(res));
        $rootScope.$broadcast('loading:hide');
        vm.ordersDetail = res.data.all_orders_listing;
        vm.loading = false;
      },function(err){
        $rootScope.$broadcast('loading:hide');
        vm.loading = false;
      });
    }
    getOrderHistory();


    $scope.sorting = function(ddd){
      if(ddd = 'order_date'){
        vm.ordersDetail = $filter('filter')(vm.ordersDetail, {order_date:ddd}, true);
      } else {
        vm.ordersDetail = $filter('filter')(vm.ordersDetail, {proposed_price:ddd}, true);
      }
    }


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
          //alert('error ');
      });
    }
    getOrderDetails();


    vm.confirmOrder = function(id){
      Booking.confirmOrder(id).then(function(res){
        console.log('order confirmed');
        console.log(JSON.stringify(res));
        getOrderDetails();
      },function(err){
        //alert('error :'+err);
      });
    }
  });

  app.controller('RegisterCtrl', function ($scope,$ionicModal,$ionicPopup,$state,$ionicHistory,$cordovaToast,$rootScope, Authentication) {
    if (Authentication.isLoggedIn()) {
      $state.go('app.home');
    }
    $ionicModal.fromTemplateUrl('templates/otp.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.otpModal = modal;
    });
    var vm = this;
    vm.userData = {};
    vm.userData.user_type = 'Individual';
    vm.pass = true;
    function registration(){
      $ionicHistory.nextViewOptions({historyRoot:true});
      Authentication.registration(vm.userData).then(function (response) {
        console.log(response);
        if (response.data.status) {
          //window.localStorage['token'] = response.data.token;
          vm.submitted = false;
          $cordovaToast.showShortTop('Register successfully!').then(function(success) {
            $scope.otpModal.show();
          }, function (error) {
            console.log(error);
          });
        }
      },function(error){
        //alert('Something Wrong!'+ JSON.stringify(error));


        $ionicPopup.alert({
          title: 'Error',
          template: error.data.msg
        }).then(function(){
        });


        /*$cordovaToast.showShortTop('Something Wrong!').then(function(success) {
        }, function (error) {
          console.log(error);
        });*/
      });
    }

    $scope.skipVerification = function(){
      $scope.otpModal.hide();
      $rootScope.$broadcast('logged_in', { message: 'login successfully' });
    };


    $scope.verifiedOtp = function(otp){
      //vm.userData={};
      var dd = {
        "otp_val":otp,
        "mobile_number":vm.userData.username
      };
      Authentication.verifyOtp(dd).then(function(res){
        if(res.data.status){
          $ionicPopup.alert({
            title: 'Otp Verified',
            template: 'Mobile Number Verified successfully!'
          }).then(function(){
            $scope.otpModal.hide();
            window.localStorage['token'] = res.data.token;
            $rootScope.$broadcast('logged_in', { message: 'login successfully' });
          });
        }
      },function(err){
        $ionicPopup.alert({
          title: 'Failed',
          template: 'Invalid OTP!'
        }).then(function(){
        });
      })
    };



    vm.doSellerRegistration = function () {
      vm.submitted = true;
      if(vm.seller.$invalid){
        return false;
      } else {
        vm.userData.is_seller = true;
        vm.userData.is_buyer = false;
        vm.userData.username = vm.userData.mobile;
        if(vm.userData.user_type=='Individual'){
          vm.userData.is_organization = 0;
        } else {
          vm.userData.is_organization = 1;
          vm.userData.last_name = '';
        }
        registration();
      }
    };

    vm.changepasswordtype = function(checked){

      if(checked){
        vm.pass = false;
      } else {
        vm.pass = true;
      }
    };
    vm.doBuyerRegistration = function () {
      vm.submitted = true;
      if(vm.buyer.$invalid){
        return false;
      } else {
        vm.userData.is_buyer = true;
        vm.userData.is_seller = false;
        vm.userData.username = vm.userData.mobile;
        if(vm.userData.user_type=='Individual'){
          vm.userData.is_organization = 0;
        } else {
          vm.userData.is_organization = 1;
          vm.userData.last_name = '';
        }
        registration();
      }
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
        //alert('Verified successfully');
        $state.go('app.home');
      }else {
        //alert('Otp does not match');
        /*$cordovaToast.showShortTop('Otp does not match !').then(function(success) {
        }, function (error) {
          console.log(error);
        });*/
      }
    };
  });

  app.controller('LoginCtrl', function ($scope,$ionicPopup,$ionicModal,Profile,$rootScope, $state, Authentication,$cordovaToast,$ionicHistory) {
    if (Authentication.isLoggedIn()) {
      $state.go('app.home');
    }

    $ionicModal.fromTemplateUrl('templates/otp.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.otpModal = modal;
    });




    var vm = this;
    vm.submited = false;


    function resendOtp(dd){
      Authentication.sendOtp(dd).then(function(res){
        console.log(JSON.stringify(res));
      },function(err){
        console.log(JSON.stringify(err));
      });
    }



    vm.doLogin = function (data) {
      vm.submited = true;
     if(vm.loginForm.$invalid){
       return false;
     }
      vm.mobile_number = data.username;
      $ionicHistory.nextViewOptions({historyRoot:true});
      $rootScope.$broadcast('loading:show');
      Authentication.login(data).then(function (response) {
        console.log(JSON.stringify(response));
        if (response.data.status) {
          window.localStorage['token'] = response.data.token;
          /*$cordovaToast.showShortTop('login successfully!').then(function(success) {
            $state.go('app.home');
          });*/
          data = {};
          $rootScope.$broadcast('logged_in', { message: 'login successfully' });
          $rootScope.$broadcast('loading:hide');
        }
      },function(error){
        console.log(JSON.stringify(error.data));
        if(error.data.msg=='User phone not verified'){
          $rootScope.$broadcast('loading:hide');
          $scope.otpModal.show();
          var dd = {
            "mobile_number":data.username
          };
          resendOtp(dd);
          data = {};
        } else {
          //alert('else');
          $cordovaToast.showShortTop('invalid username or password!').then(function(success) {
          });
          console.log('error: '+ JSON.stringify(error));
          $rootScope.$broadcast('loading:hide');
        }
      });
    };



    $scope.verifiedOtp = function(otp){
      var dd = {
        "otp_val":otp,
        "mobile_number":vm.mobile_number
      };
      Authentication.verifyOtp(dd).then(function(res){
        console.log(JSON.stringify(res.data));
        if(res.data.status){
          $ionicPopup.alert({
            title: 'Otp Verified',
            template: 'Mobile Number Verified successfully!'
          }).then(function(){
            window.localStorage['token'] = res.data.token;
            $scope.otpModal.hide();
            $rootScope.$broadcast('logged_in', { message: 'login successfully' });
          });
        }
      },function(err){
        $ionicPopup.alert({
          title: 'Failed',
          template: 'Invalid OTP!'
        }).then(function(){
        });
      })
    };



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

  app.controller('ProfileCtrl', function ($scope, Authentication,$cordovaToast, $state,Profile) {
    var vm = this;
    if(!Authentication.isLoggedIn()){
      $state.go('app.login1');
    }
    Profile.getProfile().then(function(res){
      console.log('msvhv hjs dvchgsvdch c sch sch s');
      if(res.data.status){
        vm.profileData = res.data.profile_data
      }
    },function(err){
      console.log('error'+JSON.stringify(err));
    });

    vm.updateProfile = function(){
      if(vm.myForm.$invalid){
        //alert('Some thing wrong');
        $cordovaToast.showShortTop('invalid data!').then(function(success) {
         });
        return false;
      }

      Profile.updateProfile(vm.profileData).then(function(res){
        console.log(res.data.status);
        if(res.data.status){
          //alert('updated successfully');
          $cordovaToast.showShortTop('profile update successfully').then(function(success) {
            $state.go('app.account');
          });
        }

      });
    };


  });

  app.controller('DashboardCtrl', function ($scope,$stateParams,Product,serverConfig) {
    var vm = this;
    vm.baseUrl = serverConfig.baseUrl;
  });

  app.controller('ListSellerItemsCtrl', function ($scope,$stateParams,$rootScope,Product,serverConfig) {
    var vm = this;
    vm.products = [];
    vm.baseUrl = serverConfig.baseUrl;
    $rootScope.$broadcast('loading:show');
    Product.getMyProduct().then(function(res){
        vm.products = vm.products.concat(res.data);
        console.log('sss:'+JSON.stringify(res.data));
        //vm.products = vm.products.concat(res.data.data.all_stocks);
      $rootScope.$broadcast('loading:hide');
    },function(error){
      $rootScope.$broadcast('loading:hide');
    });
  });

  app.controller('AddStockCtrl', function ($scope,$ionicPopup,$rootScope,$state,$stateParams,$cordovaToast,$filter,Product,serverConfig) {
    var vm = this;
    vm.stockData = {};
    vm.products = [];
    vm.baseUrl = serverConfig.baseUrl;
    vm.ddd = {};
    var today=new Date();
    $scope.today = $filter('date')(today, 'yyyy-MM-dd');
    console.log($scope.today);
    vm.getProduct = function (ctype) {
      $rootScope.$broadcast('loading:show');
      Product.getAvailableProduct(ctype).then(function(res){
        vm.products = res.data;
        console.log(JSON.stringify(res.data));
        $rootScope.$broadcast('loading:hide');
      },function(error){
        $rootScope.$broadcast('loading:hide');
        console.log(JSON.stringify(error));
      });
    };

    vm.getGradeProduct = function(id){
      Product.getAvailableGradeProduct(id).then(function(res){
        vm.gradeProduct = res.data[0];
        vm.gradeProductQuality = res.data[1];
        console.log('grade: '+JSON.stringify(res.data[0]));
        console.log('grade quality: '+JSON.stringify(res.data[1]));
        $rootScope.$broadcast('loading:hide');
      },function(error){
        $rootScope.$broadcast('loading:hide');
        console.log(JSON.stringify(error));
      });
    };

    vm.addStock = function(){
      vm.submitted =true;
      if(vm.myForm.$invalid){
        $cordovaToast.showShortTop('invalid data!').then(function(success) {
         });
        return false;
      }

      console.log(JSON.stringify(vm.stockData));
      if(vm.stockData.category=='fruits'){
        vm.ddd = {
          "c_type":vm.stockData.category,
          "fruits_product" : vm.stockData.product,
          "fruits_grade_product": vm.stockData.gradeP,
          "fruits_grade_quality": vm.stockData.gradePQ,
          "fruits_quantity": vm.stockData.quantity,
          "fruits_date_availabilty": $filter('date')(vm.stockData.available_date, 'MM/dd/yyyy'),
          "fruits_pincode":vm.stockData.pincode,
          "fruits_price": vm.stockData.price,
          "fruits_posting_title": vm.stockData.title
        };
      } else if(vm.stockData.category=='grains'){
        vm.ddd = {
          "c_type":vm.stockData.category,
          "grains_product" : vm.stockData.product,
          "grains_grade_product":vm.stockData.gradeP,
          "grains_grade_quality": vm.stockData.gradePQ,
          "grains_quantity": vm.stockData.quantity,
          "grains_date_availabilty": $filter('date')(vm.stockData.available_date, 'MM/dd/yyyy'),
          "grains_pincode": vm.stockData.pincode,
          "grains_price": vm.stockData.price,
          "grains_posting_title": vm.stockData.title
        };
      } else {
        vm.ddd = {
          "c_type":vm.stockData.category,
          "veges_product" : vm.stockData.product,
          "veges_grade_product": vm.stockData.gradeP,
          "veges_grade_quality": vm.stockData.gradePQ,
          "veges_quantity": vm.stockData.quantity,
          "veges_date_availabilty": $filter('date')(vm.stockData.available_date, 'MM/dd/yyyy'),
          "veges_pincode": vm.stockData.pincode,
          "veges_price": vm.stockData.price,
          "veges_posting_title": vm.stockData.title
        };
      }
      console.log('request data: '+JSON.stringify(vm.ddd));
      $rootScope.$broadcast('loading:show');
      Product.addStockProduct(vm.ddd).then(function(res){
        console.log('success:'+JSON.stringify(res));
        $rootScope.$broadcast('loading:hide');
        $ionicPopup.alert({
          title: 'Successfully Posted',
          template: 'Your stock has been successfully posted!'
        }).then(function(){
            $state.go('app.listSellerItems');
        });
      },function(err){
        $rootScope.$broadcast('loading:hide');
        console.log(JSON.stringify(err));
      })







    };
  });

  app.controller('NotificationCtrl', function ($scope,$stateParams,Product,serverConfig) {
      var vm = this;
      vm.baseUrl = serverConfig.baseUrl;
      vm.loading = true;
    vm.getNotification = function(){
          Product.getNotification().then(function(res){
            //console.log('not:'+JSON.stringify(res))
            vm.notification = res.data;
            console.log('not:'+JSON.stringify(vm.notification));
            vm.loading = false;
          },function(err){
            console.log('error:'+JSON.stringify(err))
            vm.loading = false;
          })
      };
      vm.getNotification();
  });


}());
