import Phaser from 'phaser'
import Enemy from './Enemy'

export default class Stumpy extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'textures', 'stumpy_down_0')
        this.health = 2
        this.speed = Phaser.Math.Between(10, 25)
        this.customOffset.set(10, 8)
        for (const dir of ['up','down','left','right','idle']) {
            scene.anims.create({
                key: 'stumpy_' + dir,
                frames: scene.anims.generateFrameNames('textures', {start: 0, end: 3, prefix: 'stumpy_' + dir + '_'}),
                repeat: -1,
                frameRate: 8,
            })
        }    
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(5000, 15000),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    randomDirection(): Phaser.Math.Vector2 {
        const vec = super.randomDirection()
        const rand = Phaser.Math.Between(0,9)
        return rand<4 ? new Phaser.Math.Vector2(0) : vec
    }

    setDirection(x:number, y:number) {
        super.setDirection(x, y)
        this.scaleX = 1
        if( ! this.onCamera ) return
        if( Math.abs(this.direction.y)>Math.abs(this.direction.x) ) this.anims.play('stumpy_' + (this.direction.y<0 ? 'up' : 'down'))
        else if( this.direction.x ) this.anims.play('stumpy_' + (this.direction.x<0 ? 'left' : 'right'))
        else this.anims.play('stumpy_idle')
    }

    setup() {
        this.setBodySize(14, 16)
        super.setup()
    }

    hit() {
        this.sndmgr.play('wood-chop-' + Phaser.Math.Between(1,2))
        super.hit()
    }

}