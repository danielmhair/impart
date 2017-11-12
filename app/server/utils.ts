export class Utils {
  public static getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  public static uniqueItems(duplicatesArr) {
    var arr = [];
    duplicatesArr.forEach(function(item) {
      if(arr.indexOf(item) == -1) {
        arr.push(item);
      }
    })
    return arr;
  }
}
