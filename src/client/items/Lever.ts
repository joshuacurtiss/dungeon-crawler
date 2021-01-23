import Phaser from 'phaser'
import Player from '../characters/Player'
import Item from './Item'
import sceneEvents from '../managers/EventManager'

export default class Lever extends Item {

    private _flipped:boolean = false

    constructor(scene:Phaser.Scene, x:number, y:number, name:string) {
        super(scene, x, y, 'lever', 0)
        this.name=name
    }

    get flipped() {
        return this._flipped
    }
    set flipped(bool:boolean) {
        this.flipX = bool
        this._flipped = bool
    }

    use(player:Player) {
        if( this.used ) return
        this.flipped=true
        sceneEvents.emit('lever', this.name)
        super.use(player)
    }

}