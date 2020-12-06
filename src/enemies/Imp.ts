import Phaser from 'phaser'
import Enemy from './Enemy'

export default class Imp extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        this.animIdle = 'imp_idle'
        this.animRun = 'imp_run'
        this.damageInflicted = 0.5
        this.speed = Phaser.Math.Between(50, 90)
        this.customOffset.set(3, 3)
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(300, 2000),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    public setup() {
        this.body.setSize(11, 12)
        super.setup()
    }

    public handleDamage(amt: number) {
		this.scene.sound.play('monster-bug-' + Phaser.Math.Between(1,3))
        super.handleDamage(amt)
    }

}