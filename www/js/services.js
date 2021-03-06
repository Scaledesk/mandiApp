angular.module('md_gate').factory('Authentication', function($http,$q,serverConfig){
  var baseUrl = serverConfig.baseUrl;
  var service = {
    login: login,
    registration: registration,
    isLoggedIn:isLoggedIn,
    logoutUser:logoutUser,
    verifyOtp:verifyOtp,
    sendOtp:sendOtp,
    changePassword:changePassword,
    sendForgotPassworOtp:sendForgotPassworOtp,
    verifyForgotPasswordOtp:verifyForgotPasswordOtp,
    resetPassword:resetPassword,
    contactus:contactus
  };
  return service;


  function contactus(dd){
    return $http({
      method:"POST",
      url:baseUrl+"/api/mob/sendcontactusmail",
      data:dd
    });
  }

  function resetPassword(dd){
    return $http({
      method:"PUT",
      url:baseUrl+"/api/mob/resetpasswordbyotp/",
      data:dd
    });
  }

  function verifyForgotPasswordOtp(dd){
    return $http({
      method:"POST",
      url:baseUrl+"/api/mob/verifyotp/",
      data:dd
    });
  }


  function sendForgotPassworOtp(data){
    return $http({
      method:"POST",
      url:baseUrl+"/api/mob/generateotp/",
      data:data
    });
  }

  function changePassword(data){
    return $http({
      method:"POST",
      url:baseUrl+"/api/change/password/",
      data:data,
      headers:{'Authorization':"Token "+window.localStorage['token'],"Content-Type":"application/json"}
    });
  }

  function sendOtp(data){
    return $http({
      method:"PUT",
      url:baseUrl+"/api/resendotp",
      data:data
    });
  }

  function verifyOtp(data){
    return $http({
      method:"PUT",
      url:baseUrl+"/api/mob/verifyusermobile/",
      data:data
      //headers:{'Authorization':"Token "+window.localStorage['token'],"Content-Type":"application/json"}
    });
  }


  function login(data){
    return $http({
      method:"POST",
      url:baseUrl+"/api/login/user/",
      data:data
    });
  }
  function registration(data){
    return $http({
      method:"POST",
      url:baseUrl+"/api/register/user/",
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
    /*return $http({
      method:"POST",
      url:baseUrl+"/api/logout/user/",
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });*/
    window.localStorage['token'] = '';
    return true;
  }
});

angular.module('md_gate').factory('Product', function($http,$q,serverConfig){
  var baseUrl = serverConfig.baseUrl;
  var service = {
    getProduct: getProduct,
    getMyProduct: getMyProduct,
    getProductDetails:getProductDetails,
    loadStories:loadStories,
    getNotification:getNotification,
    readNotification:readNotification,
    getAvailableProduct:getAvailableProduct,
    getAvailableGradeProduct:getAvailableGradeProduct,
    addStockProduct:addStockProduct,
    editStockProduct:editStockProduct,
    deleteProductStock:deleteProductStock,
    getSearchProduct:getSearchProduct
  };
  return service;

  function editStockProduct(data){
    return $http({
      method:"PUT",
      url:baseUrl+"/api/mob/updatesellerstock/",
      data:data,
      headers:{'Authorization':"Token "+window.localStorage['token'],"Content-Type":"application/json"}
    });
  }


  function readNotification(){
    return $http({
      method:"PUT",
      url:baseUrl+"/api/mob/marknotificationsread/",
      headers:{'Authorization':"Token "+window.localStorage['token'],"Content-Type":"application/json"}
    });
  }

  function getSearchProduct(id){
    return $http({
      method:"GET",
      url:baseUrl+"/api/mob/stocks/?search="+id
    });
  }

  function deleteProductStock(data){
    return $http({
      method:"DELETE",
      url:baseUrl+"/api/mob/deletesellerstock/",
      data:data,
      headers:{'Authorization':"Token "+window.localStorage['token'],"Content-Type":"application/json"}
    });
  }

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



  function addStockProduct(data){
    return $http({
      method:"POST",
      url:baseUrl+"/api/mob/createposting/",
      data:data,
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }

  function getNotification(){
    return $http({
      method:"GET",
      url:baseUrl+"/api/mob/get_all_notifications",
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }

  function getProduct(data){
    return $http({
      method:"POST",
      url:baseUrl+"/api/mob/product/listing",
      data:data,
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }

  function getMyProduct(){
    return $http({
      method:"GET",
      url:baseUrl+"/api/mob/getsellerstocks",
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }

  function getProductDetails(id){
    return $http({
      method:"GET",
      url:baseUrl+"/api/mob/product/details/"+id,
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }

  function getAvailableProduct(ctype){
    return $http({
      method:"GET",
      url:baseUrl+"/api/mob/getproductcategories?c_type="+ctype,
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }

  function getAvailableGradeProduct(id){
    return $http({
      method:"GET",
      url:baseUrl+"/get/products/"+id,
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
    getOrderDetail:getOrderDetail,
    getPincodeLocation:getPincodeLocation,
    confirmOrder:confirmOrder
  };
  return service;

  function confirmOrder(id){
    return $http({
      method:"PUT",
      url:baseUrl+"/api/mob/confirmorder/confirm/"+id,
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }

  function verifyOrder(id){
    return $http({
      method:"GET",
      url:baseUrl+"/api/mob/product/create/verify/"+id,
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }

  function getPincodeLocation(pincode){
    return $http({
      method:"GET",
      url:baseUrl+"/pincode/location/"+pincode
    });
  }

  function createOrder(data){
    return $http({
      method:"POST",
      url:baseUrl+"/api/mob/product/create/request",
      data:data,
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }
  function getOrderHistory(){
    return $http({
      method:"GET",
      url:baseUrl+"/api/mob/product/get/orders",
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }
  function getOrderDetail(id){
    return $http({
      method:"GET",
      url:baseUrl+"/api/get/order/"+id,
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }
});

angular.module('md_gate').factory('Profile', function($http,$q,serverConfig){
  var baseUrl = serverConfig.baseUrl;
  var service = {
    getProfile:getProfile,
    updateProfile:updateProfile
  };
  return service;
  function getProfile(){
    return $http({
      method:"GET",
      url:baseUrl+"/api/get/profile",
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }
  function updateProfile(data){
    return $http({
      method:"POST",
      url:baseUrl+"/api/update/profile",
      data:data,
      headers:{'Authorization':"Token "+window.localStorage['token']}
    });
  }
});
