<template>
  <div class="stock-container">
    <div v-for="(stock, index) in stocks" :key="stock.code" class="stock-box">
      <div class="nav-stock">
        <span class="stock-name"> {{ stock.name }}： </span>
        <span>
          {{ stock.previousClose }}
        </span>
        <span
          :class="[
            stock.openPrice < stock.previousClose ? 'stock-down' : 'stock-up'
          ]"
        >
          ➡
        </span>
        <span>{{ stock.openPrice }}</span>
        <span
          :class="[
            stock.current < stock.openPrice ? 'stock-down' : 'stock-up'
          ]"
        >
          {{ stock.current > stock.openPrice ? "⬆" : "⬇" }}
        </span>
        <span>{{ stock.current }}</span>
        <span
          :class="[
            parseFloat(stock.priceChangePercent) < 0 ? 'stock-down' : 'stock-up',
            'stock-change-percent'
          ]"
        >
          {{ stock.priceChangePercent }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { getStorage } from "@/utils";

// 股票数据接口
interface StockData {
  name: string; // 股票名称
  code: string; // 股票代码
  currentPrice: number; // 当前价格
  previousClose: number; // 昨日收盘价
  openPrice: number; // 开盘价
  priceChange: number; // 涨跌额
  priceChangePercent: string; // 涨跌幅
  dayLow: number; // 当日最低价
  dayHigh: number; // 当日最高价
  current: number; // 现价
  volume: number; // 成交量
  updateTime: string; // 更新时间
}

const stocks = ref<StockData[]>([]);
const stockCode = ref<string>(getStorage("stockCode"));
const DEFAULT_STOCK_CODE = "sh515080";
const stockUpdateInterval = ref<number | null>(null);

/**
 * 获取股票数据
 * @param code 股票代码
 */
const fetchStockData = (code = DEFAULT_STOCK_CODE): void => {
  // 调用接口并处理数据
  fetch(`http://qt.gtimg.cn/q=${code}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("网络请求失败");
      }
      return response.arrayBuffer(); // 获取二进制数据以正确处理编码
    })
    .then((buffer) => {
      // 使用TextDecoder解码GBK编码的数据
      const decoder = new TextDecoder("gbk");
      const data = decoder.decode(buffer);
      const rawData = data.replace(/^v_.*?="/, "").replace(/"$/, "");
      // 以"\nv"为界分割成多个数组
      const stockDataArray = rawData.split("\nv");
      const stockList: StockData[] = [];

      // 处理每个股票数据
      stockDataArray.forEach((stockData, index) => {
        // 分割单个股票的数据
        const params = stockData.split("~");

        // 解析所需字段（对应接口参数顺序）
        if (params.length > 4) {
          const prevClose = params[4];
          const stockInfo: StockData = {
            name: params[1],
            code: code,
            currentPrice: parseFloat(params[3]),
            previousClose: parseFloat(params[4]),
            openPrice: parseFloat(params[5]),
            priceChange: parseFloat(params[31]),
            priceChangePercent: `${parseFloat(params[32])}%`,
            dayLow: parseFloat(params[34]),
            dayHigh: parseFloat(params[33]),
            current: parseFloat(params[3]),
            volume: parseInt(params[6], 10),
            updateTime: params[30],
          };

          if (index === 0) {
            // 第一个股票数据替换或添加到数组
            if (stockList.length > 0) {
              stockList[0] = stockInfo;
            } else {
              stockList.push(stockInfo);
            }
          } else {
            // 后续股票数据添加到数组
            stockList.push(stockInfo);
          }
        }
      });
      stocks.value = stockList;
    })
    .catch((error) => {
      console.error("获取数据失败：", error);
    });
};

// 组件挂载时初始化股票数据
onMounted(() => {
  // 初始化股票列表
  if (stockCode.value) {
    fetchStockData(stockCode.value);
  } else {
    fetchStockData(DEFAULT_STOCK_CODE);
  }
  // 定时更新所有股票
  stockUpdateInterval.value = window.setInterval(() => {
    fetchStockData(stockCode.value);
  }, 1000);
});

// 组件卸载时清除定时器和事件监听器
onUnmounted(() => {
  if (stockUpdateInterval.value) {
    clearInterval(stockUpdateInterval.value);
  }
});
</script>

<style lang="scss" scoped>
.stock-container {
  margin-bottom: 10px;
}

.stock-box {
  margin-bottom: 8px;
}

.stock-name {
  width: 110px;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stock-up {
  color: red;
}

.stock-down {
  color: green;
}

.stock-change-percent {
  margin-left: 5px;
}

.nav-stock {
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 32px;
}
</style>
