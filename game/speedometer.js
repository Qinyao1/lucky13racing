//open-source: http://www.knowstack.com/html5-canvas-speedometer/

function start(){
	draw(getSpeed());
	setTimeout(start, 100);
}

start();

function draw(speed){
	var  canvas = document.getElementById("theCanvas");
	var  context = canvas.getContext("2d");

	context.clearRect(0,0,canvas.width, canvas.height);

	var centerX = canvas.width / 2;			//center the speedometer - changes x position of the speedometer
	var centerY = canvas.height / 1.5;		//changes y position of speedometer
	var radius = canvas.height / 1.5;		//changes radius of speedometer

	context.beginPath();
	context.arc(centerX, centerY, radius, Math.PI*0.10, Math.PI*-1.1, true);

	var gradience = context.createRadialGradient(centerX, centerY, radius-radius/2, centerX, centerY, radius-radius/8);
	gradience.addColorStop(0, '#ff9000');
	gradience.addColorStop(1, '#000000');

	context.fillStyle = gradience;
	context.fill();
	context.closePath();
	context.restore();

	context.beginPath();
	context.strokeStyle = '#ffff00';
	context.translate(centerX,centerY);
	var increment = 20;		//increment the speed numbers by 5mph
	context.font="6px Helvetica";	//changes size of numbers

	//create the speed numbers & yellow ticks
	for (var i = -18; i <= 18; i++)
	{
		angle = Math.PI/30*i;
		sineAngle = Math.sin(angle);
		cosAngle = -Math.cos(angle);

		//create the bigger yellow ticks
		if (i % 5 == 0) {
			context.lineWidth = 5;
			iPointX = sineAngle *(radius -radius/4);
			iPointY = cosAngle *(radius -radius/4);
			oPointX = sineAngle *(radius -radius/7);
			oPointY = cosAngle *(radius -radius/7);

			//create the speed numbers
			wPointX = sineAngle *(radius -radius/3);
			wPointY = cosAngle *(radius -radius/3);
			context.fillText((i+18)*increment,wPointX-4,wPointY+6);
		}
		//create the smaller yellow ticks
		else{
			context.lineWidth = 2;
			iPointX = sineAngle *(radius -radius/5.5);
			iPointY = cosAngle *(radius -radius/5.5);
			oPointX = sineAngle *(radius -radius/7);
			oPointY = cosAngle *(radius -radius/7);
		}

		context.beginPath();
		context.moveTo(iPointX,iPointY);
		context.lineTo(oPointX,oPointY);
		context.stroke();
		context.closePath();
	}

	//create the black rectangular "clock hand"
	var numOfSegments = speed/increment;
	numOfSegments = numOfSegments -18;
	angle = Math.PI/30*numOfSegments;
	sineAngle = Math.sin(angle);
	cosAngle = -Math.cos(angle);
	pointX = sineAngle *(3/5*radius);
	pointY = cosAngle *(3/5*radius);

	//create the inner black circle
	context.beginPath();
	context.strokeStyle = '#000000';
	context.arc(0, 0, 8, 0, 2*Math.PI, true);	//changes size of inner black circle
	context.fill();
	context.closePath();

	//finish creating the black rectangular "clock hand"
	context.beginPath();
	context.lineWidth = 4; 	//width of dial
	context.moveTo(0,0);
	context.lineTo(pointX,pointY);
	context.stroke();
	context.closePath();
	context.restore();
	context.translate(-centerX,-centerY);
}
