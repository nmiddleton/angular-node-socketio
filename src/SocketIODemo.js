// This socket is per browser session in a factory style

angular.module('SocketIODemo', ['ngSanitize']).factory('sharedModel', function($rootScope) {
//    var model = {name:{first:'', last:''}};         // initialize sharedmodel with empty values
    var model = {filterText:''};                    // initialize sharedmodel with empty values
    var lastModel = angular.copy(model);            //initialize it to be the same as model

    // connect to the server.js that is listening on 8889
    var socket = io.connect('http://localhost:8889/');

    // when we get something emitted onto the socket
    socket.on('channel', function(message){                 //{ path: 'name.last', value: 'Middleto' }
        setProp(model, message.path, message.value);        // update the model based on the the message e.g. {name:{first:'', last:''}} -> {name: {first: "Neil", last: "Middleto"}}
        setProp(lastModel, message.path, message.value);    // update the last  based on the the message e.g. {name:{first:'', last:''}} -> {name: {first: "Neil", last: "Middleto"}}
        // set the model to equal
        // {
        //  name: {
        //      first: "Neil",
        //      last: "Middleto"
        //         }
        // }
        // Put it on the $root scope sharedmodel
        $rootScope.sharedModel = model;
        $rootScope.$apply();
        // End of dealing with an EMIT
    });

    // Put a watch of the sharedmodel and call the syncObject function if it changes.
    $rootScope.$watch('sharedModel', function() {
        syncObject('', model, lastModel);
    }, true);

    return model;

    function setProp(obj, path, value) {
        if (!path) return angular.copy(value, obj);
        var lastObj = obj;
        var property;
        angular.forEach(path.split('.'), function(name){
            if (name) {
                lastObj = obj;
                obj = obj[property=name];
                if (!obj) {
                    lastObj[property] = obj = {};
                }
            }
        });
        lastObj[property] = angular.copy(value);
    };

    // A function to emit the change onto the socket channel
    function syncObject(parent, src, dst) {         //  '', {name: {first: "Neil", last: "Middleto"}}, lastModel
        for(var name in src) {                      // iterate the properties in the model object
            var path = (parent ? parent + '.' : '') + name;  // is there a parent property?
            if (src[name] === dst[name]) {
                // do nothing we are in sync
            } else if (typeof src[name] == 'object') {
                // we are an object, so we need to recurse
                syncObject(path, src[name], dst[name] || {});
            } else {
                // we changed a value emit that change
                socket.emit("channel", {path:path, value:src[name]});
                dst[name] = angular.copy(src[name]);
            }
        }
    }


});

function FormController($scope, sharedModel){
}
//FormController.$inject = ['$scope', 'sharedModel'];

