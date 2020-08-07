//app.js
App({
    onLaunch: function () {

        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            wx.cloud.init({
                // env 参数说明：
                //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
                //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
                //   如不填则使用默认环境（第一个创建的环境）
                env: 'photo-envid',
                traceUser: true,
            })
        }

        this.globalData = {
            avatarUrl: '',
            userInfo: {},
        }

        // 调用云函数
        // wx.cloud.callFunction({
        //     name: 'login',
        //     data: {},
        //     success: res => {
        //         this.globalData.openid = res.result.openid
        //     },
        //     fail: err => {
        //         wx.showToast({
        //             title: err,
        //             icon: 'none'
        //         })
        //     }
        // })
    },

    perGetUserInfo() {
        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    this.getUserInfo()
                }
            }
        })
    },

    getUserInfo(){
        wx.getUserInfo({
            success: res => {
                console.log(res, '用户信息')
                this.setData({
                    avatarUrl: res.userInfo.avatarUrl,
                    userInfo: res.userInfo
                })
            }
        })
    },
})
