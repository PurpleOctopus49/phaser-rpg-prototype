// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [GameScene]
};

const game = new Phaser.Game(config);

class GameScene extends Phaser.Scene {
    constructor() {
        super('game');
    }

    preload() {
        // Load assets
        // Since we're using simple graphics, we'll create them on the fly
    }

    create() {
        // Create simple tilemap
        this.createMap();
        
        // Create player
        this.createPlayer();
        
        // Create NPCs
        this.createNPCs();
        
        // Set up camera to follow player
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, 1600, 1200);
        
        // Set up keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-W', () => this.handleInput('W'));
        this.input.keyboard.on('keydown-A', () => this.handleInput('A'));
        this.input.keyboard.on('keydown-S', () => this.handleInput('S'));
        this.input.keyboard.on('keydown-D', () => this.handleInput('D'));
        this.input.keyboard.on('keydown-SPACE', () => this.interact());
        
        // Dialog system
        this.dialogActive = false;
        this.currentDialog = null;
        this.dialogIndex = 0;
        
        console.log('Game Started! Use arrow keys or WASD to move, SPACE to interact');
    }

    createMap() {
        // Create a simple grass background
        let graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x2d5016, 1);
        graphics.fillRect(0, 0, 1600, 1200);
        graphics.generateTexture('grass', 1600, 1200);
        graphics.destroy();
        
        this.add.image(800, 600, 'grass').setScrollFactor(0, 0).setDepth(-1);
        
        // Create some simple tile obstacles (trees)
        this.obstacles = this.physics.add.staticGroup();
        this.createObstacles();
    }

    createObstacles() {
        // Create some trees as obstacles
        const treePositions = [
            { x: 200, y: 200 },
            { x: 600, y: 300 },
            { x: 1000, y: 400 },
            { x: 400, y: 800 },
            { x: 1200, y: 900 }
        ];
        
        treePositions.forEach(pos => {
            let tree = this.add.rectangle(pos.x, pos.y, 40, 40, 0x6b4423);
            this.physics.add.existing(tree, true);
            this.obstacles.add(tree);
        });
    }

    createPlayer() {
        // Create player character (simple rectangle for now)
        this.player = this.add.rectangle(400, 300, 32, 32, 0x00ff00);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        
        // Collision with obstacles
        this.physics.add.collider(this.player, this.obstacles);
    }

    createNPCs() {
        this.npcs = this.physics.add.staticGroup();
        
        // NPC 1 - Elder
        let npc1 = this.add.rectangle(600, 200, 28, 28, 0xff00ff);
        this.physics.add.existing(npc1, true);
        this.npcs.add(npc1);
        npc1.name = 'Elder';
        npc1.dialogLines = [
            "Hello traveler!",
            "Welcome to our village.",
            "Beware of the forest to the north..."
        ];
        
        // NPC 2 - Merchant
        let npc2 = this.add.rectangle(800, 500, 28, 28, 0xffff00);
        this.physics.add.existing(npc2, true);
        this.npcs.add(npc2);
        npc2.name = 'Merchant';
        npc2.dialogLines = [
            "Welcome to my shop!",
            "I have potions and supplies.",
            "Come back soon!"
        ];
    }

    handleInput(key) {
        // Handle WASD movement
        let speed = 150;
        if (key === 'W') this.player.body.setVelocity(0, -speed);
        if (key === 'A') this.player.body.setVelocity(-speed, 0);
        if (key === 'S') this.player.body.setVelocity(0, speed);
        if (key === 'D') this.player.body.setVelocity(speed, 0);
    }

    update() {
        // Handle arrow key movement
        let speed = 150;
        this.player.body.setVelocity(0);
        
        if (this.cursors.up.isDown) {
            this.player.body.setVelocity(0, -speed);
        } else if (this.cursors.down.isDown) {
            this.player.body.setVelocity(0, speed);
        } else if (this.cursors.left.isDown) {
            this.player.body.setVelocity(-speed, 0);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocity(speed, 0);
        }
    }

    interact() {
        if (this.dialogActive) {
            this.nextDialog();
            return;
        }
        
        // Check if player is near any NPC
        this.npcs.children.entries.forEach(npc => {
            let distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                npc.x, npc.y
            );
            
            if (distance < 100) {
                this.startDialog(npc);
            }
        });
    }

    startDialog(npc) {
        this.dialogActive = true;
        this.currentDialog = npc;
        this.dialogIndex = 0;
        this.showDialog();
    }

    showDialog() {
        let lines = this.currentDialog.dialogLines;
        let text = `${this.currentDialog.name}: ${lines[this.dialogIndex]}`;
        document.getElementById('status').textContent = text + ' (SPACE to continue)';
    }

    nextDialog() {
        this.dialogIndex++;
        if (this.dialogIndex < this.currentDialog.dialogLines.length) {
            this.showDialog();
        } else {
            this.endDialog();
        }
    }

    endDialog() {
        this.dialogActive = false;
        this.currentDialog = null;
        document.getElementById('status').textContent = 'Press SPACE near NPCs to talk';
    }
}