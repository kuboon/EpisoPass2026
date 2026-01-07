//
// crypt.ts - EpisoPassでの文字置換
//
// Toshiyuki Masui @ Pitecan.com
// Last Modified: 2019/12/27
// Converted to TypeScript: 2026/01/07
//

import { MD5_hexhash } from './md5.ts';

// 文字種ごとに置換を行なうためのテーブル
const origcharset = [
  'abcdefghijklmnopqrstuvwxyz',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '0123456789',
  '-',
  '~!@#$%^&*()_=+[{]}|;:.,?',
  ' ',
  "\"'/<>\\`"
];

const hexcharset = [
  "0123456789abcdef"
];

let charset = origcharset;

function charkind(c: string): number | null {
  let ind: number | null = null;
  for (let i = 0; i < charset.length; i++) {
    if (charset[i].indexOf(c) >= 0) {
      ind = i;
    }
  }
  return ind;
}

// crypt_char(crypt_char(c,n),n) == c になるような文字置換関数
function crypt_char(c: string, n: number): string {
  const kind = charkind(c);
  const chars = charset[kind as number];
  const cind = chars.indexOf(c);
  const len = chars.length;
  const ind = (n - cind + len) % len;
  return chars[ind];
}

//
// UTF8文字列をバイト文字列(?)に変換
// (MD5_hexhashがUTF8データをうまく扱えないため)
//
function utf2bytestr(text: string): string {
  let result = "";
  if (text == null) return result;
  
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c <= 0x7f) {
      result += String.fromCharCode(c);
    } else {
      if (c <= 0x07ff) {
        result += String.fromCharCode(((c >> 6) & 0x1F) | 0xC0);
        result += String.fromCharCode((c & 0x3F) | 0x80);
      } else {
        result += String.fromCharCode(((c >> 12) & 0x0F) | 0xE0);
        result += String.fromCharCode(((c >> 6) & 0x3F) | 0x80);
        result += String.fromCharCode((c & 0x3F) | 0x80);
      }
    }
  }
  return result;
}

//
// secret_stringとcharset[]にもとづいてseedを暗号的に変換する
// crypt(crypt(s,data),data) == s になる
//
export function crypt(seed: string, secret_string: string): string {
  // ハッシュ値ぽいときHex文字だけ使うことにする。ちょっと心配だが...
  // Hex文字が32文字以上で、数字と英字が入ってればまぁハッシュ値と思って良いのではないか...
  if (seed.match(/[0-9a-f]{32}/) && seed.match(/[a-f]/) && seed.match(/[0-9]/)) {
    charset = hexcharset;
  } else {
    charset = origcharset;
  }
  
  // secret_stringのMD5の32バイト値の一部を取り出して数値化し、
  // その値にもとづいて文字置換を行なう
  let hash = MD5_hexhash(utf2bytestr(secret_string));
  let res = '';
  
  for (let i = 0; i < seed.length; i++) {
    const j = i % 8;

    if (j == 0 && i > 0) { // 1ビットシフト
      hash = hash[31] + hash.substr(0, 31);
    }

    const s = hash.substring(j * 4, j * 4 + 4);
    const n = parseInt(s, 16);
    res += crypt_char(seed[i], n + i);
  }
  
  return res;
}
