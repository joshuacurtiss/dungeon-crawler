import Phaser from 'phaser'
import MenuItem from '../ui/MenuItem'
import SoundManager from '../managers/SoundManager'

export default class Pause extends Phaser.Scene {

    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
    private sndmgr = new SoundManager(this)
    private menu: MenuItem[] = []
    private _menuIndex: number = 0

    constructor() {
        super('pause')
    }

    get menuSelection() {
        return this.menu[this.menuIndex]
    }
    get menuIndex() {
        return this._menuIndex
    }
    set menuIndex(index: number) {
        this.menu[this.menuIndex].selected=false
        this._menuIndex = index<0 ? 0 : index+1>this.menu.length ? this.menu.length-1 : index
        this.menu[this.menuIndex].selected=true
    }

    init() {
		this.events.once('shutdown', ()=>{
            this.input.keyboard.removeAllKeys()
            this.menu.forEach(item=>item.removeAllListeners())
		})
    }

    preload() {
        const centerX = this.cameras.main.x + this.cameras.main.width / 2
        const centerY = this.cameras.main.y + this.cameras.main.height / 2
        const textConfig: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Nova Script',
            fontSize: '14px',
        }
        this.add.rectangle(centerX, centerY*0.7, centerX, centerY*.6, 0x111111, 0.9)
        const menuIndicators: Phaser.GameObjects.Image[] = [
            this.add.image(centerX - 65, 0, 'textures', 'menu_arrow').setScale(0.5).setFlipX(true),
            this.add.image(centerX + 65, 0, 'textures', 'menu_arrow').setScale(0.5),
        ]
        this.menu = [
            new MenuItem(this, centerX, centerY*0.7-20, 'Continue', textConfig, { menuIndicators }),
            new MenuItem(this, centerX, centerY*0.7, 'Restart', textConfig, { menuIndicators }),
            new MenuItem(this, centerX, centerY*0.7+20, 'Quit Game', textConfig, { menuIndicators }),
        ]
        this.menu.forEach((item, index)=>{
            item.on('pointerover', ()=>this.menuIndex=index)
            item.on('pointerup', ()=>this.select())
        })
        this.menuIndex=0
        this.cursors = this.input.keyboard.createCursorKeys()
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).on('up', ()=>this.select())
		this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('up', ()=>this.continueGame())
    }

    private select() {
        const text=this.menuSelection.text.toLowerCase()
        if( text==='continue' ) this.continueGame()
        else if( text==='restart' ) this.restartGame()
        else if( text.indexOf('quit')>=0 ) this.abortGame()
    }

    private continueGame(nextScene:string = 'game') {
        this.scene.resume(nextScene)
        this.scene.stop()
    }

    private restartGame(nextScene:string = 'game') {
        this.sndmgr.fade('music-game', 500)
        this.scene.stop('game-ui')
        this.cameras.main.fadeOut(1000, 0, 0, 0)
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, ()=>{
            this.scene.stop()
            this.scene.start(nextScene)
        })
    }

    private abortGame(nextScene:string = 'mainmenu') {
        this.sndmgr.fade('music-game', 500)
        this.scene.stop('game-ui')
        this.cameras.main.fadeOut(1000, 0, 0, 0)
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, ()=>{
            this.scene.stop('game')
            this.scene.stop()
            this.scene.start(nextScene)
        })
    }

    update(t:number, dt:number) {
		super.update(t, dt)
        if( !this.cursors ) return;
        if ( Phaser.Input.Keyboard.JustDown(this.cursors.space!) ) {
            this.select()
        } else if ( Phaser.Input.Keyboard.JustDown(this.cursors.up!) ) {
            this.menuIndex--
        } else if ( Phaser.Input.Keyboard.JustDown(this.cursors.down!) ) {
            this.menuIndex++
        }
    }

}