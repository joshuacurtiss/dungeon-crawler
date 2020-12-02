import Phaser from 'phaser'

const createItemAnims = (anims: Phaser.Animations.AnimationManager) => {

    anims.create({
        key: 'chest-open',
        frames: anims.generateFrameNames('treasure', {start: 0, end: 2, prefix: 'chest_empty_open_anim_f', suffix: '.png'}),
        frameRate: 6
    })
    anims.create({
        key: 'chest-closed',
        frames: [{key: 'treasure', frame: 'chest_empty_open_anim_f0.png'}]
    })
    anims.create({
        key: 'coin-spin',
        frames: anims.generateFrameNames('treasure', {start: 0, end: 4, prefix: 'coin_anim_f', suffix: '.png'}),
        frameRate: 4,
        repeat: -1
    })
    anims.create({
        key: 'spikes-spring',
        frames: anims.generateFrameNames('floor_spikes', {start: 0, end: 3, prefix: 'floor_spikes_anim_f', suffix: '.png'}),
        yoyo: true,
        frameRate: 8,
        repeat: -1,
        repeatDelay: 2200
    })

}

export {
    createItemAnims
}