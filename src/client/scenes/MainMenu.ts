import Phaser from 'phaser'

import AnimatedTile from './AnimatedTile'
import { Faune, Player } from '../characters'
import { Enemy, EnemyList, spawnEnemiesFromMap } from '../enemies'
import { Weapon } from '../weapons'
import MenuItem from '../ui/MenuItem'
import SoundManager from '../managers/SoundManager'

export default class MainMenu extends Phaser.Scene {

    private checkTime: number = 0
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
    private enemies!: EnemyList
    private player!: Player
    private musicmgr = new SoundManager(this)
    private speed: number = 50
    private map!: Phaser.Tilemaps.Tilemap
    private menu: MenuItem[] = []
    private _menuIndex: number = 0

    constructor() {
        super('mainmenu')
    }

    get allEnemyGroups() {
		return this.enemies ? Object.keys(this.enemies).map(key=>this.enemies![key]) : []
	}
    get allEnemies() {
        const enemies: Enemy[] = []
        this.allEnemyGroups.forEach((group:Phaser.Physics.Arcade.Group)=>{
            const thisGroupEnemies = group.getChildren() as Enemy[]
            enemies.push(...thisGroupEnemies)
        })
        return enemies
    }

    get menuSelection() {
        return this.menu[this.menuIndex]
    }
    get menuIndex() {
        return this._menuIndex
    }
    set menuIndex(index: number) {
        this.menu[this.menuIndex].selected=false
        this._menuIndex = index<0 ? 0 : index+1>this.menu.length ? this.menu.length-1 : index
        this.menu[this.menuIndex].selected=true
    }

    preload() {
        const centerX = this.cameras.main.worldView.x + this.cameras.main.width / 2
        const titleConfig: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Nova Script',
            fontSize: '24px',
        }
        const textConfig: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Nova Script',
            fontSize: '14px',
        }
        this.add.text(centerX, 33, 'Dungeon Crawler', titleConfig).setOrigin(0.5).setScrollFactor(0, 0)
        const menuIndicators: Phaser.GameObjects.Image[] = [
            this.add.image(centerX - 80, 170, 'textures', 'menu_arrow').setScale(0.5).setScrollFactor(0, 0).setFlipX(true),
            this.add.image(centerX + 80, 170, 'textures', 'menu_arrow').setScale(0.5).setScrollFactor(0, 0),
        ]
        this.menu = [
            new MenuItem(this, centerX, 170, 'Start Campaign', textConfig, {nextScene: 'start', menuIndicators}),
            new MenuItem(this, centerX, 195, 'Multiplayer', textConfig, {nextScene: 'startmultiplayer', menuIndicators}),
            new MenuItem(this, centerX, 220, 'Options', textConfig, {nextScene: 'options', menuIndicators}),
        ]
        this.menu.forEach((item, index)=>{
            item.on('pointerover', ()=>this.menuIndex=index)
            item.on('pointerup', ()=>this.select())
        })
        this.menuIndex=0
        this.map = this.make.tilemap({key: 'dungeon-start'})
        const tileset = this.map.addTilesetImage('dungeon', undefined, 16, 16, 1, 2)
		this.map.createStaticLayer('Ground', tileset)
		const wallsLayer = this.map.createDynamicLayer('Walls', tileset)
        this.enemies = spawnEnemiesFromMap(this, this.map)
        this.allEnemies.forEach(obj=>{
            const enemy = obj as Enemy
            enemy.allowChangeDirection = false
            enemy.onCamera = true
            enemy.walk(-5, 0)
        })
        wallsLayer.setCollisionByProperty({collides: true})
        this.player = new Faune(this, 0, 0)
		this.physics.add.collider(this.player, wallsLayer, this.handlePlayerWallCollision, undefined, this)
        this.physics.add.collider(this.player.weapon!, wallsLayer, this.handleWeaponWallCollision, undefined, this)
        this.physics.add.collider(this.player.weapon!, this.allEnemyGroups, this.handleWeaponEnemyCollision, undefined, this)
        this.cameras.main.startFollow(this.player, true, 0.9, 0.9, 0, -20)
        this.cursors = this.input.keyboard.createCursorKeys()
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).on('up', ()=>this.select())
    }

    create() {
        // Collect tile animation details
        AnimatedTile.detect(this.map)
        // Init player, camera, sound
        const playerTile = this.map.getObjectLayer('Characters').objects.find(obj=>obj.type==='player') as Phaser.Types.Tilemaps.TiledObject
        this.player.setPosition(playerTile.x!, playerTile.y!)
        this.cameras.main.fadeIn(550, 0, 0, 0)
        this.musicmgr.play('music-menu', {loop: true})
        this.walk()
    }

    private select() {
        this.input.keyboard.removeAllKeys()
        this.menu.forEach(item=>item.removeAllListeners())
        this.cameras.main.fadeOut(1000, 0, 0, 0)
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, ()=>{
            this.player.setVelocity(0).play(this.player.directionAnim, true)
            this.scene.start(this.menuSelection.nextScene)
        })
    }

    walk(speed:number = this.speed) {
        this.player.walk(speed, 0)
        this.speed=speed
    }

    handlePlayerWallCollision() {
        this.walk(-this.speed)
    }

    update(t:number, dt:number) {
        super.update(t, dt)
        AnimatedTile.update(dt)
        if( !this.cursors ) return;
        if ( Phaser.Input.Keyboard.JustDown(this.cursors.space!) ) {
            this.select()
        } else if ( Phaser.Input.Keyboard.JustDown(this.cursors.up!) ) {
            this.menuIndex--
        } else if ( Phaser.Input.Keyboard.JustDown(this.cursors.down!) ) {
            this.menuIndex++
        }
        // Shoot if enemies are in front of me on screen
        if( t - this.checkTime > 1500 ) {
            this.checkTime = t
            const cam = this.cameras.main.worldView
            const bodies = this.physics.overlapRect(cam.x, cam.y, cam.width, cam.height) as any[]
            const nearObj = bodies.find(b=>b.gameObject instanceof Enemy)
            const nearEnemy = nearObj?.gameObject
            if( nearEnemy ) this.player.shoot()
            if( nearEnemy && nearEnemy.health > 1 ) setTimeout(()=>{
                this.player.shoot()
            }, 500)
        }
    }

    private handleWeaponWallCollision(obj1: Phaser.GameObjects.GameObject) {
		const weapon = obj1 as Weapon
		weapon.miss()
	}

	private handleWeaponEnemyCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
		const weapon = obj1 as Weapon
		const enemy = obj2 as Enemy
		weapon.hit(enemy)
	}

}