import Phaser from 'phaser'

export default class Flask extends Phaser.Physics.Arcade.Sprite {

    public power:number = 1

    constructor(scene:Phaser.Scene, x:number, y:number, texture:string, frame:string|number) {
        super(scene, x, y, texture, frame)
    }

    open() {
        this.destroy()
        return this.power
    }

}