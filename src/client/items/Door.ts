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

    constructor(scene:Phaser.Scene, x:number, y:number, name:string) {
        super(scene, x+8, y+8, 'door_closed', 0)
        this.name=name
    }

    setup(player:Player) {
        this.player = player
        this.setColliders()
    }

    get open() {
        return this._open
    }
    set open(bool:boolean) {
        if( this._open===bool ) return
        if( bool ) {
            if( this.playerCollider ) this.playerCollider.destroy()
            if( this.weaponCollider ) this.weaponCollider.destroy()
            this.sndmgr.play('door-open')
        } else {
            this.setColliders()
            this.sndmgr.play('door-closed')
        }
        this.setTexture('door_' + (bool ? 'open' : 'closed'))
        this._open = bool
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