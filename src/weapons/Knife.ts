import Phaser from 'phaser'
import Weapon from './Weapon'

export default class Knife extends Weapon {

    constructor(scene:Phaser.Scene, x:number, y:number) {
        super(scene, x, y, 'weapon_knife')
        this.speed = 4
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