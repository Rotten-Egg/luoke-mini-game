/**
 * 复活面板 - 看广告复活UI
 * 
 * 功能：
 * 1. 在游戏结束时显示"看广告复活"选项
 * 2. 提供"看广告复活"按钮和"继续游戏结束"按钮
 * 3. 集成穿山甲激励视频广告
 */

/**
 * 复活面板管理器
 */
var RevivePanel = {
    // 是否显示中
    isShowing: false,
    
    // 复活成功回调
    onReviveSuccess: null,
    
    // 跳过复活回调
    onSkipRevive: null,
    
    // DOM元素
    panel: null,
    
    /**
     * 显示复活面板
     * @param {Function} onReviveSuccess 复活成功回调
     * @param {Function} onSkipRevive 跳过复活回调
     */
    show: function(onReviveSuccess, onSkipRevive) {
        this.onReviveSuccess = onReviveSuccess || null;
        this.onSkipRevive = onSkipRevive || null;
        
        if (this.isShowing) {
            return;
        }
        
        this.isShowing = true;
        this.createPanel();
        this.panel.style.display = 'flex';
        
        console.log('[RevivePanel] 复活面板已显示');
    },
    
    /**
     * 隐藏复活面板
     */
    hide: function() {
        if (this.panel) {
            this.panel.style.display = 'none';
        }
        this.isShowing = false;
        console.log('[RevivePanel] 复活面板已隐藏');
    },
    
    /**
     * 销毁复活面板
     */
    destroy: function() {
        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel);
        }
        this.panel = null;
        this.isShowing = false;
    },
    
    /**
     * 创建复活面板
     */
    createPanel: function() {
        var self = this;
        
        if (this.panel) {
            return;
        }
        
        // 创建面板容器
        this.panel = document.createElement('div');
        this.panel.id = 'revivePanel';
        this.panel.innerHTML = this.getPanelHTML();
        document.body.appendChild(this.panel);
        
        // 绑定按钮事件
        var watchAdBtn = document.getElementById('reviveWatchAdBtn');
        var skipBtn = document.getElementById('reviveSkipBtn');
        
        if (watchAdBtn) {
            watchAdBtn.addEventListener('click', function() {
                self.onWatchAdClick();
            });
        }
        
        if (skipBtn) {
            skipBtn.addEventListener('click', function() {
                self.onSkipClick();
            });
        }
        
        // 添加动画效果
        setTimeout(function() {
            if (self.panel) {
                self.panel.classList.add('show');
            }
        }, 10);
    },
    
    /**
     * 获取面板HTML
     */
    getPanelHTML: function() {
        return '<style>' +
            '#revivePanel { ' +
                'position: fixed; ' +
                'top: 0; ' +
                'left: 0; ' +
                'width: 100%; ' +
                'height: 100%; ' +
                'background: rgba(0, 0, 0, 0.85); ' +
                'z-index: 99990; ' +
                'display: none; ' +
                'flex-direction: column; ' +
                'justify-content: center; ' +
                'align-items: center; ' +
                'opacity: 0; ' +
                'transition: opacity 0.3s ease; ' +
            '} ' +
            '#revivePanel.show { ' +
                'opacity: 1; ' +
            '} ' +
            '.revive-content { ' +
                'background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); ' +
                'border-radius: 20px; ' +
                'padding: 40px; ' +
                'text-align: center; ' +
                'max-width: 320px; ' +
                'width: 90%; ' +
                'box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); ' +
                'border: 2px solid rgba(255, 215, 0, 0.3); ' +
            '} ' +
            '.revive-title { ' +
                'font-size: 28px; ' +
                'font-weight: bold; ' +
                'color: #ffd700; ' +
                'margin-bottom: 10px; ' +
                'text-shadow: 0 2px 10px rgba(255, 215, 0, 0.5); ' +
            '} ' +
            '.revive-subtitle { ' +
                'font-size: 16px; ' +
                'color: #aaa; ' +
                'margin-bottom: 30px; ' +
            '} ' +
            '.revive-icon { ' +
                'font-size: 60px; ' +
                'margin-bottom: 20px; ' +
            '} ' +
            '.revive-btn { ' +
                'width: 100%; ' +
                'padding: 15px 20px; ' +
                'margin: 10px 0; ' +
                'border: none; ' +
                'border-radius: 30px; ' +
                'font-size: 18px; ' +
                'font-weight: bold; ' +
                'cursor: pointer; ' +
                'transition: all 0.3s ease; ' +
            '} ' +
            '.revive-btn:active { ' +
                'transform: scale(0.95); ' +
            '} ' +
            '.revive-btn-watch { ' +
                'background: linear-gradient(135deg, #ff6b6b 0%, #c0392b 100%); ' +
                'color: #fff; ' +
                'box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4); ' +
            '} ' +
            '.revive-btn-watch:hover { ' +
                'background: linear-gradient(135deg, #ff5252 0%, #d32f2f 100%); ' +
                'box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6); ' +
            '} ' +
            '.revive-btn-skip { ' +
                'background: transparent; ' +
                'color: #888; ' +
                'border: 2px solid #444; ' +
            '} ' +
            '.revive-btn-skip:hover { ' +
                'border-color: #666; ' +
                'color: #aaa; ' +
            '} ' +
            '.revive-tips { ' +
                'font-size: 12px; ' +
                'color: #666; ' +
                'margin-top: 15px; ' +
            '} ' +
            '</style>' +
            '<div class="revive-content">' +
                '<div class="revive-icon">❤️</div>' +
                '<div class="revive-title">生命归零!</div>' +
                '<div class="revive-subtitle">观看完整广告即可复活继续游戏</div>' +
                '<button class="revive-btn revive-btn-watch" id="reviveWatchAdBtn">🎬 看广告复活</button>' +
                '<button class="revive-btn revive-btn-skip" id="reviveSkipBtn">直接结束</button>' +
                '<div class="revive-tips">广告由穿山甲提供，请耐心等待加载</div>' +
            '</div>';
    },
    
    /**
     * 点击看广告按钮
     */
    onWatchAdClick: function() {
        var self = this;
        
        console.log('[RevivePanel] 用户点击看广告复活');
        
        // 调用广告管理器显示广告
        if (typeof AdManager !== 'undefined') {
            // 显示加载提示
            this.hide();
            
            AdManager.showRewardedAd(
                // 广告观看完成回调 - 复活
                function() {
                    console.log('[RevivePanel] 广告观看完成，准备复活');
                    self.hide();
                    
                    if (self.onReviveSuccess) {
                        self.onReviveSuccess();
                    }
                },
                // 广告关闭回调
                function() {
                    console.log('[RevivePanel] 广告已关闭');
                    // 可以选择重新显示复活面板
                    // self.show(self.onReviveSuccess, self.onSkipRevive);
                },
                // 广告错误回调
                function(err) {
                    console.error('[RevivePanel] 广告播放失败:', err);
                    alert('广告加载失败，请稍后重试');
                    // 重新显示复活面板
                    self.show(self.onReviveSuccess, self.onSkipRevive);
                }
            );
        } else {
            // 如果广告管理器未定义，使用模拟复活
            console.log('[RevivePanel] 广告管理器未定义，使用模拟复活');
            alert('广告功能加载中，请稍后...');
        }
    },
    
    /**
     * 点击跳过按钮
     */
    onSkipClick: function() {
        console.log('[RevivePanel] 用户跳过复活');
        this.hide();
        
        if (window.API && window.API.game) {
            var gameScore = typeof score !== 'undefined' ? score : 0;
            currentUser = JSON.parse(localStorage.getItem('current_user'));
            
            API.game.submitScore({
                uid: currentUser.userId,
                score: gameScore
            }).then(function(result) {
                console.log('[RevivePanel] 分数提交成功:', result);
            }).catch(function(error) {
                console.error('[RevivePanel] 分数提交失败:', error);
            });
        }
        
        if (this.onSkipRevive) {
            this.onSkipRevive();
        }
    }
};
