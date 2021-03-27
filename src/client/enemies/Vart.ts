import createStandardAnims from './createStandardAnims'
import Phaser from 'phaser'
import Enemy from './Enemy'

export default class Vart extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'textures', 'vart_idle_0')
        this.damageInflicted = 0.5
        this.speed = Phaser.Math.Between(30, 50)
        this.customOffset.set(3, 2)
        createStandardAnims(scene, 'vart')
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(1500, 2500),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    setDirection(x:number, y:number) {
        super.setDirection(x, y)
        if( ! this.onCamera ) return
        if( this.direction.x || this.direction.y ) this.anims.play('vart_run')
        else this.anims.play('vart_idle')
    }

    setup() {
        this.body.setSize(11, 13)
        super.setup()
    }

    hit() {
        this.sndmgr.play('monster-bug-' + Phaser.Math.Between(1,3))
        super.hit()
    }

}