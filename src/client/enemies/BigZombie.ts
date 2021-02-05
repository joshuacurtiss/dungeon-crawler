import createStandardAnims from './createStandardAnims'
import Phaser from 'phaser'
import Enemy from './Enemy'

export default class BigZombie extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'textures', 'big_zombie_idle_0')
        this.damageInflicted = 2.0
        this.health = 3
        this.speed = Phaser.Math.Between(25, 50)
        this.customOffset.set(6, 12)
        createStandardAnims(scene, 'big_zombie')
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(3500, 8000),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    get direction(): Phaser.Math.Vector2 {
        return super.direction
    }
    set direction(vec: Phaser.Math.Vector2) {
        super.direction = vec
        if( ! this.onCamera ) return
        if( vec.x || vec.y ) this.anims.play('big_zombie_run')
        else this.anims.play('big_zombie_idle')
    }

    setup() {
        this.setBodySize(18, 21)
        super.setup()
    }

    hit() {
        super.hit()
		if( !this.dead ) this.sndmgr.play('monster-zombie-' + Phaser.Math.Between(1,2))
    }

    die() {
		this.sndmgr.play('monster-zombie-3')
        super.die()
    }

}