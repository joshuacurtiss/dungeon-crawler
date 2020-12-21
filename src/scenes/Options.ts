import Phaser from 'phaser'
import ConfigManager from '../managers/ConfigManager'
import MenuItem from '../ui/MenuItem'
import SoundManager from '../managers/SoundManager'

export default class Options extends Phaser.Scene {

    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
    private config = new ConfigManager()
    private sndmgr = new SoundManager(this)
    private menu: MenuItem[] = []
    private _menuIndex: number = 0

    constructor() {
        super('options')
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

    preload() {
        const centerX = this.cameras.main.worldView.x + this.cameras.main.width / 2
        const titleConfig: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '20px',
        }
        const textConfig: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '14px',
        }
        this.add.text(centerX, 45, 'Options', titleConfig).setOrigin(0.5).setScrollFactor(0, 0)
        const menuIndicators: Phaser.GameObjects.Image[] = [
            this.add.image(centerX - 100, 190, 'ui-menu-left').setScale(0.5).setScrollFactor(0, 0),
            this.add.image(centerX + 100, 190, 'ui-menu-right').setScale(0.5).setScrollFactor(0, 0),
        ]
        this.menu = [
            new MenuItem(this, centerX, 100, 'Music:', textConfig, {
                key: 'music',
                menuIndicators,
            }),
            new MenuItem(this, centerX, 130, 'Sound Effects:', textConfig, {
                key: 'sfx',
                menuIndicators,
            }),
            new MenuItem(this, centerX, 160, 'Back to Main Menu', textConfig, {
                nextScene: 'mainmenu',
                menuIndicators
            }),
        ]
        this.menu.forEach((item, index)=>{
            item.on('pointerover', ()=>this.menuIndex=index)
            item.on('pointerup', ()=>this.select())
        })
        this.menuIndex=0
        this.cursors = this.input.keyboard.createCursorKeys()
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).on('up', ()=>this.select())
    }

    create() {
        this.menu[0].chk = this.config.getBoolean('music')
        this.menu[1].chk = this.config.getBoolean('sfx')
        this.cameras.main.fadeIn(1000, 0, 0, 0)
    }

    private select() {
        const item=this.menuSelection
        if( item.key ) {
            item.chk = ! item.chk
            this.config.setBoolean(item.key, item.chk)
            if( item.key==='music' ) {
                if( item.chk ) this.sndmgr.play('music-menu', {loop: true})
                else this.sndmgr.remove('music-menu')
            }
        }
        if( item.nextScene ) {
            this.input.keyboard.removeAllKeys()
            this.menu.forEach(item=>item.removeAllListeners())
            this.cameras.main.fadeOut(1000, 0, 0, 0)
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, ()=>{
                this.scene.start(item.nextScene)
            })
        }
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
        } else if ( Phaser.Input.Keyboard.JustDown(this.cursors.left!) ) {
            console.log("Left")
        } else if ( Phaser.Input.Keyboard.JustDown(this.cursors.right!) ) {
            console.log("Right")
        }
    }

}