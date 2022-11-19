class Vector {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    subtract(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    get length() {
        return Math.sqrt(this.x**2+this.y**2);
    }

    get unit() {
        return this.divide(this.length);
    }

    divide(scalar) {
        return new Vector(this.x/scalar, this.y/scalar);
    }

    scale(scalar) {
        return new Vector(this.x*scalar, this.y*scalar);
    }

    distance(other) {
        return this.subtract(other).length;
    }

    wrap(other) {
        this.x += this.x < 0 ? other.x : 0;
        this.y += this.y < 0 ? other.y : 0;
    }
    equals(other) {
        return this.x == other.x && this.y == other.y;
    }
    multiply(other) {
        return this.x * other.x + this.y * other.y;
    }
    copy() {
        return new Vector(this.x, this.y);
    }
    hadamard(other) {
        return new Vector(this.x * other.x, this.y * other.y);
    }
}

class Ring {
    constructor(canvas, options) {
        let {
            position,
            r,
            color,
            thickness,
            speed = 0,
            direction = new Vector(0, 0),
            acceleration = new Vector(0, 0),
        } = options;
        this.speed = speed;
        this.acceleration = acceleration;
        this.position = position;
        this.direction = direction;
        this.r = r;
        this.color = color;
        this.thickness = thickness;
        this.canvas = canvas;
    }
    draw() {
        drawCircle(this.context, this.position, this.r, this.color);
        drawCircle(this.context, this.position, this.r-this.thickness, "blue");
    }
    update() {
        this.position = this.position.add(this.velocity);
        this.wrap();
        return this;
    }
    pyth(a, b) {
        return Math.pow(a*a + b*b, 0.5);
    }
    isColliding(other) {
        const xDiff = other.x - this.x;
        const yDiff = other.y - this.y;
        return this.pyth(xDiff, yDiff) - this.r - other.r < 0;
    }
    wrap() {
        let boundary = new Vector(canvas.width, canvas.height);
        this.position.wrap(boundary);
    }
    get context() {
        return this.canvas.getContext("2d");
    }
    get velocity() {
        return this.direction.scale(this.speed);
    }
    behind(h) {
        return this.position.subtract(this.direction.scale(this.r + h))
    }
}
class Body extends Ring {
    constructor(canvas, options) {
        super(canvas, options);
        this.parent = null;
        this.child = null;
        this.options = options;
    }
    grow() {
        this.child = new Body(canvas, {
            position: this.behind(this.r),
            r: this.r,
            color: this.color,
            thickness: this.thickness,
            direction: this.direction.copy(),
            speed: this.speed,
        });
        this.child.parent = this;
        return this.child;
    }
    update() {
        console.log("update", this, this.position);
        if (this.parent) {
            this.follow(this.parent);
        } else {
            super.update();
        }
        if (this.child) this.child.update();
    }
    draw() {
        super.draw();
        if (this.child) this.child.draw();
    }
    follow(other) {
        if (this.direction.equals(other.direction)) {
            this.position = other.behind(this.r);
        } else {
            const diff = other.position.subtract(this.position);
            if (Math.abs(other.direction.multiply(diff)) >= (this.r + other.r)) {
                this.direction = other.direction.copy();
                this.follow(other);
            } else {
                const u = other.direction.scale(diff.multiply(other.direction));
                const l = Math.sqrt((this.r + other.r)**2 - u.length **2);
                const v = this.direction.scale(l);
                this.position = other.position.subtract(u).subtract(v);
            }
        }
    }
}
class Snake {
    constructor(canvas, options) {
        this.head = new Body(canvas, options);
        this.tail = this.head;
    }
    update() {
        this.head.update();
        return this;
    }
    draw() {
        this.head.draw();
        return this;
    }
    grow() {
        this.tail = this.tail.grow();
        return this;
    }
}
function clear(canvas) {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}
function drawCircle(context, position, r, color) {
    let { x, y } = position;
    context.beginPath();
    context.fillStyle = color;
    context.arc(x, y, r, 0, 2*Math.PI);
    context.fill();
}
let canvas = document.getElementById('canvas');
let player;
function main(canvas) {
    player = new Snake(canvas, {
        position: new Vector(canvas.width/2, canvas.height/2),
        r: 20,
        color: "pink",
        thickness: 5,
        direction: new Vector(1, 0),
        speed: 1,
    });
    player.grow();
    player.head.direction = new Vector(0, -1);
    setInterval(() => {
        player.update();
        clear(canvas);
        player.draw();
    }, 10);
    const apples = [];
    // setInterval(() => {
    //     clear(canvas);
    //     apples.filter(ring => ring.isColliding(player)).map(ring => ring.color = "red")
    //     apples.map(apple => apple.update().draw())
    //     player.update().draw()
    // }, 300);
    document.addEventListener('keydown', function(event) {
        const direction = [
            "ArrowLeft",
            "ArrowUp",
            "ArrowDown",
            "ArrowRight"
        ].indexOf(event.key);
        if (direction > -1) {
            const dimensions = 2;
            const [a, b] = [...new Array(dimensions).keys()]
                .map(n => n+1)
                .map(i => (direction & i)/i);
            console.log("player.update", player.head.direction, {
                a, b,
                a_b_1: a+b-1,
                b_a: b-a,
            });
            player.head.direction = new Vector(a+b-1, b-a);
        }
    });
    canvas.addEventListener("click", () => {
        player.grow();
        // apples.push(new Ring(canvas, {
        //     position: player.tail.behind(10),
        //     color: "green",
        //     r: 10,
        //     thickness: 10,
        // }));
    });
}
main(canvas);
