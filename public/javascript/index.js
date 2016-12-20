(function(){

    $(window).load(function(){
       initialize();
    });

    function initialize() {
        var socket = io();
        var body = $('body');
        socket.on('msg', function(msg){
            body.text(JSON.stringify(msg));
        });
    }

})();