import Phaser from 'phaser'
import Item from './Item'

export default class Crate extends Item {

    constructor(scene:Phaser.Scene, x:number, y:number, name:string) {
        super(scene, x, y, 'textures', 'crate')
        this.name=name
    }

    setup() {
        this.body.setSize(this.width*0.8, this.height*0.9)
        this.setDepth(5)
        this.setDamping(true)
        this.setBounce(0)
        this.setDrag(0.1)
    }

}