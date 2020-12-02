import Phaser from 'phaser'
import Enemy from './Enemy'

export default class BigZombie extends Enemy {

    public damageInflicted: number = 2.0
    public speed: number = Phaser.Math.Between(25, 50)

    protected animIdle: string = 'big_zombie-idle'
    protected animRun: string = 'big_zombie-run'

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(3500, 8000),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    destroy(fromScene?: boolean) {
		this.scene.sound.play('monster-' + Phaser.Math.Between(1,5))
        super.destroy(fromScene)
    }

}