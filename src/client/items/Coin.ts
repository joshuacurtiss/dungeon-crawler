import Phaser from 'phaser'
import Player from '../characters/Player'
import Item from './Item'

export default class Coin extends Item {

    public rangeStart: number = 1
    public rangeEnd: number = 5

    constructor(scene:Phaser.Scene, x:number, y:number, name:string='') {
        super(scene, x, y, 'textures', 'coin_0')
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
        if( !scene.anims.exists('coin_spin') ) scene.anims.create({
            key: 'coin_spin',
            frames: scene.anims.generateFrameNames('textures', {start: 0, end: 4, prefix: 'coin_'}),
            frameRate: 4,
            repeat: -1
        })
        // Animate the coin
        this.play('coin_spin')
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