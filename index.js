var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

class Ring {
    constructor({
        x, y, r, color, thickness,
        speed = 10,
        acceleration = 1,
    }) {
        this.speed = speed;
        this.acceleration = acceleration;
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
        this.thickness = thickness;
    }
    draw(context) {
        drawCircle(context, this.x, this.y, this.r, this.color);
        drawCircle(context, this.x, this.y, this.r-this.thickness, "blue");
    }
    update() {
        this.speed += this.acceleration;
        this.x += this.speed;
        this.x %= canvas.width;
        this.y += this.speed;
        this.y %= canvas.height;
    }
    pyth(a, b) {
        return Math.pow(a*a + b*b, 0.5);
    }
    isColliding(other) {
        const xDiff = other.x - this.x;
        const yDiff = other.y - this.y;
        return this.pyth(xDiff, yDiff) - this.r - other.r < 0;
    }
}
const directions = [
    "left",
    "up",
    "right",
    "down",
];

class Player extends Ring {
    constructor() {
        super({
            x: canvas.width / 2,
            y: canvas.height / 2,
            r: 20,
            color: "pink",
            thickness: 5,
            speed: 10,
            acceleration: 0,
            direction: 2,
        });
        this.direction = 2;

    }
    update() {
        const d = this.direction;
        if (d == 0) {
            this.x -= this.speed;
        } else if (d == 1) {
            this.y -= this.speed;
        } else if (d == 2) {
            this.x += this.speed;
        } else if (d == 3 ) {
            this.y += this.speed;
        }
        this.x %= canvas.width;
        this.y %= canvas.height;
    }
    behind(h) {
        let x = this.x;
        let y = this.y;
        const d = this.direction;
        if (d == 0) {
            x += h;
        } else if (d == 1) {
            y += h;
        } else if (d == 2) {
            x -= h;
        } else if (d == 3 ) {
            y -= h;
        }
        return { x, y };
    }
}

const player = new Player();
const apples = [
    new Ring({
        x: canvas.width / 2,
        y: canvas.height / 4,
        r: 10,
        color: "green",
        thickness: 10,
        speed: 0,
        acceleration: 0,
    }),
]

function addApple() {
    console.log(apples);
    apples.push(new Ring({
        x: player.behind(player.r+1).x,
        y: player.behind(player.r+1).y,
        color: "green",
        r: 10,
        thickness: 10,
        speed: 0,
        acceleration: 0,
    }));
}

function update() {
    apples.map(ring => ring.update());
    player.update();
    apples.filter(ring => ring.isColliding(player))
        .map(ring => {
            ring.color = "red";
        })
}
function clear(context) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}
function drawCircle(context, x, y, r, color) {
    context.beginPath();
    context.fillStyle = color;
    context.arc(x, y, r, 0, 2*Math.PI);
    context.fill();
}
function draw(context) {
    apples.map(ring => ring.draw(context));
    player.draw(context);
}
function start() {
    update();
    clear(context);
    draw(context);
    requestAnimationFrame(start);
}

start();

document.addEventListener('keydown', function(event) {
    const code = event.keyCode-37;
    if (code >=0 && code < 4) {
        console.log(`Moving :${directions[code]}`);
        player.direction = code;
    }
});

canvas.addEventListener("click", addApple);
// setInterval(addApple, 100);