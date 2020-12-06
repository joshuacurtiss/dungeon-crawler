import Phaser from 'phaser'
import Enemy from './Enemy'

export default class MaskedOrc extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        this.animIdle = 'masked_orc_idle'
        this.animRun = 'masked_orc_run'
        this.damageInflicted = 0.5
        this.speed = Phaser.Math.Between(50, 60)
        this.customOffset.set(3, 4)
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(2500, 5000),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    public setup() {
        this.body.setSize(12, 15)
        super.setup()
    }

    public handleDamage(amt: number) {
		this.scene.sound.play('monster-' + Phaser.Math.Between(1,4))
        super.handleDamage(amt)
    }

}