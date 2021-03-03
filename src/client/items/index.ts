import Button from './Button'
import Chest from './Chest'
import Coin from './Coin'
import Crate from './Crate'
import Destination from './Destination'
import Door from './Door'
import Entrance from './Entrance'
import Flask from './Flask'
import Item from './Item'
import Lever from './Lever'
import Player from '../characters/Player'
import Spikes from './Spikes'
import Turkey from './Turkey'

type ItemNames = 'button' | 'chest' | 'coin' | 'crate' | 'destination' | 'door' | 'entrance' | 'flask' | 'lever' | 'spikes' | 'turkey'
type ItemList = Record<ItemNames, Phaser.Physics.Arcade.Group | Phaser.Physics.Arcade.StaticGroup>

interface ItemUpdate {
    name: ItemNames;
    id?: string;
    type: string;
    x: number;
    y: number;
}

const createcb = go=>(go as Button|Crate).setup()

function spawnItem(def: ItemUpdate, group:Phaser.Physics.Arcade.Group | Phaser.Physics.Arcade.StaticGroup): Item | undefined {
    const {name, id, type, x, y} = def
    // Instantiate items
    const item = group.get(x, y, name, type) as Item
    // If nothing matched, just return now
    if( ! item ) return
    // Assign id and name, if provided
    if( id ) item.id = id
    if( name ) item.name = name
    return item
}

function spawnItems(scene: Phaser.Scene, defs: ItemUpdate[], player: Player): ItemList {
    const doorCreateCallback = go=>(go as Door).setup(player)
    const entranceCreateCallback = go=>(go as Entrance).setup(items.destination as Phaser.Physics.Arcade.StaticGroup)
    const items: ItemList = {
        'button': scene.physics.add.staticGroup({ classType: Button, createCallback: createcb }),
        'chest': scene.physics.add.staticGroup({ classType: Chest }),
        'coin': scene.physics.add.group({ classType: Coin }),
        'crate': scene.physics.add.group({ classType: Crate, createCallback: createcb }),
        'destination': scene.physics.add.staticGroup({ classType: Destination }),
        'door': scene.physics.add.staticGroup({ classType: Door, createCallback: doorCreateCallback }),
        'entrance': scene.physics.add.staticGroup({ classType: Entrance, createCallback: entranceCreateCallback }),
        'flask': scene.physics.add.staticGroup({ classType: Flask }),
        'lever': scene.physics.add.staticGroup({ classType: Lever }),
        'spikes': scene.physics.add.staticGroup({ classType: Spikes }),
        'turkey': scene.physics.add.staticGroup({ classType: Turkey }),
    }
    defs.forEach(def=>{
        const {type} = def
        const [basetype] = type.split('_')
        if( items[basetype] ) spawnItem(def, items[basetype])
    })
    return items
}

function spawnItemsFromMap(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, player: Player): ItemList {
    const mapObjects = map.getObjectLayer('Items')?.objects
    const items: ItemUpdate[] = mapObjects.map((obj: any)=>{
        // Fix old tile types to match the ItemNames spec
        obj.type = obj.type.replace('floor_spikes', 'spikes')
        obj.type = obj.type.replace('poison', 'flask_red')
        obj.type = obj.type.replace('potion', 'flask_blue')
        return obj as ItemUpdate
    })
    return spawnItems(scene, items, player)
}

export {
    Button,
    Chest,
    Coin,
    Crate,
    Destination,
    Door,
    Entrance,
    Flask,
    Item,
    ItemList,
    ItemNames,
    ItemUpdate,
    Lever,
    Spikes,
    Turkey,
    spawnItem,
    spawnItems,
    spawnItemsFromMap,
}
