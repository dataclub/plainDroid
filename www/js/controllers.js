angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, Chats, $ionicModal, $ionicPopup, $ionicScrollDelegate) {
        $scope.active = [];
        $scope.setActive = function(id, button) {
            console.log(id);
            this.active[id] = button;
            this.choosenID = id;
        };
        //checks if button was clicked once and is active after that. that means, that the buttons has one active item
        $scope.existsActiveID = function(id){
            return Object.keys($scope.active).indexOf(id) != -1;
        };
        //checks if button with id and given param for (left or right) is active
        $scope.isActive = function(id, button) {
            return button === $scope.active[id];
        };
        //Event from view in ng-click of button
        $scope.clickedButton = function(id, button){
            if(!this.isActive(id, button) && this.existsActiveID(id)){
                this.showConfirm(id, button);
            }else{
                this.changeStory(id, button);
            }
        };
        //Changing story after clicked button or popup
        $scope.changeStory = function(id, button){
            this.setActive(id, button);
            this.login(id, button == 'left');
        };

        // Confirm popup code
        $scope.showConfirm = function(id, button) {
            var confirmObject = {
                title: 'Warnung',
                template: 'Hiermit wird die Story verändert',
                id: id,
                button: button
            };
            var confirmPopup = $ionicPopup.confirm(confirmObject);
            confirmPopup.then(function(res) {
                if(res) {
                    $scope.changeStory(confirmObject.id, confirmObject.button);
                    console.log('You clicked on "OK" button');
                } else {
                    console.log('You clicked on "Cancel" button');
                }
            });
        };

        /*
        $scope.showModal = function(id, button){
            this.modal.show();
        };

        $ionicModal.fromTemplateUrl('templates/modal.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
        });

        $scope.createContact = function(u) {
            $scope.contacts.push({ name: u.firstName + ' ' + u.lastName });
            $scope.modal.hide();
        };
        */

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
            //item = item.replace('chat.text', this.chats[0].text);
            //item = item.replace('chat.id', this.chats[0].id);


            e.childNodes[0].childNodes[0].innerHTML = item;
            var childNode = e.childNodes[0];
            $('#button_'+id)[0].parentNode.insertBefore(childNode, $('#button_'+id)[0].nextSibling);

            $('#block_new_'+id).waitUntilExists(function(){
                var thisObject = this;
                var i=0;
                setTypedInterval(i, thisObject, ids, chats, chats[0].id, chats[0].text, chats[0].face, chats[0].className, false);
            });

        };
        $scope.chats = Chats.all();
        $scope.ids = Chats.allIDs();

        $scope.buttons = Chats.allButtons();
        $scope.remove = function(chat) {
            Chats.remove(chat);
        };

        $(document).ready(function(){
            $('#block_new').waitUntilExists(function(){
                var thisObject = this;
                var i = 0;
                var timeOut = 1000;
                if(typeof($scope.chats[0].wait) != 'undefined'){
                    timeOut = $scope.chats[0].wait;
                }

                if(typeof($scope.chats[0].readed) != 'undefined' && $scope.chats[0].readed == true){
                    timeOut = 0;
                }

                setTimeout(function() {
                    setTypedInterval(i, thisObject, $scope.ids, $scope.chats, $scope.chats[0].id, $scope.chats[0].text, $scope.chats[0].face, $scope.chats[0].className, false);
                    return;
                },  timeOut);
            });
        });



        function setTypedInterval(i, thisBlock, ids, chats, id, text, face, className, isButton){
            if(isButton){
                $('#button_'+id)[0].setAttribute('style', '');


                if(typeof(chats[i]) != 'undefined' && typeof(chats[i].clicked) != 'undefined'){
                    $scope.setActive(id, chats[i].clicked);
                    $scope.login(id, chats[i].clicked == 'left');
                }
                $ionicScrollDelegate.scrollBottom();
                return null;
            }


            var bla = thisBlock.outerHTML;
            bla = bla.replace('display: none;', '');
            bla = bla.replace('chat.face', face);
            bla = bla.replace('chat.text', text);
            bla = bla.replace('chat.id', id);
            bla = bla.replace('block_new', 'block_new_'+id);

            if(typeof(className) == 'undefined'){
                bla = bla.replace('chat.className', '');
            }else{
                bla = bla.replace('chat.className', className);
            }

            var e = document.createElement('div');
            e.innerHTML = bla;
            var childNode = e.childNodes[0];
            if(face == null){
                childNode.getElementsByTagName('img')[0].parentNode.removeChild(childNode.getElementsByTagName('img')[0]);
            }

            thisBlock.parentNode.appendChild(childNode);
            $ionicScrollDelegate.scrollBottom();

            var chat = chats[i+1];
            if(chats.length >= i+1 && typeof(chat) != 'undefined') {
                var timeOut = 1000;

                if(typeof(chat.wait) != 'undefined'){
                    timeOut = chat.wait;
                }

                if(typeof(chat.readed) != 'undefined' && chat.readed == true){
                    timeOut = 0;
                }

                setTimeout(function(){
                    if(chats.length >= i+1) {
                        var iID= ids[i+1];
                        setTypedInterval(i+1, thisBlock, ids, chats, iID, chat.text, chat.face, chat.className, chat.isButton);
                        i++;
                    }else{return;}
                }, timeOut);
            }else{return;}

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
                                setTypedInterval(chats, chats[itemID+1].id, chats[itemID+1].text);
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
        $scope.settingsList = [
            { text: "Musik", checked: true },
            { text: "Sound", checked: false }
        ];

        $scope.pushNotificationChange = function() {
            console.log('Push Notification Change', $scope.pushNotification.checked);
        };

        $scope.pushNotification = { checked: true };





        var currentStart = 0
        $scope.serverSideList = [
            { text: "Kapitel 1", value: "go" },
            { text: "Kapitel 2", value: "py" },
            { text: "Kapitel 3", value: "rb" },
            { text: "Kapitel 4", value: "jv" }
        ];

        $scope.addServerSideListItem = function(item) {
            for (var i = currentStart; i < currentStart+20; i++) {
                $scope.serverSideList.push(item);
            }

            currentStart += 20;
        }

        $scope.addServerSideListItem();

        $scope.data = {
            serverSide: ''
        };

        $scope.serverSideChange = function(item) {
            console.log("Selected Serverside, text:", item.text, "value:", item.value);
        };
    })


;
