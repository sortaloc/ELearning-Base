const fetch = require('node-fetch')

class API {
  constructor () {
    this.timeout = 60000
    this.postConfig = {
      method: 'POST',
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    this.resMessage = {
      code: 105,
      state: false,
      data: null,
      message: null
    }
  }

  validate (data) {
    return new Promise(async resolve => {
      let res = {
        code: 105,
        state: false,
        data: null,
        message: null
      }
      if (Number(data.status) === 200) {
        try {
          let newData = await data.json()
          res.data = newData;
          res.message = 'Success';
          res.state = !res.state;
          res.code = 100
          resolve(res)
        } catch (err) {
          res.message = 'Failed'
          res.code = 105
          res.http = 500
          resolve(res)
        }
      } else {
        res.message = 'Failed'
        res.code = 105
        res.http = res.status
        resolve(res)
      }
    })
  }

  failedData (err) {
    let res = {
      code: 105,
      state: false,
      data: null,
      message: null
    }
    res.message = String(err)
    return res
  }

  validateHeaders (headers) {
    let target
      target = this.postConfig
      for (let prop in headers) {
        if (prop === 'headers') {
          Object.assign(target.headers, headers[prop])
        }
      }
    return target
  }

  get (url, config = {}) {
    return new Promise(async resolve => {
      let configs = this.validateHeaders(config)
      try{
        fetch(url, {
          method: 'GET'
        })
        .then(this.validate)
        .then(response => {
          resolve(response)
        })
      }catch(err){
        resolve(this.failedData(err))
      }
    })
  }

  post (url, data, config = {}) {
    return new Promise(async resolve => {
      let configs = this.validateHeaders(config)
      try {
        fetch(url, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: configs.headers
        })
          .then(this.validate)
          .then(response => {
            resolve(response)
          })
          .catch(this.failedData)
      } catch (err) {
        resolve(this.failedData(err))
      }
    })
  }
}

module.exports = new API()