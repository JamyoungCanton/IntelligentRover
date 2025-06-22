<template>
  <view class="app-container">
    <!-- 用户信息 -->
    <view class="author-info">
      <image
        class="app-avatar avatar"
        :src="postDetailList.userVO.avatar || defaultAvatar"
        mode="scaleToFill"
      />
      <view class="info">
        <view class="name">{{ postDetailList.userVO.username}}</view>
        <view class="desc">lv3</view>
      </view>
      <view class="follow-btn" @click="toggleFollowAuthor">
        <text :class="['btn-text', isFollowing ? 'following' : '']">
          {{ isFollowing ? '已关注' : '关注TA' }}
        </text>
      </view>
      <view class="icon">
        <uni-icons type="share" size="24" color="#666"></uni-icons>
      </view>
    </view>

    <!-- 帖子内容 -->
    <view class="post-content">
      <swiper v-if="postDetailList.images && postDetailList.images.length > 0" indicator-dots autoplay circular>
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
          <text class="bar-text">总共{{ commentCount }}条评论</text>
        </view>
      </view>
      <view class="comment-list">
        <!-- 评论项 -->

        <view class="comment-item" @click="showSubPopup(item,$event)" v-for="(item) in commentList" :key="item.id">
          <image class="avatar" :src="item.userVO.avatar || defaultAvatar" mode="scaleToFill" />
          <view class="comment-content">
            <view class="info">
              <text class="name">{{item.userVO.username}}</text>
              <text class="desc">lv3</text>
            </view>
            <view class="content">{{ item.content}}</view>
            <view class="time">{{ formatRelativeTime(item.createTime) }}</view>

            <!-- 子评论 -->
            <view v-if="item.children.length > 0" class="sub-comments">
              <view class="sub-comment-header">
                <text>共 {{ item.children.length }} 条回复</text>
              </view>
              <view class="sub-comment-item" @click="showSubPopup(sub,$event)"  v-for="(sub) in item.children" :key="sub.id">
                <view class="sub-comment-header">
                  <view class="sub-header-left">
                    <image
                      class="avatar"
                      :src="sub.userVO.avatar || defaultAvatar"
                      mode="aspectFill"
                    />
                    <text class="name">{{ sub.userVO.username }}</text>
                  </view>
                  <text class="time">{{ formatRelativeTime(sub.createTime) }}</text>
                </view>
                <view class="comment-content">
                  <view class="content">{{ sub.content }}</view>
                </view>
              </view>
            </view>
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
        <view class="bar-input" @click="showEditComment">说点什么...</view>
      </view>
      <view class="bar-icon-deta">
        <view class="bar-item" @click="addLikes">
          <uni-icons type="heart" size="24" :color="postDetailList.liked ? '#ff0000' : '#666'"></uni-icons>
          <text class="data-detail">{{ postDetailList.likes }}</text>
        </view>
        
        <view class="bar-item" @click="addCollect">
          <uni-icons type="star" size="24" :color="postDetailList.collected ? '#ff0000' : '#666'" ></uni-icons>
          <text class="data-detail">{{ postDetailList.collect }}</text>
        </view>
        <view class="bar-item" @click="showEditComment">
          <uni-icons type="chat" size="24" color="#666" ></uni-icons>
          <text class="data-detail"> {{ commentCount }} </text>
        </view>
      </view>
      
    </view>

    <!-- 评论框 -->
    <uni-popup ref="popup" background-color="#fff" type="bottom" @change="handlePopupChange">
      <view class="popup-content">
        <view class="input-send-container">
          <input 
            v-model="commentContent" 
            class="popup-input" 
            placeholder="请发表你的看法吧~"
            :focus="inputFocus"
            @blur="inputFocus = false"
          />
          <button @click="sendComment" class="send-btn">发送</button>
        </view>
      </view>
    </uni-popup>

    <!-- 子评论弹窗 -->
    <uni-popup ref="subPopup" background-color="#fff"  type="bottom" >
      <view class="popup-content" :class="{ 'popup-height': type === 'left' || type === 'right' }">
        <view class="sub-select-opration">
          <view class="sub-userInfo">
            <text class="sub-username-comment">@{{ currentUserName }} {{ currentContent }}</text>
          </view>
          <button class="sub-btn" @click="showEditComment">回复</button>
          <button class="sub-btn">复制</button>
          <button class="sub-btn">删除</button>
          <button class="sub-btn" @click="closeSubPopup">取消</button>
        </view>

      </view>
          
    </uni-popup>
    
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();

const type = ref('');

const isFollowing = ref(false);

// 时间转换函数
const formatRelativeTime = (time) => {
  const currentTime = new Date();
  const targetTime = new Date(time);
  const diff = currentTime - targetTime;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;

  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前';
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前';
  } else if (diff < week) {
    return Math.floor(diff / day) + '天前';
  } else if (diff < month) {
    return Math.floor(diff / week) + '周前';
  } else {
    return Math.floor(diff / month) + '个月前';
  }
};


const popup = ref(null);

const inputFocus = ref(false);

// 处理弹窗状态变化
const handlePopupChange = (e) => {
  if (e.show) {
    // 弹窗显示时，延迟设置输入框焦点
    setTimeout(() => {
      inputFocus.value = true;
    }, 100);
  } else {
    inputFocus.value = false;
  }
};

// 显示评论输入框
const showEditComment = () => {
  if (subPopup.value) {
    subPopup.value.close();
  }
  if (popup.value) {
    popup.value.open();
  }
};


const subPopup = ref(null);
// 当前评论id
const currentCommentId = ref(null);
const currentParentId = ref(null);
const currentUserName = ref(null);
const currentContent = ref('');
// 子评论弹窗
const showSubPopup = (item,event) => {
  event.stopPropagation(); 
  currentCommentId.value = item.id;
  currentParentId.value = item.fatherId;
  currentUserName.value = item.userVO.username;
  currentContent.value = item.content;
  console.log('当前评论id:', currentCommentId.value);
  console.log('当前评论的父id:', currentParentId.value)  

  if (subPopup.value) {
    subPopup.value.open();
  }
};

// 关闭弹窗
const closeSubPopup = () => {
  if (subPopup.value) {
    subPopup.value.close();
  }
};

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

})

// 根据id获取帖子信息
onMounted(() => {
  getPostList(),
  getCommentCount(),
  getCommentList(),
  setTimeout(checkIsFollowing, 500); // 延迟确保postDetailList已获取
})

const getPostList = async () => {
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
  if (res.data.code === 200) {
    postDetailList.value = res.data.result;
    isFollowing.value = !!res.data.result.focused; // 直接用接口返回的 focused 字段
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

  if (res.data.code === 200) {
    operation.value = 0;
    postDetailList.value.liked = !postDetailList.value.liked;
    postDetailList.value.likes = postDetailList.value.liked ? postDetailList.value.likes + 1 : postDetailList.value.likes - 1;
  }
}

// 收藏
const addCollect = async () => {
  const operation = postDetailList.value.collected ? 0 : 1;
  const res = await uni.request({
    url: 'https://island.zhangshuiyi.com/island/posts/collect',
    method: 'POST',
    data: {
      operation,
      postsId: postId.value.id
    },
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token
    }
  });
  console.log('收藏接口返回数据:', res.data);
  if (res.data.code === 200) {
    postDetailList.value.collected = !postDetailList.value.collected;
    if (postDetailList.value.collected) {
      postDetailList.value.collect += 1;
    } else {
      postDetailList.value.collect = Math.max(0, postDetailList.value.collect - 1);
    }
    uni.showToast({ title: operation === 1 ? '已收藏' : '已取消收藏', icon: 'success' });
  } else {
    // 添加更友好的错误提示
    if (res.data.code === 500 && res.data.message.includes('product_id')) {
      uni.showToast({ 
        title: '收藏功能暂时不可用，请稍后再试', 
        icon: 'none',
        duration: 2000
      });
    } else {
      uni.showToast({ 
        title: res.data.message || '操作失败', 
        icon: 'none',
        duration: 2000
      });
    }
  }
};

// 获取评论个数
const commentCount = ref(0)
const getCommentCount = async () => {
  const res = await uni.request({
    url:`https://island.zhangshuiyi.com/island/comments/count/${postId.value.id}`,
    method: 'GET',
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token
    },
    
  })
  if (res.data.code === 200) {
    commentCount.value = res.data.result;
  }
  else{
    // 弹出错误信息
    uni.showToast({
      title: res.data.message,
      icon: 'none',
      duration: 2000
    })
  }
}


// 获取评论列表
const commentList = ref([])
const getCommentList = async () => {
  
  const res = await uni.request({
    url:`https://island.zhangshuiyi.com/island/comments/${postId.value.id}`,
    method: 'GET',
    header: {
      'Content-Type': 'x-www-form-urlencoded',
      'X-Access-Token': userStore.token
    }
  })
  console.log(res.data);
  
  if (res.data.code === 200) {
    commentList.value = res.data.result;
    console.log(commentList.value);
    

  }
}

// 内容审核函数
const checkContent = async (content, fieldName) => {
  if (!content) return true;
  try {
    const res = await uni.request({
      url: `https://island.zhangshuiyi.com/island/check/content/${encodeURIComponent(content)}`,
      method: 'GET',
      header: {
        'X-Access-Token': userStore.token,
      },
    });
    if (res.statusCode === 200 && res.data === true) {
      return true;
    } else {
      uni.showToast({
        title: `${fieldName}包含不合规内容，请修改`,
        icon: 'none',
      });
      return false;
    }
  } catch (err) {
    console.error('内容审核接口请求失败:', err);
    uni.showToast({ title: '内容审核失败，请稍后再试', icon: 'none' });
    return false;
  }
};

// 发送评论
const commentContent = ref('');
const sendComment = async () => {
  if (!commentContent.value.trim()) {
    uni.showToast({
      title: '请输入评论内容',
      icon: 'none'
    });
    return;
  }

  // 检查评论内容
  const contentIsValid = await checkContent(commentContent.value, '评论内容');
  if (!contentIsValid) {
    // 内容审核失败时，不关闭弹窗，让用户继续编辑
    return;
  }
  
  console.log(postId.value.id);
  console.log(commentContent.value);
  
  const res = await uni.request({
    url: 'https://island.zhangshuiyi.com/island/comments/save',
    method: 'POST',
    data: {
      content: commentContent.value,
      postId: postId.value.id,
      fatherId: currentCommentId.value || '',
      receiverId: currentCommentId.value,
      repliedCommentId:'',
    },
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token
    }
  });
  
  if (res.data.code === 200) {
    uni.showToast({
      title: '评论成功',
      icon: 'success'
    });
    getCommentList();
    getCommentCount();
    // 清空内容
    commentContent.value = '';
    // 关闭弹窗
    if (popup.value) {
      popup.value.close();
    }
  } else {
    uni.showToast({
      title: res.data.message || '评论失败',
      icon: 'none'
    });
  }
};

// 检查当前用户是否已关注该作者
const checkIsFollowing = () => {
  const authorId = postDetailList.value.userVO?.id || postDetailList.value.userVO?.userId;
  if (!authorId) return;
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/sys/user/queryFocusList',
    method: 'GET',
    header: {
      'X-Access-Token': userStore.token,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: (res) => {
      if (res.statusCode === 200 && res.data.code === 200) {
        const focusList = res.data.result?.records || [];
        isFollowing.value = focusList.some(user => String(user.id) === String(authorId));
      }
    }
  });
};

// 关注/取关作者
const toggleFollowAuthor = () => {
  const authorId = postDetailList.value.userVO?.id || postDetailList.value.userVO?.userId;
  if (!authorId) {
    uni.showToast({ title: '用户ID无效', icon: 'none' });
    return;
  }
  if (String(authorId) === String(userStore.userInfo.id)) {
    uni.showToast({ title: '不能关注自己', icon: 'none' });
    return;
  }
  if (isFollowing.value) {
    // 取关
    uni.showModal({
      title: '取消关注',
      content: `确定要取消关注 ${postDetailList.value.userVO?.username} 吗？`,
      success: (res) => {
        if (res.confirm) {
          uni.request({
            url: 'https://island.zhangshuiyi.com/island/sys/user/focus',
            method: 'POST',
            header: {
              'X-Access-Token': userStore.token,
              'Content-Type': 'application/json'
            },
            data: {
              focusId: authorId,
              operation: 2
            },
            success: (res) => {
              if (res.data.success) {
                isFollowing.value = false;
                uni.showToast({ title: '已取消关注', icon: 'success' });
              } else {
                uni.showToast({ title: res.data.message || '取消关注失败', icon: 'none' });
              }
            },
            fail: () => {
              uni.showToast({ title: '网络错误', icon: 'none' });
            }
          });
        }
      }
    });
  } else {
    // 关注
    uni.request({
      url: 'https://island.zhangshuiyi.com/island/sys/user/focus',
      method: 'POST',
      header: {
        'X-Access-Token': userStore.token,
        'Content-Type': 'application/json'
      },
      data: {
        focusId: authorId,
        operation: 1
      },
      success: (res) => {
        if (res.data.success) {
          isFollowing.value = true;
          uni.showToast({ title: '已关注', icon: 'success' });
        } else {
          uni.showToast({ title: res.data.message || '关注失败', icon: 'none' });
        }
      },
      fail: () => {
        uni.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  }
};

const defaultAvatar = 'https://static-typical-avatar-url.png';

// 优化：添加分页加载子评论
const subCommentPageSize = ref(3); // 初始加载 3 条子评论
const showAllSubComments = ref({}); // 记录每个评论是否显示全部子评论

const getDisplaySubComments = (comment) => {
  if (showAllSubComments.value[comment.id]) {
    return comment.children;
  }
  return comment.children.slice(0, subCommentPageSize.value);
};

const toggleShowAllSubComments = (comment) => {
  showAllSubComments.value[comment.id] = !showAllSubComments.value[comment.id];
};

</script>

<style lang="scss" scoped>
page {
  background-color: #fff !important;
  height: 100vh;
}

.app-container {
  padding: 20rpx;
}

.author-info {
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

  .follow-btn {
    margin-left: auto;
    margin-right: 30rpx;
    padding: 10rpx 30rpx;
    border-radius: 30rpx;
    background-color: #fff;
    border: 1px solid #007aff;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 120rpx;
    
    .btn-text {
      font-size: 28rpx;
      color: #007aff;
      
      &.following {
        color: #999;
        border-color: #999;
      }
    }
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
  width: 100%;
  padding-bottom: 20rpx;
  

  .comment-bar {
    display: flex;

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
    padding-bottom: 120rpx; /* 增加底部内边距，为底部输入框留出空间 */

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

      .sub-comment-item {
        margin-left: 8rpx; 
        padding: 5rpx 0; 
        border-left: 2rpx dashed #ccc; 
        background-color: #f9f9f9;
        border-radius: 10rpx; 

        .sub-comment-header {
          display: flex;
          align-items: center;
          align-content: center;
          justify-content: space-between; 
          margin-bottom: 5rpx;

          .sub-header-left {
            display: flex;
            align-items: center;
            align-content: center;
          }

          .avatar {
            border-radius: 50%;
            object-fit: cover;
            margin-right: 10rpx;
            display: block;
          }

          .name {
            font-size: 26rpx; /* 子评论用户名字体大小略小 */
            color: #555; /* 字体颜色稍暗 */
          }

          .time {
            font-size: 22rpx; /* 子评论时间字体大小略小 */
            color: #999;
            margin-right: 10px;
          }
        }

        .comment-content {
          .content {
            font-size: 26rpx; /* 子评论内容字体大小略小 */
            color: #666; /* 字体颜色稍暗 */
          }
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
    width: 70%;
    height: 80rpx;
    border-radius: 28rpx;
    background-color: #eee;
    padding: 0 20rpx;
    font-size: 28rpx;
    margin-left: 10px;
    display: flex;
    align-items: center;
    color: #999;
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


.popup-content {
  padding: 20rpx;
  background-color: white;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
}

.input-send-container {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
}

.popup-input {
  flex: 1;
  height: 80rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  margin-right: 20rpx;
}

.send-btn {
  width: 120rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background-color: #007aff;
  color: white;
  border-radius: 8rpx;
  font-size: 28rpx;
}

// 子弹窗
.sub-select-opration{
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
  justify-content: center;
}
.sub-userInfo{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding-bottom: 20rpx;
  border-bottom:  #d0cbcb solid 1rpx;
}
.sub-btn{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding-top: 20rpx;
  background-color: #fff;
  // 去除边框线
  border: none;
}
.sub-comments {
  margin-top: 10rpx;
  padding-left: 20rpx;

  .sub-comment-header {
    margin-bottom: 10rpx;
    color: #666;
    font-size: 24rpx;
  }

  .sub-comment-item {
    margin-bottom: 10rpx;
    padding: 10rpx;
    background-color: #f9f9f9;
    border-radius: 8rpx;
  }
}

.show-all-btn {
  color: #007aff;
  font-size: 24rpx;
  margin-top: 10rpx;
  text-align: center;
  cursor: pointer;
}
</style>