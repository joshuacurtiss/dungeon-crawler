import Phaser from 'phaser'
import ConfigManager from '../managers/ConfigManager'
import SoundManager from '../managers/SoundManager'

export default class WinLevel extends Phaser.Scene {

    private config = new ConfigManager()
    private sndmgr = new SoundManager(this)

    constructor() {
        super('winlevel')
    }

    init() {
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).once('up', ()=>this.nextLevel())
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).once('up', ()=>this.nextLevel())
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).once('up', ()=>this.nextLevel())
		this.events.once('shutdown', ()=>this.input.keyboard.removeAllKeys())
    }

    preload() {
        const centerX = this.cameras.main.x + this.cameras.main.width / 2
        const centerY = this.cameras.main.y + this.cameras.main.height / 2
        const textConfig: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '14px',
        }
        const face = this.add.image(centerX/2 + 35, centerY*0.7, 'face_'+this.config.getString('character', 'faune'))
        this.add.rectangle(centerX, centerY*0.7, centerX, face.height + 2, 0x111111, 0.9).setDepth(-1)
        const textCoord = face.getRightCenter()
        this.add.text(textCoord.x+10, textCoord.y-20, 'Victory!', textConfig)
        this.add.text(textCoord.x+10, textCoord.y+5, 'x ' + this.config.getNumber('lives'), textConfig)
    }

    create() {
        this.sndmgr.play('music-victory')
    }

    private nextLevel() {
        this.config.inc('level')
        this.sndmgr.remove('music-victory')
        this.scene.stop()
        this.scene.start('game')
    }

}