<template>
  <view class="container">
    <view class="postTypeSelect">
      <scroll-view class="type-scroll" scroll-x>
        <view 
          v-for="(type, index) in typeList" 
          :key="index"
          class="type-item"
          :class="{ active: activeType === type.value }"
          @click="selectType(type.value)"
        >
          {{ type.label }}
        </view>
      </scroll-view>
    </view>
    <view class="postContent">
      <view class="postItem"  v-for="(item, index) in postList" :key="index"  @click="navigateToPostDetail(item)">
        <view class="postHeader">
          <image class="itemava"
            src="https://ai-public.mastergo.com/ai/img_res/298a09126b167b2389171cf1732d0efd.jpg"
            mode="scaleToFill"
          />
          <text class="itemname">{{ item.userVO.username}}</text>
          <text class="itemlv">lv3</text>
        </view>
        <view class="postTitle">
          <text>{{ item.title }}</text>
        </view>
        <view class="postP">
          <p>{{ item.content }}</p>
        </view>
        <view class="postImage" >
          <image
          v-for="(img,index) in item.images" :key="index"
            :src="img.url"
            mode="scaleToFill"
            :style="getImageStyle(item.images.length, index)"
          />
        </view>
        <view class="item-bottom">
          <view class="item-bottom-left">
            <view class="left-data">{{ item.createTime}}·41分钟前·{{ item.area }}</view>
          </view>
         <view class="item-bottom-right">
            <view class="right-data">
              <uni-icons type="heart" size="16" color="#666"></uni-icons>
              <text class="data-detail">{{ item.likes }}</text>
              <uni-icons type="star" size="16" color="#666"></uni-icons>
              <text class="data-detail">{{ item.focus }}</text>
              <uni-icons type="chat" size="16" color="#666"></uni-icons>
              <text class="data-detail">{{ item.comments }}</text>
            </view>
          </view>
        </view>
      </view>
     
    </view>
    <Tabbar /> 
    <view class="floating-plus-button" @click="goToCreatePost">+</view>
  </view>
</template>

<script setup>
import { ref ,onMounted} from 'vue';
import { useUserStore } from '@/store/modules/user';
import Tabbar from '../Tabbar/Tabbar.vue';
import { onShow } from '@dcloudio/uni-app';

const userStore = useUserStore();

const typeList = ref([
  { label: '全部', value: 'all' },
  { label: '日常活动', value: 'daily' },
  { label: '旅游攻略', value: 'strategy' },
  { label: '旅游分享', value: 'share' },
  { label: '分享生活', value: 'life' }
]);

const activeType = ref('all');

const selectType = (type) => {
  activeType.value = type;
  // 这里可以添加选择类型后的逻辑
  // 根据贴字的类型进行筛选
};

const getImageStyle = (imageCount, index) => {
  if (imageCount === 1) {
    return { width: '100%', height: '200px' }; // 单张图片全宽显示
  } else if (imageCount === 2) {
    return { width: '48%', height: '200px' }; // 两张图片并排显示
  } else if (imageCount === 3) {
    return { width: '32%', height: '120px' }; // 三张图片并排显示
  } else if (imageCount === 4) {
    return { width: '48%', height: '160px' }; // 四张图片并排显示
  } else {
    return { width: '32%', height: '120px' }; // 其他情况默认显示三张图片并排
  }
};

const goToCreatePost = () => {
  uni.navigateTo({
    url: '/pages/post/createPost'
  });
};

const navigateToPostDetail = (post) => {
  console.log('点击了帖子', post.id);
  uni.navigateTo({
    url: `/pages/post/postDetail?id=${post.id}`
  });
};

onShow(() => {
  getPostLst();
});

const postList = ref([]);
// 获取帖子信息
const getPostLst = () => {
  uni.request({
      url: 'https://island.zhangshuiyi.com/island/posts/page',
      method: 'GET',
      header:{
        'X-Access-Token': userStore.token,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data:{
        isAsc: true,
        order:1,
        pageNo: 1,
        pageSize: 50
        // sortBy: 'id'
      },
      success: (res) => {
        if(res.data.code === 401){
          uni.showModal({
            title: '请重新登录',
            content: '',
            showCancel: false,
            confirmText: '确定',
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({ url: '/pages/login/login' });
              }
            },
          });
        }
        
        else if (res.statusCode === 200) {
          console.log('获取到的帖子信息:', res.data);
          
          // 处理获取到的帖子信息
          postList.value = res.data.result.list;
          console.log('处理后的帖子信息:', postList.value);
          
        } else {
          console.error('获取帖子信息失败，状态码:', res.data.code);
          uni.showToast({
            title: '获取帖子信息失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('请求出错:', err);
        uni.showToast({
          title: '网络请求出错',
          icon: 'none'
        });
      }
  })
}  
    
  
</script>

<style lang="scss">
.container{
  background-color: rgb(248, 248, 248);
}
.postTypeSelect {
  position: fixed; /* 设置为固定定位 */
  left: 0;
  width: 100%; /* 宽度占满整个屏幕 */
  z-index: 1000; /* 确保它在其他内容之上 */
  padding: 15px;
  background-color: #fff;
  // box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 添加阴影以增强视觉效果 */
}

.type-scroll {
  white-space: nowrap;
}

.type-item {
  display: inline-block;
  padding: 8px 15px;
  margin-right: 10px;
  border-radius: 15px;
  background-color: #fff;
  color: #666;
  
  &.active {
    background-color: #007aff;
    color: #fff;
  }
}

.postTypeSelect{
  display: flex;
  flex-direction: column;
  padding: auto;
}

.postContent {

  padding-top: 60px; /* 根据 .postTypeSelect 的实际高度调整 */

  display: flex;
  flex-direction: column;
  align-items: center; /* 添加这行使内容居中 */
  width: 100%; /* 改为100%宽度 */
}

.postItem {
  display: flex;
  flex-direction: column;
  border: solid 1px #efebeb;
  border-radius: 10px;
  width: 85%;
  margin: 0 20px; 
  background-color: #fff;
  margin-bottom: 15px;
}
.postHeader{
  display: flex;
  flex-direction: row;
  align-content: center;
  align-items: center;
  padding: 8px;

}
.itemava{
  width: 45px;
  height:45px;
  border-radius: 50%;
  margin-right: 10px;
  border: solid 1px #c5c0c0;
}
.itemname{
  margin-right: 20px;
}
.itemlv{
  margin-right: 20px;
  background-color: #ee8c1c;
  padding: 0 10px;
  border-radius: 8px;
}
.postTitle{
  margin-left: 15px;
  font-size: 18px;
  font-weight: 500;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  color: #225c99;
}
.postP{
  // 首行缩进两个字符
  text-indent: 2em;
  font-size: 14px;
  padding: 5px 12px;
  color: #4f4f4f;
}

.postImage{
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 10px;
  width: 100%; /* 确保容器宽度为 100% */
}
.postImage image{
  border-radius: 5px;
  margin-bottom: 10px; /* 图片之间的间距 */
}
.item-bottom{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-top: solid 1px #efebeb;
  margin-top: 5px;
}
.item-bottom-left{
  font-size: 12px;
  color: #666;
}
.item-bottom-right{
  display: flex;
  flex-direction: row;
  align-items: center;
  
}
.right-data{
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 12px;
  color: #666;
  margin-right: 10px;
}
.data-detail{
  margin-right: 8px;
}

/* 悬浮加号按钮样式 */
.floating-plus-button {
  position: fixed;
  right: 35px;
  top: 130px;
  width: 50px;
  height: 50px;
  background-color: #007AFF;
  border-radius: 50%;
  color: white;
  font-size: 48px;
  text-align: center;
  line-height: 45px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}
</style>