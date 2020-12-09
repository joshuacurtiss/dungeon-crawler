import Phaser from 'phaser'

export default class Enemy extends Phaser.Physics.Arcade.Sprite {

    public damageInflicted: number = 1
    public health: number = 1
    public speed: number = 50
    public customOffset = new Phaser.Math.Vector2(0, 0)
    private _direction?: Phaser.Math.Vector2
    private _onCamera: boolean = false
    protected moveEvent?: Phaser.Time.TimerEvent

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
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
        if( ! this.onCamera ) return
        this.scaleX = vec.x<0 ? -1 : vec.x>0 ? 1 : this.scaleX
        this.body.setOffset(this.scaleX<0 ? this.body.width + this.customOffset.x : this.customOffset.x, this.customOffset.y)
        this._direction = vec
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

    destroy(fromScene?: boolean) {
        this.moveEvent?.destroy()
        super.destroy(fromScene)
    }

    public changeDirection() {
        this.direction = this.randomDirection()
    }

    protected randomDirection(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(Phaser.Math.Between(-1,1) * this.speed, Phaser.Math.Between(-1,1) * this.speed)
    }

    public handleDamage(amt: number) {
        this.health+=amt
        if( this.dead ) this.destroy()
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