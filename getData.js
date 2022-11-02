
$.getJSON('https://api.open-notify.org/astros.json?callback=?', function(data) {
	
	// module aliases
	var Engine = Matter.Engine,
		Render = Matter.Render,
		Runner = Matter.Runner,
		Bodies = Matter.Bodies,
		Body = Matter.Body,
		Mouse = Matter.Mouse,
		MouseConstraint = Matter.MouseConstraint,
		Query = Matter.Query,
		Events = Matter.Events,
		Vector = Matter.Vector,
		Composite = Matter.Composite;

	// create an engine
	var engine = Engine.create({
		gravity: {
			y: 0
		}
	});

	// create a renderer
	var render = Render.create({
		element: document.getElementById('sim'),
		engine: engine,
		options: {
			// background: '#111133',
			background: 'url("back.webp")',
			wireframes: false,
			height: 563,
			width: 1000,
			pixelRatio: 'auto'
		}
	});
	console.log(render.options.pixelRatio);
	
	//Parse space data
	var number = data['number'];
	var ships = [];
	var crews = [];
	const shipShape = [
		[{x:0,y:0},{x:20,y:25},{x:23,y:50},{x:30,y:110},
		{x:0,y:116},{x:-30,y:110},{x:-23,y:50},{x:-20,y:25}]];
	const shipSprite = {sprite:{
		texture:'ship.webp',
		xScale: 0.1,
		yScale: 0.1,
	}};
    // $('#SpacePeople').html(number);

    data['people'].forEach(d => {
        // $('#astroNames').append(`<li>${d['name']} (${d['craft']})</li>`)
		let s = ships.find(e=>e.label==d['craft']);
		if(s==undefined)
		{
			// create a new ship
			s = Bodies.fromVertices(200+ships.length*250+Math.random()*100,250+Math.random()*100,shipShape,{label:d['craft'],render:shipSprite,
				frictionAir:0.001});
			ships.push(s);
			// create crew list
			crews[d['craft']] = [];
			// add random velocity and rotation
			Body.setAngularVelocity(s,Math.random()*0.01-0.005);
			Body.setAngle(s,Math.random()*Math.PI*2);
			Body.setVelocity(s,Vector.rotate({x:Math.random(),y:0},Math.random()*Math.PI*2));
		}
		crews[d['craft']].push(d['name']);
		
    });
	
	// add all of the bodies to the world
	Composite.add(engine.world, ships);
	
    // add mouse control
    var mouse = Mouse.create(render.canvas);
	mouseConstraint = MouseConstraint.create(engine, {
		mouse: mouse,
		constraint: {
			stiffness: 0.2,
			render: {
				visible: false
			}
		}
	});
	// this is necessary for some reason
	mouse.pixelRatio = render.options.pixelRatio;

    Composite.add(engine.world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

	// run the renderer
	Render.run(render);

	// create runner
	var runner = Runner.create();

	// run the engine
	Runner.run(runner, engine);
	
	var hover = undefined;
	// Event handler after render
	Events.on(render,'afterRender',e => {
		// Detect mouse hovering over ship
		let {x,y} = mouse.position;
		let hover = Query.point(ships,{x:x,y:y}).sort((a,b)=>a.id-b.id)[0];
		if(hover != undefined)
		{
			// Draw info for the ship
			x+= 12;
			let ctx = render.canvas.getContext('2d');
			ctx.fillStyle = "rgba(64,0,192,0.6";
			ctx.fillRect(x,y,180,32+crews[hover.label].length*20);
			x+=4;
			ctx.font = 'bold 18px Consolas';
			ctx.fillStyle = 'white';
			ctx.fillText(hover.label,x,y+=16);
			ctx.font = '18px Consolas';
			crews[hover.label].forEach(name=>{
				ctx.fillText(name,x,y+=20);
			});
		}
		
	});
	
	
	Events.on(runner,'afterUpdate',e => {
		let w = render.options.width, h = render.options.height;
		let c = 70;
		ships.forEach(s => {
			if(s.position.x < -c)
			{
				Body.setPosition(s,Vector.add(s.position,{x:w+2*c,y:0}));
			}
			else if(s.position.x > w+c)
			{
				Body.setPosition(s,Vector.add(s.position,{x:-w-2*c,y:0}));
			}
			if(s.position.y < -c)
			{
				Body.setPosition(s,Vector.add(s.position,{x:0,y:h+2*c}));
			}
			else if(s.position.y > h+c)
			{
				Body.setPosition(s,Vector.add(s.position,{x:0,y:-h-2*c}));
			}
		});
	});
});