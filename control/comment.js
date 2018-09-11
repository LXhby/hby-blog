const Artical = require("../Model/article");
const User = require("../Model/user");
const Comment = require("../Model/comment");

//保存评论
exports.save = async(ctx,next)=>{

    let message = {
        status:0,
        msg:"登陆之后才能发表"
    }
    //验证用户是否登陆
    if (ctx.session.isNew)return ctx.body =message

    //用户登陆
    const data = ctx.request.body;//取到评论的内容和评论的文章
    data.from = ctx.session.uid;//取到评论的用户

    const _comment = new Comment(data)

   await _comment
       .save()
       .then(data=>{
           message={
               status:1,
               msg:"评论成功"
           }


           //更新当前文章的评论计数器
           Artical
               .update({_id: data.article}, {$inc: {commentNum: 1}}, err => {
                   if(err)return console.log(err)
                   console.log("评论计数器更新成功")
               })

           //更新用户的评论计数器
           User.update({_id:data.from},{$inc:{commentNum:1}},err=>{
               if (err) return console.log(err)
           })
       })
       .catch(err=>{
           message={
               status:0,
               msg:err
           }
       })
    ctx.body = message;
}

exports.comlist = async(ctx,next)=>{
    const uid = ctx.session.uid;
    const data = await Comment.find({from:uid}).populate("article","title");
    console.log(data)
    ctx.body = {
        code:0,
        count:data.length,
        data
    }
}

//删除评论
exports.del = async ctx => {
    // 评论 id
    const commentId = ctx.params.id
    // 拿到 commentID   删除 comment ，

    let res = {
        state: 1,
        message: "成功"
    }

    await Comment.findById(commentId)
        .then(data => data.remove())
        .catch(err => {
            res = {
                state: 0,
                message: err
            }
        })

    ctx.body = res
}