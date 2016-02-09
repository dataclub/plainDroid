angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  return {
    all: function() {
      return chats;
    },
      allButtons: function(){
          var buttons = [];
          chats.forEach(function(item){
              if(item.isButton){
                  buttons.push(item);
              }
          });
          return buttons;
      },
      allIDs: function(id, left){
          var ids = [];
          chats.forEach(function(item){
              if(typeof(id) != 'undefined'){
                  if(id == item.parent){
                      if(typeof(item.left) == 'undefined' && typeof(item.right) == 'undefined' ){
                          ids.push(item.id);
                      }else{
                          if(left){
                              if(typeof(item.left) != 'undefined' && item.left){
                                  ids.push(item.id);
                              }
                          }else{
                              if(typeof(item.right) != 'undefined' && item.right){
                                  ids.push(item.id);
                              }
                          }
                      }
                  }
              }else{
                  ids.push(item.id);
              }

          });
          return ids;
      },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    },
      getData: function(id, left){
          var data = [];
          chats.forEach(function(item){
              if(item.parent == id){
                  if(typeof(item.left) == 'undefined' && typeof(item.right) == 'undefined' ){
                      data.push(item);
                  }else{
                      if(left){
                          if(typeof(item.left) != 'undefined' && item.left){
                              data.push(item);
                          }
                      }else{
                          if(typeof(item.right) != 'undefined' && item.right){
                              data.push(item);
                          }
                      }
                  }
              }
          });
          return data;
      }
  };
});
