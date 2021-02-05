import Phaser from 'phaser'
import Player from '../characters/Player'
import Item from './Item'

export default class Flask extends Item {

    public power:number = 1

    constructor(scene:Phaser.Scene, x:number, y:number, name:string, type:string) {
        super(scene, x, y, 'textures', type)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [specialType, specialDesc] = type.split('_')
        if( specialDesc==='red' ) this.power = -1
        if( name.length && !isNaN(Number(name)) ) this.power = Number(name)
    }

    use(player:Player) {
        console.log(`Drinking flask: ${this.power>0 ? '+' : ''}${this.power}`)
        player.health += this.power
        if( this.power>0 ) this.sndmgr.play('rise-3')
        super.use(player)
        this.destroy()
    }

}