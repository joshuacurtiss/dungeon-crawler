import Phaser from 'phaser'
import Player from './Player'

export default class Mage extends Player {

    constructor(scene: Phaser.Scene, x: number, y: number, weapons?:WeaponList) {
        super(scene, x, y, 'mage')
        this.customOffset.set(8, 5)
        this.speed = 60
        this.weapon = weapons?.weapon_fireball
        this.anims.play('mage-idle-down')
    }

    public setup() {
        super.setup()
        this.body.setSize(this.width*0.4, this.height*0.8)
    }

    public setHealth(newval:number) {
        const prev=this.health
        super.setHealth(newval)
        if( prev<=0 ) return
        if( newval<=0 ) {
            this.anims.play('mage-idle-down')
            this.scene.sound.play('die-f')
        } else if( newval<prev ) {
            this.scene.sound.play('hit-f-' + Phaser.Math.Between(1,3))
        }
    }

    get directionAnim():string {
        // If they're moving, show the walking animation
        if( this.moving ) {
            if( this.direction.y<0 ) return 'mage-walk-up'
            if( this.direction.y>0 ) return 'mage-walk-down'
            if( this.direction.x!==0 ) return 'mage-walk-side'
        }
        // Not moving? Show idle animation.
        const dir = this.anims.currentAnim.key.split('-')[2]
        return 'mage-idle-' + dir
    }

}
