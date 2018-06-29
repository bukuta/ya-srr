const urllib = require('url');
const querystring = require('querystring');
import EventEmitter from 'events';

function getAjax (options) {
  let prefix = options.prefix;
  let parse = options.parse || (a=>a);
  let ajax = new EventEmitter();
  let handleResonse = function (rs) {
    if (parseInt(rs.status / 100,10) == 2) {
      if (rs.status == 204) {
        return;
      }
      if (rs.headers.get('Content-Type').indexOf('json')) {
        return rs.json().then(result => {
          //result[dateSymbol] = rs.headers.get('date');
          return result;
        });
      } else if (rs.headers.get('Content-Type').indexOf('text')) {
        return rs.text();
      } else {
        throw new Error(`Content-Type is can't recognize.`);
      }
    } else if (rs.status == 401) {
      let error = new Error('UnAuthorized');
      error.responseCode = 401;
      ajax.emit('error',error);
      throw error;
    } else {

      if (rs.headers.get('Content-Type').indexOf('json')) {
        return rs.json().then(result => {
          let error = new Error();
          error = Object.assign(error,result,{
            responseCode: rs.status
          });
          ajax.emit('error',error);
          throw error;
        });
      } else if (rs.headers.get('Content-Type').indexOf('text')) {
        return rs.text().then(text => {
          let error = new Error(text);
          error.responseCode = rs.status;
          error.message = text;
          ajax.emit('error',error);
          throw error;
        });
      } else {
        let error = new Error(`Content-Type is can't recognize.`);
        ajax.emit('error',error);
        throw error;
      }
    }
  };

  ajax.request = function (options) {
    // 修正url
    let url = urllib.parse(options.path);
    let originQuery = querystring.parse(url.query);
    if (options.query) {
      if (typeof (options.query) == 'object') {
        url.query = Object.assign({},originQuery,options.query);
      } else if (typeof (options.query) == 'string') {
        url.query = Object.assign({},originQuery,querystring.parse(optins.query));
      }
      url.search = '';
    }
    url.pathname = prefix +'/'+ url.pathname;
    url.pathname = url.pathname.replace('//','/');

    options.credentials = options.credentials || 'include';

    return window.fetch(urllib.format(url),options).then(handleResonse).then(parse);
  };

  return ajax;
}

function rpcForm (subpath,method) {
  return function decorator (target,name,descriptor) {
    let fun = descriptor.value;

    descriptor.value = function newValue () {
      let options = fun.apply(this,[].slice.call(arguments)) || {};
      options.method = method || 'POST';
      options.path = '/' + (this.url + '/' + subpath).split('/').filter(a => a).join('/');
      options.headers = options.headers || {};

      if (options.body) {
        if (typeof (options.body) === 'object') {
          const _body = Object.assign({},options.body)
          options.body = querystring.stringify(_body)
        } else {
          console.warn('The data type of the body must be the object type')
        }
      }

      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      options.headers['accept'] = 'application/json';

      return this._fetch(options);
    };
    return descriptor;
  };
}

function rpcUpload (subpath,method) {

  return function decorator (target,name,descriptor) {
    let fun = descriptor.value;

    descriptor.value = function newValue () {
      let options = fun.apply(this,[].slice.call(arguments)) || {};
      options.method = method || 'POST';
      options.path = '/' + (this.url + '/' + subpath).split('/').filter(a => a).join('/');
      options.headers = options.headers || {};

      if (options.body) {
        if (typeof (options.body) === 'object') {
          let formData = new FormData()
          let params = options.body
          if (params) {
            for (let i in params) {
              if (params.hasOwnProperty(i)) {
                formData.append(i,params[i])
              }
            }
          }
          options.body = formData
          delete options.headers['Content-Type']
        } else if (options.body instanceof FormData) {
          delete options.headers['Content-Type']
        } else {
          console.warn('The data type of the body must be the formdata type')
        }
      }

      return this._fetch(options);
    };
    return descriptor;
  };
}

function rpc (subpath,method) {
  return function decorator (target,name,descriptor) {
    let fun = descriptor.value;

    descriptor.value = function newValue () {
      let options = fun.apply(this,[].slice.call(arguments)) || {};
      options.method = method || 'POST';
      options.path = '/' + (this.url + '/' + subpath).split('/').filter(a => a).join('/');
      options.headers = options.headers || {};

      if (options.body) {
        if (typeof (options.body) === 'object') {
          const _body = Object.assign({},options.body)
          options.body = JSON.stringify((_body))
        } else {
          console.warn('The data type of the body must be the object type')
        }
      }

      options.headers['Content-Type'] = 'application/json';
      options.headers['accept'] = 'application/json';

      return this._fetch(options);
    };
    return descriptor;
  };
}

export { getAjax,rpc,rpcForm,rpcUpload };
