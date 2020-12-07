import Phaser from 'phaser'

import { createCharacterAnims } from '../anims/CharacterAnims'
import '../characters/Faune'
import Faune from '../characters/Faune'

export default class Start extends Phaser.Scene {

    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
	private faune!: Faune
    private speed: number = 50

    constructor() {
        super({key: 'start'})
    }

    preload() {
        const centerX = this.cameras.main.worldView.x + this.cameras.main.width / 2
        const titleConfig: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '20px',
        }
        const textConfig: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '14px',
        }
        this.add.text(centerX, 50, 'Dungeon Crawler', titleConfig)
            .setOrigin(0.5)
            .setScrollFactor(0, 0)
        this.add.text(190, 120, 'Music', textConfig)
            .setScrollFactor(0, 0)
        createCharacterAnims(this.anims)
		const map = this.make.tilemap({key: 'dungeon-start'})
		const tileset = map.addTilesetImage('dungeon', 'tiles', 16, 16, 1, 2)
		map.createStaticLayer('Ground', tileset)
		const wallsLayer = map.createStaticLayer('Walls', tileset)
		wallsLayer.setCollisionByProperty({collides: true})
		map.getObjectLayer('Characters').objects.filter(obj=>obj.type==='player').forEach(playerObj=>{
			if( this.add[playerObj.name] ) {
				this[playerObj.name] = this.add[playerObj.name](playerObj.x!, playerObj.y!, playerObj.name)
			}
        })
        this.cameras.main.startFollow(this.faune, true)
        this.cursors = this.input.keyboard.createCursorKeys()
    }

    create() {
        this.sound.play('music-menu', {loop: true})
        this.walk()
        this.time.addEvent({
            delay: 90000,
            callback: ()=>{
                this.walk(-this.speed)
            },
            loop: true
        })
    }

    walk(speed:number = this.speed) {
        this.faune.setDir(speed, 0)
        this.faune.setVelocityX(speed)
        this.faune.play(this.faune.dirAnim, true)
        this.speed=speed
    }

    update(t:number, dt:number) {
		super.update(t, dt)
        if( !this.cursors ) return;
        if( Phaser.Input.Keyboard.JustDown(this.cursors.space!) ) {
            this.tweens.add({
                targets: this.sound.get('music-menu'),
                volume: 0,
                duration: 800
            })
            this.cameras.main.fadeOut(1000, 0, 0, 0)
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                this.scene.start('game')
            })
        } else if ( Phaser.Input.Keyboard.JustDown(this.cursors.up!) ) {
            console.log("Up")
        } else if ( Phaser.Input.Keyboard.JustDown(this.cursors.down!) ) {
            console.log("Down")
        } else if ( Phaser.Input.Keyboard.JustDown(this.cursors.left!) ) {
            console.log("Left")
        } else if ( Phaser.Input.Keyboard.JustDown(this.cursors.right!) ) {
            console.log("Right")
        }
    }

}