export default class ConfigManager {

    constructor() {
        return this
    }

    public getNumber(key:string, defaultVal=0):number {
        const val=localStorage.getItem(key)
        if( val===null ) return defaultVal
        return Number(val)
    }

    public setNumber(key:string, val:number) {
        localStorage.setItem(key, val.toString())
    }

    public getBoolean(key:string, defaultVal=true):boolean {
        const bool=localStorage.getItem(key)
        if( bool===null ) return defaultVal
        return bool==='1'
    }

    public setBoolean(key:string, bool:boolean) {
        localStorage.setItem(key, bool ? '1' : '0')
    }

}