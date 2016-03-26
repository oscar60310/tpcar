function put_now_position_marker()
{
	mode = "pre";
	getlocation();
}
function to_now_mode()
{
	mode = "now";
	getlocation();
}
var duration;
var arrive_time;
function pre_search()
{
	set_state(15);

	var directionsService ;
  	var directionsDisplay ;
  	if(directionsService)
  	{
  		directionsDisplay.setMap(null);
  		directionsService = new google.maps.DirectionsService;
  		directionsDisplay = new google.maps.DirectionsRenderer;
  	}
  	directionsService = new google.maps.DirectionsService;
  	directionsDisplay = new google.maps.DirectionsRenderer;
  	directionsDisplay.setMap(map);

  	
  	var d = new Date();
  	directionsService.route({
  	transitOptions:{
  		departureTime: d
  	},
    origin: from_pos,
    destination: user_pos,
    travelMode: google.maps.TravelMode.DRIVING
  	}, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
       duration = response.routes[0].legs[0].duration;    
       set_state(17);
       $("#show_targ_name").html("預計到達時間"+duration.text);
      
        search();
    } else {
     set_state(16);
    }
  });


}
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
