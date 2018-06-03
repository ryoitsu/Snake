var fieldWidth = 40;
var fieldHeight = 40;
var width, height;
var fps = 30;
var start = false;
var gameOver = false;
var snake = new Array();
var direction = 1; // right - 1, down - 2, left - 3, top - 4 
var snakeDefaultSize = 20;
var food;
var minesColor = "red";
var portalColor = "#5c42f4";
var ate = false;
var minesAmount = 8;
var minesRange = 15;
var minesTimer = 5;
var mines = new Array(minesAmount);
var portalsRange = 10;
var portalsTimer = 10;
var portals = new Array(2);
var foodInit = false;
var minesInit = false;
var portalsInit = false;
var minesInterval;
var portalsInterval;
var foodAppearTime;
var score = 0;
var snakeSprite = new Image();
snakeSprite.src = "/images/snake.png";

window.onload = function(){
	
	var canvas = document.getElementById("game");
	var ctx = canvas.getContext("2d");

	setResolution();
	window.onresize = setResolution;
	
	var gameInterval = setInterval(draw, 1000/fps);
	
	document.addEventListener('keydown', function(event){
		if(event.keyCode == 13 && (!start || gameOver == true))
		{
			restore();
			updateScore();
			minesInterval = setInterval(addMines, minesTimer*1000);
			portalsInterval = setInterval(addPortals, portalsTimer*1000);
			start = true;
			initSnake();
			addMines();
			addPortals();
			addFood();
			
		}else if((event.keyCode == 65 || event.keyCode == 37) && direction != 1){
			direction = 3;
		}else if((event.keyCode == 83 || event.keyCode == 40) && direction != 4){
			direction = 2;
		}else if((event.keyCode == 68 || event.keyCode == 39) && direction != 3){
			direction = 1;
		}else if((event.keyCode == 87 ||  event.keyCode == 38) && direction != 2){
			direction = 4;
		}
		
	});
	
	
	function draw(){
		ctx.clearRect(0,0,width,height);
		ctx.fillStyle="rgba(255,255,255,0.0)";
		ctx.fillRect(0,0,width,height);
		
		if(start == true)
		{
			if(!gameOver)
			{
				ctx.strokeRect(1,1,width-2,height-2);
				drawField();
				drawSnake();
				drawFood();
				drawMines();
				drawPortals();
				checkFoodCollision();
				checkWallCollision();
				checkSelfCollision();
				checkMinesCollision();
				checkPortalCollision();
				snakeMove();
				
			}else{
				drawGameOver();
			}
		}
		else{
			ctx.fillStyle = "red";
			ctx.font = calculateFontSize("Are you ready ?",25)+"px Chiller";
			ctx.fillText("Are you ready ?",(canvas.width-ctx.measureText("Are you ready ?").width)/2,(canvas.height-ctx.measureText("M").width)/2);
			ctx.font = calculateFontSize("Press enter to continue",15)+"px Chiller";
			ctx.fillText("Press enter to continue",(canvas.width-ctx.measureText("Press enter to continue").width)/2,(canvas.height+ctx.measureText("M").width*2)/2);
		}
	}
	
	
	function Point(x,y){
		this.x = x;
		this.y = y;
		
		return this;
	}
	
	function calcDistance(point1,point2){
		return (Math.sqrt(Math.pow(point1.x-point2.x,2)+Math.pow(point1.y-point2.y,2)));
	}
	
	function checkMinesCollision(){
		
		for(var i=0;i<mines.length;i++){
			if(snake[0].x == mines[i].x && snake[0].y == mines[i].y)
			{
				gameOverFunc();
			}
		}
		
	}
	
	function gameOverFunc(){
		gameOver = true;
		clearInterval(minesInterval);
		clearInterval(portalsInterval);
	}
	
	function checkFoodCollision(){
		if(snake[0].x == food.x && snake[0].y == food.y){
			ate = true;
			snake.unshift(new Point(snake[0].x,snake[0].y));
			score+= 1000-Math.round((new Date().getTime()-foodAppearTime.getTime())/5);
			addFood();
			updateScore();
		}
	}
	
	function checkPortalCollision(){
		for(var i=0;i<portals.length;i++){
			if(snake[0].x == portals[i].x && snake[0].y == portals[i].y)
			{
				snake[0].x = i == 0 ? portals[1].x : portals[0].x;
				snake[0].y = i == 0 ? portals[1].y : portals[0].y;
				return;
			}
		}
	}
	
	function checkWallCollision(){
		if(snake[0].x < 0 || snake[0].x >= fieldWidth || snake[0].y < 0 || snake[0].y >= fieldHeight){
			gameOverFunc();
		}
	}
	
	function checkSelfCollision(){
		for(var i=2;i<snake.length;i++){
			if(snake[0].x == snake[i].x && snake[0].y == snake[i].y)
				gameOverFunc();
		}
	}
	
	function addMines(){
		
		for(var i=0;i<minesAmount;i++)
		{
			mines[i] = new Point(0,0);
			do{
				
				mines[i].x = Math.round(Math.random()*(fieldWidth-1));
				mines[i].y = Math.round(Math.random()*(fieldHeight-1));
			}while(checkCollisionWithFood(mines[i]) || checkCollisionWithPortals(mines[i]) || checkCollisionWithSnake(mines[i]) || !calcDistance(snake[0],mines[i]) > minesRange);
		}
		minesInit = true;
	}
	
	function checkCollisionWithMines(point){
		if(minesInit)
			for(var i=0;i<mines.length;i++){
				if(point.x == mines[i].x && point.y == mines[i].y)
					return true;
			}
		return false;
	}
	
	function checkCollisionWithPortals(point){
		if(portalsInit)
			for(var i=0;i<portals.length;i++){
				if(point.x == portals[i].x && point.y == portals[i].y)
					return true;
			}
		return false;
	}
	
	function checkCollisionWithFood(point){
		if(foodInit)
			return point.x == food.x && point.y == food.y;
		return false;
	}
	
	function checkCollisionWithSnake(point){
		for(var i=0;i<snake.length;i++){
			if(point.x == snake[i].x && point.y == snake[i].y)
				return true;
		}
		return false;
	}
	
	function addFood(){
		food = new Point(Math.round(Math.random()*(fieldWidth-1)),Math.round(Math.random()*(fieldHeight-1)));
		if(checkCollisionWithSnake(food) || checkCollisionWithPortals(food) || checkCollisionWithMines(food)){
			addFood();
		}
		foodAppearTime = new Date();
		foodInit = true;
	}
	
	function addPortals(){
		portals[0] = new Point(0,0);
		portals[1] = new Point(0,0);
		do{
			portals[0].x = Math.round(Math.random()*(fieldWidth-1));
			portals[0].y = Math.round(Math.random()*(fieldHeight-1));
			portals[1].x = Math.round(Math.random()*(fieldWidth-1));
			portals[1].y = Math.round(Math.random()*(fieldHeight-1));
		}while(checkCollisionWithFood(portals[0]) || checkCollisionWithFood(portals[1]) || checkCollisionWithSnake(portals[0]) || checkCollisionWithSnake(portals[1]) || checkCollisionWithMines(portals[0]) || checkCollisionWithMines(portals[1]) || calcDistance(portals[0],portals[1]) < 15);
		portalsInit = true;
	}
	
	function updateScore(){
		document.getElementById("score").innerHTML = "Score: "+score;
	}
	
	function initSnake(){
		direction = 1;
		for(var i=0;i<snakeDefaultSize;i++){
			snake.push(new Point(Math.round(fieldWidth/2)-i,Math.round(fieldHeight/2)));
		}
	}
	
	function drawMines(){
		ctx.fillStyle = minesColor;
		for(var i=0;i<mines.length;i++)
			ctx.fillRect(mines[i].x*(width/fieldWidth),mines[i].y*(height/fieldHeight),width/fieldWidth,height/fieldHeight);
	}
	
	function drawPortals(){
		ctx.fillStyle = portalColor;
		for(var i=0;i<portals.length;i++)
			ctx.fillRect(portals[i].x*(width/fieldWidth),portals[i].y*(height/fieldHeight),width/fieldWidth,height/fieldHeight);
	}
	
	function drawFood(){
		ctx.drawImage(snakeSprite, 64*0, 64*3, 64, 64, food.x*(width/fieldWidth), food.y*(height/fieldHeight), width/fieldWidth,height/fieldHeight)	
	}
	
	function drawGameOver(){
		ctx.fillStyle = "red";
		ctx.font = calculateFontSize("Game Over",20)+"px Chiller";
		ctx.fillText("Game Over",(width-ctx.measureText("Game Over").width)/2,(height-ctx.measureText("M").width)/2);
		ctx.font = calculateFontSize("Press enter to restart",15)+"px Chiller";
		ctx.fillText("Press enter to restart",(width-ctx.measureText("Press enter to restart").width)/2,(height+ctx.measureText("M").width*2)/2);
	}
	
	function drawSnake(){
		var frameSize = 64;
		switch(direction){ // head
			case 1:
				ctx.drawImage(snakeSprite, frameSize*4, frameSize*0, frameSize, frameSize, snake[0].x*(width/fieldWidth), snake[0].y*(height/fieldHeight), width/fieldWidth,height/fieldHeight)
				break;
			case 2:
				ctx.drawImage(snakeSprite, frameSize*4, frameSize*1, frameSize, frameSize, snake[0].x*(width/fieldWidth), snake[0].y*(height/fieldHeight), width/fieldWidth,height/fieldHeight)
				break;
			case 3:
				ctx.drawImage(snakeSprite, frameSize*3, frameSize*1, frameSize, frameSize, snake[0].x*(width/fieldWidth), snake[0].y*(height/fieldHeight), width/fieldWidth,height/fieldHeight)
				break;
			case 4:
				ctx.drawImage(snakeSprite, frameSize*3, frameSize*0, frameSize, frameSize, snake[0].x*(width/fieldWidth), snake[0].y*(height/fieldHeight), width/fieldWidth,height/fieldHeight)	
				break;
		}
		
		for(var i=1;i<snake.length-1;i++){ // body
			var prevDirection = new Point(snake[i-1].x - snake[i].x,snake[i-1].y - snake[i].y);
			var nextDirection = new Point(snake[i+1].x - snake[i].x,snake[i+1].y - snake[i].y);
			var sx,sy;
			
			if(prevDirection.x != 0 && nextDirection.y == 0)
			{
				sx = 1;
				sy = 0;
			}else if(prevDirection.y != 0 && nextDirection.x == 0)
			{
				sx = 2;
				sy = 1;
			}else if((prevDirection.x > 0 && nextDirection.y < 0) || (nextDirection.x > 0 && prevDirection.y < 0)){
				sx = 0;
				sy = 1;
			}else if((prevDirection.x > 0 && nextDirection.y > 0) || (nextDirection.x > 0 && prevDirection.y > 0)){
				sx = 0;
				sy = 0;
			}else if((prevDirection.y > 0 && nextDirection.x < 0) || (prevDirection.x < 0 && nextDirection.y > 0)){
				sx = 2;
				sy = 0;
			}else if((prevDirection.y < 0 && nextDirection.x < 0) || (nextDirection.y < 0 && prevDirection.x < 0)){
				sx = 2;
				sy = 2;
			}
			
			ctx.drawImage(snakeSprite, frameSize*sx, frameSize*sy, frameSize, frameSize, snake[i].x*(width/fieldWidth), snake[i].y*(height/fieldHeight), width/fieldWidth,height/fieldHeight)	
		}
		
		var tailDirection = new Point(snake[snake.length-1].x-snake[snake.length-2].x,snake[snake.length-1].y-snake[snake.length-2].y);
		
		if(tailDirection.x > 0){ // tail
			ctx.drawImage(snakeSprite, frameSize*3, frameSize*3, frameSize, frameSize, snake[snake.length-1].x*(width/fieldWidth), snake[snake.length-1].y*(height/fieldHeight), width/fieldWidth,height/fieldHeight)	
		}else if(tailDirection.x < 0){
			ctx.drawImage(snakeSprite, frameSize*4, frameSize*2, frameSize, frameSize, snake[snake.length-1].x*(width/fieldWidth), snake[snake.length-1].y*(height/fieldHeight), width/fieldWidth,height/fieldHeight)	
		}else if(tailDirection.y > 0){
			ctx.drawImage(snakeSprite, frameSize*3, frameSize*2, frameSize, frameSize, snake[snake.length-1].x*(width/fieldWidth), snake[snake.length-1].y*(height/fieldHeight), width/fieldWidth,height/fieldHeight)	
		}else if(tailDirection.y < 0){
			ctx.drawImage(snakeSprite, frameSize*4, frameSize*3, frameSize, frameSize, snake[snake.length-1].x*(width/fieldWidth), snake[snake.length-1].y*(height/fieldHeight), width/fieldWidth,height/fieldHeight)	
		}
	}
	
	function snakeMove(){
		
		if(!ate)
		{
			for(var i=snake.length-1;i>0;i--){
				snake[i].x = snake[i-1].x;
				snake[i].y = snake[i-1].y;
			}
		}
		
		switch(direction){
			case 1: 
				snake[0].x+=1;
				break;
			case 2:
				snake[0].y+=1;
				break;
			case 3:
				snake[0].x-=1;
				break;
			case 4:
				snake[0].y-=1;
				break;
		}
		ate = false;
		
	}
	
	function drawField(){
		for(var column=1;column<fieldWidth;column++)
		{
			ctx.strokeStyle="rgba(0,0,0,0.5)";
			ctx.beginPath();
			ctx.moveTo((width/(fieldWidth))*column,0);
			ctx.lineTo((width/(fieldWidth))*column,height);
			ctx.stroke();
		}
		for(var row=1;row<fieldHeight;row++)
		{
			ctx.beginPath();
			ctx.moveTo(0,(height/fieldHeight)*row);
			ctx.lineTo(width,(height/fieldHeight)*row);
			ctx.stroke();
		}
	}
	
	function restore(){
		score = 0;
		gameOver = false;
		snake = new Array();
		direction = 1;
		mines = new Array(minesAmount);
		portals = new Array(2);
		foodInit = false;
		minesInit = false;
		portalsInit = false;
	}
	
	function setResolution(){
		var offsetLeft, offsetTop;
		
		if(window.innerWidth/window.innerHeight > 1.5 || window.innerHeight/window.innerWidth > 1.5){
			if(window.innerWidth > window.innerHeight){
				height = window.innerHeight*0.6;
				width = height*1.5;
			}else{
				width = window.innerWidth*0.6;
				height = width*1.5;
			}
		}else{
			width = window.innerWidth*0.6;
			height = window.innerHeight*0.6;
		}
		
		document.getElementById("score").style.fontSize = calculateFontSize("Score",9)+"px";

		offsetLeft = (window.innerWidth-width)/2;
		offsetTop = (window.innerHeight-height)/2;
		document.getElementById("border").width = width*1.2;
		document.getElementById("border").height = height*1.2;
		document.getElementById("border").style.left = offsetLeft-width*0.1+"px";
		document.getElementById("border").style.top = offsetTop-height*0.1+"px";
		canvas.style.left = ''+offsetLeft+'px';
		canvas.style.top = ''+offsetTop+'px';
		canvas.width = width;
		canvas.height = height;
	}
	
	function calculateFontSize(txt,width){ // width is % of the window
		for(var i=0;i<150;i++)
		{
			ctx.font= i+"px Chiller";
			if(ctx.measureText(txt).width > window.innerWidth*(width/100)*0.90 && ctx.measureText(txt).width < window.innerWidth*(width/100)*1.10)
			{	return i; 			}
		}
	}
	
};