import Phaser from 'phaser'
import Player from '../characters/Player'
import Item from './Item'

export default class Flask extends Item {

    public power:number = 1

    constructor(scene:Phaser.Scene, x:number, y:number, texture:string, frame:string|number) {
        super(scene, x, y, texture, frame)
    }

    use(player:Player) {
        console.log(`Drinking flask: ${this.power>0 ? '+' : ''}${this.power}`)
        player.health += this.power
        if( this.power>0 ) this.sndmgr.play('rise-3')
        super.use(player)
        this.destroy()
    }

}