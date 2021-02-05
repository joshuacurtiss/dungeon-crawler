import * as fs from 'fs'
import * as path from 'path'
import {packAsync} from 'free-tex-packer-core'

interface Img {
    path: string;
    contents: Buffer;
}

function findImages(dir: string): string[] {
    const images: string[] = []
    fs.readdirSync(dir).forEach(filename=>{
        const fullPath = path.resolve(dir, filename)
        const stat = fs.statSync(fullPath)
        if( stat && stat.isDirectory() ) images.push(...findImages(fullPath))
        else if( stat && stat.isFile() && path.extname(filename).toLowerCase()==='.png' ) images.push(fullPath)
    })
    return images
}

async function packImages(images: Img[]) {
    try {
        const files = await packAsync(images, {
            textureName: 'textures',
            padding: 1,
            allowRotation: false,
            detectIdentical: true,
            allowTrim: true,
            removeFileExtension: true,
        })
        files.forEach(item=>fs.writeFileSync(path.resolve(__dirname, 'dist', item.name), item.buffer))
    } catch(error) {
        console.log(error)
    }
}

const images: Img[] = findImages(path.resolve(__dirname, 'resources', 'images')).map(fullPath=>{
    return {
        path: path.basename(fullPath),
        contents: fs.readFileSync(fullPath),
    }
})

const dest = path.resolve(__dirname, 'dist')
if( !fs.existsSync(dest) ) fs.mkdirSync(dest)
packImages(images)