<template>
  <view class="container">
    <view class="header" :style="{ paddingTop: `${statusBarHeight}px` }">
      <view class="back-btn" @click="goBack">
        <uni-icons :type="activity.icons.back" :size="activity.iconSize"></uni-icons>
      </view>
      <text class="title">{{ activity.type }}</text>
      <view class="share-btn">
        <uni-icons :type="activity.icons.share" :size="activity.iconSize"></uni-icons>
      </view>
    </view>

    <view class="activity-image-wrapper">
      <image :src="activity.image" class="activity-image"></image>
      <image
        :src="activity.isFavorite ? activity.icons.favoriteFilled : activity.icons.favorite"
        class="favorite-btn"
        @click="toggleFavorite"
      />
    </view>

    <view class="activity-info">
      <text class="activity-name">{{ activity.title }}</text>
      <view class="price-container">
        <text class="price">{{ activity.price }}</text>
        <text class="price-unit">{{ activity.priceUnit }}</text>
      </view>

      <view class="rating-container">
        <uni-icons v-for="(star, index) in activity.ratingStars" :key="index" :type="activity.icons.star"
          :size="activity.iconSize" :color="activity.starColor">
        </uni-icons>
        <text class="rating">{{ activity.ratingText }}</text>
      </view>
    </view>

    <view class="activity-schedule">
      <text class="section-title">{{ activity.sections.schedule }}</text>

      <view class="schedule-item" v-for="(schedule, index) in activity.schedules" :key="index">
        <image :src="schedule.icon" class="schedule-icon"></image>
        <view class="schedule-content">
          <text class="time">{{ schedule.time }}</text>
          <text class="description">{{ schedule.description }}</text>
        </view>
      </view>
    </view>

    <view class="precautions">
      <text class="section-title">{{ activity.sections.precautions }}</text>
      <view class="precaution-item" v-for="(precaution, index) in activity.precautions" :key="index">
        <text class="precaution-text">{{ precaution }}</text>
      </view>
    </view>

    <view class="cost-explanation">
      <text class="section-title">{{ activity.sections.cost }}</text>

      <view class="cost-section">
        <text class="cost-title">{{ activity.costSections.included }}</text>
        <view class="cost-item" v-for="(included, index) in activity.costs.included" :key="index">
          <text class="checkmark">{{ activity.icons.checkmark }}</text>
          <text class="cost-text">{{ included }}</text>
        </view>
      </view>

      <view class="cost-section">
        <text class="cost-title">{{ activity.costSections.notIncluded }}</text>
        <view class="cost-item" v-for="(notIncluded, index) in activity.costs.notIncluded" :key="index">
          <uni-icons :type="activity.icons.close" :size="activity.iconSize" :color="activity.closeColor">
          </uni-icons>
          <text class="cost-text">{{ notIncluded }}</text>
        </view>
      </view>
    </view>

    <view class="bottom-bar" :style="{ paddingBottom: `${safeAreaInsets.bottom || 0}px` }">
      <view class="price-info">
        <text class="price-label">{{ activity.priceLabel }}</text>
        <view class="price-wrapper">
          <text class="price-value">{{ activity.price }}</text>
          <text class="price-unit">{{ activity.priceUnit }}</text>
        </view>
      </view>
      <button class="register-btn" @click="goToRegistration(activity.id)">
        <text class="register-text">{{ activity.registerText }}</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/modules/user';

const safeAreaInsets = ref({ bottom: 0 });
const statusBarHeight = ref(0);
const userStore = useUserStore();

// 活动详情数据对象
const activity = reactive({
  // 图标和图片路径
  icons: {
    back: 'back',
    share: 'share',
    star: 'star-filled',
    favorite: 'https://wuminghui.top:9000/wlmtsys/2025/06/02/bdbcc6765ad1473db6006f58c9f85c2b.png',
    favoriteFilled: 'https://wuminghui.top:9000/wlmtsys/2025/06/02/cc5ab661265043c6a3ae2f8514a38af2.png',
    checkmark: '√',
    close: 'close',
    time: '/static/activity/time.png',
    swim: '/static/activity/swim.png',
    food: '/static/activity/food.png'
  },

  // 图标和颜色配置
  iconSize: 24,
  starColor: '#FFD700',
  closeColor: '#FF6B6B',

  // 基本活动信息
  id: 1,
  image: 'https://wuminghui.top:9000/travel/diving.jpg',
  type: '深潜探索',
  title: '海底世界深潜体验',
  price: '¥368',
  priceUnit: '起/人',
  ratingText: '4.8 (1280人评价)',
  favoriteText: '收藏',
  ratingStars: 5,
  priceLabel: '起始价格',
  registerText: '立即报名',

  // 章节标题
  sections: {
    schedule: '活动流程',
    precautions: '注意事项',
    cost: '费用说明'
  },

  // 费用章节
  costSections: {
    included: '费用包含',
    notIncluded: '费用不含'
  },

  // 活动流程
  schedules: [
    {
      time: '09:00 集合出发',
      description: '在指定地点集合，进行安全说明',
      icon: '/static/activity/time.png'
    },
    {
      time: '10:00 潜水培训',
      description: '专业教练指导潜水技巧和安全知识',
      icon: '/static/activity/swim.png'
    },
    {
      time: '12:00 午餐休息',
      description: '享用精致午餐，补充体力',
      icon: '/static/activity/food.png'
    }
  ],

  // 注意事项
  precautions: [
    '参与者需年满18周岁，请携带有效身份证件',
    '活动期间请听从教练指导，确保安全',
    '建议穿着轻便泳装，可自备防晒用品'
  ],

  // 费用说明
  costs: {
    included: [
      '专业潜水装备租赁',
      '专业教练一对一指导',
      '午餐及饮用水'
    ],
    notIncluded: [
      '往返交通费用',
      '个人消费项目'
    ]
  },

  isFavorite: false,
});

// 方法定义
const goBack = () => {
  uni.navigateBack();
};

const goToRegistration = (id) => {
  console.log("活动页面传递给下一个页面的id：", id)
  uni.navigateTo({
    url: `/pages/activityRegistration/activityRegistration?id=${id}`
  });
};

const toggleFavorite = async () => {
  // 1. 切换本地收藏状态（可选，建议等接口成功后再切换）
  // activity.isFavorite = !activity.isFavorite;

  // 2. 组装请求体
  const operation = activity.isFavorite ? 0 : 1; // 当前已收藏则取消，否则收藏
  const dto = {
    operation,
    productId: activity.id,
    productName: activity.title,
    priductImage: activity.image,
    productType: 'FeaturedRoute', // 或其他类型，按实际业务
    userId: userStore.userInfo?.id || ''
  };

  // 3. 发起请求
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/island/productCollect/collectProduct',
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token
    },
    data: dto,
    success: (res) => {
      if (res.data.code === 200 && res.data.success) {
        activity.isFavorite = !activity.isFavorite;
        uni.showToast({
          title: operation === 1 ? '已收藏' : '已取消收藏',
          icon: 'success'
        });
      } else {
        uni.showToast({
          title: res.data.message || '操作失败',
          icon: 'none'
        });
      }
    },
    fail: (err) => {
      uni.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    }
  });
};

// 调用接口获取活动详细信息
const getActivityDetailsById = (id) => {
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/product/ilActivities/queryById',
    method: 'GET',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token || ''
    },
    data: { id: id },
    success: (res) => {
      console.log("获取活动详情成功:", res.data);
      if (res.data.code === 200 && res.data.result) {
        const result = res.data.result;

        // 更新活动基本信息
        activity.id = result.id || activity.id;
        activity.image = result.imageUrl || activity.image;
        activity.type = result.type || activity.type;
        activity.title = result.title || activity.title;
        activity.price = result.price ? `¥${result.price}` : activity.price;
        activity.priceUnit = result.priceUnit || activity.priceUnit;

        // 更新评分信息
        activity.ratingText = result.rating
          ? `${result.rating} (${result.ratingCount || 0}人评价)`
          : activity.ratingText;

        // 更新活动流程
        if (result.schedules && result.schedules.length) {
          activity.schedules = result.schedules.map((schedule, index) => ({
            time: schedule.time || `时间段 ${index + 1}`,
            description: schedule.description || '活动描述',
            icon: schedule.icon || '/static/activity/time.png'
          }));
        }

        // 更新注意事项
        if (result.precautions && result.precautions.length) {
          activity.precautions = result.precautions;
        }

        // 更新费用说明
        if (result.costs) {
          activity.costs = {
            included: result.costs.included || activity.costs.included,
            notIncluded: result.costs.notIncluded || activity.costs.notIncluded
          };
        }
      }
    },
    fail: (err) => {
      console.error('获取活动详情失败:', err);
      uni.showToast({
        title: '网络错误，请重试',
        icon: 'none',
        duration: 2000
      });
    },
  });
};

// 生命周期钩子
onLoad((options) => {
  console.log('活动详情页面收到的ID:', options.id);
  const activityId = options.id || 1;
  getActivityDetailsById(activityId);
  console.log("token为：", userStore.token)
});

onShow(() => {
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 0;
  safeAreaInsets.value = systemInfo.safeAreaInsets || { bottom: 0 };
});
</script>

<style scoped>
.container {
  background-color: #f7f7f7;
  padding: 0 20px;
  padding-top: v-bind('statusBarHeight + "px"');
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  background-color: #fff;
}

.title {
  font-size: 24px;
  font-weight: bold;
}

.activity-image-wrapper {
  position: relative;
  width: 100%;
  height: 240px;
}

.activity-image {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

.favorite-btn {
  position: absolute;
  top: 120%;
  right: 16px;
  width: 32px;
  height: 32px;
  z-index: 2;
}

.activity-info {
  background-color: #fff;
  padding: 20px;
  margin-top: 10px;
  position: relative;
}

.activity-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.price-container {
  display: flex;
  align-items: baseline;
  margin-bottom: 10px;
}


.price {
  font-size: 24px;
  /* 钱的颜色 */
  color: #007AFF;
  color: rgb(255, 105, 5);
  font-weight: bold;
}

.price-unit {
  font-size: 14px;
  color: #666;
  margin-left: 5px;
}

.rating-container {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.rating {
  margin-left: 10px;
  font-size: 14px;
  color: #666;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 20px 0 10px;
  padding-left: 10px;
  border-left: 4px solid #007AFF;
}

.schedule-item {
  display: flex;
  margin-bottom: 15px;
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.schedule-icon {
  width: 30px;
  height: 30px;
  margin-right: 10px;
}

.schedule-content {
  flex: 1;
}

.time {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.description {
  font-size: 14px;
  color: #666;
  margin-left: 0px;
  display: block;
}

.precautions {
  background-color: #fff;
  padding: 20px;
  margin-top: 10px;
}

.precaution-item {
  margin-bottom: 10px;
  padding-left: 20px;
  position: relative;
}

.precaution-item:before {
  content: "!";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background-color: #FF6B6B;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 12px;
}

.cost-explanation {
  background-color: #fff;
  padding: 20px;
  margin-top: 10px;
}

.cost-section {
  margin-bottom: 20px;
}

.cost-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  padding: 10px 0;
  /* 增加上下间距 */
  border-bottom: 1px solid #f0f0f0;
  /* 可选，用于分隔费用包含和费用不含 */
}

.cost-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.checkmark {
  color: #007AFF;
  font-size: 16px;
  margin-right: 10px;
}

.cost-text {
  font-size: 14px;
}

.bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #fff;
  margin-top: 20px;
  border-top: 1px solid #eee;
}

.price-info {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 14px;
  color: #666;
}

.price-wrapper {
  display: flex;
  align-items: baseline;
}

.price-value {
  font-size: 20px;
  /* 钱的颜色 */
  color: #007AFF;
  color: rgb(255, 105, 5);
  font-weight: bold;
}

.price-unit {
  font-size: 14px;
  color: #666;
  margin-left: 5px;
}

.register-btn {
  background-color: #007AFF;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  font-size: 14px;
  border: none;
  margin-left: auto;
  margin-right: 10px;
}
</style>