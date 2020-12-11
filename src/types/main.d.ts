type EnemyNames = 'chort' | 'ice_zombie' | 'imp' | 'lizard_m' | 'lizard_f' | 'masked_orc' | 'mushroom' | 'necromancer' | 'skelet' | 'big_demon' | 'big_zombie'
type EnemyList = Record<EnemyNames, Phaser.Physics.Arcade.Group>

type WeaponNames = 'weapon_fireball' | 'weapon_knife' | 'weapon_knight_sword' | 'weapon_regular_sword'
type WeaponList = Record<WeaponNames, Phaser.Physics.Arcade.Group>
