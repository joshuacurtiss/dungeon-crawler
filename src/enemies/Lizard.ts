import Phaser from 'phaser'

export default class Lizard extends Phaser.Physics.Arcade.Sprite {

    public damageInflicted = 0.5
    private speed = Phaser.Math.Between(40, 75)
    private direction = new Phaser.Math.Vector2(this.speed, 0)
    private moveEvent: Phaser.Time.TimerEvent

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        this.anims.play('lizard-run')
        scene.physics.world.on(Phaser.Physics.Arcade.Events.TILE_COLLIDE, this.handleTileCollision, this)
        this.moveEvent = scene.time.addEvent({
            delay: Phaser.Math.Between(1500, 5000),
            callback: ()=>{
                this.direction = this.randomDirection()
            },
            loop: true
        })
    }

    destroy(fromScene?: boolean) {
		this.scene.sound.play('monster-' + Phaser.Math.Between(1,5))
        this.moveEvent.destroy()
        super.destroy(fromScene)
    }

    private randomDirection(): Phaser.Math.Vector2 {
        let newDir: Phaser.Math.Vector2
        do {
            newDir = new Phaser.Math.Vector2(Phaser.Math.Between(-1,1) * this.speed, Phaser.Math.Between(-1,1) * this.speed)
        } while ((this.direction && newDir.fuzzyEquals(this.direction)) || (newDir.x===0 && newDir.y===0))
        return newDir
    }
    

    private handleTileCollision(go: Phaser.GameObjects.GameObject, tile: Phaser.Tilemaps.Tile) {
        if( go!==this ) return
        this.direction = this.randomDirection()
    }

    preUpdate( t: number, dt: number) {
        super.preUpdate(t, dt)
        this.setVelocity(this.direction.x, this.direction.y)
        if( this.direction.y!==0 ) return
        if( this.direction.x<0 ) {
            this.scaleX = -1
            this.body.offset.x = 16
        } else if( this.direction.x>0 ) {
            this.scaleX = 1
            this.body.offset.x = 0
        }
    }

}