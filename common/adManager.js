/**
 * 穿山甲广告联盟SDK桥接层
 * 
 * 说明：
 * 1. 穿山甲广告SDK主要面向原生APP开发，对于H5网页有多种接入方式：
 *    - 使用Pangle(穿山甲国际版) Web SDK
 *    - 配合APP打包使用WebView桥接
 *    - 使用其他H5友好的广告联盟
 * 
 * 2. 本文件提供了完整的广告接口抽象，便于后期替换具体广告实现
 * 
 * 3. 配置方式：
 *    - 在穿山甲后台创建激励视频广告位ID
 *    - 将YOUR_PLACEMENT_ID替换为实际的广告位ID
 * 
 * 配置说明：
 * - REWARDED_AD_SLOT_ID: 激励视频广告位ID
 * - IS_DEBUG: 是否开启调试模式
 */

// ==================== 广告配置 ====================
var AdConfig = {
    // 穿山甲广告位ID (需要替换为你的实际广告位ID)
    REWARDED_AD_SLOT_ID: 'YOUR_REWARDED_AD_SLOT_ID',
    
    // 是否为测试模式
    IS_DEBUG: true,
    
    // 广告加载超时时间(毫秒)
    LOAD_TIMEOUT: 30000,
    
    // 是否启用广告功能
    AD_ENABLED: true
};

// ==================== 广告管理器 ====================
var AdManager = {
    // 广告是否准备就绪
    isAdReady: false,
    
    // 是否正在显示广告
    isAdShowing: false,
    
    // 复活回调函数
    onReviveCallback: null,
    
    // 广告关闭回调函数
    onAdCloseCallback: null,
    
    // 广告错误回调
    onAdErrorCallback: null,
    
    /**
     * 初始化广告SDK
     * 在页面加载完成后调用
     */
    init: function() {
        console.log('[AdManager] 广告管理器初始化开始');
        
        if (!AdConfig.AD_ENABLED) {
            console.log('[AdManager] 广告功能已禁用');
            return;
        }
        
        // 尝试初始化穿山甲SDK
        this.initPangleSDK();
    },
    
    /**
     * 初始化穿山甲SDK
     * 注意：这是Web端集成方式，实际项目中可能需要根据具体集成文档调整
     */
    initPangleSDK: function() {
        // 方式1: 使用穿山甲Web SDK (如果有的话)
        // 如果页面中已通过script标签加载了穿山甲SDK，这里会初始化
        
        if (typeof pangle !== 'undefined') {
            console.log('[AdManager] 检测到穿山甲SDK，准备初始化');
            
            try {
                // 穿山甲SDK初始化配置
                pangle.init({
                    appId: AdConfig.REWARDED_AD_SLOT_ID.split('_')[0] || 'YOUR_APP_ID',
                    // 其他配置参数根据实际SDK文档添加
                });
                
                console.log('[AdManager] 穿山甲SDK初始化成功');
            } catch (e) {
                console.error('[AdManager] 穿山甲SDK初始化失败:', e);
            }
        } else {
            console.log('[AdManager] 未检测到穿山甲SDK，将使用模拟广告进行调试');
            console.log('[AdManager] 提示: 请根据实际部署环境选择合适的广告集成方式');
        }
        
        // 预加载广告
        this.preloadAd();
    },
    
    /**
     * 预加载激励视频广告
     */
    preloadAd: function() {
        var self = this;
        
        if (AdConfig.IS_DEBUG) {
            console.log('[AdManager] 预加载激励视频广告');
        }
        
        // 方式1: 使用穿山甲SDK预加载
        if (typeof pangle !== 'undefined' && pangle.loadRewardedVideoAd) {
            pangle.loadRewardedVideoAd({
                slotId: AdConfig.REWARDED_AD_SLOT_ID,
                timeout: AdConfig.LOAD_TIMEOUT,
                onLoad: function() {
                    self.isAdReady = true;
                    console.log('[AdManager] 广告预加载成功');
                },
                onError: function(err) {
                    self.isAdReady = false;
                    console.error('[AdManager] 广告预加载失败:', err);
                }
            });
        } else {
            // 模拟加载成功（调试模式）
            setTimeout(function() {
                self.isAdReady = true;
                if (AdConfig.IS_DEBUG) {
                    console.log('[AdManager] 广告预加载成功(模拟)');
                }
            }, 1000);
        }
    },
    
    /**
     * 显示激励视频广告（复活广告）
     * @param {Function} onComplete 观看完成回调（用于复活）
     * @param {Function} onClose 广告关闭回调
     * @param {Function} onError 错误回调
     */
    showRewardedAd: function(onComplete, onClose, onError) {
        var self = this;
        
        this.onReviveCallback = onComplete || null;
        this.onAdCloseCallback = onClose || null;
        this.onAdErrorCallback = onError || null;
        
        if (this.isAdShowing) {
            console.log('[AdManager] 广告正在显示中，请等待');
            return;
        }
        
        if (AdConfig.IS_DEBUG) {
            console.log('[AdManager] 请求显示激励视频广告');
        }
        
        // 显示加载提示
        this.showLoadingTips();
        
        // 方式1: 使用穿山甲SDK显示广告
        if (typeof pangle !== 'undefined' && pangle.showRewardedVideoAd) {
            this.isAdShowing = true;
            
            pangle.showRewardedVideoAd({
                slotId: AdConfig.REWARDED_AD_SLOT_ID,
                onStart: function() {
                    self.isAdShowing = true;
                    self.hideLoadingTips();
                    console.log('[AdManager] 广告开始播放');
                },
                onComplete: function() {
                    // 用户观看完成，触发复活
                    self.isAdShowing = false;
                    console.log('[AdManager] 广告观看完成，触发复活');
                    if (self.onReviveCallback) {
                        self.onReviveCallback();
                    }
                },
                onClose: function() {
                    self.isAdShowing = false;
                    self.hideLoadingTips();
                    console.log('[AdManager] 广告已关闭');
                    if (self.onAdCloseCallback) {
                        self.onAdCloseCallback();
                    }
                },
                onError: function(err) {
                    self.isAdShowing = false;
                    self.hideLoadingTips();
                    console.error('[AdManager] 广告播放出错:', err);
                    if (self.onAdErrorCallback) {
                        self.onAdErrorCallback(err);
                    }
                }
            });
        } else {
            // 模拟广告流程（调试模式）
            this.simulateAdFlow();
        }
    },
    
    /**
     * 模拟广告流程（用于调试）
     */
    simulateAdFlow: function() {
        var self = this;
        var adDuration = AdConfig.IS_DEBUG ? 3000 : 5000; // 调试模式3秒，正式5秒
        
        this.isAdShowing = true;
        this.hideLoadingTips();
        
        console.log('[AdManager] 模拟广告开始，' + (adDuration/1000) + '秒后完成');
        
        // 创建模拟广告界面
        this.showMockAdUI(function() {
            self.isAdShowing = false;
            
            // 触发复活
            console.log('[AdManager] 模拟广告观看完成，触发复活');
            if (self.onReviveCallback) {
                self.onReviveCallback();
            }
            
            // 关闭模拟广告界面
            self.hideMockAdUI();
        });
        
        // 广告计时器
        self._mockAdTimer = setTimeout(function() {
            // 触发广告完成
            if (self._mockAdCallback) {
                self._mockAdCallback();
                self._mockAdCallback = null;
            }
        }, adDuration);
    },
    
    /**
     * 显示模拟广告UI
     */
    showMockAdUI: function(onComplete) {
        this._mockAdCallback = onComplete;
        
        var mockUI = document.getElementById('mockAdUI');
        if (!mockUI) {
            mockUI = document.createElement('div');
            mockUI.id = 'mockAdUI';
            mockUI.innerHTML = 
                '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:99999;display:flex;flex-direction:column;justify-content:center;align-items:center;">' +
                    '<div style="color:#fff;font-size:24px;margin-bottom:20px;">正在播放广告...</div>' +
                    '<div style="width:200px;height:200px;background:#333;display:flex;justify-content:center;align-items:center;border-radius:10px;">' +
                        '<span style="color:#666;font-size:48px;">AD</span>' +
                    '</div>' +
                    '<div id="mockAdTimer" style="color:#fff;font-size:18px;margin-top:20px;">5秒</div>' +
                    '<div style="color:#888;font-size:14px;margin-top:10px;">观看完整广告可复活</div>' +
                '</div>';
            document.body.appendChild(mockUI);
        }
        
        mockUI.style.display = 'flex';
        
        // 倒计时更新
        var self = this;
        var countdown = 5;
        this._countdownInterval = setInterval(function() {
            countdown--;
            var timerEl = document.getElementById('mockAdTimer');
            if (timerEl) {
                timerEl.textContent = countdown + '秒';
            }
            if (countdown <= 0) {
                clearInterval(self._countdownInterval);
            }
        }, 1000);
    },
    
    /**
     * 隐藏模拟广告UI
     */
    hideMockAdUI: function() {
        var mockUI = document.getElementById('mockAdUI');
        if (mockUI) {
            mockUI.style.display = 'none';
        }
        
        if (this._countdownInterval) {
            clearInterval(this._countdownInterval);
            this._countdownInterval = null;
        }
        
        if (this._mockAdTimer) {
            clearTimeout(this._mockAdTimer);
            this._mockAdTimer = null;
        }
    },
    
    /**
     * 显示加载提示
     */
    showLoadingTips: function() {
        var tips = document.getElementById('adLoadingTips');
        if (!tips) {
            tips = document.createElement('div');
            tips.id = 'adLoadingTips';
            tips.innerHTML = 
                '<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
                'background:rgba(0,0,0,0.8);color:#fff;padding:20px 40px;border-radius:10px;' +
                'z-index:99998;font-size:16px;">广告加载中...</div>';
            document.body.appendChild(tips);
        }
        tips.style.display = 'block';
    },
    
    /**
     * 隐藏加载提示
     */
    hideLoadingTips: function() {
        var tips = document.getElementById('adLoadingTips');
        if (tips) {
            tips.style.display = 'none';
        }
    },
    
    /**
     * 销毁广告管理器
     */
    destroy: function() {
        if (this._countdownInterval) {
            clearInterval(this._countdownInterval);
        }
        if (this._mockAdTimer) {
            clearTimeout(this._mockAdTimer);
        }
        this.hideLoadingTips();
        this.hideMockAdUI();
        
        var tips = document.getElementById('adLoadingTips');
        if (tips) {
            tips.remove();
        }
        
        console.log('[AdManager] 广告管理器已销毁');
    }
};

// ==================== 页面加载完成后初始化 ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        AdManager.init();
    });
} else {
    AdManager.init();
}
