import createStandardAnims from './createStandardAnims'
import Phaser from 'phaser'
import Enemy from './Enemy'

export default class BigDemon extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'textures', 'big_demon_idle_0')
        this.damageInflicted = 1.0
        this.health = 2
        this.speed = Phaser.Math.Between(75, 125)
        this.customOffset.set(5, 5)
        createStandardAnims(scene, 'big_demon')
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(1500, 4000),
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
        if( vec.x || vec.y ) this.anims.play('big_demon_run')
        else this.anims.play('big_demon_idle')
    }

    setup() {
        this.setBodySize(21, 28)
        super.setup()
    }

    hit() {
        super.hit()
		if( !this.dead ) this.sndmgr.play('monster-demon-' + Phaser.Math.Between(1,2))
    }

    die() {
		this.sndmgr.play('monster-demon-3')
        super.die()
    }

}