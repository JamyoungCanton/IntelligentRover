<template>
	<view class="container">
    <view class="main">
      <view class="hero">
        <image :src="shopMainImage || foodDetails?.imageUrl" class="hero-img" mode="aspectFill" />
      </view>

      <view class="intro-card">
        <view class="name-row">
          <text class="attraction-name">{{ foodDetails?.name || '加载中...' }}</text>
          <view class="collect-btn" :class="{ collected }" @tap="toggleCollect">
            <uni-icons :type="collected ? 'star-filled' : 'star'" size="20" :color="collected ? '#FFB020' : '#007aff'" />
            <text class="collect-text">{{ collected ? '已收藏' : '收藏' }}</text>
          </view>
        </view>
        
        <view class="section-header-line">
          <text class="section-title-active">餐厅介绍</text>
        </view>
        
        <view class="info-grid">
          <!-- 第一行：评分 和 地址 -->
          <view class="info-row-new">
             <view class="rating-box">
                <uni-rate :value="foodDetails?.rating || 4.6" size="14" readonly active-color="#FFB020" color="#E5E5E5" />
                <text class="rating-num">{{ foodDetails?.rating || 4.6 }}</text>
             </view>
             <view class="address-box">
                <text class="info-label-s">地址：</text>
                <text class="info-val-s text-ellipsis">{{ foodDetails?.address || '暂无地址' }}</text>
             </view>
          </view>
          
          <!-- 第二行：电话 和 营业时间 -->
          <view class="info-row-new">
             <view class="phone-box">
                <text class="info-label-s">电话：</text>
                <text class="info-val-s">{{ foodDetails?.phone || '暂无' }}</text>
             </view>
             <view class="hours-box">
                <text class="info-label-s">营业时间：</text>
                <text class="info-val-s">{{ formatTime(foodDetails?.starthour) }} - {{ formatTime(foodDetails?.endhour) }}</text>
             </view>
          </view>
        </view>
        
        <text class="intro-desc">{{ introText }}</text>
      </view>


      <view class="section ticket-section">
        <view><text class="section-title">餐位费</text></view>
        <view class="ticket-row">
          <view class="ticket-left"><text class="ticket-type">费用</text><text class="ticket-price">￥{{ foodDetails?.price || 0 }}</text></view>
          <button class="ticket-btn" @click="bookNow">立即购买</button>
        </view>
      </view>
      
      <!-- 菜单功能 (模仿图片效果) -->
      <view class="section menu-section">
        <view class="menu-header-row">
          <text class="menu-title-large">菜品</text>
          <view class="menu-view-all">
            <text>查看全部</text>
            <uni-icons type="right" size="14" color="#999" />
          </view>
        </view>
        
        <view class="menu-book-container">
          <!-- 顶部金色夹子 -->
          <view class="clip-top"></view>
          <!-- 纸张主体 -->
          <view class="menu-paper">
            <text class="menu-paper-title">菜单({{ menuItems.length }})</text>
            <view class="menu-grid">
              <view class="menu-grid-item" v-for="(item, index) in menuItems" :key="index">
                <text class="menu-item-en">{{ item.enName }}</text>
                <view class="menu-item-zh-row">
                  <text class="menu-item-zh">{{ item.name }}</text>
                  <view class="red-seal"></view>
                </view>
              </view>
            </view>
          </view>
          <!-- 底部金色横条 -->
          <view class="bar-bottom"></view>
        </view>
      </view>

      <view class="reviews-card">
        <view class="reviews-header"><text class="reviews-title">用户评价（{{ comments.length }}）</text></view>
        <view v-if="displayedComments.length === 0" class="no-comments">暂无评价</view>
        <view v-for="(item, idx) in displayedComments" :key="item.id || idx" class="review-item">
          <view class="review-user">
            <image :src="(item.avatar && String(item.avatar).replace(/[`\s]/g,'')) || '/static/my/default-avatar.png'" class="review-avatar" />
            <view class="review-user-info">
              <text class="review-username">{{ item.username || '匿名用户' }}</text>
              <text class="review-time">{{ item.createTime }}</text>
            </view>
          </view>
          <view class="review-content">{{ item.comment }}</view>
          <view v-if="itemMergedImages(item).length" class="review-images">
            <image v-for="(img, i) in itemMergedImages(item)" :key="i" :src="img" class="review-img" mode="aspectFill" />
          </view>
        </view>
        <view v-if="!showAllComments && comments.length > 3" class="show-more" @click="toggleComments">查看更多</view>
      </view>
    </view>
	</view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/modules/user';

const safeAreaInsets = ref({});
const statusBarHeight = ref(0);
const foodDetails = ref(null);
const userStore = useUserStore();
const id = ref('');
const shopMainImage = ref('');
const isIntroUnfolded = ref(false);
const shopPhotos = ref([]);
const comments = ref([]);
const showAllComments = ref(false);
const displayedComments = computed(() => showAllComments.value ? comments.value : comments.value.slice(0, 3));

// 菜单数据 (结构化数据)
const menuItems = ref([
  { name: '香辣酸菜鱼', enName: 'Spicy Pickled Fish' },
  { name: '罐香坛子肉', enName: 'Fragrant Jar Meat' },
  { name: '当家鲜炒黄牛肉', enName: 'Homemade Fried Yellow Beef' },
  { name: '仿入湘当家坛子肉', enName: 'Imitation Hunan Dangjia Jar Meat' },
]);

// 获取餐厅详情
const getRestaurantDetailsById = (id) => {
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/product/ilDining/queryById',
    method: 'GET',
    data: { id },
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token || ''
    },
    success: (res) => {
      console.log('餐厅详情接口返回数据:', res.data);
      if (res.data && res.data.result) {
        const details = res.data.result;
        console.log('餐厅详情result字段:', details);
        foodDetails.value = details;
        comments.value = (details.comments || []).map(c => ({
          ...c,
          avatar: typeof c.avatar === 'string' ? c.avatar.replace(/[`\s]/g, '') : c.avatar
        }));
				
				// 处理店铺实拍图片：优先使用传入的图片数据，如果传入的图片为空，再使用后端返回的图片
				if (shopPhotos.value && shopPhotos.value.length > 0) {
					console.log('店铺实拍使用传入的图片数据:', shopPhotos.value);
				} else if (details.images && Array.isArray(details.images)) {
					const processedPhotos = details.images.reduce((acc, imgStr) => {
						if (imgStr && typeof imgStr === 'string') {
							const urls = imgStr.split(',').map(url => url.trim()).filter(url => url);
							return [...acc, ...urls];
						}
						return acc;
					}, []);
					shopPhotos.value = processedPhotos;
					console.log('店铺实拍使用后端返回的图片数据:', shopPhotos.value);
				} else {
					shopPhotos.value = [];
					console.log('店铺实拍没有可用的图片数据');
				}
				
				// 如果后端返回的id为0或null，补上
				if (!details.id) foodDetails.value.id = id;
			}
		}
	});
};

// 星级渲染函数
const renderStars = (rating) => {
	if (!rating && rating !== 0) {
		return Array(5).fill({ type: 'star', color: '#CCCCCC' });
	}

	const stars = [];
	const fullStars = Math.floor(rating);
	const halfStar = rating % 1 >= 0.5;

	for (let i = 0; i < fullStars; i++) {
		stars.push({ type: 'star-filled', color: '#FFCC00' });
	}

	while (stars.length < 5) {
		stars.push({ type: 'star', color: '#CCCCCC' });
	}

	return stars;
};

// 展开/收起介绍
const toggleIntro = () => {
	isIntroUnfolded.value = !isIntroUnfolded.value;
};

// 切换评论显示
const toggleComments = () => {
	showAllComments.value = true;
};

// 获取评论
const getComments = async () => {
  const res = await uni.request({
    url: 'https://island.zhangshuiyi.com/island/il-user-comments/list',
    method: 'GET',
    data: { productId: id.value, type: 'Dining' },
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token
    }
  });
  if (res.data && res.data.success && Array.isArray(res.data.result) && res.data.result.length > 0) {
    comments.value = res.data.result.map(c => ({
      ...c,
      avatar: typeof c.avatar === 'string' ? c.avatar.replace(/[`\s]/g, '') : c.avatar
    }));
    console.log('评论列表(独立接口):', comments.value);
  } else {
    console.log('评论列表接口未返回有效数据，保留详情接口中的评论');
  }
};

// 获取有效的图片数组
function getValidImages(images) {
  if (!images) return [];
  if (Array.isArray(images)) return images.filter(Boolean);
  if (typeof images === 'string') return images.split(',').filter(Boolean);
  return [];
}

const itemMergedImages = (item) => {
  const imgs = item.images || item.imageList || item.pics || '';
  if (Array.isArray(imgs)) return imgs.map(s => String(s).replace(/[`\s]/g,'')).filter(Boolean);
  if (typeof imgs === 'string') return imgs.split(',').map(s => s.trim().replace(/[`\s]/g,'')).filter(Boolean);
  return [];
};

onLoad((options) => {
	console.log('饮食详情页面收到的参数:', options);
	
	if (!options.id) {
		uni.showToast({
			title: '参数错误',
			icon: 'none',
			duration: 2000
		});
		setTimeout(() => {
			uni.navigateBack();
		}, 2000);
		return;
	}
	
	id.value = options.id;
	
	if (options.startTime && options.endTime) {
		timeRange.value.start = formatTime(decodeURIComponent(options.startTime));
		timeRange.value.end = formatTime(decodeURIComponent(options.endTime));
	}

	// 处理传入的图片数据
	if (options.images) {
		try {
			const images = JSON.parse(decodeURIComponent(options.images));
			console.log('成功解析传入的图片数据:', images);
			// 将传入的图片数据设置到shopPhotos中（店铺实拍）
			if (Array.isArray(images) && images.length > 0) {
				shopPhotos.value = images;
				// 使用第一张图片作为主图片
				shopMainImage.value = images[0];
			}
		} catch (e) {
			console.error('解析图片数据失败:', e);
		}
	}

	// 如果通过imageURL参数传入图片，也设置到shopMainImage
	if (options.imageURL) {
		shopMainImage.value = decodeURIComponent(options.imageURL);
	}

	getRestaurantDetailsById(id.value);
	getComments();
	checkCollected();
});

onMounted(() => {
	const { statusBarHeight: sbHeight, safeAreaInsets: insets } = uni.getSystemInfoSync();
	statusBarHeight.value = sbHeight;
	safeAreaInsets.value = insets;
});

// 方法
const goBack = () => {
	uni.navigateBack({
		delta: 1 // 返回上一页
	});
};

const share = () => {
	console.log('分享店铺');
};

const callPhone = () => {
	console.log('拨打电话');
};

const navigate = () => {
	console.log('打开导航');
};

const book = () => {
	console.log('打开预订页面');
};

// 添加时间选择相关的响应式变量
const diningDate = ref('');
const diningTime = ref('');
const timeRange = ref({
	start: '10:00',
	end: '22:00'
});

// 获取今天的日期字符串
const today = new Date();
const pad = (n) => n < 10 ? '0' + n : n;
const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

// 格式化时间函数
const formatTime = (timeString) => {
	if (!timeString) return '';
	const [hours, minutes] = timeString.split(':');
	return `${hours}:${minutes || '00'}`;
};

// 日期选择处理函数
const onDiningDateChange = (e) => {
	diningDate.value = e.detail.value;
	console.log('选择的日期:', diningDate.value);
};

// 修改 bookNow 函数
const bookNow = () => {
  console.log('点击预订按钮');
  console.log('当前餐厅信息:', foodDetails.value);
  
  // 检查是否获取到了餐厅详情
  if (!foodDetails.value || !foodDetails.value.id) {
    uni.showToast({
      title: '请先获取餐厅信息',
      icon: 'none',
      duration: 2000
    });
    return;
  }
  if (!userStore.token) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/login/login' });
    }, 800);
    return;
  }
  const dateValue = diningDate.value || todayStr;
  const startTime = (timeRange.value.start || '10:00').length === 5
    ? timeRange.value.start + ':00'
    : timeRange.value.start || '10:00:00';
  const endTime = (timeRange.value.end || '22:00').length === 5
    ? timeRange.value.end + ':00'
    : timeRange.value.end || '22:00:00';

  const startDateTime = `${dateValue} ${startTime}`;
  const endDateTime = `${dateValue} ${endTime}`;

  const orderData = {
    contract: {
      contractName: userStore.userInfo?.realname || '游客',
      contractPhone: userStore.userInfo?.phone || '13800138000'
    },
    items: [
      {
        bookInfo: {
          date: dateValue,
          fullname: userStore.userInfo?.realname || '游客',
          idCardNo: userStore.userInfo?.idCardNo || '110101199001011234',
          idCardType: "ID_CARD",
          schedule: `${startTime}-${endTime}`
        },
        productId: foodDetails.value.id,
        productType: "Dining",
        quantity: 1,
        price: Number(foodDetails.value.price || foodDetails.value.priceaverage || 0),
        amount: Number(foodDetails.value.price || foodDetails.value.priceaverage || 0),
        name: foodDetails.value.name,
        image: foodDetails.value.imageUrl || foodDetails.value.image,
        specs: `${startTime}-${endTime}`
      }
    ],
    travelStartDate: startDateTime,
    travelEndDate: endDateTime
  };

  console.log('订单数据(创建前):', orderData);

  uni.request({
    url: 'https://island.zhangshuiyi.com/island/front/order/createOrder',
    method: 'POST',
    data: orderData,
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token || ''
    },
    success: (res) => {
      console.log('创建订单响应:', res.data);
      if (res.data && (res.data.success || res.data.code === 200) && res.data.result) {
        const orderSn = res.data.result.orderSn || res.data.result.id || '';
        const item = {
          id: foodDetails.value.id,
          name: foodDetails.value.name,
          type: foodDetails.value.type,
          ticketprice: Number(foodDetails.value.price || foodDetails.value.priceaverage || 0),
          starttime: formatTime(foodDetails.value.starthour || timeRange.value.start),
          endtime: formatTime(foodDetails.value.endhour || timeRange.value.end)
        };
        const itemsParam = encodeURIComponent(JSON.stringify([item]));
        const orderSnsParam = encodeURIComponent(JSON.stringify(orderSn ? [orderSn] : []));
        const priceParam = encodeURIComponent(String(item.ticketprice || 0));
        uni.navigateTo({
          url: `/pages/multiConfirmPay/multiConfirmPay?items=${itemsParam}&orderSns=${orderSnsParam}&price=${priceParam}`
        });
      } else {
        uni.showToast({ title: res.data.message || '未能创建订单', icon: 'none' });
      }
    },
    fail: (err) => {
      console.error('创建订单失败:', err);
      uni.showToast({ title: '网络错误，请重试', icon: 'none' });
    }
  });
};

const handleImageError = (e) => {
	console.error('图片加载失败:', e);
	// 可以设置一个默认图片
	e.target.src = '/static/foodDetails/default.jpg';
};

const imageLoading = ref(true);

// 在 script setup 中添加
const userInfo = computed(() => userStore.userInfo || {});

const introText = computed(() => {
  const raw = foodDetails.value?.description || '';
  return String(raw).replace(/<[^>]*>/g, '').trim() || '暂无介绍';
});

const collected = ref(false);
const collecting = ref(false);
const extractCollectList = (resp) => {
  const r = resp?.data?.result;
  if (Array.isArray(r?.result)) return r.result;
  if (Array.isArray(r?.records)) return r.records;
  if (Array.isArray(resp?.data?.result)) return resp.data.result;
  return [];
};
const checkCollected = async () => {
  if (!userStore.token) { collected.value = false; return; }
  try {
    const res = await uni.request({
      url: 'https://island.zhangshuiyi.com/island/island/productCollect/myProduct',
      method: 'POST',
      header: { 'Content-Type': 'application/json', 'X-Access-Token': userStore.token },
      data: { productType: 'Dining', pageNo: 1, pageSize: 100 }
    });
    let list = [];
    if ((res.statusCode === 200 || res.statusCode === 0) && (res.data.success || res.data.code === 0)) {
      list = extractCollectList(res);
    }
    if (!list || list.length === 0) {
      const resAll = await uni.request({
        url: 'https://island.zhangshuiyi.com/island/island/productCollect/myProduct',
        method: 'POST',
        header: { 'Content-Type': 'application/json', 'X-Access-Token': userStore.token },
        data: { pageNo: 1, pageSize: 100 }
      });
      if ((resAll.statusCode === 200 || resAll.statusCode === 0) && (resAll.data.success || resAll.data.code === 0)) {
        list = extractCollectList(resAll);
      }
    }
    const pid = String(foodDetails.value?.id || id.value || '');
    collected.value = (list || []).some(x => String(x.productId ?? x.product_id ?? x.id ?? x.goodsId ?? x.productID ?? '') === pid && String(x.productType ?? x.type ?? '').toLowerCase() === 'dining');
    console.log('food checkCollected listLen', (list || []).length, 'matched', collected.value);
  } catch (e) {
    collected.value = false;
    console.log('food checkCollected error', e);
  }
};
const toggleCollect = async () => {
  if (!userStore.token) { uni.showToast({ title: '请先登录', icon: 'none' }); return; }
  if (collecting.value) return;
  collecting.value = true;
  try {
    const desiredOp = collected.value ? 0 : 1;
    const dto = {
      productId: String(foodDetails.value?.id || id.value || ''),
      productType: 'Dining',
      productImage: foodDetails.value?.imageUrl || '',
      productName: foodDetails.value?.name || '',
      operation: desiredOp
    };
    const res = await uni.request({
      url: 'https://island.zhangshuiyi.com/island/island/productCollect/collectProduct',
      method: 'POST',
      header: { 'Content-Type': 'application/json', 'X-Access-Token': userStore.token },
      data: dto
    });
    if ((res.statusCode === 200 || res.statusCode === 0) && (res.data.success || res.data.code === 200 || res.data.code === 0)) {
      collected.value = desiredOp === 1;
      uni.showToast({ title: desiredOp === 1 ? '已收藏' : '已取消收藏', icon: 'success' });
    } else {
      const msg = res.data?.message || '操作失败';
      if (desiredOp === 1 && (msg.includes('存在') || msg.toLowerCase().includes('exist'))) {
        collected.value = true;
        uni.showToast({ title: '已收藏', icon: 'success' });
      } else if (desiredOp === 0 && (msg.includes('不存在') || msg.toLowerCase().includes('not exist'))) {
        collected.value = false;
        uni.showToast({ title: '已取消收藏', icon: 'success' });
      } else {
        uni.showToast({ title: msg, icon: 'none' });
      }
    }
    await checkCollected();
  } catch (e) {
    uni.showToast({ title: '网络异常', icon: 'none' });
    console.log('food toggleCollect error', e);
  } finally {
    collecting.value = false;
  }
};

onShow(() => { checkCollected(); });
</script>

<style scoped>
.container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: calc(80px + env(safe-area-inset-bottom)); /* 为底部按钮留出空间 */
}

.hero { position: relative; }
.hero-img { width: 100%; height: 230px; object-fit: cover; }

.intro-card { position: relative; margin: -40px 12px 12px 12px; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(59,130,246,0.08); padding: 16px; z-index: 2; }
.name-row { position: relative; display: flex; align-items: center; margin-bottom: 24rpx; }
.attraction-name { font-size: 22px; font-weight: bold; color: #333; flex: 1; padding-right: 140rpx; }
.collect-btn { position: absolute; right: 0; top: 0; transform: translateY(0); display: flex; align-items: center; gap: 6px; background: #fff; border: 1px solid #007aff; border-radius: 30rpx; padding: 10rpx 30rpx; box-shadow: 0 2px 8px rgba(0,0,0,0.06); min-width: 120rpx; height: 60rpx; justify-content: center; }
.collect-btn.collected { border-color: #FFB020; background: rgba(255,176,32,0.08); }
.collect-text { font-size: 28rpx; color: #007aff; }
.collect-btn.collected .collect-text { color: #FFB020; }

.section-header-line { margin-bottom: 20rpx; border-bottom: 1px solid #f0f0f0; padding-bottom: 16rpx; }
.section-title-active { font-size: 16px; font-weight: 600; color: #FF7A45; border-bottom: 2px solid #FF7A45; padding-bottom: 14rpx; display: inline-block; }

.info-grid { margin-bottom: 20rpx; }
.info-row-new { display: flex; align-items: center; margin-bottom: 16rpx; }
.rating-box, .phone-box { width: 42%; flex-shrink: 0; display: flex; align-items: center; gap: 10rpx; }
.rating-num { font-size: 28rpx; font-weight: 600; color: #333; }
.address-box, .hours-box { flex: 1; display: flex; align-items: center; overflow: hidden; }
.address-box .info-label-s, .hours-box .info-label-s { flex-shrink: 0; }
.text-ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }

.info-label-s { font-size: 26rpx; color: #666; }
.info-val-s { font-size: 26rpx; color: #333; font-weight: 500; }

.intro-desc { margin-top: 16rpx; font-size: 28rpx; color: #444; line-height: 1.6; }

/* 确保主内容区域不被头部遮挡 */
.main {
	/* margin-top: calc(88rpx + var(--status-bar-height)); */
  /* 移除自定义导航栏的顶部边距 */
  margin-top: 0;
}

.section { margin: 24rpx 24rpx; padding: 24rpx; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.section-title { font-size: 18px; font-weight: bold; margin-bottom: 20rpx; color: #333; }
.ticket-row { display: flex; align-items: center; justify-content: space-between; }
.ticket-left { display: flex; align-items: baseline; gap: 12rpx; }
.ticket-type { font-size: 28rpx; color: #666; }
.ticket-price { font-size: 36rpx; color: #FF5A32; font-weight: 700; }
.ticket-btn { background: #FF7A45; color: #fff; padding: 10rpx 40rpx; border-radius: 40rpx; font-size: 28rpx; line-height: 1.5; margin: 0; }

/* 菜单 - 新样式 */
.menu-section { background-color: #ffff; box-shadow: none !important; padding: 0 24rpx !important; }
.menu-header-row { display: flex;margin-top: 20rpx; justify-content: space-between; align-items: center; margin-bottom: 16rpx; padding: 0 12rpx; }
.menu-title-large { font-size: 36rpx; font-weight: 800; color: #333; }
.menu-view-all { display: flex; align-items: center; margin-top: 20rpx;gap: 4rpx; font-size: 26rpx; color: #999; }

.menu-book-container { position: relative; padding-bottom: 24rpx; }
.clip-top { 
  width: 120rpx; 
  height: 30rpx; 
  background: linear-gradient(to bottom, #FAD961, #F76B1C); 
  margin: 0 auto; 
  position: relative; 
  z-index: 2; 
  border-radius: 8rpx 8rpx 0 0; 
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
}
.clip-top::after {
  content: ''; position: absolute; left: 50%; bottom: -4rpx; transform: translateX(-50%);
  width: 140rpx; height: 12rpx; background: #FAD961; border-radius: 6rpx;
}

.menu-paper {
  position: relative;
  background-color: #FDFBF7;
  background-image: radial-gradient(#E8E0D5 1px, transparent 1px);
  background-size: 20px 20px;
  border-radius: 8rpx;
  padding: 40rpx 32rpx 60rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08);
  margin-top: -10rpx;
  z-index: 1;
  border: 1px solid #EAE0D0;
}
/* 右上角卷角效果 (简单模拟) */
.menu-paper::before {
  content: ''; position: absolute; top: 0; right: 0;
  border-width: 0 40rpx 40rpx 0;
  border-style: solid;
  border-color: #F1EBE0 #fff #F1EBE0 #EAE0D0;
  display: block; width: 0;
  box-shadow: -2rpx 2rpx 4rpx rgba(0,0,0,0.05);
}

.menu-paper-title { font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 32rpx; display: block; }

.menu-grid { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 32rpx 0; }
.menu-grid-item { width: 48%; }
.menu-item-en { font-size: 20rpx; color: #A0522D; margin-bottom: 4rpx; display: block; font-family: serif; }
.menu-item-zh-row { display: flex; align-items: center; gap: 8rpx; }
.menu-item-zh { font-size: 30rpx; font-weight: bold; color: #000; font-family: "KaiTi", "STKaiti", serif; }
.red-seal { width: 16rpx; height: 16rpx; border: 1px solid #D32F2F; border-radius: 50%; position: relative; opacity: 0.7; }
.red-seal::after { content: '味'; font-size: 10rpx; color: #D32F2F; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) scale(0.8); }

.bar-bottom {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 24rpx;
  background: #FAD961;
  border-radius: 0 0 12rpx 12rpx;
  z-index: 2;
  box-shadow: 0 -2rpx 4rpx rgba(0,0,0,0.1);
}

/* 店铺实拍 */
.shop-photos { margin: 24rpx 24rpx; padding: 24rpx; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.photo-scroll { display: flex; overflow-x: auto; white-space: nowrap; }
.photo-item { width: 220rpx; height: 160rpx; margin-right: 16rpx; flex-shrink: 0; border-radius: 8rpx; overflow: hidden; }
.photo-item image { width: 100%; height: 100%; }

.reviews-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin: 24rpx; padding: 24rpx; }
.reviews-header { margin-bottom: 12px; }
.reviews-title { font-size: 18px; font-weight: 700; color: #333; }
.no-comments { text-align: center; color: #999; padding: 16px 0; }
.review-item { padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.review-user { display: flex; align-items: center; margin-bottom: 16rpx; }
.review-avatar { width: 60rpx; height: 60rpx; border-radius: 50%; margin-right: 16rpx; }
.review-user-info { flex: 1; }
.review-username { font-size: 26rpx; color: #333; font-weight: 500; margin-bottom: 4rpx; }
.review-time { font-size: 22rpx; color: #999; }
.review-content { font-size: 15px; color: #333; line-height: 1.7; margin: 6px 0 8px 76rpx; }
.review-images { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-left: 76rpx; }
.review-img { width: 100%; height: 80px; border-radius: 8px; object-fit: cover; }
.show-more { display: flex; align-items: center; justify-content: center; padding: 20rpx 0; color: #3B82F6; font-size: 26rpx; gap: 8rpx; }

</style>