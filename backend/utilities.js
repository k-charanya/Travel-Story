const jwt=require("jsonwebtoken");
function authencateToken(req,res,next){
    const authHeader=req.headers["authorization"];
    const token= authHeader && authHeader.split(" ")[1];
    //no token, unauthorized
    if(!token){
        return res.status(401).json({
            error: true,
            message:"token not present"
        });
    }
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if(err)  return res.status(401).json({
            error: true,
            message:"some problem with token"
        });
        // console.log(req.user);
        req.user=user;//isme user jo hai usme hamare payload ka data pada hua hai usko hamne for further processing apne req me add kr diya hai
        // console.log(user);
        next();
    });
}
module.exports={authencateToken,};