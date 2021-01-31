import Phaser from 'phaser'
import Player from '../characters/Player'
import Item from './Item'

export default class Coin extends Item {

    public rangeStart: number = 1
    public rangeEnd: number = 5

    constructor(scene:Phaser.Scene, x:number, y:number, name:string='') {
        super(scene, x, y, 'treasure', 'coin_anim_f0.png')
        // The name contains the coin value, either a number or a range like "5-10"
        const [startString, endString] = name.split('-')
        const start = Number(startString)
        const end = Number(endString)
        if( start ) {
            this.rangeStart = start
            this.rangeEnd = start
        }
        if( end && end>start ) this.rangeEnd = end
        // Animation Definitions
        if( !scene.anims.exists('coin-spin') ) scene.anims.create({
            key: 'coin-spin',
            frames: scene.anims.generateFrameNames('treasure', {start: 0, end: 4, prefix: 'coin_anim_f', suffix: '.png'}),
            frameRate: 4,
            repeat: -1
        })
        // Animate the coin
        this.play('coin-spin')
    }

    use(player:Player) {
        if( this.used ) return
        super.use(player)
        this.sndmgr.play('coin')
        player.coins += Phaser.Math.Between(this.rangeStart, this.rangeEnd)
        // Spin coin
        this.setDepth(10)
        this.setVelocityY(-10)
        setTimeout(()=>{
            this.scene.tweens.add({
                targets: this,
                alpha: 0,
                onComplete: () => this.destroy(),
                duration: 500
            })
        }, 500)
    }

}