import Phaser from 'phaser'
import Player from '../characters/Player'
import {EventManager as sceneEvents, SoundManager} from '../managers'

export default class Item extends Phaser.Physics.Arcade.Sprite {

    private _health:number = 1
    private _used:boolean = false
    public id:string = Math.floor(Math.random() * 10**8).toString()
    protected sndmgr:SoundManager

    constructor(scene:Phaser.Scene, x:number, y:number, texture:string, frame:string|number) {
        super(scene, x+8, y-8, texture, frame)
        this.sndmgr = new SoundManager(scene, 'sfx')
    }

    get health() {
        return this._health
    }

    set health(newval:number) {
        this._health = newval
        if( newval<=0 ) this.destroy()
    }

    get used() {
        return this._used
    }

    use(player:Player) { // eslint-disable-line @typescript-eslint/no-unused-vars
        sceneEvents.emit('use', this, player)
        this._used = true
    }

}