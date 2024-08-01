const crypto = require('crypto')
const fs = require('fs')
https = require('https')
;```
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/hmac-sha256.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/enc-base64.min.js"></script>
```
class Translate {
  constructor() {
    this.appid = '杈撳叆浣犵殑APPID'
    this.seckey = '杈撳叆浣犵殑瀵嗛挜锛岀鐞嗘帶鍒跺彴鏌ョ湅'
  }

  async createQuoteJob(from, to, format, fileName, filePath) {
    const url = '/transapi/doctrans/createjob/quote'
    const content = fs.readFileSync(filePath, 'utf8')
    const input = {
      from,
      to,
      input: {
        content: Buffer.from(content).toString('base64'),
        format,
        filename: fileName
      }
    }
    const timestamp = Math.floor(Date.now() / 1000)
    const sign = this.createSign(timestamp, input)
    const headers = this.createHeader(timestamp, sign)
    return await this.curlExec(input, headers, url)
  }

  async queryQuote(fileId) {
    const url = '/transapi/doctrans/query/quote'
    const input = {
      fileId
    }
    const timestamp = Math.floor(Date.now() / 1000)
    const sign = this.createSign(timestamp, input)
    const headers = this.createHeader(timestamp, sign)
    return await this.curlExec(input, headers, url)
  }

  async createTransJob(from, to, format, fileName, filePath, output = '') {
    const url = '/transapi/doctrans/createjob/trans'
    const content = fs.readFileSync(filePath, 'utf8')
    const input = {
      from,
      to,
      input: {
        content: Buffer.from(content).toString('base64'),
        format,
        filename: fileName
      },
      output: {
        format: output
      }
    }
    const timestamp = Math.floor(Date.now() / 1000)
    const sign = this.createSign(timestamp, input)
    const headers = this.createHeader(timestamp, sign)
    return await this.curlExec(input, headers, url)
  }

  async queryTrans(requestId) {
    const url = '/transapi/doctrans/query/quote'
    const input = {
      requestId
    }
    const timestamp = Math.floor(Date.now() / 1000)
    const sign = this.createSign(timestamp, input)
    const headers = this.createHeader(timestamp, sign)
    return await this.curlExec(input, headers, url)
  }

  createSign(timestamp, input) {
    const str = `${this.appid}${timestamp}${JSON.stringify(input)}`
    return crypto.createHmac('sha256', this.seckey).update(str).digest('base64')
  }

  createHeader(timestamp, sign) {
    return {
      'Content-Type': 'application/json',
      'X-Appid': this.appid,
      'X-Sign': sign,
      'X-Timestamp': timestamp
    }
  }

  async curlExec(data, headers, url) {
    try {
      var options = {
        hostname: 'fanyi-api.baidu.com',
        port: 443,
        path: url,
        method: 'POST',
        headers: headers
      }
      var req = https.request(options, function (res) {
        console.log('Status: ' + res.statusCode)
        console.log('Headers: ' + JSON.stringify(res.headers))
        res.setEncoding('utf8')
        res.on('data', function (body) {
          console.log('Body: ' + body)
        })
      })
      req.on('error', function (e) {
        console.log('problem with request: ' + e.message)
      })

      input = JSON.stringify(data)
      req.write(input)
      req.end()
    } catch (error) {
      console.error(error)
    }
  }
}

;(async () => {
  const transObj = new Translate()
  // 鍒涘缓鎶ヤ环浠诲姟
  // const quoteRet = await transObj.createQuoteJob(from, to, format, fileName, filePath);
  // console.log(quoteRet);
  // 鏌ョ湅鎶ヤ环杩涘害
  // const fileId = 'xxxxx';
  // const queryQuoteRet = await transObj.queryQuote(fileId);
  // console.log(queryQuoteRet);
  // 鍒涘缓缈昏瘧浠诲姟
  // const transRet = await transObj.createTransJob(from, to, format, fileName, filePath, output);
  // console.log(transRet);
  // 鏌ョ湅缈昏瘧杩涘害
  // const requestId = 123;
  // const queryTransRet = await transObj.queryTrans(requestId);
  // console.log(queryTransRet);
})()
