const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 400,
    backgroundColor: '#87CEEB',  
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },  
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let lastObstacleX = 0;
let obstacleCount = 0;
const maxObstacles = 7;  // Máximo de 
let gameOver = false;
let gameOverText;
let restartButton;

function preload() {
    this.load.image('rollo', 'assets/rollo de canela2.png');  
    this.load.image('background', 'assets/cocina juego.png');  
    this.load.image('coca_cola', 'assets/coca-cola-en-lata-sabor-orginal-350ml.png'); 
    this.load.image('coffee', 'assets/vaso de cafe.png');  
}

function create() {
    // Crear el fondo con la nueva imagen proporcionada
    this.add.image(400, 170, 'background').setOrigin(0.5).setDisplaySize(800, 625);

    // Crear el sprite del nuevo rollo de canela
    const rolloHeightAdjustment = 135;  
    this.rollo = this.physics.add.sprite(130, this.scale.height - 100 - rolloHeightAdjustment, 'rollo'); 
    this.rollo.setScale(0.2);  // Incrementar el tamaño del sprite
    this.rollo.setBounce(0.2);
    this.rollo.setCollideWorldBounds(true);

    // Ajustar el tamaño del cuerpo de colisión del rollo 
    this.rollo.body.setSize(this.rollo.width - 185, this.rollo.height - 195).setOffset(15, 15);

    // Crear una plataforma invisible para que el rollo tenga una superficie donde saltar
    const ground = this.add.rectangle(400, this.scale.height - 45, 800, 20);  
    this.physics.add.existing(ground, true);  

    // Hacer que el rollo colisione con el suelo
    this.physics.add.collider(this.rollo, ground);

    // Crear un grupo de obstáculos
    this.obstacles = this.physics.add.group({
        maxSize: 7,
        immovable: true,
        allowGravity: false
    });

    // Añadir colisión entre los obstáculos y el rollo
    this.physics.add.collider(this.rollo, this.obstacles, hitObstacle, null, this);

    // Generar el primer obstáculo
    addObstacle.call(this);

    // Configurar los controles del teclado
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);  

    // Ajustar los límites del mundo para que el rollo no se salga de los límites del escenario
    this.physics.world.setBounds(0, 0, 800, 400);
    this.rollo.body.setCollideWorldBounds(true);

    // Crear texto de Game Over (oculto inicialmente)
    gameOverText = this.add.text(400, 150, 'Game Over', { fontSize: '64px', fill: '#ff0000' }).setOrigin(0.5).setVisible(false);

    // Crear botón de reinicio (oculto inicialmente)
    restartButton = this.add.text(400, 250, 'Volver a jugar', { 
        fontSize: '32px', 
        fill: '#fff', 
        backgroundColor: '#000', 
        padding: { x: 20, y: 10 }, 
        borderRadius: 5,
        align: 'center'
    }).setOrigin(0.5).setVisible(false).setInteractive();

    // Añadir estilo CSS para el botón
    restartButton.setStyle({
        cursor: 'pointer'
    });

    restartButton.on('pointerdown', function () {
        resetGame.call(this);
    }, this);
}

function update() {
    if (gameOver) {
        return;
    }

    // Movimiento horizontal

    if (this.cursors.left.isDown) {
        this.rollo.setVelocityX(-160); 
    } else if (this.cursors.right.isDown) {
        this.rollo.setVelocityX(160);  
    } else {
        this.rollo.setVelocityX(0);  
    }

    // Salto

    if ((this.cursors.up.isDown || this.spaceBar.isDown) && this.rollo.body.touching.down) {
        this.rollo.setVelocityY(-450);  
    }

    // Mover los obstáculos

    this.obstacles.children.iterate(function (obstacle) {
        if (obstacle) {
            obstacle.x -= 5;  
            if (obstacle.x < -obstacle.width) {
                this.obstacles.killAndHide(obstacle);
                obstacle.body.enable = false;
            }
        }
    }, this);

    // Mostrar la taza de café al final después de 5 segundos del último obstáculo

    if (obstacleCount >= maxObstacles && !this.coffeeTimer) {
        this.coffeeTimer = this.time.addEvent({
            delay: 4500,
            callback: addCoffee,
            callbackScope: this,
            loop: false
        });
    }   

    // Hacer que la taza de café rebote en los bordes
    if (this.coffee) {
        if (this.coffee.x <= 0 || this.coffee.x >= 800) {
            this.coffee.setVelocityX(this.coffee.body.velocity.x * -1); 
        }
    }
}

function addObstacle() {
    if (obstacleCount < maxObstacles) {
        const yPosition = this.scale.height - 85;  
        const obstacle = this.obstacles.get(1200, yPosition, 'coca_cola');  
        if (!obstacle) return;

        obstacle.setActive(true);
        obstacle.setVisible(true);
        obstacle.body.enable = true;
        obstacle.setScale(0.18); 

        // Ajustar el tamaño del cuerpo de colisión del obstáculo
        obstacle.body.setSize(obstacle.width - 140, obstacle.height - 140).setOffset(15, 15);

        obstacle.setVelocityX(-50);  

        // Actualizar la última posición del obstáculo
        lastObstacleX = obstacle.x;

        // Incrementar el contador de obstáculos
        obstacleCount++;

        // Agregar un nuevo evento de tiempo con un intervalo aleatorio
        this.time.addEvent({
            delay: getRandomInterval(),
            callback: addObstacle,
            callbackScope: this,
            loop: false
        });
    }
}

function addCoffee() {
    this.coffee = this.physics.add.sprite(850, this.scale.height - 85, 'coffee');  
    this.coffee.setScale(0.2);  
    this.coffee.body.setImmovable(false);
    this.coffee.body.setAllowGravity(false);
    this.coffee.setVelocityX(-100);
    this.coffee.setCollideWorldBounds(true);  
    this.coffee.setBounce(1, 0);  
    this.coffee.body.setSize(this.coffee.width - 231, this.coffee.height - 30).setOffset(15, 15);
    this.physics.add.collider(this.rollo, this.coffee, hitCoffee, null, this);
}

function getRandomInterval() {
    return Phaser.Math.Between(1000, 4000);  
}

function hitObstacle(rollo, obstacle) {
    this.physics.pause();
    rollo.setTint();
    gameOver = true;
    gameOverText.setVisible(true);
    restartButton.setVisible(true);
}

function hitCoffee(rollo, coffee) {
    this.physics.pause();
    rollo.setTint();
    coffee.setTint();

    // Crear y mostrar el texto "¡Disfrútalo con un café!"
    enjoyText = this.add.text(400, 150, '¡Disfrútalo con un café!', { 
        fontSize: '32px', 
        fill: '#000' 
    }).setOrigin(0.5);

    // Crear y mostrar el texto "Dulce Canela" con bordes redondeados
    brandText = this.add.text(400, 250, 'Dulce Canela', { 
        fontSize: '32px', 
        fill: '#fff', 
        backgroundColor: '#ec5b13', 
        padding: { x: 10, y: 5 },
        fontFamily: 'Pacifico',
        align: 'center',
        borderRadius: '15px'
    }).setOrigin(0.5).setStyle({ borderRadius: '15px' });

    // Añadir el botón de cierre
    closeButton = this.add.text(760, 20, 'X', { 
        fontSize: '32px', 
        fill: '#fff', 
        backgroundColor: '#000', 
        padding: { x: 10, y: 5 },
        fontFamily: 'Arial',
        align: 'center' 
    }).setOrigin(0.5).setInteractive();

    closeButton.setStyle({
        cursor: 'pointer'
    });

    closeButton.on('pointerdown', function () {
        resetGame.call(this);
    }, this);
}

function resetGame() {
    gameOver = false;
    obstacleCount = 0;
    lastObstacleX = 0;
    if (this.coffeeTimer) {
        this.coffeeTimer.remove();
        this.coffeeTimer = null;
    }
    this.obstacles.clear(true, true);
    if (this.coffee) {
        this.coffee.destroy();
        this.coffee = null;
    }
    this.rollo.clearTint();
    this.rollo.setPosition(100, this.scale.height - 100 - 60);
    this.physics.resume();
    gameOverText.setVisible(false);
    restartButton.setVisible(false);

    // Ocultar los textos de "¡Disfrútalo con un café!" y "Dulce Canela"
    if (enjoyText) {
        enjoyText.destroy();
        enjoyText = null;
    }
    if (brandText) {
        brandText.destroy();
        brandText = null;
    }
    if (closeButton) {
        closeButton.destroy();
        closeButton = null;
    }

    this.time.addEvent({
        delay: 1000,
        callback: addObstacle,
        callbackScope: this,
        loop: false
    });
}