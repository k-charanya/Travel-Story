const bcrypt= require("bcryptjs");
const express= require("express");
const cors=require("cors");
const jwt= require("jsonwebtoken");
const app=express();
app.use(express.json());
const upload = require("./multer");
const fs=require("fs");
const path=require("path");
const {authencateToken} = require("./utilities");
app.use(cors({origin:"*"}));
const User=require("./models/user.model");
const TravelStory=require("./models/travelStory");
app.listen(8000,(req,res)=>{
    console.log("app has started at port 8000");
});
//test api
app.get("/hello", async (req,res)=>{
    return res.status(200).json({message:"hello"});
})
//create account
app.post("/create-account",async (req,res)=>{
    const {fullName,email,password}=req.body;
    if(!fullName || !email || !password){
        return res.status(400).json({
            error:true,
            message:"All fields are required"
        })
    }
    const isUser= await User.findOne({email:email});
    if(isUser){
        return res.status(400).json({
            error:true,
            message: "User already exists"
        });
    }
    const hashedPassword= await bcrypt.hash(password,10);
    const user=new User({
        fullName,
        email,
        password:hashedPassword,
    });
    await user.save();
    const accessToken=jwt.sign({userId:user._id},process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:"72h",
        }
    );
    return res.status(201).json({
        error: false,
        user:{
            fullName:user.fullName,
            email:user.email,
        },
        accessToken,
        message:"Registration Successful",

    });
    
});
//Login
app.post("/login",async (req,res)=>{
    const{email,password}= req.body;
    if(!email || !password){
        return res.status(400).json({
            error: true,
            message:"Some fields are empty"
        });
    }
    const user=await User.findOne({email});
    if(!user){
       return res.status(400).json({
            message:"User not found"
        });
    }
    
    const isPasswordValid= await bcrypt.compare(password,user.password);
    if(!isPasswordValid){
        return res.status(400).json({
            message:"Invalid Credential"
        });
    }
    const accessToken=jwt.sign({userId:user._id},process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:"72h",
        }
    );
    return res.status(201).json({
        error: false,
        message: "Login Successful",
        user: {fullName:user.fullName,email:user.email},
        accessToken,
    });

});
//Get User
app.get("/getUser", authencateToken, async (req,res)=>{
    const{userId}=req.user;
    const isuser= await User.findById({_id:userId});
    if(!isuser){
        return res.sendStatus(401);
    }
    isuser.password=undefined;
    return res.json({
        user:isuser,
        message:"",
    });   

});
//Add travel Story
app.post("/addTravelStory",authencateToken,async (req,res)=>{
     const{title,story,visitedLocation,imageUrl,visitedDate}=req.body;
     const{userId}=req.user;
     if(!title||!story||!visitedLocation||!imageUrl||!visitedDate){
        return res.status(400).json({
            error:true,
            message:"All fields are required"
        });
     }
     //convert visiteddate from millisecinds to date object
     const parseVisitedDate= new Date(parseInt(visitedDate));
     try {
        const travelStory=new TravelStory({
            title,
            story,
            visitedLocation,
            userId,
            imageUrl,
            visitedDate: parseVisitedDate,
         });
         await travelStory.save();
         res.status(201).json({
            story:travelStory,
            message:"Added Successfully"
         });
     } catch (error) {
        return res.status(400).json({
            error: true,
            message:error.message
        });
     }
    
      
})
//get all travel stories
app.get("/getAllStories", authencateToken,async (req,res)=>{
    const{userId}=req.user;
    try {
        const travelStories= await TravelStory.find({userId:userId}).sort({isFavourite:-1});
        res.status(200).json({
            stories:travelStories
        });
    } catch (error) {
        res.status(500).json({
            error:true,message:error.message
        });
    }
})
// route to handle image upload
app.post("/imageUpload", upload.single("image"), async  (req,res)=>{
    try {
        if(!req.file){
            return res.status(500).json({
                error: true,
                message:"no image uploaded"
            })
        }
        const imageUrl=`http://localhost:8000/uploads/${req.file.filename}`;
        res.status(200).json({
            imageUrl
        })
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        })
    }
})
//serve static files from the uploads and assets directory
app.use("/uploads",express.static(path.join(__dirname,"uploads")));
app.use("/assets",express.static(path.join(__dirname,"assets")));
//(must read) app. use for using middlewares
//any request which starts with /uploads eill use it
//express.static() is a built-in middleware function in Express that serves static files. It's passed the directory path where static files are located. In this case, it's serving files from the uploads folder. matlab ki jo bhi file hamne apne uploads vaale folder me daali hui hai usko static bana deta hai static bana ne ka matlab hai ki jo bhi files upload me hai usse client ya browser by using a URL access kr skta bina iske access nhi kr skta.
// path.join(__dirname, "uploads") is used to create an absolute path to the uploads folder relative to the directory where the current script is being executed
// __dirname: This is a Node.js global variable that holds the absolute path of the directory that contains the currently executing script. It helps you dynamically reference the directory where your server code is running, regardless of where that code is being executed from.
// For example, if your file server.js is located in /home/user/project/server.js, then __dirname will hold /home/user/project/
// path.join(): This method from Node.js's built-in path module joins the path segments you provide into a single normalized path. It's cross-platform, meaning it will handle the correct separators (/ for Unix-based systems and \ for Windows) automatically.

// In this case:
// path.join(__dirname, "uploads")
// will generate a path that points to the uploads folder in the same directory as the current script. So if your project is located in /home/user/project/, it will return:
// /home/user/project/uploads
// On a Windows system, the path would look like this:
// C:\Users\user\project\uploads

app.delete("/deleteImage", async (req,res)=>{
    const{imageUrl}=req.query;
    if(!imageUrl){
        res.status(400).json({
            error: true,
            message:"imageUrl is required"
        });
    }
    try {
        //extract filename from the imageUrl
        const filename=path.basename(imageUrl);
        //define the file path
        const filePath=path.join(__dirname,'uploads',filename);
        //check if the file exists
        if(fs.existsSync((filePath))){
            //delete the file from the uploads folder 
            fs.unlinkSync(filePath);
            res.status(200).json({
                message:"image deleted successfully"
            }); 
        }
        else{
            res.status(200).json({
                message:"image not found"
            });
        }

    } catch (error) {
        res.status(500).json({
            error:true,
            message:error.message
        });
    }
})//delete an image from uploads folder

//edit travel story
app.put("/editStory/:id",authencateToken, async(req,res)=>{
        const {id}=req.params;
        const{title,story,visitedLocation,imageUrl,visitedDate}=req.body;
        const {userId}=req.user;
        //validate required fields
        if(!title||!story||!visitedLocation||!visitedDate){
            return res.status(400).json({
                error:true,
                message:"All fields are required"
            });
         }
         //convert visiteddate from millisecinds to date object
         const parseVisitedDate= new Date(parseInt(visitedDate));
         try {
            //find the travel story by id and ensure it belongs to the user
            const travelStory=await TravelStory.findOne({_id:id, userId:userId});
            if(!travelStory){
                res.status(404).json({
                    error:true,
                    message:"travel story not found"
                })
            }
            const placeHolderImgUrl="http://localhost:8000/assets/placeholder.jpg";
            //yaha ham naya object bana kr insert nhi kr rahe obviously because hame update karna hai naya object nahi insert krna 
            travelStory.title=title;
            travelStory.story=story;
            travelStory.visitedLocation=visitedLocation;
            travelStory.imageUrl=imageUrl||placeHolderImgUrl;
            travelStory.visitedDate=parseVisitedDate  
            await travelStory.save();
            res.status(200).json({
                story: travelStory,
                message:"story updated successfully"
            })
         } catch (error) {
            res.status(500).json({
                error:true,
                message:error.message

            })
         }
})
//delete a travel story
app.delete('/deleteStories/:id', authencateToken,async (req,res)=>{
    const {id} =req.params;
    const {userId}=req.user

    try {
        //find the travel story by id and ensure it belongs to the user
        const travelStory=await TravelStory.findOne({_id:id, userId:userId});
        if(!travelStory){
            res.status(404).json({
                error:true,
                message:"travel story not found"
            })
        }
        //delete the travel story from the database
        await travelStory.deleteOne({_id:id, userId:userId})
        //extract the filename from image url
        const imageUrl=travelStory.imageUrl;
        const filename=path.basename(imageUrl);
        //define the file path
        const filePath= path.join(__dirname,"uploads",filename);
        //delete the image file from the uploads folder
        fs.unlink(filePath,(err)=>{
            if(err) console.log('failed to delete image file:',err);
            //optionally you could still respond with a success status here if you dont want to traet this as a critical error 
        });
        res.status(200).json({
            message:"travel story deleted "
        })
    }
    catch(error){
        res.status(500).json({
            error:true,
            message:error.message

        })
    }
})
//update is favourite
app.put("/updateIsFavourite/:id", authencateToken, async(req,res)=>{
    const {id}=req.params;
    const {userId}=req.user;
    const {isFavourite}=req.body;
    try {
        const travelStory=await TravelStory.findOne({_id:id,userId:userId});
        if(!travelStory){
            return res.status(404).json({
                error:true,
                message:"travel story not found"
            })

        }
        travelStory.isFavourite=isFavourite;
        travelStory.save();
        res.status(200).json({
            story:travelStory,
            message:"update successful"
        });
    } catch (error) {
        res.status(500).json({
            error:true,
            message:error.message

        })

        
    }
})
//search travel stories
app.get("/search", authencateToken, async(req,res)=>{
    const {query}=req.query;
    const {userId}=req.user;
    if(!query){
        return res.status(404).json({
            erro:true,
            message:"query is required"
        });
    }
    try {
        const searchResults=await TravelStory.find({
            userId:userId,
            $or: [
                {title:{ $regex:query,$options:"i"}},
                {story:{ $regex:query,$options:"i"}},
                {visitedLocation:{ $regex:query,$options:"i"}},
            ],
        }).sort({isFavourite:-1});
        res.status(200).json({
            stories:searchResults
        });
       } catch (error) {
        res.status(500).json({
            error:true,
            message:error.message

        })
    }
})
//filter travel stories by date range 
app.get("/travelStories/filter", authencateToken, async (req,res)=>{
    const {startDate,endDate}=req.query;
    const {userId}=req.user;
    try {
        //convert  start date and end date from milliseconds to date object
        const start=new Date(parseInt(startDate));
        const end= new Date(parseInt(endDate));
        //find stories that belong to the authenticated user and fall between the date range 
        const filterStories= await TravelStory.find({
           userId: userId,
           visitedDate: {$gte: start, $lte: end },

        }).sort({isFavourite:-1});
        res.status(200).json({
            stories: filterStories
        });

        
    } catch (error) {
        res.status(500).json({
            error:true,
            message:error.message

        })
    } 
})

const connectWithDb=require("./config/database");


connectWithDb();
module.exports=app; 