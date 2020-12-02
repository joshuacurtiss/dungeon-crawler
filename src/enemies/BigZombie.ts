import Phaser from 'phaser'
import Enemy from './Enemy'

export default class BigZombie extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        this.animIdle = 'big_zombie-idle'
        this.animRun = 'big_zombie-run'
        this.damageInflicted = 2.0
        this.health = 3
        this.speed = Phaser.Math.Between(25, 50)
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(3500, 8000),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    public handleDamage(amt: number) {
        super.handleDamage(amt)
		if( !this.dead ) this.scene.sound.play('monster-' + Phaser.Math.Between(1,5))
    }

    destroy(fromScene?: boolean) {
		this.scene.sound.play('monster-' + Phaser.Math.Between(1,5))
        super.destroy(fromScene)
    }

}