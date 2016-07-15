angular.module('starter.audio', ['ionic', 'ngCordova'])

    .controller("SoundController", function($scope, $cordovaNativeAudio, $timeout) {

        console.log(1);
        var vm = this;


        document.addEventListener('deviceready', function(){
            /*
            $cordovaNativeAudio
                .preloadSimple('bass', 'assets/bass.mp3')
                .then(function (msg) {
                    console.log(msg);
                }, function (error) {
                    alert(error);
                });
*/
            if( window.plugins && window.plugins.NativeAudio ) {
                //$("#audioCanBePlayed").attr('audioCanBePlayed', true).trigger('change');

                var items = ['bass', 'snare', 'highhat', 'bongo'];
                for(var i=0; i<items.length; i++) {
                    var asset = 'assets/' + items[i] + '.mp3';
                    $cordovaNativeAudio.preloadSimple(items[i], asset);
                }
            }



        }, false);

        vm.play = function(sound) {
            $cordovaNativeAudio.play(sound);
        };

        return vm;


        /*

*/
    });
