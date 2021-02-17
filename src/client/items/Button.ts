import Phaser from 'phaser'
import Crate from './Crate'
import Item from './Item'
import sceneEvents from '../managers/EventManager'

export default class Button extends Item {

    private _pressed:boolean = false
    private _color:string = 'blue'

    constructor(scene:Phaser.Scene, x:number, y:number, name:string, type:string) {
        super(scene, x, y, 'textures', 'button_blue_up')
        this.name=name
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [specialType, ...descparts] = type.split('_')
        const specialDesc = descparts.join('_')
        this.color = specialDesc.length ? specialDesc : 'blue'
    }

    setup() {
        this.body.setSize(this.width*0.7, this.height*0.7)
    }

    private updateTexture() {
        this.setTexture('textures', 'button_' + this.color + '_' + (this.pressed ? 'down' : 'up'))
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
        const bodies = this.scene.physics.overlapRect(this.x-halfWidth, this.y-halfHeight, this.width-3, this.height-3) as any[]
        const crates = bodies.filter(b=>b.gameObject ! instanceof Crate)
        return crates.length>0
    }

    press(crate: Crate) {
        this.pressed = true
        // Check the crate and slowly snap it into position.
        const props = ['x', 'y']
        props.forEach(prop=>{
            const cratePos = Math.floor(crate[prop] * 10)
            const btnPos = Math.floor(this[prop] * 10)
            const diff = Math.abs(cratePos-btnPos)
            if( !diff ) return
            let delta = 0
            if( diff<5 ) delta=0.02
            else if( diff<80 ) delta=0.30
            else delta=0.08
            if( cratePos > btnPos ) delta*=-1.1
            if( delta ) crate[prop]+=delta
        })
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