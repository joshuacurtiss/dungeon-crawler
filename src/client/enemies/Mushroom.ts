import Phaser from 'phaser'
import Enemy from './Enemy'

export default class Mushroom extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        this.health = 2
        this.speed = Phaser.Math.Between(20, 40)
        this.customOffset.set(7, 16)
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(3000, 5000),
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
        if( vec.y ) this.anims.play('mushroom_run-' + (vec.y<0 ? 'up' : 'down'))
        else if( vec.x ) this.anims.play('mushroom_run-side')
    }

    setup() {
        this.setBodySize(10, 15)
        super.setup()
    }

    hit() {
        this.sndmgr.play('monster-bug-' + Phaser.Math.Between(1,3))
        super.hit()
    }

}