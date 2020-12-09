import Phaser from 'phaser'
import Enemy from './Enemy'

export default class Necromancer extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        this.damageInflicted = 0.5
        this.speed = Phaser.Math.Between(60, 90)
        this.customOffset.set(3, 4)
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(3000, 6000),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    get direction(): Phaser.Math.Vector2 {
        return super.direction
    }
    set direction(vec: Phaser.Math.Vector2) {
        super.direction = vec
        if( ! this.onCamera ) return
        if( vec.x || vec.y ) this.anims.play('necromancer_run')
        else this.anims.play('necromancer_idle')
    }

    public setup() {
        this.body.setSize(12, 15)
        super.setup()
    }

    public handleDamage(amt: number) {
		this.scene.sound.play('monster-nec-' + Phaser.Math.Between(1,3))
        super.handleDamage(amt)
    }

}