let EventEmitter = require('events').EventEmitter;

function catchError(type, code, feedback) {

  return function decorator(target, name, descriptor) {
    let fun = descriptor.value;

    descriptor.value = async function newValue() {
      console.log('catchError calling', name, '', ...arguments);

      // this vueComponent in runtime
      // instance of target, but not target
      var that = this;
      try {
        let rs = await fun.apply(this, [].slice.call(arguments))
        return rs;
      } catch (err) {
        console.error('catchError   catch an error ', err);
        that.status = "failed";

        if (err instanceof EvalError) {
          //that.showError(err);
        } else if (err instanceof RangeError) {
        } else if (err instanceof SyntaxError) {
        } else if (err instanceof ReferenceError) {
        } else if (err instanceof TypeError) {
        } else if (err instanceof URIError) {
        } else if (err.code) {
          // 查表
          let cat = parseInt(err.code / 100); // 2xx,3xx,4xx,5xx;
          console.warn('catchError with code', err.code);
          switch (err.code) {
            case 401:
              console.warn('catchError 401 && redirect');
              break;
            default:
              console.warn('catchError default.$message.$notification');
          }
        }


      // if matched with type/code, omit it and stop
      // else throw out again
      } finally {
        console.warn('finnaly', that.status);
      }
    };
    return descriptor;
  };
}

export { catchError };
