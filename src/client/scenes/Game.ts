import Phaser from 'phaser'

import AnimatedTile from './AnimatedTile'
import { debugDraw } from '../utils/debug'
import { Enemy, EnemyList, spawnEnemiesFromMap } from '../enemies'
import { characters, Player } from '../characters'
import { Button, Crate, Door, Item, ItemList, spawnItemsFromMap } from '../items'
import { Weapon } from '../weapons'
import { ComboManager, ConfigManager, EventManager as sceneEvents, Level, LevelManager, MultiplayerManager, SoundManager } from '../managers'

const CHECKINTERVAL = 1000

export default class Game extends Phaser.Scene {

	private config = new ConfigManager()
	private lastCheck: number = 0
	private innerCameraView = new Phaser.Geom.Rectangle(0, 0, 0, 0)
	private extendedCameraView = new Phaser.Geom.Rectangle(0, 0, 0, 0)
	private combos!: ComboManager
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
	private player!: Player
	private enemies!: EnemyList
	private items!: ItemList
	private nearBoss: boolean = false
	private playerEnemiesCollider?: Phaser.Physics.Arcade.Collider
	private map!: Phaser.Tilemaps.Tilemap
	private mp!: MultiplayerManager
	private mpOn: boolean = false
	private musicKey!: string
	private musicmgr = new SoundManager(this)
	private sndmgr = new SoundManager(this, 'sfx')
	private lvlmgr = new LevelManager()
	private win!: boolean

	constructor() {
		super('game')
	}

	get allEnemies() {
		return this.enemies ? Object.keys(this.enemies).map(key=>this.enemies![key]) : []
	}

	init(data: any) {
		this.win = false
		this.nearBoss = false
		this.mpOn = data.multiplayer ?? false
		this.events.once('shutdown', ()=>{
			if( this.mp ) this.mp.destroy()
			this.input.keyboard.removeAllKeys()
		})
	}

	preload() {
		// Loading screen
        const centerX = this.cameras.main.worldView.x + this.cameras.main.width / 2
		const centerY = this.cameras.main.worldView.y + this.cameras.main.height / 2
        const textConfig: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Nova Script',
            fontSize: '20px',
			backgroundColor: '#1a1a1a',
			padding: {x: 40, y: 20},

        }
		this.add.text(centerX, centerY*0.8, 'Get Ready...', textConfig).setOrigin(0.5)
		// Cursors
		this.cursors = this.input.keyboard.createCursorKeys()
		// Misc keys
		this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('up', ()=>this.pauseMenu())
		// Tilemap
		const lvl:Level = {world: this.config.getNumber('world'), level: this.config.getNumber('level')}
		const levelKey = this.lvlmgr.levelKey(lvl)
        this.load.tilemapTiledJSON(levelKey, `levels/${levelKey}.json`)
		// Music
		this.musicKey = SoundManager.Library.WorldMusic[lvl.world-1]
		if( this.config.getBoolean('music') ) {
			this.musicmgr.preload(SoundManager.Library.GeneralMusic)
			this.musicmgr.preload(this.musicKey)
		}
    }

	create() {
		// Set up map/layers
		const lvl:Level = {world: this.config.getNumber('world'), level: this.config.getNumber('level')}
		this.map = this.make.tilemap({key: this.lvlmgr.levelKey(lvl)})
		const tilesets = [
			this.map.addTilesetImage('cave', undefined, 16, 16, 0, 0),
			this.map.addTilesetImage('dungeon', undefined, 16, 16, 1, 2),
			this.map.addTilesetImage('dungeon_tiles', undefined, 16, 16, 1, 2),
			this.map.addTilesetImage('ffi', undefined, 16, 16, 0, 0),
			this.map.addTilesetImage('ffi_snow', undefined, 16, 16, 0, 0),
			this.map.addTilesetImage('forest', undefined, 16, 16, 0, 0),
			this.map.addTilesetImage('lava', undefined, 16, 16, 0, 0),
			this.map.addTilesetImage('legend_of_faune_tiles', undefined, 16, 16, 0, 0),
			this.map.addTilesetImage('legend_of_faune_water', undefined, 16, 16, 0, 0),
			this.map.addTilesetImage('overworld', undefined, 16, 16, 0, 0),
			this.map.addTilesetImage('roguelike_transparent', undefined, 16, 16, 1, 3),
		]
		this.map.createDynamicLayer('Subground', tilesets)
		this.map.createDynamicLayer('Ground', tilesets)
		const wallsLayer = this.map.createDynamicLayer('Walls', tilesets)
		this.map.createStaticLayer('Above', tilesets)?.setDepth(10)
		this.map.createStaticLayer('Ceiling', tilesets)?.setDepth(20)
		wallsLayer.setCollisionByProperty({collides: true})
		// Add player
		const playerTiles = this.map.getObjectLayer('Characters').objects.filter(obj=>obj.type==='player') as Phaser.Types.Tilemaps.TiledObject[]
		playerTiles.forEach(playerTile=>{
			const {x, y, name} = playerTile
			if( name===this.config.getString('character', 'faune') ) this.player = new characters[name](this, x, y)
		})
		// "Start" sets 'hearts' to 0. So in beginning, use player hearts default.
		// Otherwise, the config holds current number of hearts. After we get it, set it.
		const hearts = this.config.getNumber('hearts') || this.player.hearts
		this.config.setNumber('hearts', hearts)
		this.player.setup(this.config.getNumber('coins'), hearts)
		// Add items
		this.items = spawnItemsFromMap(this, this.map, this.player)
		// Add enemies
		this.enemies = spawnEnemiesFromMap(this, this.map)
		// Colliders
		const {chest, coin, crate, door, entrance, flask, lever, spikes, turkey} = this.items
		this.physics.add.overlap(this.player, [chest, lever], this.handlePlayerTouchItem, undefined, this)
		this.physics.add.overlap(this.player, [coin, door, entrance, flask, spikes, turkey], this.handlePlayerOverItem, undefined, this)
		this.physics.add.overlap(this.items.button, crate, this.handleButtonCrateTouch, undefined, this)
		this.physics.add.collider(this.player, crate)
		this.physics.add.collider(this.player, wallsLayer)
		this.physics.add.collider(crate, wallsLayer)
		this.physics.add.collider(crate, crate)
		this.physics.add.collider(this.allEnemies, wallsLayer, this.handleEnemyWallCollision, undefined, this)
		this.physics.add.collider(this.allEnemies, crate, this.handleEnemyWallCollision, undefined, this)
		this.physics.add.collider(this.allEnemies, [crate, this.items.door])
		this.playerEnemiesCollider = this.physics.add.collider(this.allEnemies, this.player, this.handlePlayerEnemyCollision, undefined, this)
		Object.keys(this.player.weapons).map(key=>this.player.weapons[key]).forEach((weaponGroup:Phaser.Physics.Arcade.Group)=>{
			this.physics.add.collider(weaponGroup, crate, this.handleWeaponWallCollision, undefined, this)
			this.physics.add.collider(weaponGroup, wallsLayer, this.handleWeaponWallCollision, undefined, this)
			this.physics.add.collider(weaponGroup, this.allEnemies, this.handleWeaponEnemyCollision, undefined, this)
		})
		// Event Handlers
        sceneEvents.on('boss-dead', this.handleBossDead, this)
        sceneEvents.on('button', this.handleButton, this)
        sceneEvents.on('lever', this.handleLever, this)
        sceneEvents.on('player-dead', this.handlePlayerDead, this)
        sceneEvents.on('player-exit', this.handlePlayerExit, this)
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, ()=>{
			sceneEvents.off('boss-dead', this.handleBossDead, this)
			sceneEvents.off('button', this.handleButton, this)
			sceneEvents.off('lever', this.handleLever, this)
            sceneEvents.off('player-dead', this.handlePlayerDead, this)
            sceneEvents.off('player-exit', this.handlePlayerExit, this)
        })
        // Collect tile animation details
        AnimatedTile.detect(this.map)
		// Set up UI
		this.cameras.main.fadeIn(1000, 0, 0, 0)
		this.scene.run('game-ui')
		this.cameras.main.startFollow(this.player, true)
		setTimeout(()=>{ this.check() }, 0) // After next tick so camera view is defined
		this.musicmgr.play(this.musicKey, { loop: true })
		if( this.game.config.physics.arcade?.debug ) debugDraw(wallsLayer, this)
		// Setup multiplayer
		if( this.mpOn ) {
			const endpoint = location.hostname.includes('curtiss.me') ? 
				'ws://home.curtiss.me:4000' :
				location.protocol.replace("http", "ws") + "//" + location.host
			this.mp = new MultiplayerManager(this, this.enemies, this.items, this.player)
			this.mp.join(endpoint, 'relay')
		}
		// Combo Manager (only in single-player mode)
		if( ! this.mp ) {
			this.combos = new ComboManager(this.input.keyboard, this.enemies, this.items, this.player)
			this.combos.activate()
		}
	}

	private check(t:number=CHECKINTERVAL+1) {
		const cam = this.cameras.main.worldView
		this.lastCheck = t
		//
		// Weapon Distance Check
		//
		this.player.weapon?.getChildren().forEach(obj=>{
			const weapon = obj as Weapon
			if( ! cam.contains(weapon.x, weapon.y) ) weapon.destroy()
		})
		//
		// Camera Check for Enemy Movement
		//
		const extRect = this.extendedCameraView
		// Adjust extended view with current camera
		extRect.setPosition(cam.x - cam.width * 0.3, cam.y - cam.height * 0.3)
		// If the width/height were never set, set them now
		if( extRect.isEmpty() ) extRect.setSize(cam.width * 1.6, cam.height * 1.6)
		// Check each enemy if he's in the extended view.
		Object.keys(this.enemies).forEach(key=>{
			(this.enemies[key] as Phaser.Physics.Arcade.Group).children.each(go=>{
				const enemy=go as Enemy
				enemy.onCamera = extRect.contains(enemy.x, enemy.y)
			})
		})
		//
		// Camera Check for Boss
		//
		const inRect = this.innerCameraView
		// Adjust inner view with current camera
		inRect.setPosition(cam.x + cam.width * 0.22, cam.y + cam.height * 0.1)
		// If the width/height were never set, set them now
		if( inRect.isEmpty() ) inRect.setSize(cam.width * 0.56, cam.height * 0.8)
        const bodies = this.physics.overlapRect(inRect.x, inRect.y, inRect.width, inRect.height) as any[]
		const nearBoss = bodies.some(b=>{
			if ( !(b.gameObject instanceof Enemy) ) return false
			return (b.gameObject as Enemy).isBoss
		})
		if( nearBoss && nearBoss !== this.nearBoss ) this.handleBossNear()
		//
		// Button Check 
		//
		this.items.button.children.iterate(go=>{
			const button = go as Button
			if( ! button.hasCrate ) button.pressed=false
		})
	}

	private handleButtonCrateTouch(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
		const button = obj1 as Button
		const crate = obj2 as Crate
		button.press(crate)
	}

	private handleEnemyWallCollision(obj1: Phaser.GameObjects.GameObject) {
		const enemy = obj1 as Enemy
		enemy.changeDirection()
	}

	private handlePlayerTouchItem(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
		const player = obj1 as Player
		const item = obj2 as Item
		player.touching = item
	}

	private handlePlayerOverItem(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
		const player = obj1 as Player
		const item = obj2 as Item
		item.use(player)
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

	private handlePlayerEnemyCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
		const player = obj1 as Player
		const enemy = obj2 as Enemy
		player.hit(enemy)
		if( player.dead ) this.playerEnemiesCollider?.destroy()
	}

	private handleBossNear() {
		this.nearBoss=true
		this.musicmgr.play('music-exciting', { loop: true })
		this.musicmgr.stop(this.musicKey)
		this.cameras.main.zoomTo(1.25, 250)
		const door = this.items.door.getChildren().find(obj=>obj.name==='boss') as Door
		if( door ) door.open=false
	}

	private handleBossDead() {
		this.nearBoss=false
		this.sndmgr.play('exciting-end')
		this.musicmgr.stop('music-exciting')
		this.cameras.main.zoomTo(1, 3300)
		setTimeout(()=>{
			const door = this.items.door.getChildren().find(obj=>obj.name==='boss') as Door
			if( door ) door.open=true
			this.musicmgr.play(this.musicKey, { loop: true })
		}, 4500)
	}

	private handlePlayerDead() {
		this.config.dec('lives')
		this.scene.stop('pause')
		this.scene.stop('game-ui')
		this.musicmgr.fade(this.musicKey, 500)
		this.musicmgr.fade('music-exciting', 500)
		this.cameras.main.fadeOut(1000, 0, 0, 0)
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, ()=>{
			this.scene.stop()
			this.scene.start('loselife', {player: this.player})
        })
	}

	private handlePlayerExit() {
		if( this.win ) return
		this.win = true
		this.scene.stop('pause')
		this.scene.stop('game-ui')
		this.musicmgr.fade(this.musicKey)
		this.musicmgr.fade('music-exciting')
		this.player.stop()
		this.cameras.main.fadeOut(1000, 0, 0, 0)
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, ()=>{
			this.scene.stop()
			const lev:Level = {world: this.config.getNumber('world'), level: this.config.getNumber('level')}
			const wingame = this.lvlmgr.won(lev)
			this.scene.start(wingame ? 'wingame' : 'winlevel')
        })
	}

	private handleButton() {
		const allButtons = this.items.button.children.getArray()
		const buttonGroups = {}
		allButtons.forEach(obj=>{
			const button = obj as Button
			if( ! (button.color in buttonGroups) ) buttonGroups[button.color]=[]
			buttonGroups[button.color].push(button)
		})
		Object.keys(buttonGroups).forEach(color=>{
			const solved = buttonGroups[color].every(go=>(go as Button).pressed)
			const door = this.items.door.getChildren().find(obj=>obj.name.includes('buttons_'+color))
			if( door ) (door as Door).open=solved
		})
	}

	private handleLever(name:string) {
		const door = this.items.door.getChildren().find(door=>door.name===name) as Door
		if( door ) door.open=true
	}

	pauseMenu() {
		this.scene.pause()
		this.scene.launch('pause', { musicKey: this.musicKey, player: this.player })
	}
	
	update(t: number, dt: number) {
		super.update(t, dt)
		// Tile animations
        AnimatedTile.update(dt)
		// Stop all the characters from walking if the player has won
		if( this.win ) {
			this.allEnemies.forEach((group:Phaser.Physics.Arcade.Group)=>{
				group.children.iterate(enemy=>(enemy as Enemy).stop())
			})
			return
		}
		// If player steps on ground that kills you, take their health away so they die
		if( 
			this.map.getTileAtWorldXY(this.player.x, this.player.y+this.player.height*0.33, true, this.cameras.default, 'Ground')?.properties.kills ||
			this.map.getTileAtWorldXY(this.player.x, this.player.y+this.player.height*0.33, true, this.cameras.default, 'Subground')?.properties.kills 
		) {
			this.player.health-=10
		}
		// Checks that run less often, only on CHECKINTERVAL periods
		if( t > this.lastCheck + CHECKINTERVAL ) this.check(t)
		// Player update
		this.player.update(this.cursors)
		if( this.mp ) this.mp.sendPlayerUpdate(t)
	}
}
