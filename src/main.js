import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router.js'
import MasonryWall from '@yeger/vue-masonry-wall'
import matomo from 'vue-matomo';

const app = createApp(App)

app.use(router)
app.use(MasonryWall)

// Use the Matomo plugin only if configured in env.
if (import.meta.env.VITE_MATOMO_URL && import.meta.env.VITE_MATOMO_ID) {
    app.use(matomo, {
      host: import.meta.env.VITE_MATOMO_URL,
      siteId: import.meta.env.VITE_MATOMO_ID,
      router: router,
      enableLinkTracking: true,
      trackInitialView: true,
      debug: false
    });
}

app.mount('#app')