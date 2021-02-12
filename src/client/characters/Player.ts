import Phaser from 'phaser'
import Enemy from '../enemies/Enemy'
import {Crate, Item} from '../items'
import {EventManager as sceneEvents, SoundManager} from '../managers'
import {Fireball, Knife, KnightSword, RegularSword, Weapon, WeaponList} from '../weapons'

enum HealthState {
    IDLE,
    DAMAGE,
    DEAD
}

type PlayerState = {
    coins: number;
    health: number;
    hearts: number;
}

export default class Player extends Phaser.Physics.Arcade.Sprite {

    private currState: PlayerState = {coins: 0, health: 3.0, hearts: 3}
    private _direction = new Phaser.Math.Vector2(0, 100)
    private _origState: PlayerState = {...this.currState}

    private damageTime = 0
    private healthState = HealthState.IDLE

    protected sndmgr: SoundManager
    
    public customOffset = new Phaser.Math.Vector2(0, 0)
    public damageTimeMax: number = 250
    public id: string = Math.floor(Math.random() * 10**8).toString()
    public speed: number = 100
    public touching?: Item
    public weapon?: Phaser.Physics.Arcade.Group
    public weapons: WeaponList

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        scene.add.existing(this)
        this.sndmgr = new SoundManager(scene, 'sfx')
        this.scene.physics.world.enableBody(this, Phaser.Physics.Arcade.DYNAMIC_BODY)
        this.setDepth(1)
        this.weapons = {
            'weapon_fireball': scene.physics.add.group({ classType: Fireball, maxSize: 4 }),
            'weapon_knife': scene.physics.add.group({ classType: Knife, maxSize: 8 }),
            'weapon_knight_sword': scene.physics.add.group({ classType: KnightSword, maxSize: 2 }),
            'weapon_regular_sword': scene.physics.add.group({ classType: RegularSword, maxSize: 2 }),
        }
    }

    public setup(coins?: number, hearts?: number, health?: number) {
        if( coins ) this.currState.coins = coins
        if( hearts ) {
            this.currState.hearts = hearts
            this.currState.health = hearts
        }
        if( health ) this.currState.health = health
        this._origState = {...this.currState}
    }

    get origState() {
        return this._origState
    }

    get coins() {
        return this.currState.coins>0 ? this.currState.coins : 0
    }

    set coins(newval:number) {
        if( newval<0 ) newval=0
        if( this.currState.coins!==newval ) sceneEvents.emit('player-coins-changed', newval)
        this.currState.coins=newval
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
        return this.currState.health>0 ? this.currState.health : 0
    }

    set health(newval:number) {
        this.setHealth(newval)
    }

    get hearts() {
        return this.currState.hearts
    }

    set hearts(newval:number) {
        this.currState.hearts = newval
        sceneEvents.emit('player-hearts-changed', newval)
    }

    public setHealth(newval:number) {
        if( this.dead ) return
        // Keep in boundaries
        newval = newval<0 ? 0 : newval>this.hearts ? this.hearts : newval
        if( newval<=0 ) {
            // Death 
            this.healthState = HealthState.DEAD
            this.setVelocity(0, 0)
            this.setTint(0xffffff)
        }
        // Apply the change, emit the event
        if( this.currState.health!==newval ) sceneEvents.emit('player-health-changed', newval)
        this.currState.health=newval
        if( this.dead ) sceneEvents.emit('player-dead')
    }

    get moving() {
        return this.body.velocity.x || this.body.velocity.y
    }

    /**
     * Detects whether player is pushing one or more crates, and returns the multiplier to change the speed.
     * @param dirX The horizontal direction.
     * @param dirY The vertical direction.
     */
    adjustSpeed(dirX:number, dirY:number):number {
        let response = 1
        if( !dirX && !dirY ) return 0
        // Check if there's a crate in the direction they are touching something
        const dist = 3 // distance to look for
        const body = this.body
        const x = dirX<0 ? body.x-dist : body.x
        const y = dirY<0 ? body.y-dist : body.y
        const width = body.width + (dirX ? dist : 0)
        const height = body.height + (dirY ? dist : 0)
        const bodies=this.scene.physics.overlapRect(x, y, width, height) as any[]
        const crates = bodies.filter(b=>b.gameObject ! instanceof Crate).map(b=>b.gameObject)
        if( crates.length ) {
            response = 0.66
            // Block check
            let x1=99999, x2=0, y1=99999, y2=0
            crates.forEach(crate=>{
                const { halfWidth, halfHeight } = crate.body
                if( x1>crate.x-halfWidth ) x1=crate.x-halfWidth
                if( x2<crate.x+halfWidth ) x2=crate.x+halfWidth
                if( y1>crate.y-halfHeight ) y1=crate.y-halfHeight
                if( y2<crate.y+halfHeight ) y2=crate.y+halfHeight
            })
            if( dirX<0 ) x1-=dist
            if( dirX>0 ) x2+=dist
            if( dirY<0 ) y1-=dist
            if( dirY>0 ) y2+=dist
            const bbodies=this.scene.physics.overlapRect(x1, y1, x2-x1, y2-y1) as any[]
            const bcrates = bbodies.map(b=>b.gameObject).filter(go=>{
                if( go instanceof Crate ) return crates.some(c=>go.x!==c.x || go.y!==c.y)
                return false
            })
            if( bcrates.length ) response = 0
        }
        return response
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
        sceneEvents.emit('shoot', this)
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
        const multiplier = this.adjustSpeed(x, y)
        x*=multiplier
        y*=multiplier
        this.walk(x, y)
    }

}
