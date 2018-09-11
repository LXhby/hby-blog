const {Schema} = require("./config");

const UserShema = new Schema({
    username:String,
    password:String,
    role:{
      type:String,
      default:1
    },
    articalNum:Number,
    commentNum:Number,
    avatar:{
        type:String,
        default:"/avatar/p1.jpg"
    }
},{
    versionKey:false
})

UserShema.post("remove",doc=>{
    //需要把用户写的文章都删除
    const Artical = require('../Model/article');
    const _Id = doc._id;
    Artical.find({author:_Id})
        .then(data=>{
            data.forEach(v=>v.remove())
        })
})
module.exports = UserShema;