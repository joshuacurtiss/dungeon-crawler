import Phaser from 'phaser'

declare global {
    namespace Phaser.GameObjects {
        interface GameObjectFactory {
            faune(x: number, y: number, texture: string, frame?: string|number): Faune
        }
    }
}

enum HealthState {
    IDLE,
    DAMAGE
}

const DAMAGETIME = 250
const SPEED = 100

export default class Faune extends Phaser.Physics.Arcade.Sprite {

    private damageTime = 0
    private healthState = HealthState.IDLE

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        this.anims.play('faune-idle-down')
    }

    handleDamage(dir:Phaser.Math.Vector2) {
        if( this.healthState===HealthState.DAMAGE ) return
        this.setVelocity(dir.x, dir.y)
        this.setTint(0xff0000)
        this.healthState = HealthState.DAMAGE
        this.damageTime = 0
    }

    preUpdate(t:number, dt:number) {
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
		if( cursors.left?.isDown ) {
			this.anims.play('faune-walk-side', true)
			this.setVelocity(-SPEED, 0)
			this.scaleX = -1
			this.body.offset.x = 24
		} else if( cursors.right?.isDown) {
			this.anims.play('faune-walk-side', true)
			this.setVelocity(SPEED, 0)
			this.scaleX = 1
			this.body.offset.x = 8
		} else if( cursors.up?.isDown) {
			this.anims.play('faune-walk-up', true)
			this.setVelocity(0, -SPEED)
		} else if( cursors.down?.isDown) {
			this.anims.play('faune-walk-down', true)
			this.setVelocity(0, SPEED)
		} else {
			const dir = this.anims.currentAnim.key.split('-')[2]
			this.play(`faune-idle-${dir}`)
			this.setVelocity(0, 0)
		}
    }

}

Phaser.GameObjects.GameObjectFactory.register('faune', function(this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, texture: string, frame?: string|number){
    const sprite = new Faune(this.scene, x, y, texture, frame)
    this.displayList.add(sprite)
    this.updateList.add(sprite)
    this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)
    sprite.body.setSize(sprite.width*0.5, sprite.width*0.75)
    return sprite
})
