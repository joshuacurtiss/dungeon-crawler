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

export default class Game extends Phaser.Scene {

	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
	private faune!: Faune
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
		// Chests
		const chests = this.physics.add.staticGroup({
			classType: Chest
		})
		map.getObjectLayer('Items').objects.filter(obj=>obj.type==='chest').forEach(chestObj=>{
			const chest = chests.get(chestObj.x! + 7, chestObj.y! - 7, 'treasure') as Chest
			chest.setCoinSprite(this.physics.add.sprite(chest.x, chest.y, 'treasure', 'coin_anim_f0.png'))
		})
		// Add characters
		this.lizards = this.physics.add.group({
			classType: Lizard,
			createCallback:go=>{
				const lizGo = go as Lizard
				lizGo.body.onCollide = true
			}
		})
		map.getObjectLayer('Characters').objects.filter(obj=>obj.type==='lizard').forEach(lizObj=>{
			this.lizards.get(lizObj.x, lizObj.y, 'lizard')
		})
		const knives:Phaser.Physics.Arcade.Group[] = []
		map.getObjectLayer('Characters').objects.filter(obj=>obj.type==='player').forEach(playerObj=>{
			if( this.add[playerObj.name] ) {
				this[playerObj.name] = this.add[playerObj.name](playerObj.x!, playerObj.y!, playerObj.name)
				const myKnives = this.physics.add.group({
					classType: Phaser.Physics.Arcade.Image,
					maxSize: 2
				})
				this[playerObj.name].setKnives(myKnives)
				knives.push(myKnives)
			}
		})
		// Colliders
		this.physics.add.collider(this.faune, chests, this.handlePlayerChestCollision, undefined, this)
		this.physics.add.collider(this.faune, wallsLayer)
		this.physics.add.collider(this.lizards, wallsLayer)
		this.playerLizardsCollider = this.physics.add.collider(this.lizards, this.faune, this.handlePlayerLizardCollision, undefined, this)
		knives.forEach((myKnives:Phaser.Physics.Arcade.Group)=>{
			this.physics.add.collider(myKnives, wallsLayer, this.handleKnifeWallCollision, undefined, this)
			this.physics.add.collider(myKnives, this.lizards, this.handleKnifeLizardCollision, undefined, this)
		})
		// Initial state
		this.cameras.main.startFollow(this.faune, true)
		this.sound.play('music-game')
		// debugDraw(wallsLayer, this)
	}

	private handlePlayerChestCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
		const player = obj1 as Faune
		const chest = obj2 as Chest
		player.setChest(chest)
	}

	private handleKnifeWallCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
		this.sound.play('impact')
		obj1.destroy()
	}

	private handleKnifeLizardCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
		this.sound.play('monster-' + Phaser.Math.Between(1,5))
		obj1.destroy()
		obj2.destroy()
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
