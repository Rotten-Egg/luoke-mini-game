/**
 * axios 公共方法封装
 * 提供统一的 HTTP 请求接口
 */

// 检查 axios 是否已加载
if (typeof axios === 'undefined') {
    throw new Error('axios 未加载，请在 HTML 中引入 axios');
}

/**
 * 创建 axios 实例
 * @param {Object} config - 配置参数
 * @returns {axios.AxiosInstance}
 */
function createAxiosInstance(config = {}) {
    const defaultConfig = {
        baseURL: '/api/app',
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    const instance = axios.create({ ...defaultConfig, ...config });

    // 请求拦截器
    instance.interceptors.request.use(
        (reqConfig) => {
            // 添加 Token
            const token = localStorage.getItem('game_token');
            if (token) {
                reqConfig.headers.Authorization = `Bearer ${token}`;
            }
            // 添加时间戳防止缓存
            if (reqConfig.method === 'get') {
                reqConfig.params = { ...reqConfig.params, _t: Date.now() };
            }
            console.log(`[API] ${reqConfig.method.toUpperCase()} ${reqConfig.url}`, reqConfig.params || reqConfig.data);
            return reqConfig;
        },
        (error) => {
            console.error('[API Request Error]', error);
            return Promise.reject(error);
        }
    );

    // 响应拦截器
    instance.interceptors.response.use(
        (response) => {
            const { data } = response;
            console.log(`[API Response] ${response.config.url}`, data);
            
            if (data && data.code !== undefined) {
                if (data.code === 200) {
                    return data.data || data;
                } else if (data.code === 401) {
                    localStorage.removeItem('game_token');
                    localStorage.removeItem('current_user');
                    if (window.location.pathname !== '/') {
                        window.location.href = '/';
                    }
                    return Promise.reject(new Error('登录已过期'));
                } else {
                    return Promise.reject(new Error(data.message || '请求失败'));
                }
            }
            return data;
        },
        (error) => {
            let message = '网络请求失败';
            if (error.response) {
                const { status, data } = error.response;
                message = data?.message || getStatusMessage(status);
            } else if (error.request) {
                message = '请求超时，请检查网络';
            } else {
                message = error.message;
            }
            console.error('[API Error]', message);
            return Promise.reject(new Error(message));
        }
    );

    return instance;
}

/**
 * 根据状态码获取错误信息
 */
function getStatusMessage(status) {
    const messages = {
        400: '请求参数错误',
        401: '未授权，请登录',
        403: '禁止访问',
        404: '请求地址不存在',
        500: '服务器内部错误',
        502: '网关错误',
        503: '服务不可用'
    };
    return messages[status] || `请求失败 (${status})`;
}

/**
 * 封装常用 HTTP 方法
 */
const http = {
    /**
     * GET 请求
     * @param {string} url - 请求地址
     * @param {Object} params - 请求参数
     * @param {Object} config - 额外配置
     * @returns {Promise}
     */
    get: (url, params = {}, config = {}) => {
        const instance = createAxiosInstance(config);
        return instance.get(url, { params });
    },

    /**
     * POST 请求
     * @param {string} url - 请求地址
     * @param {Object} data - 请求数据
     * @param {Object} config - 额外配置
     * @returns {Promise}
     */
    post: (url, data = {}, config = {}) => {
        const instance = createAxiosInstance(config);
        return instance.post(url, data);
    },

    /**
     * PUT 请求
     * @param {string} url - 请求地址
     * @param {Object} data - 请求数据
     * @param {Object} config - 额外配置
     * @returns {Promise}
     */
    put: (url, data = {}, config = {}) => {
        const instance = createAxiosInstance(config);
        return instance.put(url, data);
    },

    /**
     * DELETE 请求
     * @param {string} url - 请求地址
     * @param {Object} params - 请求参数
     * @param {Object} config - 额外配置
     * @returns {Promise}
     */
    delete: (url, params = {}, config = {}) => {
        const instance = createAxiosInstance(config);
        return instance.delete(url, { params });
    },

    /**
     * 上传文件
     * @param {string} url - 请求地址
     * @param {FormData} formData - 表单数据
     * @param {Object} config - 额外配置
     * @returns {Promise}
     */
    upload: (url, formData, config = {}) => {
        const instance = createAxiosInstance({
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return instance.post(url, formData);
    }
};

/**
 * 用户相关 API
 */
const userApi = {
    // 用户注册/登录
    registerOrLogin: (data) => http.post('/user/registerOrLogin', data),
    // 获取用户信息
    getUserInfo: () => http.get('/users/info'),
    // 更新用户信息
    updateUserInfo: (data) => http.put('/users/info', data),
    // 修改密码
    changePassword: (data) => http.put('/users/password', data),
    // 发送验证码
    sendCode: (data) => http.post('/users/code', data)
};

/**
 * 游戏相关 API
 */
const gameApi = {
    // 提交分数
    submitScore: (data) => http.post('/game/end', data),
    // 获取排行榜
    getRankList: (params) => http.get('/game/ranking', params)
};

/**
 * 统一导出
 */
const API = {
    // 基础 HTTP 方法
    http,
    // 用户模块
    user: userApi,
    // 游戏模块
    game: gameApi,
    // 创建自定义 axios 实例
    createInstance: createAxiosInstance
};

// 挂载到全局
if (typeof window !== 'undefined') {
    window.API = API;
    console.log('API 已挂载到 window:', window.API);
}