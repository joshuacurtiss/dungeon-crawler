import Phaser from 'phaser'

import AnimatedTile from './AnimatedTile'
import { debugDraw } from '../utils/debug'
import { createCharacterAnims } from '../anims/CharacterAnims'
import { createEnemyAnims } from '../anims/EnemyAnims'
import { createItemAnims } from '../anims/ItemAnims'
import { BigDemon, BigZombie, Chort, Enemy, EnemyList, EnemyNames, EnemyUpdate, IceZombie, Imp, LizardF, LizardM, MaskedOrc, Mushroom, Necromancer, Skelet } from '../enemies'
import { characters, Player } from '../characters'
import { Button, Chest, Coin, Crate, Door, Flask, Item, ItemList, ItemUpdate, Lever, Spikes, Turkey } from '../items'
import { Fireball, Knife, KnightSword, RegularSword, Weapon, WeaponList } from '../weapons'
import { ComboManager, ConfigManager, EventManager as sceneEvents, LevelManager, MultiplayerManager, SoundManager } from '../managers'

const CHECKINTERVAL = 1000
const createcb = go=>(go as Button|Crate|Enemy).setup()

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
	private weapons!: WeaponList
	private nearBoss: boolean = false
	private playerEnemiesCollider?: Phaser.Physics.Arcade.Collider
	private map!: Phaser.Tilemaps.Tilemap
	private mp!: MultiplayerManager
	private mpOn: boolean = false
	private sndmgr = new SoundManager(this)
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
		// Cursors
		this.cursors = this.input.keyboard.createCursorKeys()
		// Misc keys
		this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('up', ()=>this.pauseMenu())
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
		this.map.createStaticLayer('Ceiling', tilesets)?.setDepth(20)
		wallsLayer.setCollisionByProperty({collides: true})
		// Add player and their weapons
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
		// Add items
		this.items = this.spawnItemsFromMap(this.map)
		// Add enemies
		this.enemies = this.spawnEnemiesFromMap(this.map)
		// Colliders
		const {chest, coin, crate, flask, lever, spikes, turkey} = this.items
		this.physics.add.overlap(this.player, [chest, lever], this.handlePlayerTouchItem, undefined, this)
		this.physics.add.overlap(this.player, [coin, this.items.door, flask, spikes, turkey], this.handlePlayerOverItem, undefined, this)
		this.physics.add.overlap(this.items.button, crate, this.handleButtonOverlap, undefined, this)
		this.physics.add.collider(this.player, crate)
		this.physics.add.collider(this.player, wallsLayer)
		this.physics.add.collider(crate, wallsLayer)
		this.physics.add.collider(crate, crate)
		this.physics.add.collider(this.allEnemies, wallsLayer, this.handleEnemyWallCollision, undefined, this)
		this.physics.add.collider(this.allEnemies, crate, this.handleEnemyWallCollision, undefined, this)
		this.physics.add.collider(this.allEnemies, [crate, this.items.door])
		this.playerEnemiesCollider = this.physics.add.collider(this.allEnemies, this.player, this.handlePlayerEnemyCollision, undefined, this)
		Object.keys(this.weapons).map(key=>this.weapons[key]).forEach((weaponGroup:Phaser.Physics.Arcade.Group)=>{
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
		this.sndmgr.play('music-game', { loop: true })
		if( this.game.config.physics.arcade?.debug ) debugDraw(wallsLayer, this)
		// Setup multiplayer
		if( this.mpOn ) {
			const endpoint = location.protocol.replace("http", "ws") + "//" + location.host
			this.mp = new MultiplayerManager(this, this.enemies, this.items, this.weapons, this.player)
			this.mp.join(endpoint, 'relay')
		}
		// Combo Manager (only in single-player mode)
		if( ! this.mp ) {
			this.combos = new ComboManager(this.input.keyboard, this.enemies, this.player)
			this.combos.activate()
		}
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
		this.items.button.children.iterate(go=>{
			const button = go as Button
			if( ! button.hasCrate ) button.pressed=false
		})
	}

	private spawnItem(def: ItemUpdate, group:Phaser.Physics.Arcade.Group | Phaser.Physics.Arcade.StaticGroup): Item | undefined {
		const {name, id, type, x, y} = def
		const [specialType, ...descparts] = type.split('_')
		const specialDesc = descparts.join('_')
		// Instantiate items
		const item = group.get(x, y, name, type) as Item
		// If nothing matched, just return now
		if( ! item ) return
		// Assign id and name, if provided
		if( id ) item.id = id
		if( name ) item.name = name
		// Special cases
		if( type==='crate' ) item.setDepth(5)
		if( specialType==='button' ) (item as Button).color = specialDesc.length ? specialDesc : 'blue'
		if( specialType==='door' && specialDesc==='open' ) (item as Door).open = true
		if( specialType==='flask' && specialDesc==='big_red' ) (item as Flask).power=-1
		if( specialType==='flask' && name.length && !isNaN(Number(name)) ) (item as Flask).power = Number(name)
		return item
	}

	private spawnItems(defs: ItemUpdate[]): ItemList {
		const doorCreateCallback = go=>(go as Door).setup(this.player)
		const items: ItemList = {
			'button': this.physics.add.staticGroup({ classType: Button, createCallback: createcb }),
			'chest': this.physics.add.staticGroup({ classType: Chest }),
			'coin': this.physics.add.group({ classType: Coin }),
			'crate': this.physics.add.group({ classType: Crate, createCallback: createcb }),
			'door': this.physics.add.staticGroup({ classType: Door, createCallback: doorCreateCallback }),
			'flask': this.physics.add.staticGroup({ classType: Flask }),
			'lever': this.physics.add.staticGroup({ classType: Lever }),
			'spikes': this.physics.add.staticGroup({ classType: Spikes }),
			'turkey': this.physics.add.staticGroup({ classType: Turkey }),
		}
		defs.forEach(def=>{
			const {type} = def
			const [basetype] = type.split('_')
			if( items[basetype] ) this.spawnItem(def, items[basetype])
		})
		return items
	}

	private spawnItemsFromMap(map: Phaser.Tilemaps.Tilemap): ItemList {
		const mapObjects = map.getObjectLayer('Items')?.objects
		const items: ItemUpdate[] = mapObjects.map((obj: any)=>{
			// Fix old tile types to match the ItemNames spec
			obj.type = obj.type.replace('floor_spikes', 'spikes')
			obj.type = obj.type.replace('poison', 'flask_big_red')
			obj.type = obj.type.replace('potion', 'flask_big_blue')
			return obj as ItemUpdate
		})
		return this.spawnItems(items)
	}

	private spawnEnemy(def: EnemyUpdate, group: Phaser.Physics.Arcade.Group): Enemy {
		const {name, id, x, y, boss, tiny} = def
		const enemy = group.get(x, y, name) as Enemy
		if( id ) enemy.id = id
		enemy.isBoss = boss
		if( tiny ) enemy.becomeTiny()
		return enemy
	}

	private spawnEnemies(defs: EnemyUpdate[]): EnemyList {
		const enemies: EnemyList = {
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
		defs.forEach(def=>{
			const {name} = def
			if( enemies[name] ) this.spawnEnemy(def, enemies[name])
		})
		return enemies
	}

	private spawnEnemiesFromMap(map: Phaser.Tilemaps.Tilemap): EnemyList {
		const defs: EnemyUpdate[] = []
		map.getObjectLayer('Characters').objects
			.filter(obj=>obj.type==='enemy')
			.forEach(obj=>{
				let name = obj.name.toLowerCase()
				const boss = name.substr(0,5)==='boss_'
				const tiny = name.substr(0,5)==='tiny_'
				if( boss || tiny ) name=name.substring(5)
				defs.push({
					name: name as EnemyNames,
					x: obj.x as number,
					y: obj.y as number,
					boss,
					tiny,
				})
			})
		return this.spawnEnemies(defs)
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
		const door = this.items.door.getChildren().find(obj=>obj.name==='boss') as Door
		if( door ) door.open=false
	}

	private handleBossDead() {
		this.nearBoss=false
		this.sndmgr.play('exciting-end')
		this.sndmgr.stop('music-exciting')
		this.cameras.main.zoomTo(1, 3300)
		setTimeout(()=>{
			const door = this.items.door.getChildren().find(obj=>obj.name==='boss') as Door
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
		const allButtons = this.items.button.children.getArray()
		const buttonGroups = {}
		allButtons.forEach(obj=>{
			const button = obj as Button
			if( ! (button.color in buttonGroups) ) buttonGroups[button.color]=[]
			buttonGroups[button.color].push(button)
		})
		Object.keys(buttonGroups).forEach(color=>{
			const solved = buttonGroups[color].every(go=>(go as Button).pressed)
			const door = this.items.door.getChildren().find(obj=>obj.name==='buttons_'+color)
			if( door ) (door as Door).open=solved
		})
	}

	private handleLever(name:string) {
		const door = this.items.door.getChildren().find(door=>door.name===name) as Door
		if( door ) door.open=true
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
		if( this.mp ) this.mp.sendPlayerUpdate(t)
	}
}
