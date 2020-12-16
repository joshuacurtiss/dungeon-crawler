import Phaser from 'phaser'

import Preloader from './scenes/Preloader'
import Game from './scenes/Game'
import GameUI from './scenes/GameUI'
import LoseLife from './scenes/LoseLife'
import MainMenu from './scenes/MainMenu'
import Options from './scenes/Options'
import Pause from './scenes/Pause'
import Start from './scenes/Start'
import WinLevel from './scenes/WinLevel'
import WinGame from './scenes/WinGame'

const ratio = Math.max(window.innerWidth / window.innerHeight, window.innerHeight / window.innerWidth)
const DEFAULT_HEIGHT = 250
const DEFAULT_WIDTH = ratio * DEFAULT_HEIGHT

const debug = location.search.toLowerCase().indexOf('debug')>0

export default new Phaser.Game({
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 },
			debug
		}
	},
	render: {
		pixelArt: true
	},
	scene: [Preloader, MainMenu, Options, Start, Game, Pause, LoseLife, GameUI, WinLevel, WinGame],
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: DEFAULT_WIDTH,
		height: DEFAULT_HEIGHT
	}
})
