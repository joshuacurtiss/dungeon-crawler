import Phaser from 'phaser'
import {ConfigManager, SoundManager} from '../managers'
import { Player } from '../characters'

export default class LoseLife extends Phaser.Scene {

    private config = new ConfigManager()
    private musicmgr = new SoundManager(this)

    constructor() {
        super('loselife')
    }

    init(data: any) {
        const player = data.player as Player
        this.config.setNumber('coins', player.origState.coins)
        this.config.setNumber('hearts', player.origState.hearts)
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).once('up', ()=>this.restartLevel())
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).once('up', ()=>this.restartLevel())
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).once('up', ()=>this.restartLevel())
		this.events.once('shutdown', ()=>this.input.keyboard.removeAllKeys())
    }

    preload() {
        const centerX = this.cameras.main.x + this.cameras.main.width / 2
        const centerY = this.cameras.main.y + this.cameras.main.height / 2
        const textConfig: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Nova Script',
            fontSize: '16px',
        }
        const face = this.add.image(centerX/2 + 35, centerY*0.7, 'textures', this.config.getString('character','faune') + '_face')
        this.add.rectangle(centerX, centerY*0.7, centerX, face.height + 2, 0x111111, 0.9).setDepth(-1)
        const textCoord = face.getRightCenter()
        this.add.text(textCoord.x+10, textCoord.y-20, this.message, textConfig)
        this.add.text(textCoord.x+10, textCoord.y+5, 'x ' + this.config.getNumber('lives'), textConfig)
    }

    create() {
        this.musicmgr.play('music-lose')
    }

    get message() {
        return this.config.getNumber('lives')>0 ? 'Try again!' : 'Defeated!'
    }

    get nextScene() {
        return this.config.getNumber('lives')>0 ? 'game' : 'mainmenu'
    }

    private restartLevel() {
        this.musicmgr.remove('music-lose')
        this.scene.stop()
        this.scene.start(this.nextScene)
    }

}