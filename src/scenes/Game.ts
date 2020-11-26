import Phaser from 'phaser'

export default class Game extends Phaser.Scene
{
	constructor()
	{
		super('game')
	}

	preload()
	{
		console.log("Preload.")
    }

	create() 
	{
		console.log("Create.")
		const map = this.make.tilemap({key: 'dungeon'})
		const tileset = map.addTilesetImage('dungeon', 'tiles')
		map.createStaticLayer('Ground', tileset)
		const wallsLayer = map.createStaticLayer('Walls', tileset)
		wallsLayer.setCollisionByProperty({collides: true})
		const debugGraphics = this.add.graphics().setAlpha(0.7)
		wallsLayer.renderDebug(debugGraphics, {
			tileColor: null,
			collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
			faceColor: new Phaser.Display.Color(40, 39, 37, 255)
		})
    }
}
