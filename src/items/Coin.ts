import Phaser from 'phaser'
import Player from '../characters/Player'
import Item from './Item'

export default class Coin extends Item {

    constructor(scene:Phaser.Scene, x:number, y:number) {
        super(scene, x, y, 'treasure', 'coin_anim_f0.png')
        this.play('coin-spin')
    }

    use(player:Player) {
        if( this.used ) return
        super.use(player)
        this.sndmgr.play('coin')
        player.coins += Phaser.Math.Between(10, 20)
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