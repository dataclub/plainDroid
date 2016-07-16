angular.module('starter.servicesController', ['ionic', 'ngCordova', 'LocalStorageModule'])

    .factory('$cordovaLocalNotification', function () {

        document.addEventListener('deviceready', function () {
            var cordovaLocalNotification = cordova.plugins.notification.local;
            cordovaLocalNotification.on("click", function (notification) {
            });
            cordovaLocalNotification.on("schedule", function (notification) {
            });
            cordovaLocalNotification.on("update", function (notification) {
            });
            cordovaLocalNotification.on("trigger", function (notification) {
            });
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

    .factory('DB', function (localStorageService) {
        if (localStorageService.isSupported) {
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
                getKeys: function () {
                    var lsKeys = localStorageService.keys();
                    return lsKeys;
                },
                bind: function ($scope, key) {
                    return localStorageService.bind($scope, key);
                },
                now: function () {
                    var now = new Date();
                    return (now.getFullYear().toString()) + "-" + ("0" + (now.getMonth() + 1).toString()).substr(-2) + "-" + ("0" + now.getDate().toString()).substr(-2);
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

    .factory('Game', function (DB, Chats) {
        var game = {
            $scope: function () {
                return Chats.getScope('gameScope');
            },

            $ionicHistory: function () {
                return Chats.getIonicHistory();
            },
            $ionicPopup: function () {
                return Chats.getIonicPopup();
            },
            $ionicScrollDelegate: function () {
                return Chats.getIonicScrollDelegate();
            },

            /**
             * Beginn after synchronized localDB with globalDB
             */
            beginGame: function () {
                //Activated-Buttons from user here
                game.$scope().active = [];
                /**
                 * Startup - Events
                 */
                game.viewEntered();                     //Event - After entered the game-tab
                game.buttonsRendered();                 //Event - After Render Buttons Event
                game.splitButton();                     //Splitted Buttons, if there are more that 2 Conditions
                game.splitButtonLengthIsMoreThanKey();  //Condition to check for divider in split-buttons


                /**
                 * Register Interactions
                 */
                game.setActive();                       //Sets button to active
                game.existsActiveID();                  //Checks to existing active button
                game.isActive();                        //Checks if button is active
                game.showConfirms();                    //Buttons clicked to change the history
                game.getChatsFromClickedButton();       //Retrieve data from db for clicked button


                $("#synchronizeDB[issynched='true']").waitUntilExists(function () {

                    //$scope.readedChatsList = DB.get('readedChatsList') ? [] : DB.get('readedChatsList');


                    //game.$scope().readedChatsList = [];
                    //game.addChatListItem(game.getReadedChatsList()[0]);
                    //game.$scope().readedChatsList.addChatListItem(game.getReadedChatsList()[0]);

                    game.$scope().data = {chats: ''};
                    //nameTitles = Chats.getNameTitles();

                    if (Chats.getChats().length == 0) {
                        game.$scope().readedChatsList = [];
                    } else {
                        game.$scope().readedChatsList = game.getReadedChatsList();

                        game.$ionicHistory().clearCache();
                    }

                    if (game.$scope().readedChatsList.length == 0) {
                        var chat = Chats.getChats('00');
                        chat.index = Chats.getChatsIndex('00');
                        game.$scope().setTypedInterval(chat);
                    }
                });
            },
            bindExistingChatsToScope: function () {
                DB.set('chats', Chats.getChats());
                DB.bind(Chats.getScope('gameScope'), 'chats');
            },
            setNewDataToChats: function (data, updatedDate) {
                if (typeof(updatedDate) == 'undefined') {
                    updatedDate = DB.now();
                }

                data.forEach(function (item, index) {
                    data[index].content = typeof(item.content) == 'object' ? item.content : JSON.parse(item.content);
                });
                DB.set('chats', data);
                DB.set('updatedDate', updatedDate);
            },
            /**
             * Synchronize globalDB with localDB
             */
            synchronizeLocalDB: function (syncToLocalStorage) {
                if (typeof(syncToLocalStorage) == 'undefined') {
                    syncToLocalStorage = false;
                }
                var dbChats = Chats.getChats();
                var downloadedChats = DB.get('downloadedChats');

                if (syncToLocalStorage) {
                    /**
                     * Sync completely to localStorage
                     * Fixed: Hier liegt ein Download-Vorgang vor!
                     */
                    Chats.getScope('gameScope').showConfirmSynchronisation({
                        title: 'Achtung - Synchronisation der Story',
                        message: 'Möchte Sie die aktuellste Story runterladen?'
                    });
                } else if (downloadedChats.length != dbChats.length && downloadedChats.length > dbChats.length) {
                    /**
                     * New Story added
                     */
                    game.checkUpdateLocalDBStory();
                }
                else if (dbChats.length == downloadedChats.length) {
                    /**
                     * Story was modificated
                     * Fixed: Hier liegt eine Modifizierung der vorhandenen Story vor!
                     */

                    Chats.getScope('gameScope').showConfirmModificate({
                        title: 'Achtung - Aktualisierung der Story',
                        message: 'Möchten Sie die Anpassungen der aktuellen Story beziehen?'
                    });
                }


            },

            /**
             * Get all data from globalDB
             */
            synchronizeGlobalDB: function (firstTime) {
                if (typeof(firstTime) == 'undefined') {
                    firstTime = false;
                }
                //All data
                var table = 'history,updates?transform=1';
                $.ajax({
                    url: DB.get('apiURI') + '/' + table,
                    method: 'GET'
                }).then(function (data) {

                    DB.set('downloadedUpdates', data.updates);
                    DB.set('downloadedChats', data.history);
                    if (DB.get('chats') == null) {
                        //Synchronize chats to localStorage
                        game.synchronizeLocalDB(true);
                    } else {
                        /**
                         * set existing localDB there
                         */
                        if (firstTime) {
                            game.bindExistingChatsToScope();
                            $("#synchronizeDB").attr('issynched', true).trigger('change');
                        }
                    }
                });
            },

            checkUpdateLocalDBStory: function () {
                console.log('checkUpdateLocalDBStory');
                /**
                 * Fixed: Ask to update-flag in the database
                 */

                var updatedDate = DB.get('updatedDate') == null ? DB.now() : DB.get('updatedDate');

                var table = 'updates?transform=1';
                table += '&filter=date,gt,' + updatedDate;
                $.ajax({
                    url: DB.get('apiURI') + '/' + table,
                    method: 'GET'
                }).then(function (data) {
                    console.log(data.updates.length);
                    console.log(DB.get('updatedDate'));
                    //No update added in db updates
                    if (data.updates.length == 0 && DB.get('updatedDate') != null) {
                        console.log('No updates here from ' + DB.get('updatedDate'));
                        return;
                    }
                    /**
                     * Fixed: Hier liegt ein Geschichts-Ausbau vor!
                     */
                    Chats.getScope('gameScope').showConfirmUpdate(data.updates, {
                        title: 'Achtung - Es geht mit der Geschichte von plainDroid weiter!',
                        message: 'Für Offline-Modus muss die Story aktualisiert werden. Soll ein Storyupdate durchgeführt werden?'
                    });
                });
            },

            updateStorage: function () {
                var updatedData = [];
                DB.get('downloadedChats').forEach(function () {
                    //TODO: Merge data with localStorage witout taking params (clicked and readed)
                });
                console.log('merge data');
                return updatedData;
            },
            modificateStorage: function () {
                var modificatedData = [];
                var chats = Chats.getChats();
                console.log(chats);
                console.log(DB.get('downloadedChats'));
                DB.get('downloadedChats').forEach(function (item) {
                    //TODO: Merge data with localStorage with only taking params (text, buttonsText)
                    chats.text = item.text;
                    chats.buttons = item.buttons;
                });
                console.log('modificate data');
                return modificatedData;
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
            getReadedChatsList: function () {
                //Auslesen von der lokalen DB
                var readedChatsList = [];
                if (DB.get('readedChatsList') != null && DB.get('readedChatsList').length != 0) {
                    readedChatsList = DB.get('readedChatsList');
                }

                return readedChatsList.filter(function (item) {
                    return item.readed == '1'
                });
            },
            getChatsFromClickedButton: function () {
                game.$scope().getChatsFromClickedButton = function (buttonID) {
                    //All data
                    var table = 'history?transform=1';
                    //Get only data from parent
                    table += '&filter[]=uuid,eq,' + buttonID;

                    $.ajax({
                        url: DB.get('apiURI') + '/' + table,
                        method: 'GET'
                    }).then(function (data) {
                        var chat = Chats.convertListToJSON(data.history)[0];
                        if (typeof(chat) != 'undefined') {
                            chat.index = Chats.getChatsIndex(chat.uuid);
                            game.$scope().setTypedInterval(chat);
                        }
                    });
                };
            },
            setChatsToDefaultFromClickedButton: function (key) {
                var deleteAllChatsUnder = function (key) {
                    var readedChatsList = game.$scope().readedChatsList;
                    var tmpReadedChatsList = [];

                    for (var i = 0; i < parseInt(key) + 1; i++) {
                        tmpReadedChatsList[i] = readedChatsList[i];
                    }


                    return tmpReadedChatsList;
                };

                game.$scope().readedChatsList = deleteAllChatsUnder(key);
                //Clears out the app’s entire history, except for the current view.
                game.$ionicHistory().clearCache();
            },
            /**
             *
             * @returns {number}
             */
            itemIndexFoundInList: function (chatsList, item) {
                var foundIndex = null;
                chatsList.forEach(function (readedItem, i) {
                    if (typeof(readedItem.id) != 'undefined' && typeof(item.id) != 'undefined' && readedItem.id == item.id) {
                        foundIndex = i;
                        return;
                    }
                });
                return foundIndex;
            },
            /**
             * Adds item to game view-scope
             * @param item
             */
            addChatListItem: function (item) {
                item.readed = '1';

                var readedChatsList = game.$scope().readedChatsList;
                var foundIndex = this.itemIndexFoundInList(readedChatsList, item);

                var chats = Chats.getChats();

                if (foundIndex == null) {
                    readedChatsList.push(item);
                    chats[item.chatIndex].content[item.index] = item;
                }

                DB.set('chats', chats);
                DB.set('readedChatsList', readedChatsList);

                //Clears out the app’s entire history, except for the current view.
                game.$ionicHistory().clearHistory();
                game.$ionicHistory().clearCache();
                game.$ionicScrollDelegate().scrollBottom();
            },
            /**
             * Registers enter-event for game view
             */
            viewEntered: function () {
                game.$scope().$on('$ionicView.enter', function (e) {

                    console.log('enteredgame');
                    var offline = DB.get('Offline');
                    if (offline) {
                        /**
                         * Offline-Modus required
                         */
                        if (Chats.getScope('gameScope') == null) {
                            console.log('gameScope is null. ');

                        } else {
                            game.synchronizeLocalDB(Chats.getScope('gameScope'), DB.get('apiURI'));
                        }
                        console.log(Chats.getScopes());
                    } else {
                        /**
                         * Online-Modus required
                         */
                        game.synchronizeGlobalDB(true);

                    }

                    //Clears out the app’s entire history, except for the current view.
                    game.$ionicHistory().clearHistory();
                });
            },


            /**
             * Interaktionen
             */

            splitButton: function () {
                /**
                 * Gives as output true if there are more than 2 conditions to answer, else it gives false back
                 * @param chatID
                 * @param itemID
                 * @returns {boolean}
                 */
                game.$scope().splitButton = function (chatID, itemID) {
                    var item = game.$scope().readedChatsList[chatID];

                    if (item.isButton != '1' || (item.isButton != '1' && item.buttons == null)) {
                        return false;
                    }

                    //Remove class "item" from ion-item in the list to strech buttons in the page
                    game.$scope().buttonsRendered(itemID);

                    return Object.keys(game.$scope().readedChatsList[chatID].buttons).length > 2;
                };
            },

            buttonsRendered: function () {
                /**
                 * this function will be executed after rendering button with itemID on the page
                 * @param itemID
                 */
                game.$scope().buttonsRendered = function (itemID) {
                    $('#isetInactiveOtherson-item_' + itemID)[0].className = $('#ion-item_' + itemID)[0].className.replace('item', '');
                };
            },


            splitButtonLengthIsMoreThanKey: function () {
                /**
                 * Exists additional button after the given key
                 * @param key
                 * @param buttonKey
                 * @returns {boolean}
                 */
                game.$scope().splitButtonLengthIsMoreThanKey = function (key, buttonKey) {
                    return typeof(game.$scope().readedChatsList[key].buttons[parseInt(buttonKey) + 1]) == 'undefined' ? false : true;
                };
            },
            setInactiveOthers: function (ids) {
                var activeButtons = game.$scope().active;
                var tmpActiveButtons = activeButtons;
                tmpActiveButtons.forEach(function (index) {
                    if (ids.indexOf(index) == -1) {
                        activeButtons.splice(index, 1);
                    }
                });
                game.$scope().active = activeButtons;
            },
            setActive: function () {
                /**
                 * Set button with key from list and buttonKey to active
                 * @param key
                 * @param buttonKey
                 */
                game.$scope().setActive = function (key, buttonKey) {
                    var indexOfActiveButton = game.$scope().existsActiveID(key);
                    var activeButtons = game.$scope().active;
                    var readedChatsList = game.$scope().readedChatsList;

                    if (indexOfActiveButton == -1) {
                        activeButtons.push({key: key, buttonKey: buttonKey});
                        readedChatsList[key].clicked = buttonKey;
                    } else {
                        activeButtons[indexOfActiveButton] = {key: key, buttonKey: buttonKey};
                    }

                    DB.set('readedChatsList', readedChatsList);
                };
            },

            existsActiveID: function () {
                /**
                 * checks if button was clicked once and exists in array active of the game.$scope(). that means, that the buttons has one active item
                 * @param key
                 * @returns {number}
                 */
                game.$scope().existsActiveID = function (key) {
                    var indexOf = -1;
                    game.$scope().active.forEach(function (item, index) {
                        if (key == item.key) {
                            indexOf = index;
                            return;
                        }

                    });

                    return indexOf;
                };
            },

            isActive: function () {
                /**
                 * checks if button with id and given param (buttonKey) was clicked. Returns true if active, else false
                 * @param key
                 * @param buttonKey
                 * @returns {boolean}
                 */
                game.$scope().isActive = function (key, buttonKey, clickedButton) {
                    var isActive = false;
                    var activeButtons = game.$scope().active;
                    var readedChatList = game.$scope().readedChatsList;

                    activeButtons.forEach(function (value) {
                        if (key == value.key && buttonKey == value.buttonKey) {
                            isActive = true;
                            return;
                        }
                    });


                    if (activeButtons.length == 0 && !isActive && buttonKey == readedChatList[key].clicked) {
                        isActive = true;
                    }

                    return isActive; //Event from view in ng-click of button
                };
            },

            showConfirms: function () {
                /**
                 * Confirmation popup-window comes out, if user clicks to change the story
                 * @param key
                 * @param buttonID
                 * @param buttonKey
                 * @param content Object {title: '', message: ''}
                 */
                game.$scope().showConfirmStory = function (buttonID, key, buttonKey, id, content) {
                    var confirmObject = {
                        title: content.title,
                        template: content.message,
                        key: key,
                        buttonKey: buttonKey,
                        buttonID: buttonID,
                        id: id
                    };
                    var confirmPopup = game.$ionicPopup().confirm(confirmObject);
                    confirmPopup.then(function (res) {
                        if (res) {
                            game.$scope().setActive(confirmObject.key, confirmObject.buttonKey);
                            game.$scope().changeStory(confirmObject.key, confirmObject.buttonKey, confirmObject.buttonID, confirmObject.id);
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
                game.$scope().showConfirmSynchronisation = function (content) {
                    console.log('confir');
                    var confirmObject = {
                        title: content.title,
                        template: content.message
                    };
                    var confirmPopup = game.$ionicPopup().confirm(confirmObject);
                    confirmPopup.then(function (res) {
                        if (res) {
                            game.setNewDataToChats(DB.get('downloadedChats'));

                            console.log('You clicked on "OK" button');
                        } else {
                            game.bindExistingChatsToScope();
                            console.log('You clicked on "Cancel" button');
                        }
                        $("#synchronizeDB").attr('issynched', true).trigger('change');
                    });
                };

                /**
                 * Confirmation popup-window comes out, if user wants to update localStorage
                 * @param key
                 * @param buttonKey
                 * @param content Object {title: '', message: ''}
                 */
                game.$scope().showConfirmUpdate = function (updatedDate, content) {
                    var confirmObject = {
                        title: content.title,
                        template: content.message,
                        updatedDate: updatedDate
                    };
                    var confirmPopup = game.$ionicPopup().confirm(confirmObject);
                    confirmPopup.then(function (res) {
                        if (res) {
                            //TODO: Update localStorage
                            var chats = game.updateStorage();
                            DB.bind(Chats.getScope('gameScope'), 'chats');

                            //Update localStorage version
                            DB.set('updatedDate', confirmObject.updatedDate);

                            console.log('You clicked on "OK" button');
                        } else {
                            game.bindExistingChatsToScope();
                            console.log('You clicked on "Cancel" button');
                        }
                        $("#synchronizeDB").attr('issynched', true).trigger('change');
                    });
                };

                /**
                 * Confirmation popup-window comes out, if user wants to update localStorage to modify existing content
                 * @param key
                 * @param buttonKey
                 * @param content Object {title: '', message: ''}
                 */
                game.$scope().showConfirmModificate = function (content) {
                    var confirmObject = {
                        title: content.title,
                        template: content.message
                    };
                    var confirmPopup = game.$ionicPopup().confirm(confirmObject);
                    confirmPopup.then(function (res) {
                        if (res) {

                            console.log('checkmodification');
                            var updatedDate = DB.get('updatedDate') == null ? DB.now() : DB.get('updatedDate');

                            /**
                             * Fixed: Hier liegt ein Geschichts-Modifizierung vor!
                             */
                            var chats = game.modificateStorage();
                            game.setNewDataToChats(chats, updatedDate);

                            DB.set('updateNotification', Chats.getScope('settingsScope').updateNotification.checked);

                            console.log('You clicked on "OK" button');
                        } else {
                            game.bindExistingChatsToScope();
                            console.log('You clicked on "Cancel" button');
                        }
                        $("#synchronizeDB").attr('issynched', true).trigger('change');
                    });
                };

            }

        };

        return game;
    })

    .factory('Settings', function (Chats, DB, Game) {
        var settings = {
            $scope: function () {
                return Chats.getScope('settingsScope');
            },
            $ionicHistory: function () {
                return Chats.getIonicHistory();
            },
            $ionicPopup: function () {
                return Chats.getIonicPopup();
            },
            getSettingsList: function () {
                //ion-volume-high
                return [
                    {
                        text: "Musik", checked: DB.get('Musik') == null ? true : DB.get('Musik'),
                        on: "ion-music-note",
                        off: "ion-ios-musical-note"
                    },
                    {
                        text: "Sound", checked: DB.get('Sound') == null ? true : DB.get('Sound'),
                        on: "ion-android-volume-up",
                        off: "ion-android-volume-off"
                    },
                ];
            },

            pushNotification: function () {
                return {
                    checked: DB.get('pushNotification') == null ? true : DB.get('pushNotification'),
                    on: "ion-android-notifications",
                    off: "ion-android-notifications-off"
                };
            },

            updateNotification: function () {
                return {
                    checked: DB.get('updateNotification') == null ? false : DB.get('updateNotification'),
                    icon_on: "ion-alert",
                    icon_off: "ion-ios-loop-strong",
                    status_on: "ion-archive",
                    status_off: "ion-checkmark",
                    info_on: "vorhanden",
                    info_off: "auf dem aktuellsten Stand"

                };
            },

            settingsChanged: function () {
                settings.$scope().settingsNotificationChange = function (item) {
                    //Fixed: Save settings to DB
                    DB.set(item.text, item.checked);
                    console.log('Settings Change', item);
                }
            },

            pushNotificationChanged: function () {
                settings.$scope().pushNotificationChange = function () {
                    //Fixed: Save notification to DB
                    DB.set('pushNotification', settings.$scope().pushNotification.checked);
                    console.log('Push Notification Change', settings.$scope().pushNotification.checked);
                }
            },

            updateNotificationClicked: function () {
                settings.$scope().updateNotificationClick = function () {
                    if (settings.$scope().updateNotification.checked) {
                        //TODO: Auto-Event to check if new version there
                        settings.$scope().updateNotification.checked = !settings.$scope().updateNotification.checked;
                        Game.synchronizeLocalDB();

                    }

                }
            },

            getChapterList: function () {
                var chapters = Chats.getChapters();
                return chapters;
            },

            addChapterListItem: function (item) {

                if (!settings.checkChapterExists(item)) {
                    settings.$scope().chapterList.push(item);
                    //Clears out the app’s entire history, except for the current view.
                    settings.$ionicHistory().clearHistory();
                }
            },
            viewEntered: function () {
                settings.$scope().$on('$ionicView.enter', function (e) {
                    console.log('entered settings');


                    //TODO: Aktualisiere das Geschichtsverlauf nach Wechseln der Tab
                    //TODO: Kapitels auslesen anhand des lokalen DBs
                    settings.addChapterListItem({text: "Kapitel 1", value: "nlabla 1"});


                    /**
                     * TODO: Check if there is new version to modify or update
                     */
                    var downloadedUpdates = DB.get('downloadedUpdates');
                    var table = 'updates?transform=1';
                    $.ajax({
                        url: DB.get('apiURI') + '/' + table,
                        method: 'GET'
                    }).then(function (data) {
                        DB.set('downloadedUpdates', data.updates);
                        downloadedUpdates = DB.get('downloadedUpdates');

                        console.log(1);
                        DB.set('updatedDate', DB.get('updatedDate') == null ? DB.now() : DB.get('updatedDate'));
                        DB.set('updatedVersion', DB.get('updatedVersion') == null ? 1 : DB.get('updatedVersion'));


                        var updatedDateLocal = DB.get('updatedDate');
                        var updatedVersionLocal = DB.get('updatedVersion');

                        var updatedDate = DB.now();
                        var updatedVersion = 1;
                        if (downloadedUpdates.length > 0) {
                            updatedDate = downloadedUpdates[downloadedUpdates.length - 1].date;
                            updatedVersion = downloadedUpdates[downloadedUpdates.length - 1].version;
                        }

                        console.log(updatedDate);
                        console.log(updatedDateLocal);
                        console.log(updatedVersion);
                        console.log(updatedVersionLocal);
                        if (updatedDate != updatedDateLocal && updatedVersion > updatedVersionLocal) {
                            console.log('update');
                            if ((DB.get('chats').length != DB.get('downloadedChats').length && DB.get('chats').length < DB.get('downloadedChats').length) || DB.get('chats').length == DB.get('downloadedChats').length) {
                                //New update there
                                console.log('update execute');

                                /*
                                 $scope.updatedDate = updatedDate;
                                 DB.set('updatedDate', updatedDate);

                                 $scope.updatedVersion = updatedVersion;
                                 DB.set('updatedVersion', updatedVersion);

                                 */
                                settings.$scope().updateNotification.checked = true;
                                DB.set('updateNotification', settings.$scope().updateNotification.checked);
                            }
                        }
                    });


                    settings.$ionicHistory().clearHistory();
                });
            },
            chapterChanged: function () {
                console.log($scope);
                settings.$scope().chapterChange = function (item) {
                    console.log("Selected Chapter, text:", item.text, "value:", item.value);
                };
            },
            getLastChapter: function () {
                var lastChapter = null;
                Game.$scope().readedChatsList.forEach(function (item) {
                    if (typeof(item.chapter) != 'undefined') {
                        lastChapter = item.chapter;
                    }
                });

                return lastChapter;
            },
            checkChapterExists: function ($chapter) {
                var returnValue = false;
                settings.$scope().chapterList.forEach(function (item) {
                    if ($chapter.text == item.text && $chapter.value == item.value) {
                        returnValue = true;
                        return;
                    }
                });
                return returnValue;
            }


        };

        return settings;

    })

    .factory('Chats', function (DB) {
        var chats = [];
        var scopes = [];
        var ionicHistory = null;
        var ionicPopup = null;
        var ionicScrollDelegate = null;

        return {
            fileExists: function (url) {
              if(url){
                var req = new XMLHttpRequest();
                req.open('HEAD', url, false);
                req.send();
                return req.status==200;
              } else {
                return false;
              }
            },
            convertListToJSON: function (chats) {
                var thisObject = this;

                chats.forEach(function (chat, index) {
                    if (typeof(chat.content) != 'undefined') {
                        chats[index].content = typeof(chat.content) == 'object' ? chat.content : JSON.parse(chat.content);
                        chats[index].content = thisObject.convertListToArray(chats[index].content);
                        chats[index].content.forEach(function (content, cIndex) {
                            if (content.isButton == '1') {
                                chats[index].content[cIndex].buttons = thisObject.convertListToArray(chats[index].content[cIndex].buttons);
                            }

                            if (typeof(content.nameTitles) != 'undefined') {
                                var keysOfTitleNames = Object.keys(nameTitles);
                                keysOfTitleNames.forEach(function (titleKey, keyIndex) {
                                    if (titleKey == content.nameTitles) {
                                        nameTitles[titleKey].id = keysOfTitleNames[keyIndex];
                                        chats[index].content[cIndex].nameTitle = nameTitles[titleKey];
                                    }
                                });
                            }
                        });
                    }

                });
                return chats;
            },
            convertListToArray: function (list) {
                var list = Object.keys(list).map(function (k) {
                    return list[k]
                });
                return list;
            },
            getChats: function (uuid) {
                var chats = DB.get('chats');
                if (chats == null) {
                    return chats;
                }

                var returnValue = this.convertListToJSON(chats);
                if (typeof(uuid) != 'undefined') {
                    chats.forEach(function (chat) {
                        if (chat.uuid == uuid) {
                            returnValue = chat;
                            return;
                        }
                    })
                }

                return returnValue;
            },
            getChatsIndex: function (uuid) {
                var chats = DB.get('chats');
                var returnValue = null;
                chats.forEach(function (chat, index) {
                    if (chat.uuid == uuid) {
                        returnValue = index;
                    }
                });

                return returnValue;
            },
            /*
             convertChatButtonsToJSON: function(chats){
             chats.forEach(function(chat, chatIndex){
             var content = Object.keys(chat.content);
             content.forEach(function(index){
             var item = chat.content[index];
             if(item.isButton != null){
             item.buttons = typeof(item.buttons) == 'object' ? item.buttons : JSON.parse(item.buttons);
             }
             chat.content[index] = item;
             });

             chats[chatIndex].content = chat.content;
             });
             return chats;
             },
             */
            getScopes: function () {
                return scopes;
            },
            getScope: function (scopeName) {
                var $scope = null;
                scopes.forEach(function (item) {
                    if (item.scopeName == scopeName) {
                        $scope = item.scope;
                    }
                });
                return $scope;
            },
            setScope: function (scopeObject) {
                if (this.getScopes().length == 0) {
                    scopes.push(scopeObject);
                } else {
                    scopes.forEach(function (item) {
                        if (item.scopeName == scopeObject.scopeName) {
                            scopes[scopeObject.scopeName] = scopeObject.scope;
                        } else {
                            scopes.push(scopeObject);
                        }
                    });
                }
            },
            setIonicHistory: function ($ionicHistory) {
                ionicHistory = $ionicHistory;
            },
            getIonicHistory: function () {
                return ionicHistory;
            },

            setIonicPopup: function ($ionicPopup) {
                ionicPopup = $ionicPopup;
            },
            getIonicPopup: function () {
                return ionicPopup;
            },
            setIonicScrollDelegate: function ($ionicScrollDelegate) {
                ionicScrollDelegate = $ionicScrollDelegate;
            },
            getIonicScrollDelegate: function () {
                return ionicScrollDelegate;
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

            getChapters: function () {
                var chapters = [];
                chats.forEach(function (item) {
                    if (typeof(item.chapter) != 'undefined' && typeof(item.readed) != 'undefined' && item.readed == true) {
                        chapters.push(item.chapter);
                    }
                });

                return chapters;
            }
        };
    });
