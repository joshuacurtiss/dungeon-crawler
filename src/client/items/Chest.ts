import Phaser from 'phaser'
import Player from '../characters/Player'
import Item from './Item'

export default class Chest extends Item {

    public rangeStart: number = 10
    public rangeEnd: number = 25

    constructor(scene:Phaser.Scene, x:number, y:number, name:string='') {
        super(scene, x, y, 'chest', 0)
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
        if( !scene.anims.exists('chest-open') ) scene.anims.create({
            key: 'chest-open',
            frames: scene.anims.generateFrameNames('treasure', {start: 0, end: 2, prefix: 'chest_empty_open_anim_f', suffix: '.png'}),
            frameRate: 6
        })
        if( !scene.anims.exists('chest-closed') ) scene.anims.create({
            key: 'chest-closed',
            frames: [{key: 'treasure', frame: 'chest_empty_open_anim_f0.png'}]
        })
        if( !scene.anims.exists('coin-spin') ) scene.anims.create({
            key: 'coin-spin',
            frames: scene.anims.generateFrameNames('treasure', {start: 0, end: 4, prefix: 'coin_anim_f', suffix: '.png'}),
            frameRate: 4,
            repeat: -1
        })
        // Animate the coin
        this.play('chest-closed')
    }

    use(player:Player) {
        if( this.used ) return
        super.use(player)
        this.play('chest-open')
        this.sndmgr.play('coin')
        player.coins += Phaser.Math.Between(this.rangeStart, this.rangeEnd)
        // Spin a coin on the chest
        const coin = this.scene.physics.add.sprite(this.x, this.y, 'treasure')
        coin.play('coin-spin')
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