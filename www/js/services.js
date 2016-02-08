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
          firstText: 'Ja ich bins.',
          secondText: 'Nein hier ist niemand.',
          face: 'img/ben.png'
      },
  {
      id: 6,
      lastText: 'Wer bist du?',
      face: 'img/ben.png',
      parent:5,
      left: true
  },

  {
      id: 7,
      lastText: 'Ich will zu dir',
      face: 'img/mike.png',
      parent: 5,
      left: true
  },
  {
      id: 8,
      lastText: 'Wie da ist niemand?',
      face: 'img/mike.png',
      parent: 5,
      right: true
  },
      {
          id: 9,
          lastText: 'Wer spricht dann mit mir?',
          face: 'img/ben.png',
          parent:5,
          right: true
      },

      {
          id: 10 ,
          isButton: true,
          firstText: 'Ahmm.....?',
          secondText: 'Im Ernst?',
          parent:5,
          left: true
      },
      {
          id: 11 ,
          isButton: true,
          firstText: 'Lol?',
          secondText: 'Neee?',
          parent:5,
          right: true
      },
  {
      id: 12,
      lastText: 'Ja genau dich mein ich!',
      face: 'img/ben.png',
      parent:10,
      left: true
  },
  {
      id: 13,
      lastText: 'Dieser Text kommt in beiden Fällen!!! Nur für Ahmm... bzw. Im Ernst?',
      face: 'img/ben.png',
      parent:10
  },

  {
      id: 14,
      lastText: 'Ka was ich sagen soll. Was soll Lol heißen?',
      face: 'img/mike.png',
      parent: 11,
      left: true
  },
      {
          id: 15,
          lastText: 'Ka was ich sagen soll. Was soll Nee heißen?',
          face: 'img/mike.png',
          parent: 11,
          right: true
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
