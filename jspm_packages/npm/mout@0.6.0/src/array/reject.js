/* */ 
"format cjs";
define(["./forEach","../function/makeIterator_"], function(forEach, makeIterator) {

    /**
     * Array reject
     */
    function reject(arr, callback, thisObj) {
        callback = makeIterator(callback, thisObj);
        var results = [];
        if (arr == null) {
            return results;
        }

        var i = -1, len = arr.length, value;
        while (++i < len) {
            value = arr[i];
            if (!callback(value, i, arr)) {
                results.push(value);
            }
        }

        return results;
    }

    return reject;
});
