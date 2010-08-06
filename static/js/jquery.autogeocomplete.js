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
            lat = options.lat;
            lng = options.lng;
            map_zoom = options.map_zoom;   
            
            // init google map and geocoder
            this.initialize();
            geocoder = new google.maps.Geocoder();
            
            this.autocomplete({
            
                // fetch address values
                source: function(request, response) {
                    geocoder.geocode( {'address': request.term, 'region': 'US' }, function(results, status) {
                        
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
                mapTypeControl : false,
            }
            map = new google.maps.Map(document.getElementById(map_window_id), myOptions); 
            marker = new google.maps.Marker({
                map: map,
                draggable: false
            }); 
        }
            
    });
    
    // set default values for everything
    $.fn.autogeocomplete.defaults = {    
        map_frame_id: "mapframe",
        map_window_id: "mapwindow",
        lat_id: "filter_lat",
        lng_id: "filter_lng",
        lat: "37.7749295",
        lng: "-122.4194155",
        map_zoom: 13, 
    };
    
})(jQuery);

