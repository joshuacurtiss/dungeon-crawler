import Phaser from 'phaser'

import { debugDraw } from '../utils/debug'
import { createCharacterAnims } from '../anims/CharacterAnims'
import { createLizardAnims } from '../anims/EnemyAnims'
import Lizard from '../enemies/Lizard'

const CHARACTER_START_COORDS = {x: 128, y: 128}
const LIZARD_START_COORDS = [
	{x: 256, y: 256},
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
	private faune!: Phaser.Physics.Arcade.Sprite

	constructor() {
		super('game')
	}

	preload() {
		// Cursors
		this.cursors = this.input.keyboard.createCursorKeys()
		// Anims 
		createCharacterAnims(this.anims)
		createLizardAnims(this.anims)
    }

	create() {
		// Set up map/layers
		const map = this.make.tilemap({key: 'dungeon'})
		const tileset = map.addTilesetImage('dungeon', 'tiles')
		map.createStaticLayer('Ground', tileset)
		const wallsLayer = map.createStaticLayer('Walls', tileset)
		wallsLayer.setCollisionByProperty({collides: true})
		// Add characters
		this.faune = this.physics.add.sprite(CHARACTER_START_COORDS.x, CHARACTER_START_COORDS.y, 'faune', 'walk-down-1.png')
		this.faune.body.setSize(this.faune.width*0.5, this.faune.width*0.75)
		const lizards = this.physics.add.group({
			classType: Lizard,
			createCallback:(go)=>{
				const lizGo = go as Lizard
				lizGo.body.onCollide = true
			}
		})
		LIZARD_START_COORDS.forEach(coord=>lizards.get(coord.x, coord.y, 'lizard'))
		// Colliders
		this.physics.add.collider(this.faune, wallsLayer)
		this.physics.add.collider(lizards, wallsLayer)
		// Initial state
		this.faune.anims.play('faune-idle-down')
		this.cameras.main.startFollow(this.faune, true)
		// debugDraw(wallsLayer, this)
	}
	
	update(t: number, dt: number) {
		if( !this.cursors || !this.faune ) return;
		const speed=100
		if( this.cursors.left?.isDown ) {
			this.faune.anims.play('faune-walk-side', true)
			this.faune.setVelocity(-speed, 0)
			this.faune.scaleX = -1
			this.faune.body.offset.x = 24
		} else if( this.cursors.right?.isDown) {
			this.faune.anims.play('faune-walk-side', true)
			this.faune.setVelocity(speed, 0)
			this.faune.scaleX = 1
			this.faune.body.offset.x = 8
		} else if( this.cursors.up?.isDown) {
			this.faune.anims.play('faune-walk-up', true)
			this.faune.setVelocity(0, -speed)
		} else if( this.cursors.down?.isDown) {
			this.faune.anims.play('faune-walk-down', true)
			this.faune.setVelocity(0, speed)
		} else {
			const dir = this.faune.anims.currentAnim.key.split('-')[2]
			this.faune.play(`faune-idle-${dir}`)
			this.faune.setVelocity(0, 0)
		}
	}
}
