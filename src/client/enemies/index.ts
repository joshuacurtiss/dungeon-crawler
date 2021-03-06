import HomNom from './HomNom'
import Salgie from './Salgie'
import Homsquatch from './Homsquatch'
import Enemy from './Enemy'
import Georgette from './Georgette'
import Georgey from './Georgey'
import IceNugget from './IceNugget'
import Bacon from './Bacon'
import LizardF from './LizardF'
import LizardM from './LizardM'
import ShyGuy from './ShyGuy'
import Mushroom from './Mushroom'
import Creep from './Creep'
import Puggley from './Puggley'
import Skelet from './Skelet'
import Stumpy from './Stumpy'
import Swampy from './Swampy'
import Vart from './Vart'
import Yarg from './Yarg'

type EnemyNames = 'homsquatch' | 'georgette' | 'georgey' | 'ice_nugget' | 'bacon' | 'lizard_m' | 'lizard_f' | 'shy_guy' | 'mushroom' | 'creep' | 'puggley' | 'skelet' | 'stumpy' | 'swampy' | 'vart' | 'yarg' | 'hom_nom' | 'salgie'
type EnemyList = Record<EnemyNames, Phaser.Physics.Arcade.Group>

interface EnemyUpdate {
	name: EnemyNames;
	id?: string;
	x: number;
	y: number;
	boss: boolean;
	tiny: boolean;
}

const createcb = go=>(go as Enemy).setup()

function spawnEnemy(def: EnemyUpdate, group: Phaser.Physics.Arcade.Group): Enemy {
    const {name, id, x, y, boss, tiny} = def
    const enemy = group.get(x, y, name) as Enemy
    if( id ) enemy.id = id
    enemy.isBoss = boss
    if( tiny ) enemy.becomeTiny()
    return enemy
}

function spawnEnemies(scene: Phaser.Scene, defs: EnemyUpdate[]): EnemyList {
    const enemies: EnemyList = {
        'homsquatch': scene.physics.add.group({classType: Homsquatch, createCallback: createcb}),
        'georgette': scene.physics.add.group({classType: Georgette, createCallback: createcb}),
        'georgey': scene.physics.add.group({classType: Georgey, createCallback: createcb}),
        'ice_nugget': scene.physics.add.group({classType: IceNugget, createCallback: createcb}),
        'bacon': scene.physics.add.group({classType: Bacon, createCallback: createcb}),
        'lizard_m': scene.physics.add.group({classType: LizardM, createCallback: createcb}),
        'lizard_f': scene.physics.add.group({classType: LizardF, createCallback: createcb}),
        'shy_guy': scene.physics.add.group({classType: ShyGuy, createCallback: createcb}),
        'mushroom': scene.physics.add.group({classType: Mushroom, createCallback: createcb}),
        'creep': scene.physics.add.group({classType: Creep, createCallback: createcb}),
        'puggley': scene.physics.add.group({classType: Puggley, createCallback: createcb}),
        'skelet': scene.physics.add.group({classType: Skelet, createCallback: createcb}),
        'stumpy': scene.physics.add.group({classType: Stumpy, createCallback: createcb}),
        'swampy': scene.physics.add.group({classType: Swampy, createCallback: createcb}),
        'vart': scene.physics.add.group({classType: Vart, createCallback: createcb}),
        'yarg': scene.physics.add.group({classType: Yarg, createCallback: createcb}),
        'hom_nom': scene.physics.add.group({classType: HomNom, createCallback: createcb}),
        'salgie': scene.physics.add.group({classType: Salgie, createCallback: createcb})
    }
    defs.forEach(def=>{
        const {name} = def
        if( enemies[name] ) spawnEnemy(def, enemies[name])
    })
    return enemies
}

function spawnEnemiesFromMap(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap): EnemyList {
    const defs: EnemyUpdate[] = []
    map.getObjectLayer('Characters').objects
        .filter(obj=>obj.type==='enemy')
        .forEach(obj=>{
            let name = obj.name.toLowerCase()
            const boss = name.substr(0,5)==='boss_'
            const tiny = name.substr(0,5)==='tiny_'
            if( boss || tiny ) name=name.substring(5)
            defs.push({
                name: name as EnemyNames,
                x: obj.x as number,
                y: obj.y as number,
                boss,
                tiny,
            })
        })
    return spawnEnemies(scene, defs)
}

export {
    HomNom,
    Salgie,
    Homsquatch,
    Enemy,
    EnemyList,
    EnemyNames,
    EnemyUpdate,
    Georgette,
    Georgey,
    IceNugget,
    Bacon,
    LizardF,
    LizardM,
    ShyGuy,
    Mushroom,
    Creep,
    Puggley,
    Skelet,
    Stumpy,
    Swampy,
    Vart,
    Yarg,
    spawnEnemies,
    spawnEnemiesFromMap,
    spawnEnemy,
}
