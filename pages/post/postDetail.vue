<template>
  <view class="app-container">
    <!-- 用户信息 -->
    <view class="author-info">
      <image class="app-avatar avatar" src="https://ai-public.mastergo.com/ai/img_res/298a09126b167b2389171cf1732d0efd.jpg  " mode="scaleToFill" />
      <view class="info">
        <view class="name">blulu</view>
        <view class="desc">lv3</view>
      </view>
      <view class="button">
        <u-button plain shape="circle" size="small" color="#007aff">关注TA</u-button>
      </view>
      <view class="icon">
        <uni-icons type="share" size="24" color="#666"></uni-icons>
      </view>
    </view>

    <!-- 帖子内容 -->
    <view class="post-content">
      <swiper v-if="post.images && post.images.length > 0" indicator-dots autoplay circular>
        <swiper-item v-for="item in postDetailList.images" :key="item.id">
          <image :src="item.url" mode="aspectFill" />
        </swiper-item>
      </swiper>
      <view class="app-title">{{ postDetailList.title}}</view>
      <view class="app-content">
        {{ postDetailList.content }}
      </view>
      <view class="tags">
        <view class="tag">#{{ postDetailList.area }}</view>
      </view>
      <view class="info">
        <view class="time">{{ postDetailList.updateTime }}</view>
        <view class="location">广东</view>
      </view>
    </view>

    <!-- 评论区 -->
    <view class="comment-area">
      <view class="comment-bar">
        <view class="bar">
          <uni-icons type="chat" size="20" color="#666"></uni-icons>
          <text class="bar-text">总共{{ postDetailList.comments }}条评论</text>
        </view>
      </view>
      <view class="comment-list">
        <view class="comment-item">
          <image class="avatar" src="https://ai-public.mastergo.com/ai/img_res/298a09126b167b2389171cf1732d0efd.jpg  " mode="scaleToFill" />
          <view class="comment-content">
            <view class="info">
              <text class="name">blulu</text>
              <text class="desc">lv3</text>
            </view>
            <view class="content">哇好漂亮啊，下次我也要去</view>
            <view class="time">26分钟前</view>
          </view>
        </view>
        <view class="comment-item">
          <image class="avatar" src="/static/hotel-attctive/ava.png  " mode="scaleToFill" />
          <view class="comment-content">
            <view class="info">
              <text class="name">阿勒啊嘞</text>
              <text class="desc">lv2</text>
            </view>
            <view class="content">去东澳岛需要注意什么吗，我计划下周去</view>
            <view class="time">38分钟前</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="footer-bar">
      <view class="ava-input">
        <view class="bar-ava">
          <image
            src="/static/foodDetails/avatar2.jpg"
            mode="scaleToFill"
          />
        </view>
        <input class="bar-input" placeholder="说点什么..."/>
      </view>
      <view class="bar-icon-deta">
        <view class="bar-item" @click="addLikes">
          <uni-icons type="heart" size="24" :color="postDetailList.liked ? '#ff0000' : '#666'"></uni-icons>
          <text class="data-detail">{{ postDetailList.likes }}</text>
        </view>
        
        <view class="bar-item">
          <uni-icons type="star" size="24" color="#666" ></uni-icons>
          <text class="data-detail">{{ postDetailList.collect }}</text>
        </view>
        <view class="bar-item">
          <uni-icons type="chat" size="24" color="#666" ></uni-icons>
          <text class="data-detail">{{ postDetailList.comments }}</text>
        </view>
      </view>
      
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();

const post = ref({
  images: [
    {
      id: 1,
      url: "https://ai-public.mastergo.com/ai/img_res/8b2e19990586b743036f49f399c57074.jpg",
    },
  ]
});
const postId = ref(null);
const postDetailList = ref([]);
// 获取接收过来的id
onLoad((options) => {
  postId.value = options;
  console.log( "接受到的id",postId.value);
})

// 根据id获取帖子信息
onMounted(() => {
  getPostList()
})

const getPostList = async () => {
  console.log(postId.value);
  console.log(userStore.token);
  
  
  const res = await uni.request({
    url: 'https://island.zhangshuiyi.com/island/posts/postDetail',
    method: 'GET',
    data: {
      id: postId.value.id
    },
    header: {
      'Content-Type': 'x-www-form-urlencoded',
      'X-Access-Token': userStore.token
    }
  })
  console.log(res.data);
  
  if (res.data.code === 200) {
    postDetailList.value = res.data.result;
    console.log("获取到的帖子信息", postDetailList.value);

  }
}

// 点赞
const addLikes = async () => {
  let operation = ref(0);
    if (postDetailList.value.liked === false) {
      operation.value = 1;
    } else {
      operation.value = 0;
    }
  console.log(operation.value);

  const res = await uni.request({
    url: 'https://island.zhangshuiyi.com/island/posts/like',
    method: 'POST',
    data: {
      // 	1 点赞 --- 0 取消点赞
      operation: operation.value,
      postsId: postId.value.id,
      type: 0
    },
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token
    }
  })
  console.log(res.data);
  if (res.data.code === 200) {
    operation.value = 0;
    postDetailList.value.liked = !postDetailList.value.liked;
    postDetailList.value.likes = postDetailList.value.liked ? postDetailList.value.likes + 1 : postDetailList.value.likes - 1;
  }
}



</script>

<style lang="scss" scoped>
page {
  background-color: #fff !important;
}

.app-container {
  padding: 20rpx;
}

.author-info {
  position: sticky;
  top: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  width: 100%;
  border-bottom: solid 1px #eee;
  padding: 20rpx 25rpx;
  background-color: #fff;

  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 20rpx;
    margin-right: 20rpx;
  }

  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .name {
      font-size: 32rpx;
      font-weight: bold;
      margin-right: 20rpx;
    }

    .desc {
      font-size: 24rpx;
      color: #999;
    }
  }

  .button {
    width: 100rpx;
    margin-left: auto;
    margin-right: 30rpx;
    border: solid 1px #ff8a2b;
    padding: 10px;
    border-radius: 10px;
    font-size: 14px;
    color: #ff8a2b;
  }

  .icon {
    margin-right: 20rpx;
  }
}

.post-content {
  margin-top: 20rpx;
  width: 100%;
  border-bottom: solid 1px #eee;
  padding-bottom: 20rpx;

  swiper {
    width: 100%;
    height: 400rpx;
    background-color: #fff;
    margin-bottom: 20rpx;

    swiper-item {
      width: 100%;
      height: 100%;

      image {
        width: 100%;
      }
    }
  }

  .app-title {
    font-size: 36rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
    color: #3078c5;
  }

  .app-content {
    font-size: 32rpx;
    color: #333;
    margin-bottom: 20rpx;
    line-height: 1.5;
    // 首行缩进
    text-indent: 2em;
  }

  .tags {
    display: flex;
    margin-top: 20rpx;

    .tag {
      font-size: 28rpx;
      color: #007aff;
      margin-right: 20rpx;
    }
  }

  .info {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: #999;

    .time {
      margin-right: 20rpx;
    }

    .location {
      margin-right: 20rpx;
    }
  }
}

.comment-area {
  margin-top: 20rpx;

  .comment-bar {
    display: flex;
    margin-top: 20rpx;

    .bar {
      font-size: 28rpx;
      color: #666;
      background-color: #eee;
      width: 400rpx;
      display: flex;
      align-items: center;
      padding: 0 30rpx;
      border-radius: 50rpx;
      height: 60rpx;
    }
  }

  .comment-list {
    margin-top: 20rpx;

    .comment-item {
      display: flex;
      margin-top: 20rpx;
      padding-bottom: 20rpx;
      border-bottom: solid 1px #eee;

      .avatar {
        width: 60rpx;
        height: 60rpx;
        min-width: 60rpx;
        max-width: 60rpx;
        overflow: hidden;
        border-radius: 30rpx;

        image {
          width: 100%;
          height: 100%;
        }
      }

      .comment-content {
        display: flex;
        flex-direction: column;
        font-size: 28rpx;
        flex: 1;
        margin-left: 20rpx;

        .info {
          display: flex;
          align-items: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 1em;

          .name {
            font-size: 28rpx;
            color: #333;
            font-weight: bold;
            margin-right: 10rpx;
          }

          .desc {
            font-size: 24rpx;
            color: #999;
          }
        }

        .content {
          margin-top: 5rpx;
          color: #333;
        }

        .time {
          font-size: 24rpx;
          color: #999;
          margin-top: 5rpx;
        }
      }
    }
  }
}

.footer-bar {
  position: fixed;
  z-index: 10;
  bottom: 0;
  width: 100%;
  height: 100rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  // padding: 0 25rpx;
  display: flex;
  flex-direction: row;
  align-items: center;

  
  .bar-ava {
    width: 80rpx;
    height: 80rpx;
    border-radius: 20rpx;
    overflow: hidden;
    image {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }
  .ava-input {
    display: flex;
    align-items: center;
    align-content: center;
    height: 100%;
    width: 65%;
  }

  .bar-input {
    width: 50%;
    height: 80rpx;
    border-radius: 28rpx;
    background-color: #eee;
    padding: 0 20rpx; /* 添加内边距 */
    font-size: 28rpx; /* 设置字体大小 */
    margin-left: 20px;
  }
  .bar-icon-deta {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

 .bar-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-right: 10rpx;
    font-size: 24rpx;
    color: #666;
    padding: 0 20rpx;
    height: 100%;
    justify-content: center;
  }
  

  
}

</style>