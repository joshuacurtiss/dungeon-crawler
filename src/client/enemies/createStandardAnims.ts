export default function createStandardAnims(scene:Phaser.Scene, name:string) {
    if( ! scene.anims.exists(name + '_idle') ) scene.anims.create({
        key: name + '_idle',
        frames: scene.anims.generateFrameNames(name, {start: 0, end: 3, prefix: name + '_idle_anim_f', suffix: '.png'}),
        repeat: -1,
        frameRate: 8
    })
    if( ! scene.anims.exists(name + '_run') ) scene.anims.create({
        key: name + '_run',
        frames: scene.anims.generateFrameNames(name, {start: 0, end: 3, prefix: name + '_run_anim_f', suffix: '.png'}),
        repeat: -1,
        frameRate: 8
    })
}