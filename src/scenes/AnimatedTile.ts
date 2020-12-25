import Phaser from 'phaser'

type TilesetTileData = {[key: number]: { animation?: TileAnimationData }};
type TileAnimationData = Array<{ duration: number, tileid: number }>;

export class AnimatedTile {
  
    private tile: Phaser.Tilemaps.Tile;
    private tileAnimationData: TileAnimationData;
    private firstgid: number; 
    private elapsedTime: number;
    private animationDuration: number;

    constructor(tile: Phaser.Tilemaps.Tile, tileAnimationData: TileAnimationData, firstgid: number) {
        this.tile = tile;
        this.tileAnimationData = tileAnimationData;
        this.firstgid = firstgid;
        this.elapsedTime = 0;
        this.animationDuration = tileAnimationData[0].duration * tileAnimationData.length;
    }

    public update(delta: number): void {
        this.elapsedTime += delta;
        this.elapsedTime %= this.animationDuration;
        const animatonFrameIndex = Math.floor(this.elapsedTime / this.tileAnimationData[0].duration);
        this.tile.index = this.tileAnimationData[animatonFrameIndex].tileid + this.firstgid;
    }

}

export function createAnimatedTiles(map: Phaser.Tilemaps.Tilemap): AnimatedTile[] {
    const animatedTiles: AnimatedTile[] = []
    map.tilesets.forEach(tileset=>{
        const tileData = tileset.tileData as TilesetTileData;
        for( const tileidStr in tileData ) {
            const tileid = parseInt(tileidStr)
            map.layers.forEach(layer=>{
                if (layer.tilemapLayer.type === "StaticTilemapLayer") return
                layer.tilemapLayer.layer.data.forEach(tileRow=>{
                    tileRow.forEach(tile=>{
                        if( tile.index<0 ) return
                        if (tile.index - tileset.firstgid === tileid) {
                            animatedTiles.push(new AnimatedTile(
                                tile,
                                tileData[tileid].animation!,
                                tileset.firstgid
                            ))
                        }
                    })
                })
            })
        }
    })
    return animatedTiles
}

export function updateAnimatedTiles(animatedTiles:AnimatedTile[], dt:number) {
    animatedTiles.forEach(tile => tile.update(dt))
}