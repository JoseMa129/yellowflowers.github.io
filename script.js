const canvas = document.getElementById('flowerCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let petals = [];
let flowers = [];
let maxPetals = 200;
let petalsPerFlower = 6;
let maxFlowers = 30;
let fallingTime = 5000; // Tiempo de caída de pétalos (5 segundos)
let startTime = Date.now();
let bouquetCreated = false;
let flowersConverging = false;
let showHeartText = false; // Para controlar cuándo mostrar el texto

// Porcentajes para ajustar tamaños
const flowerSizePercentage = 4; // Porcentaje del tamaño del lienzo
const heartScaleFactor = 0.03; // Factor de escalado para el corazón
const fontSizePercentage = 0.05; // Tamaño del texto basado en porcentaje del ancho de pantalla

// Función para calcular la posición de un corazón
function heartShape(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return { x: canvas.width / 2 + x * (canvas.width * heartScaleFactor), y: canvas.height / 2 - y * (canvas.height * heartScaleFactor) };
}

class Petal {
    constructor(x, y, angle, size, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.size = size;
        this.color = '#FFEB3B'; // Amarillo
        this.speed = Math.random() * 1.5 + 0.5;
        this.targetX = targetX; // Posición final (formación de la flor)
        this.targetY = targetY;
        this.attracted = false;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        if (!this.attracted) {
            this.y += this.speed;
            if (this.y >= canvas.height * 0.75) {
                this.attracted = true; // Los pétalos comienzan a moverse hacia el centro de la flor
            }
        } else {
            this.x += (this.targetX - this.x) * 0.02; // Movimiento suave hacia el centro de la flor
            this.y += (this.targetY - this.y) * 0.02;
        }
        this.draw();
    }
}

class Flower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.initialX = x;
        this.initialY = y;
        this.petals = [];
        this.centerColor = '#FBC02D';
        this.targetX = x; // Guardar la posición objetivo para cuando converjan las flores
        this.targetY = y;
    }

    generatePetals() {
        const flowerSize = (canvas.width * flowerSizePercentage) / 100; // Tamaño de la flor basado en porcentaje
        for (let i = 0; i < petalsPerFlower; i++) {
            let angle = (Math.PI * 2 / petalsPerFlower) * i;
            let size = Math.random() * flowerSize + flowerSize * 0.5; // Tamaño de los pétalos basado en la flor
            let offsetX = Math.cos(angle) * (flowerSize / 2); // Ajustar para que los pétalos se alineen con el borde
            let offsetY = Math.sin(angle) * (flowerSize / 2);
            let petal = new Petal(this.x + offsetX, this.y + offsetY, angle, size, this.x + offsetX, this.y + offsetY);
            this.petals.push(petal);
            petals.push(petal); // Agregar los pétalos al grupo global
        }
    }

    draw() {
        // Dibujar primero los pétalos
        this.petals.forEach(petal => petal.draw());

        // Centro de la flor
        const flowerSize = (canvas.width * flowerSizePercentage) / 100; // Tamaño de la flor
        ctx.beginPath();
        ctx.arc(this.x, this.y, flowerSize / 4, 0, Math.PI * 2);
        ctx.fillStyle = this.centerColor;
        ctx.fill();

        // Contorno del centro de la flor
        ctx.strokeStyle = '#C6A600'; // Amarillo oscuro
        ctx.lineWidth = 2; // Ancho del contorno
        ctx.stroke(); // Dibujar el contorno
    }

    // Método para mover las flores hacia la forma de un corazón
    convergeToHeartShape(index) {
        const t = index * (Math.PI / (maxFlowers / 2));
        const { x, y } = heartShape(t);
        this.targetX = x;
        this.targetY = y;

        // Movimiento suave hacia esa posición
        this.x += (this.targetX - this.x) * 0.01;
        this.y += (this.targetY - this.y) * 0.01;

        this.petals.forEach(petal => {
            petal.targetX = this.x;
            petal.targetY = this.y;
        });
    }
}

function generateFlowers() {
    while (flowers.length < maxFlowers) {
        let x = Math.random() * canvas.width; // Posición aleatoria en el ancho del canvas
        let y = Math.random() * canvas.height * 0.75; // Posición aleatoria en el alto del canvas (75% de la pantalla)
        let flower = new Flower(x, y);
        flower.generatePetals();
        flowers.push(flower);
    }
}

function drawHeartText() {
    const fontSize = canvas.width * fontSizePercentage; // Adaptar tamaño al ancho de pantalla
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = '#ff0080'; // Color del texto
    ctx.textAlign = 'center';
    ctx.fillText("Te amo mucho mi princesita hermosa❤️", canvas.width / 2, canvas.height / 2);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let elapsed = Date.now() - startTime;

    // Pétalos caen y se juntan para formar flores
    if (elapsed < fallingTime) {
        petals.forEach(petal => petal.update());
    } else {
        // Formación de flores y agrupación gradual
        if (!bouquetCreated) {
            generateFlowers(); // Generar todas las flores al mismo tiempo
            bouquetCreated = true;

            // Después de que se formen las flores, comenzamos el proceso de convergencia
            setTimeout(() => {
                flowersConverging = true;
                setTimeout(() => {
                    showHeartText = true; // Mostrar el texto después de que las flores se agrupen
                }, 3000); // Retraso para mostrar el texto
            }, 2000); // Retraso de 2 segundos antes de que las flores se junten en el centro
        }
        petals.forEach(petal => petal.update());

        // Si las flores están listas para converger, moverlas hacia la forma de un corazón
        if (flowersConverging) {
            flowers.forEach((flower, index) => flower.convergeToHeartShape(index));
        }
    }

    // Dibujar las flores cuando los pétalos se han juntado
    flowers.forEach(flower => flower.draw());

    // Mostrar el texto en el centro del corazón cuando corresponda
    if (showHeartText) {
        drawHeartText();
    }

    requestAnimationFrame(animate);
}

// Redimensionar el canvas cuando cambie el tamaño de la pantalla
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    animate();
}

window.addEventListener('resize', resizeCanvas);

// Iniciar la animación
animate();
