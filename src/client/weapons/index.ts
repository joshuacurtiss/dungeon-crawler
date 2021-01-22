import Fireball from './Fireball'
import Knife from './Knife'
import KnightSword from './KnightSword'
import RegularSword from './RegularSword'
import Weapon from './Weapon'

type WeaponNames = 'weapon_fireball' | 'weapon_knife' | 'weapon_knight_sword' | 'weapon_regular_sword'
type WeaponList = Record<WeaponNames, Phaser.Physics.Arcade.Group>

export {
    Fireball,
    Knife,
    KnightSword,
    RegularSword,
    Weapon,
    WeaponList,
    WeaponNames,
}
