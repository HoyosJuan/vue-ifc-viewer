import App from './components/App.vue'
import { createApp } from 'vue'
import { ifcViewer } from '../lib'

createApp(App).use(ifcViewer).mount('#app')