angular.module('md_gate').factory('Authentication', function($http,$q,serverConfig){
  var baseUrl = serverConfig.baseUrl;
  var service = {
    login: login,
    registration: registration,
    isLoggedIn:isLoggedIn,
    logoutUser:logoutUser
  };
  return service;

  function login(data){
    return $http({
      method:"POST",
      url:baseUrl+"api/login/user/",
      data:data
    });
  }
  function registration(data){
    return $http({
      method:"POST",
      url:baseUrl+"api/register/user/",
      data:data
    });
  }
  function isLoggedIn(){
    if(window.localStorage['token']==''|| window.localStorage['token']==undefined){
      return false;
    } else {
      return true;
    }
  }
  function logoutUser(){
    return $http({
      method:"POST",
      url:baseUrl+"api/logout/user/",
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }
});


angular.module('md_gate').factory('Product', function($http,$q,serverConfig){
  var baseUrl = serverConfig.baseUrl;
  var service = {
    getProduct: getProduct,
    getProductDetails:getProductDetails,
    loadStories:loadStories
  };
  return service;


  function loadStories(params, callback){
    $http.get('https://www.reddit.com/r/android/new/.json', {params: params})
      .success(function(response){
        var products = [];
        angular.forEach(response.data.children, function(child){
          products.push(child.data);
        });
        callback(products);
      });
  }


  function getProduct(data){
    return $http({
      method:"POST",
      url:baseUrl+"api/mob/product/listing",
      data:data,
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }
  function getProductDetails(id){
    return $http({
      method:"GET",
      url:baseUrl+"api/mob/product/details/"+id,
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }
});


angular.module('md_gate').factory('Booking', function($http,$q,serverConfig){
  var baseUrl = serverConfig.baseUrl;
  var service = {
    verifyOrder: verifyOrder,
    createOrder:createOrder,
    getOrderHistory:getOrderHistory,
    getOrderDetail:getOrderDetail
  };
  return service;
  function verifyOrder(id){
    return $http({
      method:"GET",
      url:baseUrl+"api/mob/product/create/verify/"+id,
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }
  function createOrder(data){
    return $http({
      method:"POST",
      url:baseUrl+"api/mob/product/create/request",
      data:data,
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }
  function getOrderHistory(){
    return $http({
      method:"GET",
      url:baseUrl+"api/mob/product/get/orders",
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }
  function getOrderDetail(id){
    return $http({
      method:"GET",
      url:baseUrl+"api/mob/product/get/orders/"+id,
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }
});
