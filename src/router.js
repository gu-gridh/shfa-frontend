import { createRouter, createWebHistory } from 'vue-router'
import Grid from './Views/Grid.vue';
import About from './components/About.vue';
import Guide from './components/Guide.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Grid,
  },
  {
    path: '/site/:siteId',
    name: 'Site',
    component: Grid,
  },
  {
    path: '/search/',
    name: 'Search',
    component: Grid, 
  },
  {
    path: '/search=:query',
    name: 'SearchQuery',
    component: Grid,
  },
  {
    path: '/image/:iiifFile',
    name: 'IiifFile',
    component: Grid,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/guide',
    name: 'Guide',
    component: Guide,
  },
  {
    path: '/:catchAll(.*)',
    component: Grid, 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

