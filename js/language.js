// 語言檢測和翻譯模組
class LanguageManager {
    constructor() {
        this.currentLanguage = this.detectLanguage();
        this.translations = {
            'zh-TW': {
                // 繁體中文
                appTitle: '桂城中學全景查看器',
                imageList: '圖片列表',
                refreshList: '刷新列表',
                loadingImages: '載入圖片中...',
                loadingProgress: '正在檢查圖片',
                loadingComplete: '載入完成',
                checkingImages: '檢查圖片中',
                foundImages: '找到 {count} 張圖片',
                noImages: '無圖片',
                noImagesDesc: '請將全景圖片放置在 files 文件夾中',
                supportedFormats: '支援格式：JPG、PNG、WebP',
                loadFailed: '載入失敗',
                loadFailedDesc: '無法載入圖片列表',
                retry: '重試',
                fullscreen: '全螢幕',
                selectImage: '請選擇一張全景圖',
                selectImageDesc: '從左側列表中選擇要查看的全景圖片',
                close: '關閉',
                appLoaded: '應用程式已載入',
                imageLoaded: '已載入',
                loadImageFailed: '載入全景圖失敗',
                size: '大小',
                format: '格式',
                imageSize: '圖片大小',
                poweredBy: 'Powered by',
                designedBy: 'Designed by TGX Coding'
            },
            'zh-CN': {
                // 简体中文
                appTitle: '桂城中学全景查看器',
                imageList: '图片列表',
                refreshList: '刷新列表',
                loadingImages: '加载图片中...',
                loadingProgress: '正在检查图片',
                loadingComplete: '加载完成',
                checkingImages: '检查图片中',
                foundImages: '找到 {count} 张图片',
                noImages: '无图片',
                noImagesDesc: '请将全景图片放置在 files 文件夹中',
                supportedFormats: '支持格式：JPG、PNG、WebP',
                loadFailed: '加载失败',
                loadFailedDesc: '无法加载图片列表',
                retry: '重试',
                fullscreen: '全屏',
                selectImage: '请选择一张全景图',
                selectImageDesc: '从左侧列表中选择要查看的全景图片',
                close: '关闭',
                appLoaded: '应用程序已加载',
                imageLoaded: '已加载',
                loadImageFailed: '加载全景图失败',
                size: '大小',
                format: '格式',
                imageSize: '图片大小',
                poweredBy: 'Powered by',
                designedBy: 'Designed by TGX Coding'
            }
        };
        this.init();
    }

    detectLanguage() {
        // 獲取用戶瀏覽器語言設置
        const userLanguage = navigator.language || navigator.userLanguage;
        console.log('檢測到用戶語言:', userLanguage);

        // 判斷是否為繁體中文相關地區
        const traditionalChineseRegions = [
            'zh-TW', 'zh-HK', 'zh-MO', // 台灣、香港、澳門
            'zh-Hant', 'zh-Hant-TW', 'zh-Hant-HK', 'zh-Hant-MO'
        ];

        // 簡體中文相關地區
        const simplifiedChineseRegions = [
            'zh-CN', 'zh-SG', // 中國大陸、新加坡
            'zh-Hans', 'zh-Hans-CN', 'zh-Hans-SG'
        ];

        // 檢查是否匹配繁體中文地區
        if (traditionalChineseRegions.some(region => userLanguage.startsWith(region))) {
            return 'zh-TW';
        }
        
        // 檢查是否匹配簡體中文地區
        if (simplifiedChineseRegions.some(region => userLanguage.startsWith(region))) {
            return 'zh-CN';
        }

        // 如果只是 'zh' 開頭但沒有具體地區，根據其他線索判斷
        if (userLanguage.startsWith('zh')) {
            // 檢查用戶代理字符串中的線索
            const userAgent = navigator.userAgent;
            
            // 檢查是否包含繁體中文相關的系統標識
            if (userAgent.includes('Taiwan') || userAgent.includes('Hong Kong') || userAgent.includes('Macau')) {
                return 'zh-TW';
            }
            
            // 檢查時區設置
            try {
                const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (timeZone.includes('Taipei') || timeZone.includes('Hong_Kong') || timeZone.includes('Macau')) {
                    return 'zh-TW';
                }
                if (timeZone.includes('Shanghai') || timeZone.includes('Beijing') || timeZone.includes('Singapore')) {
                    return 'zh-CN';
                }
            } catch (e) {
                console.log('無法檢測時區');
            }

            // 默認使用簡體中文
            return 'zh-CN';
        }

        // 非中文用戶，默認使用繁體中文（因為這是台灣學校的網站）
        return 'zh-TW';
    }

    getText(key) {
        return this.translations[this.currentLanguage][key] || this.translations['zh-TW'][key] || key;
    }

    init() {
        console.log('當前使用語言:', this.currentLanguage);
        this.updatePageLanguage();
    }

    updatePageLanguage() {
        // 更新頁面標題
        document.title = this.getText('appTitle');
        
        // 更新 HTML lang 屬性
        document.documentElement.lang = this.currentLanguage;
        
        // 更新靜態文本
        this.updateStaticTexts();
    }

    updateStaticTexts() {
        // 更新頁面上的靜態文本
        const updates = [
            { selector: '.app-bar-content h1', text: this.getText('appTitle') },
            { selector: '.panel-header h2', text: this.getText('imageList') },
            { selector: '#refresh-btn', attr: 'title', text: this.getText('refreshList') },
            { selector: '#fullscreen-btn', attr: 'title', text: this.getText('fullscreen') },
            { selector: '#current-image-name', text: this.getText('selectImage') },
            { selector: '#current-image-info', text: this.getText('selectImageDesc') },
            { selector: '.snackbar-action', text: this.getText('close') }
        ];

        updates.forEach(update => {
            const element = document.querySelector(update.selector);
            if (element) {
                if (update.attr) {
                    element.setAttribute(update.attr, update.text);
                } else {
                    element.textContent = update.text;
                }
            }
        });
    }

    // 動態生成帶翻譯的 HTML 內容
    generateLoadingState() {
        return `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p id="loading-text">${this.getText('loadingImages')}</p>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill"></div>
                    </div>
                    <div class="progress-text">
                        <span id="progress-current">0</span> / <span id="progress-total">0</span>
                    </div>
                </div>
            </div>
        `;
    }

    generateEmptyState() {
        return `
            <div class="empty-state">
                <span class="material-icons">image_not_supported</span>
                <h3>${this.getText('noImages')}</h3>
                <p>${this.getText('noImagesDesc')}</p>
                <p>${this.getText('supportedFormats')}</p>
            </div>
        `;
    }

    generateErrorState() {
        return `
            <div class="error-state">
                <span class="material-icons">error</span>
                <h3>${this.getText('loadFailed')}</h3>
                <p>${this.getText('loadFailedDesc')}</p>
                <button class="retry-btn" onclick="window.panoramaViewer.loadImages()">
                    ${this.getText('retry')}
                </button>
            </div>
        `;
    }

    // 獲取格式化文本
    getFormattedText(key, ...args) {
        let text = this.getText(key);
        args.forEach((arg, index) => {
            text = text.replace(`{${index}}`, arg);
        });
        return text;
    }
}

// 創建全局語言管理器實例
window.languageManager = new LanguageManager();