angular.module('md_gate').factory('Authentication', function($http,$q){
  var baseUrl = 'http://127.0.0.1:8000/';
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
      window.localStorage['token'] = '';
      return true;
    /*return $http({
      method:"POST",
      url:baseUrl+"api/logout/user/",
      headers:{
        'Authorization':"Token "+window.localStorage['token']
      }
    });*/
  }
});


angular.module('md_gate').factory('Product', function($http,$q){
  var baseUrl = 'http://127.0.0.1:8000/';
  var service = {
    get: get,
    getChildProduct:getChildProduct,
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


  function get(){
    return $http({
      method:"GET",
      url:baseUrl+"api/list/products/"
    });
  }
  function getChildProduct(id){
    return $http({
      method:"GET",
      url:baseUrl+"api/list/child/products/"+id
    });
  }
});
