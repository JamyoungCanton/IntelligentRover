<template>
  <view class="container">
    <view class="hero">
      <swiper v-if="attractionImages.length > 0" class="header-swiper" :indicator-dots="true" :autoplay="false" :circular="true" :interval="4000" :duration="500">
        <swiper-item v-for="(img, idx) in attractionImages" :key="idx">
          <image :src="img.url || img" mode="aspectFill" class="hero-img" />
        </swiper-item>
      </swiper>
      <view v-else class="no-image-placeholder">
        <uni-icons type="image" size="60" color="#ccc" />
        <text style="color:#999;">暂无图片</text>
      </view>
    </view>

    <view class="intro-card">
      <view class="badge-row">
        <text class="badge">广东省珠海</text>
        <text class="badge ghost">可开电子发票</text>
      </view>
      <view class="name-row">
        <text class="attraction-name">{{ hotelData.name }}</text>
        <view class="collect-btn" :class="{ collected }" @tap="toggleCollect">
          <uni-icons :type="collected ? 'star-filled' : 'star'" size="20" :color="collected ? '#FFB020' : '#999'" />
          <text class="collect-text">{{ collected ? '已收藏' : '收藏' }}</text>
        </view>
      </view>
      <view class="open-time" v-if="hotelData.starttime && hotelData.endtime">开放时间：{{ formatTime(hotelData.starttime) }} - {{ formatTime(hotelData.endtime) }}</view>
      <view class="intro-desc">{{ introDescription }}</view>
    </view>
    <view class="intro-spacer"></view>

    

    <view class="section ticket-section">
      <view><text class="section-title">景区购票</text></view>
      <view class="ticket-row">
        <view class="ticket-left"><text class="ticket-type">成人票</text><text class="ticket-price">￥{{ hotelData.ticketprice || 0 }}</text></view>
        <button class="ticket-btn" @click="creaOrder(hotelData)">立即购买</button>
      </view>
    </view>

    

    <view class="reviews-card">
      <view class="reviews-header"><text class="reviews-title">用户评价（{{ groupedComments.length }}）</text></view>
      <view v-if="displayedComments.length === 0" class="no-comments">暂无评价</view>
      <view v-for="(item, idx) in displayedComments" :key="item.id || idx" class="review-item">
        <view class="review-user">
          <image :src="item.avatar || '/static/my/default-avatar.png'" class="review-avatar" />
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
      <view v-if="!showAllComments && comments.length > 2" class="show-more" @click="toggleComments">查看更多</view>
    </view>

    <!-- 游客实拍 -->
    <view class="tourist-album-section" v-if="hotelData.images && hotelData.images.filter(img => !!img && img.trim() !== '').length">
      <view class="album-title-row">
        <text class="album-title">游客实拍</text>
      </view>
      <scroll-view scroll-x class="tourist-album-scroll">
        <image
          v-for="(img, idx) in hotelData.images.filter(img => !!img && img.trim() !== '')"
          :key="idx"
          :src="img"
          class="tourist-album-img"
          @click="previewImage(idx)"
        />
      </scroll-view>
    </view>

  </view>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { onLoad, onShow } from '@dcloudio/uni-app'
  import { useUserStore } from '@/store/modules/user'

  const userStore = useUserStore();
  type CommentItem = {
    score?: number;
    comment?: string;
    username?: string;
    createTime?: string;
    userId?: string | number;
    user_id?: string | number;
    avatar?: string;
    images?: string[] | string;
    imageList?: string[] | string;
    pics?: string[] | string;
    id?: string | number;
  };
  type GroupedComment = {
    id: string | number;
    username?: string;
    avatar?: string;
    createTime?: string;
    score?: number;
    comment: string;
    images: string[];
  };
  type Attraction = {
    id?: string | number;
    rating?: number | string;
    type?: string;
    description?: string;
    imageUrl?: string;
    images?: string[];
    comments?: CommentItem[];
    ticketprice?: number;
    starttime?: string;
    endtime?: string;
    name?: string;
  };
  const hotelData = ref<Attraction>({});
  const attractionImages = ref<string[]>([]);
  const comments = ref<CommentItem[]>([
    { score: 10, comment: '非常棒', username: '张三', createTime: '2024-06-12' },
    { score: 9, comment: '不错', username: '李四', createTime: '2024-06-11' },
    { score: 10, comment: '很满意', username: '王五', createTime: '2024-06-10' }
  ]);
  const id = ref<string | number>(0);
  const pad = (n: number) => n < 10 ? '0' + n : n;
  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return '';
    return timeStr.split(':').slice(0, 2).join(':');
  };
  const newComment = ref<string>('');
  const showAllComments = ref<boolean>(false);
  const allowComment = ref<boolean>(false);
  const commentDetail = ref<Record<string, unknown> | null>(null);
  const introDescription = computed<string>(() => {
    return String(hotelData.value.description || '').replace(/<[^>]*>/g, '');
  });
  const collected = ref(false);
  const collecting = ref(false);
  type ApiResp<T = any> = { statusCode: number; data: { success?: boolean; code?: number; message?: string; result?: T } };
  const extractCollectList = (resp: ApiResp<any>): any[] => {
    const r: any = resp?.data?.result;
    if (Array.isArray(r?.result)) return r.result;
    if (Array.isArray(r?.records)) return r.records;
    if (Array.isArray(resp?.data?.result)) return resp.data.result as any[];
    return [];
  };

  console.log('attractionDetail.vue 页面已加载');

  onLoad((options: Record<string, any>) => {
    id.value = options.id;
    console.log('onLoad 传入的 id:', id.value);
    checkCollected();
    getAttrictionDetail();
    checkOrderPaid();
    getCommentDetail(options.id);
  })

  onShow(() => {
    checkCollected();
    getAttrictionDetail();
  });

  const getAttrictionDetail = () => {
    console.log('getAttrictionDetail 被调用');
    console.log('开始获取景点详情，ID:', id.value);
    uni.request({
      url: 'https://island.zhangshuiyi.com/island/product/ilAttractions/queryById',
      method: 'GET',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Access-Token': userStore.token || ''
      },
      data: { id: id.value },
      success: (res: UniApp.RequestSuccessCallbackResult) => {
        console.log('景点详情接口返回数据:', res.data);
        if (res.data.success && res.data.result) {
          hotelData.value = res.data.result;
          console.log('当前景点数据:', hotelData.value);
          
          // 处理图片
          if (res.data.result.imageUrl) {
            const mainUrl = String(res.data.result.imageUrl).trim().replace(/[`\s]/g, '');
            attractionImages.value = [mainUrl];
          } else {
            console.log('没有景点主图');
            attractionImages.value = [];
          }

          // 处理游客实拍图片
          console.log('原始图片数据:', res.data.result.images);
          if (res.data.result.images && Array.isArray(res.data.result.images)) {
            // 拆分每个字符串里的多个图片URL
            const processedImages = res.data.result.images.reduce((acc, imgStr) => {
              if (imgStr) {
                const urls = String(imgStr)
                  .split(',')
                  .map(url => url.trim().replace(/[`\s]/g, ''))
                  .filter(Boolean);
                return [...acc, ...urls];
              }
              return acc;
            }, []);
            hotelData.value.images = processedImages;
            console.log('处理后的图片数组:', processedImages);
          } else {
            console.log('没有游客实拍图片或格式不正确');
            hotelData.value.images = [];
          }

          // 处理评论
          comments.value = res.data.result.comments || [];
          console.log('评论数据:', comments.value);
          checkCollected();
        } else {
          console.log('获取景点详情失败:', res.data);
        }
      },
      fail: (err: any) => {
        console.error('请求景点详情失败:', err);
      }
    });
  };

  const checkCollected = async () => {
    if (!userStore.token) { collected.value = false; return; }
    try {
      const bodyA = { productType: 'Attractions', pageNo: 1, pageSize: 100 } as any;
      const resA = await uni.request({
        url: 'https://island.zhangshuiyi.com/island/island/productCollect/myProduct',
        method: 'POST',
        header: { 'Content-Type': 'application/json', 'X-Access-Token': userStore.token },
        data: bodyA
      }) as ApiResp<any>;
      let list: any[] = [];
      if ((resA.statusCode === 200 || resA.statusCode === 0) && (resA.data.success || resA.data.code === 0)) {
        list = extractCollectList(resA);
      }
      if (!list || list.length === 0) {
        const resB = await uni.request({
          url: 'https://island.zhangshuiyi.com/island/island/productCollect/myProduct',
          method: 'POST',
          header: { 'Content-Type': 'application/json', 'X-Access-Token': userStore.token },
          data: { pageNo: 1, pageSize: 100 }
        }) as ApiResp<any>;
        if ((resB.statusCode === 200 || resB.statusCode === 0) && (resB.data.success || resB.data.code === 0)) {
          list = extractCollectList(resB);
        }
      }
      const pid = String(id.value);
      const matched = (list || []).some((x: any) => {
        const xid = String(x.productId ?? x.product_id ?? x.id ?? x.goodsId ?? x.productID ?? '');
        const xtype = String(x.productType ?? x.type ?? '').toLowerCase();
        return xid === pid && (xtype === 'attractions' || !xtype);
      });
      collected.value = matched;
      console.log('checkCollected listLen', (list || []).length, 'ids', (list || []).map(i => i.productId || i.id), 'matched', matched);
    } catch (e) {
      collected.value = false;
      console.log('checkCollected error', e);
    }
  };

  const toggleCollect = async () => {
    if (!userStore.token) { uni.showToast({ title: '请先登录', icon: 'none' }); return; }
    if (collecting.value) return;
    collecting.value = true;
    try {
      const desiredOp = collected.value ? 0 : 1;
      console.log('toggleCollect start', { id: String(hotelData.value.id || id.value), desiredOp, collected: collected.value });
      const dto = {
        productId: String(hotelData.value.id || id.value),
        productType: 'Attractions',
        productImage: hotelData.value.imageUrl || '',
        productName: hotelData.value.name || '',
        operation: desiredOp
      };
      const res = await uni.request({
        url: 'https://island.zhangshuiyi.com/island/island/productCollect/collectProduct',
        method: 'POST',
        header: { 'Content-Type': 'application/json', 'X-Access-Token': userStore.token },
        data: dto
      }) as ApiResp<any>;
      console.log('toggleCollect resp', { statusCode: res.statusCode, data: res.data });
      if ((res.statusCode === 200 || res.statusCode === 0) && (res.data.success || res.data.code === 200 || res.data.code === 0)) {
        collected.value = desiredOp === 1;
        uni.showToast({ title: desiredOp === 1 ? '已收藏' : '已取消收藏', icon: 'success' });
        await checkCollected();
        console.log('toggleCollect final collected', collected.value);
      } else {
        const msg = res.data.message || '操作失败';
        console.log('toggleCollect fail', msg);
        if (desiredOp === 1 && (msg.includes('存在') || msg.toLowerCase().includes('exist'))) {
          collected.value = true;
          uni.showToast({ title: '已收藏', icon: 'success' });
        } else if (desiredOp === 0 && (msg.includes('不存在') || msg.toLowerCase().includes('not exist'))) {
          collected.value = false;
          uni.showToast({ title: '已取消收藏', icon: 'success' });
        } else {
          uni.showToast({ title: msg, icon: 'none' });
        }
        await checkCollected();
      }
    } catch (e) {
      uni.showToast({ title: '网络异常', icon: 'none' });
      console.log('toggleCollect error', e);
    } finally {
      collecting.value = false;
    }
  };

  // 预览单张图片
  const previewImage = (index: number) => {
    if (!hotelData.value.images || !Array.isArray(hotelData.value.images)) {
      console.log('没有可预览的图片');
      return;
    }
    console.log('预览图片，当前索引:', index);
    console.log('预览图片数组:', hotelData.value.images);
    uni.previewImage({
      urls: hotelData.value.images,
      current: index
    });
  };

  // 预览全部图片
  const previewAllImages = () => {
    uni.previewImage({
      urls: hotelData.value.images
    });
  };

  // 跳转到确认订单页面
  const creaOrder = (hotel: Attraction) => {
    console.log('预订时的 productId:', hotel.id);
    if (hotel.ticketprice === 0) {
      // ...免费逻辑
      return;
    }
    
    // 不再直接创建订单，而是跳转到 multiConfirmPay 页面进行确认和支付
    // 传递必要的商品信息
    const itemsParam = encodeURIComponent(JSON.stringify([{
      id: hotel.id,
      name: hotel.name,
      type: 'Attractions', // 明确类型
      ticketprice: hotel.ticketprice,
      price: hotel.ticketprice,
      starttime: hotel.starttime || '10:00',
      endtime: hotel.endtime || '22:00',
      imageUrl: hotel.imageUrl || (hotel.images && hotel.images[0]) || ''
    }]));

    // orderSns 为空，表示还未创建订单
    const orderSnsParam = encodeURIComponent(JSON.stringify([]));
    
    uni.navigateTo({
      url: `/pages/multiConfirmPay/multiConfirmPay?items=${itemsParam}&orderSns=${orderSnsParam}&price=${encodeURIComponent(String(hotel.ticketprice || 0))}`,
      fail: (err) => {
        console.error('页面跳转失败:', err);
        uni.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  }

  onMounted(() => {
    getAttrictionDetail();
  })

  

  // 检查是否支付过该商品
  const checkOrderPaid = async () => {
    if (!userStore.token) {
      allowComment.value = false;
      return;
    }
    try {
      const res = await uni.request({
        url: 'https://island.zhangshuiyi.com/island/front/order/getMyOrderList',
        method: 'GET',
        header: {
          'X-Access-Token': userStore.token,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
          pageNo: 1,
          pageSize: 100
        }
      }) as ApiResp<{ records: any[] }>;
      if (res.data.success && res.data.result && Array.isArray((res.data.result as any).records)) {
        // 只要有 payStatus === 'PAID' 且 goodsId === 当前景点id
        allowComment.value = (res.data.result as any).records.some((item: any) =>
          String(item.goodsId) === String(id.value) && item.payStatus === 'PAID'
        );
      } else {
        allowComment.value = false;
      }
    } catch (e) {
      allowComment.value = false;
    }
  };

  // 提交评论
  const submitComment = async () => {
    if (!allowComment.value) { uni.showToast({ title: '仅限已支付该景点订单的用户评论', icon: 'none' }); return; }
    if (!newComment.value.trim()) { uni.showToast({ title: '评论内容不能为空', icon: 'none' }); return; }
    if (!userStore.token) { uni.showToast({ title: '请先登录', icon: 'none' }); return; }
    try {
      const dto = {
        avatar: (userStore.userInfo?.avatar || ''),
        comment: newComment.value,
        productId: String(id.value),
        type: 'Attractions',
        userId: userStore.userInfo?.id || userStore.userInfo?.userId || '',
        username: userStore.userInfo?.realname || userStore.userInfo?.username || '',
        url: ''
      };
      const res = await uni.request({
        url: 'https://island.zhangshuiyi.com/island/il-user-comments/save',
        method: 'POST',
        header: { 'Content-Type': 'application/json', 'X-Access-Token': userStore.token },
        data: dto
      });
      if ((res.statusCode === 200 || res.statusCode === 0) && (res.data.success || res.data.code === 0 || res.data.code === 200)) {
        uni.showToast({ title: '评论成功', icon: 'success' });
        newComment.value = '';
        await refreshComments();
      } else {
        uni.showToast({ title: res.data?.message || '评论失败', icon: 'none' });
      }
    } catch (error) {
      uni.showToast({ title: '评论失败，请稍后重试', icon: 'none' });
    }
  };

  const refreshComments = async () => {
    try {
      const r = await uni.request({
        url: 'https://island.zhangshuiyi.com/island/il-user-comments/list',
        method: 'GET',
        header: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Access-Token': userStore.token },
        data: { productId: String(id.value), type: 'Attractions' }
      });
      if (r.data && r.data.success) { comments.value = Array.isArray(r.data.result) ? r.data.result : (r.data.result?.records || []); }
    } catch {}
  };

  // 添加计算属性来控制显示的评论数量
  const displayedComments = computed<GroupedComment[]>(() => showAllComments.value ? groupedComments.value : groupedComments.value.slice(0, 3));
  const groupedComments = computed<GroupedComment[]>(() => {
    const map = new Map<string | number, GroupedComment>();
    (comments.value || []).forEach((c: CommentItem) => {
      const key: string | number = c.userId || c.user_id || (c.username as string) || (c.id as number) || Math.random();
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          username: c.username,
          avatar: c.avatar,
          createTime: c.createTime,
          score: c.score,
          comment: c.comment || '',
          images: itemMergedImages(c)
        });
      } else {
        const exist = map.get(key)!;
        exist.comment = exist.comment ? exist.comment + '\n' + (c.comment || '') : (c.comment || '');
        exist.createTime = exist.createTime || c.createTime;
        exist.score = exist.score || c.score;
        exist.images = [...exist.images, ...itemMergedImages(c)].filter(Boolean);
      }
    });
    return Array.from(map.values());
  });
  const itemMergedImages = (item: CommentItem): string[] => {
    const arr: string[] = [];
    const imgs = item.images || item.imageList || item.pics || '';
    if (Array.isArray(imgs)) arr.push(...(imgs as string[]).filter(Boolean));
    if (typeof imgs === 'string') arr.push(...imgs.split(',').map(s => s.trim()).filter(Boolean));
    return arr;
  };

  // 添加切换显示状态的方法
  const toggleComments = () => {
    showAllComments.value = true;
  };

  const getCommentDetail = (id: string | number) => {
    uni.request({
      url: 'https://island.zhangshuiyi.com/island/il-user-comments/CommentsDetail',
      method: 'GET',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Access-Token': userStore.token || ''
      },
      data: { id },
      success: (res) => {
        if (res.data.success && res.data.result) {
          commentDetail.value = res.data.result;
        }
      }
    });
  };

  const goToAllComments = (id: string | number) => {
    // 实现跳转到所有评论页面的逻辑
    console.log('跳转到所有评论页面', id);
  };

  const extractImgs = (item: CommentItem): string[] => {
    const imgs = item.images || item.imageList || item.pics || '';
    if (Array.isArray(imgs)) return imgs.filter(Boolean);
    if (typeof imgs === 'string') return imgs.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  };

  if (!hotelData.value.starttime || !hotelData.value.endtime) {
    hotelData.value.starttime = '10:00';
    hotelData.value.endtime = '22:00';
  }

</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #f8f8f8;
  padding-bottom: 30px;
}
.hero { position: relative; }
.hero-img { width: 100%; height: 230px; object-fit: cover; }
.header-swiper {
  width: 100vw;
  height: 230px;
  background: #eee;
}
.intro-card { position: relative; margin: -40px 12px 12px 12px; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(59,130,246,0.08); padding: 16px; z-index: 2;}
.intro-spacer { height: 0; }
.badge-row { display: flex; gap: 8px; margin-bottom: 8px; }
.badge { padding: 4px 10px; background: #fff3cd; color: #946200; border-radius: 16px; font-size: 12px; }
.badge.ghost { background: #e9f3ff; color: #1677FF; }
.badge.type { background: #f0e9ff; color: #6C63FF; }
.name-row { position: relative; display: flex; align-items: center; }
.attraction-name { font-size: 18px; font-weight: 700; color: #333; }
.collect-btn { position: absolute; right: 0; top: 50%; transform: translateY(-50%); display: flex; align-items: center; gap: 6px; background: #fff; border: 1px solid #eee; border-radius: 9999rpx; padding: 6px 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.collect-btn.collected { border-color: #FFB020; background: rgba(255,176,32,0.08); }
.collect-text { font-size: 12px; color: #666; }
.collect-btn.collected .collect-text { color: #FFB020; }
.price-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
}
.price-main {
  color: #FF9800;
  font-size: 28px;
  font-weight: bold;
}
.price-desc {
  color: #888;
  font-size: 15px;
  margin-right: 10px;
}
.tag-row { display: flex; gap: 8px; margin: 6px 0 12px 0; }
.tag { padding: 6px 12px; background: #f0f2f5; border-radius: 14px; font-size: 12px; color: #666; }
.tab-row { display: flex; gap: 12px; margin-bottom: 12px; }
.tab { padding: 6px 10px; border-radius: 10px; background: #eef3ff; color: #3B82F6; font-size: 13px; }
.collect-fab { position: absolute; right: 12px; top: 12px; display: flex; align-items: center; gap: 6px; background: #fff; border: 1px solid #eee; border-radius: 9999rpx; padding: 6px 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.collect-text { font-size: 12px; color: #666; }
.tab.active { background: #dfe9ff; }
.info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 8px 0; }
.info-item { display: flex; align-items: center; gap: 6px; color: #333; font-size: 14px; }
.open-time { margin-top: 8px; font-size: 13px; color: #666; }
.intro-desc { margin-top: 8px; font-size: 14px; color: #444; line-height: 1.7; }
.child-price {
  color: #FF9800;
  font-size: 16px;
  margin-left: 10px;
}
.sold-count {
  margin-left: auto;
  color: #999;
  font-size: 14px;
}
.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}
.info-label {
  color: #333;
  font-size: 15px;
  margin-left: 6px;
}
.info-value {
  color: #666;
  font-size: 15px;
  margin-left: 4px;
}
.section {
  margin: 24px 0 0 0;
  padding: 18px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(59,130,246,0.04);
}
.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;

}
.section-content {
  font-size: 15px;
  color: #444;
  line-height: 1.7;
}
.ticket-section { margin: 16px 12px; }
.ticket-row { width: 100%; display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.ticket-left { display: flex; align-items: baseline; gap: 10px; }
.ticket-type { font-size: 16px; color: #333; }
.ticket-price { font-size: 20px; color: #FF5A32; font-weight: 700; }
.ticket-btn { background: #1677FF; color: #fff; padding: 3px 16px;margin-right: 10rpx; border-radius: 10px; border: none; font-size: 14px; }
.ticket-more { color: #1677FF; font-size: 14px; }
.booking-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(59,130,246,0.06);
  margin: 32px 0 24px 0;
  padding: 0;
  overflow: hidden;
  width: 90vw;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}
.booking-row {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  background: #fff;
  position: relative;
  min-height: 48px;
}
.booking-label {
  font-size: 16px;
  color: #333;
  margin-left: 12px;
  flex-shrink: 0;
  font-weight: 500;
}
.booking-value {
  margin-left: auto;
  font-size: 16px;
  color: #3B82F6;
  font-weight: 500;
  min-width: 80px;
  text-align: right;
}
.booking-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0 20px;
}
.end-row {
  background: #f8faff;
}
.fixed-bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.06);
  padding: 5px 20px 9px 20px;
  z-index: 100;
  display: flex;
  justify-content: center;
}
.book-now-btn {
  width: 100%;
  max-width: 400px;
  background: #3B82F6; /* 修改背景颜色为主题色 */
  color: #fff; /* 修改文字颜色为白色 */
  border: none; /* 移除边框 */
  border-radius: 25px; /* 增大圆角 */
  font-size: 18px;
  font-weight: bold;
  padding: 6px 0; /* 增加内边距 */
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); /* 添加阴影 */
  transition: all 0.3s ease; /* 添加过渡效果 */
}
.book-now-btn:active { }
.book-now-btn:hover { }
.reviews-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin: 16px 12px; padding: 16px; }
.reviews-header { margin-bottom: 12px; }
.reviews-title { font-size: 18px; font-weight: 700; color: #333; }
.review-header {
  margin-bottom: 20rpx;
}
.review-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.no-comments {
  width: 100%;
  margin: 12rpx 0;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  text-align: center;
  padding: 24rpx 20rpx;
  color: #999;
  font-size: 26rpx;
  box-sizing: border-box;
}
.comment-input-area {
  width: 100vw;
  max-width: 100vw;
  margin-left: -20rpx;
  margin-right: -20rpx;
  background: none;
  border-radius: 0;
  padding: 0;
  margin-bottom: 30rpx;
  box-sizing: border-box;
}
.comment-user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}
.user-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}
.user-name {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}
.comment-textarea {
  width: 100%;
  height: 160rpx;
  background-color: #fff;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  border: 1px solid #e5e5e5;
  margin-bottom: 20rpx;
}
.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}
.word-count {
  font-size: 24rpx;
  color: #999;
}
.submit-btn {
  background-color: #3B82F6;
  color: #fff;
  font-size: 26rpx;
  padding: 8rpx 32rpx;
  border-radius: 8rpx;
  border: none;
}
.submit-btn[disabled] {
  background-color: #ccc;
}
.review-item { padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.review-user {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}
.review-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}
.review-user-info {
  flex: 1;
}
.review-username {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 4rpx;
}
.review-time {
  font-size: 22rpx;
  color: #999;
}
.review-content { font-size: 15px; color: #333; line-height: 1.7; margin: 6px 0 8px 76rpx; }
.review-images { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-left: 76rpx; }
.review-img { width: 100%; height: 80px; border-radius: 8px; object-fit: cover; }
.show-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  color: #3B82F6;
  font-size: 26rpx;
  gap: 8rpx;
}
.no-image-placeholder {
  width: 100%;
  height: 230px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f8f8f8;
}
.comment-scroll {
  width: 100%;
  /* 不要加flex */
}
.comment-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
}
.comment-card {
  display: flex;
  flex-direction: column;
  min-width: 220px;
  max-width: 70vw;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 16px;
  margin-right: 12px;
  height: 120px;
  box-sizing: border-box;
}
.comment-header { display: flex; align-items: center; }
.comment-avatar { width: 40px; height: 40px; border-radius: 50%; margin-right: 10px; }
.comment-user { display: flex; flex-direction: column; }
.comment-username { font-weight: bold; color: #333; }
.comment-date { color: #aaa; font-size: 12px; }
.comment-score-row { display: flex; align-items: center; gap: 8px; margin: 8px 0; }
.comment-score { color: #19d4c5; font-weight: bold; }
.comment-score-desc { color: #888; font-size: 12px; }
.comment-content { color: #444; font-size: 15px; margin-top: 6px; }
.comment-more-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 120px;
  background: #e9e6e6;
  border-radius: 18px;
  margin-right: 12px;
  margin-bottom: 5px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.see-all-btn-img {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.see-all-text {
  writing-mode: vertical-rl;
  font-size: 18px;
  color: #222;
  letter-spacing: 2px;
  margin-bottom: 8px;
  font-weight: bold;
}
.see-all-arrow {
  width: 23px;
  height: 23px;
  background: #222;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.see-all-arrow uni-icons {
  color: #fff !important;
}
.tourist-album-section {
  margin: 24px 0 0 0;
  padding: 0 16px;
}
.album-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.album-title {
  font-size: 18px;
  font-weight: bold;
  color: #222;
}
.album-more {
  color: #19d4c5;
  font-size: 15px;
  cursor: pointer;
}
.tourist-album-scroll {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  gap: 12px;
  padding-bottom: 8px;
}
.tourist-album-img {
  width: 90px;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 8px;
}
.bottom-placeholder { height: 0; }
.attraction-name {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  text-align: left;
  padding: 0 4px;
}
</style>
