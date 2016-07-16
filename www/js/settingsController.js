angular.module('starter.settingsController', ['ionic', 'ngCordova', 'ui.bootstrap'])
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
