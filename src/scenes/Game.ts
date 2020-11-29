import Phaser from 'phaser'

import { debugDraw } from '../utils/debug'
import { createCharacterAnims } from '../anims/CharacterAnims'
import { createLizardAnims } from '../anims/EnemyAnims'
import { createTreasureAnims } from '../anims/TreasureAnims'
import Lizard from '../enemies/Lizard'
import '../characters/Faune'
import Faune from '../characters/Faune'
import { sceneEvents } from '../events/EventCenter'
import Chest from '../items/Chest'

const CHARACTER_START_COORDS = {x: 128, y: 128}
const LIZARD_START_COORDS = [
	{x: 256, y: 200},
	{x: 800, y: 128},
	{x: 700, y: 800},
	{x: 800, y: 800},
	{x: 700, y: 900},
	{x: 800, y: 800},
	{x: 700, y: 1000},
	{x: 800, y: 1000}
]

export default class Game extends Phaser.Scene {

	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
	private faune!: Faune
	private knives!: Phaser.Physics.Arcade.Group
	private lizards!: Phaser.Physics.Arcade.Group
	private playerLizardsCollider?: Phaser.Physics.Arcade.Collider

	constructor() {
		super('game')
	}

	preload() {
		// Cursors
		this.cursors = this.input.keyboard.createCursorKeys()
		// Anims 
		createCharacterAnims(this.anims)
		createLizardAnims(this.anims)
		createTreasureAnims(this.anims)
    }

	create() {
		// Set up UI
		this.scene.run('game-ui')
		// Set up map/layers
		const map = this.make.tilemap({key: 'dungeon'})
		const tileset = map.addTilesetImage('dungeon', 'tiles')
		map.createStaticLayer('Ground', tileset)
		const wallsLayer = map.createStaticLayer('Walls', tileset)
		wallsLayer.setCollisionByProperty({collides: true})
		const chests = this.physics.add.staticGroup({
			classType: Chest
		})
		const chestsLayer = map.getObjectLayer('Chests')
		chestsLayer.objects.forEach(chestObj=>{
			chests.get(chestObj.x! + 7, chestObj.y! - 7, 'treasure')
		})
		// Add characters/entities
		this.knives = this.physics.add.group({
			classType: Phaser.Physics.Arcade.Image
		})
		this.faune = this.add.faune(128, 128, 'faune')
		this.faune.setKnives(this.knives)
		this.lizards = this.physics.add.group({
			classType: Lizard,
			createCallback:(go)=>{
				const lizGo = go as Lizard
				lizGo.body.onCollide = true
			}
		})
		LIZARD_START_COORDS.forEach(coord=>this.lizards.get(coord.x, coord.y, 'lizard'))
		// Colliders
		this.physics.add.collider(this.faune, chests, this.handlePlayerChestCollision, undefined, this)
		this.physics.add.collider(this.faune, wallsLayer)
		this.physics.add.collider(this.lizards, wallsLayer)
		this.playerLizardsCollider = this.physics.add.collider(this.lizards, this.faune, this.handlePlayerLizardCollision, undefined, this)
		this.physics.add.collider(this.knives, wallsLayer, this.handleKnifeWallCollision, undefined, this)
		this.physics.add.collider(this.knives, this.lizards, this.handleKnifeLizardCollision, undefined, this)
		// Initial state
		this.cameras.main.startFollow(this.faune, true)
		// debugDraw(wallsLayer, this)
	}

	private handlePlayerChestCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
		const player = obj1 as Faune
		const chest = obj2 as Chest
		player.setChest(chest)
	}

	private handleKnifeWallCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
		this.knives.killAndHide(obj1)
	}

	private handleKnifeLizardCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
		this.knives.killAndHide(obj1)
		this.lizards.killAndHide(obj2)
	}

	private handlePlayerLizardCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
		const player = obj1 as Faune
		const lizard = obj2 as Lizard
		player.handleDamage(lizard)
		sceneEvents.emit('player-health-changed', player.health)
		if( player.dead ) this.playerLizardsCollider?.destroy()
	}
	
	update(t: number, dt: number) {
		if( this.faune ) {
			this.faune.update(this.cursors)
		}
	}
}
