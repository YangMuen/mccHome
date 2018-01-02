
function playMe(me) {
	document.getElementById("player_title").innerHTML = me.textContent.substring(0, me.textContent.length - 12);
	var x = document.getElementById("player");
	x.setAttribute('data-id', me.id);
	var year = me.getAttribute('data-year');
	var month = me.getAttribute('data-month');
	var src = 'http://mp3.swtychina.com/' + year + '/' + year + month + '/' + year + month + me.getAttribute('data-day') + '.mp3';
	x.setAttribute("src", src);
	x.play();
};

function toggleLoadingControls(loading, hideGetMore) {
	if (loading) {
		document.querySelector('.get_more').setAttribute('hidden', true);
		$.mobile.loading( 'show', {
			textVisible:true,
			text:'鍔犺浇涓�...',
		});
	}
	else {
		if (!hideGetMore) document.querySelector('.get_more').removeAttribute('hidden');
		$.mobile.loading( 'hide' );
	}
}

function querryItems(query, items, startIndex, hideGetMore) {
	var release = true;
	var server = 'http://api.swtychina.com/api/values?';
	if (!release) server = 'http://localhost/swtychina/api/values?';
	toggleLoadingControls(true, hideGetMore);
	$.ajax({
		type: 'GET',
		url: server + query,
		datatype: 'json',
		success: function(data) {
			$.each(data, function(index, val) {
				var year = val.date.substring(0, 4);
				var month = val.date.substring(5, 7);
				var day = val.date.substring(8, 10);
				var audio = '<div class="element"  onclick="playMe(this);" data-year="' + year + '" data-month="' + 
					month + '" data-day="' + day + '" id="' + startIndex++ + '">' + val.title + 
					' (' + year + "-" +  month + '-' + day + ')</div><hr class="element"/>';
				items.append(audio);
			});
			toggleLoadingControls(false, hideGetMore);
		},
		error: function(xmlhttprequest, textstatus, message) {
			var len = $("#divItems > div").length;
			if ( len == 0 ) 
				document.getElementById('player_title').textContent = '缃戠粶杩炴帴閿欒锛� '+message;
			toggleLoadingControls(false, len == 0);
		},
		timeout: (10 * 1000), // (10 seconds)
	});
};
 
$( document ).ready(function() {
	timer = setTimeout(function() { console.log('ready'); }, 1);
	var player = document.getElementById("player");
	querryItems('', $('#divItems'), 0, false);
	player.onended = function() {
		var id = player.getAttribute('data-id');
		var order = player.getAttribute('data-order');
		if (order == 'forward') id++;
		else if (order == 'reverse') id--;
		else id = -1;
		var next = document.getElementById(id);
		setTimeout(function () {
			if (next) 
				next.click();
		}, 1000);
	};
	player.onerror = function() {
		document.getElementById("player_title").textContent += " (鏃犳硶鎾斁锛�)";
	};
	$('#fast_forward').click( function() {
		player.pause();
		player.setAttribute('data-order', 'forward');
		player.onended();
	});
	$('#fast_reverse').click( function() {
		player.pause();
		player.setAttribute('data-order', 'reverse');
		player.onended();
		player.setAttribute('data-order', 'forward');
	});
	$('#selectTimer').change( function() {
		clearTimeout(timer);
		var time = $('#selectTimer').val();
		if (time > 0) {
			player.setAttribute('data-order', 'forward');
			timer = setTimeout(function() {
				player.pause();
			}, time);
		}
		else {
			if (time == 0) 
				player.setAttribute('data-order', 'pause'); 
			else
				player.setAttribute('data-order', 'forward'); 
		}
	});
	$('#SearchTime').click( function(event) {
		var year = $('#selectYear').val();
		$(".element").remove();
		if (0 == year)
			querryItems('', $('#divItems'), 0, false);
		else
			querryItems('date=' + year + '-**', $('#divItems'), 0, true);
	});
	$('#Search').click( function(event) {
		var str = $('#searchText').val();
		if (str != "")
		{
			if ( $('#searchContent').val() == "on" )
				str += ' content';
			$(".element").remove();
			querryItems('date=' + str, $('#divItems'), 0, true);
		}
	});
	$('#GetMore').click( function(event) {
		var last = $("#divItems > div").length;
		var year = document.getElementById(last-1).getAttribute('data-year');
		var month = document.getElementById(last-1).getAttribute('data-month');
		if (month > 1) {
			month--;
			if (month < 10)
				month = '0' + month;
		}
		else {
			month = 12;
			year--;
			if (year < 2007)
				return;
		}
		querryItems('date=' + year + '-' + month + '-reverse', $('#divItems'), last, false);
	});
});

