$(document).ready(function() {
    $.ajax({
        url: "/api/time"
    }).then(function(data) {
       $('.time').append(data.time);
    });
});
