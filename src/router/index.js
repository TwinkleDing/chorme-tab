import { createRouter, createWebHashHistory } from 'vue-router'

const route = createRouter({
  history: createWebHashHistory('/'),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/home/index.vue'),
      meta: { title: 'Home' },
    },
    {
      path: '/draw',
      name: 'Draw',
      component: () => import('@/views/draw/index.vue'),
      meta: { title: 'Draw' },
    },
    {
      path: '/story',
      name: 'Story',
      component: () => import('@/views/story/index.vue'),
      meta: { title: 'Story' },
    },
    {
      path: '/puzzle',
      name: 'Puzzle',
      component: () => import('@/views/puzzle/index.vue'),
      meta: { title: 'Puzzle' },
    },
    {
      path: '/stock',
      name: 'Stock',
      component: () => import('@/views/stock/index.vue'),
      meta: { title: 'Stock' },
    },
  ],
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

export default route
