import createStandardAnims from './createStandardAnims'
import Phaser from 'phaser'
import Enemy from './Enemy'

export default class LizardM extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'textures', 'lizard_m_idle_0')
        this.damageInflicted = 0.5
        this.speed = Phaser.Math.Between(40, 75)
        this.customOffset.set(0, 10)
        createStandardAnims(scene, 'lizard_m')
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(1500, 5000),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    setDirection(x:number, y:number) {
        super.setDirection(x, y)
        if( ! this.onCamera ) return
        if( this.direction.x || this.direction.y ) this.anims.play('lizard_m_run')
        else this.anims.play('lizard_m_idle')
    }

    setup() {
        this.body.setSize(16, 16)
        super.setup()
    }

    hit() {
        this.sndmgr.play('monster-' + Phaser.Math.Between(1,5))
        super.hit()
    }

}