import Phaser from 'phaser'
import Player from '../characters/Player'
import Destination from './Destination'
import Item from './Item'

export default class Entrance extends Item {

    private destinations!: Phaser.Physics.Arcade.StaticGroup
    private destination?: Destination

    constructor(scene:Phaser.Scene, x:number, y:number, name:string) {
        super(scene, x, y, 'textures', 'entrance')
        this.name=name
    }

    setup(destinations: Phaser.Physics.Arcade.StaticGroup) {
        this.destinations = destinations
    }

    use(player:Player) {
        if( !this.destination ) this.destination = this.destinations.getChildren().find(obj=>obj.name===this.name) as Destination
        if( this.destination ) player.setPosition(this.destination.x, this.destination.y)
        super.use(player)
    }

}