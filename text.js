
const fs = require('fs')
const path = require('path')
const util = require('util')
const readline = require('readline')
const {createCanvas} = require('canvas')
const unihan = require('cjk-unihan')

const lookup = util.promisify(unihan.get)
const rl = readline.createInterface({input: process.stdin})
const canvas = createCanvas(64, 64)

rl.on('line', (line) => {
    line.split('').filter((c) => c.trim != '').forEach((c) => generate(c))
})

const convertKHangul = (kHangul) => {
    const JAMO = 'ᄀᄁᄂᄃᄄᄅᄆᄇᄈᄉᄊᄋᄌᄍᄎᄏᄐᄑ하ᅢᅣᅤᅥᅦᅧᅨᅩᅪᅫᅬᅭᅮᅯᅰᅱᅲᅳᅴᅵᆨᆩᆪᆫᆬᆭᆮᆯᆰᆱᆲᆳᆴᆵᆶᆷᆸᆹᆺᆻᆼᆽᆾᆿᇀᇁᇂ'
    const ROMAJA = 'g kk n d tt r m b pp s ss  j jj ch k t p h a ae ya yae eo e yeo ye o wa wae oe yo u wo we wi yu eu ui i k k k n n n t l k l p t t p t m p p t t ng t t k t p h'.split(' ')
    return kHangul.normalize('NFD').split('').map((c) => ROMAJA[JAMO.indexOf(c)]).join('')
}

const generate = (char) => {
    Promise.all([lookup(char, 'kHangul'), lookup(char, 'kDefinition')]).then(([kKorean, kDefinition]) => {
        const ctx = canvas.getContext('2d')
        ctx.font = '60px "Noto Sans CJK KR"'
        ctx.fillStyle = '#d7d8d9'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillText(char, canvas.width / 2, canvas.height / 2 - 4)
        const korean = convertKHangul(kKorean.split(' ')[0].charAt(0))
        const definition = kDefinition.toString().split(/[;,] /)[0]
                .replace(/(the|an?) /g, '').replace(/ /g, '_')
                .trim().toLowerCase()
        fs.writeFileSync(path.join(__dirname, 'out', `${korean}_${definition}.png`), canvas.toBuffer())
    }).catch(console.error)
}
