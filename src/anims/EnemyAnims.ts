import Phaser from 'phaser'

const createEnemyAnims = (anims: Phaser.Animations.AnimationManager) => {

    anims.create({
        key: 'big_demon-idle',
        frames: anims.generateFrameNames('big_demon', {start: 0, end: 3, prefix: 'big_demon_idle_anim_f', suffix: '.png'}),
        repeat: -1,
        frameRate: 8
    })
    anims.create({
        key: 'big_demon-run',
        frames: anims.generateFrameNames('big_demon', {start: 0, end: 3, prefix: 'big_demon_run_anim_f', suffix: '.png'}),
        repeat: -1,
        frameRate: 8
    })
    anims.create({
        key: 'big_zombie-idle',
        frames: anims.generateFrameNames('big_zombie', {start: 0, end: 3, prefix: 'big_zombie_idle_anim_f', suffix: '.png'}),
        repeat: -1,
        frameRate: 8
    })
    anims.create({
        key: 'big_zombie-run',
        frames: anims.generateFrameNames('big_zombie', {start: 0, end: 3, prefix: 'big_zombie_run_anim_f', suffix: '.png'}),
        repeat: -1,
        frameRate: 8
    })
    anims.create({
        key: 'lizard-idle',
        frames: anims.generateFrameNames('lizard', {start: 0, end: 3, prefix: 'lizard_m_idle_anim_f', suffix: '.png'}),
        repeat: -1,
        frameRate: 8
    })
    anims.create({
        key: 'lizard-run',
        frames: anims.generateFrameNames('lizard', {start: 0, end: 3, prefix: 'lizard_m_run_anim_f', suffix: '.png'}),
        repeat: -1,
        frameRate: 8
    })

}

export {
    createEnemyAnims
}