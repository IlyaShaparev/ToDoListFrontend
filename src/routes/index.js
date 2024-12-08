import LoginPage from '../pages/LoginPage.vue';
import TaskPage from '../pages/TaskPage.vue';
import TaskCreatePage from '../pages/TaskCreatePage.vue';
import AllTasksPage from '../pages/AllTasksPage.vue';

export const routes = [
    { path: '/login', component: LoginPage },
    { path: '/tasks', component: TaskPage, meta: { requiresAuth: true }},
    { path: '/taskCreate', component: TaskCreatePage, meta: { requiresAuth: true }},
    { path: '/allTasks', component: AllTasksPage, meta: { requiresAuth: true }},
    {path: '/:catchAll(.*)', redirect: '/login'}
]