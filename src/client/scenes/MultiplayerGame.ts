import Phaser from 'phaser'

import AnimatedTile from './AnimatedTile'
import { debugDraw } from '../utils/debug'
import { createCharacterAnims } from '../anims/CharacterAnims'
import { createEnemyAnims } from '../anims/EnemyAnims'
import { createItemAnims } from '../anims/ItemAnims'
import { BigDemon, BigZombie, Chort, Enemy, EnemyList, IceZombie, Imp, LizardF, LizardM, MaskedOrc, Mushroom, Necromancer, Skelet } from '../enemies'
import { characters, Player } from '../characters'
import { Button, Chest, Coin, Crate, Door, Flask, Item, Lever, Spikes, Turkey } from '../items'
import { Fireball, Knife, KnightSword, RegularSword, Weapon, WeaponList } from '../weapons'
import {ConfigManager, EventManager as sceneEvents, LevelManager, SoundManager} from '../managers'

const CHECKINTERVAL = 1000
const COMBOS = ['GONE', 'SPAWN', 'HEART', 'TINY', 'GIANT']
const TILEOFFSET = new Phaser.Math.Vector2(7, 7)

export default class MultiplayerGame extends Phaser.Scene {

	private config = new ConfigManager()
	private lastCheck: number = 0
	private innerCameraView = new Phaser.Geom.Rectangle(0, 0, 0, 0)
	private extendedCameraView = new Phaser.Geom.Rectangle(0, 0, 0, 0)
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
	private player!: Player
	private buttons!: Phaser.Physics.Arcade.StaticGroup
	private doors!: Phaser.Physics.Arcade.StaticGroup
	private enemies!: EnemyList
	private weapons!: WeaponList
	private nearBoss: boolean = false
	private playerEnemiesCollider?: Phaser.Physics.Arcade.Collider
	private map!: Phaser.Tilemaps.Tilemap
	private sndmgr = new SoundManager(this)
	private lvlmgr = new LevelManager()
	private win!: boolean

	constructor() {
		super('game')
	}

	get allEnemies() {
		return this.enemies ? Object.keys(this.enemies).map(key=>this.enemies![key]) : []
	}

	init() {
		this.win = false
		this.nearBoss = false
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
		const level = this.lvlmgr.levelKey(this.config.getNumber('level'))
        this.load.tilemapTiledJSON(level, `tiles/${level}.json`)
    }

	create() {
		// Set up map/layers
		this.map = this.make.tilemap({key: this.lvlmgr.levelKey(this.config.getNumber('level'))})
		const tilesets = [
			this.map.addTilesetImage('dungeon', undefined, 16, 16, 1, 2),
			this.map.addTilesetImage('dungeon_tiles', undefined, 16, 16, 1, 2),
			this.map.addTilesetImage('forest', undefined, 16, 16, 0, 0),
			this.map.addTilesetImage('lava', undefined, 16, 16, 0, 0),
			this.map.addTilesetImage('roguelike_transparent', undefined, 16, 16, 1, 3),
		]
		this.map.createDynamicLayer('Subground', tilesets)
		this.map.createDynamicLayer('Ground', tilesets)
		const wallsLayer = this.map.createDynamicLayer('Walls', tilesets)
		this.map.createStaticLayer('Above', tilesets)?.setDepth(10)
		wallsLayer.setCollisionByProperty({collides: true})
		const itemObjects = this.map.getObjectLayer('Items')?.objects
		const createcb = go=>(go as Button|Crate|Enemy).setup()
		// Buttons
		this.buttons = this.physics.add.staticGroup({ classType: Button, createCallback: createcb })
		itemObjects.filter(obj=>obj.type.substr(0,6)==='button').forEach(obj=>{
			const button = this.buttons.get(obj.x! + TILEOFFSET.x, obj.y! - TILEOFFSET.y, obj.name)
			const split = obj.type.split('_')
			button.color = split.length>1 ? split[1] : 'blue'
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
			crates.get(obj.x! + TILEOFFSET.x, obj.y! - TILEOFFSET.y, obj.name).setDepth(5)
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
		// Turkeys
		const turkeys = this.physics.add.staticGroup({ classType: Turkey })
		itemObjects.filter(obj=>obj.type==='turkey').forEach(obj=>{
			turkeys.get(obj.x! + TILEOFFSET.x, obj.y! - TILEOFFSET.y) as Turkey
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
			if( name===this.config.getString('character', 'faune') ) this.player = new characters[name](this, x, y, this.weapons)
		})
		// "Start" sets 'hearts' to 0. So in beginning, use player hearts default.
		// Otherwise, the config holds current number of hearts. After we get it, set it.
		const hearts = this.config.getNumber('hearts') || this.player.hearts
		this.config.setNumber('hearts', hearts)
		this.player.hearts = hearts
		this.player.coins=this.config.getNumber('coins')
		// Doors
		const doorCreateCallback = go=>(go as Door).setup(this.player)
		this.doors = this.physics.add.staticGroup({ classType: Door, createCallback: doorCreateCallback })
		itemObjects.filter(obj=>obj.type.substr(0,4)==='door').forEach(obj=>{
			const door=this.doors.get(obj.x!+16, obj.y!, obj.name) as Door
			if( obj.type.indexOf('open')>=0 ) door.open=true
		})
		// Colliders
		this.physics.add.overlap(this.player, [chests, levers], this.handlePlayerTouchItem, undefined, this)
		this.physics.add.overlap(this.player, [coins, this.doors, flasks, spikes, turkeys], this.handlePlayerOverItem, undefined, this)
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
		this.sndmgr.play('music-game', { loop: true })
		if( this.game.config.physics.arcade?.debug ) debugDraw(wallsLayer, this)
	}

	private check(t:number=CHECKINTERVAL+1) {
		this.lastCheck = t
		//
		// Camera Check for Enemy Movement
		//
		const cam = this.cameras.main.worldView
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
		this.buttons.children.iterate(go=>{
			const button = go as Button
			if( ! button.hasCrate ) button.pressed=false
		})
	}

	private spawnEnemies() {
		this.map.getObjectLayer('Characters').objects
			.filter(obj=>obj.type==='enemy')
			.forEach(obj=>{
				let name = obj.name.toLowerCase()
				const boss = name.substr(0,5)==='boss_'
				const tiny = name.substr(0,5)==='tiny_'
				if( boss || tiny ) name=name.substring(5)
				if( this.enemies[name] ) {
					const enemy = this.enemies[name].get(obj.x, obj.y, name) as Enemy
					enemy.isBoss = boss
					if( tiny ) enemy.becomeTiny()
				}
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

	private handleBossNear() {
		this.nearBoss=true
		this.sndmgr.play('music-exciting', { loop: true })
		this.sndmgr.stop('music-game')
		this.cameras.main.zoomTo(1.25, 250)
		const door = this.doors.getChildren().find(obj=>obj.name==='boss') as Door
		if( door ) door.open=false
	}

	private handleBossDead() {
		this.nearBoss=false
		this.sndmgr.play('exciting-end')
		this.sndmgr.stop('music-exciting')
		this.cameras.main.zoomTo(1, 3300)
		setTimeout(()=>{
			const door = this.doors.getChildren().find(obj=>obj.name==='boss') as Door
			if( door ) door.open=true
			this.sndmgr.play('music-game', { loop: true })
		}, 4500)
	}

	private handlePlayerDead() {
		this.config.dec('lives')
		this.scene.stop('pause')
		this.scene.stop('game-ui')
		this.sndmgr.fade('music-game', 500)
		this.sndmgr.fade('music-exciting', 500)
		this.cameras.main.fadeOut(1000, 0, 0, 0)
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, ()=>{
			this.scene.stop()
			this.scene.start('loselife')
        })
	}

	private handlePlayerExit() {
		if( this.win ) return
		this.win = true
		this.scene.stop('pause')
		this.scene.stop('game-ui')
		this.sndmgr.fade('music-game')
		this.sndmgr.fade('music-exciting')
		this.player.stop()
		this.cameras.main.fadeOut(1000, 0, 0, 0)
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, ()=>{
			this.scene.stop()
			this.scene.start(this.config.getNumber('level')===this.lvlmgr.levelCount ? 'wingame' : 'winlevel')
        })
	}

	private handleButton() {
		const allButtons = this.buttons.children.getArray()
		const buttonGroups = {}
		allButtons.forEach(obj=>{
			const button = obj as Button
			if( ! (button.color in buttonGroups) ) buttonGroups[button.color]=[]
			buttonGroups[button.color].push(button)
		})
		Object.keys(buttonGroups).forEach(color=>{
			const solved = buttonGroups[color].every(go=>(go as Button).pressed)
			const door = this.doors.getChildren().find(obj=>obj.name==='buttons_'+color)
			if( door ) (door as Door).open=solved
		})
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
		} else if (code==='GIANT' || code==='TINY') {
			// GIANT and TINY: Change the size of enemies
			console.log(`Baddies be ${code}!`)
			this.allEnemies.forEach((group: Phaser.Physics.Arcade.Group)=>{
				group.children.entries.forEach(obj=>{
					const enemy = obj as Enemy
					if( code==='TINY' ) enemy.becomeTiny()
					else enemy.becomeGiant()
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
	}
}
