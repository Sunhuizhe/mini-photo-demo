// miniprogram/pages/home/home.js
const app = getApp()

let vw
let vh

Page({

    /**
     * 页面的初始数据
     */
    data: {
        photo: '../../imgs/default-avatar.png',
        showCamera: 0,
        restSdkCount: 0,
        image: 'data:image/png;base64,',
        // image: '../../imgs/default-avatar.png',
        bgImg: '../../imgs/ocean.jpeg',
        bgList: ['../../imgs/forest.jpg', '../../imgs/ocean.jpeg', '../../imgs/sakura.jpeg'],
        cvw: 300,
        cvh: 300,
        imgw: 0,
        imgh: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this

        wx.getSystemInfo({
            success: (res) => {
                vw = res.windowWidth / 750
                vh = res.windowHeight / 750
            }
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    // 显示相机
    showCameraFun() {
        this.setData({
            showCamera: 1
        })
    },

    // 拍照
    takePhoto() {
        const ctx = wx.createCameraContext()
        ctx.takePhoto({
            quality: 'medium',
            success: (res) => {
                console.log(res)
                wx.getFileSystemManager().readFile({
                    filePath: res.tempImagePath, //选择图片返回的相对路径
                    encoding: 'base64', //编码格式
                    success: res => { //成功的回调
                        this.getHandelPhoto('data:image/png;base64,' + res.data)
                    }
                })
            }
        })
    },

    // 获取人体抠像
    getHandelPhoto(img) {
        console.log('进入getHandelPhoto')
        let that = this
        wx.request({
            url: 'https://api-cn.faceplusplus.com/humanbodypp/v2/segment', //仅为示例，并非真实的接口地址
            method: 'post',
            data: {
                "api_key": '',
                "api_secret": '',
                "image_base64": img,
                "return_grayscale": 0
            },
            header: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            success: (res) => {
                console.log(res, 'getHandelPhoto-success')
                this.send_code('data:image/png;base64,' + res.data.body_image)
            },
            complete: (res) => {
                if(res.statusCode != 200){
                    wx.showToast({
                      title: res.data.error_message,
                      icon: 'none'
                    })
                }
            }
        })
    },

    //将base64图片转网络图片
    send_code(code) {
        /*code是指图片base64格式数据*/
        //声明文件系统
        const fs = wx.getFileSystemManager();
        //随机定义路径名称
        var times = new Date().getTime();
        var codeimg = wx.env.USER_DATA_PATH + '/' + times + '.png';

        //将base64图片写入
        fs.writeFile({
            filePath: codeimg,
            data: code.slice(22),
            encoding: 'base64',
            success: () => {
                //写入成功了的话，新的图片路径就能用了
                // this.huizhi({}, codeimg);
                this.setData({
                    image: codeimg,
                    showCamera: 2,
                }, () => {
                    this.getPhotoSize()
                })
            }
        })
    },


    // 获取照片尺寸
    getPhotoSize() {
        let that = this
        wx.getImageInfo({
            src: this.data.image,
            success: (res) => {
                console.log(res, 'getPhotoSize')
                this.setData({
                    imgw: res.width * vw,
                    imgh: res.height * vw
                },()=>{
                    // 初始渲染
                    that.imageHandel()
                })
            }
        })
    },

    // 获取云函数调用次数
    logSdkCount() {
        wx.cloud.callFunction({
            name: 'log-sdk-count',
            data: {},
            success: res => {
                console.log('剩余sdk免费调用次数', res.result)
                this.setData({
                    restSdkCount: res.result
                })
            },
            fail: err => {
                console.error('[云函数] [count] 调用失败', err)
            }
        })
    },

    // 改变背景
    changeBgImage(e) {
        let img = e.currentTarget.dataset.img

        if (img == this.data.bgImg) return;

        this.setData({
            bgImg: img
        })

        this.imageHandel()
    },

    // 图片合成
    imageHandel() {
        console.log('调用了imageHandel', this.data.image)
        let self = this;
        const ctx = wx.createCanvasContext('myCanvas');
        wx.getImageInfo({
            src: self.data.bgImg,
            success: (res) => {
                this.setData({
                    cvw: res.width * vw,
                    cvh: res.height * vw
                })
                console.log(self.data.image, self.data.imgw, self.data.imgh)
                ctx.drawImage(self.data.bgImg, 0, 0, res.width * vw, res.height * vw);
                ctx.drawImage(self.data.image, 0, res.height * vw - res.width * vw / self.data.imgw * self.data.imgh, res.width * vw, res.width * vw / self.data.imgw * self.data.imgh);
                ctx.draw();
            },
            complete: (res)=>{
                console.log(res, 'imageHandel-getImageInfo-complete')
            }
        })
    },

    // 保存到本地
    saveImage() {
        let that = this
        wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: that.data.cvw,
            height: that.data.cvh,
            canvasId: 'myCanvas',
            success: function (res) {
                console.log(res, 'ressssssssssss')
                let pic = res.tempFilePath;
                wx.saveImageToPhotosAlbum({
                    filePath: pic,
                    success(res) {
                        wx.hideLoading();
                        wx.showToast({
                            title: '保存成功',
                            icon: 'success',
                            duration: 3000
                        });
                    }
                });
            },
            complete: (ret) => {
                console.log(ret, 'rettttttttt')
            }
        });
    },

    tryAgain(){
        this.setData({
            showCamera: 0,
        })
    }

})