import createStandardAnims from './createStandardAnims'
import Phaser from 'phaser'
import Enemy from './Enemy'

export default class Chort extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        this.damageInflicted = 0.5
        this.speed = Phaser.Math.Between(75, 125)
        this.customOffset.set(2, 8)
        createStandardAnims(scene, 'chort')
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(500, 2500),
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
        if( vec.x || vec.y ) this.anims.play('chort_run')
        else this.anims.play('chort_idle')
    }

    setup() {
        this.body.setSize(12, 16)
        super.setup()
    }

    hit() {
		this.sndmgr.play('monster-1')
        super.hit()
    }

}