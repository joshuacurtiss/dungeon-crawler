import Phaser from 'phaser'
import Player from '../characters/Player'
import Item from './Item'

export default class Chest extends Item {

    public rangeStart: number = 10
    public rangeEnd: number = 25

    constructor(scene:Phaser.Scene, x:number, y:number, name:string='') {
        super(scene, x, y, 'textures', 'chest_0')
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
        if( !scene.anims.exists('chest_open') ) scene.anims.create({
            key: 'chest_open',
            frames: scene.anims.generateFrameNames('textures', {start: 0, end: 2, prefix: 'chest_'}),
            frameRate: 6
        })
        if( !scene.anims.exists('chest_closed') ) scene.anims.create({
            key: 'chest_closed',
            frames: [{key: 'textures', frame: 'chest_0'}]
        })
        if( !scene.anims.exists('coin_spin') ) scene.anims.create({
            key: 'coin_spin',
            frames: scene.anims.generateFrameNames('textures', {start: 0, end: 4, prefix: 'coin_'}),
            frameRate: 4,
            repeat: -1
        })
        // Animate the coin
        this.play('chest_closed')
    }

    use(player:Player) {
        if( this.used ) return
        super.use(player)
        this.play('chest_open')
        this.sndmgr.play('coin')
        player.coins += Phaser.Math.Between(this.rangeStart, this.rangeEnd)
        // Spin a coin on the chest
        const coin = this.scene.physics.add.sprite(this.x, this.y, 'textures', 'coin_0')
        coin.play('coin_spin')
        coin.setVelocityY(-10)
        setTimeout(()=>{
            this.scene.tweens.add({
                targets: coin,
                alpha: 0,
                onComplete: () => coin.destroy(),
                duration: 750
            })
        }, 1000)
    }

}