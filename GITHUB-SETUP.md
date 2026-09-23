# GitHub 發布設定

這份設定包已準備好測試、建置、ZIP 發布與更新 manifest 工作流程。提供檔案不代表遠端儲存庫或 Release 已完成設定。

1. 建立公開 `pdf-studio-pro` 儲存庫，預設分支 `main`。
2. 上傳本資料夾中的原始碼、`package.json`、建置腳本與 `.github` 目錄。不需上傳 `vendor`；建置時會重新打包。
3. GitHub Actions 選擇 `Build and release PDF Studio Pro`，按 `Run workflow`。
4. 工作流程通過後，Releases 會提供版本 ZIP 和 `studio-update.json`；`updates/studio-update.json` 是可讓瀏覽器讀取的更新清單。
5. 發布版 ZIP 會自動填入該儲存庫網址作為更新來源。

後續版本需同時調整 `package.json` 的 version 與 `core.js` 的 VERSION，再測試和執行發布。既有 Release tag 不會被覆寫；請使用新版本號。

Dependabot 每週提出格式元件更新建議。必須整合測試後再發布，避免把不相容的上游程式碼直接載入文件工作台。

自動發布使用儲存庫內建 GITHUB_TOKEN，不需把個人存取權杖填入網頁或傳給助理。工作流程需要該儲存庫的 contents: write 權限以建立 Release 和更新清單。

GitHub 帳號連結與瀏覽器登入是不同的授權狀態。若連線工具尚未授權新儲存庫，需在 GitHub 應用程式設定中允許這個儲存庫。

這個發行流程不會上傳你在網頁中開啟的文件、Office 草稿、專案 JSON、診斷報告或加密備份。
