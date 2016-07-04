angular.module('starter.controllers', ['ionic', 'ngCordova', 'ui.bootstrap', 'LocalStorageModule'])

.controller('GameCtrl', function($scope, Chats, Game, DB, $ionicModal, $ionicPopup, $ionicScrollDelegate, $cordovaLocalNotification, $ionicHistory, localStorageService) {

        //$cordovaLocalNotification.scheduleNotification({});

        //DB.clearAll();
        //return;
        DB.set('apiURI', 'http://217.160.15.56/plainDroidDB/api.php');
        Chats.setScope({scopeName: 'gameScope', scope: $scope});
        Chats.setIonicHistory($ionicHistory);
        Chats.setIonicPopup($ionicPopup);

        //console.log(Chats.getScope('gameScope'));

        //Synchronize lokalDB with globalDB
        //Game.synchronizeGlobalDB(true);

        Game.beginGame();


        $scope.changeStory = function(key, buttonKey,  buttonID, id){
            Game.setChatsToDefaultFromClickedButton(key);
            $scope.getChatsFromClickedButton(buttonID);
        };

        $scope.setTypedInterval = function(chat, i){
            if(chat.length == 0){
                alert('Keine Daten hinterlegt.');
                return;
            }
            i = typeof(i) == 'undefined' ? 0 : i;


            var item = chat.content[i];
            if(item != null){
                var wait = item.wait == null ? 1000 : item.wait;
                item.index = i;
                item.chatID = chat.id;
                item.chatUUID = chat.uuid;
                item.chatIndex = chat.index;

                setTimeout(function () {
                    Game.addChatListItem(item);

                    if (item.isButton == null) {
                        $scope.setTypedInterval(chat, i+1);
                    }
                }, wait);
            }
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
