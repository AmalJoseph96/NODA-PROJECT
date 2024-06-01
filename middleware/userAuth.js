const User  =  require('../models/userModels') ;

const isLogin = async(req,res,next)=>{
    try{
        if(req.session.user_id){
            next() ;
        }else{
            res.redirect('/') ;
        }
        


    }catch(error){
        console.log(error.message) ;
    }
}


const isLogout = async(req,res,next)=>{
    try{
        if(req.session.user_id){
            res.redirect('/') ;
            return
        }

        next() ;


    }catch(error){
        console.log(error.message) ;
    }

}

const uniqueEmailId = async (req,res,next)=>{
    try {
        const{email} = req.body ;
        const user = await User.findOne({email:email}) ;

        if(user){

         
            res.render('../user/registration',{message:'email alredy exits'}) ;


        }else{
            next() ;
        }
        
    } catch (error) {
        console.log(error.message) ;
        
    }


}
module.exports = {
    isLogin,isLogout,uniqueEmailId
}