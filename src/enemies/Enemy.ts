import Phaser from 'phaser'
import SoundManager from '../managers/SoundManager'
import { sceneEvents } from '../events/EventCenter'

export default class Enemy extends Phaser.Physics.Arcade.Sprite {

    private _direction?: Phaser.Math.Vector2
    private _health: number = 1
    private _isBoss: boolean = false
    private _onCamera: boolean = false
    public damageInflicted: number = 1
    public speed: number = 50
    public customOffset = new Phaser.Math.Vector2(0, 0)
    protected moveEvent?: Phaser.Time.TimerEvent
    protected sndmgr:SoundManager

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        this.sndmgr = new SoundManager(scene)
        scene.physics.world.on(Phaser.Physics.Arcade.Events.TILE_COLLIDE, this.handleTileCollision, this)
    }

    public setup() {
        this.body.onCollide = true
        this.changeDirection()
    }

    get dead(): boolean {
        return this.health<=0
    }

    get direction(): Phaser.Math.Vector2 {
        return this._direction || new Phaser.Math.Vector2(0,0)
    }

    set direction(vec: Phaser.Math.Vector2) {
        this.setDirection(vec.x, vec.y)
    }

    get health(): number {
        return this._health
    }

    set health(newval: number) {
        const prev = this._health
        this._health = newval
        if( newval<prev ) this.hit()
    }

    get isBoss(): boolean {
        return this._isBoss
    }

    set isBoss(bool:boolean) {
        if( bool ) this.becomeGiant()
        this._isBoss = bool
    }

    get onCamera(): boolean {
        return this._onCamera
    }

    set onCamera(newval:boolean) {
        if( this._onCamera===newval ) return
        this._onCamera = newval
        // If on camera again, change direction to trigger updates. 
        // Otherwise, stop animation and movement.
        if( newval ) {
            this.changeDirection()
        } else {
            this.anims.stop()
            this._direction?.setTo(0, 0)
            this.setVelocity(0, 0)
        }
    }

    public setDirection(x:number, y:number) {
        if( ! this.onCamera ) return
        if( x ) this.scaleX = Math.abs(this.scaleX) * (x<0 ? -1 : 1)
        this.body.setOffset(this.scaleX<0 ? this.body.width/Math.abs(this.scaleX) + this.customOffset.x : this.customOffset.x, this.customOffset.y)
        if( this._direction ) this._direction.setTo(x, y)
        else this._direction = new Phaser.Math.Vector2(x, y)
    }

    public walk(x:number, y:number) {
        this.setDirection(x, y)
        this.setVelocity(x, y)
    }

    public stop() {
        this.walk(0, 0)
    }

    public hit() {
        if( this.dead ) this.die()
    }

    public die() {
        if( this.isBoss ) sceneEvents.emit('boss-dead') 
        const smoke = this.scene.add.sprite(this.x, this.y, 'smoke', 'smoke-00.png')
        smoke.setScale(this.width/smoke.width, this.height/smoke.height)
        smoke.anims.play('smoke-fade')
        smoke.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, ()=>smoke.destroy())
        this.destroy()
    }

    destroy(fromScene?: boolean) {
        this.moveEvent?.destroy()
        super.destroy(fromScene)
    }

    public becomeGiant() {
        const scale=Math.abs(this.scaleX) * 3
        this.setScale(scale)
        this.damageInflicted*=2
        this.health*=20
    }

    public becomeTiny() {
        const scale=Math.abs(this.scaleX) / 2
        this.setScale(scale)
        this.damageInflicted*=0.5
        this.speed*=1.2
    }

    public changeDirection() {
        this.direction = this.randomDirection()
    }

    protected randomDirection(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(Phaser.Math.Between(-1,1) * this.speed, Phaser.Math.Between(-1,1) * this.speed)
    }

    private handleTileCollision(go: Phaser.GameObjects.GameObject) {
        if( go!==this ) return
        this.direction = this.randomDirection()
    }

    preUpdate(t: number, dt: number) {
        super.preUpdate(t, dt)
        this.setVelocity(this.direction.x, this.direction.y)
    }

}