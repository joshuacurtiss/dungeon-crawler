import Phaser from 'phaser'

export default class Chest extends Phaser.Physics.Arcade.Sprite {

    private coinSprite?:Phaser.Physics.Arcade.Sprite

    constructor(scene:Phaser.Scene, x:number, y:number, texture:string, frame:string|number) {
        super(scene, x, y, texture, frame)
        this.play('chest-closed')
    }

    get opened() {
        return this.anims.currentAnim.key!=='chest-closed'
    }

    setCoinSprite(coin:Phaser.Physics.Arcade.Sprite) {
        coin.setVisible(false)
        this.coinSprite = coin
    }

    open() {
        if( this.opened ) return 0
        this.play('chest-open')
        this.scene.sound.play('coin')
        // If coin exists, show it then fade it.
        if( this.coinSprite ) {
            const sprite = this.coinSprite
            sprite.setVisible(true)
            sprite.setVelocityY(-10)
            sprite.play('coin-spin')
            setTimeout(()=>{
                this.scene.tweens.add({
                    targets: sprite,
                    alpha: 0,
                    onComplete: () => {
                        this.coinSprite?.destroy()
                    },
                    duration: 750
                })
            }, 1000)
        }
        return Phaser.Math.Between(50, 200)
    }

}