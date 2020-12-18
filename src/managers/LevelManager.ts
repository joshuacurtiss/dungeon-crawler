const LEVELCOUNT = 6

export default class LevelManager {

    constructor() {
        return this
    }

    get levelCount() {
        return LEVELCOUNT
    }

    levelKey(num:number) {
		return 'dungeon-' + (num<10 ? '0' : '') + num
    }

}