import Phaser from 'phaser'

type options = {
    key?:string, 
    nextScene?:string, 
    menuIndicators:Phaser.GameObjects.Image[]
}
export default class MenuItem extends Phaser.GameObjects.Text {
    
    public key?: string
    public nextScene?: string
    private menuIndicators: Phaser.GameObjects.Image[]
    private _chk: boolean = false
    private _num: number = 0
    private _selected: boolean = false
    
    constructor(scene:Phaser.Scene, x:number, y:number, text:string | Array<string>, style:Phaser.Types.GameObjects.Text.TextStyle, opts:options) {
        super(scene, x, y, text, style)
        this.scene.add.existing(this)
        this.key=opts.key
        this.nextScene=opts.nextScene
        this.menuIndicators=opts.menuIndicators
        this.setOrigin(0.5).setScrollFactor(0, 0).setInteractive()
    }

    get chk() {
        return this._chk
    }
    set chk(bool:boolean) {
        this._chk = bool
        const text = this.text.slice(0, this.text.indexOf(':'))
        this.text = `${text}: ${this.chk ? 'On' : 'Off'}`
    }

    get num() {
        return this._num
    }
    set num(num:number) {
        this._num = num
        const text = this.text.slice(0, this.text.indexOf(':'))
        this.text = `${text}: ${this.num}`
    }

    get selected() {
        return this._selected
    }
    set selected(bool:boolean) {
        this._selected=bool
        this.setTint(bool ? 0xebeb00 : 0xffffff)
        if( bool ) this.menuIndicators.forEach(img=>img.setY(this.y))
    }

}