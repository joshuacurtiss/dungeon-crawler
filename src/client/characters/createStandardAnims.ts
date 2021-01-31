export default function createStandardAnims(scene:Phaser.Scene, name:string) {
    for (const dir of ['up', 'down', 'side']) {
        if( ! scene.anims.exists(name + '-idle-' + dir) ) scene.anims.create({
            key: name + '-idle-' + dir, 
            frames: [{key: name, frame: dir + '-2.png'}]
        })
        if( ! scene.anims.exists(name + '-walk-' + dir) ) scene.anims.create({
            key: name + '-walk-' + dir,
            frames: scene.anims.generateFrameNames(name, {start: 1, end: 3, prefix: dir + '-', suffix: '.png'}),
            repeat: -1,
            yoyo: true,
            frameRate: 8,
        })
    }
}