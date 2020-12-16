import Phaser from 'phaser'
import Enemy from '../enemies/Enemy'
import Item from '../items/Item'
import SoundManager from '../managers/SoundManager'
import Weapon from '../weapons/Weapon'
import { sceneEvents } from '../events/EventCenter'

enum HealthState {
    IDLE,
    DAMAGE,
    DEAD
}

export default class Player extends Phaser.Physics.Arcade.Sprite {

    private _coins = 0
    private _direction = new Phaser.Math.Vector2(0, 100)
    private _health = 3.0

    private damageTime = 0
    private healthState = HealthState.IDLE

    protected sndmgr: SoundManager
    
    public customOffset = new Phaser.Math.Vector2(0, 0)
    public damageTimeMax: number = 250
    public healthMax: number = 3
    public speed: number = 100
    public touching?: Item
    public weapon?: Phaser.Physics.Arcade.Group

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        scene.add.existing(this)
        this.sndmgr = new SoundManager(scene)
        this.setup()
    }

    public setup() {
        this.scene.physics.world.enableBody(this, Phaser.Physics.Arcade.DYNAMIC_BODY)
    }

    get coins() {
        return this._coins>0 ? this._coins : 0
    }

    set coins(newval:number) {
        if( newval<0 ) newval=0
        if( this._coins!==newval ) sceneEvents.emit('player-coins-changed', newval)
        this._coins=newval
    }

    get damage() {
        return this.healthState===HealthState.DAMAGE
    }

    get dead() {
        return this.healthState===HealthState.DEAD
    }

    get direction() {
        return this._direction
    }

    set direction(newval: Phaser.Math.Vector2) {
        this.setDirection(newval.x, newval.y)
    }

    get directionAnim(): string {
        return ''
    }

    public setDirection(x: number, y: number) {
        // Do not set if not moving
        if( !x && !y ) return 
        this._direction.setTo(x, y)
        if( y!==0 ) return
        this.scaleX = x<0 ? -1 : x>0 ? 1 : this.scaleX
        this.body.setOffset(this.scaleX<0 ? this.body.width + this.customOffset.x : this.customOffset.x, this.customOffset.y)
    }

    get health() {
        return this._health>0 ? this._health : 0
    }

    set health(newval:number) {
        this.setHealth(newval)
    }

    public setHealth(newval:number) {
        if( this.dead ) return
        // Keep in boundaries
        newval = newval<0 ? 0 : newval>this.healthMax ? this.healthMax : newval
        if( newval<=0 ) {
            // Death 
            this.healthState = HealthState.DEAD
            this.setVelocity(0, 0)
            this.setTint(0xffffff)
        }
        // Apply the change, emit the event
        if( this._health!==newval ) sceneEvents.emit('player-health-changed', newval)
        this._health=newval
        if( this.dead ) sceneEvents.emit('player-dead')
    }

    get moving() {
        return this.body.velocity.x || this.body.velocity.y
    }

    hit(obj: Weapon | Enemy) {
        if( this.damage || this.dead ) return
		const dir = new Phaser.Math.Vector2(this.x-obj.x, this.y-obj.y).normalize().scale(200)
        this.setVelocity(dir.x, dir.y)
        this.setTint(0xff0000)
        this.healthState = HealthState.DAMAGE
        this.health -= obj.damageInflicted
        this.damageTime = 0
    }

    shoot() {
        if( !this.weapon ) return
        const weapon = this.weapon.get(this.x, this.y)
        weapon?.shoot(this.direction)
    }

    walk(x:number, y:number) {
        // Animate and set velocity accordingly
        this.setDirection(x, y)
        this.setVelocity(x, y)
        if( this.directionAnim ) this.play(this.directionAnim, true)
        // If you're moving, you're not touching an item
        if( x || y ) this.touching = undefined
    }

    stop() {
        this.walk(0, 0)
    }

    preUpdate(t:number, dt:number) {
        super.preUpdate(t, dt)
        if( this.damage ) {
            this.damageTime += dt
            if( this.damageTime >= this.damageTimeMax ) {
                this.healthState = HealthState.IDLE
                this.setTint(0xffffff)
                this.damageTime = 0
            }
        }
    }

    update(cursors:Phaser.Types.Input.Keyboard.CursorKeys) {
        if( !cursors ) return;
        if( this.damage || this.dead ) return
        if( cursors.space && Phaser.Input.Keyboard.JustDown(cursors.space) ) {
            if( this.touching && ! this.touching.used ) this.touching.use(this)
            else this.shoot()
            return
        }
        // Walk
        let x = 0
        let y = 0
        if( cursors.up?.isDown ) y = -this.speed
        else if( cursors.down?.isDown ) y = this.speed
        if( cursors.left?.isDown ) x = -this.speed
        else if( cursors.right?.isDown ) x = this.speed
        this.walk(x, y)
    }

}
