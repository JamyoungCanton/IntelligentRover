   // @ts-ignore
   import { ref } from 'vue';
   import { defineStore } from 'pinia';
   
   /**
    * @typedef {Object} UserInfo
    * @property {string} realname
    * @property {string} phone
    * @property {string} idCardNo
    */
   
   export const useUserStore = defineStore('user', () => {
     /** @type {import('vue').Ref<UserInfo>} */
     const userInfo = ref({
       avatar: '',
       username: '',
       phone: '',
       bio: '',
       gender: 0,
       birthday: '',
       email: '',
       realname: '',
       idCardNo: ''
     });
   
     function updateUserInfo(newUserInfo) {
       // 过滤掉 token 字段，避免 userInfo 里有 token
       const { token, ...pureUserInfo } = newUserInfo || {};
       userInfo.value = pureUserInfo;
     }
   
     // 获取token
     const token = ref('');
     function setToken(newToken) {
       token.value = newToken;
       // 新增：同时保存到本地存储
       if (newToken) {
         uni.setStorageSync('token', newToken);
       } else {
         uni.removeStorageSync('token');
       }
     }
   
     function clearUser() {
       token.value = '';
       userInfo.value = {
         avatar: '',
         username: '',
         phone: '',
         bio: '',
         gender: 0,
         birthday: '',
         email: '',
         realname: '',
         idCardNo: ''
       };
       // 清除本地存储
       uni.removeStorageSync('token');
       uni.removeStorageSync('userInfo');
     }
   
     return { userInfo, updateUserInfo, token, setToken, clearUser };
   }, {
     persist: {
       key: 'user-store',
       storage: {
         getItem(key) {
           try {
             const value = uni.getStorageSync(key);
             return value ? JSON.parse(value) : null;
           } catch (error) {
             console.error(`Error getting item from storage: ${key}, error:`, error);
             return null;
           }
         },
         setItem(key, value) {
           try {
             console.log(`Setting item in storage: ${key}, value:`, value);
             uni.setStorageSync(key, JSON.stringify(value));
           } catch (error) {
             console.error(`Error setting item in storage: ${key}, error:`, error);
           }
         },
         removeItem(key) {
           try {
             uni.removeStorageSync(key);
           } catch (error) {
             console.error(`Error removing item from storage: ${key}, error:`, error);
           }
         }
       }
     },
   });
   