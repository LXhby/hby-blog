const Artical = require("../Model/article");
const User = require("../Model/user");
const Comment = require("../Model/comment");


//返回文章发表页
exports.addpage = async(ctx,next)=>{
    await ctx.render("addartical",{
        title:"文章发表页",
        session:ctx.session

    })
}

//文章发表，保存到数据库
exports.add= async(ctx,next)=>{
    if (ctx.session.isNew){
        return ctx.body = {
            msg:"用户未登陆",
            status:0
        }
    }
    //这是用户在登陆情况下发过来的数据
    const data = ctx.request.body;
    //添加文章作者
    data.author = ctx.session.uid;
    data.commentNum =0;


   await new Promise((resolve,reject)=>{
       new Artical(data).save((err,data)=>{
           if (err)return reject(err)
           //更新文章计数
           User.update({_id:data.author},{$inc:{articalNum:1}},err=>{
               if (err)return console.log(err)
           })

           resolve(data)
       })
   })
       .then((data)=>{
           ctx.body={
               msg:"保存成功",
               status:1
           }
       })
       .catch(err=>{
           ctx.body={
               msg:"保存失败",
               status:0
           }
       })
}

//获取文章列表
exports.getList = async(ctx,next)=>{
    //查找到每篇文章数据：作者，作者头像了，文章内容--按需查找
    //动态路由
    let page = ctx.params.id || 1;
    page--;

    const maxNum = await Artical.estimatedDocumentCount((err,num)=>err?console.log(err):num);
    const data =await Artical
        .find()
        .sort("-created")//mongodb原子操作  前面减号就是降序排序
        .skip(5*page)//跳过的页数
        .limit(5)//筛选五条
        .populate({
            path:"author",//schema已经关联了表，这里只需要关联属性
            select:"username _id avatar"
        })//连表查询
        .then(data=>data)//让它动起来
        .catch(err=>console.log(err))

    await ctx.render("index",{
        session:ctx.session,
        title:"博客首页",
        artList:data,
        maxNum
    })
}

//文章详情页
exports.details = async(ctx,next)=>{
    const _id = ctx.params.id;
    //查找文章本身的数据
    const article = await Artical
        .findById(_id)
        .populate({
            path:"author",
            select:"username"
        })
        .then(data=>data)

    const comment = await Comment
        .find({article:_id})//通过文章id查找评论
        .sort("-created")
        .populate("from","username avatar")
        .then(data => data)
        .catch(err => {
            console.log(err)
        })



    await ctx.render("article",{
        title:"文章详情页",
        article,
        comment,
        session:ctx.session
    })
}

//返回用户所有文章
exports.artlist = async(ctx,next)=>{
    const uid = ctx.session.uid;
    const data = await Artical.find({author:uid})
    ctx.body = {
        code:0,
        count:data.length,
        data
    }
}

//删除文章
exports.del = async(ctx,next)=>{
    const _id = ctx.params.id;
    let res={
        state:1,
        message:"成功"
    }
    await Artical.findById(_id)
        .then(data=>data.remove())
        .catch(err=>{
            res={
                state:0,
                message:err
            }
        })
    ctx.body = res;

}