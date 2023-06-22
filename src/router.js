import { createRouter, createWebHistory } from 'vue-router'
import Grid from './Views/Grid.vue';

const routes = [
  {
    path: '/siteId/:siteId/iiifFile/:iiifFile/',
    name: 'SiteWithIiifFile',
    component: Grid,
  },
  {
    path: '/siteId/:siteId',
    name: 'Site',
    component: Grid,
  },
  {
    path: '/siteId/:siteId/iiifFile/:iiifFile/idForMetaData/:idForMetaData/',
    name: 'SiteWithIiifFileMetaData',
    component: Grid,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})



export default router
