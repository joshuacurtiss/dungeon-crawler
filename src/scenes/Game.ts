import Phaser from 'phaser'

import { debugDraw } from '../utils/debug'
import { createCharacterAnims } from '../anims/CharacterAnims'
import { createLizardAnims } from '../anims/EnemyAnims'
import { createItemAnims } from '../anims/ItemAnims'
import Lizard from '../enemies/Lizard'
import '../characters/Faune'
import Faune from '../characters/Faune'
import { sceneEvents } from '../events/EventCenter'
import Chest from '../items/Chest'
import Flask from '../items/Flask'

const COMBOS = ['GONE', 'SPAWN', 'HEART']
const TILEOFFSET = new Phaser.Math.Vector2(7, 7)

export default class Game extends Phaser.Scene {

	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
	private faune!: Faune
	private lizards!: Phaser.Physics.Arcade.Group
	private playerLizardsCollider?: Phaser.Physics.Arcade.Collider
	private map!: Phaser.Tilemaps.Tilemap

	constructor() {
		super('game')
	}

	preload() {
		// Cursors
		this.cursors = this.input.keyboard.createCursorKeys()
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
		createLizardAnims(this.anims)
		createItemAnims(this.anims)
    }

	create() {
		// Set up UI
		this.scene.run('game-ui')
		// Set up map/layers
		this.map = this.make.tilemap({key: 'dungeon'})
		const tileset = this.map.addTilesetImage('dungeon', 'tiles')
		this.map.createStaticLayer('Ground', tileset)
		const wallsLayer = this.map.createStaticLayer('Walls', tileset)
		wallsLayer.setCollisionByProperty({collides: true})
		// Chests
		const chests = this.physics.add.staticGroup({
			classType: Chest
		})
		this.map.getObjectLayer('Items').objects
			.filter(obj=>obj.type==='chest')
			.forEach(chestObj=>{
				const chest = chests.get(chestObj.x! + TILEOFFSET.x, chestObj.y! - TILEOFFSET.y, 'treasure') as Chest
				chest.setCoinSprite(this.physics.add.sprite(chest.x, chest.y, 'treasure', 'coin_anim_f0.png'))
			})
		// Flasks
		const flasks = this.physics.add.staticGroup({
			classType: Flask
		})
		this.map.getObjectLayer('Items').objects
			.filter(obj=>obj.type==='poison' || obj.type==='potion')
			.forEach(obj=>{
				const flask = flasks.get(obj.x! + TILEOFFSET.x, obj.y! - TILEOFFSET.y, obj.type) as Flask
				if( obj.type==='poison' ) flask.power=-1
			})
		// Spikes
		const spikes = this.physics.add.staticGroup({
			classType: Phaser.Physics.Arcade.Sprite
		})
		this.map.getObjectLayer('Items').objects
			.filter(obj=>obj.type==='floor_spikes')
			.forEach(obj=>{
				const spike = spikes.get(obj.x! + TILEOFFSET.x, obj.y! - TILEOFFSET.y, obj.type)
				spike.play('spikes-spring')
			})
		// Add characters
		this.lizards = this.physics.add.group({
			classType: Lizard,
			createCallback:go=>{
				const lizGo = go as Lizard
				lizGo.body.onCollide = true
			}
		})
		this.spawnEnemies()
		const knives:Phaser.Physics.Arcade.Group[] = []
		this.map.getObjectLayer('Characters').objects.filter(obj=>obj.type==='player').forEach(playerObj=>{
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
		this.physics.add.overlap(this.faune, chests, this.handlePlayerChestCollision, undefined, this)
		this.physics.add.overlap(this.faune, flasks, this.handlePlayerFlaskCollision, undefined, this)
		this.physics.add.overlap(this.faune, spikes, this.handlePlayerSpikeOverlap, undefined, this)
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

	private spawnEnemies() {
		this.map.getObjectLayer('Characters').objects.filter(obj=>obj.type==='lizard').forEach(lizObj=>{
			this.lizards.get(lizObj.x, lizObj.y, 'lizard')
		})
	}

	private handlePlayerChestCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
		const player = obj1 as Faune
		const chest = obj2 as Chest
		player.setChest(chest)
	}

	private handlePlayerFlaskCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
		const player = obj1 as Faune
		const flask = obj2 as Flask
		player.drink(flask)
	}

	private handlePlayerSpikeOverlap(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
		const player = obj1 as Faune
		const spike = obj2 as Phaser.Physics.Arcade.Sprite
		if( spike.frame.name.indexOf('f0')<0 ) player.health-=10
	}

	private handleKnifeWallCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
		this.sound.play('impact')
		obj1.destroy()
	}

	private handleKnifeLizardCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
		obj1.destroy()
		obj2.destroy()
	}

	private handlePlayerLizardCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
		const player = obj1 as Faune
		const lizard = obj2 as Lizard
		player.handleDamage(lizard)
		if( player.dead ) this.playerLizardsCollider?.destroy()
	}

	private handleKeyCombo(combo:Phaser.Input.Keyboard.KeyCombo) {
		const code = combo.keyCodes.map(charcode=>String.fromCharCode(charcode)).join('')
		if (code==='GONE') {
			// GONE: Kill all lizards
			console.log(`Lizards be gone! (${this.lizards.children.size})`)
			this.lizards.children.entries.forEach((lizard, i)=>{
				setTimeout(()=>{
					this.sound.play('monster-' + Phaser.Math.Between(1,5))
					lizard.destroy()
					
				}, i * 200)
			})
		} else if (code==='SPAWN') {
			// SPAWN: Respawn enemeies!
			console.log("More baddies!")
			this.spawnEnemies()
		} else if (code==='HEART') {
			// HEART: Add a heart to health
			console.log("Be healed!")
			this.faune.health++
		} else {
			console.log('Unknown combo ' + code)
		}
	}
	
	update(t: number, dt: number) {
		if( this.faune ) {
			this.faune.update(this.cursors)
		}
	}
}
