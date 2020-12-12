import ConfigManager from './ConfigManager'

export default class SoundManager {

    private config: ConfigManager
    private scene: Phaser.Scene

    constructor(scene: Phaser.Scene) {
        this.config = new ConfigManager()
        this.scene = scene
        return this
    }

    public play(key: string, extra?: Phaser.Types.Sound.SoundConfig | Phaser.Types.Sound.SoundMarker | undefined) {
        const isMusic = key.indexOf('music')>=0
        if( isMusic && !this.config.music ) return
        if( !isMusic && !this.config.sfx ) return
        if( this.scene.sound.get(key) ) return
        this.scene.sound.play(key, extra)
    }

    public fade(key: string, duration: number = 800) {
        const snd = this.scene.sound.get(key)
        if( snd ) this.scene.tweens.add({
            targets: snd,
            volume: 0,
            duration,
            onComplete: ()=>this.remove(key)
        })
    }

    public stop(key: string) {
        if( !this.scene.sound.get(key) ) return
        this.scene.sound.stopByKey(key)
    }

    public remove(key: string) {
        if( !this.scene.sound.get(key) ) return
        this.scene.sound.removeByKey(key)
    }

}