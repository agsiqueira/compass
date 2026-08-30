"use client";
import type { Answers,PrototypeAlert } from "./domain";
export type State={patient?:{name:string;studyId:string;code:string;activated:boolean;pinHash?:string};answers?:Answers;clarifications:string[];alert?:PrototypeAlert;audit:{action:string;at:string}[]};
const key="compass-m01-synthetic";
export function load():State{if(typeof window==="undefined")return {clarifications:[],audit:[]};try{return JSON.parse(localStorage.getItem(key)||"") as State}catch{return {clarifications:[],audit:[]}}}
export function save(s:State){localStorage.setItem(key,JSON.stringify(s));window.dispatchEvent(new Event("compass-state"));}
export function record(s:State,action:string):State{return {...s,audit:[...s.audit,{action,at:new Date().toISOString()}]};}
