#node版本，看了大神的python的版本后，学习写了node版本，仅供娱乐

##  特性

- [x] **自动翻页**
- [x] **颜值检测**
- [x] **人脸识别**
- [x] **自动点赞**
- [x] **自动关注**

##  原理

- 打开《抖音短视频》APP，进入主界面
- 获取手机截图，并对截图进行压缩 (Size < 1MB)；
- 请求 [人脸识别 API](http://ai.qq.com/)；
- 解析返回的人脸 Json 信息，对人脸检测切割；
- 当颜值大于门限值 `BEAUTY_THRESHOLD`时，点赞并关注；
- 下一页，返回第一步；


## 使用教程

- 相关软件工具安装和使用步骤请参考 [wechat_jump_game](https://github.com/wangshub/wechat_jump_game) 和 [Android 操作步骤](https://github.com/wangshub/wechat_jump_game/wiki/Android-%E5%92%8C-iOS-%E6%93%8D%E4%BD%9C%E6%AD%A5%E9%AA%A4)
- 上述环境事python，这里是使用的node，所以需要在本地装一下nodejs
- 在 [ai.qq.com](https://ai.qq.com) 免费申请 `AppKey` 和 `AppID`
1. 获取源码：`git clone git@github.com:sunlandong/douyin_bot_node.git`
2. 进入源码目录： `cd douyin_bot_node`
3. 安装依赖： `npm install`
4. 运行程序：`node index.js`

## LICENSE

MIT

欢迎 Star 和 Fork ~