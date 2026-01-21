# 文字雲視覺優化開發文檔 V8.0

> **版本**: 8.0  
> **日期**: 2026-01-21  
> **狀態**: ✅ 已實施  
> **相關檔案**: `src/components/CloudDisplay.tsx`

---

## 📸 當前狀態分析

### 現有功能
| 功能 | 描述 | 狀態 |
|------|------|------|
| 詞頻聚合 | 相同詞彙計數合併 | ✅ 正常 |
| 大小映射 | 票數越高，字體越大 | ⚠️ 需優化 |
| 顏色分層 | Top 1-3 有特殊效果 | ✅ 正常 |
| 長文字處理 | 超過 20 字截斷 | ✅ 正常 |
| 動態佈局 | 使用 d3-cloud 演算法 | ✅ 正常 |

### 🔴 發現的問題

#### 問題 1：相同票數的詞大小相同，難以區分
**現象**: 多個相同票數的詞顯示完全相同的大小，視覺上缺乏層次感。

**原因分析**:
```typescript
// 當前的 fontSize 計算（line 170-175）
.fontSize((d) => {
    const normalized = Math.pow((d.value || 1) / maxValue, 0.5);
    const textLen = d.text?.length || 0;
    const lengthPenalty = Math.max(0.35, 1 - textLen * 0.05);
    return Math.max(minSize, (minSize + normalized * (maxSize - minSize)) * lengthPenalty);
})
```
- 相同 `value` 和相同 `text.length` 會產生完全相同的 `fontSize`
- 沒有考慮詞彙的加入時間或隨機變化

#### 問題 2：中文詞彙可能過於擁擠
**現象**: 中文字符比英文寬，有時會重疊。

**原因分析**:
- `padding(25)` 可能對某些長中文詞彙不夠
- Canvas 測量中文字寬可能不準確

#### 問題 3：視覺層次可以更豐富
**現象**: 前 3 名之後的詞彙缺乏視覺區分。

**原因分析**:
- Top 4-10 和 11-20 的差異只有透明度
- 缺少尺寸加成來強調排名

---

## 🎯 優化目標

### 核心需求
1. **相同票數也要有尺寸變化** - 使用排名加成或隨機微調
2. **前 N 名有明顯尺寸優勢** - 強調排名差異
3. **改善中文詞彙間距** - 避免重疊
4. **增加視覺層次** - 顏色、發光、動畫多維度區分

---

## 🔧 具體優化方案

### 方案 1：排名加成尺寸系統

**概念**: 引入「排名獎勵係數」，即使票數相同，排名靠前的詞也會稍微大一些。

```typescript
// 優化後的 fontSize 計算
.fontSize((d, i) => {
    const wordIndex = processedWords.findIndex(w => w.text === d.text);
    const totalWords = processedWords.length;
    
    // 基礎尺寸（基於票數）
    const valueNormalized = Math.pow((d.value || 1) / maxValue, 0.5);
    const baseSize = minSize + valueNormalized * (maxSize - minSize);
    
    // 排名加成（前面的詞獲得尺寸獎勵）
    // 第 1 名 +30%, 第 2 名 +20%, 第 3 名 +15%, 第 4-5 +10%, 其餘逐漸遞減
    let rankBonus = 1.0;
    if (wordIndex === 0) rankBonus = 1.30;
    else if (wordIndex === 1) rankBonus = 1.20;
    else if (wordIndex === 2) rankBonus = 1.15;
    else if (wordIndex < 5) rankBonus = 1.10;
    else if (wordIndex < 10) rankBonus = 1.05;
    else rankBonus = 1.0 - (wordIndex - 10) * 0.01; // 10 名後逐漸縮小
    rankBonus = Math.max(0.7, rankBonus); // 最小不低於 70%
    
    // 長度懲罰
    const textLen = d.text?.length || 0;
    const lengthPenalty = Math.max(0.35, 1 - textLen * 0.05);
    
    // 微小隨機變化（±5%），讓相同票數的詞也有差異
    const randomJitter = 0.95 + Math.random() * 0.1;
    
    return Math.max(minSize, baseSize * rankBonus * lengthPenalty * randomJitter);
})
```

### 方案 2：動態尺寸範圍

**概念**: 根據詞彙總數動態調整尺寸範圍，避免詞少時都很大、詞多時都很小。

```typescript
// 動態尺寸範圍
const wordCount = processedWords.length;
const scaleFactor = Math.min(dimensions.width, dimensions.height) / 400;

// 根據詞彙數量調整尺寸範圍
let minSize, maxSize;
if (wordCount <= 5) {
    minSize = 20 * scaleFactor;
    maxSize = 60 * scaleFactor;
} else if (wordCount <= 15) {
    minSize = 14 * scaleFactor;
    maxSize = 50 * scaleFactor;
} else if (wordCount <= 30) {
    minSize = 12 * scaleFactor;
    maxSize = 45 * scaleFactor;
} else {
    minSize = 10 * scaleFactor;
    maxSize = 40 * scaleFactor;
}
```

### 方案 3：增強的樣式分層

**概念**: 根據排名提供更豐富的視覺區分。

```typescript
const getWordStyle = (value: number, maxValue: number, index: number, totalWords: number) => {
    // Top 1 - 金色王冠，最大發光
    if (index === 0 && value > 1) {
        return {
            color: '#fbbf24',
            glowColor: 'rgba(251, 191, 36, 0.8)',
            isTop: true,
            isHot: true,
            isOutline: false,
            opacity: 1,
            fontWeight: 900,
            animation: 'pulse',
        };
    }

    // Top 2-3 - 霓虹熱門色
    if (index < 3 && value > 1) {
        const hotColors = [
            { color: '#00F0FF', glow: 'rgba(0, 240, 255, 0.6)' },   // 青色
            { color: '#FF00AA', glow: 'rgba(255, 0, 170, 0.6)' },   // 粉色
        ];
        const c = hotColors[(index - 1) % hotColors.length];
        return {
            color: c.color,
            glowColor: c.glow,
            isTop: false,
            isHot: true,
            isOutline: false,
            opacity: 1,
            fontWeight: 800,
            animation: 'none',
        };
    }

    // Top 4-6 - 次熱門（帶微弱發光）
    if (index < 6) {
        const colorIndex = (index * 7) % neonPalette.length;
        return {
            color: neonPalette[colorIndex],
            glowColor: `${neonPalette[colorIndex]}40`, // 25% 透明度發光
            isTop: false,
            isHot: false,
            isOutline: false,
            opacity: 0.95,
            fontWeight: 700,
        };
    }

    // Top 7-15 - 中層
    if (index < 15) {
        const colorIndex = (index * 5) % neonPalette.length;
        return {
            color: neonPalette[colorIndex],
            glowColor: 'transparent',
            isTop: false,
            isHot: false,
            isOutline: false,
            opacity: 0.75,
            fontWeight: 600,
        };
    }

    // 16-25 - 背景層（半透明）
    if (index < 25) {
        const colorIndex = (index * 3) % neonPalette.length;
        return {
            color: neonPalette[colorIndex],
            glowColor: 'transparent',
            isTop: false,
            isHot: false,
            isOutline: false,
            opacity: 0.45,
            fontWeight: 500,
        };
    }

    // 26+ - 輪廓層（最遠景）
    return {
        color: 'rgba(150, 150, 180, 0.35)',
        glowColor: 'transparent',
        isTop: false,
        isHot: false,
        isOutline: true,
        opacity: 0.3,
        fontWeight: 400,
    };
};
```

### 方案 4：改善中文排版

```typescript
// 根據中文比例調整 padding
const hasCJK = (text: string) => /[\u4e00-\u9fff\u3400-\u4dbf]/.test(text);

.padding((d) => {
    const text = d.text || '';
    const cjkRatio = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length / text.length;
    // 中文越多，padding 越大
    return 15 + cjkRatio * 15; // 15-30 之間
})
```

---

## 📋 實施計劃

### Phase 1: 尺寸優化
- [ ] 實現排名加成系統
- [ ] 添加微小隨機變化
- [ ] 調整動態尺寸範圍

### Phase 2: 樣式分層
- [ ] 擴展 `getWordStyle` 分層到 25+
- [ ] 添加 `fontWeight` 屬性
- [ ] 增強發光效果

### Phase 3: 中文優化
- [ ] 實現動態 padding
- [ ] 優化 Canvas 字體測量

### Phase 4: 測試驗證
- [ ] 測試 5, 15, 30, 50 個詞的顯示效果
- [ ] 確認相同票數的詞有尺寸差異
- [ ] 確認 Top 3 明顯突出

---

## 🎨 預期效果對比

### 修正前
```
詞彙排列示意：
[開心:28px] [愛:28px] [加油:28px]  ← 相同票數，相同大小
[測試:20px] [沒看到:20px]          ← 無法區分
```

### 修正後
```
詞彙排列示意：
[開心:36px] [愛:32px] [加油:30px]  ← 排名加成 + 隨機微調
[測試:22px] [沒看到:20px]          ← 有尺寸差異
```

---

## 📝 參考配色表

| 排名 | 顏色 | 發光 | 透明度 | 字重 |
|------|------|------|--------|------|
| 1 | 金色 #fbbf24 | 80% | 100% | 900 |
| 2 | 青色 #00F0FF | 60% | 100% | 800 |
| 3 | 粉色 #FF00AA | 60% | 100% | 800 |
| 4-6 | 調色盤 | 25% | 95% | 700 |
| 7-15 | 調色盤 | 無 | 75% | 600 |
| 16-25 | 調色盤 | 無 | 45% | 500 |
| 26+ | 灰色 | 無 | 30% | 400 |

---

## 🚀 快速實施

如果只需要最小改動來解決「相同票數大小相同」的問題，可以只添加 **排名加成** 和 **隨機微調**：

```typescript
// line 170-175 修改為：
.fontSize((d) => {
    // 找到這個詞的排名
    const wordIndex = processedWords.findIndex(w => w.text === d.text);
    
    // 基礎尺寸
    const normalized = Math.pow((d.value || 1) / maxValue, 0.5);
    const textLen = d.text?.length || 0;
    const lengthPenalty = Math.max(0.35, 1 - textLen * 0.05);
    const baseSize = minSize + normalized * (maxSize - minSize);
    
    // 排名加成
    const rankBonus = Math.max(0.75, 1.25 - wordIndex * 0.02);
    
    // 隨機微調 ±5%
    const jitter = 0.95 + Math.random() * 0.1;
    
    return Math.max(minSize, baseSize * lengthPenalty * rankBonus * jitter);
})
```

---

**作者**: Antigravity  
**更新日期**: 2026-01-21
