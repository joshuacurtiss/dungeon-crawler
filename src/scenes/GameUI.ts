import Phaser from 'phaser'
import { sceneEvents } from '../events/EventCenter'

export default class GameUI extends Phaser.Scene {

    private hearts!: Phaser.GameObjects.Group
    private coinsLabel!: Phaser.GameObjects.Text

    constructor() {
        super({key: 'game-ui'})
    }

    create() {
        const coinSprite = this.add.sprite(9, 28, 'treasure', 'coin_anim_f0.png')
        coinSprite.play('coin-spin')
        this.coinsLabel = this.add.text(18, 21, '0', {
            fontSize: 13
        })
        this.hearts = this.add.group({
            classType: Phaser.GameObjects.Image
        })
        this.hearts.createMultiple({
            key: 'ui-heart-full',
            setXY: {
                x: 10, 
                y: 10,
                stepX: 16
            },
            quantity: 3
        })
        sceneEvents.on('player-coins-changed', this.handleCoinsChanged, this)
        sceneEvents.on('player-health-changed', this.handlePlayerHealthChanged, this)
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, ()=>{
            sceneEvents.off('play-health-changed', this.handlePlayerHealthChanged, this)
            sceneEvents.off('play-coins-changed')
        })
    }

    handleCoinsChanged(coins: number) {
        this.coinsLabel.text = coins.toLocaleString()
        this.sound.play('coin')
    }

    handlePlayerHealthChanged(health: number) {
        this.hearts.children.each((go, idx)=>{
            const heart = go as Phaser.GameObjects.Image
            if( idx<Math.floor(health) ) {
                heart.setTexture('ui-heart-full')
            } else if( idx<health) {
                heart.setTexture('ui-heart-half')
            } else {
                heart.setTexture('ui-heart-empty')
            }
        })
    }

}