const LEVELCOUNT = [6, 3]
const WORLDCOUNT = 2

export type Level = {
    world: number
    level: number
}

export class LevelManager {

    constructor() {
        return this
    }

    get worldCount() {
        return WORLDCOUNT
    }

    inc(lev:Level):Level {
        let {world, level} = lev
        if( ++level > this.levelCount(world) ) {
            world++
            level=1
        }
        if( world>this.worldCount ) world=1
        return {world, level}
    }

    levelCount(world:number) {
        return LEVELCOUNT[world-1] ?? 0
    }

    levelKey(lev:Level) {
		return 'campaign-' + lev.world + '-' + (lev.level<10 ? '0' : '') + lev.level
    }

    won(lev:Level) {
        return lev.world>=this.worldCount && lev.level>=this.levelCount(lev.world)
    }

}

export default LevelManager