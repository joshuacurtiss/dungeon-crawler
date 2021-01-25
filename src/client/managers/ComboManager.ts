import Phaser from 'phaser'
import {Enemy, EnemyList} from '../enemies'
import {Player} from '../characters'

export interface Combo {
    code: string;
    function: (()=>void) | ((code:string)=>void);
    thisArg?: any;
}

export class ComboManager {

    public collection: Combo[] = [
        {code: 'GONE', function: this.comboGone, thisArg: this},
        {code: 'GIANT', function: this.comboTinyGiant, thisArg: this},
        {code: 'TINY', function: this.comboTinyGiant, thisArg: this},
        {code: 'HEART', function: this.comboHeart, thisArg: this},
    ]
    public config: Phaser.Types.Input.Keyboard.KeyComboConfig = {
        maxKeyDelay: 5000,
        resetOnMatch: true,
        resetOnWrongKey: true,
    }

    constructor(
        private keyboard: Phaser.Input.Keyboard.KeyboardPlugin,
        private enemies: EnemyList,
        private player: Player,
    ) { }

    get allEnemies() {
		return this.enemies ? Object.keys(this.enemies).map(key=>this.enemies![key]) : []
    }

    activate() {
        this.collection.forEach((combo: Combo)=>{
            this.keyboard.createCombo(combo.code, this.config)
        })
        this.keyboard.on('keycombomatch', this.handleKeyCombo, this)
    }

	private handleKeyCombo(combo:Phaser.Input.Keyboard.KeyCombo) {
		const code = combo.keyCodes.map(charcode=>String.fromCharCode(charcode)).join('')
        const comboDef = this.collection.find((obj:Combo)=>obj.code===code)
        if( comboDef ) comboDef.function.bind(comboDef.thisArg)(code)
    }
    
    private comboGone() {
        console.log('Baddies be gone!')
        this.allEnemies.forEach((group: Phaser.Physics.Arcade.Group)=>{
            group.children.entries.forEach((enemy, i)=>{
                setTimeout(()=>{enemy.destroy()}, i * 200)
            })
        })
    }

    private comboHeart() {
        console.log("Be healed!")
        this.player.health++
    }

    private comboTinyGiant(code: string) {
        console.log(`Baddies be ${code}!`)
        this.allEnemies.forEach((group: Phaser.Physics.Arcade.Group)=>{
            group.children.entries.forEach(obj=>{
                const enemy = obj as Enemy
                if( code==='TINY' ) enemy.becomeTiny()
                else enemy.becomeGiant()
            })
        })
    }

}

export default ComboManager