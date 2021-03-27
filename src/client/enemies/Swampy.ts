import createStandardAnims from './createStandardAnims'
import Phaser from 'phaser'
import Enemy from './Enemy'

export default class Swampy extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'textures', 'swampy_idle_0')
        this.damageInflicted = 0.5
        this.speed = Phaser.Math.Between(30, 50)
        this.customOffset.set(3, 2)
        createStandardAnims(scene, 'swampy')
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(1500, 2500),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    setDirection(x:number, y:number) {
        super.setDirection(x, y)
        if( ! this.onCamera ) return
        if( this.direction.x || this.direction.y ) this.anims.play('swampy_run')
        else this.anims.play('swampy_idle')
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