import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { VueQueryPlugin } from "@tanstack/vue-query";
import 'vue-toast-notification/dist/theme-sugar.css';

const app = createApp(App)
app.use(VueQueryPlugin)

app.mount('#app')
