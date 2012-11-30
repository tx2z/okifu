	(function($) {
		/* TAKE URL VARIABLES */
		function getUrlVars() {
		    var vars = {};
		    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		        vars[key] = value;
		    });
		    return vars;
		}

		/* SEARCH TAGS */
		function searchTags(tagQ) {
			$.ajax({
		        type: "GET",
		        dataType: "jsonp",
		        cache: false,
		        url: 'https://api.instagram.com/v1/tags/search?q=' + tagQ + '&access_token=1152852.43491d4.a0dde22237d54651a99d08db504dcb2a',
		        success: function(data) {
		        	$('#tagsResults').html('');
		        	resultNum = data.data.length;
		        	if (resultNum == 0) {
		        		$('#tagsResultsTitle').html('No results, please try again.');
		        	}else{
		        		$('#tagsResultsTitle').html('Tags:');
			        	for (var i = 0; i < resultNum; i++) {
							$('#tagsResults').append(' <a href="index.html?tag=' + data.data[i].name + '" target="_top">' + data.data[i].name + '</a> ');
						}
					}
		        }
			});
		}

		/* SEARCH USERS */
		function searchUsers(userQ) {
			$.ajax({
		        type: "GET",
		        dataType: "jsonp",
		        cache: false,
		        url: 'https://api.instagram.com/v1/users/search?q=' + userQ + '&access_token=1152852.43491d4.a0dde22237d54651a99d08db504dcb2a',
		        success: function(data) {
		        	$('#usersResults').html('');
		        	resultNum = data.data.length;
		        	if (resultNum == 0) {
		        		$('#usersResultsTitle').html('No results, please try again.');
		        	}else{
		        		$('#usersResultsTitle').html('Users:');
			        	for (var i = 0; i < resultNum; i++) {
							$('#usersResults').append(' <a href="index.html?user=' + data.data[i].id + '" target="_top">' + data.data[i].username + '</a> ');
						}
					}
		        }
			});
		}

		/* SEARCH LOCATIONS */
		function searchLocations(lat, lng) {
			$.ajax({
		        type: "GET",
		        dataType: "jsonp",
		        cache: false,
		        url: 'https://api.instagram.com/v1/locations/search?lat=' + lat + '&lng=' + lng + '&access_token=1152852.43491d4.a0dde22237d54651a99d08db504dcb2a',
		        success: function(data) {
		        	$('#locationsResults').html('');
		        	resultNum = data.data.length;
		        	if (resultNum == 0) {
		        		$('#locationsResultsTitle').html('No results, please try again<br /><small>Tip: Make zoom in the map for better results</small>');
		        	}else{
		        		$('#locationsResultsTitle').html('Locations:');
			        	for (var i = 0; i < resultNum; i++) {
							$('#locationsResults').append(' <a href="index.html?location=' + data.data[i].id + '" target="_top">' + data.data[i].name + '</a> ');
						}
					}
		        }
			});
		}

		/* OPENLAYERS FUNCTIONS*/
		OpenLayers.ImgPath = "_assets/img/openlayer/";
	    OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
	        defaultHandlerOptions: {
	            'single': true,
	            'double': false,
	            'pixelTolerance': 0,
	            'stopSingle': false,
	            'stopDouble': false,
	        },

	        initialize: function(options) {
	            this.handlerOptions = OpenLayers.Util.extend(
	                {}, this.defaultHandlerOptions
	            );
	            OpenLayers.Control.prototype.initialize.apply(
	                this, arguments
	            ); 
	            this.handler = new OpenLayers.Handler.Click(
	                this, {
	                    'click': this.trigger
	                }, this.handlerOptions
	            );
	        }, 

	        trigger: function(e) {
	            var lonlat = map.getLonLatFromPixel(e.xy);
				var projWGS84 = new OpenLayers.Projection("EPSG:4326");
				var proj900913 = new OpenLayers.Projection("EPSG:900913");
				var lonlat = lonlat.transform(proj900913  , projWGS84 );
	            $("input[name=locationsLat]").val(lonlat.lat);
	            $("input[name=locationsLng]").val(lonlat.lon);
	            searchLocations($("input[name=locationsLat]").val(),$("input[name=locationsLng]").val());
	        }

	    });
	    var map;
	    function init() {
	        map = new OpenLayers.Map("map", {
        		theme: null
    		});
	        map.addLayer(new OpenLayers.Layer.OSM());
    		map.zoomToMaxExtent();
	        map.setCenter(new OpenLayers.LonLat(1878516.406875,5792092.2545312),2);	        
	        var click = new OpenLayers.Control.Click();
	        map.addControl(click);
	        click.activate();

	    }
	    
		/* GET LOCATION */
		function getNearPositions(position){
			$("input[name=locationsLat]").val(position.coords.latitude);
			$("input[name=locationsLng]").val(position.coords.longitude);
			searchLocations($("input[name=locationsLat]").val(),$("input[name=locationsLng]").val());	
		}
		
		/* DOCUMENT READY */
		$(document).ready(function() {

			/* AUTOFILL FORM IF PARAMETRES */
			var tag = getUrlVars()["tag"];
			var user = getUrlVars()["user"];
			if (tag != undefined) {
				$("input[name=tags]").val(tag);
				searchTags(tag);
			}else if (user != undefined) {
				$("input[name=users]").val(user);
				searchUsers(user);
			}

			/* EVENT FORMS FUNCTIONS*/
			$("input[name=tags]").keyup(function() {
				searchTags($("input[name=tags]").val());
			});

			$("input[name=users]").keyup(function() {
				searchUsers($("input[name=users]").val());
			});
			
			/* GET LOCATION */
			$("#getLocation").click(function() {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(getNearPositions);
				}else{
					$('#locationsResultsTitle').html('Geolocation is not supported, please try a manual search.');
				}
			});

			/* START OPENLAYERS */
			init();

		});

	})(window.jQuery);