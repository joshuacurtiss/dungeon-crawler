import Phaser from 'phaser'
import Item from './Item'

export default class Destination extends Item {

    constructor(scene:Phaser.Scene, x:number, y:number, name:string) {
        super(scene, x, y, 'textures', 'destination')
        this.name=name
    }

}