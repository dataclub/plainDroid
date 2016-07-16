angular.module('starter.gameController', ['ionic', 'ngCordova', 'ui.bootstrap'])

    .controller('GameCtrl', function ($scope, Chats, Game, DB, $ionicModal, $ionicPopup, $ionicScrollDelegate, $cordovaLocalNotification, $ionicHistory) {
        //$cordovaLocalNotification.scheduleNotification({});

        //DB.clearAll();
        //return;
        DB.set('apiURI', 'http://217.160.15.56/plainDroidDB/api.php');
        Chats.setScope({scopeName: 'gameScope', scope: $scope});
        Chats.setIonicHistory($ionicHistory);
        Chats.setIonicPopup($ionicPopup);
        Chats.setIonicScrollDelegate($ionicScrollDelegate);

        //console.log(Chats.getScope('gameScope'));

        //Synchronize lokalDB with globalDB
        //Game.synchronizeGlobalDB(true);

        Game.beginGame();


        $scope.changeStory = function (key, buttonKey, buttonID, id) {
            Game.setChatsToDefaultFromClickedButton(key);
            $scope.getChatsFromClickedButton(buttonID);
        };

        $scope.setTypedInterval = function (chat, i) {
            if (chat.length == 0) {
                alert('Keine Daten hinterlegt.');
                return;
            }
            i = typeof(i) == 'undefined' ? 0 : i;


            var item = chat.content[i];
            if (item != null) {
                var wait = item.wait == null ? 1000 : item.wait;
                item.index = i;
                item.chatID = chat.id;
                item.chatUUID = chat.uuid;
                item.chatIndex = chat.index;

                setTimeout(function () {
                    Game.addChatListItem(item);

                    if (item.isButton == null) {
                        $scope.setTypedInterval(chat, i + 1);
                    }
                }, wait);
            }
        }

    })
;
