import Phaser from 'phaser'
import Faune from '../characters/Faune'
import Item from './Item'

export default class Spikes extends Item {

    public damageInflicted: number = 10

    constructor(scene:Phaser.Scene, x:number, y:number, texture:string, frame:string|number) {
        super(scene, x, y, texture, frame)
        this.play('spikes-spring')
    }

    get sprung():boolean {
        return this.frame.name.indexOf('f0') < 0
    }

    use(player:Faune) {
        if( this.sprung ) player.health -= this.damageInflicted
        super.use(player)
    }

}