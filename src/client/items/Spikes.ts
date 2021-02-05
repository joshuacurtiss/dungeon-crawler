import Phaser from 'phaser'
import Player from '../characters/Player'
import Item from './Item'

export default class Spikes extends Item {

    public damageInflicted: number = 10

    constructor(scene:Phaser.Scene, x:number, y:number) {
        super(scene, x, y, 'textures', 'spikes_0')
        if( !scene.anims.exists('spikes_spring') ) scene.anims.create({
            key: 'spikes_spring',
            frames: scene.anims.generateFrameNames('textures', {start: 0, end: 3, prefix: 'spikes_'}),
            yoyo: true,
            frameRate: 8,
            repeat: -1,
            repeatDelay: 750
        })
        this.play('spikes_spring')
    }

    get sprung():boolean {
        return this.frame.name.indexOf('0') < 0
    }

    use(player:Player) {
        if( this.used ) return
        const diff = player.y - this.y
        if( this.sprung && diff < -3 && diff > -20 ) player.health -= this.damageInflicted
        else return
        super.use(player)
    }

}