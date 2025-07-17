import React, { useEffect, useRef, useState } from 'react'
import { FaRegFileImage } from 'react-icons/fa6';
import { MdDeleteOutline } from 'react-icons/md';

function ImageSelector({image, setImage,handleDeleteImg}) {
    const inputRef=useRef(null);
    const [previewUrl,setPreviewUrl]=useState(null);  
    const handleImageChange=(e)=>{
        const file=e.target.files[0];
        if(file){
            setImage(file);
        }
    }
    const handleRemoveImage=()=>{
        setImage(null);
        handleDeleteImg();
    }
    const onChooseFile=()=>{
        inputRef.current.click();
    }

    // jaha tk mujhe smjh aay hai isne input vaala element banaya and fir useref ka use krke us element ko dom me se access kr liya fir us input field ko to hide kr diya and jo bnaya tha hamne button niche uske onclick me us input element ka reference jo hmne inputRef vaale object me daala tha vha se input ko access kr liya ab us button pr click kroge to iska matlab input vale pr hi click kr rhe ho

    useEffect(()=>{
        //if the image prop is a string(URL),set it as preview URL
        if(typeof image==='string'){
            setPreviewUrl(image);
        }
        else if(image){
            //if image prop is a file object,create a preview URL
            setPreviewUrl(URL.createObjectURL(image));
        }
        else{
            //if there is no image,clear the preview image 
            setPreviewUrl(null);
        }
       return()=>{
        if(previewUrl && typeof previewUrl==="string" && !image){
            URL.revokeObjectURL(previewUrl);
        }
       } 
    },[image])


  return (
    <div>
    <input
    type='file'
    accept='image/*'
    ref={inputRef}
    onChange={handleImageChange}
    className='hidden'
    />  
   {!image ? (<button className='w-full h-[220px] flex flex-col items-center justify-center gap-4 bg-slate-50 rounded border border-slate-200/50'  onClick={()=>{onChooseFile()}}>
       <div className='w-14 h-14 flex items-center justify-center bg-cyan-50 rounded-full border border-cyan-100 '>
        <FaRegFileImage className='text-xl text-cyan-500'/>
        </div> 
        <p className='text-sm text-slate-500'> Browse image files to upload</p>
    </button>) :
    (<div className='w-full relative'>
        <img src={previewUrl} alt='selected' className='w-full h-[300px] object-cover rounded-lg '/>
        <button className='btn-small btn-delete absolute top-2 right-2' onClick={handleRemoveImage}>
         <MdDeleteOutline className='text-lg'/>   

        </button>
      </div>  
        )
    }
    </div>
  )
} 

export default ImageSelector
