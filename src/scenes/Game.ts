import Phaser from 'phaser'

import { debugDraw } from '../utils/debug'
export default class Game extends Phaser.Scene {

	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
	private faune!: Phaser.Physics.Arcade.Sprite

	constructor() {
		super('game')
	}

	preload() {
		this.cursors = this.input.keyboard.createCursorKeys()
    }

	create() {
		const map = this.make.tilemap({key: 'dungeon'})
		const tileset = map.addTilesetImage('dungeon', 'tiles')
		map.createStaticLayer('Ground', tileset)
		const wallsLayer = map.createStaticLayer('Walls', tileset)
		wallsLayer.setCollisionByProperty({collides: true})
		// debugDraw(wallsLayer, this)
		this.faune = this.physics.add.sprite(128, 128, 'faune', 'walk-down-1.png')
		this.faune.body.setSize(this.faune.width*0.5, this.faune.width*0.75)
		this.anims.create({
			key: 'faune-idle-up', 
			frames: [{key: 'faune', frame: 'walk-up-3.png'}]
		})
		this.anims.create({
			key: 'faune-idle-down', 
			frames: [{key: 'faune', frame: 'walk-down-3.png'}]
		})
		this.anims.create({
			key: 'faune-idle-side', 
			frames: [{key: 'faune', frame: 'walk-side-3.png'}]
		})
		this.anims.create({
			key: 'faune-walk-up',
			frames: this.anims.generateFrameNames('faune', { start: 1, end: 8, prefix: 'walk-up-', suffix: '.png' }),
			repeat: -1,
			frameRate: 15
		})
		this.anims.create({
			key: 'faune-walk-down',
			frames: this.anims.generateFrameNames('faune', { start: 1, end: 8, prefix: 'walk-down-', suffix: '.png' }),
			repeat: -1,
			frameRate: 15
		})
		this.anims.create({
			key: 'faune-walk-side',
			frames: this.anims.generateFrameNames('faune', { start: 1, end: 8, prefix: 'walk-side-', suffix: '.png' }),
			repeat: -1,
			frameRate: 15
		})
		this.faune.anims.play('faune-idle-down')
		this.physics.add.collider(this.faune, wallsLayer)
		this.cameras.main.startFollow(this.faune, true)
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
