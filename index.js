//  Insert pesan
const data={
    key:null,
    pesan:null,
    pesanBinary:null,
    imgData:null
}
const inputPesan=document.querySelector('textarea[name="pesan"]')
const inputKey=document.querySelector('input[name="key"]')
const inputGambar=document.querySelector('input[name="gambar"]')
const hiddenOriginal=document.querySelector('.hidden-original')
const hiddenTransformed=document.querySelector('.hidden-transformed')
const reader=new FileReader()

inputPesan.onchange=()=>{
    data.pesan=inputPesan.value
    data.key && showEncryption()
    data.imgData && showStegano()
}
inputKey.onchange=()=>{
    data.key=inputKey.value
    data.pesan && showEncryption()
    data.imgData && showStegano()
}
inputGambar.onchange=()=>{
    const canvas=document.querySelector('.hidden-original')
    const context=canvas.getContext('2d')
    reader.onload=e=>{
        const img=document.querySelector('.original')
        img.onload=()=>{
        canvas.width=img.naturalWidth
        canvas.height=img.naturalHeight
        context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight)
        data.imgData=context.getImageData(0, 0, img.naturalWidth, img.naturalHeight)
        showStegano()
        }
        img.src=e.target.result
    }
    reader.readAsDataURL(inputGambar.files[0])
}

function showEncryption(){
    const listHex8bit=encrypt(data.key, data.pesan)
    console.log(listHex8bit)
    const secret=[] 
    for(let hex of listHex8bit){
        secret.push(parseInt(hex, 16).toString(2).padStart(8,'0'))
    }
    document.querySelector('.enc>.panel>div:first-child>textarea').value= secret.join(' ')
    data.pesanBinary=secret
}
function showStegano(){
    const img=document.querySelector('.transformed')
    const canvas=document.querySelector('.hidden-transformed')
    const context=canvas.getContext('2d')
    canvas.width=data.imgData.width
    canvas.height=data.imgData.height
    insertMessage()
    context.putImageData(data.imgData, 0, 0)
    img.src=canvas.toDataURL()
    document.querySelector('#download').href=canvas.toDataURL()
}
function insertMessage(infoSpace=16){
    infoSpace%2!==0 && infoSpace++
    const pesanLengthBin=data.pesanBinary.length.toString(2).padStart(infoSpace, '0')
    console.log(infoSpace, pesanLengthBin)
    for(let i=0; i<infoSpace/2; i++){ // bytes yang digunakan untuk menyimpan info adalah infoSpace/2, karena data disisipkan sepanjang 2 bit pada tiap byte
        const channel=data.imgData.data[i]
        data.imgData.data[i]=insertLSB(channel, pesanLengthBin.slice(i*2, (i*2)+2))
    } // untuk menyimpan info panjang pesan ke dalam gambar
    let j=0
    for(let i=infoSpace/2; i<(infoSpace/2) + data.pesanBinary.length*4; i+=4){
        const strBin=data.pesanBinary[j]
        j++
        const red=data.imgData.data[0+i]
        const green=data.imgData.data[1+i]
        const blue=data.imgData.data[2+i]
        const alpha=data.imgData.data[3+i]
        data.imgData.data[0+i]=insertLSB(red, strBin.slice(0,2))
        data.imgData.data[1+i]=insertLSB(green, strBin.slice(2,4))
        data.imgData.data[2+i]=insertLSB(blue, strBin.slice(4,6))
        data.imgData.data[3+i]=insertLSB(alpha, strBin.slice(6,8))
    } // untuk menyimpan pesan ke dalam gambar
}
function insertLSB(int8, int2){
    int2=int2.padStart(2,'0')
    return parseInt(int8.toString(2).padStart(8,'0').slice(0,-2).concat(int2), 2)
}



// Extraksi pesan
const data2={
    key:null,
    imgData:null
}
const inputKeyOld=document.querySelector('[name="valid-key"]')
const inputGambarPesan=document.querySelector('[name="gambar-pesan"]')
const reader2=new FileReader()

inputKeyOld.onchange=()=>{
    data2.key=inputKeyOld.value
    showDecryption()
}
inputGambarPesan.onchange=()=>{
    const canvas=document.querySelector('.hidden-original')
    const context=canvas.getContext('2d')
    reader2.onload=e=>{
        const img=document.querySelector('.gambar-selected')
        img.onload=()=>{
            canvas.width=img.naturalWidth
            canvas.height=img.naturalHeight
            context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight)
            data2.imgData=context.getImageData(0, 0, img.naturalWidth, img.naturalHeight)
            showDecryption()
        }
        img.src=e.target.result
    }
    reader2.readAsDataURL(inputGambarPesan.files[0])
}

function extractMessage(infoSpace=16, key, imgData){
    const pesanBin=[]
    let len=''
    for(let i=0; i<infoSpace/2; i++){
        const temp=imgData.data[i].toString(2).padStart(8,'0')
        len+=temp.slice(-2,temp.length)
    }
    const pesanLength=parseInt(len,2)
    for(let i=infoSpace/2; i<(infoSpace/2) + pesanLength*4; i+=4){
        let char=''
        for(let j=0; j<4; j++){
        const temp=imgData.data[i+j].toString(2).padStart(8, '0')
        char+=temp.slice(-2, temp.length)
        }
        pesanBin.push(char)
    }
    const pesanHex=pesanBin.map(e=>parseInt(e,2).toString(16))
    console.log(key, pesanHex)
    return decrypt(key, pesanHex)
}
function showDecryption(){
    if(data2.key!==null && data2.imgData!==null) document.querySelector('.dec>.panel>div:last-child>textarea').value= extractMessage(16, data2.key, data2.imgData).join('')
}



// 
// 
// 
const encContent=document.querySelector('.content>.enc')
const decContent=document.querySelector('.content>.dec')

document.querySelector('.enc-nav').onclick=()=>{
    encContent.classList.add('active')
    decContent.classList.remove('active')
}
document.querySelector('.dec-nav').onclick=()=>{
    decContent.classList.add('active')
    encContent.classList.remove('active')
}
document.querySelector('#gambar-download').onclick=()=>{
    document.querySelector('#download').click()
}
