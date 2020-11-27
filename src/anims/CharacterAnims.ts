import Phaser from 'phaser'

const createCharacterAnims = (anims: Phaser.Animations.AnimationManager) => {

    anims.create({
        key: 'faune-idle-up', 
        frames: [{key: 'faune', frame: 'walk-up-3.png'}]
    })
    anims.create({
        key: 'faune-idle-down', 
        frames: [{key: 'faune', frame: 'walk-down-3.png'}]
    })
    anims.create({
        key: 'faune-idle-side', 
        frames: [{key: 'faune', frame: 'walk-side-3.png'}]
    })
    anims.create({
        key: 'faune-walk-up',
        frames: anims.generateFrameNames('faune', { start: 1, end: 8, prefix: 'walk-up-', suffix: '.png' }),
        repeat: -1,
        frameRate: 15
    })
    anims.create({
        key: 'faune-walk-down',
        frames: anims.generateFrameNames('faune', { start: 1, end: 8, prefix: 'walk-down-', suffix: '.png' }),
        repeat: -1,
        frameRate: 15
    })
    anims.create({
        key: 'faune-walk-side',
        frames: anims.generateFrameNames('faune', { start: 1, end: 8, prefix: 'walk-side-', suffix: '.png' }),
        repeat: -1,
        frameRate: 15
    })

}

export {
    createCharacterAnims
}