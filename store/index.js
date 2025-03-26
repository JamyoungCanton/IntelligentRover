import { createPinia } from "pinia";
import { createPersistedState } from 'pinia-plugin-persistedstate';

// 创建pinia实例
const pinia = createPinia();
// 使用持久化插件
pinia.use(createPersistedState());

// 默认导出给main.js
export default pinia;

export * from './modules/user.js';