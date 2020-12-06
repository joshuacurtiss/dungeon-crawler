import Phaser from 'phaser'
import Enemy from './Enemy'

export default class Skelet extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        this.animIdle = 'skelet_idle'
        this.animRun = 'skelet_run'
        this.damageInflicted = 0.5
        this.speed = Phaser.Math.Between(30, 50)
        this.customOffset.set(3, 2)
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(1500, 2500),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    public setup() {
        this.body.setSize(11, 13)
        super.setup()
    }

    public handleDamage(amt: number) {
		this.scene.sound.play('monster-bug-' + Phaser.Math.Between(1,3))
        super.handleDamage(amt)
    }

}