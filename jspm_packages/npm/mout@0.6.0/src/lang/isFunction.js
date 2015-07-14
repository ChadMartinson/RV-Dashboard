/* */ 
"format cjs";
define(["./isKind"], function (isKind) {
    /**
     */
    function isFunction(val) {
        return isKind(val, 'Function');
    }
    return isFunction;
});
