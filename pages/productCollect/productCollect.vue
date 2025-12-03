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
      <view class="card" v-for="it in items" :key="it.productId || it.id">
        <image :src="imageOf(it)" class="cover" mode="aspectFill" />
        <view class="card-body">
          <text class="card-title">{{ nameOf(it) }}</text>
          <text class="card-sub">{{ labelOf(it.productType) }}</text>
          <text class="card-desc">{{ descOf(it) }}</text>
          <view class="card-footer">
            <button class="btn" @tap="toDetail(it)">查看详情</button>
            <button class="btn primary" @tap="cancelCollect(it)">取消收藏</button>
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
  { label: '景点收藏', value: 'Attractions' },
  { label: '酒店收藏', value: 'Accommodations' },
  { label: '餐厅收藏', value: 'Dining' },
]);
const currentType = ref('all');

const labelOf = (type: string) => {
  const m: Record<string, string> = {
    Attractions: '景点收藏',
    Accommodations: '酒店收藏',
    Dining: '餐厅收藏',
    Transportation: '交通收藏',
    FeaturedRoute: '路线收藏'
  };
  return m[type] || '全部';
};

const imageOf = (it: any) => {
  return it.productImage || it.imageURL || it.imageUrl || it.coverImage || '/static/my/default-avatar.png';
};
const nameOf = (it: any) => {
  return it.productName || it.name || it.title || '未知产品';
};
const descOf = (it: any) => {
  return it.subtitle || it.description || '';
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
      items.value = extractCollectList(res) || [];
      await enrichItems();
    } else {
      uni.showToast({ title: res.data?.message || '获取失败', icon: 'none' });
    }
  } catch (e) {
    uni.showToast({ title: '网络异常', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

async function enrichItems() {
  const list = items.value || [];
  const tasks = list.map(async (it, idx) => {
    const pid = String(it.productId || it.id || '');
    const type = String(it.productType || '').toLowerCase();
    if (!pid) return;
    if (imageOf(it) && nameOf(it) !== '未知产品') return;
    let url = '';
    if (type === 'dining') url = 'https://island.zhangshuiyi.com/island/product/ilDining/queryById';
    else if (type === 'attractions') url = 'https://island.zhangshuiyi.com/island/product/ilAttractions/queryById';
    else return;
    try {
      const res: any = await uni.request({
        url,
        method: 'GET',
        header: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Access-Token': userStore.token },
        data: { id: pid }
      });
      const d = res?.data?.result || {};
      const image = d.imageUrl || d.image || '';
      const title = d.name || d.title || '';
      if (image) items.value[idx].imageUrl = image;
      if (title) items.value[idx].productName = title;
    } catch {}
  });
  await Promise.allSettled(tasks);
}

function switchType(v: string) {
  if (currentType.value === v) return;
  currentType.value = v;
  fetchCollect();
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
.nav { padding: 20rpx 30rpx; background: #fff; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05); }
.title { font-size: 32rpx; font-weight: 600; color: #333; }
.filter-row { margin-top: 20rpx; display: flex; gap: 16rpx; flex-wrap: wrap; }
.filter-item { padding: 10rpx 22rpx; border-radius: 9999rpx; border: 1px solid #e5e5e5; color: #666; font-size: 26rpx; }
.filter-item.active { color: #0066ff; border-color: #0066ff; background: rgba(0,102,255,0.08); }
.loading, .no-data { text-align: center; color: #888; padding: 60rpx 0; }
.list { padding: 20rpx 30rpx; display: flex; flex-direction: column; gap: 30rpx; }
.card { background: #fff; border-radius: 16rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06); overflow: hidden; }
.cover { width: 100%; height: 320rpx; object-fit: cover; }
.card-body { padding: 24rpx; }
.card-title { font-size: 32rpx; font-weight: 700; color: #333; }
.card-sub { font-size: 24rpx; color: #999; margin-top: 8rpx; }
.card-desc { font-size: 26rpx; color: #666; margin-top: 12rpx; line-height: 1.6; }
.card-footer { margin-top: 16rpx; display: flex; gap: 16rpx; }
.btn { background: #e5e7eb; color: #333; border-radius: 12rpx; padding: 12rpx 24rpx; font-size: 26rpx; }
.btn.primary { background: #0080ff; color: #fff; }
</style>
