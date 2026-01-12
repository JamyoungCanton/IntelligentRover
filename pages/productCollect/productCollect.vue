<template>
  <view class="container">
    <view class="nav">
      <view class="filter-row">
        <view 
          v-for="t in types" 
          :key="t.value" 
          class="filter-item" 
          :class="{ active: currentType === t.value }"
          @tap="switchType(t.value)"
        >
          <text>{{ t.label }}</text>
        </view>
      </view>
    </view>

    <view v-if="loading" class="loading">加载中...</view>
    <view v-else-if="items.length === 0" class="no-data">暂无收藏</view>
    <view v-else class="list">
      <view class="card" v-for="it in items" :key="it.productId || it.id" @tap="toDetail(it)">
        <image :src="imageOf(it)" class="cover" mode="aspectFill" />
        <view class="card-body">
          <text class="card-title">{{ nameOf(it) }}</text>
          <view class="card-row">
            <text class="card-desc">{{ descOf(it) }}</text>
            <button class="btn primary" @tap.stop="cancelCollect(it)">取消收藏</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
const loading = ref(true);
const items = ref<any[]>([]);

const types = ref([
  { label: '全部', value: 'all' },
  { label: '帖子收藏', value: 'Posts' },
  { label: '景点收藏', value: 'Attractions' },
  { label: '酒店收藏', value: 'Accommodations' },
  { label: '美食收藏', value: 'Dining' },
]);
const currentType = ref('all');

const labelOf = (type: string) => {
  const m: Record<string, string> = {
    Posts: '帖子收藏',
    Attractions: '景点收藏',
    Accommodations: '酒店收藏',
    Dining: '美食收藏',
    Transportation: '交通收藏',
    FeaturedRoute: '路线收藏'
  };
  return m[type] || '全部';
};

const fallbackImage = (type: string) => {
  const t = (type || '').toLowerCase();
  if (t === 'posts' || t === 'post') return '/static/index/首页-社区互动.svg'; // Placeholder for posts
  const map: Record<string, string> = {
    dining: '/static/dayTravel/food.png',
    attractions: '/static/dayTravel/travel.png',
    accommodations: '/static/hotel-attctive/start.png',
    transportation: '/static/ticket/boat.png',
    featuredroute: '/static/dayTravel/star.png'
  };
  return map[t] || '/static/index/首页-社区互动.svg';
};

const imageOf = (it: any) => {
  // Handle Post structure (it.post.images or it.images)
  const postImg = it.post?.images?.[0]?.url || it.post?.imageURL || it.images?.[0]?.url || it.imageURL;
  
  const img = postImg
    || it.productImage 
    || it.imageURL 
    || it.imageUrl 
    || it.image 
    || it.coverImage 
    || (Array.isArray(it.images) ? it.images[0] : '');
  
  // Clean up if it's an object
  if (typeof img === 'object' && img !== null) {
      return img.url || '';
  }
  
  return img || fallbackImage(it.productType || (it.post ? 'Posts' : ''));
};
const nameOf = (it: any) => {
  return it.productName || it.name || it.title || (it.post ? it.post.title : '') || '未知产品';
};
const descOf = (it: any) => {
  const d = it.subtitle || it.description || it.intro || it.introduction || (it.post ? it.post.content : '') || '';
  return d ? d.replace(/<[^>]+>/g, '') : ' ';
};

function extractCollectList(resp: any): any[] {
  const r = resp?.data?.result;
  if (Array.isArray(r?.result)) return r.result;
  if (Array.isArray(r?.records)) return r.records;
  if (Array.isArray(resp?.data?.result)) return resp.data.result;
  return [];
}

async function fetchCollect() {
  if (!userStore.token) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    setTimeout(() => uni.navigateTo({ url: '/pages/login/login' }), 800);
    return;
  }
  loading.value = true;
  
  try {
    let posts: any[] = [];
    let products: any[] = [];
    
    // 1. Fetch Posts (if 'all' or 'Posts')
    if (currentType.value === 'all' || currentType.value === 'Posts') {
       try {
         const res: any = await uni.request({
           url: 'https://island.zhangshuiyi.com/island/collectRecord',
           method: 'GET',
           header: {
             'Content-Type': 'application/x-www-form-urlencoded',
             'X-Access-Token': userStore.token
           }
         });
         console.log('Posts Collect Response:', res.data);
         if (res.statusCode === 200 && res.data.success) {
            const r = res.data.result;
            if (Array.isArray(r)) {
              posts = r;
            } else if (r && Array.isArray(r.result)) {
              posts = r.result;
            } else if (r && Array.isArray(r.records)) {
              posts = r.records;
            } else if (r && Array.isArray(r.list)) {
              posts = r.list;
            }
            // Tag them
            posts = posts.map((p: any) => ({ ...p, productType: 'Posts' }));
         }
       } catch(e) {
         console.error('Fetch posts failed', e);
       }
    }

    // 2. Fetch Products (if 'all' or specific product type)
    if (currentType.value !== 'Posts') {
        const body: any = { pageNo: 1, pageSize: 100 };
        if (currentType.value !== 'all') body.productType = currentType.value;
        
        try {
          const res: any = await uni.request({
            url: 'https://island.zhangshuiyi.com/island/island/productCollect/myProduct',
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
              'X-Access-Token': userStore.token
            },
            data: body
          });
          if ((res.statusCode === 200 || res.statusCode === 0) && res.data && (res.data.success || res.data.code === 200 || res.data.code === 0)) {
            products = extractCollectList(res) || [];
          }
        } catch(e) {
          console.error('Fetch products failed', e);
        }
    }

    // 3. Merge & Sort
    let merged = [...posts, ...products];
    // Sort by createTime desc (if available)
    merged.sort((a, b) => {
       const t1 = new Date(a.createTime || a.updateTime || 0).getTime();
       const t2 = new Date(b.createTime || b.updateTime || 0).getTime();
       return t2 - t1;
    });
    
    items.value = merged;
    
    // 4. Enrich items (both products and posts)
    if (merged.length > 0) {
        await enrichItems();
    }
    
  } catch (e) {
    console.error(e);
    uni.showToast({ title: '网络异常', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

async function enrichItems() {
  const list = items.value || [];
  const tasks = list.map(async (it, idx) => {
    const pid = String(it.productId || it.postId || it.id || '');
    const type = String(it.productType || '').toLowerCase();
    if (!pid) return;
    
    // Check if we already have a valid image
    const postImg = it.post?.images?.[0]?.url || it.post?.imageURL || it.images?.[0]?.url || it.imageURL;
    const hasRealImage = !!(postImg || it.productImage || it.imageUrl || it.image || it.coverImage || (Array.isArray(it.images) && it.images[0]));
    
    // If we have an image and a name, skip enrichment
    if (hasRealImage && nameOf(it) !== '未知产品') return;

    let url = '';
    let isPost = false;

    if (type === 'dining') url = 'https://island.zhangshuiyi.com/island/product/ilDining/queryById';
    else if (type === 'attractions') url = 'https://island.zhangshuiyi.com/island/product/ilAttractions/queryById';
    else if (type === 'accommodations') url = 'https://island.zhangshuiyi.com/island/product/ilAccommodations/queryById';
    else if (type === 'posts' || type === 'post') {
        url = 'https://island.zhangshuiyi.com/island/posts/postDetail';
        isPost = true;
    }
    else return;

    try {
      const res: any = await uni.request({
        url,
        method: 'GET',
        header: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Access-Token': userStore.token },
        data: { id: pid }
      });
      
      const d = res?.data?.result || {};
      
      if (isPost) {
          // Handle Post structure
          const image = d.images?.[0]?.url || d.image || d.imageUrl || '';
          const title = d.title || '';
          const desc = d.content || '';
          
          if (image) {
              // Ensure structure exists
              if (!items.value[idx].post) items.value[idx].post = {};
              if (!items.value[idx].post.images) items.value[idx].post.images = [];
              items.value[idx].post.images[0] = { url: image };
              items.value[idx].imageUrl = image; // Fallback
          }
          if (title) {
              if (!items.value[idx].post) items.value[idx].post = {};
              items.value[idx].post.title = title;
              items.value[idx].title = title;
          }
          if (desc) {
              if (!items.value[idx].post) items.value[idx].post = {};
              items.value[idx].post.content = desc;
          }
      } else {
          // Handle Product structure
          const image = d.imageUrl || d.image || (Array.isArray(d.images) ? d.images[0] : '') || '';
          const title = d.name || d.title || '';
          const desc = d.description || d.intro || d.introduction || d.subtitle || d.brief || '';
          if (image) items.value[idx].imageUrl = image;
          if (title) items.value[idx].productName = title;
          if (desc) items.value[idx].description = desc;
      }
    } catch (err) {
        console.error(`Enrich failed for ${type} ${pid}`, err);
    }
  });
  await Promise.allSettled(tasks);
}

function switchType(v: string) {
  if (currentType.value === v) return;
  currentType.value = v;
  fetchCollect();
}

function goBack() {
  uni.navigateBack({ delta: 1 });
}

function toDetail(it: any) {
  const id = String(it.productId || it.id || '');
  const type = it.productType;
  if (type === 'Dining') {
    uni.navigateTo({ url: `/pages/foodDetails/foodDetails?id=${id}` });
  } else if (type === 'Accommodations') {
    uni.navigateTo({ url: `/pages/hotelDetail/hotelDetail?id=${id}` });
  } else if (type === 'Attractions') {
    uni.navigateTo({ url: `/pages/attractionDetail/attractionDetail?id=${id}` });
  } else if (type === 'FeaturedRoute') {
    uni.navigateTo({ url: `/pages/dayTravelDetail/dayTravelDetail?id=${id}` });
  } else if (type === 'Transportation') {
    uni.navigateTo({ url: '/pages/transportationGuide/transportationGuide' });
  } else {
    uni.showToast({ title: '暂不支持的类型', icon: 'none' });
  }
}

async function cancelCollect(it: any) {
  // Handle Post Cancellation
  if (it.productType === 'Posts' || it.post) {
      const postId = it.post?.id || it.postId || it.id;
      const userId = userStore.userInfo?.id || userStore.userInfo?.userId || uni.getStorageSync('userId');
      try {
          const res: any = await uni.request({
            url: 'https://island.zhangshuiyi.com/island/posts/collect',
            method: 'POST',
            header: {
              'X-Access-Token': userStore.token,
              'Content-Type': 'application/json'
            },
            data: {
              operation: 0, // 0 for cancel
              postsId: postId,
              userId: userId
            }
          });
          if (res.statusCode === 200 && (res.data.code === 200 || res.data.success)) {
             items.value = items.value.filter(x => {
                 const xId = x.post?.id || x.postId || x.id;
                 return String(xId) !== String(postId);
             });
             uni.showToast({ title: '已取消收藏', icon: 'success' });
          } else {
             uni.showToast({ title: res.data?.message || '取消失败', icon: 'none' });
          }
      } catch(e) {
          uni.showToast({ title: '网络异常', icon: 'none' });
      }
      return;
  }

  const id = String(it.productId || it.id || '');
  try {
    const res: any = await uni.request({
      url: 'https://island.zhangshuiyi.com/island/island/productCollect/collectProduct',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'X-Access-Token': userStore.token
      },
      data: { productId: id, operation: 0, productType: it.productType }
    });
    if ((res.statusCode === 200 || res.statusCode === 0) && (res.data.success || res.data.code === 200 || res.data.code === 0)) {
      items.value = items.value.filter(x => String(x.productId || x.id) !== id);
      uni.showToast({ title: '已取消收藏', icon: 'success' });
    } else {
      const msg = res.data?.message || '取消失败';
      if (msg.includes('不存在') || msg.toLowerCase().includes('not exist')) {
        items.value = items.value.filter(x => String(x.productId || x.id) !== id);
        uni.showToast({ title: '已取消收藏', icon: 'success' });
      } else {
        uni.showToast({ title: msg, icon: 'none' });
      }
    }
  } catch (e) {
    uni.showToast({ title: '网络异常', icon: 'none' });
  }
}

onMounted(fetchCollect);
</script>

<style lang="scss" scoped>
.container { min-height: 100vh; background: #f8f8f8; }
.nav { padding: 20rpx 0; background: #fff; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05); }
.header { position: relative; display: flex; align-items: center; justify-content: center; height: 80rpx; }
.back { position: absolute; left: 0; font-size: 40rpx; color: #333; padding: 10rpx 20rpx; }
.title { font-size: 34rpx; font-weight: 700; color: #333; }
.filter-scroll { width: 100%; white-space: nowrap; }
.filter-row { display: flex; flex-wrap: nowrap; padding: 0 30rpx; gap: 16rpx; margin-top: 10rpx; }
.filter-item { flex-shrink: 0; padding: 10rpx 22rpx; border-radius: 9999rpx; border: 1px solid #e5e5e5; color: #666; font-size: 26rpx; }
.filter-item.active { color: #0066ff; border-color: #0066ff; background: rgba(0,102,255,0.08); }
.loading, .no-data { text-align: center; color: #888; padding: 60rpx 0; }
.list { padding: 20rpx 30rpx; display: flex; flex-direction: column; gap: 30rpx; }
.card { background: #fff; border-radius: 20rpx; box-shadow: 0 8rpx 18rpx rgba(0,0,0,0.06); overflow: hidden; }
.cover { width: 100%; height: 340rpx; object-fit: cover; }
.card-body { padding: 24rpx; }
.card-title { font-size: 32rpx; font-weight: 700; color: #333; margin-bottom: 12rpx; display: block; }
.card-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 20rpx; }
.card-desc { font-size: 26rpx; color: #666; line-height: 1.6; flex: 1; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }
.btn { background: #e5e7eb; color: #333; border-radius: 8rpx; padding: 0; width: 160rpx; height: 64rpx; line-height: 64rpx; font-size: 26rpx; flex-shrink: 0; margin: 0; }
.btn.primary { background: #00bfff; color: #fff; }
</style>
