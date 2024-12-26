import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ConversationVIew from '@/views/ConversationVIew.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      children: [
        {
          path: 'chat/:chatid',
          component: ConversationVIew,
        }
      ]
    },
  ],
})

export default router
