const Rijndael = require('rijndael-js');

function bin2hex(b) {
  return b.match(/.{4}/g).reduce(function(acc, i) {
      return acc + parseInt(i, 2).toString(16);
  }, '')
}

const binaryKey = "11000110000100001011111011000101111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011"
const key = Buffer.from(bin2hex(binaryKey), 'hex')
const cipher = new Rijndael(key, 'cbc')
const message = "Transfer fifty thousand dollars from my bank account to Jane Doe"
const iv = Buffer.from('67c720b72a53b4bf9733732fad997119', 'hex')
console.log(`Encrypting message: ${message}`)
const ciphertext = Buffer.from(cipher.encrypt(message, 128, iv))
console.log(`Encrypted message: ${ciphertext.toString("hex")}`)
const plaintext = Buffer.from(cipher.decrypt(ciphertext, 128, iv));
console.log(`Testing Decryption: ${plaintext.toString()}`) 