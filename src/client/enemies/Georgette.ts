import createStandardAnims from './createStandardAnims'
import Phaser from 'phaser'
import Enemy from './Enemy'

export default class Georgette extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'textures', 'georgette_idle_0')
        this.damageInflicted = 0.5
        this.speed = Phaser.Math.Between(50, 60)
        this.customOffset.set(3, 4)
        createStandardAnims(scene, 'georgette')
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(2500, 5000),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    setDirection(x:number, y:number) {
        super.setDirection(x, y)
        if( ! this.onCamera ) return
        if( this.direction.x || this.direction.y ) this.anims.play('georgette_run')
        else this.anims.play('georgette_idle')
    }

    setup() {
        this.body.setSize(12, 15)
        super.setup()
    }

    hit() {
        this.sndmgr.play('monster-' + Phaser.Math.Between(1,4))
        super.hit()
    }

}