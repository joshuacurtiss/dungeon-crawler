import Phaser from 'phaser'
import Crate from './Crate'
import Item from './Item'
import sceneEvents from '../managers/EventManager'

export default class Button extends Item {

    private _pressed:boolean = false
    private _color:string = 'blue'

    constructor(scene:Phaser.Scene, x:number, y:number, name:string) {
        super(scene, x, y, 'button_blue_up', 0)
        this.name=name
    }

    setup() {
        this.body.setSize(this.width*0.7, this.height*0.7)
    }

    private updateTexture() {
        this.setTexture('button_' + this.color + '_' + (this.pressed ? 'down' : 'up'))
    }

    get color() {
        return this._color
    }
    set color(color:string) {
        this._color=color
        this.updateTexture()
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
        this.updateTexture()
        sceneEvents.emit('button')
    }

}