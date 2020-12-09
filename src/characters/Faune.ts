import Phaser from 'phaser'
import Item from '../items/Item'
import Enemy from '../enemies/Enemy'
import { sceneEvents } from '../events/EventCenter'

enum HealthState {
    IDLE,
    DAMAGE,
    DEAD
}

const DAMAGETIME = 250

export default class Faune extends Phaser.Physics.Arcade.Sprite {

    private _coins = 0
    private _health = 3.0

    private damageTime = 0
    private _dir = new Phaser.Math.Vector2(0, 100)
    private healthState = HealthState.IDLE
    private speed = 100
    private maxHealth = 3

    public touching?: Item
    public weapon?: Phaser.Physics.Arcade.Group

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        this.anims.play('faune-idle-down')
    }

    get dead() {
        return this.healthState===HealthState.DEAD
    }

    get dir() {
        return this._dir
    }

    get coins() {
        return this._coins>0 ? this._coins : 0
    }

    set coins(newval:number) {
        if( newval<0 ) newval=0
        if( this._coins!==newval ) sceneEvents.emit('player-coins-changed', newval)
        this._coins=newval
    }

    get health() {
        return this._health>0 ? this._health : 0
    }

    set health(newval:number) {
        if( this.dead ) return
        // Keep in boundaries
        if( newval<0 ) newval=0
        else if( newval>this.maxHealth ) newval=this.maxHealth
        if( newval<=0 ) {
            // Death 
            this.healthState = HealthState.DEAD
            this.play('faune-faint')
            this.scene.sound.play('die-f')
            this.setVelocity(0, 0)
            this.setTint(0xffffff)
        } else if( newval<this._health ) {
            // Hurt
            this.scene.sound.play('hit-f-' + Phaser.Math.Between(1,3))
        }
        // Apply the change, emit the event
        if( this._health!==newval ) sceneEvents.emit('player-health-changed', newval)
        this._health=newval
    }

    get moving() {
        return this.body.velocity.x || this.body.velocity.y
    }

    get dirAnim():string {
        // If they're moving, show the walking animation
        if( this.moving ) {
            if( this.dir.y<0 ) return 'faune-walk-up'
            if( this.dir.y>0 ) return 'faune-walk-down'
            if( this.dir.x!==0 ) return 'faune-walk-side'
        }
        // Not moving? Show idle animation.
        const dir = this.anims.currentAnim.key.split('-')[2]
        return 'faune-idle-' + dir
    }

    setDir(x:number, y:number) {
        // Do not set if not moving
        if( !x && !y ) return 
        this._dir.setTo(x, y)
        if( y!==0 ) {
            return
        } else if( x<0 ) {
            this.scaleX = -1
            this.body.offset.x = 24
        } else if( x>0 ) {
            this.scaleX = 1
            this.body.offset.x = 8
        }
    }

    handleDamage(enemy:Enemy) {
        if( this.healthState===HealthState.DAMAGE ) return
        if( this.dead ) return
		const dir = new Phaser.Math.Vector2(this.x-enemy.x, this.y-enemy.y).normalize().scale(200)
        this.setVelocity(dir.x, dir.y)
        this.setTint(0xff0000)
        this.healthState = HealthState.DAMAGE
        this.damageTime = 0
        this.health -= enemy.damageInflicted
    }

    private shoot() {
        if( !this.weapon ) return
        const weapon = this.weapon.get(this.x, this.y)
        weapon?.shoot(this.dir)
    }

    preUpdate(t:number, dt:number) {
        super.preUpdate(t, dt)
        switch( this.healthState ) {
            case HealthState.IDLE:
                break
            case HealthState.DAMAGE: 
                this.damageTime += dt
                if( this.damageTime >= DAMAGETIME ) {
                    this.healthState = HealthState.IDLE
                    this.setTint(0xffffff)
                    this.damageTime = 0
                }
                break
        }
    }

    update(cursors:Phaser.Types.Input.Keyboard.CursorKeys) {
        if( !cursors ) return;
        if( this.healthState===HealthState.DAMAGE ) return
        if( this.healthState===HealthState.DEAD ) return
        if( cursors.space && Phaser.Input.Keyboard.JustDown(cursors.space) ) {
            if( this.touching && ! this.touching.used ) this.touching.use(this)
            else this.shoot()
            return
        }
        // Calculate velocity based on cursor
        let x = 0
        let y = 0
        if( cursors.up?.isDown ) y = -this.speed
        else if( cursors.down?.isDown ) y = this.speed
        if( cursors.left?.isDown ) x = -this.speed
        else if( cursors.right?.isDown ) x = this.speed
        // Animate and set velocity accordingly
        this.setDir(x, y)
        this.play(this.dirAnim, true)
        this.setVelocity(x, y)
        // If you're moving, you don't have an active chest
        if( x || y ) this.touching = undefined
    }

}

Phaser.GameObjects.GameObjectFactory.register('faune', function(this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, texture: string, frame?: string|number){
    const sprite = new Faune(this.scene, x, y, texture, frame)
    this.displayList.add(sprite)
    this.updateList.add(sprite)
    this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)
    sprite.body.setSize(sprite.width*0.5, sprite.height*0.6)
    sprite.body.offset.set(sprite.width*0.25, sprite.height*0.3)
    return sprite
})
