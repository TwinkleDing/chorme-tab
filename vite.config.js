/*
 * @Author: twinkleding twinkle415@163.com
 * @Date: 2023-11-13 09:04:53
 * @LastEditors: twinkleding twinkle415@163.com
 * @LastEditTime: 2024-07-08 15:54:34
 * @FilePath: \chorme-tab\vite.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  build:{
    rollupOptions:{
      output: {
        entryFileNames:`js/index.js`
      }
    }
  }
})
