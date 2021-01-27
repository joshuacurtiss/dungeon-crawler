import BigDemon from './BigDemon'
import BigZombie from './BigZombie'
import Chort from './Chort'
import Enemy from './Enemy'
import IceZombie from './IceZombie'
import Imp from './Imp'
import LizardF from './LizardF'
import LizardM from './LizardM'
import MaskedOrc from './MaskedOrc'
import Mushroom from './Mushroom'
import Necromancer from './Necromancer'
import Skelet from './Skelet'

type EnemyNames = 'chort' | 'ice_zombie' | 'imp' | 'lizard_m' | 'lizard_f' | 'masked_orc' | 'mushroom' | 'necromancer' | 'skelet' | 'big_demon' | 'big_zombie'
type EnemyList = Record<EnemyNames, Phaser.Physics.Arcade.Group>

interface EnemyUpdate {
	name: EnemyNames;
	id?: string;
	x: number;
	y: number;
	boss: boolean;
	tiny: boolean;
}

export {
    BigDemon,
    BigZombie,
    Chort,
    Enemy,
    EnemyList,
    EnemyNames,
    EnemyUpdate,
    IceZombie,
    Imp,
    LizardF,
    LizardM,
    MaskedOrc,
    Mushroom,
    Necromancer,
    Skelet,
}
