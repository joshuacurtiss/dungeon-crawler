import Phaser from 'phaser'
import Weapon from './Weapon'

export default class Fireball extends Weapon {

    constructor(scene:Phaser.Scene, x:number, y:number) {
        super(scene, x, y, 'weapon_fireball')
        this.damageInflicted = 2
    }

    shoot(direction:Phaser.Math.Vector2) {
        this.scene.sound.play('fireball')
        super.shoot(direction)
    }

    miss() {
        this.scene.sound.play('fireball-hit')
        super.miss()
    }

}