import Phaser from 'phaser'
import Enemy from '../enemies/Enemy'
import Item from '../items/Item'
import SoundManager from '../managers/SoundManager'

export default class Weapon extends Phaser.Physics.Arcade.Image {

    protected sndmgr:SoundManager
    public damageInflicted:number = 1
    public speed:number = 3

    constructor(scene:Phaser.Scene, x:number, y:number, texture:string, frame?:string|number) {
        super(scene, x, y, texture, frame)
        this.sndmgr = new SoundManager(scene)
    }

    shoot(direction:Phaser.Math.Vector2) {
        this.setActive(true)
        this.setVisible(true)
        this.setRotation(direction.angle())
        this.setVelocity(direction.x * this.speed, direction.y * this.speed)
    }

    miss() {
        this.destroy()
    }

    hit(obj: Item | Enemy) {
        obj.health -= this.damageInflicted
        this.destroy()
    }

}