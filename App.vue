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
    console.log('App启动时user:', uni.getStorageSync('user'));
  },
  onShow: function() {
    console.log('App Show');
  },
  onHide: function() {
    console.log('App Hide');
  },
  createOrder() {
    const user = uni.getStorageSync('user');
    const token = user && user.token ? user.token : '';
    console.log('route页面onLoad时user:', user);
    console.log('下单前token:', token);

    if (!token) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    // ...组装 orderData...

    console.log('请求header:', {
      'Content-Type': 'application/json',
      'X-Access-Token': token
    });
    console.log('请求data:', orderData);

    uni.request({
      url: 'https://island.zhangshuiyi.com/island/front/order/createOrder',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'X-Access-Token': token
      },
      data: orderData,
      success: (res) => {
        console.log('创建订单返回:', res);
        // ...原有逻辑
      },
      fail: (err) => {
        console.log('创建订单失败:', err);
        // ...原有逻辑
      }
    });
  }
};
</script>

<style>
    /*每个页面公共css */
</style>

<Tabbar v-if="isTabbarPage" />