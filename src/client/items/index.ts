import Button from './Button'
import Chest from './Chest'
import Coin from './Coin'
import Crate from './Crate'
import Door from './Door'
import Flask from './Flask'
import Item from './Item'
import Lever from './Lever'
import Spikes from './Spikes'
import Turkey from './Turkey'

type ItemNames = 'button' | 'chest' | 'coin' | 'crate' | 'door' | 'flask' | 'lever' | 'spikes' | 'turkey'
type ItemList = Record<ItemNames, Phaser.Physics.Arcade.Group | Phaser.Physics.Arcade.StaticGroup>

export {
    Button,
    Chest,
    Coin,
    Crate,
    Door,
    Flask,
    Item,
    ItemList,
    ItemNames,
    Lever,
    Spikes,
    Turkey,
}
