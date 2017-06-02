window.setTimeout(wireEvents, 1000);

function wireEvents() {
    console.log("wiring autocomplete");
    var textlen = $("#query").val().length *2;
    $("#query").keyup(function() {
    delay(function(){
      inputChanged();
    }, 1000 );
});
    $("#query").focus();
    $("#query")[0].setSelectionRange(textlen, textlen)
}


function inputChanged(){
    var text = $("#query").val();
    text = encodeURI(text);
    console.log("changed" + text);
    $("#tweetData").load("/search?text=" + text );
}

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();