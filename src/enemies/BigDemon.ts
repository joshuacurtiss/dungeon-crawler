import Phaser from 'phaser'
import Enemy from './Enemy'

export default class BigDemon extends Enemy {

    public damageInflicted: number = 1.0
    public speed: number = Phaser.Math.Between(75, 125)

    protected animIdle: string = 'big_demon-idle'
    protected animRun: string = 'big_demon-run'

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        this.health = 2
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(1500, 5000),
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