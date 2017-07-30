







function quickSearchInit() {
    var $inpBox = $( "#wikisearch" );
    $inpBox.autocomplete({
        source: function( request, response ) {
            $.ajax({
                url: "wikiSearchMirror/",
                dataType: "json",
                data: {
                    keyword: request.term
                },
                success: function( data ) {
                    names = data[1];
                    links = data[3];
                    var result = [];
                    for (var i=0; i<names.length; i++) {
                        nm = names[i];
                        lk = links[i];
                        var newObj = {};
                        newObj['label'] = nm;
                        newObj['value'] = lk;
                        result.push(newObj);
                    }
                    response(result);
                }
            });
        },
        select: function( event, ui ) {
            refreshGraph(ui.item.value);
            // console.log($inpBox.val());
    },
    messages: {
      noResults: '',
      results: function() {}
  },
  minLength:3,
  delay:800
});
}







function refreshGraph(wikiURL) {
    $.ajax({
            type: 'GET',
            url: "wikiGraphData/",
            dataType: "json",
            data: {
                wikipagetitle: wikiURL
                },
          success: function (data) {
            addANewGraph(data, wikiURL);
          }
        });
    }






function addANewGraph(jsonDataForGraph, graphSrc) {
    clearScene();
    var msgArray = [];
    var retMesg = "";
    msgArray.push(retMesg);
    updateGraph(jsonDataForGraph, graphSrc, msgArray);
    retMesg = msgArray[0];
    if (retMesg != "") {
        console.log(retMesg);
    }
}





