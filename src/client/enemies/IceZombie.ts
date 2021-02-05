import createStandardAnims from './createStandardAnims'
import Phaser from 'phaser'
import Enemy from './Enemy'

export default class Chort extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'textures', 'ice_zombie_idle_0')
        this.damageInflicted = 0.5
        this.speed = Phaser.Math.Between(40, 75)
        this.customOffset.set(4, 3)
        createStandardAnims(scene, 'ice_zombie')
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(1500, 5000),
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
        if( vec.x || vec.y ) this.anims.play('ice_zombie_run')
        else this.anims.play('ice_zombie_idle')
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