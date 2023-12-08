import { createRouter, createWebHistory } from 'vue-router'
import Grid from './Views/Grid.vue';

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
    path: '/iiif/:iiifFile',
    name: 'IiifFile',
    component: Grid,
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

