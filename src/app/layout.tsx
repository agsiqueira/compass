import "./globals.css";import Link from "next/link";
export const metadata={title:"COMPASS Synthetic Prototype",description:"Milestone 01 nonclinical prototype"};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><div className="banner">SYNTHETIC NONCLINICAL PROTOTYPE — not approved for clinical use or emergencies</div><div className="shell"><nav className="nav"><Link href="/"><b>COMPASS</b></Link><span className="muted">Not continuously monitored</span></nav>{children}</div></body></html>}
