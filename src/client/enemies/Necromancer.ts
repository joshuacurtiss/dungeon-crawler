import createStandardAnims from './createStandardAnims'
import Phaser from 'phaser'
import Enemy from './Enemy'

export default class Necromancer extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'textures', 'necromancer_idle_0')
        this.damageInflicted = 0.5
        this.speed = Phaser.Math.Between(60, 90)
        this.customOffset.set(3, 4)
        createStandardAnims(scene, 'necromancer')
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(3000, 6000),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    setDirection(x:number, y:number) {
        super.setDirection(x, y)
        if( ! this.onCamera ) return
        if( this.direction.x || this.direction.y ) this.anims.play('necromancer_run')
        else this.anims.play('necromancer_idle')
    }

    setup() {
        this.body.setSize(12, 15)
        super.setup()
    }

    hit() {
        this.sndmgr.play('monster-nec-' + Phaser.Math.Between(1,3))
        super.hit()
    }

}