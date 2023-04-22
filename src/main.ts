import { createApp } from 'vue'
import App from '@/App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const dark = {
    dark: true,
    colors: {
        background: '#15202b',
        primary: '#3f51b5',
        secondary: '#03dac6',
        error: '#f44336',
        info: '#2196F3',
        success: '#4caf50',
        warning: '#fb8c00',
    },
}

const light = {
    dark: false,
    colors: {
        background: '#eee',
        primary: '#3f51b5',
        secondary: '#00ccff',
        error: '#ffcc00',
    },
}

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'dark',
        themes: {
            dark,
            light,
        },
    },
})

import router from '@/router/index'
import { createPinia } from 'pinia'

const app = createApp(App)

app.use(createPinia())

app.use(vuetify)
app.use(router)

app.mount('#app')
