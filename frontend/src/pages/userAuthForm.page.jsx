import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png"
import { Link, Navigate } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { useContext} from "react";
import {toast, Toaster} from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";

const UserAuthForm = ({ type }) => {

    let { userAuth: { access_token }, setUserAuth } = useContext(UserContext)

    const userAuthThroughServer = (serverRoute, formData) => {

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
        .then(({ data }) => {
            storeInSession("user",JSON.stringify(data))
            setUserAuth(data)
        })
        .catch(({ response }) => {
            toast.error(response.data.error)
        })
    }

    const handleSubmit = (e) =>{

        e.preventDefault();

        let serverRoute = type =="sign-in" ? "/signin" : "/signup";
        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; 
        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; 

        let form = new FormData(formElement);
        let formData = {};

        for (let[key,value] of form.entries()){
            formData[key]=value;
        }
        
        let {fullname, email, password} = formData;
        if (fullname){
            if (fullname.length<3){
                return toast.error("Full Name must be atleast 3 characters long")
            }
        }
        if (!email.length){
            return toast.error("Please enter Email ID")
        }
        if (!emailRegex.test(email)){
            return toast.error("Please enter Valid Email ID")
        }
        if (!passwordRegex.test(password)){
            return toast.error("Password should be 6-20 Characters Long with a numeric, 1 Lowercase and 1 Uppercase Letter.")
        }

        userAuthThroughServer(serverRoute,formData)

    }
    return (
        access_token ? 
        <Navigate to="/" /> :

        <AnimationWrapper key={type}>
            <section className="h-cover flex items-center justify-center">
                <Toaster />
                    <form id="formElement" className="w-[80%] max-w-[400px]">
                        <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
                            {type == "sign-in" ? "Welcome Back!" : "Join Us Today!"}
                        </h1>
                        {
                            type !== "sign-in" ?
                            <InputBox
                            name="fullname"
                            type="text"
                            placeholder="Full Name" 
                            icon="fi-rr-circle-user"
                            />:
                            "" 
                        }
                        <InputBox
                            name="email"
                            type="email"
                            placeholder="Email" 
                            icon="fi-rr-envelope"
                            />
                        <InputBox
                            name="password"
                            type="password"
                            placeholder="Password" 
                            icon="fi-rr-lock"
                            />
                        <button className="btn-dark center mt=14" type="submit" onClick={handleSubmit}>
                            { type.replace("-"," ") }
                        </button>

                        <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
                            <hr className="w-1/2 boreder-black"/>
                            <p>Or</p>
                            <hr className="w-1/2 border-black"/>
                        </div>

                        <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center">
                            <img src={googleIcon} className="w-5" />
                            Continue with Google
                        </button>

                        <button >
                            {
                                type=="sign-in"?
                                <p className="relative mt-6 ml-9 text-dark-grey text-xl text-center justify-center">Don't have an Account? 
                                    <Link to="/signup" className="underline text-black text-xl ml-1">
                                    Join Sukoon Today 
                                    </Link>
                                </p>
                                :
                                <p className="relative mt-6 ml-20 text-dark-grey text-xl text-center justify-center">Already a Member? 
                                    <Link to="/signin" className="underline text-black text-xl ml-1">
                                    Sign In Here 
                                    </Link>
                                </p>

                            }
                        </button>
                    </form>
            </section>
        </AnimationWrapper>
    )
}
export default UserAuthForm;