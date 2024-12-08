import { createApp } from 'vue';
import { store } from "./store/store.js";
import './style.css';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routes/index.js'

const app = createApp(App);

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = !!store.state.authToken;

    if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
        next({ path: '/login' });
    } else {
        next();
    }
});

app.use(router);
app.use(store);
app.mount('#app');
