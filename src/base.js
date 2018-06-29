import { getAjax } from './ajax.js';
import Context from './context';


const ajax = getAjax({
  prefix: '/api/v1',
  parse: function(data) {
    if (data.code == 0) {
      return data;
    } else {
      let err = new Error(data.msg);
      err.code = data.code;
      err.data = data.data;
      throw err;
    }
  }
});

let context = new Context({
  ajax: ajax
});

class Base {
  constructor({url: url}) {
    let options = arguments[0];
    this._url = url;
    this._params = {};
    this._rewrites = options.rewrites || {};
  }

  get context() {
    return this.__context__ || context;
  }

  get ajax() {
    return this.context.ajax;
  }

  get params() {
    return Object.assign({}, this._params);
  }

  setParams(k, v) {
    if (typeof (k) != 'undefined' && typeof (v) != 'undefined') {
      this._params[k] = v;
    } else if (typeof (v) == 'undefined' && typeof (k) == 'object') {
      Object.assign(this._params, k);
    }
    return this;
  }

  get url() {
    let ps = this.params;
    let url = typeof (this._url) == 'function' ? this._url() : this._url;
    return url;

    let qs = Object.entries(ps).map((k, v) => {
      return encodeURIComponent(k) + '=' + encodeURIComponent(v);
    }).join('&');
    if (qs) {
      return url + '?' + qs;
    } else {
      return url;
    }
  }

  set url(u) {
    this._url = u;
  }

  getUrl(type) {
    if (type && this._rewrites && this._rewrites[type] && typeof (this._rewrites[type]) == 'function') {
      return this._rewrites[type].call(this);
    }
    return this.url;
  }

  fetch(options) {
    options = Object.assign({
      path: this.getUrl(),
      method: 'GET'
    }, options);

    return this.ajax.request(options);
  }

  _fetch(options) {
    options = Object.assign({
      path: this.getUrl(),
      query: this.params,
      method: 'GET'
    }, options);
    return this.ajax.request(options);
  }
}

class BaseModel extends Base {
  constructor({url, item, idAttribute}) {
    super(...arguments);
    this._item = item;
    this._idAttribute = idAttribute;
  }

  get idAttribute() {
    return this._idAttribute || 'id';
  }

  get id() {
    return this._item && this._item[this.idAttribute];
  }

  fetch() {
    return super.fetch().then(rs => {
      this._item = rs;
      return rs;
    });
  }

  _getDiff(newObject, oldObject) {
    let diff = {};
    let originItem = this._item || {};
    Object.entries(payload).forEach(([k, v]) => {
      if (originItem[k] != v) {
        diff[k] = v;
      }
    });
    return diff;
  }

  update(payload) {
    delete payload.id;
    delete payload.creator;
    let data = payload;

    return this.ajax.request({
      path: this.getUrl('update'),
      //query: this.params,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      //payload: JSON.stringify(payload),
      body: JSON.stringify(data)
    }).then(rs => {
      // update不返回新数据
      // return this.fetch();
      return rs;
    });
  }

  destroy() {
    //console.warn('model.destroy', this.getUrl('delete'));
    return this.ajax.request({
      path: this.getUrl('delete'),
      //query: this.params,
      method: 'DELETE'
    }).then(rs => {
      return rs;
    });
  }
}

class BaseCollection extends Base {
  constructor(options = {}) {
    super({
      url: options.url || 'todo'
    });
    this._items = null;
    this._page = 1;
    this._pagesize = 20;
    this._Model = options && options.model || BaseModel;
    this._idAttribute = options && options.idAttribute || 'id';
  }

  set page(pg) {
    this._page = pg;
  }

  get page() {
    return this._page;
  }

  set pageSize(ps) {
    this._pagesize = ps;
  }

  get pageSize() {
    return this._pagesize;
  }

  get total() {
    return thiks._total;
  }

  get idAttribute() {
    return this._idAttribute || 'id';
  }

  get params() {
    let limit = this.pageSize;
    let offset = Math.max(this.page - 1, 0) * this.pageSize;
    return Object.assign({}, this._params, {
      pageNum: this.page,
      pagesize: this.pageSize,
      //limit,
      //offset
    });
  }

  fetch(options) {
    return super.fetch(options).then(rs => {
      console.warn('fetched',rs);
      this._items = rs.data.items;
      this._total = rs.data.total;
      return {items: rs.data.items,total:rs.data.total};
    });
  }

  create(payload) {
    return this.ajax.request({
      path: this.getUrl('create'),
      query: this.params,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      //payload: JSON.stringify(payload),
      body: JSON.stringify(payload)
    }).then(rs => {
      return rs;
    });
  }

  destroy(payload) {
    return this.ajax.request({
      path: this.getUrl('destroy') + '/',
      query: this.params,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      //payload: JSON.stringify(payload),
      body: JSON.stringify(payload)
    }).then(rs => {
      return rs;
    });
  }

  select(id) {
    let idAttribute = this.idAttribute;
    let rs = (this._items || []).filter(it => it[idAttribute] == id);
    let target = rs && rs[0];
    let url = `${this.getUrl()}/${id}`;
    let model = new this._Model({
      url: url,
      item: target
    });
    return model;
  }
}

context.add(Base);
context.add(BaseModel);
context.add(BaseCollection);

export { Base, BaseModel, BaseCollection, ajax };
