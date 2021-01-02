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

const atlases = {
    // Characters
    'faune': 'characters/faune',
    'fighter': 'characters/fighter',
    'mage': 'characters/mage',
    'ranger': 'characters/ranger',
    // Enemies
    'big_demon': 'enemies/big_demon',
    'big_zombie': 'enemies/big_zombie',
    'chort': 'enemies/chort',
    'ice_zombie': 'enemies/ice_zombie',
    'imp': 'enemies/imp',
    'lizard_f': 'enemies/lizard_f',
    'lizard_m': 'enemies/lizard_m',
    'masked_orc': 'enemies/masked_orc',
    'mushroom': 'enemies/mushroom',
    'necromancer': 'enemies/necromancer',
    'skelet': 'enemies/skelet',
    // Items
    'floor_spikes': 'items/floor_spikes',
    'smoke': 'items/smoke',
    'treasure': 'items/treasure',
}

const images = {
    'button_blue_down': 'items/button_blue_down.png',
    'button_blue_up': 'items/button_blue_up.png',
    'button_red_down': 'items/button_red_down.png',
    'button_red_up': 'items/button_red_up.png',
    'crate': 'items/crate.png',
    'door_closed': 'items/door_closed.png',
    'door_open': 'items/door_open.png',
    'face_faune': 'characters/faune-face.png',
    'face_fighter': 'characters/fighter-face.png',
    'face_mage': 'characters/mage-face.png',
    'face_ranger': 'characters/ranger-face.png',
    'flask_big_blue': 'items/flask_big_blue.png',
    'flask_big_green': 'items/flask_big_green.png',
    'flask_big_red': 'items/flask_big_red.png',
    'flask_big_yellow': 'items/flask_big_yellow.png',
    'lever': 'items/lever.png',
    'turkey': 'items/turkey.png',
    // 'weapon_anime_sword': 'items/weapon_anime_sword.png',
    'weapon_fireball': 'items/weapon_fireball.png',
    // 'weapon_golden_sword': 'items/weapon_golden_sword.png',
    'weapon_knife': 'items/weapon_knife.png',
    'weapon_knight_sword': 'items/weapon_knight_sword.png',
    // 'weapon_lavish_sword': 'items/weapon_lavish_sword.png',
    // 'weapon_red_gem_sword': 'items/weapon_red_gem_sword.png',
    'weapon_regular_sword': 'items/weapon_regular_sword.png',
    'ui-heart-empty': 'ui/heart_empty.png',
    'ui-heart-full': 'ui/heart_full.png',
    'ui-heart-half': 'ui/heart_half.png',
    'ui-menu-left': 'ui/menu-left-lit.png',
    'ui-menu-right': 'ui/menu-right-lit.png',
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
        this.load.image('dungeon', 'tiles/dungeon_tiles_extruded.png')
        this.load.image('dungeon_tiles', 'tiles/dungeon_tiles_extruded.png')
        this.load.image('forest', 'tiles/forest.png')
        this.load.image('lava', 'tiles/lava.png')
        this.load.image('roguelike_transparent', 'tiles/roguelike_transparent_extruded.png')
        this.load.tilemapTiledJSON('dungeon-start', 'tiles/start.json')
        // Atlases
        Object.keys(atlases).forEach(key=>{
            this.load.atlas(key, atlases[key] + '.png', atlases[key] + '.json')
        })
        // Image
        Object.keys(images).forEach(key=>{
            this.load.image(key, images[key])
        })
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