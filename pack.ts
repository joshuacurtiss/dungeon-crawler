import * as fs from 'fs'
import * as path from 'path'
import {packAsync} from 'free-tex-packer-core'
import audiosprite from 'audiosprite'
import ffmpeg from 'fluent-ffmpeg'

interface Img {
    path: string;
    contents: Buffer;
}

function findAudio(dir: string): string[] {
    const exts = ['.mp3', '.ogg', '.flac', '.m4a']
    const files: string[] = []
    fs.readdirSync(dir).forEach(filename=>{
        const fullPath = path.resolve(dir, filename)
        const stat = fs.statSync(fullPath)
        if( stat && stat.isDirectory() ) files.push(...findAudio(fullPath))
        else if( stat && stat.isFile() && exts.includes(path.extname(filename).toLowerCase()) ) files.push(fullPath)
    })
    return files
}

function packAudio(files: string[]) {
    audiosprite(files, {
        output: 'public' + path.sep + 'media' + path.sep + 'sfx',
        export: 'ogg,m4a,mp3',
        gap: 0.1,
    }, (err, result)=>{
        if( err ) {
            console.error(err)
            return
        }
        fs.writeFileSync(path.resolve(__dirname, 'public', 'media', 'sfx.json'), JSON.stringify(result))
    })
}
function convertAudio(files: string[]) {
    files.forEach(fullpath=>{
        const ext = path.extname(fullpath)
        const name = path.basename(fullpath, ext)
        ffmpeg(fullpath)
            .output(path.resolve('public', 'media', name + '.ogg'))
            .on('end', ()=>{
                fs.copyFileSync(fullpath, path.resolve('public', 'media', name + ext))
            })
            .run()
    })
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
        files.forEach(item=>fs.writeFileSync(path.resolve(__dirname, 'public', 'media', item.name), item.buffer))
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

const spriteAudio: string[] = findAudio(path.resolve(__dirname, 'resources', 'audio'))
const musicAudio: string[] = findAudio(path.resolve(__dirname, 'resources', 'music'))

convertAudio(musicAudio)
packAudio(spriteAudio)
packImages(images)