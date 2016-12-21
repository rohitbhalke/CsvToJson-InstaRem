(function(){

    $(window).load(function(){
       initialize();
    });

    function initialize() {
        var socket = io();
        var body = $('body');
        socket.on('msg', function(msg){
            if(msg.length !== 0){
                body.text(JSON.stringify(msg));
            }
        });
    }

})();