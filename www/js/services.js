angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 1,
    name: 'Ben Sparrow',
    lastText: 'Hallo?',
    face: 'img/ben.png',
      readed: true
  },
      {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'Ist da jemand?',
    face: 'img/mike.png'
  },
      {
          id: 5 ,
          isButton: true,
          firstText: 'Willst du?',
          secondText: 'Oder nicht?',
          face: 'img/ben.png'
      },
  {
      id: 6,
      lastText: 'Ne bin noch nicht da?',
      face: 'img/ben.png',
      parent:5
  },

  {
      id: 7,
      lastText: 'Ok mom cich komme',
      face: 'img/mike.png',
      parent: 5,
      left: true
  },
  {
      id: 8,
      lastText: 'Ahm ich kommme doch nicht',
      face: 'img/mike.png',
      parent: 5,
      left: false
  },

      {
          id: 9 ,
          isButton: true,
          firstText: 'Uhaaa?',
          secondText: 'Im Ernst?',
          parent:5
      },
  {
      id: 10,
      lastText: 'Was willst du nun sagen...',
      face: 'img/ben.png',
      parent:9
  },

  {
      id: 11,
      lastText: 'Ka was ich sagen will',
      face: 'img/mike.png',
      parent: 9
  },
  ];

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
      allIDs: function(id){
          var ids = [];
          chats.forEach(function(item){
              if(typeof(id) != 'undefined'){
                  if(id == item.parent){
                      ids.push(item.id);
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
                  data.push(item);
              }
          });
          return data;
      }
  };
});
