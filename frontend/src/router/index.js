import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'ItemList',
    component: () => import('../views/ItemList.vue')
  },
  {
    path: '/new',
    name: 'NewItem',
    component: () => import('../views/ItemForm.vue')
  },
  {
    path: '/item/:id',
    name: 'ItemDetail',
    component: () => import('../views/ItemDetail.vue')
  },
  {
    path: '/item/:id/edit',
    name: 'EditItem',
    component: () => import('../views/ItemForm.vue')
  },
  {
    path: '/backup',
    name: 'Backup',
    component: () => import('../views/Backup.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
