import Phaser from 'phaser'
import WebFont from 'webfontloader'

const audio = {
    'coin': 'audio/coin.mp3',
    'die-f': 'audio/die-f.mp3',
    'die-m': 'audio/die-m.mp3',
    'door-closed': 'audio/door-closed.mp3',
    'door-open': 'audio/door-open.mp3',
    'exciting-end': 'audio/exciting-end.mp3',
    'fireball': 'audio/fireball.mp3',
    'fireball-hit': 'audio/fireball-hit.mp3',
    'health': 'audio/health.mp3',
    'melee-1': 'audio/melee-1.mp3',
    'melee-2': 'audio/melee-2.mp3',
    'melee-hit': 'audio/melee-hit.mp3',
    'monster-1': 'audio/monster-1.mp3',
    'monster-2': 'audio/monster-2.mp3',
    'monster-3': 'audio/monster-3.mp3',
    'monster-4': 'audio/monster-4.mp3',
    'monster-5': 'audio/monster-5.mp3',
    'monster-bug-1': 'audio/monster-bug-1.mp3',
    'monster-bug-2': 'audio/monster-bug-2.mp3',
    'monster-bug-3': 'audio/monster-bug-3.mp3',
    'monster-demon-1': 'audio/monster-demon-1.mp3',
    'monster-demon-2': 'audio/monster-demon-2.mp3',
    'monster-demon-3': 'audio/monster-demon-3.mp3',
    'monster-ice-1': 'audio/monster-ice-1.mp3',
    'monster-ice-2': 'audio/monster-ice-2.mp3',
    'monster-ice-3': 'audio/monster-ice-3.mp3',
    'monster-nec-1': 'audio/monster-nec-1.mp3',
    'monster-nec-2': 'audio/monster-nec-2.mp3',
    'monster-nec-3': 'audio/monster-nec-3.mp3',
    'monster-zombie-1': 'audio/monster-zombie-1.mp3',
    'monster-zombie-2': 'audio/monster-zombie-2.mp3',
    'monster-zombie-3': 'audio/monster-zombie-3.mp3',
    'music-exciting': 'audio/music-exciting.mp3',
    'music-game': 'audio/music-game.mp3',
    'music-lose': 'audio/music-lose.mp3',
    'music-menu': 'audio/music-menu.mp3',
    'music-victory': 'audio/music-victory.mp3',
    'hit-f-1': 'audio/hit-f-1.mp3',
    'hit-f-2': 'audio/hit-f-2.mp3',
    'hit-f-3': 'audio/hit-f-3.mp3',
    'hit-m-1': 'audio/hit-m-1.mp3',
    'hit-m-2': 'audio/hit-m-2.mp3',
    'hit-m-3': 'audio/hit-m-3.mp3',
    'rise-3': 'audio/rise-3.mp3',
}

export default class Preloader extends Phaser.Scene {

    constructor() {
        super('preloader')
    }

    preload() {
        // Progress handlers
        const progressBar = this.add.graphics()
        const progressBox = this.add.graphics()
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        })
        const percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        })
        percentText.setOrigin(0.5, 0.5)
        loadingText.setOrigin(0.5, 0.5)
        progressBox.fillStyle(0x222222, 0.8)
        progressBox.fillRect(width/4-5, height/2-25, width/2+10, 40)
        this.load.on('progress', function (value) {
            percentText.setText(Math.floor(value * 100) + '%');
            progressBar.clear()
            progressBar.fillStyle(0xffffff, 1)
            progressBar.fillRect(width/4, height/2-20, width/2 * value, 30)
        })
        this.load.on('complete', function () {
            loadingText.destroy()
            percentText.destroy()
            progressBar.destroy()
            progressBox.destroy()
        })
        // Tiles
        this.load.image('cave', 'tiles/cave.png')
        this.load.image('dungeon', 'tiles/dungeon_tiles_extruded.png')
        this.load.image('dungeon_tiles', 'tiles/dungeon_tiles_extruded.png')
        this.load.image('ffi', 'tiles/ffi.png')
        this.load.image('ffi_snow', 'tiles/ffi_snow.png')
        this.load.image('forest', 'tiles/forest.png')
        this.load.image('legend_of_faune_tiles', 'tiles/legend_of_faune_tiles.png')
        this.load.image('legend_of_faune_water', 'tiles/legend_of_faune_water.png')
        this.load.image('lava', 'tiles/lava.png')
        this.load.image('overworld', 'tiles/overworld.png')
        this.load.image('roguelike_transparent', 'tiles/roguelike_transparent_extruded.png')
        this.load.tilemapTiledJSON('dungeon-start', 'tiles/start.json')
        // Textures
        this.load.atlas('textures', 'textures.png', 'textures.json')
        // Audio
        Object.keys(audio).forEach(key=>{
            this.load.audio(key, audio[key])
        })
    }

    create() {
        WebFont.load({
            google: {
                families: [ 'Nova Script' ]
            },
            active: ()=>{
                this.scene.start('mainmenu')
            }
        })
    }
    
}