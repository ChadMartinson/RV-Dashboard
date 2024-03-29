/* */ 
"format cjs";
define(function () {

    /**
     * ES6 Number.isNaN
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN
     */
    function isNaN(val){
        // jshint eqeqeq:false
        return typeof val === 'number' && val != val;
    }

    return isNaN;

});
