import Phaser from 'phaser'
import Weapon from './Weapon'

export default class Knife extends Weapon {

    public damageInflicted:number = 1
    public speed:number = 3

    constructor(scene:Phaser.Scene, x:number, y:number) {
        super(scene, x, y, 'weapon_knife')
    }

    shoot(direction:Phaser.Math.Vector2) {
        this.scene.sound.play('melee-' + (Phaser.Math.Between(1,2)))
        super.shoot(direction)
    }

    miss() {
        this.scene.sound.play('melee-hit')
        super.miss()
    }

}