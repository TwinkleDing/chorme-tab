import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/css/index.scss'
import App from './App.vue'
import Router from './router'
import Store from './stores'

createApp(App).use(Router).use(Store).use(ElementPlus).mount('#app')
