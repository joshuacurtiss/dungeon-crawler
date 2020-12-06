import Phaser from 'phaser'

const audio = {
    'coin': 'audio/coin.mp3',
    'door': 'audio/door.mp3',
    'fireball': 'audio/fireball.mp3',
    'fireball-hit': 'audio/fireball-hit.mp3',
    'impact': 'audio/impact.mp3',
    'melee-1': 'audio/melee-1.mp3',
    'melee-2': 'audio/melee-2.mp3',
    'monster-1': 'audio/monster-1.mp3',
    'monster-2': 'audio/monster-2.mp3',
    'monster-3': 'audio/monster-3.mp3',
    'monster-4': 'audio/monster-4.mp3',
    'monster-5': 'audio/monster-5.mp3',
    'music-game': 'audio/music-game.mp3',
    'ouch-m': 'audio/ouch-m.mp3',
    'ouch-f': 'audio/ouch-f.mp3',
    'rise-3': 'audio/rise-3.mp3',
}

const atlases = {
    // Characters
    'faune': 'characters/faune',
    'knight_m': 'characters/knight_m',
    'wizzard_f': 'characters/wizzard_f',
    'wizzard_m': 'characters/wizzard_m',
    // Enemies
    'big_demon': 'enemies/big_demon',
    'big_zombie': 'enemies/big_zombie',
    'chort': 'enemies/chort',
    'ice_zombie': 'enemies/ice_zombie',
    'imp': 'enemies/imp',
    'lizard_f': 'enemies/lizard_f',
    'lizard_m': 'enemies/lizard_m',
    'masked_orc': 'enemies/masked_orc',
    'necromancer': 'enemies/necromancer',
    'skelet': 'enemies/skelet',
    // Items
    'floor_spikes': 'items/floor_spikes',
    'treasure': 'items/treasure',
}

const images = {
    'flask_big_blue': 'items/flask_big_blue.png',
    'flask_big_green': 'items/flask_big_green.png',
    'flask_big_red': 'items/flask_big_red.png',
    'flask_big_yellow': 'items/flask_big_yellow.png',
    'weapon_anime_sword': 'items/weapon_anime_sword.png',
    'weapon_fireball': 'items/weapon_fireball.png',
    'weapon_golden_sword': 'items/weapon_golden_sword.png',
    'weapon_knife': 'items/weapon_knife.png',
    'weapon_knight_sword': 'items/weapon_knight_sword.png',
    'weapon_lavish_sword': 'items/weapon_lavish_sword.png',
    'weapon_red_gem_sword': 'items/weapon_red_gem_sword.png',
    'weapon_regular_sword': 'items/weapon_regular_sword.png',
    'ui-heart-empty': 'ui/heart_empty.png',
    'ui-heart-full': 'ui/heart_full.png',
    'ui-heart-half': 'ui/heart_half.png',
}

export default class Preloader extends Phaser.Scene {

    constructor() {
        super('preloader')
    }

    preload() {
        this.load.image('tiles', 'tiles/dungeon_tiles_extruded.png')
        this.load.tilemapTiledJSON('dungeon', 'tiles/dungeon-01.json')
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
        this.scene.start('game')
    }
    
}