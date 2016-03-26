
var map;
var geocoder;
var user_pos = {lat:0.0,lng:0.0};
var accuracy;
var user_position_marker;
var markers;
var infos;
var car_fields;
var info_details;
var cancle_location = false; // 是否取消訂位
var user_from_marker;
var mode;
var from_pos = {lat:0.0,lng:0.0};
function initMap() 
{
	mode = "now";

  	// Create a map object and specify the DOM element for display.
  	map = new google.maps.Map(document.getElementById('map'), {
    	center: {lat: 23.6637289, lng:121.3912028},
    	scrollwheel: true,
    	zoom: 8
  	});
  	geocoder = new google.maps.Geocoder();
  	markers = [];
 	infos = [];
 	car_fields = [];
 	info_details = [];
 	document.getElementById("map").style["opacity"] = 1;
  	getlocation();
}

//定位
function getlocation()
{
	set_state(1);
	if(window.navigator.geolocation)
	{   
    	navigator.geolocation.getCurrentPosition(positionGet,user_deny);   	
	}
	else
	{   
    	set_state(4);
    }
   
}

function positionGet(position)
{
	user_pos.lat = position.coords.latitude;
    user_pos.lng = position.coords.longitude;

    /*DEBUG
模擬位置
*/ 
	if(getUrlParameter("debug")=="on")
	{
	user_pos.lat = 25.0370887091887;
	user_pos.lng =121.562997370118;

	}
    if(!user_position_marker){
	user_position_marker = new google.maps.Marker({
    	position: user_pos,
    	title: '目標位置',
    	icon: '../images/blu-circle.png',
    	draggable: true,
	});
	}
	else
	{
		user_position_marker.setPosition(user_pos);
	}
	if(cancle_location)
		return;
	

    accuracy = position.coords.accuracy;
    map.setCenter(user_pos);
    user_position_marker.setMap(map);
    var myLatlng = new google.maps.LatLng(user_pos);
	var mapOptions = {
  		zoom: 16,
  		center: myLatlng
	}
	map.setOptions(mapOptions);

	
	google.maps.event.addListener(user_position_marker, 'dragend', function(pos) 
	{
    	drag_marker(pos.latLng);
	});

	google.maps.event.addListener(map, 'dblclick', function(pos) 
	{

		if(mode=="pre")
    		dclick(pos.latLng);
	});

	user_position_marker.setMap(map);

    set_state(3);
    console.log(user_position_marker);
    check_taipei(user_pos);
   


    if(mode=="pre")
    {
    	from_pos.lng = user_pos.lng;
    	from_pos.lat = user_pos.lat;
    	if(!user_from_marker)
    	{
    		user_from_marker = new google.maps.Marker({
    		position: from_pos,
    		title: '目前位置',
    		icon: '../images/gre-circle.png',
    		draggable: true,
			});
    	}
    	else
    	{
    		user_from_marker.setPosition(from_pos);
    	}

		user_from_marker.setMap(map);
		google.maps.event.addListener(user_from_marker, 'dragend', function(pos) 
		{
    		drag_from_marker(pos.latLng);
		});
		user_position_marker.setMap(null);
		  
    }
    else
    {
    	if(user_from_marker)
    		user_from_marker.setMap(null);
    }
    /*var infoWindow = new google.maps.InfoWindow({map: map});
    infoWindow.setPosition(user_pos);*/
}
function dclick(pos_new)
{
	user_pos.lat = pos_new.lat();
	user_pos.lng = pos_new.lng();
	if(!user_position_marker)
	{
	user_position_marker = new google.maps.Marker({
    	position: user_pos,
    	title: '目標位置',
    	icon: '../images/blu-circle.png',
    	draggable: true,
	});
	}
	else
	{
		user_position_marker.setPosition(user_pos);
	}
	user_position_marker.setMap(map);
	$("#show_targ_name").html("目標地點設定完成");


}
function drag_from_marker(pos_new)
{
	from_pos.lat = pos_new.lat();
    from_pos.lng = pos_new.lng();

}
function drag_marker(pos_new)
{
	set_state(5);
	user_pos.lat = pos_new.lat();
	user_pos.lng = pos_new.lng();
	if(mode=="now")
	{
		search();
	}
}
function user_deny()
{
	console.log("User deny location request.");
	set_state(2);
	
}
function set_state(n)
{
	var state_label = document.getElementById("state_text");
	var state_icon = document.getElementById("state_icon");
	switch(n)
	{
		case 1:
			state_label.innerHTML = "正在取得您的定位資訊 <a onclick='getlocation_Cancle()'><font color='red'>取消</font></a>";
			state_icon.className = "fa fa-dot-circle-o";
			state_icon.style["color"] = "red";
			state_icon.style["animation-name"] = "bling";
			state_icon.style["animation-duration"] = "1s";
			state_icon.style["animation-iteration-count"] = "infinite";

			break;
		case 2:
			state_label.innerHTML = "定位失敗";
			state_icon.style["animation-name"] = "";
			state_icon.className = "fa fa-exclamation-triangle";
			state_icon.style["color"] = "red";
			break;
		case 3:
			state_label.innerHTML = "定位成功  誤差" + parseInt(accuracy) + "公尺";
			state_icon.className = "fa fa-check";
			state_icon.style["color"] = "green";
			state_label.style["color"] = "blue";
			state_icon.style["animation-name"] = "";

			break;
		case 4:
			state_label.innerHTML = "您的瀏覽器不支援定位";
			state_icon.style["animation-name"] = "";
			state_icon.className = "fa fa-exclamation-triangle";
			state_icon.style["color"] = "red";
			break;
		case 5:
			state_label.innerHTML = "已經拖曳目標位置";
			state_icon.className = "fa fa-check";
			state_icon.style["color"] = "green";
			state_label.style["color"] = "blue";
			break;
		case 6:
			state_label.innerHTML = "正在尋找附近的停車場";
			state_icon.className = "fa fa-circle-o-notch fa-spin";
			state_icon.style["color"] = "black";
			state_icon.style["animation-name"] = "";
			break;
		case 7:
			state_label.innerHTML = "停車場尋找完成";
			state_icon.className = "fa fa-check";
			state_icon.style["color"] = "green";
			state_label.style["color"] = "blue";
			state_icon.style["animation-name"] = "";
			break;
		case 8:
			state_label.innerHTML = "已放置圖釘在" + document.getElementById("addr").value;
			state_icon.className = "fa fa-check";
			state_icon.style["color"] = "green";
			state_label.style["color"] = "blue";
			state_icon.style["animation-name"] = "";
			break;
		case 9:
			state_label.innerHTML = "找不到" + document.getElementById("addr").value;
			state_icon.style["animation-name"] = "";
			state_icon.className = "fa fa-exclamation-triangle";
			state_icon.style["color"] = "red";
			break;
		case 10:
			state_label.innerHTML = "正在取得即時資訊";
			state_icon.className = "fa fa-circle-o-notch fa-spin";
			state_icon.style["color"] = "black";
			state_icon.style["animation-name"] = "";
			break;
		case 11:
			state_label.innerHTML = "定位取消 <a onclick='getlocation_re()'><font color='green'>重新定位</font></a>";
			state_icon.className = "";
			state_icon.style["color"] = "black";
			state_icon.style["animation-name"] = "";
			break;
		case 12:
			state_label.innerHTML = "您的所在地似乎不在我們的服務區域";
			state_icon.className = "fa fa-info-circle";
			state_icon.style["color"] = "blue";
			state_icon.style["animation-name"] = "";
			break;
		case 13:
			state_label.innerHTML = "已放置圖釘在" + document.getElementById("addr2").value;
			state_icon.className = "fa fa-check";
			state_icon.style["color"] = "green";
			state_label.style["color"] = "blue";
			state_icon.style["animation-name"] = "";
			break;
		case 14:
			state_label.innerHTML = "找不到" + document.getElementById("addr2").value;
			state_icon.style["animation-name"] = "";
			state_icon.className = "fa fa-exclamation-triangle";
			state_icon.style["color"] = "red";
			break;
		case 15:
			state_label.innerHTML = "正在計算到達時間";
			state_icon.className = "fa fa-circle-o-notch fa-spin";
			state_icon.style["color"] = "black";
			state_icon.style["animation-name"] = "";
			break;

		case 16:
			state_label.innerHTML = "無法找尋路線";
			state_icon.style["animation-name"] = "";
			state_icon.className = "fa fa-exclamation-triangle";
			state_icon.style["color"] = "red";
			break;
		case 17:
			state_label.innerHTML = "預計到達時間" + duration.text;
			state_icon.className = "fa fa-check";
			state_icon.style["color"] = "green";
			state_label.style["color"] = "blue";
			state_icon.style["animation-name"] = "";
			break;	
	}

	var state_icon2 = document.getElementById("state_icon2");
	state_icon2.className = state_icon.className;
	state_icon2.style["color"] = state_icon.style["color"];
}
function check_taipei(pos)
{
	geocoder.geocode({'location': pos }, function(results, status){ 

		if(status == google.maps.GeocoderStatus.OK)
		{
			for(var i = 0 ; i <results.length ;i++)
			{
				if(results[i].types[0] == "administrative_area_level_1")
				{
					if(results[i].formatted_address!="台灣台北市")
						set_state(12);
				}
			
			}


		}
		else
		{
			console.log("Position check error.");
		
		}
	});
}
function getlocation_Cancle()
{
	//取消訂位
	set_state(11);
	cancle_location = true;

}
function getlocation_re()
{
	cancle_location = false;
	getlocation();
}
var searching = false;
function search()
{

	if(searching)
		return;

	document.getElementById("fields_list").innerHTML = "";
	for(var i=0;i<markers.length;i++)
		markers[i].setMap(null);

	markers = [];
	infos = [];
	car_fields = [];
 	info_details = [];

	searching = true;
	set_state(6);
	var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            search_callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", '../api/connect1.ashx?lon='+user_pos.lng+'&lat='+user_pos.lat, true); // true for asynchronous 
    xmlHttp.send(null);
}
function search_callback(response)
{
	var s = response.split('#');
	var list_box = document.getElementById("fields_list");
	var bounds = new google.maps.LatLngBounds();
	for(var i = 0; i < s.length - 1 ; i++)
	{
		var title , lat , lng , car , moto ,addr , pay , type , cid;
		title = s[i].split('@')[0];

		lat = parseFloat(s[i].split('@')[1]);
		lng = parseFloat(s[i].split('@')[2]);

		car = parseInt(s[i].split('@')[3]);
		moto = parseInt(s[i].split('@')[4]);
		addr = s[i].split('@')[5];
		pay = s[i].split('@')[6];
		type = s[i].split('@')[7];
		cid = s[i].split('@')[8];

		var carinfo = {
			title : title,
			id : cid,
			type : type,
			car : car,
			moto : moto
		}
		car_fields.push(carinfo);

		bounds.extend(new google.maps.LatLng(lat,lng));

		console.log(title+" "+lat+" "+lng);

		var marker = new google.maps.Marker({
    	position: {lat: lat,lng: lng},
    	title: title,
    	map: map,
    	maxWidth: $(window).width()/2
		});
		var mapurl = "https://www.google.com/maps?q=@" + lat + "," + lng;
		var roadurl = "https://maps.google.com/?daddr=@"+lat + "," + lng+"&directionsmode=driving";
		/*var context = "<div style='font-size: 2em; color:blue'><a target='_blank' href='"+mapurl+"'><font color='blue'>" + title 
		+ "</font></a></div><div style='color:red'>汽車 " + 
		car +" 機車 " + moto +"</div>" + addr + "<br>" + pay ;*/

		//https://maps.google.com/?daddr=@37.3161,-122.1836&directionsmode=driving
		var context = "<div class='mapinfo'><div id='info_field_name'><a target='_blank' class='map_url' href='"+ mapurl+"'>" + title +"</a></div>"+
		"<div class='info_last' id='info_last_"+ i + "'><i class='fa fa-car'></i> "+car+" <i class='fa fa-motorcycle'></i> "+moto+"</div>" +
		"<div><a class='choose' onclick='show_pay("+i+")'>[收費資訊]</a>  "+
		"<a href='"+roadurl+"' class='choose' target ='_blank'>[安排路線]</a></div>" + 
		"<div class='info_pay' id = 'info_pay_"+i+"'>" + pay + "</div>" 	

		+ "</div>";

		var detail = {
			roadurl: roadurl,
			mapurl: mapurl,
			title: title,
			car: car,
			moto: moto,
			pay: pay
		};
		info_details.push(detail);
		markers.push(marker);
	
		var infowindow = new google.maps.InfoWindow({
    		content: context
 		});
		infos.push(infowindow);

		onMarkerClick(marker,infowindow);

		var new_field = document.createElement("DIV");
		new_field.className = "fields";
		new_field.id = "F"+i;
		var field_title = document.createElement("SPAN");
		field_title.style["color"] = "#26960B";
		field_title.innerHTML = title;
		new_field.appendChild(field_title);
		new_field.innerHTML += "<br>";
		var field_info = document.createElement("SPAN");
		field_info.id = "fi" + i;
		field_info.innerHTML = "<i class='fa fa-car'></i> "+ car +
		" <i class='fa fa-motorcycle'></i> " + moto ; 
		new_field.appendChild(field_info);
		onListClick(new_field,marker,infowindow);

		fields_list.appendChild(new_field);



		$(new_field).css('height', 'auto');
		var autoheight = $(new_field).height();

		$(new_field).css('height', 0)
  			.slideDown('slow')
  			.animate(
    			{ height: autoheight },
    			{ queue: false, duration: 'slow' }
  		);

	}
	

	getAvalible();
	$('html, body').animate({
        scrollTop: $("#mobil_btn").offset().top
    }, 1000);

	map.fitBounds(bounds); 
	set_state(10);
	
}
function onMarkerClick(marker,info)
{
	
 	marker.addListener('click', function() {
   		 
   		for(var i=0;i<infos.length;i++)
		{
			infos[i].close();
		}
		info.open(map, marker);
 	});

}
function onListClick(filed,marker,info)
{
	filed.addEventListener('click',function()
		{
			for(var i=0;i<infos.length;i++)
			{
				infos[i].close();
			}
			info.open(map,marker);
			document.getElementById('map').scrollIntoView();
			map.setCenter(marker.position);
		}
	);
	
}
function getAvalible()
{
	var ids = "";
	for(var i=0;i<car_fields.length;i++)
	{
		if(car_fields[i].type == "1")
			ids += car_fields[i].id + ",";
	}
	var xmlHttp2 = new XMLHttpRequest();

    xmlHttp2.onreadystatechange = function() { 
        if (xmlHttp2.readyState == 4 && xmlHttp2.status == 200)
        {
        	console.log(xmlHttp2.responseText);
        	ml_data = JSON.parse(xmlHttp2.responseText);

        	var xmlHttp3 = new XMLHttpRequest();
        	xmlHttp3.onreadystatechange = function() { 
        		if (xmlHttp3.readyState == 4 && xmlHttp3.status == 200)
        		{
        			AvailableRecall(xmlHttp3.responseText);
        		}
        	}
        	xmlHttp3.open("GET", '../api/connect2.ashx?ids=' + ids); // true for asynchronous 
    		xmlHttp3.send(null);
        }
       
    }
    if(mode == "pre")
    	ids += "&delay=" + duration.value;
    xmlHttp2.open("GET", '../api/mlc.ashx?ids=' + ids); // true for asynchronous 
    xmlHttp2.send(null);
}
var ml_data;

function AvailableRecall(re)
{
	var value;
	if(ml_data.Results)
	{
		value = ml_data.Results.output1.value.Values;
	}

	var res = re.split('#');
	var use_res = 0 ;
	for(var i=0;i<car_fields.length;i++)
	{
		if(car_fields[i].type == "1")
		{
			if(mode=="pre")
			{
				console.log(Math.floor(value[use_res][3]));
				if(Math.floor(value[use_res][3]) >10)
				{
					res[use_res] =  "-9@-9"; 
				}
				else
				{
					res[use_res] = Math.floor(value[use_res][2]) + "@-9"; 
				}
			
			}
			var lastpercent = parseInt((res[use_res].split('@')[0]/car_fields[i].car)*100);
			var lastpercent2 = parseInt((res[use_res].split('@')[1]/car_fields[i].moto)*100);
			var new_info =  "<i class='fa fa-car'></i> "
			+ getinfoi(res[use_res].split('@')[0],car_fields[i].car,lastpercent) + 
			" <i class='fa fa-motorcycle'></i> " + getinfoi(res[use_res].split('@')[1],car_fields[i].moto,lastpercent2) ;

			new_info += "<br><div class='advise'>" + advise(res[use_res].split('@')[0],car_fields[i].car,value[use_res][2])+"</div>";
	


			document.getElementById("fi" + i ).innerHTML = new_info;
			
			var context = "<div class='mapinfo'><div id='info_field_name'><a target='_blank' class='map_url' href='"+ info_details[i].mapurl+"'>" + info_details[i].title +"</a></div>"+
			"<div class='info_last' id='info_last_"+ i + "'>"+ new_info+"</div>" +
			"<div><a class='choose' onclick='show_pay("+i+")'>[收費資訊]</a>  "+
			"<a href='"+info_details[i].roadurl+"' class='choose' target ='_blank'>[安排路線]</a></div>" + 
			"<div class='info_pay' id = 'info_pay_"+i+"'>" + info_details[i].pay + "</div>" 	

			+ "</div>";

			infos[i].setContent(context);

			
			markers[i].setIcon(getMarkerUrl(lastpercent));
			use_res ++ ; 
		}
		else
		{
			markers[i].setIcon(getMarkerUrl('-100'));
		}

		
	}
	searching = false;
	set_state(7);
}
function getinfoi(av,tv,percent)
{
	var avn = parseInt(av);
	var tvn = parseInt(tv);

	if(av == -9)
		return "<span style='color: black'>"+tv+"</span>";
	else
		return "<span style='color: #"+ getMarketColor(percent) +"'>" + avn + "</span><span style='color: black'>/"+tv+"</span>";
}
var shoeninput = false;
function openinput()
{
	var inp = document.getElementById("inputarea");
	if(!shoeninput)
	{
		shoeninput = true;
		inp.style['display'] = "block";
		shoeninput = true;
		$(inp).css('height', 'auto');
		var autoheight = $(inp).height();

		$(inp).css('height', 0)
  			.slideDown('fast')
  			.animate(
    		{ height: autoheight },
    		{ queue: false, duration: 'fast' }
  		);
	}
	else
	{
		shoeninput = false;
		$(inp).slideDown('fast')
			.animate(
    		{ height: 0 },"fast"
    		,function(){document.getElementById("inputarea").style['display']="none";});
	}
	
}

function addrsrearch()
{
	var addr = document.getElementById("addr").value;
	var taipei = {lat: 25.0339186 ,lng: 121.5624493};
    geocoder.geocode( {'address': addr , 'location': taipei }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
      		
      		var mini = 0 , min = 999.9;
      		console.log ("search result: " + results.length );
      		for(var i = 0 ; i<results.length ;i++)
      		{
      			console.log (results[i].formatted_address );
      			var dx = parseFloat(results[i].geometry.location.lat()) - taipei.lat ;
      			dx = dx * dx;
      			

      			var dy = parseFloat(results[i].geometry.location.lng()) - taipei.lng ;
      			dy = dy * dy ;
      			if(dx + dy < min)
      			{
      				mini = i ;
      				min = dx + dy;
      			}
      			
      		}
			map.setCenter(results[mini].geometry.location);
			user_pos.lat = parseFloat(results[mini].geometry.location.lat());
      		user_pos.lng = parseFloat(results[mini].geometry.location.lng());
			
      		user_position_marker.setMap(null);
      		user_position_marker = new google.maps.Marker({
    			position: user_pos,
    			title: '目標位置',
    			icon: '../images/blu-circle.png',
    			draggable: true,
			});
			user_position_marker.setMap(map);
			google.maps.event.addListener(user_position_marker, 'dragend', function(pos) 
			{
    			drag_marker(pos.latLng);
			});
			set_state(8);


      } else {
        set_state(9);
      }
    });
}

function addrsrearch2()
{
	var addr = document.getElementById("addr2").value;
	var taipei = {lat: 25.0339186 ,lng: 121.5624493};
    geocoder.geocode( {'address': addr , 'location': taipei }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
      		
      		var mini = 0 , min = 999.9;
      		console.log ("search result: " + results.length );
      		for(var i = 0 ; i<results.length ;i++)
      		{
      			console.log (results[i].formatted_address );
      			var dx = parseFloat(results[i].geometry.location.lat()) - taipei.lat ;
      			dx = dx * dx;
      			

      			var dy = parseFloat(results[i].geometry.location.lng()) - taipei.lng ;
      			dy = dy * dy ;
      			if(dx + dy < min)
      			{
      				mini = i ;
      				min = dx + dy;
      			}
      			
      		}
			map.setCenter(results[mini].geometry.location);
			user_pos.lat = parseFloat(results[mini].geometry.location.lat());
      		user_pos.lng = parseFloat(results[mini].geometry.location.lng());
			
      		
      		if(!user_position_marker)
      		{
      			user_position_marker = new google.maps.Marker({
    			position: user_pos,
    			title: '目標位置',
    			icon: '../images/blu-circle.png',
    			draggable: true,
				});
      		}
			else
			{
				user_position_marker.setPosition(user_pos);
			}
			user_position_marker.setMap(map);
			
			set_state(13);


      } else {
        set_state(14);
      }
    });
}

var shown ;
var showned = false;
function show()
{
	shown = document.getElementById("report");
	if(!showned)
	{
		showned = true;
		shown.style['display'] = "block";
		shoeninput = true;
		$(shown).css('height', 'auto');
		var autoheight = $(shown).height();

		$(shown).css('height', 0)
  			.slideDown('fast')
  			.animate(
    		{ height: autoheight },
    		{ queue: false, duration: 'fast' }
  		);
	}
	else
	{
		showned = false;
		$(shown).slideDown('fast')
			.animate(
    		{ height: 0 },"fast"
    		,function(){shown.style['display']="none";});
	}

}
function getMarkerUrl(percent)
{
	return "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=P|"+ getMarketColor(percent);
}
function getMarketColor(percent)
{
	var color;
	//http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=P|44CC0E
	if(percent == -100) // no data
		color = "92A8A1";
	else if (percent >= 80)
		color = "1BCF3F";
	else if (percent >= 50)
		color = "C8E630";
	else if (percent >= 10)
		color = "E68E30";
	else
		color = "E63330";
	return color;
}

function show_pay(n)
{
	document.getElementById("info_pay_" + n).style["display"] = "block";
}
function return_center()
{
	 map.setCenter(user_pos);
}
function return_top()
{
	$('html, body').animate({
       scrollTop: $("#main").offset().top
    }, 1000);
}
function advise(last,total,ml)
{

	console.log("ML data: " + last+","+total+","+ml);
	if(mode=="pre")
	{
		if(last==-9)
		{
			return "<font color='E8335D'><i class='fa fa-exclamation-triangle'></i> 沒有可用資料 </font><a><font color='blue' data-toggle='modal' data-target='#ml_un'>[說明]</font></a>";
		}
		else
		{
			var real_time = ml_data.Results.output1.value.Values[0][1];
			$("#arrive_time_show").html(real_time);
			return "<font color='F09C2E'><i class='fa fa-exclamation-triangle'></i> 這是推測資料 </font><a><font color='blue' data-toggle='modal' data-target='#not_real'>[說明]</font></a>";
		}
	}
	else if(last==-9)
		return "<font color='E8335D'><i class='fa fa-exclamation-circle'></i> 此停車場的即時資訊失效</font><a><font color='blue' data-toggle='modal' data-target='#unable'>[說明]</font></a>";

	else if(ml<0 || ml>total)
		return '';
	else
	{
		different = ((last-ml)/total) * 100;
		if(different > 15)
			return "<font color='1AA135'><i class='fa fa-thumbs-o-up'></i> 此停車場的車位比平常多</font><a><font color='blue' data-toggle='modal' data-target='#more_car'>[說明]</font></a>";
		else if(different < -15)
			return "<font color='FF0000'><i class='fa fa-exclamation-triangle'></i> 此停車場的車位比平常少</font><a><font color='blue' data-toggle='modal' data-target='#low_car'>[說明]</font></a>";
		else
			return '';
	}
	
}
