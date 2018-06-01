


var images = require("images");
var rp = require("request-promise");
var md5 = require("crypto-js/md5");
const url = 'https://api.ai.qq.com/fcgi-bin/face/face_detectface'
class DouyinGril {
    constructor() {
        const _ts = this,
            { execFile } = require('child_process');

        _ts.m = {
            path: require('path'),
            fs: require('fs'),
            os: require('os'),
            chalk: require('chalk'),
            execFile: execFile
        };

        _ts.config = {};
        _ts.screenData = {};
        _ts.config.os = (() => {
            let osName = _ts.m.os.type();
            return osName === 'Darwin' ? 'mac' : osName === 'Linux' ? 'linux' : 'win';
        })();
    }

    async init() {
        const _ts = this
        try {
            const v = await _ts.screenSize()
            let status = v.status,
                data = v.data || {};

            if (status === 'success') {
                _ts.screenData.width = data.width;
                _ts.screenData.height = data.height;
            }
        } catch (e) {
            _ts.log('error', e.status);
            _ts.log('error', e.msg);
            _ts.log('error', '请检查手机是否已经成功连接电脑并已经开启USB调试模式');
        }
    }

    /**
     * 截取手机屏幕并保存到项目的目录中
     * @param {string} imgName 图片名称
     */
    screencap(imgName) {
        const _ts = this;
        return new Promise((resolve, reject) => {
            _ts.adb(`shell screencap -p /sdcard/${imgName}`).then(v => {
                let savePath = _ts.m.path.join(__dirname, 'static', 'screen', imgName);
                _ts.adb(`pull /sdcard/${imgName} ${savePath}`).then(v => {
                    resolve({
                        status: 'success',
                        msg: '完成屏幕截图更新',
                        data: v
                    });
                }).catch(e => {
                    resolve({
                        status: 'success',
                        msg: '屏幕截图更新失败',
                        data: e
                    });
                });
            }).catch(e => {
                reject({
                    status: 'error',
                    msg: '截图失败',
                    data: e
                });
            });
        });
    }

    getSignature(param, app_key) {
        let str = Object.keys(param).sort().map(key => {
            return `${key}=${encodeURIComponent(param[key])}`
        })
            .join("&") + "&app_key=" + app_key
        return md5(str).toString().toLocaleUpperCase()
    }

    resize_image(imgName) {
        const _ts = this;
        let savePath = _ts.m.path.join(__dirname, 'static', 'screen', imgName);
        return images(savePath).resize(1024).save(savePath, 'jpg', {
            quality: 90
        }).encode("jpg", {
            quality: 90                    //保存图片到文件,图片质量为50
        })
    }

    imageBufferToBase64(data) {
        console.log(data)
        if (Buffer.isBuffer(data)) {
            return data.toString('base64')
        }
    }

    async getFace(image) {
        let time = Number.parseInt(new Date().getTime() / 1000 + "")
        let app_id = "1106868413"
        let mode = 0
        let time_stamp = time
        let nonce_str = time + ""
        let params = {
            app_id: app_id,
            mode: mode,
            time_stamp: time_stamp,
            nonce_str: nonce_str,
            image: image,
            sign: this.getSignature({ app_id, mode, time_stamp, nonce_str, image }, "Iisf0QhGmxD0xksG")
        }
        const options = {
            method: 'POST',
            uri: url,
            form: params
        };
        // let redirect = 'https://jdm-test.0606.com.cn/strategy/135d630c6465f5ee3dc5b364'
        let res = await rp(options)
        return res
    }


    async start() {
        const _ts = this;
        //第一步，先截图
        await this.screencap("faceOriginal.png")
        const bufferdata = this.resize_image("faceOriginal.png")
        const base64 = this.imageBufferToBase64(bufferdata)
        let res = await this.getFace(base64)
        res = JSON.parse(res)
        if (res.ret == 0) {
            _ts.log('success', JSON.stringify(res))
            let mybeauty = 0
            const { face_list } = res.data
            for (let index = 0; index < face_list.length; index++) {
                let element = face_list[index];
                let { x, y, width, height, face_id, beauty, gender } = element
                images(images(_ts.m.path.join(__dirname, 'static', 'screen', "faceOriginal.png")), x, y, width, height).save(_ts.m.path.join(__dirname, 'static', 'face', face_id + ".png"))
                if (beauty > 0 && gender < 50) {
                    mybeauty = beauty
                    if (mybeauty > 80) {
                        break
                    }
                }

            }

            if (mybeauty > 80) {
                console.log("美女哈哈哈哈")
                await _ts.follow_user()
                await _ts.stopTime(500)
                await _ts.thumbs_up()
                await _ts.stopTime(500)
                // const screen = await this.screenSize()
                // this.log('tip','屏幕的宽高'+JSON.stringify(screen))
            }
        }
    }

    async loop() {
        const _ts = this;
        while (true) {
            await _ts.next_page()
            await _ts.start()


        }
    }

    /**
   * 获取屏幕分辩率
   */
    screenSize() {
        const _ts = this;
        return new Promise((resolve, reject) => {
            _ts.adb('shell wm size').then(v => {
                if (typeof v === 'object' && typeof v.data === 'object' && typeof v.data.stdout === 'string') {
                    let data = v.data.stdout,
                        val = data.match(/\d{1,9}/ig);
                    resolve({
                        status: 'success',
                        msg: '屏幕分辩率获取成功',
                        data: {
                            width: val[0],
                            height: val[1]
                        }
                    })
                } else {
                    reject({
                        status: 'error',
                        msg: '屏幕分辩率获取失败',
                        data: {}
                    });
                };
            }).catch(e => {
                reject({
                    status: 'error',
                    msg: '屏幕分辩率获取出错',
                    data: e
                });
            });
        });
    }

    /**
     * adb命令
     * @param   {string} command adb命令字符串
     * @returns {object} 返回一个Promise对象
     */
    adb(command) {
        const _ts = this,
            m = _ts.m,
            config = _ts.config;

        return new Promise((resolve, reject) => {
            let adbFile = (() => {
                let extensionName = config.os === 'win' ? '.exe' : '';
                return m.path.join(__dirname, 'tool', config.os, 'adb' + extensionName);
            })();
            m.execFile(adbFile, command.split(' '), null, (error, stdout, stderr) => {
                if (error) {
                    reject({
                        status: 'error',
                        msg: `<adb ${command}> 执行错误`,
                        data: error
                    });
                } else {
                    resolve({
                        status: 'success',
                        msg: `<adb ${command}> 执行成功`,
                        data: {
                            stdout: stdout,
                            stderr: stderr
                        }
                    });
                };
            });
        });
    }

    log(type, text) {
        const _ts = this,
            m = _ts.m,
            log = console.log;

        switch (type) {
            case 'success':
                log(m.chalk.green(text));
                break;
            case 'error':
                log(m.chalk.red(text));
                break;
            case 'tip':
                log(m.chalk.yellow(text));
                break;
            default:
                log(text);
                break;
        };
    }

    stopTime(timeout) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, timeout);
        })
    }

    next_page() {
        const _ts = this
        return new Promise((resolve, reject) => {
            let
                x1 = _ts.screenData.width / 2,
                y1 = _ts.screenData.height / 2 + 305,
                x2 = _ts.screenData.width / 2,
                y2 = _ts.screenData.height / 2+5;

            _ts.adb(`shell input swipe ${x1} ${y1} ${x2} ${y2} 200`).then(async (v) => {
                await _ts.stopTime(1500)
                console.log(v)
                resolve({
                    status: 'success',
                    msg: '跳动指令执行完成',
                    data: v
                });
            }).catch(async (e) => {
                await _ts.stopTime(1500)
                reject({
                    status: 'error',
                    msg: '跳动指令执行失败',
                    data: e
                });
            });
        })
    }

    follow_user(time) {
        const _ts = this;
        return new Promise((resolve, reject) => {
            let x1 = _ts.screenData.width * 0.91 ,
            y1 = _ts.screenData.height / 2 * 0.98;
                

            _ts.adb(`shell input tap ${x1} ${y1}`).then(v => {
                console.log(v)
                resolve({
                    status: 'success',
                    msg: '跳动指令执行完成',
                    data: v
                });
            }).catch(e => {
                reject({
                    status: 'error',
                    msg: '跳动指令执行失败',
                    data: e
                });
            });
        })
    }

    thumbs_up(time) {
        const _ts = this;
        return new Promise((resolve, reject) => {
            let x1 = _ts.screenData.width * 0.91 ,
            y1 = _ts.screenData.height / 2 * 1.1;

            _ts.adb(`shell input tap ${x1} ${y1}`).then(v => {
                console.log(v)
                resolve({
                    status: 'success',
                    msg: '跳动指令执行完成',
                    data: v
                });
            }).catch(e => {
                reject({
                    status: 'error',
                    msg: '跳动指令执行失败',
                    data: e
                });
            });
        })
    }
}


start = async ()=>{
    const douyin = new DouyinGril()
    await douyin.init()
    douyin.loop()
}


start()

