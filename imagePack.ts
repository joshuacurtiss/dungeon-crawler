import * as fs from 'fs'
import { packAsync } from 'free-tex-packer-core'
 
const images = [
    {path: "weapon_fireball.png", contents: fs.readFileSync("./public/items/weapon_fireball.png")},
    {path: "weapon_knife.png", contents: fs.readFileSync("./public/items/weapon_knife.png")},
    {path: "weapon_regular_sword.png", contents: fs.readFileSync("./public/items/weapon_regular_sword.png")},
]
 
async function packImages() {
    try {
        const files = await packAsync(images)
        files.forEach(item=>{
            console.log(item.name)
            fs.writeFileSync('./public/' + item.name, item.buffer)
        })
    } catch(error) {
        console.log(error)
    }
}

packImages()