import Phaser from 'phaser'
import Player from '../characters/Player'
import Item from './Item'
import { sceneEvents } from '../events/EventCenter'

export default class Flask extends Item {

    public _open:boolean = false

    constructor(scene:Phaser.Scene, x:number, y:number) {
        super(scene, x, y, 'door_closed', 0)
        this.open = true
    }

    get open() {
        return this._open
    }
    set open(bool:boolean) {
        if( bool ) this.sndmgr.play('door')
        this.setTexture('door_' + (bool ? 'open' : 'closed'))
        this._open = bool
    }

    use(player:Player) {
        if( ! this.open || this.used ) return
        if( Math.abs(player.y - this.y) <= 5 ) sceneEvents.emit('player-exit')
        else return
        super.use(player)
    }

}