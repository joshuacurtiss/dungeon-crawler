import Phaser from 'phaser'
import Faune from '../characters/Faune'

export default class Item extends Phaser.Physics.Arcade.Sprite {

    private _used:boolean = false

    constructor(scene:Phaser.Scene, x:number, y:number, texture:string, frame:string|number) {
        super(scene, x, y, texture, frame)
    }

    get used() {
        return this._used
    }

    use(player:Faune) { // eslint-disable-line @typescript-eslint/no-unused-vars
        this._used = true
    }

}