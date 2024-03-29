/* */ 
module.exports = getType

function getType (st) {
  var types =
      [ "Directory"
      , "File"
      , "SymbolicLink"
      , "Link" // special for hardlinks from tarballs
      , "BlockDevice"
      , "CharacterDevice"
      , "FIFO"
      , "Socket" ]
    , type

  if (st.type && -1 !== types.indexOf(st.type)) {
    st[st.type] = true
    return st.type
  }

  for (var i = 0, l = types.length; i < l; i ++) {
    type = types[i]
    var is = st[type] || st["is" + type]
    if (typeof is === "function") is = is.call(st)
    if (is) {
      st[type] = true
      st.type = type
      return type
    }
  }

  return null
}
