import Phaser from 'phaser'

import MenuItem from '../ui/MenuItem'
import {ConfigManager, SoundManager} from '../managers'

export default class StartMultiplayer extends Phaser.Scene {

    private config = new ConfigManager()
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
    private musicmgr = new SoundManager(this)
    private menu: MenuItem[] = []
    private _menuIndex: number = 0
    private players: Phaser.GameObjects.Image[] = []
    private playerBox?: Phaser.GameObjects.Rectangle
    private _playerIndex: number = 0

    constructor() {
        super('startmultiplayer')
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

    get playerSelection() {
        return this.players[this.playerIndex]
    }
    get playerSelectionName() {
        return this.playerSelection.frame.name.split('_')[0]
    }
    get playerIndex() {
        return this._playerIndex
    }
    set playerIndex(index: number) {
        this._playerIndex=index<0 ? 0 : index+1>this.players.length ? this.players.length-1 : index
        this.playerBox?.setPosition(this.playerSelection.x, this.playerSelection.y)
    }

    preload() {
        const centerX = this.cameras.main.worldView.x + this.cameras.main.width / 2
        const titleConfig: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Nova Script',
            fontSize: '24px',
        }
        const textConfig: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Nova Script',
            fontSize: '14px',
        }
        this.add.text(centerX, 25, 'Dungeon Crawler', titleConfig).setOrigin(0.5)
        this.playerBox = this.add.rectangle(centerX + 60, 80, 30, 35, 0x1a1a1a)
        this.players = [
            this.add.image(centerX +  60, 80, 'textures', 'faune_face').setScale(0.5),
            this.add.image(centerX +  95, 80, 'textures', 'fighter_face').setScale(0.5),
            this.add.image(centerX + 130, 80, 'textures', 'mage_face').setScale(0.5),
            this.add.image(centerX + 165, 80, 'textures', 'ranger_face').setScale(0.5),
        ]
        this.players.forEach((item, index)=>{
            item.setInteractive()
            item.on('pointerover', ()=>this.playerIndex=index)
            item.on('pointerup', ()=>this.select())
        })
        const menuIndicators: Phaser.GameObjects.Image[] = [
            this.add.image(centerX - 100, 190, 'textures', 'menu_arrow').setScale(0.5).setFlipX(true),
            this.add.image(centerX + 100, 190, 'textures', 'menu_arrow').setScale(0.5),
        ]
        this.menu = [
            new MenuItem(this, centerX, 175, 'Join Game', textConfig, {nextScene: 'game', menuIndicators}),
            new MenuItem(this, centerX, 200, 'Back to Main Menu', textConfig, {nextScene: 'mainmenu', menuIndicators}),
        ]
        this.menu.forEach((item, index)=>{
            item.on('pointerover', ()=>this.menuIndex=index)
            item.on('pointerup', ()=>this.select())
        })
    }

    deregisterKeys(): void {
        if( this.cursors ) {
            this.input.keyboard.clearCaptures()
            this.input.keyboard.removeAllKeys()
            this.cursors = undefined
        }
    }

    registerKeys() {
        if( !this.cursors ) {
            this.cursors = this.input.keyboard.createCursorKeys()
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).on('up', ()=>this.select())
        }
    }

    create() {
        this.menuIndex=0
        this.playerIndex=0
        this.cameras.main.fadeIn(550, 0, 0, 0)
        document.getElementById('startmultiplayer')!.style.display = 'block'
    }

    private select() {
        const item = this.menuSelection
        if( item.nextScene ) {
            // Clean up listeners
            this.input.keyboard.removeAllKeys()
            this.menu.forEach(item=>item.removeAllListeners())
            // Update configs
            this.config.setString('character', this.playerSelectionName)
            this.config.setNumber('coins', 0)
            this.config.setNumber('hearts', 0)
            this.config.setNumber('world', 1)
            this.config.setNumber('level', 1)
            this.config.setNumber('lives', 3)
            // Fade music (if starting game) and camera
            if( item.nextScene==='game' ) this.musicmgr.fade('music-menu')
            this.cameras.main.fadeOut(1000, 0, 0, 0)
            document.getElementById('startmultiplayer')!.style.display = 'none'
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, ()=>{
                this.scene.start(item.nextScene, {
                    multiplayer: true
                })
            })
        }
    }

    update(t:number, dt:number) {
		super.update(t, dt)
        if( document.activeElement?.tagName==='INPUT' ) this.deregisterKeys()
        else if( !this.cursors) this.registerKeys()
        if( !this.cursors ) return
        if ( Phaser.Input.Keyboard.JustDown(this.cursors.space!) ) {
            this.select()
        } else if ( Phaser.Input.Keyboard.JustDown(this.cursors.up!) ) {
            this.menuIndex--
        } else if ( Phaser.Input.Keyboard.JustDown(this.cursors.down!) ) {
            this.menuIndex++
        } else if ( Phaser.Input.Keyboard.JustDown(this.cursors.left!) ) {
            this.playerIndex--
        } else if ( Phaser.Input.Keyboard.JustDown(this.cursors.right!) ) {
            this.playerIndex++
        }
    }

}