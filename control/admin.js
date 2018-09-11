const Artical = require("../Model/article");
const User = require("../Model/user");
const Comment = require("../Model/comment");

const fs = require("fs");
const {join} = require("path");

exports.index = async(ctx,next)=>{
    if (ctx.session.isNew){
        //没有登陆
        ctx.status = 404;
        return await ctx.render("404",{
            title:"404"
        })
    }
    const id = ctx.params.id;
    const arr = fs.readdirSync(join(__dirname,"../views/admin"))


    let flag = false;
    arr.forEach((v)=>{//循环体内部不要有异步
        const name = v.replace(/^(admin\-)|(\.pug)$/g,"");
        if (name){
            if (name===id){
                flag = true;
            }
        }
    })
    if (flag){
        await ctx.render("./admin/admin-"+id,{
            role:ctx.session.role
        })
    } else{
        ctx.status = 404;
        await ctx.render("404",{title:"404"})
    }
}