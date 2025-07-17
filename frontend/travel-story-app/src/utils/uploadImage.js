
import axiosInstance from "./axiosInstance";


const uploadImage= async (imageFile)=>{
    const formData=new FormData();
    //append image file to form data 
    formData.append('image',imageFile);
    console.log(formData);
    try {
        const response= await axiosInstance.post('/imageUpload',formData,{
            headers:{
                'Content-Type':'multipart/form-data',//set header for file upload 
            },
        });
        return response.data;//return response data
    } catch (error) {
        console.log("error aa gya ji")
        console.error("error uploading the image:",error);
        throw error; //rethrow error for handling 
    }
}
export default uploadImage;