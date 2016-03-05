angular.module('starter.controllers', ['ionic', 'ngCordova', 'ui.bootstrap', 'LocalStorageModule'])

.controller('GameCtrl', function($scope, Chats, Game, DB, $ionicModal, $ionicPopup, $ionicScrollDelegate, $cordovaLocalNotification, $ionicHistory, localStorageService) {

        //$cordovaLocalNotification.scheduleNotification({});


        DB.set('apiURI', 'http://plaindroiddb.repair-your-iphone.de/api.php');
        Chats.setScope({scopeName: 'gameScope', scope: $scope});

        //console.log(Chats.getScope('gameScope'));

        //Synchronize lokalDB with globalDB
        //Game.synchronizeGlobalDB(true);

        Game.beginGame($scope, $ionicHistory, $ionicPopup);


        $scope.changeStory = function(key, buttonKey, parentID){
            $scope.getChatsFromClickedButton(key, buttonKey, parentID);
        };

        $scope.setTypedInterval = function(data){
            if(data.length == 0){
                alert('Keine Daten hinterlegt.');
                return;
            }

            return;

            if(isButton){
                $('#button_'+id)[0].setAttribute('style', '');


                if(typeof(chats[i]) != 'undefined' && typeof(chats[i].clicked) != 'undefined'){
                    $scope.setActive(id, chats[i].clicked);
                    $scope.output(id, chats[i].clicked == 'left');
                }
                $ionicScrollDelegate.scrollBottom();
                console.log(chats[i]);
                $cordovaLocalNotification.scheduleNotification({text: '['+chats[i].name + ' wartet auf deine Entscheidung!]', title: chats[i-1].text});
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
                        $scope.setTypedInterval(i+1, thisBlock, ids, chats, iID, chat.text, chat.face, chat.className, chat.isButton);
                        i++;
                    }else{return;}
                }, timeOut);
            }else{return;}

        }
    })

.controller('MapCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  $scope.$on('$ionicView.enter', function(e) {
      //TODO: Aktualisiere das Kartenbild der letzten vorhandenen Sequenz
  });


})







.controller('MapDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})








.controller('SettingsCtrl', function($scope, Settings, Chats, $ionicHistory) {
        Chats.setScope({scopeName: 'settingsScope', scope: $scope});

        $scope.settingsList = Settings.getSettingsList();
        $scope.pushNotification = Settings.pushNotification();
        $scope.updateNotification = Settings.updateNotification();
        Settings.pushNotificationChanged($scope); //Event
        Settings.updateNotificationClicked($scope); //Event
        Settings.settingsChanged($scope); //Event
        Settings.viewEntered($scope, $ionicHistory); //Event
        Settings.chapterChanged($scope);
        $scope.chapterList = Settings.getChapterList();
        $scope.data = {chapters: ''};


        //Settings.addChapterListItem($scope, $ionicHistory, { text: "Kapitel 1", value: "nlabla 1" });


})


;
