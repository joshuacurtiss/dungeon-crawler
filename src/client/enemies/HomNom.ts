import createStandardAnims from './createStandardAnims'
import Phaser from 'phaser'
import Enemy from './Enemy'

export default class HomNom extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'textures', 'hom_nom_idle_0')
        this.damageInflicted = 1.0
        this.health = 2
        this.speed = Phaser.Math.Between(75, 125)
        this.customOffset.set(5, 5)
        createStandardAnims(scene, 'hom_nom')
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(1500, 4000),
            callback: ()=>this.changeDirection(),
            loop: true
        })
    }

    setDirection(x:number, y:number) {
        super.setDirection(x, y)
        if( ! this.onCamera ) return
        if( this.direction.x || this.direction.y ) this.anims.play('hom_nom_run')
        else this.anims.play('hom_nom_idle')
    }

    setup() {
        this.setBodySize(21, 28)
        super.setup()
    }

    hit() {
        super.hit()
		if( !this.dead ) this.sndmgr.play('monster-homnom-' + Phaser.Math.Between(1,2))
    }

    die() {
		this.sndmgr.play('monster-homnom-3')
        super.die()
    }

}