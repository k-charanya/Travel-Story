import React from 'react'
import ProfileInfo from './Cards/ProfileInfo'
import { useNavigate } from 'react-router-dom';
import SearchBar from './input/SearchBar';

function Navbar({userInfo,searchQuery,setSearchQuery,onSearchNote,handleClearSearch}) {
    const isToken=localStorage.getItem("token");
    const navigate= useNavigate();
    const onLogout= ()=>{
        localStorage.clear();
        navigate("/login");
    }
    const handleSearch=()=>{
      if(searchQuery){
        onSearchNote(searchQuery);
      }
    }

    const onClearSearch=()=>{
      handleClearSearch();
      setSearchQuery("");
    }

  return (
    <div className=' flex items-center justify-between px-6 py-2 drop-shadow sticky top-0 z-10 bg-white'>
      <img src="https://travelstories.com.cy/wp-content/uploads/admin/2019/07/TRAVEL-STORIES-LOGO.png" alt='LOGO' className='h-20' />
      { isToken && (<>
      <SearchBar
      value={searchQuery}
      onChange={({target})=>{
        setSearchQuery(target.value);
      }}
      handleSearch={handleSearch}
      onClearSearch={onClearSearch}
      />
      <ProfileInfo userInfo={userInfo} onLogout={onLogout}/>
      
      </>) }
    </div>
  )
}

export default Navbar
