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

        $scope.setTypedInterval = function(data, i){
            if(data.length == 0){
                alert('Keine Daten hinterlegt.');
                return;
            }

            var wait = typeof(data[i].wait) == 'undefined' ? 1000 : data[i].wait;
            i = typeof(i) == 'undefined' ? 0 : i;
            setTimeout(function(){
                data[i].readed = true;

                Game.addChatListItem($scope, $ionicHistory, data[i]);

                if(!data[i].isButton){
                    $scope.setTypedInterval(data[i], i+1);
                }
            }, wait);

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
