const MOD=256
function strToASCII(str){
    const k=[]
    for(let i=0;i<str.length;i++){
        k.push(str.charCodeAt(i))
    }
    return k
}
function ASCIItoStr(ascii){
    const k=[]
    for(let i=0; i<ascii.length; i+=2){
        k.push(String.fromCharCode(parseInt(ascii.slice(i, i+2),16)))
    }
    return k
}
function KSA(key){
    //Key Scheduling Algorithm
    const S=[...Array(MOD).keys()]
    j=0
    for(let i=0;i<MOD;i++){
        j= (j+S[i]+key[i % key.length]) % MOD
        let temp=S[j]
        S[j]=S[i]
        S[i]=temp 
    }
    return S
}

function* PRGA(S){
    //Psudo Random Generation Algorithm
    let i=0
    let j=0
    while(true){
        i=(i+1)%MOD
        j=(j+S[i])%MOD
        let temp=S[j]
        S[j]=S[i]
        S[i]=temp
        yield S[(S[i]+S[j])%MOD]
    }
}

function getKeyStream(key){
    return PRGA(KSA(key))
}

function encrypt(key, string){
    //key -> encryption key used for encrypting, as hex string
    //string -> array of unicode values/ byte string to encrpyt/decrypt
    string=strToASCII(string)
    const res=[]
    const keystream=getKeyStream(strToASCII(key))
    for(let ucode of string){
        let k=keystream.next().value
        const val=(ucode ^ k).toString(16)
        res.push(val)
    }
    return res
}

function decrypt(key, string){
    //key -> encryption key used for encrypting, as hex string
    //string -> array of unicode values/ byte string to encrpyt/decrypt
    const res=[]
    const keystream=getKeyStream(strToASCII(key))
    string=string.map(e=>parseInt(e, 16))
    for(let ucode of string){
        let k=keystream.next().value
        const val=ucode ^ k
        res.push(String.fromCharCode(val))
    }
    return res
}
