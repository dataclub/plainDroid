angular.module('starter.services', ['ionic', 'ngCordova', 'LocalStorageModule'])

    .factory('$cordovaLocalNotification', function(){

        document.addEventListener('deviceready', function () {
            var cordovaLocalNotification = cordova.plugins.notification.local;
            cordovaLocalNotification.on("click", function (notification) {});
            cordovaLocalNotification.on("schedule", function (notification) {});
            cordovaLocalNotification.on("update", function (notification) {});
            cordovaLocalNotification.on("trigger", function (notification) {});
        });

        return {
            scheduleNotification: function (item) {
                document.addEventListener('deviceready', function () {
                    cordova.plugins.notification.local.schedule({
                        id: item.id,
                        title: item.title,
                        text: item.text
                    });
                });
            }
        };
    })

    .factory('DB', function(localStorageService){
        if(localStorageService.isSupported) {
            var storageType = localStorageService.getStorageType(); //e.g localStorage
            console.log(storageType + ' works!');

            var storage = {
                set: function (key, val) {
                    return localStorageService.set(key, val);
                },

                get: function (key) {
                    return localStorageService.get(key);
                },

                remove: function (key) {
                    return localStorageService.remove(key);
                },

                clearAll: function () {
                    return localStorageService.clearAll();
                },
                getKeys: function(){
                    var lsKeys = localStorageService.keys();
                    return lsKeys;
                },
                bind: function($scope, key){
                    return localStorageService.bind($scope, key);
                }
            };
            return storage;



/*
            localStorageService.set('property', 'oldValue');
            localStorageService.bind($scope, 'property');

            //Test Changes
            $scope.update = function(val) {
                submit('property', val);
                $scope.property = getItem('property');
            }

            $scope.unbind = function(){
                removeItem('property');
                $scope.property = '';
            }

            return db;
            */
        }
        return null;
    })

    .factory('Game', function(DB){

        var game = {
            /**
             * Beginn after synchronized localDB with globalDB
             * @param $scope
             */
            beginGame: function($scope, $ionicHistory, $ionicPopup){

                //Activated-Buttons from user here
                $scope.active = [];
                /**
                 * Startup - Events
                 */
                game.viewEntered($scope, $ionicHistory);        //Event - After entered the game-tab
                game.buttonsRendered($scope);                   //Event - After Render Buttons Event
                game.splitButton($scope);                       //Splitted Buttons, if there are more that 2 Conditions
                game.splitButtonLengthIsMoreThanKey($scope);    //Contdition to check for divider in split-buttons


                /**
                 * Register Interactions
                 */
                game.setActive($scope);                         //Sets button to active
                game.existsActiveID($scope);                    //Checks to existing active button
                game.isActive($scope);                          //Checks if button is active
                game.showConfirms($scope, $ionicPopup);          //Buttons clicked to change the history
                game.getChatsFromClickedButton($scope);         //Retrieve data from db for clicked button


                $("#synchronizeDB[issynched='true']").waitUntilExists(function () {
                    console.log(DB.get('chats'));

                    $scope.readedChatsList = game.getReadedChatsList();
                    $scope.data = {chats: ''};

                    //this.addChatListItem($scope, $ionicHistory, { text: "Kapitel 1", value: "nlabla 1" });

                    $ionicHistory.clearCache();
                });
            },
            bindChatsToScope: function($scope){
                var chats = DB.get('chats');
                DB.set('chats', chats);
                DB.bind($scope, 'chats');
            },
            /**
             * Synchronize globalDB with localDB
             */
            synchronizeLocalDB: function($scope, apiURI){

                //All data
                var table = 'contents?transform=1';
                $.ajax({
                    url: apiURI + '/'+table,
                    method: 'GET'
                }).then(function(data) {

                    //DB.clearAll();
                    //return;

                    if(DB.get('chats') == null)  {
                        //Sync completely
                        //Fixed: Hier liegt ein Download-Vorgang vor!
                        $scope.showConfirmSynchronisation($scope, data, {title: 'Achtung', message: 'Es liegt ein Storyupdate vor. Möchten Sie die Story aktualisieren?'});
                    }else{
                        console.log('lolas2')
                        //set existing localDB there
                        game.bindChatsToScope($scope);
                        $("#synchronizeDB").attr('issynched', true).trigger('change');
                    }
                });

            },

            /**
             * Convert data from ajax-post to json-object
             * @param columns
             * @param records
             * @returns {Array}
             */
            toJSON: function (columns, records) {
                var jsonObjects = [];
                records.forEach(function (record) {
                    var jsonObject = {};
                    var i = 0;
                    columns.forEach(function (column) {
                        jsonObject[column] = record[i];
                        i++;
                    });

                    jsonObjects.push(jsonObject);
                });


                return jsonObjects;
            },

            /**
             * returns only readed chatslist
             * @returns {Array}
             */
            getReadedChatsList: function(){
                var chats = DB.get('chats');
                //TODO: Auslesen von der lokalen DB
                chats.forEach(function(item, index){
                    if(item.isButton == '1'){
                        chats[index].buttons = JSON.parse(item.buttons);
                    }
                });
                return chats;
            },
            getChatsFromClickedButton: function($scope){
                $scope.getChatsFromClickedButton = function(key, buttonKey, parentID, apiURI){
                    //All data
                    var table = 'contents?transform=1';
                    //Get only data from parent
                    table += '&filter=parent,eq,'+parentID;
                    table += '&filter=clicked,eq,'+buttonKey;

                    $.ajax({
                        url: apiURI + '/'+table,
                        method: 'GET'
                    }).then(function(data) {
                        $scope.setTypedInterval(data.contents);
                    });
                };
            },
            /**
             * Adds item to game view-scope
             * @param $scope
             * @param $ionicHistory
             * @param item
             */
            addChatListItem: function($scope, $ionicHistory, item){
                $scope.readedChatsList.push(item);
                //Clears out the app’s entire history, except for the current view.
                $ionicHistory.clearHistory();
            },
            /**
             * Registers enter-event for game view
             * @param $scope
             * @param $ionicHistory
             */
            viewEntered: function($scope, $ionicHistory){
                $scope.$on('$ionicView.enter', function(e) {
                    console.log('enteredgame');

                    //Clears out the app’s entire history, except for the current view.
                    $ionicHistory.clearHistory();
                });
            },



            /**
             * Interaktionen
             */

            splitButton: function ($scope) {
                /**
                 * Gives as output true if there are more than 2 conditions to answer, else it gives false back
                 * @param chatID
                 * @param itemID
                 * @returns {boolean}
                 */
                $scope.splitButton = function (chatID, itemID) {
                    var item = $scope.readedChatsList[chatID];

                    if (item.isButton != '1' || (item.isButton != '1' && item.buttons == null)) {
                        return false;
                    }

                    //Remove class "item" from ion-item in the list to strech buttons in the page
                    $scope.buttonsRendered(itemID);

                    return Object.keys($scope.readedChatsList[chatID].buttons).length > 2;
                };
            },

            buttonsRendered: function ($scope) {
                /**
                 * this function will be executed after rendering button with itemID on the page
                 * @param itemID
                 */
                $scope.buttonsRendered = function (itemID) {
                    $('#ion-item_' + itemID)[0].className = $('#ion-item_' + itemID)[0].className.replace('item', '');
                };
            },


            splitButtonLengthIsMoreThanKey: function ($scope) {
                /**
                 * Exists additional button after the given key
                 * @param key
                 * @param buttonKey
                 * @returns {boolean}
                 */
                $scope.splitButtonLengthIsMoreThanKey = function (key, buttonKey) {
                    return typeof($scope.readedChatsList[key].buttons[parseInt(buttonKey) + 1]) == 'undefined' ? false : true;
                };
            },

            setActive: function ($scope) {
                /**
                 * Set button with key from list and buttonKey to active
                 * @param key
                 * @param buttonKey
                 */
                $scope.setActive = function (key, buttonKey) {
                    var indexOfActiveButton = $scope.existsActiveID(key);
                    if (indexOfActiveButton == -1) {
                        $scope.active.push({key: key, buttonKey: buttonKey});
                        $scope.readedChatsList[key].clicked = buttonKey;
                    } else {
                        $scope.active[indexOfActiveButton] = {key: key, buttonKey: buttonKey};
                    }
                };
            },

            existsActiveID: function ($scope) {
                /**
                 * checks if button was clicked once and exists in array active of the game-$scope. that means, that the buttons has one active item
                 * @param key
                 * @returns {number}
                 */
                $scope.existsActiveID = function (key) {
                    var indexOf = -1;
                    $scope.active.forEach(function (item, index) {
                        if (key == item.key) {
                            indexOf = index;
                            return;
                        }

                    });

                    return indexOf;
                };
            },

            isActive: function ($scope) {
                /**
                 * checks if button with id and given param (buttonKey) was clicked. Returns true if active, else false
                 * @param key
                 * @param buttonKey
                 * @returns {boolean}
                 */
                $scope.isActive = function (key, buttonKey, clickedButton) {
                    var isActive = false;
                    $scope.active.forEach(function (value) {
                        if (key == value.key && buttonKey == value.buttonKey) {
                            isActive = true;
                            return;
                        }
                    });


                    if($scope.active.length == 0 && !isActive && buttonKey == $scope.readedChatsList[key].clicked){
                       isActive = true;
                    }

                    return isActive; //Event from view in ng-click of button
                };
            },

            showConfirms: function ($scope, $ionicPopup) {
                /**
                 * Confirmation popup-window comes out, if user clicks to change the story
                 * @param key
                 * @param buttonKey
                 * @param content Object {title: '', message: ''}
                 */
                $scope.showConfirmStory = function (key, buttonKey, parentID, content) {
                    var confirmObject = {
                        title: content.title,
                        template: content.message,
                        key: key,
                        buttonKey: buttonKey,
                        parentID: parentID
                    };
                    var confirmPopup = $ionicPopup.confirm(confirmObject);
                    confirmPopup.then(function (res) {
                        if (res) {
                            $scope.setActive(confirmObject.key, confirmObject.buttonKey);
                            $scope.changeStory(confirmObject.key, confirmObject.buttonKey, confirmObject.parentID);
                            console.log('You clicked on "OK" button');
                        } else {
                            console.log('You clicked on "Cancel" button');
                        }
                    });
                };

                /**
                 * Confirmation popup-window comes out, if user wants to synchronisation localStorage
                 * @param key
                 * @param buttonKey
                 * @param content Object {title: '', message: ''}
                 */
                $scope.showConfirmSynchronisation = function ($scope, data, content) {
                    console.log('confir');
                    var confirmObject = {
                        title: content.title,
                        template: content.message,
                        data: data.contents,
                        $scope: $scope
                    };
                    var confirmPopup = $ionicPopup.confirm(confirmObject);
                    confirmPopup.then(function (res) {
                        if (res) {
                            DB.set('chats', confirmObject.data);
                            DB.bind(confirmObject.$scope, 'chats');

                            console.log('You clicked on "OK" button');
                        } else {
                            game.bindChatsToScope(confirmObject.$scope);
                            console.log('You clicked on "Cancel" button');
                        }
                        $("#synchronizeDB").attr('issynched', true).trigger('change');
                    });
                };
            }

        };

        return game;
    })

    .factory('Settings', function(Chats, DB){
        var settings = {
            getSettingsList: function(){
                return [
                    { text: "Offline", checked: DB.get('Offline') == null ? false : DB.get('Offline') },
                    { text: "Musik", checked: DB.get('Musik') == null ? true : DB.get('Musik') },
                    { text: "Sound", checked: DB.get('Sound') == null ? true : DB.get('Sound') }
                ];
            },

            pushNotification: function(){
                return { checked: DB.get('pushNotification') == null ? true : DB.get('pushNotification')};
            },


            settingsNotificationChanged: function($scope){
                $scope.settingsNotificationChange = function(item){
                    //Fixed: Save settings to DB
                    DB.set(item.text, item.checked);
                    console.log('Settings Notification Change', item);
                }
            },

            pushNotificationChanged: function($scope){
                $scope.pushNotificationChange = function(){
                    //Fixed: Save notification to DB
                    DB.set('pushNotification', $scope.pushNotification.checked);
                    console.log('Push Notification Change', $scope.pushNotification.checked);
                }
            },

            getChapterList: function(){
                var chapters = Chats.getChapters();
                return chapters;
            },

            addChapterListItem: function($scope, $ionicHistory, item){
                $scope.chapterList.push(item);
                //Clears out the app’s entire history, except for the current view.
                $ionicHistory.clearHistory();
            },
            viewEntered: function($scope, $ionicHistory){
                $scope.$on('$ionicView.enter', function(e) {
                    console.log('entered settings');


                    //TODO: Aktualisiere das Geschichtsverlauf nach Wechseln der Tab
                    //TODO: Kapitels auslesen anhand des lokalen DBs
                    settings.addChapterListItem($scope, $ionicHistory, { text: "Kapitel 1", value: "nlabla 1" });
                    $ionicHistory.clearHistory();
                });
            },
            chapterChanged: function($scope){
                console.log($scope);
                $scope.chapterChange = function(item) {
                    console.log("Selected Chapter, text:", item.text, "value:", item.value);
                };
            }

        };

        return settings;

    })

    .factory('Chats', function () {
        var chats = [];

        return {

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
