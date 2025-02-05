import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ConversationVIew from '@/views/ConversationVIew.vue'
import ConversationVIewServer from '@/views/ConversationVIewServer.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      children: [
        {
          path: 'chat/:chatId',
          component: ConversationVIewServer,
        },
        {
          path: 'setting',
          component: () => import('@/views/Setting.vue'),
        },
      ]
    },
  ],
})

export default router
