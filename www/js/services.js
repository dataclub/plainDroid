angular.module('starter.services', ['ionic', 'ngCordova'])

    .factory('$cordovaLocalNotification', function(){

        return {
            scheduleNotification: function (item) {
                document.addEventListener('deviceready', function () {
                    $cordovaLocalNotification = cordova.plugins.notification.local;
                    $cordovaLocalNotification.schedule({
                        id: item.id,
                        title: item.title,
                        text: item.text

                    });
                });
                //var now = new Date().getTime();
                //var _10SecondsFromNow = new Date(now + 10 * 1000);
                // Schedule notification for tomorrow to remember about the meeting

            },
            clickedNotification: function(){
                document.addEventListener('deviceready', function () {
                    $cordovaLocalNotification = cordova.plugins.notification.local;
                    $cordovaLocalNotification.on("click", function (notification) {
                        /*
                        if (notification.id == 10) {
                            alert('clicked');
                        }
                        */
                    });
                });

            },
            scheduledNotification: function(){
                document.addEventListener('deviceready', function () {
                    $cordovaLocalNotification = cordova.plugins.notification.local;
                    $cordovaLocalNotification.on("schedule", function (notification) {
                        /*
                         if (notification.id == 10) {
                         alert('clicked');
                         }
                         */
                    });
                });
            },
            updatedNotification: function(){
                document.addEventListener('deviceready', function () {
                    $cordovaLocalNotification = cordova.plugins.notification.local;
                    $cordovaLocalNotification.on("update", function (notification) {
                        /*
                         if (notification.id == 10) {
                         alert('clicked');
                         }
                         */
                    });
                });
            },
            triggeredNotification: function(){
                document.addEventListener('deviceready', function () {
                    $cordovaLocalNotification = cordova.plugins.notification.local;
                    $cordovaLocalNotification.on("trigger", function (notification) {
                        /*
                        if (notification.id != 10)
                            return;


                        // After 10 minutes update notification's title
                        setTimeout(function () {

                            $cordovaLocalNotification.update({
                                id: 10,
                                title: "Meeting in 5 minutes!"
                            });
                        }, 1000);
                        */
                    });
                });
            }
        };
    })
    .factory('Settings', function(Chats){
        return {
            getSettingsList: function(){
                return [
                    { text: "Musik", checked: true },
                    { text: "Sound", checked: false }
                ];
            },

            pushNotificationChanged: function($scope){
                $scope.pushNotificationChange = function(){
                    //TODO: Speichern in DB
                    console.log('Push Notification Change', $scope.pushNotification.checked);
                }
            },
            pushNotification: function(){
                return { checked: true };
            },

            getChapterList: function(){
                var chapters = Chats.getChapters();
                return chapters;
            },

            addChapterListItem: function($scope, item){
                console.log(item);
                $scope.chapterList.push(item);
            },
            viewEntered: function($scope){
                $scope.$on('$ionicView.enter', function(e) {
                    alert(5);
                    //TODO: Aktualisiere das Geschichtsverlauf nach Wechseln der Tab
                    //TODO: Kapitels auslesen anhand des lokalen DBs
                    //$scope.addChapterListItem({ text: "Kapitel "+currentStart, value: "ficken"+currentStart });
                    //currentStart++;
                });
            },
            chapterChanged: function($scope){
                console.log($scope);
                $scope.chapterChange = function(item) {
                    console.log("Selected Chapter, text:", item.text, "value:", item.value);
                };
            }

        }


    })

    .factory('Chats', function () {
        // Might use a resource here that returns a JSON array
        return {
            synchronizeLocalDB: function(){
                //TODO: Synchronize globalDB with localDB

                var root = 'http://plaindroiddb.repair-your-iphone.de/api.php';
                var table = 'contents';

                $.ajax({
                    url: root + '/'+table,
                    method: 'GET'
                }).then(function(data) {
                    console.log(data[table].columns);
                    console.log(data[table].records);
                });

            },
            all: function () {
                return chats;
            },
            allButtons: function () {
                var buttons = [];
                chats.forEach(function (item) {
                    if (item.isButton) {
                        buttons.push(item);
                    }
                });
                return buttons;
            },
            allIDs: function (id, left) {
                var ids = [];
                chats.forEach(function (item) {
                    if (typeof(id) != 'undefined') {
                        if (id == item.parent) {
                            if (typeof(item.left) == 'undefined' && typeof(item.right) == 'undefined') {
                                ids.push(item.id);
                            } else {
                                if (left) {
                                    if (typeof(item.left) != 'undefined' && item.left) {
                                        ids.push(item.id);
                                    }
                                } else {
                                    if (typeof(item.right) != 'undefined' && item.right) {
                                        ids.push(item.id);
                                    }
                                }
                            }
                        }
                    } else {
                        ids.push(item.id);
                    }

                });
                return ids;
            },
            remove: function (chat) {
                chats.splice(chats.indexOf(chat), 1);
            },
            get: function (chatId) {
                for (var i = 0; i < chats.length; i++) {
                    if (chats[i].id === parseInt(chatId)) {
                        return chats[i];
                    }
                }
                return null;
            },
            getData: function (id, left) {
                var data = [];
                chats.forEach(function (item) {
                    if (item.parent == id) {
                        if (typeof(item.left) == 'undefined' && typeof(item.right) == 'undefined') {
                            data.push(item);
                        } else {
                            if (left) {
                                if (typeof(item.left) != 'undefined' && item.left) {
                                    data.push(item);
                                }
                            } else {
                                if (typeof(item.right) != 'undefined' && item.right) {
                                    data.push(item);
                                }
                            }
                        }
                    }
                });
                return data;
            },

            getChapters: function(){
                var chapters = [];
                chats.forEach(function(item){
                    if(typeof(item.chapter) != 'undefined' && typeof(item.readed) != 'undefined' && item.readed == true){
                        chapters.push(item.chapter);
                    }
                });

                return chapters;
            }
        };
    });
