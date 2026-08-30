"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { hashPin } from "@/lib/domain";
import { load,record,save } from "@/lib/prototype";
export default function Activate(){
 const router=useRouter(),[code,setCode]=useState(""),[pin,setPin]=useState(""),[error,setError]=useState("");
 async function activate(event:React.FormEvent){event.preventDefault();const state=load();if(!state.patient||state.patient.activated||code!==state.patient.code){setError("Code is invalid or has already been used.");return}if(!/^\d{6}$/.test(pin)){setError("Choose exactly six digits.");return}const pinHash=await hashPin(pin);save(record({...state,patient:{...state.patient,activated:true,pinHash}},"PATIENT_ACTIVATED_DEVICE_AND_SET_PIN"));router.push("/patient/check-in");}
 return <main><p className="eyebrow">Patient · activation</p><h1>Welcome to the synthetic study</h1><form className="card grid" onSubmit={activate}><label>Activation code<input value={code} onChange={event=>setCode(event.target.value)} required/></label><label>Create a six-digit PIN<input inputMode="numeric" type="password" maxLength={6} value={pin} onChange={event=>setPin(event.target.value)} required/></label>{error&&<p role="alert" style={{color:"#9b2415"}}>{error}</p>}<button className="btn">Activate this device</button></form></main>;
}
