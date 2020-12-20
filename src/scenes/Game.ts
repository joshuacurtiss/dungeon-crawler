import Phaser from 'phaser'

import { debugDraw } from '../utils/debug'
import { createCharacterAnims } from '../anims/CharacterAnims'
import { createEnemyAnims } from '../anims/EnemyAnims'
import { createItemAnims } from '../anims/ItemAnims'
import { BigDemon, BigZombie, Chort, Enemy, IceZombie, Imp, LizardF, LizardM, MaskedOrc, Mushroom, Necromancer, Skelet } from '../enemies'
import { characters, Player } from '../characters'
import { Button, Chest, Coin, Crate, Door, Flask, Item, Lever, Spikes } from '../items'
import { Fireball, Knife, KnightSword, RegularSword, Weapon } from '../weapons'
import { sceneEvents } from '../events/EventCenter'
import LevelManager from '../managers/LevelManager'
import SoundManager from '../managers/SoundManager'

const CHECKINTERVAL = 1000
const COMBOS = ['GONE', 'SPAWN', 'HEART']
const TILEOFFSET = new Phaser.Math.Vector2(7, 7)

export default class Game extends Phaser.Scene {

	private lastCheck: number = 0
	private extendedCameraView = new Phaser.Geom.Rectangle(0, 0, 0, 0)
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
	private player!: Player
	private buttons!: Phaser.Physics.Arcade.StaticGroup
	private doors!: Phaser.Physics.Arcade.StaticGroup
	private enemies!: EnemyList
	private weapons!: WeaponList
	private playerEnemiesCollider?: Phaser.Physics.Arcade.Collider
	private map!: Phaser.Tilemaps.Tilemap
	private selectedCharacter: string = 'faune'
	private coins!: number
	private level!: number
	private lives!: number
	private sndmgr = new SoundManager(this)
	private lvlmgr = new LevelManager()
	private win!: boolean

	constructor() {
		super('game')
	}

	get allEnemies() {
		return this.enemies ? Object.keys(this.enemies).map(key=>this.enemies![key]) : []
	}

	init(data) {
		this.selectedCharacter = data.character ?? this.selectedCharacter
		this.coins = data.coins ?? 0
		this.level = data.level ?? 1
		this.lives = data.lives ?? 3
		this.win = false
		this.events.once('shutdown', ()=>{
			this.input.keyboard.removeAllKeys()
		})
	}

	preload() {
		// Cursors
		this.cursors = this.input.keyboard.createCursorKeys()
		// Misc keys
		this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('up', ()=>this.pauseMenu())
		// Key Combos
		const comboConfig= {
			maxKeyDelay: 5000,
			resetOnMatch: true, 
			resetOnWrongKey: true
		}
		COMBOS.forEach(combo=>{
			this.input.keyboard.createCombo(combo, comboConfig)
		})
		this.input.keyboard.on('keycombomatch', this.handleKeyCombo, this)
		// Anims 
		createCharacterAnims(this.anims)
		createEnemyAnims(this.anims)
		createItemAnims(this.anims)
		// Tilemap
        this.load.tilemapTiledJSON(this.lvlmgr.levelKey(this.level), `tiles/${this.lvlmgr.levelKey(this.level)}.json`)
    }

	create() {
		// Set up map/layers
		this.map = this.make.tilemap({key: this.lvlmgr.levelKey(this.level)})
		const tilesets = [
			this.map.addTilesetImage('dungeon', undefined, 16, 16, 1, 2),
			this.map.addTilesetImage('dungeon_tiles', undefined, 16, 16, 1, 2),
			this.map.addTilesetImage('roguelike_transparent', undefined, 16, 16, 1, 3),
		]
		this.map.createStaticLayer('Subground', tilesets)
		this.map.createStaticLayer('Ground', tilesets)
		const wallsLayer = this.map.createStaticLayer('Walls', tilesets)
		wallsLayer.setCollisionByProperty({collides: true})
		const itemObjects = this.map.getObjectLayer('Items')?.objects
		const createcb = go=>(go as Button|Crate|Enemy).setup()
		// Buttons
		this.buttons = this.physics.add.staticGroup({ classType: Button, createCallback: createcb })
		itemObjects.filter(obj=>obj.type==='button').forEach(obj=>{
			this.buttons.get(obj.x! + TILEOFFSET.x, obj.y! - TILEOFFSET.y, obj.name)
		})
		// Chests
		const chests = this.physics.add.staticGroup({ classType: Chest })
		itemObjects.filter(obj=>obj.type==='chest').forEach(chestObj=>{
			chests.get(chestObj.x! + TILEOFFSET.x, chestObj.y! - TILEOFFSET.y)
		})
		// Coins
		const coins = this.physics.add.group({ classType: Coin })
		itemObjects.filter(obj=>obj.type==='coin').forEach(obj=>{
			coins.get(obj.x! + TILEOFFSET.x, obj.y! - TILEOFFSET.y)
		})
		// Crates
		const crates = this.physics.add.group({ classType: Crate, createCallback: createcb })
		itemObjects.filter(obj=>obj.type==='crate').forEach(obj=>{
			crates.get(obj.x! + TILEOFFSET.x, obj.y! - TILEOFFSET.y, obj.name)
		})
		// Flasks
		const flasks = this.physics.add.staticGroup({ classType: Flask })
		itemObjects.filter(obj=>obj.type==='poison' || obj.type==='potion' || obj.type.indexOf('flask_')===0).forEach(obj=>{
			const type = obj.type==='poison' ? 'flask_big_red' : obj.type==='potion' ? 'flask_big_blue' : obj.type
			const flask = flasks.get(obj.x! + TILEOFFSET.x, obj.y! - TILEOFFSET.y, type) as Flask
			if( obj.type==='poison' ) flask.power=-1
			if( obj.name.length && ! isNaN(Number(obj.name)) ) flask.power=Number(obj.name)
		})
		// Levers
		const levers = this.physics.add.staticGroup({ classType: Lever })
		itemObjects.filter(obj=>obj.type==='lever').forEach(obj=>{
			levers.get(obj.x! + TILEOFFSET.x, obj.y! - TILEOFFSET.y, obj.name)
		})
		// Spikes
		const spikes = this.physics.add.staticGroup({ classType: Spikes })
		itemObjects.filter(obj=>obj.type==='floor_spikes').forEach(obj=>{
			spikes.get(obj.x! + TILEOFFSET.x, obj.y! - TILEOFFSET.y)
		})
		// Add enemies and characters
		this.enemies = {
			'chort': this.physics.add.group({classType: Chort, createCallback: createcb}),
			'ice_zombie': this.physics.add.group({classType: IceZombie, createCallback: createcb}),
			'imp': this.physics.add.group({classType: Imp, createCallback: createcb}),
			'lizard_m': this.physics.add.group({classType: LizardM, createCallback: createcb}),
			'lizard_f': this.physics.add.group({classType: LizardF, createCallback: createcb}),
			'masked_orc': this.physics.add.group({classType: MaskedOrc, createCallback: createcb}),
			'mushroom': this.physics.add.group({classType: Mushroom, createCallback: createcb}),
			'necromancer': this.physics.add.group({classType: Necromancer, createCallback: createcb}),
			'skelet': this.physics.add.group({classType: Skelet, createCallback: createcb}),
			'big_demon': this.physics.add.group({classType: BigDemon, createCallback: createcb}),
			'big_zombie': this.physics.add.group({classType: BigZombie, createCallback: createcb})
		}
		this.spawnEnemies()
		this.weapons = {
			'weapon_fireball': this.physics.add.group({ classType: Fireball, maxSize: 4 }),
			'weapon_knife': this.physics.add.group({ classType: Knife, maxSize: 8 }),
			'weapon_knight_sword': this.physics.add.group({ classType: KnightSword, maxSize: 2 }),
			'weapon_regular_sword': this.physics.add.group({ classType: RegularSword, maxSize: 2 }),
		}
		const playerTiles = this.map.getObjectLayer('Characters').objects.filter(obj=>obj.type==='player') as Phaser.Types.Tilemaps.TiledObject[]
		playerTiles.forEach(playerTile=>{
			const {x, y, name} = playerTile
			if( name===this.selectedCharacter ) this.player = new characters[name](this, x, y, this.weapons)
		})
		this.player.coins=this.coins
		// Doors
		const doorCreateCallback = go=>(go as Door).setup(this.player)
		this.doors = this.physics.add.staticGroup({ classType: Door, createCallback: doorCreateCallback })
		itemObjects.filter(obj=>obj.type==='door').forEach(obj=>{
			this.doors.get(obj.x!+16, obj.y!, obj.name)
		})
		// Colliders
		this.physics.add.overlap(this.player, [chests, levers], this.handlePlayerTouchItem, undefined, this)
		this.physics.add.overlap(this.player, [coins, this.doors, flasks, spikes], this.handlePlayerOverItem, undefined, this)
		this.physics.add.overlap(this.buttons, crates, this.handleButtonOverlap, undefined, this)
		this.physics.add.collider(this.player, crates)
		this.physics.add.collider(this.player, wallsLayer)
		this.physics.add.collider(crates, wallsLayer)
		this.physics.add.collider(crates, crates)
		this.physics.add.collider(this.allEnemies, wallsLayer, this.handleEnemyWallCollision, undefined, this)
		this.physics.add.collider(this.allEnemies, crates, this.handleEnemyWallCollision, undefined, this)
		this.physics.add.collider(this.allEnemies, [crates, this.doors])
		this.playerEnemiesCollider = this.physics.add.collider(this.allEnemies, this.player, this.handlePlayerEnemyCollision, undefined, this)
		Object.keys(this.weapons).map(key=>this.weapons[key]).forEach((weaponGroup:Phaser.Physics.Arcade.Group)=>{
			this.physics.add.collider(weaponGroup, crates, this.handleWeaponWallCollision, undefined, this)
			this.physics.add.collider(weaponGroup, wallsLayer, this.handleWeaponWallCollision, undefined, this)
			this.physics.add.collider(weaponGroup, this.allEnemies, this.handleWeaponEnemyCollision, undefined, this)
		})
		// Event Handlers
        sceneEvents.on('button', this.handleButton, this)
        sceneEvents.on('lever', this.handleLever, this)
        sceneEvents.on('player-dead', this.handlePlayerDead, this)
        sceneEvents.on('player-exit', this.handlePlayerExit, this)
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, ()=>{
			sceneEvents.off('button', this.handleButton, this)
			sceneEvents.off('lever', this.handleLever, this)
            sceneEvents.off('player-dead', this.handlePlayerDead, this)
            sceneEvents.off('player-exit', this.handlePlayerExit, this)
        })
		// Set up UI
		this.cameras.main.fadeIn(1000, 0, 0, 0)
		this.scene.run('game-ui', {
			character: this.selectedCharacter,
			coins: this.player.coins,
			lives: this.lives,
			hearts: this.player.healthMax,
			health: this.player.health,
		})
		this.cameras.main.startFollow(this.player, true)
		setTimeout(()=>{ this.check() }, 0) // After next tick so camera view is defined
		this.sndmgr.play('music-game', { loop: true })
		if( this.game.config.physics.arcade?.debug ) debugDraw(wallsLayer, this)
	}

	private check(t:number=CHECKINTERVAL+1) {
		this.lastCheck = t
		//
		// Camera Check
		//
		const cam = this.cameras.main.worldView
		const rect = this.extendedCameraView
		// Adjust extended view with current camera
		rect.setPosition(cam.x - cam.width * 0.3, cam.y - cam.height * 0.3)
		// If the width/height were never set, set them now
		if( rect.isEmpty() ) rect.setSize(cam.width *= 1.6, cam.height *= 1.6)
		// Check each enemy if he's in the extended view.
		Object.keys(this.enemies).forEach(key=>{
			(this.enemies[key] as Phaser.Physics.Arcade.Group).children.each(go=>{
				const enemy=go as Enemy
				enemy.onCamera = rect.contains(enemy.x, enemy.y)
			})
		})
		//
		// Button Check 
		//
		this.buttons.children.iterate(go=>{
			const button = go as Button
			if( ! button.hasCrate ) button.pressed=false
		})
	}

	private spawnEnemies() {
		this.map.getObjectLayer('Characters').objects
			.filter(obj=>obj.type==='enemy')
			.forEach(obj=>{
				if( this.enemies[obj.name] ) this.enemies[obj.name].get(obj.x, obj.y, obj.name)
			})
	}

	private handleButtonOverlap(obj1: Phaser.GameObjects.GameObject) {
		const button = obj1 as Button
		button.pressed = true
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

	private handlePlayerDead() {
		this.lives--
		this.scene.stop('pause')
		this.scene.stop('game-ui')
		this.sndmgr.fade('music-game', 500)
		this.cameras.main.fadeOut(1000, 0, 0, 0)
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, ()=>{
			this.scene.stop()
			this.scene.start('loselife', {
				character: this.selectedCharacter,
				coins: this.player.coins,
				level: this.level,
				lives: this.lives,
			})
        })
	}

	private handlePlayerExit() {
		if( this.win ) return
		this.win = true
		this.scene.stop('pause')
		this.scene.stop('game-ui')
		this.sndmgr.fade('music-game')
		this.player.stop()
		this.cameras.main.fadeOut(1000, 0, 0, 0)
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, ()=>{
			this.scene.stop()
			this.scene.start(this.level===this.lvlmgr.levelCount ? 'wingame' : 'winlevel', {
				character: this.selectedCharacter,
				coins: this.player.coins,
				level: this.level,
				lives: this.lives,
			})
        })
	}

	private handleButton() {
		const allButtons = this.buttons.children.getArray()
		const solved = allButtons.every(go=>(go as Button).pressed)
		const door = this.doors.getChildren().find(obj=>obj.name==='buttons')
		if( door ) (door as Door).open=solved
	}

	private handleLever(name:string) {
		const door = this.doors.getChildren().find(door=>door.name===name) as Door
		if( door ) door.open=true
	}

	private handleKeyCombo(combo:Phaser.Input.Keyboard.KeyCombo) {
		const code = combo.keyCodes.map(charcode=>String.fromCharCode(charcode)).join('')
		if (code==='GONE') {
			// GONE: Kill all enemies
			console.log('Baddies be gone!')
			this.allEnemies.forEach((group: Phaser.Physics.Arcade.Group)=>{
				group.children.entries.forEach((enemy, i)=>{
					setTimeout(()=>{enemy.destroy()}, i * 200)
				})
			})
		} else if (code==='SPAWN') {
			// SPAWN: Respawn enemeies!
			console.log("More baddies!")
			this.spawnEnemies()
		} else if (code==='HEART') {
			// HEART: Add a heart to health
			console.log("Be healed!")
			this.player.health++
		} else {
			console.log('Unknown combo ' + code)
		}
	}

	pauseMenu() {
		this.scene.pause()
		this.scene.launch('pause')
	}
	
	update(t: number, dt: number) {
		super.update(t, dt)
		if( this.win ) {
			// Stop all the characters from walking if the player has won
			this.allEnemies.forEach((group:Phaser.Physics.Arcade.Group)=>{
				group.children.iterate(enemy=>(enemy as Enemy).stop())
			})
			return
		}
		if( t > this.lastCheck + CHECKINTERVAL ) this.check(t)
		this.player.update(this.cursors)
	}
}
