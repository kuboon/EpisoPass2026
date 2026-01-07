//
// crypt.tsのテスト - Deno.test版
//
import { crypt } from '../src/crypt.ts';
import { assertEquals, assertMatch } from "https://deno.land/std@0.208.0/assert/mod.ts";

const randomString = (): string => { // ' '(0x20)から'~'(0x7e)までのランダム文字列生成
    let s = ""
    for(let i=0;i<1000;i++){
	const chars = 0x7f - 0x20
	const code = 0x20 + Math.floor(Math.random() * chars)
	s += String.fromCharCode(code)
    }
    return s
}

const seedSamples = [
    "abcdefghijklmn",
    "ABCDEFG",
    "1234567",
    "3141592653589790".repeat(100),
    "_________________________________",
    "!@#$%^&*()0123456".repeat(100),
    "abcdefg-_".repeat(100),
    "1qaz@WSX3edc$RFV5tgb^YHN"
]

const secretSamples = [
    "秘密の文字列", // 日本語の秘密文字列
    "Very Long Secret String".repeat(100), // 長い秘密文字列
    ""
]

Deno.test('文字置換アルゴリズムcrypt() - 同じ長さに変換される', () => {
    secretSamples.forEach((secret) => {
        seedSamples.forEach((seed) => {
            const crypted = crypt(seed, secret)
            assertEquals(crypted.length, seed.length)
        })
        for(let i=0;i<100;i++){
            const seed = randomString()
            const crypted = crypt(seed, secret)
            assertEquals(crypted.length, seed.length)
        }
    })
});

Deno.test('文字置換アルゴリズムcrypt() - もとの文字列に戻る', () => {
    secretSamples.forEach((secret) => {
        seedSamples.forEach((seed) => {
            const crypted = crypt(seed, secret)
            const crypted2 = crypt(crypted, secret)
            assertEquals(crypted2, seed) // crypt()を2回適用するともとに戻る
        })
        for(let i=0;i<100;i++){
            const seed = randomString()
            const crypted = crypt(seed, secret)
            const crypted2 = crypt(crypted, secret)
            assertEquals(crypted2, seed) // crypt()を2回適用するともとに戻る
        }
    })
});

Deno.test('文字置換アルゴリズムcrypt() - 同じ文字クラスに変換される', () => {
    let seed: string, crypted: string
    secretSamples.forEach((secret) => {
        seed = "lowercasecharacters"
        crypted = crypt(seed, secret)
        assertMatch(crypted, /^[a-z]+$/) // 小文字のシードは小文字に変換される
        seed = "3141592653589000"
        crypted = crypt(seed, secret)
        assertMatch(crypted, /^[0-9]+$/)
    })
})

Deno.test('文字置換アルゴリズムcrypt() - 同じパスワードは生成されない(1)', () => {
    const seed = "abcdefghijkl"
    const passwords: {[key: string]: boolean} = {}
    let collisions = 0
    for(let i=0;i<100000;i++){
        const crypted = crypt(seed, String(i))
        if(passwords[crypted]){
            collisions += 1
            console.log(crypted)
        }
        passwords[crypted] = true
    }
    assertEquals(collisions, 0)
})

Deno.test('文字置換アルゴリズムcrypt() - 同じパスワードは生成されない(2)', () => {
    const seed = "000000000000"
    const passwords: {[key: string]: boolean} = {}
    let collisions = 0
    for(let i=0;i<100000;i++){
        const crypted = crypt(seed, String(i))
        if(passwords[crypted]){
            collisions += 1
            console.log(crypted)
        }
        passwords[crypted] = true
    }
    assertEquals(collisions, 0)
})
