import Phaser from 'phaser'
import Player from './Player'

export default class Faune extends Player {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'textures', 'faune_down_3')
        this.name = 'faune'
        this.customOffset.set(8, 8)
        this.weapon = this.weapons.weapon_regular_sword
        scene.anims.create({
            key: 'faune_idle_up', 
            frames: [{key: 'textures', frame: 'faune_up_3'}]
        })
        scene.anims.create({
            key: 'faune_idle_down', 
            frames: [{key: 'textures', frame: 'faune_down_3'}]
        })
        scene.anims.create({
            key: 'faune_idle_side', 
            frames: [{key: 'textures', frame: 'faune_side_3'}]
        })
        scene.anims.create({
            key: 'faune_walk_up',
            frames: scene.anims.generateFrameNames('textures', { start: 1, end: 8, prefix: 'faune_up_' }),
            repeat: -1,
            frameRate: 15
        })
        scene.anims.create({
            key: 'faune_walk_down',
            frames: scene.anims.generateFrameNames('textures', { start: 1, end: 8, prefix: 'faune_down_' }),
            repeat: -1,
            frameRate: 15
        })
        scene.anims.create({
            key: 'faune_walk_side',
            frames: scene.anims.generateFrameNames('textures', { start: 1, end: 8, prefix: 'faune_side_' }),
            repeat: -1,
            frameRate: 15
        })
        scene.anims.create({
            key: 'faune_faint', 
            frames: scene.anims.generateFrameNames('textures', { start: 1, end: 4, prefix: 'faune_faint_' }),
            frameRate: 8
        })    
        this.anims.play('faune_idle_down')
        this.body.setSize(this.width*0.5, this.height*0.6)
    }

    public setHealth(newval:number) {
        const prev=this.health
        super.setHealth(newval)
        if( prev<=0 ) return
        if( newval<=0 ) {
            this.play('faune_faint')
            this.sndmgr.play('die-f')
        } else if( newval<prev ) {
            this.sndmgr.play('hit-f-' + Phaser.Math.Between(1,3))
        }
    }

    get directionAnim():string {
        // If they're moving, show the walking animation
        if( this.moving ) {
            if( this.direction.y<0 ) return 'faune_walk_up'
            if( this.direction.y>0 ) return 'faune_walk_down'
            if( this.direction.x!==0 ) return 'faune_walk_side'
        }
        // Not moving? Show idle animation.
        const dir = this.anims.currentAnim.key.split('_')[2]
        return 'faune_idle_' + dir
    }

}
