(function() {
  var app = angular.module('md_gate');
  app.controller('AppCtrl', function ($scope,$filter,$ionicHistory,$ionicPopup,Product,$rootScope, $ionicModal, Authentication, $state,Profile,$cordovaToast, $timeout) {
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
      getNotification();
    }
    $rootScope.unreadNotif = [];
    function getNotification(){
      Product.getNotification().then(function(res){
        $rootScope.notification = res.data;
        angular.forEach($rootScope.notification,function(obj){
              if(obj.fields.notif_read==false){
                $rootScope.unreadNotif.push(obj);
              }
        });
      },function(err){
      })
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
      getNotification();
    });



    $rootScope.$on('profile_updated', function (event, args) {
      Profile.getProfile().then(function(res){
        $rootScope.profile = res.data.profile_data;
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
              window.localStorage['stockData'] = undefined;
              window.localStorage['stockDetails'] = undefined;
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

  app.controller('HomeCtrl', function ($scope,serverConfig,$http, Authentication,$ionicHistory, $state,Product) {
    var vm = this;
    vm.baseUrl = serverConfig.baseUrl;
    var backview = $ionicHistory.backView();
    if(backview!=null){
      if(backview.stateName=='app.orderDetail'){
        $ionicHistory.removeBackView();
      }
    }
    $scope.searchResult = function(query){
      if(query!=''||query!=undefined){
        $state.go('app.searchResult',{query:query});
      }
    };
    $scope.callbackMethod = function(query){
      if(query.length>1){
        var d =[];
         $http.get(vm.baseUrl+'/web/get/search/?search='+query).then(function(res){
          angular.forEach(res.data.data,function(obj){
            var dd = {
              product:obj[1]
            };
            d.push(dd);
          });
          return d;
        });
      }
    };

    $scope.clickedMethod = function (callback) {
    }
  });

  app.controller('SearchCtrl', function ($scope,$http,$state,$rootScope,Authentication, $stateParams,Product,$ionicModal,serverConfig,$ionicHistory) {
    var vm = this;
    if(!Authentication.isLoggedIn()){
      $ionicHistory.nextViewOptions({historyRoot:true});
      $state.go('app.login');
    }

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
      $state.go('app.login');
    }
    var id  = $stateParams.categoryId;
    vm.products = [];
    vm.products1 = [];
    vm.no_stocks = false;
    vm.dt = {
      "c_type":"category",
      "entity_name":id,
      "page_number":0
    };
    vm.min = 0;
    vm.max = 5000;
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
          vm.products1 = vm.products1.concat(res.data.data.all_stocks);
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
      vm.max = 5000;
      vm.sorting = '';
      vm.priceChoice = '';
      vm.sortBy= 'sort';
      vm.products = vm.products1;
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
      vm.product = res.data;
      //getLocationDetails(vm.product.pincode);
      $rootScope.$broadcast('loading:hide');
     },function(err){
      $rootScope.$broadcast('loading:hide');
    });


    vm.deleteStock = function(id){
      var dd = {
        "stock_id":id.toString()
      };

      var confirmPopup = $ionicPopup.confirm({
        title: 'Delete Stock',
        template: 'Are you sure you want to delete this stock?'
      });
      confirmPopup.then(function(res) {
        if(res) {
          vm.deleteStockDetails(dd);
        } else {
        }
      });
    };


    vm.deleteStockDetails  = function(dd){
      $rootScope.$broadcast('loading:show');
      Product.deleteProductStock(dd).then(function(res){
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

  app.controller('GetPincodeCtrl', function ($scope,$ionicHistory,serverConfig,$http,$state, $stateParams,$window,Product,Booking,$ionicModal,$ionicPopup,$rootScope) {
    var vm = this;
    var id  = $stateParams.id;
    vm.baseUrl = serverConfig.baseUrl;
    vm.product = {};
    if(window.localStorage['address']!="undefined" && window.localStorage['address']!=undefined && window.localStorage['address']!=""){
      vm.address = angular.fromJson(window.localStorage['address']);
    } else {
      vm.address = {};
    }
    if(window.localStorage['quantity']!='undefined' && window.localStorage['quantity']!='' && window.localStorage['quantity']!=undefined){
      vm.quantity = window.localStorage['quantity'];
    } else {
      vm.quantity = undefined;
    }
    vm.loading = true;
    $rootScope.$broadcast('loading:show');
    Product.getProductDetails(id).then(function(res){
      vm.product = res.data;
      $rootScope.$broadcast('loading:hide');
    }, function(){
      $rootScope.$broadcast('loading:hide');
    });

    vm.getAddress = function(){
      vm.submitted = true;
      if(vm.addressForm.$valid){
        window.localStorage['address'] = angular.toJson(vm.address);
        //$scope.pincodeModal.hide();
        $state.go('app.orp',{id:id});
      } else {
        return false;
      }
    };
    $scope.callbackMethod = function(query){
      if(query.length>2)
        return $http.get(vm.baseUrl+'/web/get/pincodes?search='+query);
    };
    $scope.clickedMethod = function(callback){
      var pincode = callback.item.pincode;
      Booking.getPincodeLocation(pincode).then(function(res){
        vm.address.location = res.data.location;
      }, function(err){
        //alert('invalid pincode');
      })
    };
  });

  app.controller('GetQuantityCtrl', function ($scope,$ionicHistory,serverConfig,$http,$state, $stateParams,$window,Product,Booking,$ionicModal,$ionicPopup,$rootScope) {
    var vm = this;
    var id  = $stateParams.id;
    vm.baseUrl = serverConfig.baseUrl;
    vm.product = {};
    if(window.localStorage['quantity']!=''||window.localStorage['quantity']!=undefined){
      vm.quantity = window.localStorage['quantity'];
    } else {
      vm.quantity = undefined;
    }
    vm.loading = true;
    $rootScope.$broadcast('loading:show');
    Product.getProductDetails(id).then(function(res){
      vm.product = res.data;
      $rootScope.$broadcast('loading:hide');
    }, function(){
      $rootScope.$broadcast('loading:hide');
    });
    vm.getQunatity = function(){
      vm.submited = true;
      if(vm.quantityForm.$invalid){
        return false;
      } else {
        window.localStorage['quantity'] = vm.quantity;
        $state.go('app.getPincode',{id:id});
      }
    };
  });


    app.controller('BookingCtrl', function ($scope,$ionicHistory,serverConfig,$http,$state, $stateParams,$window,Product,Booking,$ionicModal,$ionicPopup,$rootScope) {
    var vm = this;
    var id  = $stateParams.id;
    vm.baseUrl = serverConfig.baseUrl;
    vm.product = {};
    vm.order_id = undefined;
    vm.verified = undefined;
    vm.quantity = window.localStorage['quantity'];
    vm.quantityError = false;
    vm.address = angular.fromJson(window.localStorage['address']);
    vm.profile = $rootScope.profile;
    $rootScope.$broadcast('loading:show');
    /*$ionicModal.fromTemplateUrl('templates/getQuantity.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.quantityModal = modal;
    });*/
    vm.loading = true;
    Booking.verifyOrder(id).then(function(res){
      if(res.data.bank_verified && res.data.success){
        vm.order_id = res.data.order_id;
        vm.verified = true;
        vm.loading = false;
        $rootScope.$broadcast('loading:hide');
      } else {
        $rootScope.$broadcast('loading:hide')
        vm.verified = false;
        vm.loading = false;
      }
    },function(){
      vm.loading = false;
      $rootScope.$broadcast('loading:hide');
    });




    Product.getProductDetails(id).then(function(res){
      vm.product = res.data;
      //vm.loading = false;
      $rootScope.$broadcast('loading:hide');
    },function(){
      //vm.loading = false;
      $rootScope.$broadcast('loading:hide');
    });



/*
    $ionicModal.fromTemplateUrl('templates/getpincode.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.pincodeModal = modal;
    });
*/

    /*$scope.showpincodemodal=function(){
      $scope.pincodeModal.show();
    };
    $scope.showquantitymodal=function(){
      $scope.quantityModal.show();
    };*/


    /*$scope.getQunatity = function(){
      if(vm.quantity<100 ||vm.quantity==undefined || vm.quantity > vm.product.quantity){
        vm.quantityError=true;
        return false;
      }
      else {
        $scope.quantityModal.hide();
          $scope.pincodeModal.show();
      }
    };*/

    /*$scope.backQuantity = function(){
      navigator.app.backHistory();
      //$ionicHistory.goBack();
      $scope.quantityModal.hide();
    };


    $scope.backpincode = function(){
      $scope.pincodeModal.hide();
      $scope.quantityModal.show();
    };*/


   /* $scope.getAddress = function(){
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
*/
    /*vm.openModal = function() {
      $scope.modal.show();
    };
    vm.closeModal = function() {
      $scope.modal.hide();
    };*/
      $scope.redirectPincode = function(){
        $state.go('app.getPincode',{id:id});
      };
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
          template: 'Your Order has been sent for review. We will inform you when your order is confirmed !'
        }).then(function(){
          window.localStorage['address'] = undefined;
          window.localStorage['quantity'] = undefined;
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

    vm.selected_status = 'all';
    vm.ordersDetail = {};
    vm.ordersDetails = [];
    vm.loading = true;

    function getOrderHistory(){
      $rootScope.$broadcast('loading:show');
      Booking.getOrderHistory().then(function(res){
        vm.ordersDetail = res.data.all_orders_listing;
        angular.forEach(vm.ordersDetail,function(obj){
          angular.forEach(obj,function(obj){
            vm.ordersDetails.push(obj);
          })
        });
        $rootScope.$broadcast('loading:hide');
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
        vm.ordersDetail = res.data;
      },function(err){
          //alert('error ');
      });
    }
    getOrderDetails();
    vm.confirmOrder = function(id){
      Booking.confirmOrder(id).then(function(res){
        getOrderDetails();
      },function(err){
        //alert('error :'+err);
      });
    }

    vm.redirectHome = function(){
      $state.go('app.home');
    }


  });

  app.controller('RegisterCtrl', function ($scope,$ionicModal,$ionicPopup,$state,$ionicHistory,$cordovaToast,$rootScope, Authentication) {
    if (Authentication.isLoggedIn()) {
      $state.go('app.home');
    }
    $scope.sendingOtp = false;
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
      $rootScope.$broadcast('loading:show');
      Authentication.registration(vm.userData).then(function (response) {

        $rootScope.$broadcast('loading:hide');
        if (response.data.status) {
          //window.localStorage['token'] = response.data.token;
          vm.submitted = false;
          $cordovaToast.showShortTop('Enter OTP to verfiy Mobile Number!').then(function(success) {
            $scope.otpModal.show();
          }, function (error) {
          });
        }
      },function(error){
        //alert('Something Wrong!'+ JSON.stringify(error));

        $rootScope.$broadcast('loading:hide');
        $ionicPopup.alert({
          title: 'Error',
          template: error.data.msg.replace('username','mobile number')
        }).then(function(){
        });


        /*$cordovaToast.showShortTop('Something Wrong!').then(function(success) {
        }, function (error) {
          console.log(error);
        });*/
      });
    }

   /* $scope.skipVerification = function(){
      $scope.otpModal.hide();
      $rootScope.$broadcast('logged_in', { message: 'login successfully' });
    };*/


    $scope.verifiedOtp = function(otp){
      //vm.userData={};
      var dd = {
        "otp_val":otp,
        "mobile_number":vm.userData.username
      };
      $rootScope.$broadcast('loading:show');
      Authentication.verifyOtp(dd).then(function(res){
        $rootScope.$broadcast('loading:hide');
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
        $rootScope.$broadcast('loading:hide');
        $ionicPopup.alert({
          title: 'Failed',
          template: 'Invalid OTP!'
        }).then(function(){
        });
      })
    };

    $scope.resendOtpButton = function(){
      var dd = {
        "mobile_number":vm.userData.username
      };
      $scope.sendingOtp = true;
      $rootScope.$broadcast('loading:show');
      Authentication.sendOtp(dd).then(function(res){
        $rootScope.$broadcast('loading:hide');
        $scope.sendingOtp = false;
      },function(err){
        $rootScope.$broadcast('loading:hide');
        $scope.sendingOtp = false;
      });
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

/*
  app.controller('OtpCtrl', function ($scope,$state,$ionicHistory,$cordovaToast, Authentication) {
    var vm = this;
    vm.checkOtp = function(num){
      if(num==12345){
        $ionicHistory.nextViewOptions({historyRoot:true});
        /!*$cordovaToast.showShortTop('Verified Successfully !').then(function(success) {
          $state.go('app.home');
        }, function (error) {
          console.log(error);
        });*!/
        //alert('Verified successfully');
        $state.go('app.home');
      }else {
        //alert('Otp does not match');
        /!*$cordovaToast.showShortTop('Otp does not match !').then(function(success) {
        }, function (error) {
          console.log(error);
        });*!/
      }
    };
  });
*/

  app.controller('LoginCtrl', function ($scope,$ionicPopup,$ionicModal,Profile,$rootScope, $state, Authentication,$cordovaToast,$ionicHistory) {
    if (Authentication.isLoggedIn()) {
      $state.go('app.home');
    }
    $scope.sendingOtp = false;
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
      $scope.sendingOtp = true;
      Authentication.sendOtp(dd).then(function(res){
        $scope.sendingOtp = false;
      },function(err){
        $scope.sendingOtp = false;
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


    $scope.resendOtpButton = function(){
      var dd = {
        "mobile_number":vm.mobile_number
      };
      resendOtp(dd);
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

  app.controller('ProfileCtrl', function ($scope, Authentication,$rootScope,$cordovaToast, $state,Profile) {
    var vm = this;
    if(!Authentication.isLoggedIn()){
      $state.go('app.login');
    }
    vm.loading = true;
    $rootScope.$broadcast('loading:show');
    Profile.getProfile().then(function(res){
      if(res.data.status){
        vm.profileData = res.data.profile_data;
        var email = vm.profileData.email;
        var dd =  email.split("@");
        if(dd[1]=='mandigate.com'){
          vm.profileData.email = '';
        }
      }
      vm.loading = false;
      $rootScope.$broadcast('loading:hide');
    },function(err){
      vm.loading = false;
      $rootScope.$broadcast('loading:hide');
    });


    vm.updateProfile = function(){
      if(vm.myForm.$invalid){
        $cordovaToast.showShortTop('invalid data!').then(function(success) {
         });
        return false;
      }
      $rootScope.$broadcast('loading:show');
      Profile.updateProfile(vm.profileData).then(function(res){
        if(res.data.status){
          //alert('updated successfully');
          $cordovaToast.showShortTop('profile update successfully').then(function(success) {
            $rootScope.$broadcast('profile_updated', { message: 'login successfully' });
            $state.go('app.account');
          });
        }
        $rootScope.$broadcast('loading:hide');
      },function(err){
        $rootScope.$broadcast('loading:hide');
      });
    };


  });

  app.controller('DashboardCtrl', function ($scope,$stateParams,Product,serverConfig) {
    var vm = this;
    vm.baseUrl = serverConfig.baseUrl;
  });

  app.controller('ListSellerItemsCtrl', function ($scope,$ionicHistory,$stateParams,$rootScope,Product,serverConfig) {
    var vm = this;
    vm.products = [];
    vm.baseUrl = serverConfig.baseUrl;
    var backview = $ionicHistory.backView();
    if(backview!=null){
      if(backview.stateName!='app.dashboard'){
        $ionicHistory.removeBackView();
      }
    }
    $rootScope.$broadcast('loading:show');
    vm.loading = true;
    Product.getMyProduct().then(function(res){
        vm.products = vm.products.concat(res.data.data);
        //console.log('sss:'+JSON.stringify(res.data.data));
        //vm.products = vm.products.concat(res.data.data.all_stocks);
      vm.loading = false;
      $rootScope.$broadcast('loading:hide');
    },function(error){
      vm.loading = false;
      $rootScope.$broadcast('loading:hide');
    });
  });

  app.controller('EditStockCtrl', function ($scope,$ionicPopup,$rootScope,$ionicHistory,$state,$stateParams,$cordovaToast,$filter,Product,serverConfig) {
    var vm = this;
    var id  = $stateParams.id;
    vm.stockData = {};
    vm.baseUrl = serverConfig.baseUrl;
    var today=new Date();
    $scope.today = $filter('date')(today, 'yyyy-MM-dd');

    $rootScope.$broadcast('loading:show');
    Product.getProductDetails(id).then(function(res){
      vm.product = res.data;
      vm.stockData = {
        "stock_id":vm.product.pk,
        "quantity":vm.product.quantity,
        "available_till":new Date(vm.product.available_till),
        "pincode":vm.product.pincode,
        "price":vm.product.price,
        "post_title":vm.product.post_title
      };
      $rootScope.$broadcast('loading:hide');
    },function(err){
      $rootScope.$broadcast('loading:hide');
    });


    vm.editStock = function(){
      vm. submitted = true;
      if(vm.editStockForm.$invalid){
        $cordovaToast.showShortTop('invalid data!').then(function(success) {
        });
        return false;
      }
      $rootScope.$broadcast('loading:show');
      vm.stockData.available_till =$filter('date')(vm.stockData.available_till, 'MM/dd/yyyy');
        Product.editStockProduct(vm.stockData).then(function(res){
          $rootScope.$broadcast('loading:hide');
          $ionicPopup.alert({
            title: 'Successfully Posted',
            template: 'Your stock has been edited successfully!'
          }).then(function(){
            $ionicHistory.removeBackView();
            $state.go('app.listSellerItems');
          });
        },function(err){
          $rootScope.$broadcast('loading:hide');
        })
    };


  });

  app.controller('ReviewStockCtrl', function ($scope,$ionicPopup,$rootScope,$state,$stateParams,$cordovaToast,$filter,Product,$ionicHistory,serverConfig) {
    var vm = this;
    vm.stockData = angular.fromJson(window.localStorage['stockData']);
    vm.ddd = angular.fromJson(window.localStorage['stockDetails']);
    vm.postStock = function(){
      $rootScope.$broadcast('loading:show');
      Product.addStockProduct(vm.ddd).then(function(res){
       $rootScope.$broadcast('loading:hide');
       $ionicPopup.alert({
       title: 'Successfully Posted',
       template: 'Your stock has been successfully posted!'
       }).then(function(){
         window.localStorage['stockData'] = undefined;
         window.localStorage['stockDetails'] = undefined;
         $ionicHistory.removeBackView();
         $state.go('app.listSellerItems');
       });
       },function(err){
       $rootScope.$broadcast('loading:hide');
       })
    };

  });

  app.controller('AddStockCtrl', function ($scope,$ionicPopup,$rootScope,$state,$stateParams,$cordovaToast,$filter,Product,serverConfig) {
    var vm = this;

    vm.stockData = {};
    vm.getProduct = function (ctype) {
      $rootScope.$broadcast('loading:show');
      Product.getAvailableProduct(ctype).then(function(res){
        vm.products = res.data;
        $rootScope.$broadcast('loading:hide');
      },function(error){
        $rootScope.$broadcast('loading:hide');
      });
    };

    vm.getGradeProduct = function(id){
      var d = angular.fromJson(id);
      Product.getAvailableGradeProduct(d.pk).then(function(res){
        vm.gradeProduct = res.data[0];
        vm.gradeProductQuality = res.data[1];
        $rootScope.$broadcast('loading:hide');
      },function(error){
        $rootScope.$broadcast('loading:hide');
      });
    };

    if(window.localStorage['stockData']!=''&&window.localStorage['stockData']!=undefined&&window.localStorage['stockData']!='undefined'){
      vm.stockData = angular.fromJson(window.localStorage['stockData']);
      vm.getGradeProduct(vm.stockData.product);
      vm.getProduct(vm.stockData.category);
      vm.stockData.product = angular.toJson(vm.stockData.product);
      vm.stockData.gradeP = angular.toJson(vm.stockData.gradeP);
      vm.stockData.gradePQ = angular.toJson(vm.stockData.gradePQ);
      vm.stockData.available_date = new Date(vm.stockData.available_date);
    }


    vm.products = [];
    vm.baseUrl = serverConfig.baseUrl;
    vm.ddd = {};
    var today=new Date();
    $scope.today = $filter('date')(today, 'yyyy-MM-dd');
    vm.getGradeProduct = function(id){
      var d = angular.fromJson(id);
      //console.log(id);
      Product.getAvailableGradeProduct(d.pk).then(function(res){
        vm.gradeProduct = res.data[0];
        vm.gradeProductQuality = res.data[1];
        $rootScope.$broadcast('loading:hide');
      },function(error){
        $rootScope.$broadcast('loading:hide');
      });
    };


    vm.addStock = function(){
      vm.submitted =true;
      if(vm.myForm.$invalid){
        $cordovaToast.showShortTop('invalid data!').then(function(success) {
         });
        return false;
      }
      vm.stockData.product = angular.fromJson(vm.stockData.product);
      vm.stockData.gradeP = angular.fromJson(vm.stockData.gradeP);
      vm.stockData.gradePQ = angular.fromJson(vm.stockData.gradePQ);
      if(vm.stockData.category=='fruits'){
        vm.ddd = {
          "c_type":vm.stockData.category,
          "fruits_product" : vm.stockData.product.pk,
          "fruits_grade_product": vm.stockData.gradeP[0],
          "fruits_grade_quality": vm.stockData.gradePQ[0],
          "fruits_quantity": vm.stockData.quantity,
          "fruits_date_availabilty": $filter('date')(vm.stockData.available_date, 'MM/dd/yyyy'),
          "fruits_pincode":vm.stockData.pincode,
          "fruits_price": vm.stockData.price,
          "fruits_posting_title": vm.stockData.title
        };
      } else if(vm.stockData.category=='grains'){
        vm.ddd = {
          "c_type":vm.stockData.category,
          "grains_product" : vm.stockData.product.pk,
          "grains_grade_product":vm.stockData.gradeP[0],
          "grains_grade_quality": vm.stockData.gradePQ[0],
          "grains_quantity": vm.stockData.quantity,
          "grains_date_availabilty": $filter('date')(vm.stockData.available_date, 'MM/dd/yyyy'),
          "grains_pincode": vm.stockData.pincode,
          "grains_price": vm.stockData.price,
          "grains_posting_title": vm.stockData.title
        };
      } else {
        vm.ddd = {
          "c_type":vm.stockData.category,
          "veges_product" : vm.stockData.product.pk,
          "veges_grade_product": vm.stockData.gradeP[0],
          "veges_grade_quality": vm.stockData.gradePQ[0],
          "veges_quantity": vm.stockData.quantity,
          "veges_date_availabilty": $filter('date')(vm.stockData.available_date, 'MM/dd/yyyy'),
          "veges_pincode": vm.stockData.pincode,
          "veges_price": vm.stockData.price,
          "veges_posting_title": vm.stockData.title
        };
      }
      window.localStorage['stockDetails']=angular.toJson(vm.ddd);
      window.localStorage['stockData']=angular.toJson(vm.stockData);
      $state.go('app.reviewStock');
    };
  });

  app.controller('NotificationCtrl', function ($scope,$rootScope,$stateParams,Product,serverConfig) {
      var vm = this;
      vm.baseUrl = serverConfig.baseUrl;
      vm.loading = true;
    vm.getNotification = function(){
          $rootScope.$broadcast('loading:show');
          Product.getNotification().then(function(res){
            //console.log('not:'+JSON.stringify(res))
            vm.notification = res.data;
            vm.unread = [];
            angular.forEach(vm.notification,function(obj){
              if(obj.fields.notif_read==false){
                vm.unread.push(obj);
              }
            });
            $rootScope.unreadNotif = vm.unread;
            $rootScope.$broadcast('loading:hide');
            vm.loading = false;
          },function(err){
            $rootScope.$broadcast('loading:hide');
            vm.loading = false;
          })
      };
    vm.readNotification = function(){
      Product.readNotification().then(function(res){
        $rootScope.unreadNotif = [];
      },function(err){
      })
    };
      vm.getNotification();
      vm.readNotification();
  });

  app.controller('ChangePasswordCtrl', function ($scope,$rootScope,$state,$ionicPopup,$stateParams,Authentication,serverConfig) {
      var vm = this;
    vm.passData = {};
      vm.changePassword = function(){
        vm.submitted = true;
        if(vm.myForm.$valid){
          $rootScope.$broadcast('loading:show');
          Authentication.changePassword(vm.passData).then(function(res){
            $rootScope.$broadcast('loading:hide');
            $ionicPopup.alert({
              title: 'Password Changed',
              template: 'Your password changed successfully!'
            }).then(function(){
              vm.passData = {};
              vm.submitted = false;
              $state.go('app.account');
            });
          },function(err){
            $rootScope.$broadcast('loading:hide');
            alert(JSON.stringify(err));
          });
        } else {
          return false;
        }
    }
  });

  app.controller('ForgotPasswordCtrl', function ($scope,$rootScope,$state,$ionicPopup,$stateParams,Authentication,serverConfig) {
      var vm = this;
    vm.dd = {};
    vm.sentOtp = function(){
      if(vm.fpForm.$valid){
        $rootScope.$broadcast('loading:show');
        Authentication.sendForgotPassworOtp(vm.dd).then(function(res){
          if(res.data.status){
            $rootScope.$broadcast('loading:hide');
            $state.go('app.forgetVerify',{mobile:vm.dd.mobile_number});
          }
        },function(err){
          $rootScope.$broadcast('loading:hide');
        });

      } else {
        return false;
      }
    };

  });
  app.controller('ForgotPasswordVerifyCtrl', function ($scope,$rootScope,$state,$ionicPopup,$stateParams,Authentication,serverConfig) {
    var vm = this;
    vm.dd = {};
    var mobile = $stateParams.mobile;
    vm.verifyOtp = function() {
      vm.dd.mobile_number = mobile;
      $rootScope.$broadcast('loading:show');
      Authentication.verifyForgotPasswordOtp(vm.dd).then(function (res) {
        if(res.data.status){
          $rootScope.$broadcast('loading:hide');
          $state.go('app.reset',{mobile:mobile,otp:vm.dd.otp_value});
        }
      }, function (err) {
        $rootScope.$broadcast('loading:hide');
        $ionicPopup.alert({
          title: 'Verify OTP',
          template: 'OTP does not match!'
        }).then(function(){
        });
      });
    }

  });



  app.controller('PasswordResetCtrl', function ($scope,$rootScope,$state,$ionicPopup,$ionicHistory,$stateParams,Authentication,serverConfig) {
      var vm = this;
      vm.dd = {
        mobile_number:$stateParams.mobile,
        otp_value:$stateParams.otp
      };
      vm.resetPassword = function () {
        vm.submited = true;
        if(vm.myForm.$valid){
          $rootScope.$broadcast('loading:show');
          Authentication.resetPassword(vm.dd).then(function(res){
            if(res.data.status){
              $rootScope.$broadcast('loading:hide');
              $ionicPopup.alert({
                title: 'Password Reste',
                template: 'Password successfully reset!'
              }).then(function(){
                $ionicHistory.nextViewOptions({historyRoot:true});
                $state.go('app.login');
              });
            }
          },function(err){
            $rootScope.$broadcast('loading:hide');
          });
        } else {
          return false;
        }
      }

  });

  app.controller('ContactUsCtrl', function ($scope,$rootScope,$state,$ionicPopup,$ionicHistory,$stateParams,Authentication,serverConfig) {
      var vm = this;
      vm.dd = {};
      vm.contactus = function () {
        vm.submited = true;
        if(vm.myForm.$valid){
          $rootScope.$broadcast('loading:show');
          vm.dd.phone = vm.dd.phone.toString();
          Authentication.contactus(vm.dd).then(function(res){
            if(res.data.status){
              $ionicPopup.alert({
                title: 'Contact Us',
                template: 'Thank you for contacting us. We will contact you soon!'
              }).then(function(){
                $ionicHistory.nextViewOptions({historyRoot:true});
                $state.go('app.aboutUs');
              });
            }
            $rootScope.$broadcast('loading:hide');
          }, function(err){
            $rootScope.$broadcast('loading:hide');
          })
        } else {
          return false;
        }
      }
  });
}());
