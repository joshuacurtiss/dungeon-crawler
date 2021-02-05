export default function createStandardAnims(scene:Phaser.Scene, name:string) {
    if( ! scene.anims.exists(name + '_idle') ) scene.anims.create({
        key: name + '_idle',
        frames: scene.anims.generateFrameNames('textures', {start: 0, end: 3, prefix: name + '_idle_'}),
        repeat: -1,
        frameRate: 8
    })
    if( ! scene.anims.exists(name + '_run') ) scene.anims.create({
        key: name + '_run',
        frames: scene.anims.generateFrameNames('textures', {start: 0, end: 3, prefix: name + '_run_'}),
        repeat: -1,
        frameRate: 8
    })
}