import Phaser from 'phaser'
import Player from './Player'
import {WeaponList} from '../weapons'

export default class Fighter extends Player {

    constructor(scene: Phaser.Scene, x: number, y: number, weapons?:WeaponList) {
        super(scene, x, y, 'fighter')
        this.name = 'fighter'
        this.customOffset.set(8, 5)
        this.speed = 110
        this.weapon = weapons?.weapon_knife
        this.anims.play('fighter-idle-down')
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
            this.anims.play('fighter-idle-down')
            this.sndmgr.play('die-m')
        } else if( newval<prev ) {
            this.sndmgr.play('hit-m-' + Phaser.Math.Between(1,3))
        }
    }

    get directionAnim():string {
        // If they're moving, show the walking animation
        if( this.moving ) {
            if( this.direction.y<0 ) return 'fighter-walk-up'
            if( this.direction.y>0 ) return 'fighter-walk-down'
            if( this.direction.x!==0 ) return 'fighter-walk-side'
        }
        // Not moving? Show idle animation.
        const dir = this.anims.currentAnim.key.split('-')[2]
        return 'fighter-idle-' + dir
    }

}
