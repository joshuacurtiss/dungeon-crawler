import Phaser from 'phaser'
import SoundManager from '../managers/SoundManager'

export default class LoseLife extends Phaser.Scene {

    private character: string = 'faune'
    private lives!: number
    private coins!: number
    private sndmgr = new SoundManager(this)

    constructor() {
        super('loselife')
    }

    init(data) {
		this.character = data.character ?? this.character
        this.lives = data.lives ?? 0
        this.coins = data.coins ?? 0
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).once('up', ()=>this.restartLevel())
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).once('up', ()=>this.restartLevel())
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).once('up', ()=>this.restartLevel())
		this.events.once('shutdown', ()=>this.input.keyboard.removeAllKeys())
    }

    preload() {
        const centerX = this.cameras.main.x + this.cameras.main.width / 2
        const centerY = this.cameras.main.y + this.cameras.main.height / 2
        const textConfig: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '14px',
        }
        const face = this.add.image(centerX/2 + 35, centerY*0.7, 'face_'+this.character)
        this.add.rectangle(centerX, centerY*0.7, centerX, face.height + 2, 0x111111, 0.9).setDepth(-1)
        const textCoord = face.getRightCenter()
        this.add.text(textCoord.x+10, textCoord.y-20, this.message, textConfig)
        this.add.text(textCoord.x+10, textCoord.y+5, 'x ' + this.lives, textConfig)
    }

    create() {
        this.sndmgr.play('music-lose')
    }

    get message() {
        return this.lives>0 ? 'Try again!' : 'Defeated!'
    }

    get nextScene() {
        return this.lives>0 ? 'game' : 'mainmenu'
    }

    private restartLevel() {
        this.sndmgr.remove('music-lose')
        this.scene.stop()
        this.scene.start(this.nextScene, {
            character: this.character,
            coins: this.coins,
            lives: this.lives,
        })
    }

}