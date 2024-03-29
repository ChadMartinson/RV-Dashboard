/* */ 
"format cjs";
define(function () {

    /**
     * Get sign of the value.
     */
    function sign(val) {
        var num = Number(val);
        if (num === 0) return num; // +0 and +0 === 0
        if (isNaN(num)) return num; // NaN
        return num < 0? -1 : 1;
    }

    return sign;

});
