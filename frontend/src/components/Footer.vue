<template>
  <v-footer class="footer bg-dark text-white" app>
    <v-container>
      <v-row class="py-8">
        <!-- Brand Section -->
        <v-col cols="12" md="4" class="mb-6 mb-md-0">
          <div class="d-flex align-center mb-3">
            <v-avatar color="primary" size="40" class="mr-2">
              <v-icon color="white" size="24">mdi-tag-multiple</v-icon>
            </v-avatar>
            <div>
              <h3 class="text-h5 font-weight-bold">{{ $t('common.appName') }}</h3>
            </div>
          </div>
          <p class="text-body-2 mb-4" style="opacity: 0.8">{{ $t('common.tagline') }}</p>
          <p class="text-caption" style="opacity: 0.7">
            Discover the best deals from top e-commerce platforms. Save money on your favorite products every day.
          </p>
        </v-col>

        <!-- Quick Links -->
        <v-col cols="6" md="2" class="mb-6 mb-md-0">
          <h4 class="text-h6 font-weight-bold mb-3">Quick Links</h4>
          <v-list density="compact" class="bg-transparent">
            <v-list-item to="/" class="footer-link px-0">
              <v-list-item-title class="text-body-2">Home</v-list-item-title>
            </v-list-item>
            <v-list-item :to="'/category/electronics'" class="footer-link px-0">
              <v-list-item-title class="text-body-2">Electronics</v-list-item-title>
            </v-list-item>
            <v-list-item :to="'/category/fashion'" class="footer-link px-0">
              <v-list-item-title class="text-body-2">Fashion</v-list-item-title>
            </v-list-item>
            <v-list-item to="/admin" class="footer-link px-0">
              <v-list-item-title class="text-body-2">Admin</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- Categories -->
        <v-col cols="6" md="2" class="mb-6 mb-md-0">
          <h4 class="text-h6 font-weight-bold mb-3">Categories</h4>
          <v-list density="compact" class="bg-transparent">
            <v-list-item :to="'/category/home'" class="footer-link px-0">
              <v-list-item-title class="text-body-2">Home & Living</v-list-item-title>
            </v-list-item>
            <v-list-item :to="'/category/beauty'" class="footer-link px-0">
              <v-list-item-title class="text-body-2">Beauty</v-list-item-title>
            </v-list-item>
            <v-list-item :to="'/category/food'" class="footer-link px-0">
              <v-list-item-title class="text-body-2">Food & Grocery</v-list-item-title>
            </v-list-item>
            <v-list-item :to="'/category/sports'" class="footer-link px-0">
              <v-list-item-title class="text-body-2">Sports</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- Legal & Contact -->
        <v-col cols="12" md="4">
          <h4 class="text-h6 font-weight-bold mb-3">{{ $t('common.about') }}</h4>
          <v-list density="compact" class="bg-transparent mb-4">
            <v-list-item href="#" class="footer-link px-0">
              <v-list-item-title class="text-body-2">Privacy Policy</v-list-item-title>
            </v-list-item>
            <v-list-item href="#" class="footer-link px-0">
              <v-list-item-title class="text-body-2">Terms of Service</v-list-item-title>
            </v-list-item>
            <v-list-item href="#" class="footer-link px-0">
              <v-list-item-title class="text-body-2">Affiliate Disclaimer</v-list-item-title>
            </v-list-item>
          </v-list>
          
          <div class="mb-3">
            <h5 class="text-subtitle-2 font-weight-bold mb-2">{{ $t('common.contact') }}</h5>
            <p class="text-caption" style="opacity: 0.8">
              <v-icon size="small" class="mr-1">mdi-email</v-icon>
              support@freshdeals.com
            </p>
          </div>

          <!-- Social Links -->
          <div class="d-flex gap-2">
            <v-btn icon size="small" variant="outlined" href="#" aria-label="Facebook">
              <v-icon size="small">mdi-facebook</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="outlined" href="#" aria-label="Twitter">
              <v-icon size="small">mdi-twitter</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="outlined" href="#" aria-label="Instagram">
              <v-icon size="small">mdi-instagram</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="outlined" href="#" aria-label="YouTube">
              <v-icon size="small">mdi-youtube</v-icon>
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-4" style="opacity: 0.2"></v-divider>

      <!-- Copyright -->
      <v-row>
        <v-col cols="12" class="text-center">
          <p class="text-caption" style="opacity: 0.7">
            © {{ new Date().getFullYear() }} FreshDeals. All rights reserved. Made with ❤️ in India
          </p>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%) !important;
}

.bg-dark {
  background-color: #1a1a1a;
}

.footer-link {
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s ease;
}

.footer-link:hover {
  color: white;
  transform: translateX(4px);
}

a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
