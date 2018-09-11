const Koa = require("koa");
const static = require("koa-static");
const views = require("koa-views");
const router = require("./routers/router");
const logger = require("koa-logger");
const body = require("koa-body");
const {join} = require("path");
const session = require("koa-session");
const compress = require('koa-compress');

//生成koa实例
const app = new Koa;

app.keys =["美女啊"] ;  //签名密钥
//session配置对象
const CONFIG ={
    key:"Sid",
    maxAge:36e5,//保存时间
    overwrite:true,
    httpOnly:true,//是否可见
    signed:true,//是否签名
    rolling:true//是否要刷新
}


//注册日志模块
app.use(logger());


//注册压缩模块
app.use(compress({
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
}))


//配置sesssion
app.use(session(CONFIG,app));




//处理post数据
app.use(body());
app.use(static(join(__dirname,"static")));
//视图模板
app.use(views(join(__dirname,"views"),{
    extension:"pug"
}));


//注册路由
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000,()=>{
    console.log("项目启动成功，监听3000端口")
})

//创建管理员用户 如果管理员已经存在，则返回
{
    const {db} = require("./Schema/config");
    const UserSchema = require("./Schema/user");
    const encrypt = require("./util/encrypt");
    const User =db.model("users",UserSchema);

    User
        .find({username: "admin"})
        .then(data => {
            if(data.length === 0){
                // 管理员不存在  创建
                new User({
                    username: "admin",
                    password: encrypt("admin"),
                    role: 666,
                    commentNum: 0,
                    articleNum: 0
                })
                    .save()
                    .then(data => {
                        console.log("管理员用户名 -> admin,  密码 -> admin")
                    })
                    .catch(err => {
                        console.log("管理员账号检查失败")
                    })
            }else{
                // 在控制台输出
                console.log(`管理员用户名 -> admin,  密码 -> admin`)
            }
        })
}
