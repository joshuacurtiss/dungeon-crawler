import createStandardAnims from './createStandardAnims'
import Phaser from 'phaser'
import Enemy from './Enemy'

export default class IceNugget extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'textures', 'ice_nugget_idle_0')
        this.damageInflicted = 0.5
        this.speed = Phaser.Math.Between(40, 75)
        this.customOffset.set(4, 3)
        createStandardAnims(scene, 'ice_nugget')
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(1500, 5000),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    setDirection(x:number, y:number) {
        super.setDirection(x, y)
        if( ! this.onCamera ) return
        if( this.direction.x || this.direction.y ) this.anims.play('ice_nugget_run')
        else this.anims.play('ice_nugget_idle')
    }

    setup() {
        this.body.setSize(8, 14)
        super.setup()
    }

    hit() {
        this.sndmgr.play('monster-ice-' + Phaser.Math.Between(1,3))
        super.hit()
    }

}