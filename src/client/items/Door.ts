import Phaser from 'phaser'
import Player from '../characters/Player'
import Item from './Item'
import Weapon from '../weapons/Weapon'
import sceneEvents from '../managers/EventManager'

export default class Door extends Item {

    public _open:boolean = false
    private playerCollider?:Phaser.Physics.Arcade.Collider
    private weaponCollider?:Phaser.Physics.Arcade.Collider
    private player?:Player

    constructor(scene:Phaser.Scene, x:number, y:number, name:string, type:string) {
        super(scene, x+8, y+8, 'textures', 'door_closed')
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [specialType, ...descparts] = type.split('_')
		const specialDesc = descparts.join('_')
        this._open = specialDesc==='open'
        this.name=name
    }

    setup(player:Player) {
        this.player = player
        if( this.open ) this.setTexture('textures', 'door_open')
        else this.setColliders()
    }

    get open() {
        return this._open
    }
    set open(bool:boolean) {
        if( this._open===bool ) return
        if( bool ) this.handleOpen()
        else this.handleClose()
        this._open = bool
    }

    private handleOpen() {
        if( this.playerCollider ) this.playerCollider.destroy()
        if( this.weaponCollider ) this.weaponCollider.destroy()
        this.sndmgr.play('door-open')
        this.setTexture('textures', 'door_open')
    }

    private handleClose() {
        this.setColliders()
        this.sndmgr.play('door-closed')
        this.setTexture('textures', 'door_closed')
    }

    use(player:Player) {
        if( ! this.open || this.used ) return
        if( Math.abs(player.y - this.y) <= 5 && this.name==='exit' ) sceneEvents.emit('player-exit')
        else return
        super.use(player)
    }

    private setColliders() {
        if( this.player ) {
            this.playerCollider = this.scene.physics.add.collider(this.player, this)
            if( this.player.weapon ) this.weaponCollider = this.scene.physics.add.collider(this.player.weapon, this, this.handleWeaponCollide)
        }
    }

    private handleWeaponCollide(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
		const weapon = obj2 as Weapon
		weapon.miss()
	}

}