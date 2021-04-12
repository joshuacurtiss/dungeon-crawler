import createStandardAnims from './createStandardAnims'
import Phaser from 'phaser'
import Enemy from './Enemy'

export default class Salgie extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'textures', 'salgie_idle_0')
        this.damageInflicted = 2.0
        this.health = 3
        this.speed = Phaser.Math.Between(25, 50)
        this.customOffset.set(6, 12)
        createStandardAnims(scene, 'salgie')
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(3500, 8000),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    setDirection(x:number, y:number) {
        super.setDirection(x, y)
        if( ! this.onCamera ) return
        if( this.direction.x || this.direction.y ) this.anims.play('salgie_run')
        else this.anims.play('salgie_idle')
    }

    setup() {
        this.setBodySize(18, 21)
        super.setup()
    }

    hit() {
        super.hit()
		if( !this.dead ) this.sndmgr.play('monster-salgie-' + Phaser.Math.Between(1,2))
    }

    die() {
		this.sndmgr.play('monster-salgie-3')
        super.die()
    }

}