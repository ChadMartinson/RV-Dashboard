/* */ 
"format cjs";
define(function () {

    /**
     * Iterates over a callback a set amount of times
     */
    function times(n, callback, thisObj){
        var i = -1;
        while (++i < n) {
            if ( callback.call(thisObj, i) === false ) {
                break;
            }
        }
    }

    return times;

});
