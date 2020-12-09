import Phaser from 'phaser'
import Faune from '../characters/Faune'

export default class Item extends Phaser.Physics.Arcade.Sprite {

    private _health:number = 1
    private _used:boolean = false

    constructor(scene:Phaser.Scene, x:number, y:number, texture:string, frame:string|number) {
        super(scene, x, y, texture, frame)
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

    use(player:Faune) { // eslint-disable-line @typescript-eslint/no-unused-vars
        this._used = true
    }

}