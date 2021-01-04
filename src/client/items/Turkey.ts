import Phaser from 'phaser'
import Player from '../characters/Player'
import Item from './Item'

export default class Turkey extends Item {

    constructor(scene:Phaser.Scene, x:number, y:number) {
        super(scene, x, y, 'turkey', 0)
    }

    use(player:Player) {
        console.log(`Turkey, mmm...`)
        player.hearts++
        player.health = player.hearts
        this.sndmgr.play('health')
        super.use(player)
        this.destroy()
    }

}