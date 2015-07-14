/* */ 
"format cjs";
define(["./isKind"], function (isKind) {
    /**
     */
    function isBoolean(val) {
        return isKind(val, 'Boolean');
    }
    return isBoolean;
});
