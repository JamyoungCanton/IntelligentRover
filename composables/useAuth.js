
import { useUserStore } from '@/store/modules/user';

export function useAuth() {
  const userStore = useUserStore();

  /**
   * 校验 Token 有效性
   * @returns {Promise<boolean>}
   */
  const checkToken = async () => {
    const token = uni.getStorageSync('token');
    
    // 1. 本地校验
    if (!token) {
      return false;
    }

    // 2. 服务端校验 (Mock)
    // 模拟网络请求
    return new Promise((resolve) => {
      // 模拟调用 /auth/check 接口
      setTimeout(() => {
        // 这里模拟一个校验过程，假设 token 存在即为有效
        // 实际项目中这里应该是 uni.request 调用后端接口
        const isValid = true; 
        // const isValid = Math.random() > 0.1; // 10% 概率模拟失效
        
        console.log('Token check result:', isValid);
        
        if (!isValid) {
          // 校验失败，清除本地信息
          userStore.clearUser();
          resolve(false);
        } else {
          resolve(true);
        }
      }, 500);
    });
  };

  /**
   * 检查并强制登录
   * 如果校验失败，自动跳转登录页
   */
  const checkAuth = async () => {
    const isValid = await checkToken();
    if (!isValid) {
      uni.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none'
      });
      setTimeout(() => {
        uni.redirectTo({
          url: '/pages/login/login?redirect=/pages/chat/chat'
        });
      }, 1000);
      return false;
    }
    return true;
  };

  return {
    checkToken,
    checkAuth
  };
}
