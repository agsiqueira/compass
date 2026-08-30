"use client";
import { useState } from "react";
import { claimAlert, closeAlert } from "@/lib/domain";
import { load, record, save, type State } from "@/lib/prototype";
export default function Alerts() {
 const [state,setState]=useState<State>(()=>load());
 function update(action:"claim"|"close") {
  if(!state.alert)return;
  const nextAlert=action==="claim"?claimAlert(state.alert):closeAlert(state.alert,"Synthetic follow-up completed");
  const auditAction=action==="claim"?"STAFF_CLAIMED_ALERT":"STAFF_CLOSED_ALERT";
  const next=record({...state,alert:nextAlert},auditAction);save(next);setState(next);
 }
 return <main><p className="eyebrow">Nurse dashboard</p><h1>Prioritized alerts</h1>{!state.alert?<div className="card"><h2>No active alerts</h2><p className="muted">Submit pain 10 and hydration “none” to trigger the obvious synthetic urgent test rule.</p></div>:<div className="card grid"><div><span className={`pill ${state.alert.priority==="Urgent"?"urgent":""}`}>{state.alert.priority}</span> <span className="pill">{state.alert.status}</span></div><h2>{state.patient?.name} · {state.patient?.studyId}</h2><p>Nonclinical test signals: {state.alert.signals.join(", ")}</p><p className="muted">This rule is for software demonstration only. It is not medical guidance.</p>{state.alert.status==="New"&&<button className="btn" onClick={()=>update("claim")}>Claim alert</button>}{state.alert.status==="In progress"&&<button className="btn" onClick={()=>update("close")}>Close: follow-up completed</button>}{state.alert.status==="Closed"&&<p><b>Outcome:</b> {state.alert.outcome}</p>}<details><summary>Immutable audit history</summary>{state.audit.map((event,index)=><p key={index}>{event.at} — {event.action}</p>)}</details></div>}</main>;
}
