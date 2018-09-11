const {Schema} = require("./config");
const ObjectId = Schema.Types.ObjectId;

const ArticalShema = new Schema({
    title:String,
    content:String,
    author:{
      type:ObjectId,
      ref:"users"
    },
    tips:String,
    commentNum:Number
},{
    versionKey:false,timestamps:{
    createdAt:"created"//创建时间，为了文章渲染倒叙
    }
})

ArticalShema.post("remove",doc=>{
    const Comment = require('../Model/comment');
    const User = require('../Model/user');

    const {_id:artId,author:authorId} = doc;
    //需要把用户的articleNum -1
    User.findByIdAndUpdate(authorId,{$inc:{articleNum:-1}}).exec();

    //把当前需要删除的文章所关联的所有评论  一次调用 评论的remove
    Comment.find({article:artId})
        .then(data=>{
            data.forEach(v=>{
             return v.remove()
            })
        })
})
module.exports =ArticalShema;