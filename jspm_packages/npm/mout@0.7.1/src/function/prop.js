/* */ 
"format cjs";
define(function () {

    /**
     * Returns a function that gets a property of the passed object
     */
    function prop(name){
        return function(obj){
            return obj[name];
        };
    }

    return prop;

});
