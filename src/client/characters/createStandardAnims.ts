export default function createStandardAnims(scene:Phaser.Scene, name:string) {
    for (const dir of ['up', 'down', 'side']) {
        if( ! scene.anims.exists(name + '_idle_' + dir) ) scene.anims.create({
            key: name + '_idle_' + dir, 
            frames: [{key: 'textures', frame: name + '_' + dir + '_2'}]
        })
        if( ! scene.anims.exists(name + '_walk_' + dir) ) scene.anims.create({
            key: name + '_walk_' + dir,
            frames: scene.anims.generateFrameNames('textures', {start: 1, end: 3, prefix: name + '_' + dir + '_'}),
            repeat: -1,
            yoyo: true,
            frameRate: 8,
        })
    }
}