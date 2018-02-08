var jsonQ = require("jsonq");
var SpotifyWebApi = require("spotify-web-api-node");
var spotifyApi = new SpotifyWebApi();

$(document).ready(function() {
  for(i=0; i<6; i++){
    $("#palette").append("<div class='swatch' id='"+i+"'></div>");
  }
  $("#getArtwork").on("click", function() {
    $(".finals").hide();
    ////////////////--: GET TOKEN :--///////
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/token/", false);
    xhttp.setRequestHeader("Content-type", "x-www-form-urlencoded");
    xhttp.send();
    var response = xhttp.responseText;
    var token = jsonQ(response)
      .find("token")
      .value();
    spotifyApi.setAccessToken(token);
    ////////////////--: GET ARTWORK :--///////
    var searchQuery = $("#album").val();
    $(".finals").fadeTo(700, 1);
    spotifyApi.searchAlbums(searchQuery).then(
      function(data) {
        var albums = data.body.albums.items;
        var currentAlbum = albums[0].images;
        var currentArtwork = currentAlbum[0].url;
        var img = document.getElementById("#albumView");
        img.crossOrigin = "Anonymous";
        img.setAttribute("src", currentArtwork);
        Vibrant.from(img)
          .getPalette()
          .then(function(palette) {
            var jsonObj = jsonQ(palette);
            colors = jsonObj.find("_rgb").value();
            
            for(i=0; i<colors.length; i++){
            $("#"+i).css("background-color", "rgb(" + colors[i] + ")");
            }
            $(".get").css("color", "rgb(" + colors[3] + ")");
            $(".underline").css("border-color", "rgb(" + colors[3] + ")");
          });
      },
      function(err) {
        console.error(err);
      }
    );
    $(".get").text("Swatches");
    $("h1").addClass("underline");
  });
});