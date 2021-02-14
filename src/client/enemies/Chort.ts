import createStandardAnims from './createStandardAnims'
import Phaser from 'phaser'
import Enemy from './Enemy'

export default class Chort extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'textures', 'chort_idle_0')
        this.damageInflicted = 0.5
        this.speed = Phaser.Math.Between(75, 125)
        this.customOffset.set(2, 8)
        createStandardAnims(scene, 'chort')
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(500, 2500),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    setDirection(x:number, y:number) {
        super.setDirection(x, y)
        if( ! this.onCamera ) return
        if( this.direction.x || this.direction.y ) this.anims.play('chort_run')
        else this.anims.play('chort_idle')
    }

    setup() {
        this.body.setSize(12, 16)
        super.setup()
    }

    hit() {
		this.sndmgr.play('monster-1')
        super.hit()
    }

}