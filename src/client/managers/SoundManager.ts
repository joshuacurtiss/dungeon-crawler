import ConfigManager from './ConfigManager'

export default class SoundManager {

    public static readonly Library = {
        GeneralMusic: ['music-exciting', 'music-lose', 'music-victory'],
        SoundEffects: 'sfx',
        StartMusic: 'music-menu',
        WinMusic: 'music-win',
        WorldMusic: ['music-1', 'music-2'],
    }

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

    public preload(keys: string | string[]) {
        const items = Array.isArray(keys) ? keys : [keys]
        items.forEach(key=>{
            this.scene.load.audio(key, [`media/${key}.ogg`, `media/${key}.mp3`])
        })
    }

    public preloadSprite(keys: string | string[]) {
        const items = Array.isArray(keys) ? keys : [keys]
        items.forEach(key=>{
            this.scene.load.audioSprite(key, `media/${key}.json`, [`media/${key}.ogg`, `media/${key}.m4a`, `media/${key}.mp3`])
        })
    }

}