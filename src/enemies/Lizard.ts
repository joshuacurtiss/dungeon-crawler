import Phaser from 'phaser'

enum Direction {
    UP, 
    DOWN,
    LEFT,
    RIGHT
}

const randomDirection = (exclude?: Direction) => {
    let newDir
    do {
        newDir = Phaser.Math.Between(0,3)
    } while (newDir===exclude)
    return newDir
}

export default class Lizard extends Phaser.Physics.Arcade.Sprite {

    private direction = randomDirection(Direction.LEFT)
    private speed = 50
    private moveEvent: Phaser.Time.TimerEvent

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        this.anims.play('lizard-run')
        scene.physics.world.on(Phaser.Physics.Arcade.Events.TILE_COLLIDE, this.handleTileCollision, this)
        this.moveEvent = scene.time.addEvent({
            delay: 2000,
            callback: ()=>{
                this.direction = randomDirection()
            },
            loop: true
        })
    }

    destroy(fromScene?: boolean) {
        this.moveEvent.destroy()
        super.destroy(fromScene)
    }

    private handleTileCollision(go: Phaser.GameObjects.GameObject, tile: Phaser.Tilemaps.Tile) {
        if( go!==this ) return
        this.direction = randomDirection(this.direction)
    }

    preUpdate( t: number, dt: number) {
        super.preUpdate(t, dt)
        switch (this.direction) {
            case Direction.UP:
                this.setVelocity(0, -this.speed)
                break;
            case Direction.DOWN:
                this.setVelocity(0, this.speed)
                break;
            case Direction.LEFT:
                this.setVelocity(-this.speed, 0)
                this.scaleX = -1
                this.body.offset.x = 16
                break;
            case Direction.RIGHT:
                this.setVelocity(this.speed, 0)
                this.scaleX = 1
                this.body.offset.x = 0
                break;
        }
    }

}