var audio = {
    $cordovaNativeAudio: null,

    initialize: function() {

        this.bindEvents();
    },

    bindEvents: function() {

        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
        audio.receivedEvent('deviceready');
        console.log('deviceready');
    },

    receivedEvent: function(id) {

        if( window.plugins && window.plugins.NativeAudio ) {
            $("#audioCanBePlayed").attr('audioCanBePlayed', true).trigger('change');
            this.$cordovaNativeAudio = window.plugins.NativeAudio;

            var items = ['bass', 'snare', 'highhat', 'bongo'];
            for(var i=0; i<items.length; i++) {
                var asset = 'assets/' + items[i] + '.mp3';
                this.$cordovaNativeAudio.preloadSimple(items[i], asset);
            }
        }
    },

    play: function(sound) {
            this.$cordovaNativeAudio.play(sound);
    },
    stop: function(sound){
        this.$cordovaNativeAudio.stop(sound);
    }
};