import Phaser from 'phaser'
import Enemy from './Enemy'

export default class BigDemon extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        this.animIdle = 'big_demon_idle'
        this.animRun = 'big_demon_run'
        this.damageInflicted = 1.0
        this.health = 2
        this.speed = Phaser.Math.Between(75, 125)
        this.customOffset.set(5, 5)
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(1500, 4000),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    public setup() {
        this.setBodySize(21, 28)
        super.setup()
    }

    public handleDamage(amt: number) {
        super.handleDamage(amt)
		if( !this.dead ) this.scene.sound.play('monster-demon-' + Phaser.Math.Between(1,2))
    }

    destroy(fromScene?: boolean) {
		this.scene.sound.play('monster-demon-3')
        super.destroy(fromScene)
    }

}