import { Viewer } from '@photo-sphere-viewer/core';

class PanoramaViewer {
    constructor() {
        this.viewer = null;
        this.currentImages = [];
        this.currentImageIndex = -1;
        this.languageManager = window.languageManager;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadImages();
        this.showSnackbar(this.languageManager.getText('appLoaded'), 'success');
    }

    setupEventListeners() {
        // 刷新按鈕
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadImages();
        });

        // 全螢幕按鈕
        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Snackbar 關閉按鈕
        document.querySelector('.snackbar-action').addEventListener('click', () => {
            this.hideSnackbar();
        });

        // 鍵盤快捷鍵
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousImage();
            } else if (e.key === 'ArrowRight') {
                this.nextImage();
            } else if (e.key === 'f' || e.key === 'F') {
                this.toggleFullscreen();
            }
        });
    }

    async loadImages() {
        const imageList = document.getElementById('image-list');
        
        // 顯示載入狀態
        imageList.innerHTML = this.languageManager.generateLoadingState();

        try {
            // 由於瀏覽器安全限制，無法直接讀取文件夾
            // 這裡使用預定義的圖片列表，實際使用時需要後端支援
            const imageFiles = await this.getImageList();
            
            if (imageFiles.length === 0) {
                imageList.innerHTML = this.languageManager.generateEmptyState();
                return;
            }

            this.currentImages = imageFiles;
            this.renderImageList();
            
        } catch (error) {
            console.error('載入圖片失敗:', error);
            this.showSnackbar(this.languageManager.getText('loadImageFailed'), 'error');
            
            imageList.innerHTML = this.languageManager.generateErrorState();
        }
    }

    async getImageList() {
        let possibleImages = [];
        
        try {
            // 首先嘗試從 JSON 配置文件載入圖片列表
            const response = await fetch('images.json');
            if (response.ok) {
                const imageNames = await response.json();
                const existingImages = [];
                
                // 更新進度：開始檢查 JSON 中的圖片
                this.updateProgress(0, imageNames.length, this.languageManager.getText('checkingImages'));
                
                // 檢查每個圖片是否存在
                for (let i = 0; i < imageNames.length; i++) {
                    const imageName = imageNames[i];
                    try {
                        const imageResponse = await fetch(`files/${encodeURIComponent(imageName)}`, { method: 'HEAD' });
                        if (imageResponse.ok) {
                            existingImages.push({
                                name: imageName,
                                path: `files/${encodeURIComponent(imageName)}`,
                                size: imageResponse.headers.get('content-length') || '未知'
                            });
                        }
                    } catch (error) {
                        console.log(`圖片不存在: ${imageName}`);
                    }
                    
                    // 更新進度
                    this.updateProgress(i + 1, imageNames.length, 
                        this.languageManager.getText('checkingImages'));
                }
                
                if (existingImages.length > 0) {
                    this.updateProgress(imageNames.length, imageNames.length, 
                        this.languageManager.getText('foundImages').replace('{count}', existingImages.length));
                    return existingImages;
                }
            }
        } catch (error) {
            console.log('無法載入 images.json，使用預設列表');
        }
        
        // 備用方案：使用預定義的圖片列表
        possibleImages = [
            // 你的實際圖片檔案名稱
            '七彩径.JPG',
            '孔子像.JPG', 
            '学校上空.JPG',
            '操场.JPG',
            '有为广场.JPG',
            '有为石.JPG',
            '校门.JPG',
            '桥.JPG',
            '水池.JPG',
            '润心苑.JPG',
            '篮球场.JPG',
            '臻桂亭.JPG',
            '课室.JPG',
            '鸣谦亭.JPG',
            // 示例圖片
            'example1.jpg',
            'example2.jpg',
            'panorama1.jpg',
            'panorama2.jpg', 
            'panorama3.jpg',
            'sample.jpg',
            'test.jpg',
            'demo.jpg'
        ];

        const existingImages = [];
        
        // 更新進度：開始檢查預設圖片列表
        this.updateProgress(0, possibleImages.length, this.languageManager.getText('checkingImages'));
        
        // 檢查圖片是否存在
        for (let i = 0; i < possibleImages.length; i++) {
            const imageName = possibleImages[i];
            try {
                const response = await fetch(`files/${encodeURIComponent(imageName)}`, { method: 'HEAD' });
                if (response.ok) {
                    existingImages.push({
                        name: imageName,
                        path: `files/${encodeURIComponent(imageName)}`,
                        size: response.headers.get('content-length') || '未知'
                    });
                }
            } catch (error) {
                // 圖片不存在，忽略
                console.log(`圖片不存在: ${imageName}`);
            }
            
            // 更新進度
            this.updateProgress(i + 1, possibleImages.length, 
                this.languageManager.getText('checkingImages'));
        }

        // 完成檢查
        this.updateProgress(possibleImages.length, possibleImages.length, 
            this.languageManager.getText('foundImages').replace('{count}', existingImages.length));

        return existingImages;
    }

    // 更新加載進度
    updateProgress(current, total, message = null) {
        const progressFill = document.getElementById('progress-fill');
        const progressCurrent = document.getElementById('progress-current');
        const progressTotal = document.getElementById('progress-total');
        const progressPercentage = document.getElementById('progress-percentage');
        const loadingText = document.getElementById('loading-text');

        if (progressFill && progressCurrent && progressTotal) {
            const percentage = total > 0 ? (current / total) * 100 : 0;
            progressFill.style.width = `${percentage}%`;
            progressCurrent.textContent = current;
            progressTotal.textContent = total;
            
            // 更新百分比顯示
            if (progressPercentage) {
                progressPercentage.textContent = `${Math.round(percentage)}%`;
            }
        }

        if (loadingText && message) {
            loadingText.textContent = message;
        }
    }

    renderImageList() {
        const imageList = document.getElementById('image-list');
        
        const listHTML = this.currentImages.map((image, index) => `
            <div class="image-item ${index === this.currentImageIndex ? 'active' : ''}" 
                 data-index="${index}" onclick="window.panoramaViewer.loadPanorama(${index})">
                <div class="image-thumbnail">
                    <span class="material-icons">panorama</span>
                </div>
                <div class="image-info">
                    <h4>${image.name}</h4>
                    <p>${this.languageManager.getText('size')}: ${this.formatFileSize(image.size)}</p>
                </div>
                <div class="view-indicator">
                    <span class="material-icons">visibility</span>
                </div>
            </div>
        `).join('');

        imageList.innerHTML = listHTML;
    }

    loadPanorama(index) {
        if (index < 0 || index >= this.currentImages.length) return;

        const image = this.currentImages[index];
        this.currentImageIndex = index;

        try {
            // 銷毀現有的查看器
            if (this.viewer) {
                this.viewer.destroy();
            }

            // 創建新的查看器
            this.viewer = new Viewer({
                container: document.querySelector('#viewer'),
                panorama: image.path,
                loadingImg: this.createLoadingImage(),
                navbar: [
                    'zoom',
                    'move',
                    'download',
                    'fullscreen'
                ],
                caption: image.name,
                plugins: []
            });

            // 設置事件監聽器
            this.viewer.addEventListener('ready', () => {
                this.showSnackbar(`${this.languageManager.getText('imageLoaded')}: ${image.name}`, 'success');
                this.updateInfoPanel(image);
            });

            this.viewer.addEventListener('error', (err) => {
                console.error('查看器錯誤:', err);
                this.showSnackbar(this.languageManager.getText('loadImageFailed'), 'error');
            });

            // 更新活動狀態
            this.updateActiveImage(index);

        } catch (error) {
            console.error('載入全景圖失敗:', error);
            this.showSnackbar(this.languageManager.getText('loadImageFailed'), 'error');
        }
    }

    updateActiveImage(index) {
        document.querySelectorAll('.image-item').forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
    }

    updateInfoPanel(image) {
        document.getElementById('current-image-name').textContent = image.name;
        document.getElementById('current-image-info').textContent = 
            `${this.languageManager.getText('imageSize')}: ${this.formatFileSize(image.size)} | ${this.languageManager.getText('format')}: ${this.getFileExtension(image.name).toUpperCase()}`;
    }

    previousImage() {
        if (this.currentImages.length === 0) return;
        const newIndex = this.currentImageIndex > 0 ? this.currentImageIndex - 1 : this.currentImages.length - 1;
        this.loadPanorama(newIndex);
    }

    nextImage() {
        if (this.currentImages.length === 0) return;
        const newIndex = this.currentImageIndex < this.currentImages.length - 1 ? this.currentImageIndex + 1 : 0;
        this.loadPanorama(newIndex);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    createLoadingImage() {
        // 創建 SVG 載入圖片
        const svg = `
            <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" stroke="#8D6E63" stroke-width="8" fill="none" stroke-dasharray="60 40" stroke-linecap="round">
                    <animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" values="0 50 50;360 50 50"/>
                </circle>
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    showSnackbar(message, type = 'info') {
        const snackbar = document.getElementById('snackbar');
        const textElement = snackbar.querySelector('.snackbar-text');
        
        textElement.textContent = message;
        snackbar.className = `snackbar show ${type}`;
        
        // 3秒後自動隱藏
        setTimeout(() => {
            this.hideSnackbar();
        }, 3000);
    }

    hideSnackbar() {
        const snackbar = document.getElementById('snackbar');
        snackbar.classList.remove('show');
    }

    formatFileSize(bytes) {
        const unknownText = this.languageManager.currentLanguage === 'zh-CN' ? '未知' : '未知';
        if (bytes === unknownText || !bytes || bytes === '未知') return unknownText;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    getFileExtension(filename) {
        return filename.split('.').pop() || '';
    }
}

// 初始化應用程式
window.addEventListener('DOMContentLoaded', () => {
    window.panoramaViewer = new PanoramaViewer();
});

// 防止右鍵菜單在查看器上顯示
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('#viewer')) {
        e.preventDefault();
    }
});