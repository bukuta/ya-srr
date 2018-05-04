//import Vue from 'vue/dist/vue.js';
//import Vuex from 'vuex';
import helper from './helper';
console.log(helper);
const {a,hello} = helper;
console.log(a,hello);
import {catchError} from './decorators';

class Base {
  @catchError()
  say(){
    throw new Error('say');
  }
}

class Child extends Base{
}


