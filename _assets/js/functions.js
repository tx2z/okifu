(function($) {

	/* TAKE URL VARIABLES */
	function getUrlVars() {
	    var vars = {};
	    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
	        vars[key] = value;
	    });
	    return vars;
	}

	/* TAKE INSTAGRAM IMAGES */
	function takeImages() {

		var photoID = getUrlVars()["photoID"];
		var tag = getUrlVars()["tag"];
		var location = getUrlVars()["location"];
		var user = getUrlVars()["user"];

		function ajaxCall(onePhoto) {
			$.ajax({
		        type: "GET",
		        dataType: "jsonp",
		        cache: false,
		        url: intagramApiUrl,
		        success: function(data) {
		        	//console.log(data);
		        	if (onePhoto == true) {
		        		$(".preGame").prepend('<img src="' + data.data.images.standard_resolution.url + '" alt="" />').fadeIn(2000);
		        		$("head").append('<style>.gridster ul li { background-image: url(' + data.data.images.standard_resolution.url + ');</style>' );
		        		$('.timer').html('Click on "START GAME"<br /><label><input type="radio" name="gameType" value="9">Easy </label> <label><input type="radio" name="gameType" value="16">Medium</label> <label><input type="radio" name="gameType" value="25">Hard</label>');
	        			var dificulty = getUrlVars()["dificulty"];
	        			if (dificulty == 'medium') {
	        				$('input:radio[name=gameType]')[1].checked = true;
	        			} else if (dificulty == 'hard') {
	        				$('input:radio[name=gameType]')[2].checked = true;
	        			} else {
	        				$('input:radio[name=gameType]')[0].checked = true;
	        			}
		        	} else {
		        		//console.log(data);
		        		if (data.data.length > 0 ){
			        		var resultNum = (data.data.length > 9 ? 9 : data.data.length );
			        		$('.timer').text('Select an image to play with');
			        		if (location != undefined) {
			        			$('.filters').html('Location: <strong>' + data.data[0].location.name + '</strong>');
			        		} else if (user != undefined) {
			        			$('.filters').html('User: <strong>' + data.data[0].user.username + '</strong>');
			        			$('.openPref').attr('href', 'preferences.html?user=' + data.data[0].user.username);
			        		}
			        		for (var i = 0; i < resultNum; i++) {
								$(".gridster ul").append('<li class="imgSelect"><a href="?photoID=' + data.data[i].id + '"><img src="' + data.data[i].images.low_resolution.url + '" alt="' + (data.data[i].caption != null ? data.data[i].caption.text  : '') + '" /></a></li>');
							}
						} else {
							$('.timer').text('Ops. There are no results with the filter that you had used. Please try again with another search.');
						}
		        	}
		        }
			});
		}

		if (photoID != undefined) { // if photoID parameter exis load the photo
			intagramApiUrl = 'https://api.instagram.com/v1/media/' + photoID + '?access_token=1152852.43491d4.a0dde22237d54651a99d08db504dcb2a';
			ajaxCall(true);
			$('.openPref').attr('href', 'preferences.html?photoID=' + photoID);
		} else if (tag != undefined) { // if tag parameter exist
			$('.filters').html('Tag: <strong>' + tag + '</strong>');
			intagramApiUrl = 'https://api.instagram.com/v1/tags/' + tag + '/media/recent?access_token=1152852.43491d4.a0dde22237d54651a99d08db504dcb2a';
			ajaxCall(false);
			$('.openPref').attr('href', 'preferences.html?tag=' + tag);
		} else if (location != undefined) { // if location parameter exist
			intagramApiUrl = 'https://api.instagram.com/v1/locations/' + location + '/media/recent?access_token=1152852.43491d4.a0dde22237d54651a99d08db504dcb2a';
			ajaxCall(false);
		} else if (user != undefined) { // if user parameter exist
			intagramApiUrl = 'https://api.instagram.com/v1/users/' + user + '/media/recent?access_token=1152852.43491d4.a0dde22237d54651a99d08db504dcb2a';
			ajaxCall(false);
		} else { // load ramdom popular image
			$('.filters').html('Recent instagram images (You can choose other images using the "Search Images" button on top)');
			intagramApiUrl = "https://api.instagram.com/v1/media/popular?access_token=1152852.43491d4.a0dde22237d54651a99d08db504dcb2a"
			ajaxCall(false);
		}
	}

	/* INIT GRIDSTER ANS CALL FUNCTIONS WHEN WIDGETS MOVES */
	function initGridster(sizeWidget) {
		$(".gridster ul").gridster({
	        widget_margins: [2, 2],
	        widget_base_dimensions: [sizeWidget, sizeWidget],
	        draggable: {
	        	stop: function(event, ui){ // Function called every time a block has moved
	        		var gridster = $(".gridster ul").gridster().data('gridster');
	        		var serialize = gridster.serialize();
	        		var finishGame = false;
    				$.each(serialize,function(index){
						var buildId = 'block' + serialize[index].row + 'c' + serialize[index].col;
						if (buildId == serialize[index].id){ // Block in good position
							finishGame = true;
						} else {  // Block in bad position (stop the loop)
							finishGame = false;
							return false;
						}
					});
    				if (finishGame == true ){ //All block in their positions
						youWin ();
					}
	        	}
	        }
    	});
	}

	/* DISORGANIZE PUZZLE FUNCTION */
	function arrayShuffle(oldArray) {
		var newArray = oldArray.slice();
	 	var len = newArray.length;
		var i = len;
		while (i--) {
		 	var p = parseInt(Math.random()*len);
			var t = newArray[i];
	  		newArray[i] = newArray[p];
		  	newArray[p] = t;
	 	}
		return newArray;
	};

	function disorganizePuzzle() { // Messing up the widgets

		function disorder(slices,measure) {
			var gridPosition = arrayShuffle(realPosition);
			for (var i = 0; i < slices; i++) {
				var positionWidget = (gridPosition[i]).split("c");
				var posRow = positionWidget[0].toString();
				var posCol = positionWidget[1].toString();
				var idBlock = realPosition[i].toString();
				$(".gridster ul").append('<li data-row="' + posRow + '" data-col="' + posCol + '" data-sizex="1" data-sizey="1" id="block' + idBlock + '"></li>');
			};
			initGridster(measure);
			$(".preGame").fadeOut();
		}

		var gameSlices = $("input[name='gameType']:checked").val();
		if (gameSlices == 9) { // PUZZLE 9
			$(".gridster").addClass('game9');
			var realPosition = ['1c1','1c2','1c3','2c1','2c2','2c3','3c1','3c2','3c3'];
			disorder(9,140);
		} else if (gameSlices == 16) { // PUZZLE 16
			$(".gridster").addClass('game16');
			var realPosition = ['1c1','1c2','1c3','1c4','2c1','2c2','2c3','2c4','3c1','3c2','3c3','3c4','4c1','4c2','4c3','4c4'];
			disorder(16,104);
		} else if (gameSlices == 25) { // PUZZLE 25
			$(".gridster").addClass('game25');
			var realPosition = ['1c1','1c2','1c3','1c4','1c5','2c1','2c2','2c3','2c4','2c5','3c1','3c2','3c3','3c4','3c5','4c1','4c2','4c3','4c4','4c5','5c1','5c2','5c3','5c4','5c5'];
			disorder(25,82);
		}
	}

	/* TIMER */
	jQuery.fn.time_from_seconds = function() {
	    return this.each(function() {
	        var t = parseInt($(this).text(), 10);
	        $(this).data('original', t);
	        var h = Math.floor(t / 3600);
	        t %= 3600;
	        var m = Math.floor(t / 60);
	        var s = Math.floor(t % 60);
	        $(this).text((h > 0 ? h + ' : ': '') + (m > 0 ? (m < 10 ? '0' + m  + ' : ' : m + ' : ') : '00 : ') + (s < 10 ? '0' + s : s ));
	    });
	};
	function startTimer() {
		var start = new Date;
		timeCounter = setInterval(function() {
		    $('.timer').text((new Date - start) / 1000);
		    $('.timer').time_from_seconds();
		}, 1000);
	}
	function stopTimer() {
		clearInterval(timeCounter);
	}

	/* WIN - END GAME */
	// Position modal box in the center of the page
	jQuery.fn.center = function () {
		this.css("position","absolute");
		this.css("top", ( $(window).height() - this.height() ) / 2+$(window).scrollTop() + "px");
		this.css("left", ( $(window).width() - this.width() ) / 2+$(window).scrollLeft() + "px");
		return this;
	  }
	$(".modal-profile").center();
	// Set height of light out div	
	$('.modal-lightsout').css("height", $(document).height());	
	// Fade in modal box once link is clicked
	$('a[rel="modal-profile"]').click(function() {
		youWin();
	});
	/* closes modal box once close link is clicked, or if the lights out divis clicked
	$('a.modal-close-profile, .modal-lightsout').click(function() {
		$('.modal-profile').fadeOut("slow");
		$('.modal-lightsout').fadeOut("slow");
	});*/

	function youWin() {
		clearInterval(timeCounter); //Stop the chrono
    	$('.gridster').addClass('finished'); // retire margins for widgets
    	$('#timeFinish').html($('.timer').html());

    	//Social networks
    	var message = "I'm%20just%20finish%20this%20okiFu%20puzzle%20in%20" + $('.timer').html() + ".%20Can%20you%20beat%20that?" ;
		//var shareurl = $(location).attr('href');
		var shareurl = 'http://okifu.net?photoID=263415158184442192_2250605';

		var urlfacebook = "http://www.facebook.com/sharer.php?s=100&p[url]=" + shareurl + "&p[title]=" + message;
		var urltwitter = "http://twitter.com/home?status=" + message + " - " + shareurl;		
		var urlemail = "mailto:?subject=" + message + "&body=" + shareurl;

		$('.socifb').attr('href', urlfacebook);
		$('.socitw').attr('href', urltwitter);
		$('.sociem').attr('href', urlemail);

    	// open modal window
    	$('.modal-profile').fadeIn("slow");
		$('.modal-lightsout').fadeTo("slow", .5);

	}

	/* DOCUMENT READY */
	$(document).ready(function() {

		takeImages();

		$('.startGame').click(function() {
			disorganizePuzzle();
			startTimer();
		});

		$('.openPref').fancybox({
			maxWidth	: 400,
			fitToView	: false,
			width		: '70%',
			height		: '70%',
			autoSize	: false,
			closeClick	: false
		});

	});

	$(window).load(function() {
		$("body").removeClass("preload");
	});

	/* optional triggers
	 $(window).resize(function() {
	 });
	 */
})(window.jQuery);
