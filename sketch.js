{
	var canvas = undefined
	var player = null
	var inner = null
}

function setup() {
	canvas = createCanvas(windowWidth, windowHeight)
	player = new Player(width/2, height/2)
	inner = new Inner(player)
	player.addChild(inner)

	console.log("PLAYER")
	console.log(player)
	console.log("INNER")
	console.log(inner)
}

function reflection(line, wall) {
	var reflection = line.copy()	// vector of the line being reflected
	var normal = wall.copy()		// vector of the wall the line is colliding with
	normal.normalize()
	var dist = 2 * p5.Vector.dot(reflection,normal)	// magic formula
	normal.mult(dist)
	reflection.sub(normal)
	return reflection
}

function reflection2(line, wall) {
	var reflection = line.copy()	// vector of the line being reflected
	var normal = wall.copy()		// vector of the wall the line is colliding with
	normal.normalize()
	var dist = 2 * p5.Vector.dot(reflection,normal)	// magic formula
	normal.mult(dist)
	normal.sub(reflection)
	return normal
}

function draw() {
	background(101)

/*	var hor = createVector(100,0)
	var perp = hor.copy()
	var temp = perp.x
	perp.x = -perp.y
	perp.y = temp
	var diag = createVector(mouseX-width/2, mouseY-height/2) //createVector(100,200)
	var final = reflection2(diag, hor)

	push()
	translate(width/2,height/2)
	strokeWeight(4)
d
	stroke(0,255,0)
	line(0,0, hor.x, hor.y)
	stroke(0,255,255)
	line(0,0, perp.x, perp.y)
	stroke(255,0,0)
	line(0,0, diag.x, diag.y)

	stroke(0)
	strokeWeight(2)
	line(0,0, final.x, final.y)
	pop()*/

	player.update()
	inner.update()

	player.display()
	inner.display()

	player.displayDebug()
}

class Inner {
	constructor(player) {
		this.parent = player
		this.radius = this.parent.radius * 0.3
		this.bodyColor = color(0,255,255)

		this.position = createVector(this.parent.position.x, this.parent.position.y)
		this.velocity = createVector(0,0)
		this.acceleration = createVector(0,0)

		this.isOnEdge = false
	}

	update() {
		this.friction()
		this.checkEdge()

		if (this.isOnEdge) {
			var internalForce = this.parent.position.copy()
			internalForce.sub(this.position)
			internalForce.normalize()
			var magnitude = this.velocity.mag() * 1
			internalForce.mult(magnitude)
			this.addForce(internalForce)
		}

		// Update position, velocity, and acceleration
		this.velocity.add(this.acceleration)
		if (this.isOnEdge) this.position.add(this.parent.velocity)
		this.position.add(this.velocity)
		this.acceleration.mult(0)

		push()
		fill(255)
		text("accSnapX: "+this.parent.accelerationSnapshot.x, 25, 300)
		pop()

		this.velocityMin()
	}

	checkEdge() {
		var distance = dist(this.position.x, this.position.y, this.parent.position.x, this.parent.position.y)
		if (distance >= this.parent.radius - this.radius*2) {
			this.isOnEdge = true
		}
		else {
			this.isOnEdge = false
		}
	}

	addForce(force) {
		this.acceleration.add(force)
	}

	friction() {
		var frictionRate = 0.1
		this.velocity.mult(1-frictionRate)
	}

	velocityMin() {
		// If velocity is very small, just set it to zero
		if (this.velocity.mag() < 0.001) {
			this.velocity.mult(0)
		}
	}

	display() {
		push()
		fill(this.bodyColor)
		stroke(0,255,0)
		strokeWeight(1)
		ellipse(this.position.x, this.position.y, this.radius)
		pop()
	}
}

class Player {
	constructor(x,y) {
		this.radius = 150

		this.position = createVector(x,y)
		this.velocity = createVector(0,0)
		this.acceleration = createVector(0,0)

		this.children = []
		this.childDampening = 0

		this.accelerationSnapshot = createVector(0,0)
	}

	update() {
		//this.boundaries()
		this.checkMovement()
		this.friction()

		// Update velocity and position
		this.velocity.add(this.acceleration)
		this.position.add(this.velocity)

		// Save acceleration on a variable and erase it
		this.accelerationSnapshot = this.acceleration.copy()
		this.acceleration.mult(0)

		this.velocityMin()
	}

	boundaries() {
		if (this.position.x - this.radius/2 <= 0 || this.position.x + this.radius/2 >= width) {
			var verticalWall = createVector(width,1)
			var vForce = reflection(this.velocity, verticalWall)
			this.velocity = vForce.copy()
		}
			
	}

	velocityMin() {
		if (this.velocity.mag() < 0.001) {
			this.velocity.mult(0)
		}
	}

	addForce(force) {
		this.acceleration.add(force)
	}

	addChild(child) {
		this.children.push(child)
	}

	display() {
		push()
		fill(255)
		noStroke()
		ellipse(this.position.x,this.position.y, this.radius)
		pop()
	}

	displayDebug() {
		push()
		fill(255)
		text("POS  X: " + this.position.x, 25, 25)
		text("POS  Y: " + this.position.y, 25, 40)

		text("VEL  X: " + this.velocity.x, 25, 65)
		text("VEL  Y: " + this.velocity.y, 25, 80)

		text("ACC  X: " + this.acceleration.x, 25, 105)
		text("ACC  Y: " + this.acceleration.y, 25, 120)
		pop()
	}

	checkMovement() {
		if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
			this.addForce(createVector(1,0))
		}
		if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
			this.addForce(createVector(-1,0))
		}
		if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
			this.addForce(createVector(0,-1))
		}
		if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
			this.addForce(createVector(0,1))
		}
	}

	friction() {
		var frictionRate = 0.01
		this.velocity.mult(1-frictionRate)
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight)
}

function mousePressed() {
	var force = createVector(1,0)
	inner.addForce(force)
}