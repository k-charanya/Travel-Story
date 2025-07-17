export const validateEmail=(email)=>{
    const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
export const getInitials= (name)=>{
    if(!name){
        return "";
    }
    const words=name.split(" ");
    let initials="";
    for(let i=0;i<Math.min(words.length,2);i++){
        initials+= words[i][0];
    }
    return initials.toUpperCase();
};
export const getEmptyCardMessage=(filterType) => {
    switch(filterType){
        case "search":
            return `oops no stories found matching your search`;
        case "date":
            return `no stories found in the given date range`;
        default:
            return `"start building your first story!!"`;    
    }
}; 