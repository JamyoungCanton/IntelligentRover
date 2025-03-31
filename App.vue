<script>
// import { checkLogin } from '@/router/index.js';
import { debounce } from 'lodash';
export default {
  onLaunch: function() {
    console.log('App Launch');
    // const debouncedCheckLogin = debounce(checkLogin, 300);
    // uni.addInterceptor('navigateTo', {
    //   invoke(args) {
    //       if (!debouncedCheckLogin()) {
    //           return false;
    //       }
    //       return args;
    //   }
    //  });
    },
    onShow: function() {
        console.log('App Show');
    },
    onHide: function() {
        console.log('App Hide');
    }
};
</script>

<style>
    /*每个页面公共css */
</style>