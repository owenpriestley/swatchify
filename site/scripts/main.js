var jsonQ = require('jsonq');
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi();

$(document).ready(function () {
    $("#getArtwork").on('click', function () {
    ////////////////--: GET TOKEN :--///////
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", '/token/', false);
        xhttp.setRequestHeader("Content-type", "x-www-form-urlencoded");
        xhttp.send();
        var response = xhttp.responseText;
        var token = jsonQ(response).find('token').value();
        spotifyApi.setAccessToken(token);
    ////////////////--: GET ARTWORK :--///////
        var searchQuery = $("#album").val();
        spotifyApi.searchAlbums(searchQuery)
            .then(function (data) {
                var albums = data.body.albums.items
                console.log(albums);
                var currentAlbum = albums[0].images
                var currentArtwork = currentAlbum[0].url;
                console.log(currentAlbum);
                var img = document.getElementById('#albumView');
                img.crossOrigin = "Anonymous";
                img.setAttribute('src', currentArtwork);
                Vibrant
                    .from(img)
                    .getPalette()
                    .then(function (palette) {
                        var jsonObj = jsonQ(palette);
                        colors = jsonObj.find('_rgb').value();
                        $("#1").css('background-color', 'rgb(' + colors[0] + ')')
                        $("#2").css('background-color', 'rgb(' + colors[1] + ')')
                        $("#3").css('background-color', 'rgb(' + colors[2] + ')')
                        $("#4").css('background-color', 'rgb(' + colors[3] + ')')
                        $("#5").css('background-color', 'rgb(' + colors[4] + ')')
                        $("#6").css('background-color', 'rgb(' + colors[5] + ')')
                        $("#h1").css('color', 'rgb(' + colors[3] + ')')

                        $("#swapArtwork").on('click', function () {
                            console.log('before ' + currentAlbum[0].value);
                            albums.shift();
                            console.log('after ' + currentAlbum[0].value);
                        });
                    })
            }, function (err) {
                console.error(err);
            });
            $(".get").text('Palette');
            $("h1").addClass('underline');
    });
});

/* MODAL HELP, IF YA WANNIT

    // Get the modal
window.onload = function () {
    var modal = document.getElementById("helpBox");

    // Get the button that opens the modal
    var btn = document.getElementById("helpButt");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on the button, open the modal 
    btn.onclick = function () {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    } 
}*/