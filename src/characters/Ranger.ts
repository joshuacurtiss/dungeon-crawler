import Phaser from 'phaser'
import Player from './Player'

export default class Ranger extends Player {

    constructor(scene: Phaser.Scene, x: number, y: number, weapons?:WeaponList) {
        super(scene, x, y, 'ranger')
        this.customOffset.set(8, 5)
        this.speed = 100
        this.weapon = weapons?.weapon_knight_sword
        this.anims.play('ranger-idle-down')
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
            this.anims.play('ranger-idle-down')
            this.scene.sound.play('die-m')
        } else if( newval<prev ) {
            this.scene.sound.play('hit-m-' + Phaser.Math.Between(1,3))
        }
    }

    get directionAnim():string {
        // If they're moving, show the walking animation
        if( this.moving ) {
            if( this.direction.y<0 ) return 'ranger-walk-up'
            if( this.direction.y>0 ) return 'ranger-walk-down'
            if( this.direction.x!==0 ) return 'ranger-walk-side'
        }
        // Not moving? Show idle animation.
        const dir = this.anims.currentAnim.key.split('-')[2]
        return 'ranger-idle-' + dir
    }

}
