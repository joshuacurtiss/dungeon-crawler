import Phaser from 'phaser'
import {ConfigManager, Level, LevelManager, SoundManager} from '../managers'

export default class WinLevel extends Phaser.Scene {

    private config = new ConfigManager()
    private lvlmgr = new LevelManager()
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
            fontFamily: 'Nova Script',
            fontSize: '16px',
        }
        const face = this.add.image(centerX/2 + 35, centerY*0.7, 'textures', this.config.getString('character', 'faune') + '_face')
        this.add.rectangle(centerX, centerY*0.7, centerX, face.height + 2, 0x111111, 0.9).setDepth(-1)
        const textCoord = face.getRightCenter()
        this.add.text(textCoord.x+10, textCoord.y-20, 'Victory!', textConfig)
        this.add.text(textCoord.x+10, textCoord.y+5, 'x ' + this.config.getNumber('lives'), textConfig)
    }

    create() {
        this.sndmgr.play('music-victory')
    }

    private nextLevel() {
        const lvl:Level = {world: this.config.getNumber('world'), level: this.config.getNumber('level')}
        const newlvl:Level = this.lvlmgr.inc(lvl)
        this.config.setNumber('world', newlvl.world)
        this.config.setNumber('level', newlvl.level)
        this.sndmgr.remove('music-victory')
        this.scene.stop()
        this.scene.start('game')
    }

}