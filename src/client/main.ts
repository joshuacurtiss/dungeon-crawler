import Phaser from 'phaser'

import Preloader from './scenes/Preloader'
import Game from './scenes/Game'
import GameUI from './scenes/GameUI'
import LoseLife from './scenes/LoseLife'
import MainMenu from './scenes/MainMenu'
import Options from './scenes/Options'
import Pause from './scenes/Pause'
import Start from './scenes/Start'
import StartMultiplayer from './scenes/StartMultiplayer'
import WinLevel from './scenes/WinLevel'
import WinGame from './scenes/WinGame'

const ratio = 1.8
const DEFAULT_HEIGHT = 250
const DEFAULT_WIDTH = ratio * DEFAULT_HEIGHT

const debug = location.search.toLowerCase().indexOf('debug')>0
let winResizeTimer

export default new Phaser.Game({
	type: Phaser.AUTO,
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
	scene: [Preloader, MainMenu, Options, Start, StartMultiplayer, Game, Pause, LoseLife, GameUI, WinLevel, WinGame],
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: DEFAULT_WIDTH,
		height: DEFAULT_HEIGHT
	}
})

function initForms() {
	// nothing yet
}

function winResize() {
	// Initialization of HTML elements
	const canvas = document.getElementsByTagName('canvas')[0]
	const h = canvas.clientHeight
	const w = canvas.clientWidth
	const forms = document.getElementsByTagName('form')
	for( const frm of forms ) {
		frm.style.marginTop = canvas.style.marginTop
		frm.style.marginLeft = canvas.style.marginLeft
		frm.style.height = h + 'px'
		frm.style.width = w + 'px'
		frm.querySelectorAll('input').forEach(elem=>{
			elem.style.fontSize = Math.ceil(h*0.03) + 'px'
		})
	}	
}

function handleWinResize() {
	clearTimeout(winResizeTimer)
	winResizeTimer = setTimeout(winResize, 50)
}

window.addEventListener('resize', handleWinResize)
window.addEventListener('load', winResize)
window.addEventListener('load', initForms)