angular.module('md_gate').factory('Authentication', function($http,$q){
  var service = {
    login: login,
    registration: registration,
    isLoggedIn:isLoggedIn,
    logout:logout
  };
  return service;

  function login(data){
    return $http({
      method:"POST",
      url:"http://localhost:8000/api/login/user/",
      data:data
    });
  }
  function registration(data){
    return $http({
      method:"POST",
      url:"http://localhost:8000/api/register/user/",
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
  function logout(){
    return $http({
      method:"POST",
      url:"http://localhost:8000/api/logout/user/",
      headers:{
        'Authorization':"Token "+window.localStorage['token']
      }
    });
  }
});


angular.module('md_gate').factory('Product', function($http,$q){
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
      url:"http://localhost:8000/api/list/products/"
    });
  }
  function getChildProduct(id){
    return $http({
      method:"GET",
      url:"http://localhost:8000/api/list/child/products/"+id
    });
  }
});

angular.module('md_gate').factory('User', function($http){
  //$http.defaults.headers.common.Authorization = 'Token ' + window.localStorage['token'];
 var token = window.localStorage['token'];
  var userServices = {
    logout:logout
  };
  return userServices;
  function logout(){
    window.localStorage['token'] = '';
    return true;
    /*return $http({
      method:"POST",
      url:"http://localhost:8000/api/logout/user/",
      headers: {
        "Authorization": 'Token '+token
      }
    });*/
  }

});
