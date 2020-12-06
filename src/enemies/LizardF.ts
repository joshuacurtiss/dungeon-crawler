import Phaser from 'phaser'
import Enemy from './Enemy'

export default class LizardF extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        this.animIdle = 'lizard_f_idle'
        this.animRun = 'lizard_f_run'
        this.damageInflicted = 0.5
        this.speed = Phaser.Math.Between(40, 75)
        this.customOffset.set(0, 10)
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(1500, 5000),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    public setup() {
        this.body.setSize(16, 16)
        super.setup()
    }

    public handleDamage(amt: number) {
		if( !this.dead ) this.scene.sound.play('monster-' + Phaser.Math.Between(1,5))
        super.handleDamage(amt)
    }

}