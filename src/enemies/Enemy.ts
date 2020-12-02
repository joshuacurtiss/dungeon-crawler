import Phaser from 'phaser'

export default class Enemy extends Phaser.Physics.Arcade.Sprite {

    public damageInflicted: number = 1
    public health: number = 1
    public speed: number = 50
    protected animIdle?: string
    protected animRun?: string
    private _direction!: Phaser.Math.Vector2
    protected moveEvent?: Phaser.Time.TimerEvent

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        this.direction = new Phaser.Math.Vector2(0, 0)
        scene.physics.world.on(Phaser.Physics.Arcade.Events.TILE_COLLIDE, this.handleTileCollision, this)
    }

    get dead(): boolean {
        return this.health<=0
    }

    get direction(): Phaser.Math.Vector2 {
        return this._direction
    }

    set direction(vec: Phaser.Math.Vector2) {
        if( !vec.x && !vec.y && this.animIdle ) this.anims.play(this.animIdle)
        else if( (vec.x || vec.y) && this.animRun ) this.anims.play(this.animRun)
        this._direction = vec
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
        if( this.direction.x<0 ) {
            this.scaleX = -1
            this.body.offset.x = 16
        } else if( this.direction.x>0 ) {
            this.scaleX = 1
            this.body.offset.x = 0
        }
    }

}