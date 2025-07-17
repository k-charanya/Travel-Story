import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance';
import TravelStoryCard from '../../components/Cards/TravelStoryCard';
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdAdd } from 'react-icons/md';
import Modal from "react-modal";
import AddEditTravelStory from './AddEditTravelStory';
import ViewTravelStory from './ViewTravelStory';
import EmptyCard from '../../components/Cards/EmptyCard';
import { DayPicker } from 'react-day-picker';
import moment from 'moment';
import FilterInfoTitle from '../../components/Cards/FilterInfoTitle';
import { getEmptyCardMessage } from '../../utils/helper';


function Home() {
 const navigate=useNavigate();
 const [userInfo, setUserInfo]=useState(null);
 const[allStories,setAllStories]=useState([]);
 const [openAddEditModal,setOpenAddEditModal]=useState({
  isShown:false,
  type:"add",
  data:null
 });
 const [openViewModal,setOpenViewModal]= useState({
  isShown:false,
  data:null
 })
 const [searchQuery,setSearchQuery]=useState('');
 const [filterType,setFilterType]=useState("");
 const [dateRange,setDateRange]=useState({from:null, to:null});
 //get user info
 const getUserInfo= async()=>{
      try {
        const response= await axiosInstance.get("/getUser");
        if(response.data && response.data.user){
          //set user info if user exists
          setUserInfo(response.data.user);
        }
      } catch (error) {
        if(error.response.status===401){
          //clear storage if unauthorised
          localStorage.clear();
          navigate("/login");//redirect to login
        }
      }
 };
 //get all travel stories
 const getAllTravelStories= async()=>{
    try {
      const response=await axiosInstance.get("/getAllStories");
      if(response.data && response.data.stories){
        setAllStories(response.data.stories);
      }
    } catch (error) {
      console.log("An unexpected error occured please try again");
    }
 }
 //handle edit story
  const handleEdit= async (data)=>{
    setOpenAddEditModal({
      isShown:true,
      type:"edit",
      data:data
    });
  }
//handle travel story click
const handleViewStory= async(data)=>{
      setOpenViewModal({isShown:true,data});
}
// handle update favorite
const updateIsFavourite= async (storyData)=>{
const storyId=storyData._id;
try {
  const response= await axiosInstance.put(
    "/updateIsFavourite/"+ storyId,
    {
      isFavourite:!storyData.isFavourite,
    }
  );
  if(response.data && response.data.story){
    toast.success('story updated successfully');
    if(filterType==="search" && searchQuery){
      onSearchStory(searchQuery);
    }
    else if(filterType==="date"){
        filterStoriesByDate(dateRange);
    }
    else{

      getAllTravelStories();
    }
  }
} catch (error) {
  console.log("an unexpected error occurred please try again");
}
}
//search story
const onSearchStory= async (query)=>{
  try{
    const response= await axiosInstance.get("/search",{
      params:{
        query
      }
    });
      if(response.data && response.data.stories){
        setFilterType("search");
        setAllStories(response.data.stories);
      }
  }
  catch(error){
    //handle unexpected error
      console.log("an unexpected error occurred.please try again")
  }
}
const handleClearSearch=()=>{
    setFilterType("");
    getAllTravelStories();
}
const deleteTravelStory= async(data)=>{
    const storyId=data._id;
    try{
      const response= await axiosInstance.delete("/deleteStories/"+storyId);
      if(response.data && !response.data.error){
        toast.error("story deleted successfully");
        setOpenViewModal((prevState)=>({
          ...prevState, isShown:false
        }));
        getAllTravelStories();
      }

    }
    catch(error){
      //handle unexpected error
        console.log("an unexpected error occurred.please try again")
    }
}
//handle filter story by date range 
const filterStoriesByDate=async (day)=>{
  try {
    const startDate=day.from?moment(day.from).valueOf():null;
    const endDate=day.to?moment(day.to).valueOf():null;
    if(startDate&&endDate){
      const response= await axiosInstance.get("/travelStories/filter",{
        params:{
          startDate,
          endDate
        }
      });
      if(response.data && response.data.stories){
        setFilterType("date");
        setAllStories(response.data.stories);
      }
    }
  } catch (error) {
    console.log("an unexpected error occurred.please try again")
  }  
  
}
//handle date range select
const handleDayClick=(day)=>{
  setDateRange(day);
  filterStoriesByDate(day);
}
const resetFilter=()=>{
  setDateRange({from:null,to:null});
  setFilterType("");
  getAllTravelStories();
}
 useEffect(()=>{
  getAllTravelStories();
      getUserInfo();
      return()=>{};
 },[])


  return (
    <>
      <Navbar userInfo={userInfo} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearchNote={onSearchStory} handleClearSearch={handleClearSearch}/>
      <div className='container mx-auto py-10'>

      <FilterInfoTitle
      filterType={filterType}
      filterDates={dateRange}
      onClear={()=>{
        resetFilter();
      }}
      />

        <div className='flex gap-7'>
          <div className='flex-1'>
            {
              allStories.length > 0 ? (
                <div className='grid grid-cols-2 gap-4 ml-10'>
                  {allStories.map((item)=>{
                    return (
                      <TravelStoryCard key={item._id}
                      imgUrl={item.imageUrl}
                      title={item.title}
                      story={item.story}
                      date={item.visitedDate}
                      visitedLocation={item.visitedLocation}
                      isFavourite={item.isFavourite}
                      onEdit={()=>handleEdit(item)}
                      onClick={()=>handleViewStory(item)}
                      onFavouriteClick={()=>updateIsFavourite(item)}
                      />
                    );
                  })}

                </div>
              ):(
               <EmptyCard message={getEmptyCardMessage(filterType)}/>
              )
            }
          </div>
          <div className='w-[350px]'>
            <div className='bg-white border border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg'>
            <div className='p-3'>
            <DayPicker
            captionLayout='dropdown-buttons'
            mode="range"
            selected={dateRange}
            onSelect={handleDayClick}
            pagedNavigation
            />
            </div>

            </div>

          </div>

        </div>
      </div>
      {/* Add and edit modal banayenge ab. modal basically popup ni dikhte jo jinme kabhi kabhi forms bhi hote hai vo hota hai
       */}
       <Modal
       isOpen={openAddEditModal.isShown}
       onRequestClose={()=>{}}
       style={{
        overlay:{
          backgroundColor:"rgba(0,0,0,0.2)",
          zIndex:999
        },
       }}
       appElement={document.getElementById("root")}
       className="model-box"
       >
        <AddEditTravelStory
        type={openAddEditModal.type}
        storyInfo={openAddEditModal.data}
        onClose={()=>{
          setOpenAddEditModal({isShown:false, type:"add", 
          data:null
          });
        }}
        getAllTravelStories={getAllTravelStories}
        />
       </Modal>
       {/* view modal */}
       <Modal
       isOpen={openViewModal.isShown}
       onRequestClose={()=>{}}
       style={{
        overlay:{
          backgroundColor:"rgba(0,0,0,0.2)",
          zIndex:999
        },
       }}
       appElement={document.getElementById("root")}
       className="model-box"
       >
        <ViewTravelStory 
        storyInfo={openViewModal.data || null} 
        onClose={()=>{
          setOpenViewModal((prevState)=>({...prevState, isShown:false}));
        }}
        onEditClick={()=>{
          setOpenViewModal((prevState)=>({...prevState, isShown:false}));
          handleEdit(openViewModal.data || null)
        }}
        onDeleteClick={()=>{
          deleteTravelStory(openViewModal.data||null);
        }}
        />
       </Modal>
      
            <button
            className='w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-400 bottom-10 right-10 fixed'
            onClick={()=>{
              setOpenAddEditModal({
                isShown:true,
                type:"add",
                data:null
              });
            }}
            >
            <MdAdd className='text-[32px] text-white' />
            </button>

      <ToastContainer/>
    </>
  )
}

export default Home
