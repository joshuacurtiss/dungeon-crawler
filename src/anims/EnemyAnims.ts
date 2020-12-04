import Phaser from 'phaser'

const enemyKeys = [
    'big_demon',
    'big_zombie',
    'chort',
    'ice_zombie',
    'imp',
    'lizard_f',
    'lizard_m',
    'masked_orc',
    'necromancer',
    'skelet',
]

const createEnemyAnims = (anims: Phaser.Animations.AnimationManager) => {

    enemyKeys.forEach(key=>{
        anims.create({
            key: key + '_idle',
            frames: anims.generateFrameNames(key, {start: 0, end: 3, prefix: key + '_idle_anim_f', suffix: '.png'}),
            repeat: -1,
            frameRate: 8
        })
        anims.create({
            key: key + '_run',
            frames: anims.generateFrameNames(key, {start: 0, end: 3, prefix: key + '_run_anim_f', suffix: '.png'}),
            repeat: -1,
            frameRate: 8
        })
    })

}

export {
    createEnemyAnims
}