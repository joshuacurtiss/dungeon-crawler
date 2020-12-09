import Phaser from 'phaser'
import Faune from '../characters/Faune'
import Item from './Item'

export default class Chest extends Item {

    constructor(scene:Phaser.Scene, x:number, y:number, texture:string, frame:string|number) {
        super(scene, x, y, texture, frame)
        this.play('chest-closed')
    }

    use(player:Faune) {
        if( this.used ) return
        super.use(player)
        this.play('chest-open')
        player.coins += Phaser.Math.Between(50, 200)
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