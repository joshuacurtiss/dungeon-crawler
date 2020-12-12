export default class ConfigManager {

    constructor() {
        return this
    }

    get music():boolean {
        return this.getBool('music') || this.notExist('music')
    }
    set music(bool:boolean) {
        this.setBool('music', bool)
    }

    get sfx():boolean {
        return this.getBool('sfx') || this.notExist('sfx')
    }
    set sfx(bool:boolean) {
        this.setBool('sfx', bool)
    }

    private getBool(key:string):boolean {
        return localStorage.getItem(key)==='1'
    }

    private setBool(key:string, bool:boolean) {
        return localStorage.setItem(key, bool ? '1' : '0')
    }

    private notExist(key:string):boolean {
        return localStorage.getItem(key)===null
    }

}