angular.module('starter.homeController', ['ionic', 'ngCordova', 'ui.bootstrap'])

    .controller('HomeCtrl', function ($scope, $timeout, $ionicLoading, Chats) {

        // Setup the loader
        $ionicLoading.show({
            template: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        // Set a timeout to clear loader, however you would actually call the $ionicLoading.hide(); method whenever everything is ready or loaded.
        $timeout(function () {
            $ionicLoading.hide();
            $scope.stooges = [{name: 'Moe'}, {name: 'Larry'}, {name: 'Curly'}];
        }, 2000);

        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        $scope.$on('$ionicView.enter', function (e) {
            //TODO: Aktualisiere das Kartenbild der letzten vorhandenen Sequenz
        });


    })

    .controller('HomeDetailCtrl', function ($scope, $stateParams, Chats) {
        $scope.chat = Chats.get($stateParams.chatId);
    })
;
