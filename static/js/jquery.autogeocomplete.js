/*------------------------------------------------------

	@Google Maps Autocomplete

------------------------------------------------------- */

(function($) {

    // google map variables
    var geocoder;
    var map;
    var marker;
    
    // set this to true if you want US only results
    var US_only = false;
    
    // set plugin options
    var map_frame_id;
    var map_window_id;
    var lat_id;
    var lng_id;
    var addr_id;
    var lat;
    var lng;
    var map_zoom;


    $.fn.extend({
        
        autogeocomplete: function(options){
        
            // extend plugin options            
            options = $.extend({}, $.fn.autogeocomplete.defaults, options);
            map_window_id = options.map_window_id;
            map_frame_id = options.map_frame_id;
            lat_id = options.lat_id;
            lng_id = options.lng_id;
            addr_id = options.addr_id;
            lat = options.lat;
            lng = options.lng;
            map_zoom = options.map_zoom;   
            
            // init google map and geocoder
            this.initialize();
            geocoder = new google.maps.Geocoder();
            
            this.autocomplete({
            
                // fetch address values
                source: function(request, response) {
                    geocoder.geocode( {'address': request.term}, function(results, status) {
                        
                        // limit number of returned values to top 5
                        var item_count = 0;
                        
                        // limit to US only results
                        var filter_results = [];
                       
                        if(US_only){
                            $.each(results, function(item){
                                if(results[item].formatted_address.toLowerCase().indexOf(", usa") !== -1)
                                {
                                    filter_results.push(results[item]);
                                }
                            });
                        }
                        else{
                            filter_results = results;
                        }

                        // default render map to top result
                        setMap(filter_results[0].geometry.location.lat(), filter_results[0].geometry.location.lng());
                        
                        // parse and format returned suggestions
                        response($.map(filter_results, function(item) {
                        
                            // split returned string
                            var place_parts = item.formatted_address.split(",");
                            var place = place_parts[0];
                            var place_details = "";
                            
                            // parse city, state, and zip
                            for(i=1;i<place_parts.length;i++){
                                place_details += place_parts[i];
                                if(i !== place_parts.length-1) place_details += ",";
                            }
                            
                            // return top 5 results
                            if (item_count < 5) {
                                item_count++;
                                return {
                                    label:  place,
                                    value: item.formatted_address,
                                    desc: place_details,
                                    latitude: item.geometry.location.lat(),
                                    longitude: item.geometry.location.lng()
                                }
                            }

                        }));
                    })
                },
                // set the minimum length of string to autocomplete
                minLength: 4,
                // set geocoder data when an address is selected
                select: function(event, ui) {
                    $("#" + lat_id).val(ui.item.latitude);
                    $("#" + lng_id).val(ui.item.longitude);
                },
                // set map to visible when autosuggester is activated
                open: function(event, ui){
                    $("#" + map_frame_id).css("visibility", "visible");
                    $("#" + map_frame_id).css("z-index", "5");
                    $("#" + map_window_id).css("z-index", "5");
                    $(".ui-autocomplete").css("z-index", "-1");
                    
                    // hard coded css width in javascript to avoid editing jQuery css files
                    $('.ui-menu-item').css("width", "200px");
                },
                // set map to invisible when autosuggester is deactivated
                close: function(event, ui){
                    $("#" + map_frame_id).css("visibility", "hidden");
                },
                // update map rendering on mouseover / keyover
                focus: function(event, ui){
                    setMap(ui.item.latitude, ui.item.longitude);                
                }             
            })
            // format how each suggestions is presented
            .data( "autocomplete" )._renderItem = function( ul, item ) {
			     return $( "<li></li>" )
				    .data( "item.autocomplete", item )
    				.append( "<a><strong>" + item.label + "</strong><br>" + item.desc + "</a>" )
	       			.appendTo( ul );
            };
            
            // update geo coordinates and refresh map display
            function setMap(lat, lng){
                $("#" + lat_id).val(lat);
                $("#" + lng_id).val(lng);
                map_location = new google.maps.LatLng(lat, lng);
                marker.setPosition(map_location);
                map.setCenter(map_location);     
            }
        },
        
        initialize: function(){
           
            // init map
            var latlng = new google.maps.LatLng(lat, lng);
            var myOptions = {
                zoom: map_zoom,
                center: latlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                scaleControl : false,
                mapTypeControl : false
            }
            map = new google.maps.Map(document.getElementById(map_window_id), myOptions); 
            marker = new google.maps.Marker({
                map: map,
                draggable: false
            }); 
            
            google.maps.event.addListener(map, 'click', function(event){
            
                // put the lat and lng values in the input boxes
                $("#" + lat_id).val(event.latLng.b);
                $("#" + lng_id).val(event.latLng.c);
                
                // set marker position to event click
                var marker_position = event.latLng;
                
                // create new marker
                var newMarker = new google.maps.Marker({
                    map: map,
                    draggable: false,
                    position: marker_position
                });
                
                // create a new geocode object to reverse geocode click position
                var reversegeocoder = new google.maps.Geocoder();
                
                // geocoder returns an array or nearest matching address, take the first result and put it in the relevant drop down box 
                reversegeocoder.geocode({ 'latLng': event.latLng }, function(results, status){
                    $("#" + addr_id).val(results[0].formatted_address);
                });        
            });
        }
            
    });
    
    // set default values for everything
    $.fn.autogeocomplete.defaults = {    
        map_frame_id: "mapframe",
        map_window_id: "mapwindow",
        lat_id: "filter_lat",
        lng_id: "filter_lng",
        addr_id: "filter_address",
        lat: "37.7749295",
        lng: "-122.4194155",
        map_zoom: 13 
    };
    
})(jQuery);

