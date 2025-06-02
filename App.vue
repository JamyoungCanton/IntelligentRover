<script>
// import { checkLogin } from '@/router/index.js';
import { debounce } from 'lodash';
import { useUserStore } from '@/store/modules/user';

export default {
  onLaunch: function() {
    console.log('App Launch');
    const userStore = useUserStore();
    const token = uni.getStorageSync('token');
    if (token) userStore.setToken(token);
    const userId = uni.getStorageSync('userId');
    if (userId) userStore.updateUserInfo({ id: userId });
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