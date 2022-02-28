const fs = require("fs")
const express = require("express");
const port = 3000;
const cluster = require("cluster");
const totalCPUs = require("os").cpus().length;
const Rijndael = require('rijndael-js');
const part_left_key = "11000110"
const part_right_key = "11000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011"
const iv = Buffer.from('E898EF8E91F8C9B201E6E29DF87EE152', 'hex')
const ciphertext = "14B8D1412766A8520BACE4598F8AFAEE7E687A49015FA6F1B914635325A6361B8AD191394EF79CEC4B5A256313632CD48BB4D49F3FA7A917CDF02ECCAA8C4765".match(/.{1,32}/g)
const c1 = Buffer.from(ciphertext[0], 'hex')
const c2 = Buffer.from(ciphertext[1], 'hex')
const c3 = Buffer.from(ciphertext[2], 'hex')
const c4 = Buffer.from(ciphertext[3], 'hex')
function bin2hex(b) {
  return b.match(/.{4}/g).reduce(function(acc, i) {
      return acc + parseInt(i, 2).toString(16);
  }, '')
}

function isValidText(val) {
  for (let i = 0; i < val.length; i++) {
    if (val.toString().charCodeAt(i) >= 127 || val.toString().charCodeAt(i) < 32) {
      return false
    }
  }
  return true
}

function generateStates(n){
  console.time('stuff')
  const maxDecimal = parseInt("1".repeat(n),2);
  let count = 0
  for(let i = 0; i <= maxDecimal; i++){
      const binary = i.toString(2).padStart(n,'0')
      const hex = bin2hex(part_left_key + binary + part_right_key)
      const key = Buffer.from(hex, 'hex')
      const cipher = new Rijndael(key, 'cbc')
      const plaintext1 = Buffer.from(cipher.decrypt(c1, 128, iv))
      if (isValidText(plaintext1)) {
        const plaintext2 = Buffer.from(cipher.decrypt(c2, 128, c1))
        if (isValidText(plaintext2)) {
          const plaintext3 = Buffer.from(cipher.decrypt(c3, 128, c2))
          if (isValidText(plaintext3)) {
            const plaintext4 = Buffer.from(cipher.decrypt(c4, 128, c3))
            if (isValidText(plaintext4)) {
              const plain = plaintext1.toString() + plaintext2.toString() + plaintext3.toString() + plaintext4.toString()
              fs.appendFileSync('output.txt', `text: ${plain} key: ${binary}\n`, err => {
                if (err) {
                  console.error(err)
                  return
                }
              })
            }
          }
        }
      }
      count++
      console.log(count)
  }
  console.log(`process completed took: ${console.timeEnd('stuff')}`)
}


if (cluster.isMaster) {
  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }
 
  cluster.on("exit", (worker, code, signal) => {
    cluster.fork();
  });
} else {
  const app = express();
  app.get("/", (req, res) => {
    res.send("Hello World!");
    console.log(generateStates(25))
  });
 
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });

}