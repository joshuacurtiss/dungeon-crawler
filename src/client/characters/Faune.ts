import Phaser from 'phaser'
import Player from './Player'
import {WeaponList} from '../weapons'

export default class Faune extends Player {

    constructor(scene: Phaser.Scene, x: number, y: number, weapons?:WeaponList) {
        super(scene, x, y, 'faune')
        this.name = 'faune'
        this.customOffset.set(8, 8)
        this.weapon = weapons?.weapon_regular_sword
        this.anims.play('faune-idle-down')
    }

    public setup() {
        super.setup()
        this.body.setSize(this.width*0.5, this.height*0.6)
    }

    public setHealth(newval:number) {
        const prev=this.health
        super.setHealth(newval)
        if( prev<=0 ) return
        if( newval<=0 ) {
            this.play('faune-faint')
            this.sndmgr.play('die-f')
        } else if( newval<prev ) {
            this.sndmgr.play('hit-f-' + Phaser.Math.Between(1,3))
        }
    }

    get directionAnim():string {
        // If they're moving, show the walking animation
        if( this.moving ) {
            if( this.direction.y<0 ) return 'faune-walk-up'
            if( this.direction.y>0 ) return 'faune-walk-down'
            if( this.direction.x!==0 ) return 'faune-walk-side'
        }
        // Not moving? Show idle animation.
        const dir = this.anims.currentAnim.key.split('-')[2]
        return 'faune-idle-' + dir
    }

}
