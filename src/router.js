import { createRouter, createWebHistory } from 'vue-router'
import Grid from './Views/Grid.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Grid,
  },
  {
    path: '/site/:siteId/iiif/:iiifFile',
    name: 'SiteWithIiifFile',
    component: Grid,
  },
  {
    path: '/site/:siteId',
    name: 'Site',
    component: Grid,
  },
  {
    path: '/site/:siteId/iiif/:iiifFile/meta/:idForMetaData',
    name: 'SiteWithIiifFileMetaData',
    component: Grid,
  },
  {
    path: '/search/iiif/:iiifFile/meta/:idForMetaData',
    name: 'IiifFileMetaDataWithoutSite',
    component: Grid,
  },
  {
    path: '/search/',
    name: 'Search',
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

