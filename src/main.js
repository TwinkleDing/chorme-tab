/*
 * @Author: twinkleding twinkle415@163.com
 * @Date: 2023-11-10 09:19:34
 * @LastEditors: twinkleding twinkle415@163.com
 * @LastEditTime: 2024-07-08 15:55:35
 * @FilePath: \chorme-tab\src\main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createApp } from "vue";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import "./assets/css/index.css";
import App from "./App.vue";

createApp(App).use(ElementPlus).mount("#app");
