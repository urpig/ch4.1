# 小葵與阿公：時間煉金術的祕密

國二下理化第四章《反應速率與平衡》。獨立、無建置步驟、無執行期第三方套件的靜態網站。

## 公開網站

GitHub Pages：https://urpig.github.io/ch4.1/ （無需登入）。

原始碼：https://github.com/urpig/ch4.1 。發布來源為 main 分支的根目錄；執行 `node build.mjs` 產生根目錄入口，程式與圖片保留在 dist/。修改網頁後重新建置並提交 main，GitHub Pages 會更新網站。

## 本機預覽

最快方式：雙擊 `chapter4-preview.html`，即可離線預覽，無需啟動伺服器。此檔已內嵌所有程式、樣式與圖片。若瀏覽器限制 file 模式的本機儲存，請改用下方 HTTP 預覽；兩種開啟方式的進度各自獨立。

開發預覽需要 Node.js 20 以上。雙擊本目錄的 `Start-preview.cmd`，或在 k12 根目錄雙擊 `Start-ch4-preview.cmd`。

瀏覽器開啟 http://127.0.0.1:4174/ 。保留啟動視窗；關閉視窗或按 Ctrl+C 即停止服務。

也可在本目錄執行：

```powershell
node server.mjs
```

不要直接以 `file://` 開啟 dist/index.html：原始網站使用 ES modules，需經 HTTP 伺服器載入；請使用前述已打包的 chapter4-preview.html。修改來源後執行 `node build-standalone.mjs` 更新離線版。若 4174 已被占用，可設定 `$env:PORT=4175` 再執行伺服器。

## 完成範圍

10 張故事探索卡、5 個操作模型、10 題卡片題、12 題階段測驗。最終挑戰與研究員證書已依需求移除。每題包含逐選項診斷、正確答案、提示與重答；每卡先預測、蒐集明列的線索，再解鎖科學解釋與小試身手。包含字典、實驗紀錄與手札匯出。第 10 卡解開三則小箋後，揭露小葵與阿公開啟暗格、發現《百工秘卷》的插圖與結局。

本機進度使用獨立鍵 `science-lab-ch4-time-alchemy-v1`，不讀寫第二章的鍵。保存預測、線索、答案、測驗結果、實驗條件、完成實驗曲線與筆記。正在進行的實驗在重新載入後回到裝料前；已完成紀錄保留。每個實驗保留最近 12 筆，完成的線索不受紀錄輪替影響。

## 設計來源與重用

參考網站：https://urpig.github.io/ch2/

參考來源：https://github.com/urpig/ch2 ，讀取的 main commit 為 `df813f2de309d299870b453bee4b1537546b773d`。

- `story.css`：原版色彩 token、卡片、按鈕、practice、quiz-options、feedback。
- `chapter-navigation.css`：原版森林綠固定導航；1440 寬為 220px，1920 寬為 246px。
- `character-story.css`：原版 88px 頭像（小螢幕 72px）及表情裁切。
- `prediction.css`：原版預測與觀察回顧樣式。
- `chapter.css`：第四章場景、實驗工作台與圖表的增補，不另建主題。
- `kui.png`、`grandpa.png`：與第二章相同的檔案，已核對 Git blob SHA。
- `secret-book.png`：使用內建 imagegen，以原有六格插畫為人物與畫風參考，生成小葵與阿公打開暗格、發現《百工秘卷》的結尾插圖；完整提示與生成來源見 `IMAGE-PROVENANCE.md`。
- `chapter-scenes.png`：以兩個原角色圖集為參考產生的六格原創故事插畫；場景以 CSS 裁切。

已讀取 hands-on.css、lab-layout.css、story-app.js、journey-cards.js、prediction.js 與 state 實作。原版 JS 綁定氧化還原專用狀態與材料，因此沿用其版型與流程，將本章資料及化學引擎分離重建；未載入舊章節的化學資料。`reference/` 在本機保存分析用原始快照，網站不引用此目錄。未修改、推送或部署第二章。第四章依使用者後續指示，獨立發布至 urpig/ch4.1。

## 主要檔案

| 檔案 | 職責 |
| --- | --- |
| dist/index.html | 頁面骨架、側欄、封面、手札與字典 |
| dist/app.js | 導航、卡片、預測、測驗、進度 |
| dist/content.js | 10 卡教學內容、22 題與詞彙 |
| dist/engines.js | 反應速率與可逆反應計算 |
| dist/labs.js | 五個操作工作台與實驗紀錄 |
| dist/activities.js | 時間尺、碰撞、圖表分析、可逆類比與結局 |
| dist/visuals.js | 圖表、器材 SVG、粒子視覺 |
| dist/state.js | 保存格式、防呆還原與完成規則 |
| dist/chapter.css | 第四章增補樣式 |
| tests/ | 科學、內容、保存與瀏覽器驗收 |
| build-standalone.mjs | 無外部套件的離線預覽打包器 |

## 模型假設

### 反應速率

- 氣體一律用 24 L/mol 的示意參考摩爾體積換算，不直接把氣體熱膨脹當反應進展。
- 碳酸鈣摩爾質量採 100 g/mol。可反應量為 `min(n(CaCO3), n(HCl)/2)`。
- 雙氧水起始 10 mmol，理論生成 O₂ 為 5 mmol，即 120 mL；MnO₂ 的量不納入氧氣來源。
- 有限完成的經驗模型：反應進度 `1 − max(0, 1 − 0.35kt)^(1/0.35)`。隨材料耗用減速，時間非真實實驗的校正秒數。
- 顆粒面積倍率為塊狀 1、顆粒 2、粉末 4；速率隨酸濃度與指定溫度因子變動。適用範圍限制於介面設定。
- 溫度比較固定初始量；催化劑比較固定初始雙氧水量。沒有副反應、漏氣與溶解損失。

### 可逆反應

- `2NO2 ⇌ N2O4`，1 L 固定體積。正逆速率均按「反應事件」表示，NO₂ 消耗速率有計量係數 2。
- `r正=k正[NO2]^2`、`r逆=k逆[N2O4]`；`d[NO2]=-2dξ`、`d[N2O4]=dξ`。
- 25°C 設定 k正=0.12、k逆=0.06；每升 10°C 分別乘 1.35、2.1，以示意正方向放熱且升溫偏 NO₂。
- 理想催化劑同乘兩個速率係數 4 倍，不改變比值及最終組成；不是對真實 NO₂ 催化操作的建議。
- 使用小步長、依速率調整的 Euler 積分，檢查非負濃度及氮、氧原子守恆。
- 以正逆速率相對差小於 0.1% 顯示「接近平衡」。事件仍累積，粒子仍運動，雙向轉換放大動畫由累積事件量驅動。
- 粒子是比例取整的示意圖；濃度、曲線與守恆以模型讀數為準。所有引擎資料為教學假設，非真實氣體定量預測；公式不列國二必學。

## 測試

```powershell
node --test tests/*.test.mjs
node tests/check.mjs
```

瀏覽器端完整測試（需可用的 Playwright 與 Chromium）：

```powershell
npm install --no-save playwright
npx playwright install chromium
node tests/browser.mjs
```

瀏覽器測試建立隔離的新 profile，不修改學生進度。涵蓋五個實驗的操作、鍵盤／拖曳替代、錯誤提示、30 題作答、解鎖、重新載入、字典與手機溢出；輸出於 qa/。

## 當次驗收狀態

詳見 `ACCEPTANCE.md`。20 項科學／內容／保存／DOM 流程測試通過，JS 語法與靜態資產路徑檢查通過；離線版另外通過同一套完整 DOM 流程測試。DOM 測試使用 tests/vendor/linkedom.mjs（MIT，授權檔並列），無需網路或安裝套件；它不會驗證實際渲染、滑鼠拖曳、鍵盤焦點及 Canvas 像素。

當次瀏覽器連線曾中斷，恢復後本機預覽連線逾時；環境限制瀏覽器下載與程式的 loopback 連線，內嵌瀏覽器也禁止 file URL。因此第四章實際操作、1440×900／1920×1080 視覺截圖比對尚未完成，不能視為完整驗收通過。
