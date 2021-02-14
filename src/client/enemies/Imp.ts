import createStandardAnims from './createStandardAnims'
import Phaser from 'phaser'
import Enemy from './Enemy'

export default class Imp extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'textures', 'imp_idle_0')
        this.damageInflicted = 0.5
        this.speed = Phaser.Math.Between(50, 90)
        this.customOffset.set(3, 3)
        createStandardAnims(scene, 'imp')
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(300, 2000),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    setDirection(x:number, y:number) {
        super.setDirection(x, y)
        if( ! this.onCamera ) return
        if( this.direction.x || this.direction.y ) this.anims.play('imp_run')
        else this.anims.play('imp_idle')
    }

    setup() {
        this.body.setSize(11, 12)
        super.setup()
    }

    hit() {
        this.sndmgr.play('monster-bug-' + Phaser.Math.Between(1,3))
        super.hit()
    }

}