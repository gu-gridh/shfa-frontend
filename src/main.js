import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router.js'
import MasonryWall from '@yeger/vue-masonry-wall'
import matomo from 'vue-matomo';
import messages from './i18n/messages'
import { createI18n } from 'vue-i18n';
import { createPinia } from 'pinia';

const app = createApp(App)
const pinia = createPinia();

const i18n = createI18n({
  locale: 'sv',  // default language
  messages,
  warnHtmlInMessage: 'off', 
})

app.use(router)
app.use(MasonryWall)
app.use(i18n);
app.use(pinia);


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