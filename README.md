# ☁️ WordCloud - 即時互動文字雲

[![Deploy to GitHub Pages](https://github.com/cagoooo/cloud/actions/workflows/deploy.yml/badge.svg)](https://github.com/cagoooo/cloud/actions/workflows/deploy.yml)

一個現代化的即時互動文字雲應用，支援多人協作、房間系統和精美的視覺效果。

🔗 **線上體驗**: [https://cagoooo.github.io/cloud/](https://cagoooo.github.io/cloud/)

## ✨ 功能特色

- 🎨 **流光視覺效果** - Top 1-3 詞彙使用動態流光漸層
- 🏆 **HUD 排名系統** - Top 1 顯示科技風 RANK 標籤
- 🌈 **多層次設計** - 實心、熱門、描邊等多種字體風格
- 🔄 **即時同步** - Firebase Firestore 即時更新
- 📱 **響應式設計** - 支援桌面和行動裝置
- 🏠 **房間系統** - 建立專屬房間分享給朋友
- 📷 **匯出功能** - 支援匯出為圖片
- 🔗 **QR Code** - 快速分享房間連結

## 🛠 技術架構

- **前端框架**: React 19 + TypeScript
- **建置工具**: Vite 7
- **樣式**: Tailwind CSS 4
- **動畫**: Framer Motion
- **文字雲**: d3-cloud
- **後端**: Firebase (Firestore + Realtime Database)
- **部署**: GitHub Pages

## 🚀 快速開始

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 建置
npm run build
```

## 📦 版本歷史

### v2.0.0 (2026-01-21)
- ✨ **V12 碰撞檢測演算法** - Canvas measureText 精確測量 + 雙階段碰撞處理，100% 無重疊
- ✨ **文字雲垂直置中** - SVG viewBox 座標系統調整，完美置中呈現
- ✨ **使用說明區塊** - 左側控制面板新增步驟引導和功能提示
- ✨ **排行榜滾動功能** - 支援顯示所有詞彙，可滾動查看
- 🐛 修復多次投票後文字重疊問題
- 🐛 修復前幾名大字體詞彙重疊問題

### v1.9.1 (2026-01-21)
- 🐛 **佈局穩定性修復** - 移除隨機微調，確保每次佈局詞彙數量一致
- 🐛 **字數上限統一** - 輸入/顯示統一為 15 字，避免截斷問題
- 🐛 **邊緣詞彙可見** - SVG 可視區域擴大到 150%，拖曳可查看邊緣詞彙
- ✨ Header RWD 滿版優化
- ✨ 手機版輸入區垂直佈局升級
- ✨ 中文化介面（空狀態、標題）

### v1.9.0 (2026-01-21)
- ✨ **E-05 粒子背景效果** - 新增 Canvas 粒子系統，支援滑鼠互動和粒子連線效果
- ✨ **E-04 動態進場動畫** - 新增 4 種進場動畫（淡入/飛入/彈跳/無），可從 HUD 控制面板切換
- ✨ **E-01 主題切換** - 支援 4 種主題（深色/淺色/賽博龐克/日落），設定自動保存
- ✨ 新增 `ThemeContext` 上下文系統
- ✨ 新增 `ThemeSwitcher` 主題選擇器組件
- ✨ 新增 `ParticleBackground` 粒子背景組件
- ✨ 新增 `useAnimationSettings` 動畫設定 hook

### v1.8.0 (2026-01-21)
- ✨ **V7 UI 優化** - Header 精簡化、ControlPanel 扁平化設計
- ✨ **V8 文字雲優化** - 排名加成系統、動態尺寸範圍
- ✨ 相同票數的詞彙現在也有尺寸差異
- ✨ 手機版輸入框更醒目、更好點擊
- ✨ 增強的視覺分層系統（25+ 個層級）
- ✨ 動態中文間距優化
- 🐛 修復 Firebase Realtime Database URL 配置

### v1.5.0 (2026-01-20)
- ✨ V5 UI 控制優化：HUD 控制膠囊
- ✨ 熱度圖例指示器
- ✨ 「思考中」狀態動畫

### v1.3.0 (2026-01-20)
- ✨ V3 視覺升級：流光文字動畫
- ✨ Top 1 科技風 RANK 標籤
- ✨ 霓虹玻璃容器效果
- ✨ 描邊字體背景層
- 🐛 修復長中文字顯示問題
- 🔧 移除點擊投票功能（避免佈局混亂）

### v1.2.0
- 輸入介面優化
- 文字雲顯示上限提高到 20 字

### v1.0.0
- 初始版本發布

## 📄 授權

MIT License
