angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, Chats) {
        $scope.login = function(id, left){
            var aa = Array.prototype.indexOf.call($('#button_'+id)[0].parentNode.childNodes, $('#button_'+id)[0]);

            for(var i=0;i< $('#button_'+id)[0].parentNode.childNodes.length; i++){
                var node = $('#button_'+id)[0].parentNode.childNodes[i];

                if(typeof(node.getAttribute) == 'function'){
                    var attr = node.getAttribute('class');
                    if(i>aa){
                        if(attr != null){
                            if(attr.indexOf('button-bar') == -1){
                                $('#button_'+id)[0].parentNode.removeChild(node);
                            }else{
                                node.setAttribute('style', 'display: none;');
                            }

                        }else{
                            $('#button_'+id)[0].parentNode.removeChild(node);
                        }

                    }
                }

            }

            if(typeof(left) != 'undefined') {

                var buttonDiv = $('#button_'+id)[0];
                if (left) {
                    var className = buttonDiv.childNodes[3].className;
                    className = className.replace('active', '');
                    buttonDiv.childNodes[3].className = className;
                    buttonDiv.childNodes[1].className += " active";

                } else {
                    className = buttonDiv.childNodes[1].className
                    className = className.replace('active', '');
                    buttonDiv.childNodes[1].className = className;
                    buttonDiv.childNodes[3].className += " active";
                }
            }
            var chats = Chats.getData(id, left);
            var ids = Chats.allIDs(id, left);
            this.chats = chats;
            this.ids = ids;

            var list = $('#list_new')[0].outerHTML;
            list = list.replace('id="list_new"', 'id="list_new_'+id+'"');

            var e = document.createElement('div');
            e.innerHTML = list;


            var item = $('#block_new')[0].outerHTML;
            item = item.replace('id="block_new"', 'id="block_new_'+id+'"');
            //item = item.replace('display: none;', '');
            //item = item.replace('chat.face', this.chats[0].face);
            //item = item.replace('chat.lastText', this.chats[0].lastText);
            //item = item.replace('chat.id', this.chats[0].id);


            e.childNodes[0].childNodes[0].innerHTML = item;
            var childNode = e.childNodes[0];
            $('#button_'+id)[0].parentNode.insertBefore(childNode, $('#button_'+id)[0].nextSibling);

            $('#block_new_'+id).waitUntilExists(function(){
                var thisObject = this;
                var i=0;
                setTypedInterval(i, thisObject, ids, chats, chats[0].id, chats[0].lastText, chats[0].face, chats[0].color, false, this);
            });

        };
        $scope.chats = Chats.all();
        $scope.ids = Chats.allIDs();
        var ba = Chats.allButtons();

        $scope.buttons = Chats.allButtons();
        $scope.remove = function(chat) {
            Chats.remove(chat);
        };

        $(document).ready(function(){
            $('#block_new').waitUntilExists(function(){
                var thisObject = this;
                var i = 0;
                setTimeout(function() {
                    setTypedInterval(i, thisObject, $scope.ids, $scope.chats, $scope.chats[0].id, $scope.chats[0].lastText, $scope.chats[0].face, $scope.chats[0].color, false, null);
                    return;
                },1000);
            });
        });



        function setTypedInterval(i, thisBlock, ids, chats, id, lastText, face, color, isButton, afterElem){
            if(isButton){
                $('#button_'+id)[0].setAttribute('style', '');
                return null;
            }

            var bla = thisBlock.outerHTML;
            bla = bla.replace('display: none;', '');
            bla = bla.replace('chat.face', face);
            bla = bla.replace('chat.color', color);
            bla = bla.replace('chat.lastText', lastText);
            bla = bla.replace('chat.id', id);
            bla = bla.replace('block_new', 'block_new_'+id);

            var e = document.createElement('div');
            e.innerHTML = bla;
            var childNode = e.childNodes[0];
            if(face == null){
                childNode.getElementsByTagName('img')[0].parentNode.removeChild(childNode.getElementsByTagName('img')[0]);
            }

            console.log(childNode);
            thisBlock.parentNode.appendChild(childNode);

            setTimeout(function(){
                if(chats.length >= i+1) {
                    var iID= ids[i+1];
                    setTypedInterval(i+1, thisBlock, ids, chats, iID, chats[i+1].lastText, chats[i+1].face, chats[i+1].color, chats[i+1].isButton);
                    i++;
                }else{return;}
            }, 1000);



            /*
                setTimeout(function(){
                    $('#text_'+itemID).typed({
                        strings: [itemText],
                        typeSpeed: 30, // typing speed
                        backDelay: 750, // pause before backspacing
                        loop: false, // loop on or off (true or false)
                        loopCount: false, // number of loops, false = infinite
                        callback: function() {
                            if(chats.length > itemID+1){
                                setTypedInterval(chats, chats[itemID+1].id, chats[itemID+1].lastText);
                            }
                        }
                    });
                }, 1000);
                */
        }
    })

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
