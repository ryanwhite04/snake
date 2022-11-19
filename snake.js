
const screen = new Vector(window.innerWidth, window.innerHeight);

class Circle {
    constructor(element) {
        this.element = element;
    }
    get rect() { return this.element.getBoundingClientRect() }
    get height() { return this.rect.height }
    get width() { return this.rect.width }
    get size() { return new Vector(this.width, this.height) }
    get top() { return this.rect.top + (this.height/2) }
    get left() { return this.rect.left + (this.width/2) }
    get y() { return this.top }
    get x() { return this.left }
    get position() { return new Vector(this.x, this.y) }
    set position(vector) {
        let { x, y } = vector.wrap(screen);
        this.element.style.position = "absolute";
        this.element.style.left = `${x - (this.width/2)}px`;
        this.element.style.top = `${y - (this.height/2)}px`;
    }

    move(vector) {
        this.position = this.position.add(vector);
    }

    travel(target, distance) {
        const difference = target.subtract(this.position);
        const unit = difference.unit;
        const total = unit.times(distance);
        this.move(total);
    }

    touching(other) {
        return this.position.distance(other) < this.size.length / 2;
    }

}
const circle = new Circle(document.getElementById('circle'));

// let start, hit, end, animation;
// function move() {
//     hit = hit || circle.touching(screen);
//     end = hit && circle.touching(start.subtract(circle.size));
//     if (end) {
//         window.cancelAnimationFrame(animation);
//     } else {
//         circle.travel(hit ? start: screen, 3);
//         animation = requestAnimationFrame(move);
//     }
// }

// window.addEventListener("click", begin);
// function begin(event) {
//     window.cancelAnimationFrame(animation);
//     start = new Vector(event.clientX, event.clientY);
//     circle.position = start;
//     hit = false;
//     end = false;
//     move();
// }