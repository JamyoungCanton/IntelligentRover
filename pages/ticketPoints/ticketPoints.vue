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
      <view class="postItem">
        <view class="postHeader">
          <image class="itemava"
            src="https://ai-public.mastergo.com/ai/img_res/298a09126b167b2389171cf1732d0efd.jpg"
            mode="scaleToFill"
          />
          <text class="itemname">blulu</text>
          <text class="itemlv">lv3</text>
        </view>
        <view class="postTitle">
          <text>《夏日海岛游攻略》:清新一夏，等你来</text>
        </view>
        <view class="postP">
          <p>这次东澳岛之行，让我彻底爱上了这片神奇的土地。它不仅让我放松了身心，更让我感受到了大自然的神奇魅力。东澳岛，真是一个让人来了就不想离开的地方，我期待着下次再来!</p>
        </view>
        <view class="postImage">
          <image
            src="https://ai-public.mastergo.com/ai/img_res/8b2e19990586b743036f49f399c57074.jpg"
            mode="scaleToFill"
          />
        </view>
        <view class="item-bottom">
          <view class="item-bottom-left">
            <view class="left-data">4-17·41分钟前·日常交流</view>
          </view>
         <view class="item-bottom-right">
            <view class="right-data">
              <uni-icons type="heart" size="16" color="#666"></uni-icons>
              <text class="data-detail">23</text>
              <uni-icons type="star" size="16" color="#666"></uni-icons>
              <text class="data-detail">3</text>
              <uni-icons type="chat" size="16" color="#666"></uni-icons>
              <text class="data-detail">7</text>
            </view>
          </view>
        </view>
      </view>
      <view class="postItem">
        <view class="postHeader">
          <image class="itemava"
            src="/static/hotel-attctive/ava.png "
            mode="scaleToFill"
          />
          <text class="itemname">啊嘞啊嘞</text>
          <text class="itemlv">lv2</text>
        </view>
        <view class="postTitle">
          <text>《海岛美食大搜罗》：东澳岛的味蕾之旅</text>
        </view>
        <view class="postP">
          <p>东澳岛不仅风景优美，美食也是一大亮点。新鲜的海鲜、特色的海岛小吃，每一口都让人回味无穷。在这里，你可以品尝到刚刚捕捞上岸的鱼虾蟹贝，搭配上当地特色的烹饪方式，简直是味蕾的盛宴。</p>
        </view>
        <view class="postImage">
          <image
            src="https://wlmtsys.com:9000/travel/f17.jpg"
            mode="scaleToFill"
          />
        </view>
        <view class="item-bottom">
          <view class="item-bottom-left">
            <view class="left-data">4-17·41分钟前·日常交流</view>
          </view>
         <view class="item-bottom-right">
            <view class="right-data">
              <uni-icons type="heart" size="16" color="#666"></uni-icons>
              <text class="data-detail">11</text>
              <uni-icons type="star" size="16" color="#666"></uni-icons>
              <text class="data-detail">2</text>
              <uni-icons type="chat" size="16" color="#666"></uni-icons>
              <text class="data-detail">9</text>
            </view>
          </view>
        </view>
      </view>
      <view class="postItem">
        <view class="postHeader">
          <image class="itemava"
            src="https://ai-public.mastergo.com/ai/img_res/298a09126b167b2389171cf1732d0efd.jpg"
            mode="scaleToFill"
          />
          <text class="itemname">blulu</text>
          <text class="itemlv">lv3</text>
        </view>
        <view class="postTitle">
          <text>《东澳岛徒步指南》：探索海岛的隐秘角落</text>
        </view>
        <view class="postP">
          <p>如果你喜欢徒步探险，东澳岛绝对是一个不可错过的地方。这里有许多隐藏在山林和海岸之间的徒步路线，可以让你近距离接触自然，欣赏到海岛的另一面。无论是沿着海岸线漫步，还是深入山林探索，你都能发现许多意想不到的美景，比如隐秘的海滩、清澈的山泉和古老的渔村。带上你的背包，穿上舒适的鞋子，开始你的徒步之旅吧！</p>
        </view>
        <view class="postImage">
          <image
            src="https://ai-public.mastergo.com/ai/img_res/8b2e19990586b743036f49f399c57074.jpg"
            mode="scaleToFill"
          />
        </view>
        <view class="item-bottom">
          <view class="item-bottom-left">
            <view class="left-data">4-17·41分钟前·日常交流</view>
          </view>
         <view class="item-bottom-right">
            <view class="right-data">
              <uni-icons type="heart" size="16" color="#666"></uni-icons>
              <text class="data-detail">23</text>
              <uni-icons type="star" size="16" color="#666"></uni-icons>
              <text class="data-detail">3</text>
              <uni-icons type="chat" size="16" color="#666"></uni-icons>
              <text class="data-detail">7</text>
            </view>
          </view>
        </view>
        
      </view>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
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
    };
    
    return {
      typeList,
      activeType,
      selectType
    };
  }
};
</script>

<style lang="scss">
.container{
  background-color: rgb(248, 248, 248);
}
.postTypeSelect {
  padding: 15px;
  background-color: #fff;

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
  width: 100%;
  height: 200px;
  margin-top: 10px ;
  display: flex;
  align-items: center;
  justify-content: center;
}
.postImage image{
  height: 100%;
  justify-content: center;
  align-content: center;
  border-radius: 15px;
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
</style>