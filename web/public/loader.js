window.setTimeout(reloadFunction, 1000);

function reloadFunction() {
    console.log("refreshed data");
    $("#tweetData").load("/");
}