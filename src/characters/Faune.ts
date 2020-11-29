import Phaser from 'phaser'
import Lizard from '../enemies/Lizard'

declare global {
    namespace Phaser.GameObjects {
        interface GameObjectFactory {
            faune(x: number, y: number, texture: string, frame?: string|number): Faune
        }
    }
}

enum HealthState {
    IDLE,
    DAMAGE,
    DEAD
}

const DAMAGETIME = 250

export default class Faune extends Phaser.Physics.Arcade.Sprite {

    private damageTime = 0
    private healthState = HealthState.IDLE
    private _health = 3.0
    private knives?:Phaser.Physics.Arcade.Group
    private speed = 100

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string|number) {
        super(scene, x, y, texture, frame)
        this.anims.play('faune-idle-down')
    }

    get dead() {
        return this.healthState===HealthState.DEAD
    }

    get health() {
        return this._health>0 ? this._health : 0
    }

    setKnives(knives: Phaser.Physics.Arcade.Group) {
        this.knives = knives
    }

    handleDamage(lizard:Lizard) {
        if( this.healthState===HealthState.DAMAGE ) return
        if( this.dead ) return
		const dir = new Phaser.Math.Vector2(this.x-lizard.x, this.y-lizard.y).normalize().scale(200)
        this.setVelocity(dir.x, dir.y)
        this.setTint(0xff0000)
        this.healthState = HealthState.DAMAGE
        this.damageTime = 0
        this._health -= lizard.damageInflicted
        if( this.health<=0 ) {
            this.healthState = HealthState.DEAD
            this.play('faune-faint')
            this.setVelocity(0, 0)
            this.setTint(0xffffff)
        }
    }

    private throwKnife() {
        if( !this.knives ) return
        const dir = this.anims.currentAnim.key.split('-')[2]
        const vec = new Phaser.Math.Vector2(0, 0)
        switch( dir ) {
            case 'up':
                vec.y = -1
                break
            case 'down':
                vec.y = 1
                break
            default:
                vec.x = this.scaleX<0 ? -1 : 1
                break
        }
        const angle = vec.angle()
        const knife = this.knives.get(this.x, this.y, 'knife') as Phaser.Physics.Arcade.Image
        knife.setActive(true)
        knife.setVisible(true)
        knife.setRotation(angle)
        knife.setVelocity(vec.x * 300, vec.y * 300)
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
        if( Phaser.Input.Keyboard.JustDown(cursors.space!) ) {
            this.throwKnife()
            return // Don't walk and throw knives
        }
        if( cursors.left?.isDown ) {
			this.anims.play('faune-walk-side', true)
			this.setVelocity(-this.speed, 0)
			this.scaleX = -1
			this.body.offset.x = 24
		} else if( cursors.right?.isDown) {
			this.anims.play('faune-walk-side', true)
			this.setVelocity(this.speed, 0)
			this.scaleX = 1
			this.body.offset.x = 8
		} else if( cursors.up?.isDown) {
			this.anims.play('faune-walk-up', true)
			this.setVelocity(0, -this.speed)
		} else if( cursors.down?.isDown) {
			this.anims.play('faune-walk-down', true)
			this.setVelocity(0, this.speed)
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
