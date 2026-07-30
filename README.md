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

---

<!-- BEGIN:PROJECT_GUIDE -->
## 專案導覽

即時互動文字雲

- 專案定位：實用工具／自動化原型
- Repository：`cagoooo/cloud`
- 可見性：公開
- 主要技術：TypeScript、React、Vite、Firebase、Tailwind CSS
- 線上入口：未在 GitHub repository metadata 設定

### 可以怎麼應用

- 解決特定工作流程中的重複操作或資訊整理需求
- 作為相近工具的功能原型與程式碼參考
- 串接新的資料來源、服務或介面後延伸到其他情境

這些是依目前專案定位整理的延伸方向，不代表所有情境都已內建完成；實作前請先確認現有功能與資料格式。

### 技術與專案結構

- `README.md`
- `docs`
- `firebase.json`
- `index.html`
- `package.json`
- `public`
- `src`
- `vite.config.ts`

檔案結構會隨版本演進；若本節與程式碼不一致，以目前預設分支的原始碼為準。

### 本機執行

```bash
npm install
# dev
npm run dev
# build
npm run build
# lint
npm run lint
```
請以 `package.json` 的 `scripts` 為準；若專案需要雲端服務，請先建立自己的環境變數與測試專案。

### 給 AI Agent 的接手指南

1. 先閱讀本 README、`AGENTS.md`（若有）、套件腳本與部署設定。
2. 先從入口檔、設定檔與資料流確認真實行為，不要只依 repo 名稱推測。
3. 修改前檢查環境變數、外部服務、檔案格式與失敗處理。
4. 完成後執行既有檢查，並以最小可重現案例驗證主要流程。
5. 不要捏造尚未存在的功能；README 與實作有落差時，應同時更新文件。
6. 提交前只納入本次任務檔案，並記錄實際執行過的驗證。

### 安全與資料注意事項

- 不要提交 `.env`、服務帳號、API 金鑰、token、學生個資或正式環境匯出資料。
- 使用 Firebase、Supabase、Google API 或其他雲端服務時，請建立自己的測試專案並套用最小權限。
- 若要公開衍生作品，請先確認程式碼、圖片、音訊、字型與教材內容的授權。

### 貢獻與客製化

歡迎依教學現場、活動或工作流程需求進行 fork／客製化。建議在變更說明中交代使用情境、主要修改、測試方式，以及是否影響資料格式或部署設定。
<!-- END:PROJECT_GUIDE -->
