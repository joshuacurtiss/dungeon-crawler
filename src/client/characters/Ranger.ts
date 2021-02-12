import Phaser from 'phaser'
import Player from './Player'
import createStandardAnims from './createStandardAnims'

export default class Ranger extends Player {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'textures', 'ranger_down_2')
        this.name = 'ranger'
        this.customOffset.set(8, 5)
        this.speed = 100
        this.weapon = this.weapons.weapon_knight_sword
        createStandardAnims(scene, this.name)
        this.anims.play('ranger_idle_down')
        this.body.setSize(this.width*0.4, this.height*0.8)
    }

    public setHealth(newval:number) {
        const prev=this.health
        super.setHealth(newval)
        if( prev<=0 ) return
        if( newval<=0 ) {
            this.anims.play('ranger_idle_down')
            this.sndmgr.play('die-m')
        } else if( newval<prev ) {
            this.sndmgr.play('hit-m-' + Phaser.Math.Between(1,3))
        }
    }

    get directionAnim():string {
        // If they're moving, show the walking animation
        if( this.moving ) {
            if( this.direction.y<0 ) return 'ranger_walk_up'
            if( this.direction.y>0 ) return 'ranger_walk_down'
            if( this.direction.x!==0 ) return 'ranger_walk_side'
        }
        // Not moving? Show idle animation.
        const dir = this.anims.currentAnim.key.split('_')[2]
        return 'ranger_idle_' + dir
    }

}
