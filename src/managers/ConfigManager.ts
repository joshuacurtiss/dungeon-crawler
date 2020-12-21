export default class ConfigManager {

    constructor() {
        return this
    }

    public getString(key:string, defaultVal=''):string {
        return localStorage.getItem(key) ?? defaultVal
    }

    public setString(key:string, val:string) {
        localStorage.setItem(key, val)
    }

    public getNumber(key:string, defaultVal=0):number {
        const val=localStorage.getItem(key)
        if( val===null ) return defaultVal
        return Number(val)
    }

    public setNumber(key:string, val:number) {
        localStorage.setItem(key, val.toString())
    }

    public dec(key:string) {
        const val = this.getNumber(key)
        this.setNumber(key, val-1)
    }

    public inc(key:string) {
        const val = this.getNumber(key)
        this.setNumber(key, val+1)
    }

    public getBoolean(key:string, defaultVal=true):boolean {
        const bool=localStorage.getItem(key)
        if( bool===null ) return defaultVal
        return bool==='1'
    }

    public setBoolean(key:string, bool:boolean) {
        localStorage.setItem(key, bool ? '1' : '0')
    }

    public toggle(key:string) {
        const val = this.getBoolean(key)
        this.setBoolean(key, !val)
    }

}