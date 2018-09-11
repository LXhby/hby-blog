//通过db对象创造user数据库模型对象
const User = require("../Model/user");
const encrypt = require("../util/encrypt");



exports.reg = async(ctx,next)=>{
    //用户post发过来的数据
    const user = ctx.request.body;
    const username = user.username;
    const password = user.password;
    await new Promise((resolve, reject) => {
        User.find({username},(err,data)=>{
            if (err)return reject(err);
            if (data.length !=0){
                return resolve("")//用户名存在
            }
           const _user= new User({
                username,
                password:encrypt(password),
                commentNum:0,
                articalNum:0
            })
            _user.save((err,data)=>{
                if (err){
                    reject(err)
                } else{
                    resolve(data);
                }
            })
        })
    })
        .then(async data=>{
            if (data){
                //注册成功
            await ctx.render("isOk",{
                    status:"注册成功"
                })
            } else{
                //用户名已存在
                await ctx.render("isOk",{
                    status:"用户名已存在"
                })
            }
        })
        .catch(async(err)=>{
            await ctx.render("isOk",{
                status:"注册失败，请重试"
            })
        })
}

exports.login = async(ctx,next)=>{
    const  user = ctx.request.body;
    const username = user.username;
    const password = user.password;

    //去数据库对比
    await new Promise((resolve,reject) => {
        User.find({username},(err,data)=> {
            if (err) return reject(err);
            if (data.length === 0) return reject("用户名不存在")
            //将用户传过来的数据加密之后比对数据库密码
            if (data[0].password === encrypt(password)){//密码比对成功
                return resolve(data)
            }
            resolve("")//密码不对
        } )
    })
        .then(async data =>{
            if (!data){//密码不对
                return ctx.render("isOk",{
                    status:"密码不正确，登陆失败"
                })
            }


            ctx.session = {//比对cookie和session 避免前端人为设置cookie
               username,
               uid: data[0]._id,
               avatar:data[0].avatar,
                role:data[0].role
            }
            //让用户在他的cookie设置username
            ctx.cookies.set("username",username,{
                domain:"localhost",//挂载的主机名,期望在访问那个页面时会生效
                path:"/",//期望所有页面都会带过来，
                maxAge:36e5,//设置过期时间，
                httpOnly :true,//客户端能不能读取  true就是不让前端看
                overwrite:false//是否覆盖
            })
            ctx.cookies.set("uid",data[0]._id,{
                domain:"localhost",//挂载的主机名,期望在访问那个页面时会生效
                path:"/",//期望所有页面都会带过来，
                maxAge:36e5,//设置过期时间，
                httpOnly :true,//客户端能不能读取  true就是不让前端看
                overwrite:false//是否覆盖
            })


            await ctx.render("isOk",{
                status:"登陆成功"
            })
        })
        .catch(async(err)=>{
            await ctx.render("isOk",{
                status:"登陆失败"
            })
        })
}

//确定用户的状态， 保持用户状态
exports.keepLog = async(ctx,next)=>{
    if (ctx.session.isNew){//session没有
        if (ctx.cookies.get("username")){
            let uid = ctx.cookies.get("uid");
         const avatar = await User.findById(uid)
                .then(data=>data.avatar)
            ctx.session={//更新一下session
                username:ctx.cookies.get("username"),
                uid,
                avatar
            }
        }
    }
    await next();
}

//用户退出的中间件
exports.logout = async(ctx,next)=>{
    ctx.session = null;
    ctx.cookies.set("username",null,{
        maxAge:0
    })
    ctx.cookies.set("uid",null,{
        maxAge:0
    })
    ctx.redirect("/")//在后台重定向
}

//用户的头像上传
exports.upload = async(ctx,next)=>{
    const filename = ctx.req.file.filename;
    let data = {};
    await User.update({_id:ctx.session.uid},{$set:{avatar:"/avatar/"+filename}},(err,res)=>{
        if(err){
            data = {
                status: 0,
                message: "上传失败"
            }
        }else{
            data = {
                status: 1,
                message: '上传成功'
            }
        }
    })
    ctx.body = data;
}


//获取用户
exports.userlist = async(ctx,next)=>{
  const data = await User.find({})
    ctx.body = {
        code:0,
        count:data.length,
        data
    }
}

//删除用户
exports.del = async(ctx,next)=>{
    const _id = ctx.params.id;
    console.log(1)
    let res={
        state:1,
        message:"成功"
    }
    await User.findById(_id)
        .then(data=>data.remove())
        .catch(err=>{
            res={
                state:0,
                mesage:"失败"
            }
        })
    ctx.body=res;
}