/* */ 
"format cjs";
define(["./max","./pluck","./map"], function (max, pluck, map) {

    function getLength(arr) {
        return arr == null ? 0 : arr.length;
    }

    /**
     * Merges together the values of each of the arrays with the values at the
     * corresponding position.
     */
    function zip(arr){
        var len = arr ? max(map(arguments, getLength)) : 0,
            results = [],
            i = -1,
            item;
        while (++i < len) {
            results.push(map(arguments, function(item) {
                return item == null ? undefined : item[i];
            }));
        }

        return results;
    }

    return zip;

});
