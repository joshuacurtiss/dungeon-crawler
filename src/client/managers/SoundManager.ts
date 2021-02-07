import ConfigManager from './ConfigManager'

export default class SoundManager {

    private config = new ConfigManager()

    constructor(private scene: Phaser.Scene, private key?: string) {}

    public play(name: string, extra?: Phaser.Types.Sound.SoundConfig | undefined) {
        if( this.key?.length && !this.config.getBoolean(this.key) ) return
        if( name.indexOf('music')>=0 && !this.config.getBoolean('music') ) return
        const snd = this.scene.sound.get(name)
        if( snd && snd.isPlaying ) snd.play()
        else if( this.key ) this.scene.sound.playAudioSprite(this.key, name, extra)
        else this.scene.sound.play(name, extra)
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

    public preload() {
        const music = {
            'music-exciting': 'media/music-exciting.mp3',
            'music-lose': 'media/music-lose.mp3',
            'music-victory': 'media/music-victory.mp3',
        }
        Object.keys(music).forEach(key=>{
            this.scene.load.audio(key, music[key])
        })
    }

}