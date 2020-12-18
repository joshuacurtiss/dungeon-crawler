import Phaser from 'phaser'
import Crate from './Crate'
import Item from './Item'
import { sceneEvents } from '../events/EventCenter'

export default class Button extends Item {

    private _pressed:boolean = false

    constructor(scene:Phaser.Scene, x:number, y:number, name:string) {
        super(scene, x, y, 'button_up', 0)
        this.name=name
    }

    setup() {
        this.body.setSize(this.width*0.7, this.height*0.7)
    }

    /**
     * Returns whether a crate is sitting on the button.
     */
    get hasCrate() {
        const { halfWidth, halfHeight } = this.body
        const bodies = this.scene.physics.overlapRect(this.x-halfWidth, this.y-halfHeight, this.width, this.height) as any[]
        const crates = bodies.filter(b=>b.gameObject ! instanceof Crate)
        return crates.length>0
    }

    get pressed() {
        return this._pressed
    }
    set pressed(bool:boolean) {
        if( this.pressed===bool ) return
        this._pressed = bool
        this.setTexture('button_' + (bool ? 'down' : 'up'))
        sceneEvents.emit('button')
    }

}