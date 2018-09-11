const {Schema} = require("./config");
const ObjectId = Schema.Types.ObjectId;

const CommentSchema = new Schema({
    //头像，用户名 文章 内容
    content:String,
    //关联到
    from:{
        type:ObjectId,
        ref:"users"
    },
    //关联artical表
    article:{
        type:ObjectId,
        ref:"articals"
    }
},{
    versionKey:false,timestamps:{
        createdAt:"created"
    }
})

//设置comment的remove钩子 先pre再post post只能有一个，pre可以有多个
CommentSchema.post("remove",(doc)=>{
    //这个函数会在remove事件执行触发
    const Artical = require('../Model/article');
    const User = require('../Model/user');

    const { from, article } = doc;
    console.log(from);
    // 对应文章的评论数 -1
    Artical.updateOne({_id: article}, {$inc: {commentNum: -1}}).exec()
    // 当前被删除评论的作者的 commentNum -1
    User.updateOne({_id: from}, {$inc: {commentNum: -1}}).exec()
})


module.exports = CommentSchema;