import Phaser from 'phaser'
import {ConfigManager, SoundManager} from '../managers'

export default class WinGame extends Phaser.Scene {

    private config = new ConfigManager()
    private sndmgr = new SoundManager(this)

    constructor() {
        super('wingame')
    }

    init() {
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).once('up', ()=>this.nextLevel())
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).once('up', ()=>this.nextLevel())
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).once('up', ()=>this.nextLevel())
		this.events.once('shutdown', ()=>this.input.keyboard.removeAllKeys())
    }

    preload() {
        this.load.audio('music-win', '../audio/music-win.mp3')
        const centerX = this.cameras.main.x + this.cameras.main.width / 2
        const centerY = this.cameras.main.y + this.cameras.main.height / 2
        const textConfig: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Nova Script',
            fontSize: '16px',
        }
        const face = this.add.image(centerX/2 + 35, centerY*0.7, 'textures', this.config.getString('character', 'faune') + '_face')
        this.add.rectangle(centerX, centerY*0.7, centerX, face.height + 2, 0x111111, 0.9).setDepth(-1)
        const textCoord = face.getRightCenter()
        this.add.text(textCoord.x+10, textCoord.y-20, 'You Win!', textConfig)
    }

    create() {
        this.sndmgr.play('music-win')
    }

    private nextLevel() {
        this.sndmgr.remove('music-win')
        this.scene.stop()
        this.scene.start('mainmenu')
    }

}