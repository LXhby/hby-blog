const Router = require("koa-router");
const user = require("../control/user");
const artical = require("../control/artical");
const comment = require("../control/comment");
const admin = require("../control/admin");
const upload= require("../util/upload");

const router = new Router;

//设计主页
router.get("/",user.keepLog,artical.getList);
//用来处理用户登录注册
router.get(/^\/user\/(?=reg|login)/,async(ctx,next)=>{
    const show = /reg$/.test(ctx.path);
    await ctx.render("register",{
        show
    })
});

//处理用户登陆的post
router.post("/user/login",user.login);
//注册用户
router.post("/user/reg",user.reg);
//用户退出
router.get("/user/logout",user.logout);

//文章发表页面
router.get("/artical",user.keepLog,artical.addpage);


//点击添加文章
router.post("/artical",user.keepLog,artical.add)


//文章列表分页路由
router.get("/page/:id",artical.getList);


//文章详情页  路由
router.get("/article/:id",user.keepLog,artical.details)

//添加评论
router.post("/comment",user.keepLog,comment.save)

//后台
router.get("/admin/:id",user.keepLog,admin.index);


//获取用户的所有评论
router.get("/user/comments",user.keepLog,comment.comlist);

//后台：删除用户评论
router.del("/comment/:id",user.keepLog,comment.del);

//获取用户所有的文章
router.get("/user/articles",user.keepLog,artical.artlist);

//文章删除
router.del("/article/:id",user.keepLog,artical.del);

//获取所有用户
router.get("/user/users",user.keepLog,user.userlist);

//删除用户
router.del("/user/:id",user.keepLog,user.del);

//头像上传功能
router.post("/upload",user.keepLog,upload.single("file"),user.upload);

//报错页面
router.get("*",async(ctx,next)=>{
    await ctx.render("404",{
        title:"404"
    })
})

module.exports=router;