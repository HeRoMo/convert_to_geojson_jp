
function Utils(){};

Utils.code5to6=function(code5){
  var code5str = code5.toString(10)
  var code5array = code5str.split('')
  var digit = code5array.length + 1
  var sum = code5array.reduce(function(pre,cur,i){
    return pre + parseInt(cur,10)*(digit-i)
  }, 0)
  var check = (11 - (sum % 11)) % 10
  return ("000000"+code5str+check).substr(-6)
}

module.exports = Utils
