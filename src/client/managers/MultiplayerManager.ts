import * as Colyseus from 'colyseus.js'
import {characters, Player} from '../characters'
import {Item, ItemList} from '../items'
import {WeaponList} from '../weapons'
import Phaser from 'phaser'
import sceneEvents from '../managers/EventManager'

export const PIXELPRECISION = 5
export const characterKeys = Object.keys(characters)
export class MPUpdateStatus {
    public id: string
    public ts!: number
    private _packet!: unknown[]
    private _packetString!: string
    constructor(id: string, ts: number = 0, packet:unknown[] = []) {
        this.id=id
        this.update(ts, packet)
        return this
    }
    set packet(data: unknown[]) {
        this._packet = data
        this._packetString = JSON.stringify(data)
    }
    get packet(): unknown[] {
        return this._packet
    }
    get packetString(): string {
        return this._packetString
    }
    compare(packet: unknown[]) {
        return JSON.stringify(packet)===this.packetString
    }
    update(ts: number, packet: unknown[]) {
        this.ts = ts
        this.packet = packet
    }
}

export enum MPMessages {
    PositionUpdate,
    RefreshRequest,
    Shoot,
    Use,
}

export class MultiplayerManager {

    private players: Player[] = []
    private room?: Colyseus.Room
    private timer: Phaser.Time.TimerEvent
    private updates: MPUpdateStatus[] = []
    
    public updateInterval: number = 10000

    constructor(
        private scene: Phaser.Scene,
        private items: ItemList,
        private weapons: WeaponList,
        private player: Player,
    ) {
        // TODO: Should be a collider registered for wallsLayer
        sceneEvents.on('shoot', this.sendShootEvent.bind(this))
        sceneEvents.on('use', this.sendUseEvent.bind(this))
        this.updates.push(new MPUpdateStatus(player.id))
        this.timer = this.scene.time.addEvent({
            delay: this.updateInterval,
            callback: this.check,
            loop: true, 
            callbackScope: this,
        });
        return this
    }

    destroy() {
        sceneEvents.off('shoot')
        sceneEvents.off('use')
        this.timer.remove()
        if( this.room ) {
            this.room.leave()
            this.room.removeAllListeners()
        }
    }

	check() {
        const ts: number = this.scene.game.getTime()
        const expired = this.updates.filter(update=>update.ts+this.updateInterval<ts)
		expired.forEach(update=>{
            const idx = this.players.findIndex(player=>player.id===update.id)
			if( idx>=0 ) {
				const player = this.players.splice(idx)[0]
				player.destroy()
			}
		})
		this.updates = this.updates.filter(update=>!expired.includes(update))
    }

    sendPlayerUpdate(t: number = this.scene.game.getTime()) {
        // Don't bother if the room is not instantiated
        if( ! this.room ) return
        // Generate packet
		const packet = [
            this.player.id,
            characterKeys.indexOf(this.player.name),
			Math.floor(this.player.x / PIXELPRECISION) * PIXELPRECISION,
			Math.floor(this.player.y / PIXELPRECISION) * PIXELPRECISION,
			this.player.body.velocity.x,
			this.player.body.velocity.y,
		]
        // Find existing update status object
		const update = this.updates.find(up=>up.id===this.player.id)
		if( ! update ) return
		// If override is on (force submission), or the packet has changed, or the minimum interval has passed, send submission
		if( !update.compare(packet) || t===0 || t-update.ts>this.updateInterval ) {
            update.update(t, packet)
			this.room.send(MPMessages.PositionUpdate, packet)
		}
    }

    sendRefreshRequest() {
        if( this.room ) this.room.send(MPMessages.RefreshRequest)
    }

    sendShootEvent(player: Player) {
        if( this.room && player===this.player ) {
            this.room.send(MPMessages.Shoot, player.id)
        }
    }

    sendUseEvent(item: Item, player: Player) {
        if( this.room && player===this.player) {
            this.room.send(MPMessages.Use, [item.id, player.id])
        }
    }

    join(endpoint: string, roomName: string) {
        const client = new Colyseus.Client(endpoint)
        client.joinOrCreate(roomName).then(room=>{
            this.room=room as Colyseus.Room
            this.room.onMessage(MPMessages.PositionUpdate, this.handlePositionUpdateEvent.bind(this))
            this.room.onMessage(MPMessages.RefreshRequest, this.handleRefreshRequestEvent.bind(this))
            this.room.onMessage(MPMessages.Shoot, this.handleShootEvent.bind(this))
            this.room.onMessage(MPMessages.Use, this.handleUseEvent.bind(this))
            this.sendPlayerUpdate()
            this.sendRefreshRequest()
        })
    }

    handlePositionUpdateEvent(data: unknown[][]) {
        const packet: unknown[] = data.length>1 ? data[1] : []
        const [id, nameIndex, x, y, velx, vely] = packet
        const player = this.players.find(player=>player.id===id)
        // We don't act on our own report
        if( id===this.player.id ) return
        if( player ) {
            // If we found the player, update them
            player.setPosition(x as number, y as number)
            player.walk(velx as number, vely as number)
            const update = this.updates.find(up=>up.id===id)
            if( update ) update.update(this.scene.game.getTime(), packet)
        } else {
            // Otherwise player isn't on the board; create them.
            const name = characterKeys[nameIndex as number]
            const newplayer = new characters[name](this.scene, x, y, this.weapons) as Player
            newplayer.id = id as string
            newplayer.walk(velx as number, vely as number)
            this.players.push(newplayer)
            const ts: number = this.scene.game.getTime()
            this.updates.push(new MPUpdateStatus(newplayer.id, ts))
        }
    }

    handleRefreshRequestEvent() {
        this.sendPlayerUpdate(0)
    }

    handleShootEvent(data: unknown[]) {
        const id = data[1]
        const player = this.players.find(player=>player.id===id)
        if( player ) player.shoot()
    }

    handleUseEvent(data: unknown[][]) {
        const [itemId, playerId] = data[1]
        const player = this.players.find(player=>player.id===playerId) as Player
        let item: Item | undefined
        Object.keys(this.items).forEach(key=>{
            if( item ) return
            const itemGroup = this.items[key] as Phaser.Physics.Arcade.Group | Phaser.Physics.Arcade.StaticGroup
            item = itemGroup.getChildren().find(item=>(item as Item).id===itemId) as Item
        })
        if( player && item ) item.use(player)
    }

}

export default MultiplayerManager