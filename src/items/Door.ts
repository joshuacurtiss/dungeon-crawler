import Phaser from 'phaser'
import Player from '../characters/Player'
import Item from './Item'
import { sceneEvents } from '../events/EventCenter'

export default class Door extends Item {

    public _open:boolean = false
    private collider?:Phaser.Physics.Arcade.Collider
    private player?:Player

    constructor(scene:Phaser.Scene, x:number, y:number, name:string) {
        super(scene, x, y, 'door_closed', 0)
        this.name=name
    }

    setup(player:Player) {
        this.player = player
        this.setCollider()
    }

    get open() {
        return this._open
    }
    set open(bool:boolean) {
        if( this._open===bool ) return
        if( bool ) {
            this.collider?.destroy()
            this.sndmgr.play('door-open')
        } else {
            this.setCollider()
            this.sndmgr.play('door-closed')
        }
        this.setTexture('door_' + (bool ? 'open' : 'closed'))
        this._open = bool
    }

    use(player:Player) {
        if( ! this.open || this.used ) return
        if( Math.abs(player.y - this.y) <= 5 && this.name==='exit' ) sceneEvents.emit('player-exit')
        else return
        super.use(player)
    }

    private setCollider() {
        if( this.player ) this.collider = this.scene.physics.add.collider(this.player, this)
    }

}