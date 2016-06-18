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
                },
                now: function(){
                    var now = new Date();
                    return (now.getFullYear().toString()) + "-" +("0" + (now.getMonth() + 1).toString()).substr(-2) + "-" + ("0" + now.getDate().toString()).substr(-2);
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

    .factory('Game', function(DB, Chats){
        var game = {
            $scope: function(){
                return Chats.getScope('gameScope');
            },

            $ionicHistory: function(){
                return Chats.getIonicHistory();
            },
            $ionicPopup: function(){
                return Chats.getIonicPopup();
            },
            /**
             * Beginn after synchronized localDB with globalDB
             */
            beginGame: function(){
                //Activated-Buttons from user here
                game.$scope().active = [];
                /**
                 * Startup - Events
                 */
                game.viewEntered();        //Event - After entered the game-tab
                game.buttonsRendered();                   //Event - After Render Buttons Event
                game.splitButton();                       //Splitted Buttons, if there are more that 2 Conditions
                game.splitButtonLengthIsMoreThanKey();    //Contdition to check for divider in split-buttons


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

                    if(Chats.getChats().length == 0){
                        game.$scope().readedChatsList = [];
                    }else{
                        game.$scope().readedChatsList = game.getReadedChatsList();
                        console.log('je');
                        console.log(game.$scope().readedChatsList);
                        console.log(DB.get('chats'));
                        //game.$scope().readedChatsList.pop(game.$scope().readedChatsList[game.$scope().readedChatsList.length-1]);
                        //DB.set('chats', game.$scope().readedChatsList);
                        game.$ionicHistory().clearCache();
                    }

                    if(game.$scope().readedChatsList.length == 0){
                        game.$scope().setTypedInterval(Chats.getChats());
                    }



                });
            },
            bindExistingChatsToScope: function(){
                DB.set('chats', Chats.getChats());
                DB.bind(Chats.getScope('gameScope'), 'chats');
            },
            setNewDataToChats: function(data, updatedDate){
                if(typeof(updatedDate) == 'undefined'){
                    updatedDate = DB.now();
                }

                data.forEach(function(item, index){
                    if(item.isButton != null){
                        item.buttons = typeof(item.buttons) == 'object' ? item.buttons : JSON.parse(item.buttons);
                    }
                    data[index].buttons = item.buttons;
                });
                DB.set('chats', data);
                DB.set('updatedDate', updatedDate);
            },
            /**
             * Synchronize globalDB with localDB
             */
            synchronizeLocalDB: function(syncToLocalStorage){
                if(typeof(syncToLocalStorage) == 'undefined'){
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
                if(typeof(firstTime) == 'undefined'){
                    firstTime = false;
                }
                //All data
                var table = 'chats,updates?transform=1';
                $.ajax({
                    url: DB.get('apiURI') + '/' + table,
                    method: 'GET'
                }).then(function (data) {



                    DB.set('downloadedUpdates', data.updates);
                    DB.set('downloadedChats', data.chats);
                    if(DB.get('chats') == null){
                        //Synchronize chats to localStorage
                        game.synchronizeLocalDB(true);
                    }else{
                        /**
                         * set existing localDB there
                         */
                        if(firstTime){
                            game.bindExistingChatsToScope();
                            $("#synchronizeDB").attr('issynched', true).trigger('change');
                        }
                    }
                });
            },

            checkUpdateLocalDBStory: function(){
                console.log('checkUpdateLocalDBStory');
                /**
                 * Fixed: Ask to update-flag in the database
                 */

                var updatedDate=DB.get('updatedDate') == null ? DB.now() : DB.get('updatedDate');

                var table = 'updates?transform=1';
                table += '&filter=date,gt,'+updatedDate;
                $.ajax({
                    url: DB.get('apiURI') + '/'+table,
                    method: 'GET'
                }).then(function(data) {
                    console.log(data.updates.length);
                    console.log(DB.get('updatedDate'));
                    //No update added in db updates
                    if(data.updates.length == 0 && DB.get('updatedDate') != null ){
                        console.log('No updates here from '+ DB.get('updatedDate'));
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

            updateStorage: function(){
                var updatedData = [];
                DB.get('downloadedChats').forEach(function(){
                    //TODO: Merge data with localStorage witout taking params (clicked and readed)
                });
                console.log('merge data');
                return updatedData;
            },
            modificateStorage: function(){
                var modificatedData = [];
                var chats = Chats.getChats();
                console.log(chats);
                console.log(DB.get('downloadedChats'));
                DB.get('downloadedChats').forEach(function(item){
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
            getReadedChatsList: function(){
                var chats = Chats.getChats();
                //TODO: Auslesen von der lokalen DB
                if(chats == null){
                    return [];
                }
                return chats.filter(function(item){return item.readed == '1'});
            },
            getChatsFromClickedButton: function(){
                game.$scope().getChatsFromClickedButton = function(key, buttonKey, id){
                    //All data
                    var table = 'chats?transform=1';
                    //Get only data from parent
                    table += '&filter[]=parent,eq,'+id;
                    table += '&filter[]=clicked,eq,'+buttonKey;

                    $.ajax({
                        url: DB.get('apiURI') + '/'+table,
                        method: 'GET'
                    }).then(function(data) {
                        console.log(data.chats);
                        game.$scope().setTypedInterval(Chats.convertChatButtonsToJSON(data.chats));
                    });
                };
            },
            setChatsToDefaultFromClickedButton: function(key, id){
                var chats = Chats.getChats();


                for(var i=0;i<chats.length;i++){
                    if(chats[i].parent == id){



                        for(var o=0;o<chats.length;o++){
                            if(chats[i].id == chats[o].parent){
                                chats.splice(o,1);
                                o = -1;
                            }
                        }


                        chats.splice(i,1);
                        i = -1;
                    }
                }


                DB.set('chats', chats);

                var readedChatsList = game.$scope().readedChatsList;

                for(var i=0;i<readedChatsList.length;i++){
                    if(readedChatsList[i].parent == id){
                        this.setInactiveUnder(id);


                        for(var o=0;o<readedChatsList.length;o++){
                            if(readedChatsList[i].id == readedChatsList[o].parent){
                                readedChatsList.splice(o,1);
                                o = -1;
                            }
                        }


                        readedChatsList.splice(i,1);
                        i = -1;
                    }
                }

                console.log(readedChatsList);
                console.log(chats);

                game.$scope().readedChatsList = readedChatsList;
                game.$ionicHistory().clearCache();

            },
            /**
             * Adds item to game view-scope
             * @param item
             */
            addChatListItem: function(item, index){
                item.readed = '1';

                var readedChatsList = game.$scope().readedChatsList;
                var foundIndex = -1;
                readedChatsList.forEach(function(readedItem, i){
                    if(readedItem.id == item.id){
                        foundIndex = i;
                        return;
                    }
                });

                var chats = Chats.getChats();

                if(foundIndex == -1){
                    readedChatsList.push(item);
                    chats[readedChatsList.length-1] = item;
                }else{
                    readedChatsList[foundIndex] = item;

                    var foundedChatIdex = -1;
                    chats.forEach(function(chatItem, i){
                        if(chatItem.id == item.id){
                            foundedChatIdex = i;
                            return;
                        }
                    });
                    chats[foundedChatIdex] = item;
                }



                DB.set('chats', chats);

                //Clears out the app’s entire history, except for the current view.
                game.$ionicHistory().clearHistory();
                game.$ionicHistory().clearCache();
            },
            /**
             * Registers enter-event for game view
             */
            viewEntered: function(){
                game.$scope().$on('$ionicView.enter', function(e) {

                    console.log('enteredgame');
                    var offline = DB.get('Offline');
                    if(offline) {
                        /**
                         * Offline-Modus required
                         */
                        if(Chats.getScope('gameScope') == null){
                            console.log('gameScope is null. ');

                        }else{
                            game.synchronizeLocalDB(Chats.getScope('gameScope'), DB.get('apiURI'));
                        }
                        console.log(Chats.getScopes());
                    }else{
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
                    $('#ion-item_' + itemID)[0].className = $('#ion-item_' + itemID)[0].className.replace('item', '');
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
                };
            },
            setInactiveUnder: function(key){
                console.log(key);

                var indexOfActiveButton = game.$scope().existsActiveID(key);
                console.log(indexOfActiveButton);
                if (indexOfActiveButton != -1) {
                    game.$scope().active.splice(indexOfActiveButton, 1);
                }
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
                    var activeButtons =  game.$scope().active;
                    var readedChatList = game.$scope().readedChatsList;

                    activeButtons.forEach(function (value) {
                        if (key == value.key && buttonKey == value.buttonKey) {
                            isActive = true;
                            return;
                        }
                    });


                    if(activeButtons.length == 0 && !isActive && buttonKey == readedChatList[key].clicked){
                       isActive = true;
                    }

                    return isActive; //Event from view in ng-click of button
                };
            },

            showConfirms: function () {
                /**
                 * Confirmation popup-window comes out, if user clicks to change the story
                 * @param key
                 * @param buttonKey
                 * @param content Object {title: '', message: ''}
                 */
                game.$scope().showConfirmStory = function (key, buttonKey, parentID, id, content) {
                    var confirmObject = {
                        title: content.title,
                        template: content.message,
                        key: key,
                        buttonKey: buttonKey,
                        parentID: parentID,
                        id: id,
                    };
                    var confirmPopup = game.$ionicPopup().confirm(confirmObject);
                    confirmPopup.then(function (res) {
                        if (res) {
                            game.$scope().setActive(confirmObject.key, confirmObject.buttonKey);
                            game.$scope().changeStory(confirmObject.key, confirmObject.buttonKey, confirmObject.id);
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
                            var updatedDate=DB.get('updatedDate') == null ? DB.now() : DB.get('updatedDate');

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

    .factory('Settings', function(Chats, DB, Game){
        var settings = {
            $scope: function(){
                return Chats.getScope('settingsScope');
            },
            $ionicHistory: function(){
                return Chats.getIonicHistory();
            },
            $ionicPopup: function(){
                return Chats.getIonicPopup();
            },
            getSettingsList: function(){
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

            pushNotification: function(){
                return {
                    checked: DB.get('pushNotification') == null ? true : DB.get('pushNotification'),
                    on: "ion-android-notifications",
                    off: "ion-android-notifications-off"
                };
            },

            updateNotification: function(){
                return {
                    checked: DB.get('updateNotification') == null  ? false : DB.get('updateNotification'),
                    icon_on: "ion-alert",
                    icon_off: "ion-ios-loop-strong",
                    status_on: "ion-archive",
                    status_off: "ion-checkmark",
                    info_on: "vorhanden",
                    info_off: "auf dem aktuellsten Stand"

                };
            },

            settingsChanged: function(){
                settings.$scope().settingsNotificationChange = function(item){
                    //Fixed: Save settings to DB
                    DB.set(item.text, item.checked);
                    console.log('Settings Change', item);
                }
            },

            pushNotificationChanged: function(){
                settings.$scope().pushNotificationChange = function(){
                    //Fixed: Save notification to DB
                    DB.set('pushNotification', settings.$scope().pushNotification.checked);
                    console.log('Push Notification Change', settings.$scope().pushNotification.checked);
                }
            },

            updateNotificationClicked: function(){
                settings.$scope().updateNotificationClick = function(){
                    if(settings.$scope().updateNotification.checked){
                        //TODO: Auto-Event to check if new version there
                        settings.$scope().updateNotification.checked = !settings.$scope().updateNotification.checked;
                        Game.synchronizeLocalDB();

                    }

                }
            },

            getChapterList: function(){
                var chapters = Chats.getChapters();
                return chapters;
            },

            addChapterListItem: function(item){

                if(!settings.checkChapterExists(item)){
                    settings.$scope().chapterList.push(item);
                    //Clears out the app’s entire history, except for the current view.
                    settings.$ionicHistory().clearHistory();
                }
            },
            viewEntered: function(){
                settings.$scope().$on('$ionicView.enter', function(e) {
                    console.log('entered settings');


                    //TODO: Aktualisiere das Geschichtsverlauf nach Wechseln der Tab
                    //TODO: Kapitels auslesen anhand des lokalen DBs
                    settings.addChapterListItem({ text: "Kapitel 1", value: "nlabla 1" });


                    /**
                     * TODO: Check if there is new version to modify or update
                     */
                    var downloadedUpdates = DB.get('downloadedUpdates');
                    var table = 'updates?transform=1';
                    $.ajax({
                        url: DB.get('apiURI') + '/'+table,
                        method: 'GET'
                    }).then(function(data) {
                        DB.set('downloadedUpdates', data.updates);
                        downloadedUpdates = DB.get('downloadedUpdates');

                        console.log(1);
                        DB.set('updatedDate', DB.get('updatedDate') == null ? DB.now() : DB.get('updatedDate'));
                        DB.set('updatedVersion', DB.get('updatedVersion') == null ? 1 : DB.get('updatedVersion'));


                        var updatedDateLocal = DB.get('updatedDate');
                        var updatedVersionLocal = DB.get('updatedVersion');

                        var updatedDate = DB.now();
                        var updatedVersion = 1;
                        if(downloadedUpdates.length > 0){
                            updatedDate = downloadedUpdates[downloadedUpdates.length-1].date;
                            updatedVersion = downloadedUpdates[downloadedUpdates.length-1].version;
                        }

                        console.log(updatedDate);
                        console.log(updatedDateLocal);
                        console.log(updatedVersion);
                        console.log(updatedVersionLocal);
                        if(updatedDate != updatedDateLocal && updatedVersion > updatedVersionLocal){
                            console.log('update');
                            if((DB.get('chats').length != DB.get('downloadedChats').length && DB.get('chats').length < DB.get('downloadedChats').length) || DB.get('chats').length == DB.get('downloadedChats').length){
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
            chapterChanged: function(){
                console.log($scope);
                settings.$scope().chapterChange = function(item) {
                    console.log("Selected Chapter, text:", item.text, "value:", item.value);
                };
            },
            getLastChapter: function(){
                var lastChapter = null;
                Game.$scope().readedChatsList.forEach(function(item){
                    if(typeof(item.chapter) != 'undefined'){
                        lastChapter = item.chapter;
                    }
                });

                return lastChapter;
            },
            checkChapterExists: function($chapter){
                var returnValue = false;
                settings.$scope().chapterList.forEach(function(item){
                    if($chapter.text == item.text && $chapter.value == item.value){
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

        return {
            getChats: function(){
                var chats = DB.get('chats');
                if(chats == null){
                    return chats;
                }

                return this.convertChatButtonsToJSON(chats);
            },
            convertChatButtonsToJSON: function(chats){
                chats.forEach(function(item, index){
                    if(item.isButton != null){
                        item.buttons = typeof(item.buttons) == 'object' ? item.buttons : JSON.parse(item.buttons);
                    }
                    chats[index].buttons = item.buttons;
                });
                return chats;
            },
            getScopes: function(){
                return scopes;
            },
            getScope: function(scopeName){
                var $scope = null;
                scopes.forEach(function(item){
                    if(item.scopeName == scopeName){
                        $scope = item.scope;
                    }
                });
                return $scope;
            },
            setScope: function(scopeObject) {
                if(this.getScopes().length == 0){
                    scopes.push(scopeObject);
                }else{
                    scopes.forEach(function(item){
                        if(item.scopeName == scopeObject.scopeName){
                            scopes[scopeObject.scopeName] = scopeObject.scope;
                        }else{
                            scopes.push(scopeObject);
                        }
                    });
                }
            },
            setIonicHistory: function($ionicHistory){
                ionicHistory = $ionicHistory;
            },
            getIonicHistory: function(){
                return ionicHistory;
            },

            setIonicPopup: function($ionicPopup){
                ionicPopup = $ionicPopup;
            },
            getIonicPopup: function(){
                return ionicPopup;
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
