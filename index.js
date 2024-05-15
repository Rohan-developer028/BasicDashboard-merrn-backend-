const ex=require('express')
const cors=require('cors')
const product=require('./db/product')
const jwt=require('jsonwebtoken')
const jwtkey="e-com"
require('./db/config')
const user =require('./db/users')
const app=ex() 
app.use(cors())
app.use(ex.json())
app.post("/signup",async(rq,rs)=>{
    let data=new user(rq.body)
    let result= await data.save()
    result=result.toObject()
    delete result.password
    jwt.sign({result},jwtkey,{expiresIn:'2h'},(err,token)=>{
        if(err)
        {
            rs.send({resul:"something went wrong"})

    }
    else{
        rs.send({result,auth:token})
    }
}
)
})

app.post("/login",async(rq,rs)=>{
    if(rq.body.email&&rq.body.password){

    let userlog= await user.findOne(rq.body).select("-password")
    if (userlog){
        jwt.sign({userlog},jwtkey,{expiresIn:"2h"},(err,token)=>{
      if(err){
        rs.send({"err":"something went wrong "})

      }
      else{
      rs.send({userlog,auth:token})
      }
        })

    }
    else{
       rs.send({"err":"no user found"})
    }
    }
    else{
        rs.send({"err":"not  valid"})
    }
})


app.post("/addproduct",verifytoken,async(rq,rs)=>{
    let data=new product(rq.body)
    let result =await data.save()
    rs.send(result)
})
app.get("/seachproduct",verifytoken,async (rq,rs)=>{
let data= await product.find()
if(data.length>0)
{
rs.send(data)
}
else
{
    rs.send({result:"no data found"})
}
}
)
app.delete("/deleteproduct:id",verifytoken,async(rq,rs)=>{
    let data= await product.deleteOne({_id:rq.params.id})
    rs.send(data)
})
app.get("/product/:id",verifytoken, async (rq,rs)=>{
    let result =await product.findOne({_id:rq.params.id})
    if(result){
        rs.send(result)
    }
    else{
        rs.send({result:"no record found"})
    }
})
app.put("/product/:id",verifytoken, async (rq,rs)=>{
    let result=  await product.updateOne(
        {_id:rq.params.id},
        {
            $set:rq.body
        }
    )
    rs.send(result)
})
app.get("/search:key",verifytoken,async(rq,rs)=>{
    let result= await product.find(
        {
            "$or":[
                {name:{$regex:rq.params.key}}
            ]
        }
    )
    rs.send(result)
})
function verifytoken(rq,rs,next){
    let token=rq.headers['authorization']
    if(token){
    token=token.split( ' ')[1];
    
    jwt.verify(token,jwtkey,(err,valid)=>{
        if(err){
rs.status(401).send({err:'enter correct token'})
        }
        else{
            next()
        }
    })
    
    }
    else{
        rs.status(403).send({err:"enter token"})
    }
}
app.listen(5000)