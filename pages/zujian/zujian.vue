<!-- 本示例未包含完整css，获取外链css请参考上文，在hello uni-app项目中查看 -->
<template>
	<view>
		<view class="uni-title uni-common-mt uni-common-pl">推荐展示样式</view>
		<view class="uni-list">
			<radio-group @change="radioChange">
				<label class="uni-list-cell uni-list-cell-pd" v-for="(item, index) in items" :key="item.value">
					<view>
						<radio :value="item.value" :checked="index === current" />
					</view>
					<view>{{item.name}}</view>
				</label>
			</radio-group>
		</view>
	</view>
</template>
<script>
export default {
    data() {
        return {
            items: [{
                    value: 'USA',
                    name: '美国',
                    checked: 'true'
                },
                {
                    value: 'CHN',
                    name: '中国'
                },
                {
                    value: 'BRA',
                    name: '巴西'
                },
                {
                    value: 'JPN',
                    name: '日本'
                },
                {
                    value: 'ENG',
                    name: '英国'
                },
                {
                    value: 'FRA',
                    name: '法国'
                },
            ],
            current: 0
        }
    },
    methods: {
        radioChange: function(evt) {
            for (let i = 0; i < this.items.length; i++) {
                if (this.items[i].value === evt.detail.value) {
                    this.current = i;
                    break;
                }
            }
        }
    }
}
</script>
