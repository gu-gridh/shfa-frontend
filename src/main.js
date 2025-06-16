import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router.js'
import matomo from 'vue-matomo';
import messages from './i18n/messages'
import { createI18n } from 'vue-i18n';
import { createPinia } from 'pinia';
import { createHead, VueHeadMixin } from '@unhead/vue/client'

const app = createApp(App)
const pinia = createPinia();
const head = createHead();

const i18n = createI18n({
  locale: 'sv',  // default language
  messages,
  warnHtmlInMessage: 'off', 
})

app.use(router)
app.use(i18n);
app.use(pinia);
app.use(head);

app.mixin(VueHeadMixin)

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