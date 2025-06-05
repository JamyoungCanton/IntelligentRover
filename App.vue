<script>
// import { checkLogin } from '@/router/index.js';
import { debounce } from 'lodash';
import { useUserStore } from '@/store/modules/user';
import { ref, computed } from 'vue';

export default {
  onLaunch: function() {
    console.log('App Launch');
    const userStore = useUserStore();
    const token = uni.getStorageSync('token');
    if (token) userStore.setToken(token);
    const user = uni.getStorageSync('user');
    if (user && user.userInfo) userStore.updateUserInfo(user.userInfo);
    const tabBarPages = [
      '/pages/index/index',
      '/pages/order/order',
      '/pages/my/my'
    ];
    const isTabbarPage = computed(() => {
      const pages = getCurrentPages();
      if (!pages.length) return false;
      const currentPage = pages[pages.length - 1];
      const currentRoute = '/' + currentPage.route;
      return tabBarPages.includes(currentRoute);
    });
  },
  onShow: function() {
    console.log('App Show');
  },
  onHide: function() {
    console.log('App Hide');
  },
};
</script>

<style>
    /*每个页面公共css */
</style>

<Tabbar v-if="isTabbarPage" />