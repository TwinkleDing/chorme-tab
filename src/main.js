import { createApp } from 'vue'
import './assets/css/index.scss'
import App from './App.vue'
import Router from './router'
import Store from './stores'

// Element Plus 组件与 API（ElMessage 等）由 unplugin-vue-components /
// unplugin-auto-import 按需引入，勿在此全量引入
createApp(App).use(Router).use(Store).mount('#app')
