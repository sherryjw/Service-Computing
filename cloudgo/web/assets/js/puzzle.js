window.onload = function(){
	create_sixteen();
	document.getElementById("reset").addEventListener("click", start);
	document.getElementById("change").addEventListener("click", change_pic);
	document.getElementById("tip").style.backgroundImage = "url(images/1.jpg)";
}

var number = 1;
var pic_num = 2;

function change_pic(){
	document.getElementById("win").style.opacity = 0;
	var pic_str = "url(images/" + pic_num + ".jpg";
	for (var i = 1; i <= 16; ++i){
		var str = "pic_" + number + "_position_16_" + i;
		document.getElementById(str).style.backgroundImage = pic_str;
	}
	document.getElementById("tip").style.backgroundImage = pic_str;
	++ pic_num;
	if (pic_num > 10)	pic_num = 1;
}

function create_sixteen(){
	var puzzle = document.getElementById("puzzle");
	for (var i = 1; i <= 16; ++i){//15 or 16?
		var div = document.createElement("div");
		div.id = "pic_" + number + "_position_16_" + i;
		div.style.width = "100px";
		div.style.height = "100px";
		div.style.backgroundImage = "url(images/1.jpg)";
		puzzle.appendChild(div);
	}
}

function getlist(){
	var temp = new Array(15);//undefined
	var max = 15;
	for (var i = 0; i < 15; ++i){//str += i + " ";
		while(true){
			var flag = 1;
			var num = parseInt(Math.random()*max, 10) + 1;
			for (var j = 0; j < i; ++j){
				if (temp[j] == num){
					flag = 0;
				}
			}
			if(flag == 0)	continue;
			temp[i] = num;			
			break;
		}		
	}
	return temp;
}

function is_valid(list){
	var total = 0;
	for (var i = 1; i < 16; ++i){
		for (var j = 1; j < i; ++j){
			if (list[j-1] > list[i-1])
				total ++;
		}
	}
	return total%2 == 0;
}

function show_win(){
	document.getElementById("win").style.opacity = 1;
}

function move(event){
	document.getElementById("win").style.opacity = 0;
	var tag = event.currentTarget.id;

	var blankX = document.getElementById("pic_1_position_16_16").offsetLeft;//300
	var blankY = document.getElementById("pic_1_position_16_16").offsetTop;//300

	var targetX = document.getElementById(tag).offsetLeft;
	var targetY = document.getElementById(tag).offsetTop;

	if (move_is_valid(targetX, targetY, blankX, blankY) == true){

		document.getElementById(tag).style.left = blankX + "px";
		document.getElementById("pic_1_position_16_16").style.left = targetX + "px";

		document.getElementById(tag).style.top = blankY + "px";
		document.getElementById("pic_1_position_16_16").style.top = targetY + "px";
	}

	setTimeout(win_or_not, 100);
	/*if (win_or_not()){
		setTimeout(show_win, 1000);
	}*/	
}

function move_is_valid(targetX, targetY, blankX, blankY){
	if ((targetX - blankX == 100 || targetX - blankX == -100) && targetY - blankY == 0)	return true;
	else if ((targetY - blankY == 100 || targetY - blankY == -100) && targetX == blankX)	return true;
	return false;
}

function reset(){
	for (var i = 1; i <= 16; ++i){
		var all = "pic_" + number + "_position_16_" + i;
		document.getElementById(all).addEventListener("click", move);
	}
	document.getElementById("win").style.opacity = 0;
	document.getElementById("reset").innerHTML = "Restart";
	var list = new Array(15);//只决定1-15的顺序 16空白是固定的
	list = getlist();//先得到一个随机序列function
	if (is_valid(list)){//判断该序列是否合理function
		for (var i = 0; i < 4; ++i){
			for (var j = 0; j < 4; ++j){
				if (i == 3 && j == 3)	break;
				var id = "pic_1_position_16_"+ list[i*4+j]; 
				document.getElementById(id).style.left = j*100 + "px";
				document.getElementById(id).style.top = i*100 + "px";
			}
		}
		document.getElementById("pic_1_position_16_16").style.left = 300 + "px";
		document.getElementById("pic_1_position_16_16").style.top = 300 + "px";
	}
	else {
		reset();
	}
}

function start(){
	for (var i = 1; i <= 16; ++i){
		var all = "pic_" + number + "_position_16_" + i;
		document.getElementById(all).addEventListener("click", move);
	}
	document.getElementById("reset").addEventListener("click", reset);
	reset();
}/**/

function win_or_not(){
	for (var i = 0; i < 4; ++i){
		for (var j = 0; j < 4; ++j){
			var num = i*4 + j + 1;
			var all_id = "pic_1_position_16_"+ num;
			if (document.getElementById(all_id).offsetLeft != j*100 || document.getElementById(all_id).offsetTop != i*100){
				//alert("str: "+num+"-"+document.getElementById(all_id).offsetLeft+","+document.getElementById(all_id).offsetTop);
				return false;
			}
		}
	}
	show_win();
	for (var i = 1; i <= 16; ++i){
		var all = "pic_" + number + "_position_16_" + i;
		document.getElementById(all).removeEventListener("click", move);
	}
}