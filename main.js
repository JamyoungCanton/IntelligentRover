
import App from './App'
// import * as uni from '@dcloudio/uni-ui';
// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
//设置pinia
import { createSSRApp } from 'vue'
import pinia from './store/index'
export function createApp() {
  const app = createSSRApp(App)
  app.use(pinia)
  return {
    app
  }
}
// #endif