import { createRouter, createWebHistory } from 'vue-router'
import Grid from './Views/Grid.vue';

const routes = [
  {
    path: '/siteId/:siteId',
    name: 'Site',
    component: Grid,
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})



export default router
