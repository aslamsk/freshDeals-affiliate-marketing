import { createRouter, createWebHistory } from 'vue-router';
import TodayDealsPage from '../pages/TodayDealsPage.vue';
import CategoryDealsPage from '../pages/CategoryDealsPage.vue';
import ProductDetailPage from '../pages/ProductDetailPage.vue';
import SearchResultsPage from '../pages/SearchResultsPage.vue';
// Use the COMPLETE admin dashboard with all management options (Products, Platforms, Deals, Coupons, Notifications, Analytics)
import AdminDashboard from '../components/admin/AdminDashboard.vue';
import AdminLoginPage from '../views/AdminLoginPage.vue';
import AdminDealManager from '../components/admin/AdminDealManager.vue';
import NotFoundPage from '../pages/NotFoundPage.vue';
import { adminAuthGuard, preventAuthenticatedGuard } from './adminGuard';

const routes = [
  {
    path: '/',
    name: 'home',
    component: TodayDealsPage,
    meta: { title: 'Today Deals' },
  },
  {
    path: '/search',
    name: 'search',
    component: SearchResultsPage,
    meta: { title: 'Search Results' },
  },
  {
    path: '/category/:category',
    name: 'category-deals',
    component: CategoryDealsPage,
    meta: { title: 'Category Deals' },
  },
  {
    path: '/product/:productId',
    name: 'product-detail',
    component: ProductDetailPage,
    meta: { title: 'Product Details' },
  },
  
  // Admin routes
  {
    path: '/admin/login',
    name: 'admin-login',
    component: AdminLoginPage,
    meta: { title: 'Admin Login' },
    beforeEnter: preventAuthenticatedGuard,
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: AdminDashboard,
    meta: { title: 'Admin Dashboard' },
    beforeEnter: adminAuthGuard,
  },
  {
    path: '/admin/deals',
    name: 'admin-deals',
    component: AdminDealManager,
    meta: { 
      title: 'Deal Management',
      requiredPermission: 'create_deals'
    },
    beforeEnter: adminAuthGuard,
  },
  {
    path: '/admin',
    redirect: '/admin/dashboard',
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  const title = to.meta.title || 'FreshDeals';
  document.title = `${title} - FreshDeals`;
  next();
});

export default router;
