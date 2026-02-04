import { defineStore } from 'pinia';
import { ref } from 'vue';
import firebaseDealsService from '../services/firebaseDealsService';

export const useDealsStore = defineStore('deals', () => {
  const todayDeals = ref([]);
  const loading = ref(false);
  const error = ref(null);

  /**
   * Fetch today's deals directly from Firebase
   */
  const fetchTodayDeals = async (limit = 20) => {
    console.log('🛒 dealsStore.fetchTodayDeals called');
    loading.value = true;
    error.value = null;

    try {
      console.log('🛒 Calling firebaseDealsService.getTodayDeals...');
      const deals = await firebaseDealsService.getTodayDeals(limit);
      console.log('🛒 Got deals from service:', deals.length);
      todayDeals.value = deals;
      console.log('✅ Deals loaded from Firebase:', deals.length);
    } catch (err) {
      console.error('❌ Store error:', err);
      error.value = err.message;
      console.error('Error fetching today deals:', err);
      todayDeals.value = [];
    } finally {
      loading.value = false;
      console.log('🛒 fetchTodayDeals complete. todayDeals.length:', todayDeals.value.length);
    }
  };

  /**
   * Get deals by category from Firebase
   */
  const getDealsByCategory = async (category, limit = 20) => {
    loading.value = true;
    error.value = null;

    try {
      const deals = await firebaseDealsService.getDealsByCategory(category, limit);
      console.log('✅ Category deals loaded:', deals.length);
      return deals;
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching category deals:', err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get product comparison from Firebase
   */
  const getProductComparison = async (productId) => {
    loading.value = true;
    error.value = null;

    try {
      const data = await firebaseDealsService.getProductComparison(productId);
      console.log('✅ Product comparison loaded', data);
      return data;
    } catch (err) {
      error.value = err.message;
      console.error('Error getting product comparison:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get deal details from Firebase
   */
  const getDealDetails = async (dealId) => {
    loading.value = true;
    error.value = null;

    try {
      const data = await firebaseDealsService.getDealDetails(dealId);
      console.log('✅ Deal details loaded');
      return data;
    } catch (err) {
      error.value = err.message;
      console.error('Error getting deal details:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Track deal click in Firebase
   */
  const trackDealClick = async (dealId) => {
    try {
      await firebaseDealsService.trackDealClick(dealId);
    } catch (err) {
      console.error('Error tracking click:', err);
    }
  };

  /**
   * Listen to real-time deals updates
   */
  const listenToTodayDeals = (callback) => {
    return firebaseDealsService.listenToTodayDeals((deals) => {
      todayDeals.value = deals;
      callback(deals);
    });
  };

  return {
    todayDeals,
    loading,
    error,
    fetchTodayDeals,
    getDealsByCategory,
    getProductComparison,
    getDealDetails,
    trackDealClick,
    listenToTodayDeals,
  };
});
