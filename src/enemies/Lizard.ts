import Phaser from 'phaser'
import Enemy from './Enemy'

export default class Lizard extends Enemy {

    public damageInflicted: number = 0.5
    public speed: number = Phaser.Math.Between(40, 75)

    protected animIdle: string = 'lizard-idle'
    protected animRun: string = 'lizard-run'

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        this.direction = this.randomDirection()
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(1500, 5000),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    destroy(fromScene?: boolean) {
		this.scene.sound.play('monster-' + Phaser.Math.Between(1,5))
        super.destroy(fromScene)
    }

}