import Phaser from 'phaser'
import Enemy from './Enemy'

export default class Mushroom extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'textures', 'mushroom_down_0')
        this.health = 2
        this.speed = Phaser.Math.Between(20, 40)
        this.customOffset.set(7, 16)
        for (const dir of ['up','down','side']) {
            scene.anims.create({
                key: 'mushroom_run_' + dir,
                frames: scene.anims.generateFrameNames('textures', {start: 1, end: 3, prefix: 'mushroom_' + dir + '_'}),
                repeat: -1,
                yoyo: true,
                frameRate: 8,
            })
        }    
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
        if( vec.y ) this.anims.play('mushroom_run_' + (vec.y<0 ? 'up' : 'down'))
        else if( vec.x ) this.anims.play('mushroom_run_side')
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