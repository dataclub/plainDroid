var app = angular.module('starter.audio', ['ionic', 'ngCordova']);

    app.controller("AudioController", function($scope, $cordovaNativeAudio, $timeout, $ionicPlatform) {
        var vm = this;
        document.addEventListener('deviceready', function(){
            if( window.plugins && window.plugins.NativeAudio ) {
                //$("#audioCanBePlayed").attr('audioCanBePlayed', true).trigger('change');

                var items = ['bass', 'snare', 'highhat', 'bongo', 'ambient'];
                for(var i=0; i<items.length; i++) {
                    var asset = 'assets/' + items[i] + '.mp3';
                    $cordovaNativeAudio.preloadComplex(items[i], asset, 1, 1)
                        .then(function (msg) {
                            console.log(msg);
                        }, function (error) {
                            //alert(error);
                        });
                }
                $cordovaNativeAudio.loop('ambient');
            }



        }, false);

        vm.play = function(sound) {
            $cordovaNativeAudio.play(sound);
        };

        return vm;
    });
