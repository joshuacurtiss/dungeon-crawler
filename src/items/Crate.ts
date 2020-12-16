import Phaser from 'phaser'
import Item from './Item'

export default class Crate extends Item {

    constructor(scene:Phaser.Scene, x:number, y:number, name:string) {
        super(scene, x, y, 'crate', 0)
        this.name=name
    }

    setup() {
        this.setDamping(true)
        this.setDrag(0.80)
        this.setBounce(0.5)
    }

}