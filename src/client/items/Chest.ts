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