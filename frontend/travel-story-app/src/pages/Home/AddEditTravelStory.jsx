import React, { useState } from 'react'
import { MdAdd, MdClose,MdDeleteOutline, MdUpdate } from 'react-icons/md'
import DateSelector from '../../components/input/DateSelector'
import ImageSelector from '../../components/input/ImageSelector'
import TagInput from '../../components/input/TagInput'
import axiosInstance from '../../utils/axiosInstance'
import moment from 'moment'
import uploadImage from '../../utils/uploadImage'
import { toast } from 'react-toastify'
import { data } from 'autoprefixer'

const AddEditTravelStory = ({
    storyInfo,
    type,
    onClose,
    getAllTravelStories,
}) => {
  const handleAddOrUpdateClick= ()=>{
      if(!title){
        setError("Please enter the title");
        return;
      }
      if(!story){
        setError("Please enter the story again");
        return;
      }
      setError("");
      if(type==="edit"){
        updateTravelStory();
      }
      else{
        addNewTravelStory();
      }
  }
  //delete story image and update this story
  const handleDeleteStoryImg= async ()=>{
    //Deleteing the image 
    const deleteImgRes= await axiosInstance.delete("/deleteImage",{
      params: {
        imageUrl: storyInfo.imageUrl,  
      },
    });
    if(deleteImgRes.data){
      const storyId=storyInfo._id;
      const postData={
        title,
        story,
        visitedLocation,
        visitedDate:moment().valueOf(),
        imageUrl:"",
      };
      //Updating Story
      const response=await axiosInstance.put(
        "/editStory/"+storyId,postData
      );
      setStoryImg(null);
   }
  }

  const [visitedDate, setVisitedDate]=useState(storyInfo?.visitedDate||null);
  const [title,setTitle]=useState(storyInfo?.title||"");
  const [storyImg, setStoryImg]=useState(storyInfo?.imageUrl||null);
  const [story,setStory]=useState(storyInfo?.story||"");
  const [visitedLocation,setVisitedLocation]=useState(storyInfo?.visitedLocation||[]);
  const [error,setError]=useState("");
  // update travel story
  const updateTravelStory= async()=>{
    const storyId=storyInfo._id;
    try {
      let imageUrl="";
      let postData={
        title,
        story,
        imageUrl: storyInfo.imageUrl||"",
        visitedLocation,
        visitedDate: visitedDate
        ? moment(visitedDate).valueOf()
        :moment().valueOf(),
       }
       if(typeof storyImg==="object"){
            //upload new image
            const imgUploadRes=await uploadImage(storyImg);
            imageUrl= imgUploadRes.imageUrl||"";
            postData={
              ...postData,
              imageUrl:imageUrl,
            }
       }
     
       const response=await axiosInstance.put("/editStory/"+storyId,postData);
       console.log(response);
       if(response.data && response.data.story){
        toast.success("story updated successfully");
        //refresh stories
        getAllTravelStories();
        //close modal or form
        onClose();
       }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message)
        
      } else {
        setError("an unexpected error occurred please try again");
      }
    }
  }
  // add new travel story 
  const addNewTravelStory=async ()=>{
    try {
      let imageUrl="";
      console.log("ho")
       //upload image if present 
       console.log(storyImg)
       if(storyImg!==null){
         const imgUploadRes=await uploadImage(storyImg);
         console.log(imgUploadRes);
         console.log("uploadImage successful")
        //Get image url
        imageUrl=imgUploadRes.imageUrl||"";
        console.log("inside storyImg if")
       }
       const response=await axiosInstance.post("/addTravelStory",{
        title,
        story,
        imageUrl: imageUrl||"",
        visitedLocation,
        visitedDate: visitedDate
        ? moment(visitedDate).valueOf()
        :moment().valueOf(),
       });
       console.log(response);
       if(response.data && response.data.story){
        toast.success("story added successfully");
        //refresh stories
        getAllTravelStories();
        //close modal or form
        onClose();
       }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message)
        
      } else {
        setError("an unexpected error occurred please try again");
      }
    }
       
  }
  return (
    <div className='relative'>
      <div className='flex items-center justify-between'>
        <h5 className='text-xl font-medium text-slate-700'>
        {type==="add"?"Add Story":"UpdateStory"}    
        </h5>
        <div>
            <div className='flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg'>
              {type==='add' ? (<button className='btn-small' onClick={handleAddOrUpdateClick}>
                  <MdAdd className='text-lg' /> ADD STORY  
                </button>) : (<>
                <button className='btn-small' onClick={handleAddOrUpdateClick}>
                <MdUpdate className='text-lg'/> UPDATE STORY
                </button>
                </>)}
                <button
                className=''
                onClick={onClose}
                >
                    <MdClose className='text-xl text-slate-400'/>
                </button>
                </div>
                {error && (
                  <p className='text-red-500 text-xs pt-2 text-right'>{error}</p>
                )}
        </div>
      </div>
       <div>
        <div className='flex-1 flex flex-col gap-2 pt-4'>
          <label className='input-label'>TITLE</label>
          <input 
          type='text'
          className='text-2xl text-slate-950 outline-none'
          placeholder='A Day at the Great Wall'
          value={title}
          onChange={({target})=>setTitle(target.value)}
          />
          <div className='my-3'>
            <DateSelector date={visitedDate} setDate={setVisitedDate}/>
          </div>
          <ImageSelector
          image={storyImg}
          setImage={setStoryImg}
          handleDeleteImg={handleDeleteStoryImg}
          />
          <div className='flex flex-col gap-2 mt-4'>
            <label className='input-label'>Story</label>
            <textarea
            type="text"
            className='text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded'
            placeholder='Your Story'
            rows={10}
            value={story}
            onChange={({target})=>setStory(target.value)}
            />
          </div>
          <div className='pt-3'>
            <label className='input-label'>Visited Locations</label>
            <TagInput tags={visitedLocation} setTags={setVisitedLocation}/>
          </div>
        </div>
      </div>
     
    </div>
  )
}

export default AddEditTravelStory
