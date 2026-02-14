'use client';

import { useState } from "react";

// ═══════════════════════════════════════════════════════════════════
// SUBS & CONSTANTS
// ═══════════════════════════════════════════════════════════════════
const SUBS=[
  {id:"demo",name:"ABC Demolition",trade:"Demo/Abatement",color:"#E74C3C",abbr:"DEM",contact:"Mike R."},
  {id:"struct",name:"Ironside Structural",trade:"Structural",color:"#E67E22",abbr:"STR",contact:"Dave K."},
  {id:"frame",name:"ProFrame Inc",trade:"Framing",color:"#DAA520",abbr:"FRM",contact:"Carlos M."},
  {id:"plumb",name:"FlowRight Plumbing",trade:"Plumbing",color:"#1ABC9C",abbr:"PLB",contact:"Tom H."},
  {id:"elec",name:"Volt Electric Co",trade:"Electrical",color:"#3498DB",abbr:"ELC",contact:"Steve W."},
  {id:"hvac",name:"AirPro Mechanical",trade:"HVAC",color:"#9B59B6",abbr:"HVC",contact:"Ray P."},
  {id:"insul",name:"ThermalSeal Insulation",trade:"Insulation",color:"#E91E63",abbr:"INS",contact:"Jim B."},
  {id:"drywall",name:"SmoothWall Drywall",trade:"Drywall",color:"#FF9800",abbr:"DRY",contact:"Luis G."},
  {id:"paint",name:"Premier Finishes",trade:"Paint/Finish",color:"#00ACC1",abbr:"PNT",contact:"Dan T."},
  {id:"tile",name:"StoneSet Tile",trade:"Tile/Flooring",color:"#7CB342",abbr:"TLE",contact:"Marco V."},
  {id:"trim",name:"CraftTrim Casework",trade:"Trim/Casework",color:"#795548",abbr:"TRM",contact:"Ben S."},
  {id:"mepf",name:"FinishLine MEP",trade:"MEP Finish",color:"#607D8B",abbr:"MFF",contact:"Anita L."},
  {id:"fire",name:"FireStop Solutions",trade:"Fire Protection",color:"#F44336",abbr:"FPR",contact:"Kevin O."},
  {id:"inspect",name:"City Inspector",trade:"Inspections",color:"#FF5722",abbr:"INP",contact:"—"},
];
const ZONE_FULL=["Zone A – Units 1-4","Zone B – Units 5-8","Zone C – Units 9-12","Zone D – Common Areas"];
const ZONES=["Zone A","Zone B","Zone C","Zone D"];
const VARIANCE_REASONS=["Material delay","Crew no-show","Design change","Weather","Inspection failed","Prerequisite incomplete","Equipment breakdown","Scope change","Access blocked","Quality rework","Permit delay","Other"];
const CONSTRAINT_TYPES=["Material Delivery","Inspection Required","Design Clarification","Permit Needed","Crew Availability","Equipment Access","Weather Dependent","Predecessor Incomplete"];
const PERMIT_TYPES=["Hot Work","Confined Space","Excavation/Dig","Crane/Lift","Electrical Lockout","Fire Watch","General Work"];
const STATUSES=["upcoming","active","done","blocked"];

let _uid=100;const uid=()=>`t${_uid++}`;
const today2=()=>new Date().toISOString().split("T")[0];
const fmtDate=(d: string)=>d?new Date(d+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"}):"";

interface DayInfo { id: string; idx: number; date: Date; label: string; short: string; weekNum: number; isMonday: boolean; }

function genDays(startStr: string,count: number): DayInfo[]{const days: DayInfo[]=[];const d=new Date(startStr);while(days.length<count){const dow=d.getDay();if(dow!==0&&dow!==6)days.push({id:`d${days.length}`,idx:days.length,date:new Date(d),label:d.toLocaleDateString("en-US",{weekday:"short"}),short:`${d.getMonth()+1}/${d.getDate()}`,weekNum:Math.floor(days.length/5)+1,isMonday:dow===1});d.setDate(d.getDate()+1);}return days;}

// ═══ SEED ═════════════════════════════════════════════════════════
function seedTasks(){return[
{id:uid(),subId:"demo",zone:0,startDay:0,duration:5,desc:"Selective demo – interiors",crew:4,status:"done"},
{id:uid(),subId:"struct",zone:0,startDay:5,duration:3,desc:"Structural reinforcement",crew:3,status:"done"},
{id:uid(),subId:"frame",zone:0,startDay:8,duration:5,desc:"Interior framing – walls & soffits",crew:4,status:"active"},
{id:uid(),subId:"plumb",zone:0,startDay:13,duration:4,desc:"Rough plumbing – supply & waste",crew:2,status:"upcoming"},
{id:uid(),subId:"elec",zone:0,startDay:14,duration:4,desc:"Rough electrical – panels & runs",crew:3,status:"upcoming"},
{id:uid(),subId:"hvac",zone:0,startDay:18,duration:3,desc:"HVAC rough – ductwork & linesets",crew:2,status:"upcoming"},
{id:uid(),subId:"fire",zone:0,startDay:20,duration:2,desc:"Fire protection rough-in",crew:2,status:"upcoming"},
{id:uid(),subId:"inspect",zone:0,startDay:22,duration:1,desc:"Rough MEP inspection",crew:1,status:"upcoming"},
{id:uid(),subId:"insul",zone:0,startDay:23,duration:2,desc:"Batt insulation – walls & ceilings",crew:3,status:"upcoming"},
{id:uid(),subId:"drywall",zone:0,startDay:25,duration:5,desc:"Hang & finish drywall",crew:4,status:"upcoming"},
{id:uid(),subId:"paint",zone:0,startDay:30,duration:4,desc:"Prime & 2-coat finish",crew:3,status:"upcoming"},
{id:uid(),subId:"tile",zone:0,startDay:34,duration:5,desc:"Tile – baths & kitchen",crew:2,status:"upcoming"},
{id:uid(),subId:"trim",zone:0,startDay:39,duration:5,desc:"Trim, doors & casework",crew:3,status:"upcoming"},
{id:uid(),subId:"mepf",zone:0,startDay:44,duration:3,desc:"MEP finish – fixtures & devices",crew:2,status:"upcoming"},
{id:uid(),subId:"demo",zone:1,startDay:5,duration:5,desc:"Selective demo – interiors",crew:4,status:"active"},
{id:uid(),subId:"struct",zone:1,startDay:10,duration:3,desc:"Structural reinforcement",crew:3,status:"upcoming"},
{id:uid(),subId:"frame",zone:1,startDay:13,duration:5,desc:"Interior framing",crew:4,status:"upcoming"},
{id:uid(),subId:"demo",zone:2,startDay:10,duration:5,desc:"Selective demo – interiors",crew:4,status:"upcoming"},
];}
function seedMS(){return[{id:"m1",day:22,label:"Rough Inspection",zone:null as number|null,color:"#FF5722"},{id:"m2",day:47,label:"Unit Turnover – Zone A",zone:0 as number|null,color:"#764ba2"},{id:"m3",day:55,label:"Unit Turnover – Zone B",zone:1 as number|null,color:"#764ba2"}];}

// ═══ STYLES ═══════════════════════════════════════════════════════
const S: Record<string, any>={
  lbl:{display:"flex",flexDirection:"column" as const,gap:3,fontSize:11,color:"#99a",fontWeight:600},
  inp:{background:"#0c0c1e",border:"1px solid #252550",borderRadius:7,padding:"7px 10px",color:"#eee",fontSize:12,fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box" as const},
  ta:{background:"#0c0c1e",border:"1px solid #252550",borderRadius:7,padding:"7px 10px",color:"#eee",fontSize:12,fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box" as const,minHeight:50,resize:"vertical" as const},
  btn:{background:"linear-gradient(135deg,#667eea,#764ba2)",border:"none",borderRadius:7,padding:"7px 16px",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"},
  btn2:{background:"transparent",border:"1px solid #2a2a5a",borderRadius:7,padding:"7px 14px",color:"#888",fontWeight:600,fontSize:11,cursor:"pointer",fontFamily:"inherit"},
  btnD:{background:"#E74C3C18",border:"1px solid #E74C3C44",borderRadius:7,padding:"7px 14px",color:"#E74C3C",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"},
  card:{background:"#10102a",borderRadius:12,padding:16,border:"1px solid #1a1a3a"},
  pill:(c: string,a: boolean)=>({padding:"4px 12px",borderRadius:20,border:`1px solid ${a?c:"#333"}`,background:a?`${c}20`:"transparent",color:a?c:"#666",cursor:"pointer",fontSize:10,fontWeight:600,whiteSpace:"nowrap" as const,fontFamily:"inherit"}),
};
const overlay: React.CSSProperties={position:"fixed",inset:0,background:"rgba(0,0,0,.72)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000};
const mBox: React.CSSProperties={background:"#12123a",borderRadius:16,padding:24,width:560,maxHeight:"92vh",overflow:"auto",border:"1px solid #2a2a5a",boxShadow:"0 20px 60px rgba(0,0,0,.6)"};

function Modal({title,onClose,children,wide,borderColor}: {title: string; onClose: ()=>void; children: React.ReactNode; wide?: boolean; borderColor?: string}){
  return(<div style={overlay} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{...mBox,width:wide?700:560,borderTop:borderColor?`4px solid ${borderColor}`:undefined}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <h3 style={{margin:0,color:"#fff",fontSize:16}}>{title}</h3>
      <button onClick={onClose} style={{background:"none",border:"none",color:"#666",fontSize:20,cursor:"pointer"}}>&#x2715;</button>
    </div>{children}
  </div></div>);
}

// ═══ FlowChart ════════════════════════════════════════════════════
function FlowChart({nodes,edges,title,width=900,height=500}: {nodes: any[];edges: any[];title?: string;width?: number;height?: number}){
  const[hover,setHover]=useState<number|null>(null);
  return(<div style={{...S.card,padding:0,overflow:"auto"}}>
    {title&&<div style={{padding:"12px 16px",fontWeight:800,fontSize:14,color:"#fff",borderBottom:"1px solid #1a1a3a"}}>{title}</div>}
    <svg viewBox={`0 0 ${width} ${height}`} style={{width:"100%",height:"auto",minHeight:180}}>
      <defs><marker id="arr" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse"><polygon points="0 0, 8 3, 0 6" fill="#667eea"/></marker><marker id="arrR" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse"><polygon points="0 0, 8 3, 0 6" fill="#E74C3C"/></marker><filter id="glow"><feGaussianBlur stdDeviation="3" result="c"/><feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      {edges.map((e: any,i: number)=><line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={e.color||"#667eea"} strokeWidth={2} markerEnd={e.color==="#E74C3C"?"url(#arrR)":"url(#arr)"} strokeDasharray={e.dashed?"6,4":"none"} opacity={.7}/>)}
      {edges.filter((e: any)=>e.label).map((e: any,i: number)=><text key={`el${i}`} x={(e.x1+e.x2)/2} y={(e.y1+e.y2)/2-6} textAnchor="middle" fill="#888" fontSize={9} fontFamily="inherit">{e.label}</text>)}
      {nodes.map((n: any,i: number)=>{const isH=hover===i;return(<g key={i} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)} style={{cursor:"pointer"}}>
        {n.shape==="diamond"?<polygon points={`${n.x},${n.y-n.h/2} ${n.x+n.w/2},${n.y} ${n.x},${n.y+n.h/2} ${n.x-n.w/2},${n.y}`} fill={isH?`${n.color||"#667eea"}44`:`${n.color||"#667eea"}18`} stroke={n.color||"#667eea"} strokeWidth={isH?2.5:1.5} filter={isH?"url(#glow)":"none"}/>:n.shape==="circle"?<circle cx={n.x} cy={n.y} r={n.w/2} fill={isH?`${n.color||"#667eea"}44`:`${n.color||"#667eea"}18`} stroke={n.color||"#667eea"} strokeWidth={isH?2.5:1.5} filter={isH?"url(#glow)":"none"}/>:<rect x={n.x-n.w/2} y={n.y-n.h/2} width={n.w} height={n.h} rx={8} fill={isH?`${n.color||"#667eea"}44`:`${n.color||"#667eea"}18`} stroke={n.color||"#667eea"} strokeWidth={isH?2.5:1.5} filter={isH?"url(#glow)":"none"}/>}
        <text x={n.x} y={n.y+(n.subtitle?-5:4)} textAnchor="middle" fill="#fff" fontSize={n.fontSize||11} fontWeight={700} fontFamily="inherit">{n.label}</text>
        {n.subtitle&&<text x={n.x} y={n.y+10} textAnchor="middle" fill="#aaa" fontSize={8} fontFamily="inherit">{n.subtitle}</text>}
        {isH&&n.detail&&<foreignObject x={n.x-100} y={n.y+n.h/2+6} width={200} height={80}><div style={{background:"#0a0a22ee",border:"1px solid #667eea55",borderRadius:6,padding:6,fontSize:9,color:"#ccc",lineHeight:1.3,textAlign:"center"}}>{n.detail}</div></foreignObject>}
      </g>);})}
    </svg>
  </div>);
}

function RefList({title,icon,color,items}: {title: string;icon: string;color: string;items: {term: string;def: string}[]}){
  const[exp,setExp]=useState(false);const shown=exp?items:items.slice(0,5);
  return(<div style={{...S.card,borderLeft:`4px solid ${color}`}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,cursor:"pointer"}} onClick={()=>setExp(!exp)}>
      <div style={{fontWeight:800,fontSize:13,color:"#fff"}}>{icon} {title} <span style={{fontSize:10,color:"#888"}}>({items.length})</span></div>
      <span style={{color:"#888",fontSize:12}}>{exp?"\u25B2":"\u25BC"}</span>
    </div>
    {shown.map((item,i)=><div key={i} style={{background:"#0c0c1e",borderRadius:8,padding:"8px 12px",marginBottom:4,border:"1px solid #1a1a3a"}}><div style={{fontWeight:700,fontSize:12,color}}>{item.term}</div><div style={{fontSize:11,color:"#bbb",marginTop:2,lineHeight:1.4}}>{item.def}</div></div>)}
    {items.length>5&&!exp&&<button onClick={()=>setExp(true)} style={{...S.btn2,width:"100%",marginTop:4,fontSize:10}}>Show all {items.length} &#x25BC;</button>}
  </div>);
}

// ═══ Edit Task Modal ══════════════════════════════════════════════
function EditTaskModal({data,onSave,onDelete,onClose}: {data: any;onSave: (f: any)=>void;onDelete: (id: string)=>void;onClose: ()=>void}){
  const[f,setF]=useState({...data});const sub=SUBS.find(s=>s.id===f.subId);
  return(
    <Modal title="Edit Task" onClose={onClose} borderColor={sub?.color}>
      <div style={{display:"grid",gap:10}}>
        <label style={S.lbl}>Sub / Trade<select value={f.subId} onChange={e=>setF({...f,subId:e.target.value})} style={S.inp}>{SUBS.map(s=><option key={s.id} value={s.id}>{s.name} — {s.trade}</option>)}</select></label>
        <label style={S.lbl}>Description<input value={f.desc} onChange={e=>setF({...f,desc:e.target.value})} style={S.inp}/></label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
          <label style={S.lbl}>Start Day<input type="number" min={0} max={59} value={f.startDay} onChange={e=>setF({...f,startDay:parseInt(e.target.value)||0})} style={S.inp}/></label>
          <label style={S.lbl}>Duration<input type="number" min={1} value={f.duration} onChange={e=>setF({...f,duration:parseInt(e.target.value)||1})} style={S.inp}/></label>
          <label style={S.lbl}>Crew<input type="number" min={1} value={f.crew} onChange={e=>setF({...f,crew:parseInt(e.target.value)||1})} style={S.inp}/></label>
          <label style={S.lbl}>Zone<select value={f.zone} onChange={e=>setF({...f,zone:parseInt(e.target.value)})} style={S.inp}>{ZONES.map((z,i)=><option key={i} value={i}>{z}</option>)}</select></label>
        </div>
        <label style={S.lbl}>Status<div style={{display:"flex",gap:4,marginTop:4}}>{STATUSES.map(s=><button key={s} onClick={()=>setF({...f,status:s})} style={{flex:1,padding:"6px",borderRadius:6,border:f.status===s?`2px solid ${s==="done"?"#27ae60":s==="active"?"#3498db":s==="blocked"?"#E74C3C":"#666"}`:"1px solid #252550",background:f.status===s?`${s==="done"?"#27ae60":s==="active"?"#3498db":s==="blocked"?"#E74C3C":"#666"}22`:"#0c0c1e",color:f.status===s?"#fff":"#666",cursor:"pointer",fontSize:10,fontWeight:700,textTransform:"uppercase" as const,fontFamily:"inherit"}}>{s}</button>)}</div></label>
      </div>
      <div style={{display:"flex",gap:8,marginTop:14}}><button onClick={()=>onSave(f)} style={S.btn}>Save</button><button onClick={()=>{onDelete(f.id);onClose();}} style={S.btnD}>Delete</button><button onClick={onClose} style={S.btn2}>Cancel</button></div>
    </Modal>);
}

// ═══ Milestone Modal ══════════════════════════════════════════════
function MilestoneModal({data,onSave,onDelete,onClose}: {data: any;onSave: (f: any)=>void;onDelete: (id: string)=>void;onClose: ()=>void}){
  const[f,setF]=useState({...data});
  return(
    <Modal title="\u25C6 Milestone" onClose={onClose} borderColor="#764ba2">
      <div style={{display:"grid",gap:10}}>
        <label style={S.lbl}>Name<input value={f.label} onChange={e=>setF({...f,label:e.target.value})} style={S.inp}/></label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <label style={S.lbl}>Day<input type="number" min={0} max={59} value={f.day} onChange={e=>setF({...f,day:parseInt(e.target.value)||0})} style={S.inp}/></label>
          <label style={S.lbl}>Zone<select value={f.zone===null?"all":f.zone} onChange={e=>setF({...f,zone:e.target.value==="all"?null:parseInt(e.target.value)})} style={S.inp}><option value="all">All</option>{ZONES.map((z,i)=><option key={i} value={i}>{z}</option>)}</select></label>
        </div>
        <label style={S.lbl}>Color<div style={{display:"flex",gap:6,marginTop:4}}>{["#764ba2","#e74c3c","#2ecc71","#3498db","#f39c12","#e67e22"].map(c=><div key={c} onClick={()=>setF({...f,color:c})} style={{width:26,height:26,borderRadius:4,background:c,cursor:"pointer",border:f.color===c?"3px solid #fff":"2px solid #333",transform:f.color===c?"rotate(45deg)":"none",transition:"transform .15s"}}/>)}</div></label>
      </div>
      <div style={{display:"flex",gap:8,marginTop:14}}><button onClick={()=>onSave(f)} style={S.btn}>Save</button><button onClick={()=>{onDelete(f.id);onClose();}} style={S.btnD}>Delete</button><button onClick={onClose} style={S.btn2}>Cancel</button></div>
    </Modal>);
}

// ═══ Roadblock Modal ══════════════════════════════════════════════
function RoadblockModal({data,onSave,onClose}: {data: any;onSave: (f: any)=>void;onClose: ()=>void}){
  const[f,setF]=useState({...data});
  return(
    <Modal title={f.id==="new"?"New Roadblock":"Edit Roadblock"} onClose={onClose} borderColor="#E74C3C">
      <div style={{display:"grid",gap:10}}>
        <label style={S.lbl}>Description<textarea value={f.description} onChange={e=>setF({...f,description:e.target.value})} style={S.ta}/></label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <label style={S.lbl}>Trade<select value={f.trade} onChange={e=>setF({...f,trade:e.target.value})} style={S.inp}><option value="">Select...</option>{SUBS.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label style={S.lbl}>Zone<select value={f.zone} onChange={e=>setF({...f,zone:e.target.value})} style={S.inp}>{ZONES.map(z=><option key={z} value={z}>{z}</option>)}</select></label>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <label style={S.lbl}>Severity<div style={{display:"flex",gap:3}}>{["low","medium","high"].map(s=><button key={s} onClick={()=>setF({...f,severity:s})} style={S.pill(s==="high"?"#E74C3C":"#F39C12",f.severity===s)}>{s}</button>)}</div></label>
          <label style={S.lbl}>Owner<input value={f.owner} onChange={e=>setF({...f,owner:e.target.value})} style={S.inp}/></label>
          <label style={S.lbl}>Status<div style={{display:"flex",gap:3}}>{["open","in_progress","resolved"].map(s=><button key={s} onClick={()=>setF({...f,status:s})} style={S.pill(s==="open"?"#E74C3C":s==="resolved"?"#2ECC71":"#F39C12",f.status===s)}>{s}</button>)}</div></label>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <label style={S.lbl}>Created<input type="date" value={f.dateCreated} onChange={e=>setF({...f,dateCreated:e.target.value})} style={S.inp}/></label>
          <label style={S.lbl}>Needed By<input type="date" value={f.dateNeeded} onChange={e=>setF({...f,dateNeeded:e.target.value})} style={S.inp}/></label>
        </div>
        {f.status==="resolved"&&<label style={S.lbl}>Resolution<textarea value={f.resolution} onChange={e=>setF({...f,resolution:e.target.value})} style={S.ta}/></label>}
      </div>
      <div style={{display:"flex",gap:8,marginTop:14}}><button onClick={()=>onSave(f)} style={S.btn}>Save</button><button onClick={onClose} style={S.btn2}>Cancel</button></div>
    </Modal>);
}

// ═══ Delivery Modal ═══════════════════════════════════════════════
function DeliveryModal({data,onSave,onClose}: {data: any;onSave: (f: any)=>void;onClose: ()=>void}){
  const[f,setF]=useState({...data});
  return(
    <Modal title={f.id==="new"?"New Delivery":"Edit Delivery"} onClose={onClose} borderColor="#3498DB">
      <div style={{display:"grid",gap:10}}>
        <label style={S.lbl}>Item<input value={f.item} onChange={e=>setF({...f,item:e.target.value})} style={S.inp}/></label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <label style={S.lbl}>Trade<select value={f.trade} onChange={e=>setF({...f,trade:e.target.value})} style={S.inp}><option value="">Select...</option>{SUBS.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label style={S.lbl}>Vendor<input value={f.vendor} onChange={e=>setF({...f,vendor:e.target.value})} style={S.inp}/></label>
          <label style={S.lbl}>Zone<select value={f.zone} onChange={e=>setF({...f,zone:e.target.value})} style={S.inp}>{ZONES.map(z=><option key={z} value={z}>{z}</option>)}</select></label>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <label style={S.lbl}>Expected<input type="date" value={f.dateExpected} onChange={e=>setF({...f,dateExpected:e.target.value})} style={S.inp}/></label>
          <label style={S.lbl}>Staging<input value={f.stagingLocation} onChange={e=>setF({...f,stagingLocation:e.target.value})} style={S.inp}/></label>
        </div>
        <label style={S.lbl}>Status<div style={{display:"flex",gap:3}}>{["ordered","pending","delivered","delayed"].map(s=><button key={s} onClick={()=>setF({...f,status:s})} style={S.pill(s==="delivered"?"#2ECC71":s==="delayed"?"#E74C3C":"#F39C12",f.status===s)}>{s}</button>)}</div></label>
      </div>
      <div style={{display:"flex",gap:8,marginTop:14}}><button onClick={()=>onSave(f)} style={S.btn}>Save</button><button onClick={onClose} style={S.btn2}>Cancel</button></div>
    </Modal>);
}

// ═══ Huddle Modal ═════════════════════════════════════════════════
function HuddleModal({data,onSave,onClose}: {data: any;onSave: (f: any)=>void;onClose: ()=>void}){
  const[f,setF]=useState({...data,shoutouts:data.shoutouts?.length?data.shoutouts:[""]});
  return(
    <Modal title="Daily Huddle Form" onClose={onClose} wide borderColor="#FF5722">
      <div style={{display:"grid",gap:10}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <label style={S.lbl}>Date<input type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})} style={S.inp}/></label>
          <label style={S.lbl}>Type<select value={f.type} onChange={e=>setF({...f,type:e.target.value})} style={S.inp}><option value="afternoon">Afternoon Foreman</option><option value="morning">Morning Worker</option></select></label>
        </div>
        <label style={S.lbl}>Shoutouts{f.shoutouts.map((s: string,i: number)=><div key={i} style={{display:"flex",gap:3,marginTop:2}}><input value={s} onChange={e=>{const n=[...f.shoutouts];n[i]=e.target.value;setF({...f,shoutouts:n});}} style={{...S.inp,flex:1}} placeholder="Recognize great work..."/>{i===f.shoutouts.length-1&&<button onClick={()=>setF({...f,shoutouts:[...f.shoutouts,""]})} style={{...S.btn2,padding:"3px 8px"}}>+</button>}</div>)}</label>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          <label style={S.lbl}>PPC %<input type="number" min={0} max={100} value={f.ppcScore} onChange={e=>setF({...f,ppcScore:parseInt(e.target.value)||0})} style={S.inp}/></label>
          <label style={S.lbl}>Planned<input type="number" min={0} value={f.tasksPlanned} onChange={e=>setF({...f,tasksPlanned:parseInt(e.target.value)||0})} style={S.inp}/></label>
          <label style={S.lbl}>Complete<input type="number" min={0} value={f.tasksComplete} onChange={e=>setF({...f,tasksComplete:parseInt(e.target.value)||0})} style={S.inp}/></label>
          <label style={S.lbl}>Roadblocks<input type="number" min={0} value={f.roadblocksIdentified} onChange={e=>setF({...f,roadblocksIdentified:parseInt(e.target.value)||0})} style={S.inp}/></label>
        </div>
        <label style={S.lbl}>Next Day Plan<textarea value={f.nextDayPlan} onChange={e=>setF({...f,nextDayPlan:e.target.value})} style={S.ta}/></label>
        <label style={S.lbl}>Safety Focus<input value={f.safetyFocus} onChange={e=>setF({...f,safetyFocus:e.target.value})} style={S.inp}/></label>
      </div>
      <div style={{display:"flex",gap:8,marginTop:14}}><button onClick={()=>onSave(f)} style={S.btn}>Save</button><button onClick={onClose} style={S.btn2}>Cancel</button></div>
    </Modal>);
}

// ═══ Permit Modal ═════════════════════════════════════════════════
function PermitModal({data,onSave,onClose}: {data: any;onSave: (f: any)=>void;onClose: ()=>void}){
  const[f,setF]=useState({...data});
  return(
    <Modal title="Permit" onClose={onClose} borderColor="#E74C3C">
      <div style={{display:"grid",gap:10}}>
        <label style={S.lbl}>Type<div style={{display:"flex",gap:3,flexWrap:"wrap" as const}}>{PERMIT_TYPES.map(t=><button key={t} onClick={()=>setF({...f,type:t})} style={S.pill(f.type===t?"#E74C3C":"#444",f.type===t)}>{t}</button>)}</div></label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <label style={S.lbl}>Zone<select value={f.zone} onChange={e=>setF({...f,zone:e.target.value})} style={S.inp}>{ZONES.map(z=><option key={z} value={z}>{z}</option>)}</select></label>
          <label style={S.lbl}>Date<input type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})} style={S.inp}/></label>
          <label style={S.lbl}>Trade<select value={f.trade} onChange={e=>setF({...f,trade:e.target.value})} style={S.inp}><option value="">Select...</option>{SUBS.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        </div>
        <label style={S.lbl}>Description<textarea value={f.description} onChange={e=>setF({...f,description:e.target.value})} style={S.ta}/></label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <label style={S.lbl}>Prepared By<input value={f.preparedBy} onChange={e=>setF({...f,preparedBy:e.target.value})} style={S.inp}/></label>
          <label style={S.lbl}>Approved By<input value={f.approvedBy} onChange={e=>setF({...f,approvedBy:e.target.value})} style={S.inp}/></label>
        </div>
        <label style={S.lbl}>Status<div style={{display:"flex",gap:3}}>{["draft","approved","expired"].map(s=><button key={s} onClick={()=>setF({...f,status:s})} style={S.pill(s==="approved"?"#2ECC71":"#F39C12",f.status===s)}>{s}</button>)}</div></label>
      </div>
      <div style={{display:"flex",gap:8,marginTop:14}}><button onClick={()=>onSave(f)} style={S.btn}>Save</button><button onClick={onClose} style={S.btn2}>Cancel</button></div>
    </Modal>);
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export function TaktPlanning(){
  const TOTAL_DAYS=60;const VISIBLE=30;
  const days=genDays("2026-03-02",TOTAL_DAYS);
  const[view,setView]=useState("steering");
  const[tasks,setTasks]=useState(seedTasks);
  const[milestones,setMilestones]=useState(seedMS);
  const[modal,setModal]=useState<{type: string; data: any}|null>(null);
  const[dragTaskId,setDragTaskId]=useState<string|null>(null);
  const[dragNewSub,setDragNewSub]=useState<string|null>(null);
  const[viewStart,setViewStart]=useState(0);
  const[filterZone,setFilterZone]=useState("all");
  const[subExp,setSubExp]=useState<string|null>(null);
  const[todayIdx]=useState(10);
  const[roadblocks,setRoadblocks]=useState([
    {id:uid(),description:"Electrical panel delivery delayed – ETA pushed 3 days",trade:"elec",zone:"Zone A",severity:"high",owner:"PM",dateCreated:"2026-03-10",dateNeeded:"2026-03-16",status:"open",resolution:""},
    {id:uid(),description:"Fire stopping detail needs design clarification",trade:"frame",zone:"Zone A",severity:"medium",owner:"Architect",dateCreated:"2026-03-12",dateNeeded:"2026-03-18",status:"open",resolution:""},
  ]);
  const[deliveries,setDeliveries]=useState([
    {id:uid(),item:"Electrical panels (200A)",trade:"elec",zone:"Zone A",vendor:"Graybar",dateExpected:"2026-03-19",status:"pending",stagingLocation:"Loading dock NE"},
    {id:uid(),item:"PEX supply lines + fittings",trade:"plumb",zone:"Zone A",vendor:"Ferguson",dateExpected:"2026-03-14",status:"delivered",stagingLocation:"Unit interior"},
  ]);
  const[huddles,setHuddles]=useState([{id:uid(),date:"2026-03-13",type:"afternoon",shoutouts:["Plumbing crew finished rough-in on time"],ppcScore:78,tasksPlanned:9,tasksComplete:7,roadblocksIdentified:2,nextDayPlan:"Focus electrical rough-in Zone A",safetyFocus:"Ladder safety",notes:""}]);
  const[plusDeltas,setPlusDeltas]=useState([{id:uid(),date:"2026-03-13",type:"plus",text:"Plumbing communicated handoff needs 2 days early"},{id:uid(),date:"2026-03-13",type:"delta",text:"Material staging area too far from Zone A"}]);
  const[permits,setPermits]=useState<any[]>([]);

  const visibleDays=days.slice(viewStart,viewStart+VISIBLE);
  const zoneIdxs=filterZone==="all"?[0,1,2,3]:[parseInt(filterZone)];
  const ppc=(()=>{const c=tasks.filter(t=>t.status==="done"||t.status==="active");const d=tasks.filter(t=>t.status==="done").length;return{ppc:c.length?Math.round(d/c.length*100):0,total:c.length,done:d,blocked:tasks.filter(t=>t.status==="blocked").length,active:tasks.filter(t=>t.status==="active").length};})();

  const handleDropOnCell=(zoneIdx: number,dayIdx: number)=>{if(dragTaskId){setTasks(p=>p.map(t=>t.id===dragTaskId?{...t,zone:zoneIdx,startDay:dayIdx}:t));setDragTaskId(null);}else if(dragNewSub){const n={id:uid(),subId:dragNewSub,zone:zoneIdx,startDay:dayIdx,duration:3,desc:"New task",crew:2,status:"upcoming"};setTasks(p=>[...p,n]);setDragNewSub(null);setModal({type:"editTask",data:n});}};

  const VIEWS=[
    {id:"steering",l:"Steering Board"},{id:"flowcharts",l:"Flow Charts"},{id:"reference",l:"Reference"},
    {id:"huddle",l:"Huddle"},{id:"roadblocks",l:"Roadblocks"},{id:"handoffs",l:"Handoffs"},
    {id:"deliveries",l:"Deliveries"},{id:"ppc",l:"PPC"},{id:"plusdelta",l:"Plus/Delta"},
    {id:"permits",l:"Permits"},{id:"production",l:"Production"},
  ];

  // ═══ FLOW CHART DATA ═══════════════════════════════════════════
  const FC_TAKT={title:"Takt Planning Process — Master Schedule \u2192 Daily Execution",width:920,height:520,
    nodes:[{x:80,y:60,w:120,h:44,label:"Master Schedule",subtitle:"CPM / Milestones",color:"#3498DB",detail:"Define major milestones and contract dates."},{x:260,y:60,w:130,h:44,label:"Phase Scheduling",subtitle:"Pull Planning",color:"#9B59B6",detail:"Work backward from milestones with trade partners."},{x:460,y:60,w:130,h:44,label:"Takt Plan Creation",subtitle:"Zone \u00D7 Time Matrix",color:"#E67E22",detail:"Define zones, Takt time, wagons, trains. Optimize bottlenecks."},{x:680,y:60,w:130,h:44,label:"Macro Takt Plan",subtitle:"Overall Flow",color:"#2ECC71",detail:"High-level: phases, zone flow, throughput time."},{x:840,y:60,w:80,h:44,label:"Go!",shape:"circle",color:"#27ae60",detail:"Begin execution with Takt Control."},{x:680,y:160,w:130,h:44,label:"Micro Takt Plan",subtitle:"Daily Detail",color:"#1ABC9C",detail:"Break into daily tasks by zone and crew."},{x:460,y:160,w:130,h:44,label:"Lookahead Plan",subtitle:"6-Week Window",color:"#F1C40F",detail:"Make-ready: identify & remove constraints."},{x:260,y:160,w:130,h:44,label:"Weekly Work Plan",subtitle:"'Will' Commitments",color:"#E91E63",detail:"Each trade commits. Forms PPC basis."},{x:80,y:160,w:120,h:44,label:"Daily Huddle",subtitle:"15 min",color:"#FF5722",detail:"Review, plan, roadblocks, handoffs."},{x:80,y:280,w:120,h:44,label:"Execute Work",subtitle:"Takt Control",color:"#2ECC71",detail:"One-piece flow, finish as you go."},{x:260,y:280,w:130,h:44,label:"Track PPC",subtitle:"Did vs Will",color:"#3498DB",detail:"% commitments kept. Target: 80%+"},{x:460,y:280,w:130,h:44,label:"Variance Analysis",subtitle:"Root Cause",color:"#F39C12",detail:"Why did misses happen?"},{x:680,y:280,w:130,h:44,label:"Remove Roadblocks",subtitle:"#1 Priority",color:"#E74C3C",detail:"PM+Super are professional roadblock removers."},{x:460,y:380,w:150,h:50,label:"Continuous",subtitle:"Improvement",shape:"diamond",color:"#764ba2",detail:"Plus/Delta \u2192 improve every day."},{x:170,y:450,w:140,h:36,label:"Hold the Line!",subtitle:"Keep rhythm",color:"#E74C3C",detail:"Don't shift dates = stable supply chains."},{x:750,y:450,w:140,h:36,label:"Achieve Flow",subtitle:"JIT, less waste",color:"#27ae60",detail:"Flow = predictability = shorter duration."}],
    edges:[{x1:140,y1:60,x2:195,y2:60},{x1:325,y1:60,x2:395,y2:60},{x1:525,y1:60,x2:615,y2:60},{x1:745,y1:60,x2:800,y2:60},{x1:680,y1:82,x2:680,y2:138},{x1:615,y1:160,x2:525,y2:160},{x1:395,y1:160,x2:325,y2:160},{x1:195,y1:160,x2:140,y2:160},{x1:80,y1:182,x2:80,y2:258},{x1:140,y1:280,x2:195,y2:280},{x1:325,y1:280,x2:395,y2:280},{x1:525,y1:280,x2:615,y2:280},{x1:680,y1:302,x2:530,y2:365,label:"Feed into"},{x1:390,y1:365,x2:260,y2:302,label:"Improve",dashed:true},{x1:460,y1:405,x2:240,y2:450},{x1:460,y1:405,x2:680,y2:450},{x1:80,y1:302,x2:80,y2:450,color:"#E74C3C",dashed:true,label:"Feedback"}]};

  const FC_LPS={title:"Last Planner System\u00AE — Should \u2192 Can \u2192 Will \u2192 Did",width:900,height:300,
    nodes:[{x:100,y:70,w:140,h:50,label:"SHOULD",subtitle:"Master Schedule",color:"#3498DB",detail:"What SHOULD happen? Milestones, durations, logic."},{x:300,y:70,w:140,h:50,label:"CAN",subtitle:"Lookahead",color:"#F39C12",detail:"What CAN we do? Remove constraints. 6-week lookahead."},{x:500,y:70,w:140,h:50,label:"WILL",subtitle:"Weekly Work Plan",color:"#2ECC71",detail:"What WILL each trade commit to this week?"},{x:700,y:70,w:140,h:50,label:"DID",subtitle:"PPC & Learning",color:"#9B59B6",detail:"What DID we do? Measure PPC. Learn."},{x:100,y:190,w:140,h:40,label:"Pull Planning",subtitle:"Work backward",color:"#667eea",detail:"Trades sequence work backward from milestone."},{x:300,y:190,w:140,h:40,label:"Constraint Removal",subtitle:"Make-ready",color:"#E67E22",detail:"Materials? Permits? Design? Remove ALL."},{x:500,y:190,w:140,h:40,label:"Daily Huddles",subtitle:"15 min/day",color:"#1ABC9C",detail:"Track, coordinate, identify roadblocks."},{x:700,y:190,w:140,h:40,label:"Plus / Delta",subtitle:"Kaizen",color:"#764ba2",detail:"What went well? What to change?"}],
    edges:[{x1:170,y1:70,x2:230,y2:70},{x1:370,y1:70,x2:430,y2:70},{x1:570,y1:70,x2:630,y2:70},{x1:770,y1:95,x2:770,y2:250},{x1:770,y1:250,x2:100,y2:250,color:"#E74C3C",dashed:true,label:"Feedback Loop"},{x1:100,y1:95,x2:100,y2:170},{x1:300,y1:95,x2:300,y2:170},{x1:500,y1:95,x2:500,y2:170},{x1:700,y1:95,x2:700,y2:170}]};

  const FC_HUDDLE={title:"Daily Afternoon Huddle — 7-Step Process",width:900,height:200,
    nodes:[{x:70,y:90,w:90,h:56,label:"1. Reports",color:"#3498DB",detail:"Collect from all trades before meeting."},{x:190,y:90,w:90,h:56,label:"2. Shout-",subtitle:"outs",color:"#2ECC71",detail:"Recognition first. Build culture."},{x:310,y:90,w:90,h:56,label:"3. PPC",subtitle:"Review",color:"#F39C12",detail:"Tasks done vs planned. Root cause."},{x:430,y:90,w:90,h:56,label:"4. Plan",subtitle:"Next Day",color:"#9B59B6",detail:"Zones, logistics, safety."},{x:550,y:90,w:90,h:56,label:"5. Hand-",subtitle:"offs",color:"#E67E22",detail:"Host done? Successor ready?"},{x:670,y:90,w:90,h:56,label:"6. Details",subtitle:"Finalize",color:"#1ABC9C",detail:"Operations, assignments."},{x:790,y:90,w:90,h:56,label:"7. Permits",subtitle:"Pre-fill",color:"#E74C3C",detail:"Hot work, dig, confined space."}],
    edges:[{x1:115,y1:90,x2:145,y2:90},{x1:235,y1:90,x2:265,y2:90},{x1:355,y1:90,x2:385,y2:90},{x1:475,y1:90,x2:505,y2:90},{x1:595,y1:90,x2:625,y2:90},{x1:715,y1:90,x2:745,y2:90}]};

  const FC_OPF={title:"One-Piece Flow vs Batching — Why Takt Wins",width:900,height:380,
    nodes:[{x:225,y:35,w:180,h:34,label:"ONE-PIECE FLOW (Takt)",color:"#2ECC71"},{x:675,y:35,w:180,h:34,label:"BATCHING (CPM)",color:"#E74C3C"},{x:225,y:100,w:160,h:30,label:"Zone A: Demo\u2192Frame\u2192MEP",color:"#2ECC71",fontSize:9},{x:225,y:140,w:160,h:30,label:"Zone B: Demo\u2192Frame\u2192MEP",color:"#2ECC71",fontSize:9},{x:225,y:180,w:160,h:30,label:"Zone C: Demo\u2192Frame\u2192MEP",color:"#2ECC71",fontSize:9},{x:225,y:240,w:160,h:28,label:"Faster completion",color:"#27ae60",fontSize:10},{x:225,y:280,w:160,h:28,label:"Fewer workers",color:"#27ae60",fontSize:10},{x:225,y:320,w:160,h:28,label:"JIT delivery",color:"#27ae60",fontSize:10},{x:675,y:100,w:160,h:30,label:"ALL Zones: Demo everything",color:"#E74C3C",fontSize:9},{x:675,y:140,w:160,h:30,label:"ALL Zones: Frame everything",color:"#E74C3C",fontSize:9},{x:675,y:180,w:160,h:30,label:"ALL Zones: MEP everything",color:"#E74C3C",fontSize:9},{x:675,y:240,w:160,h:28,label:"Slower overall",color:"#c0392b",fontSize:10},{x:675,y:280,w:160,h:28,label:"Crews stacked",color:"#c0392b",fontSize:10},{x:675,y:320,w:160,h:28,label:"Excess inventory",color:"#c0392b",fontSize:10}],
    edges:[{x1:225,y1:52,x2:225,y2:85},{x1:225,y1:115,x2:225,y2:125},{x1:225,y1:155,x2:225,y2:165},{x1:225,y1:195,x2:225,y2:226},{x1:675,y1:52,x2:675,y2:85},{x1:675,y1:115,x2:675,y2:125},{x1:675,y1:155,x2:675,y2:165},{x1:675,y1:195,x2:675,y2:226},{x1:350,y1:180,x2:590,y2:180,color:"#F39C12",dashed:true,label:"vs"}]};

  const FC_BTL={title:"Bottleneck Resolution — Key to Achieving Flow",width:900,height:260,
    nodes:[{x:100,y:80,w:130,h:44,label:"Identify",subtitle:"Longest cycle time",color:"#E74C3C",detail:"Bottleneck = longest duration."},{x:280,y:80,w:130,h:44,label:"Optimize",subtitle:"Speed it up",color:"#F39C12",detail:"Add crew, split scope."},{x:460,y:80,w:130,h:44,label:"Balance",subtitle:"Even throughput",color:"#2ECC71",detail:"Match remaining trades."},{x:640,y:80,w:130,h:44,label:"New Bottleneck",subtitle:"Appears!",shape:"diamond",color:"#9B59B6",detail:"Always a new one."},{x:820,y:80,w:80,h:44,label:"Repeat",shape:"circle",color:"#667eea",detail:"Continuous improvement."},{x:460,y:190,w:200,h:40,label:"Result: Shorter Duration",subtitle:"Smallest crews, min inventory",color:"#27ae60"}],
    edges:[{x1:165,y1:80,x2:215,y2:80},{x1:345,y1:80,x2:395,y2:80},{x1:525,y1:80,x2:575,y2:80},{x1:705,y1:80,x2:780,y2:80},{x1:820,y1:58,x2:820,y2:30,color:"#E74C3C",dashed:true},{x1:820,y1:30,x2:100,y2:30,color:"#E74C3C",dashed:true},{x1:100,y1:30,x2:100,y2:58,color:"#E74C3C",dashed:true},{x1:460,y1:102,x2:460,y2:170}]};

  // ═══ REFERENCE DATA ════════════════════════════════════════════
  const TAKT_DEFS=[{term:"Takt",def:"German for baton, beat, or rhythm."},{term:"Takt Time",def:"The rate at which finished product must complete to meet demand."},{term:"Takt Plan",def:"Visual plan showing Takt trains per Takt time. Columns=time, rows=zones."},{term:"Takt Control",def:"Tactical system: hold dates, stabilize procurement, limit WIP, finish as you go."},{term:"Takt Zone",def:"Production area determined by repeatability and rhythm."},{term:"Takt Train",def:"Series of wagons through zones — the parade of trades."},{term:"Takt Wagon",def:"Work packages in a single cell."},{term:"Throughput Time",def:"Total time start\u2192finish through a zone."},{term:"Buffer",def:"Time/space between activities to absorb variation."},{term:"Cycle Time",def:"How long a crew takes in one zone. Must be \u2264 Takt time."}];
  const LPS_DEFS=[{term:"Last Planner System\u00AE (LPS)",def:"Production planning improving workflow reliability."},{term:"Should",def:"What SHOULD happen. Master schedule, milestones, logic."},{term:"Can",def:"What CAN we do? 6-week constraint analysis."},{term:"Will",def:"What trades WILL commit this week."},{term:"Did",def:"What DID we complete? Measure PPC, analyze variance."},{term:"Pull Planning",def:"Work backward from milestone."},{term:"PPC",def:"% weekly commitments 100% completed. Target: 80%+."},{term:"Make-Ready",def:"Remove constraints before scheduling."},{term:"Constraint",def:"Anything preventing work."},{term:"Daily Huddle",def:"15 min stand-up."},{term:"Reliable Promise",def:"Commit only when you CAN deliver."},{term:"Variance Reason",def:"Root cause for missed commitment."}];
  const WASTES=[{term:"1. Overproduction",def:"Installing in areas not ready."},{term:"2. Waiting",def:"Crews idle: materials, inspections."},{term:"3. Transportation",def:"Double-handling, staging too far."},{term:"4. Over-processing",def:"Excessive quality beyond spec."},{term:"5. Inventory",def:"Too much WIP, early deliveries."},{term:"6. Motion",def:"Walking for tools, searching for info."},{term:"7. Defects",def:"Rework, not right first time."},{term:"8. Non-utilized Talent",def:"Not engaging workforce ideas."}];
  const PRINCIPLES=[{term:"Hold the Line",def:"Don't shift dates. Stable dates = stable supply chains."},{term:"One-Piece Flow",def:"Finish one zone at a time."},{term:"Bottleneck Law",def:"Throughput = longest cycle time."},{term:"Roadblock Removal",def:"#1 job of Super & PM."},{term:"Just-in-Time",def:"Deliver only when needed."},{term:"Parade of Trades",def:"Trades move through zones in sequence."},{term:"Finish as You Go",def:"Complete all work in a zone before moving on."},{term:"Visual Management",def:"Make plan visible to everyone."}];
  const HUDDLE_STEPS=[{term:"1. Collect Reports",def:"Gather from all trades before meeting."},{term:"2. Shoutouts",def:"Start with recognition."},{term:"3. Review PPC",def:"Tasks done vs planned."},{term:"4. Plan Next Day",def:"Zones, logistics, safety, permits."},{term:"5. Review Handoffs",def:"Host done? Successor ready?"},{term:"6. Finalize Details",def:"Operations, assignments."},{term:"7. Prep Permits",def:"Pre-fill hot work, confined space, dig."}];

  const pillBtn=(a: boolean): React.CSSProperties=>({padding:"5px 10px",borderRadius:20,fontFamily:"inherit",border:a?"1px solid #fff":"1px solid #4a6278",background:a?"rgba(255,255,255,.15)":"transparent",color:a?"#fff":"#95a5a6",cursor:"pointer",fontSize:10,fontWeight:600});
  const navB: React.CSSProperties={padding:"5px 10px",borderRadius:5,fontFamily:"inherit",border:"1px solid #4a6278",background:"#1a252f",color:"#bdc3c7",cursor:"pointer",fontSize:10,fontWeight:600};

  return(
  <div style={{fontFamily:"'JetBrains Mono','SF Mono','Fira Code',monospace",background:"linear-gradient(168deg,#080818,#0e0e28,#0a0a1c)",minHeight:"100vh",color:"#ddd",margin:"-24px -16px",padding:0}}>
  <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>

  {/* ═══ HEADER ═══ */}
  <div style={{background:"linear-gradient(90deg,#0c0c24,#161640,#0c0c24)",borderBottom:"1px solid #222255",padding:"10px 16px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{width:34,height:34,borderRadius:8,background:"linear-gradient(135deg,#667eea,#764ba2)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,color:"#fff"}}>SHB</div>
      <div><div style={{fontWeight:800,fontSize:14,color:"#fff"}}>Takt Steering & Control System</div>
      <div style={{fontSize:9,color:"#667eea",fontWeight:600}}>Belmont Development \u00B7 Takt Time: 5 Days</div></div>
    </div>
    <div style={{marginLeft:"auto",display:"flex",gap:14}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:8,color:"#888"}}>PPC</div><div style={{fontSize:18,fontWeight:900,color:ppc.ppc>=80?"#2ECC71":"#F39C12"}}>{ppc.ppc}%</div></div>
      <div style={{textAlign:"center"}}><div style={{fontSize:8,color:"#888"}}>Active</div><div style={{fontSize:18,fontWeight:900,color:"#3498DB"}}>{ppc.active}</div></div>
      <div style={{textAlign:"center"}}><div style={{fontSize:8,color:"#888"}}>Roadblocks</div><div style={{fontSize:18,fontWeight:900,color:roadblocks.filter(r=>r.status==="open").length?"#E74C3C":"#2ECC71"}}>{roadblocks.filter(r=>r.status==="open").length}</div></div>
    </div>
  </div>

  {/* ═══ NAV ═══ */}
  <div style={{display:"flex",gap:2,padding:"5px 16px",overflowX:"auto",borderBottom:"1px solid #161640",background:"#0a0a1e"}}>
    {VIEWS.map(v=><button key={v.id} onClick={()=>setView(v.id)} style={{padding:"5px 10px",borderRadius:6,whiteSpace:"nowrap",border:view===v.id?"1px solid #764ba2":"1px solid transparent",background:view===v.id?"#764ba218":"transparent",color:view===v.id?"#c4b5fd":"#555",cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"inherit"}}>{v.l}</button>)}
  </div>

  <div style={{padding:"12px 16px",minHeight:"calc(100vh - 110px)"}}>

  {/* ═══ TAKT STEERING BOARD ═══ */}
  {view==="steering"&&(<div>
    <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center",flexWrap:"wrap"}}>
      <div style={{display:"flex",gap:4}}>{["all","0","1","2","3"].map(v=><button key={v} onClick={()=>setFilterZone(v)} style={pillBtn(filterZone===v)}>{v==="all"?"All Zones":ZONES[parseInt(v)]}</button>)}</div>
      <div style={{marginLeft:"auto",display:"flex",gap:4,alignItems:"center"}}>
        <button onClick={()=>setViewStart(Math.max(0,viewStart-5))} style={navB}>&laquo; 1wk</button>
        <button onClick={()=>setViewStart(Math.max(0,todayIdx-2))} style={{...navB,background:"#e74c3c",color:"#fff"}}>Today</button>
        <button onClick={()=>setViewStart(Math.min(TOTAL_DAYS-VISIBLE,viewStart+5))} style={navB}>1wk &raquo;</button>
        <span style={{fontSize:9,color:"#666",marginLeft:6}}>Day {viewStart+1}&ndash;{Math.min(viewStart+VISIBLE,TOTAL_DAYS)}</span>
        <button onClick={()=>setModal({type:"milestone",data:{id:`m${Date.now()}`,day:viewStart+10,label:"",zone:null,color:"#764ba2"}})} style={{...navB,background:"#8e44ad",color:"#fff",fontWeight:700}}>&diams; Milestone</button>
      </div>
    </div>

    {/* Day headers */}
    <div style={{display:"flex",marginLeft:120}}>
      {visibleDays.map(d=><div key={d.id} style={{flex:`0 0 ${100/VISIBLE}%`,textAlign:"center",borderLeft:d.isMonday?"2px solid #c0392b44":"1px solid #1a1a3a",background:d.idx===todayIdx?"#e74c3c33":d.isMonday?"#16163a":"#0c0c1e",padding:"3px 0",position:"relative"}}>
        <div style={{fontSize:8,fontWeight:800,color:d.idx===todayIdx?"#e74c3c":"#555",textTransform:"uppercase"}}>{d.label}</div>
        <div style={{fontSize:9,fontWeight:700,color:d.idx===todayIdx?"#e74c3c":"#888"}}>{d.short}</div>
        {d.isMonday&&<div style={{position:"absolute",top:-14,left:0,fontSize:7,fontWeight:800,color:"#c0392b",background:"#0a0a1e",padding:"0 4px",borderRadius:3}}>WK{d.weekNum}</div>}
      </div>)}
    </div>

    {/* Zone rows */}
    {zoneIdxs.map(zi=>{
      const zt=tasks.filter(t=>t.zone===zi&&t.startDay>=viewStart&&t.startDay<viewStart+VISIBLE);
      const zm=milestones.filter(m=>(m.zone===null||m.zone===zi)&&m.day>=viewStart&&m.day<viewStart+VISIBLE);
      return(<div key={zi} style={{display:"flex",marginBottom:3}}>
        <div style={{width:120,minWidth:120,background:"linear-gradient(135deg,#161640,#1a1a4a)",borderRadius:"6px 0 0 6px",padding:"6px 8px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
          <div style={{fontWeight:900,fontSize:11,color:"#c4b5fd"}}>{ZONES[zi]}</div>
          <div style={{fontSize:8,color:"#555"}}>{ZONE_FULL[zi]?.split("\u2013")[1]?.trim()}</div>
          <div style={{fontSize:8,color:"#444"}}>{tasks.filter(t=>t.zone===zi).length} tasks</div>
        </div>
        <div style={{flex:1,position:"relative",minHeight:56,background:`repeating-linear-gradient(90deg,transparent,transparent calc(${100/VISIBLE}% - 1px),#1a1a3a calc(${100/VISIBLE}% - 1px),#1a1a3a ${100/VISIBLE}%)`,borderRadius:"0 6px 6px 0",border:"1px solid #1a1a3a"}}>
          {todayIdx>=viewStart&&todayIdx<viewStart+VISIBLE&&<div style={{position:"absolute",left:`${(todayIdx-viewStart)*(100/VISIBLE)}%`,top:0,bottom:0,width:2,background:"#e74c3c",zIndex:20,boxShadow:"0 0 8px rgba(231,76,60,.5)"}}/>}
          {visibleDays.map((d,i)=><div key={d.id} onDragOver={e=>{e.preventDefault();(e.currentTarget as HTMLDivElement).style.background="rgba(102,126,234,.12)";}} onDragLeave={e=>{(e.currentTarget as HTMLDivElement).style.background="transparent";}} onDrop={e=>{(e.currentTarget as HTMLDivElement).style.background="transparent";handleDropOnCell(zi,d.idx);}} style={{position:"absolute",left:`${i*(100/VISIBLE)}%`,width:`${100/VISIBLE}%`,top:0,bottom:0,zIndex:1}}/>)}
          {zt.map(task=>{const sub=SUBS.find(s=>s.id===task.subId);const rel=task.startDay-viewStart;const vDur=Math.min(task.duration,VISIBLE-rel);
            return(<div key={task.id} draggable onDragStart={e=>{setDragTaskId(task.id);setDragNewSub(null);e.dataTransfer.effectAllowed="move";}} onClick={()=>setModal({type:"editTask",data:task})}
              style={{position:"absolute",left:`${rel*(100/VISIBLE)}%`,width:`${vDur*(100/VISIBLE)}%`,top:3,height:50,zIndex:5,cursor:"grab",padding:"0 1px",boxSizing:"border-box"}}>
              <div style={{height:"100%",borderRadius:4,background:sub?.color||"#888",opacity:task.status==="done"?.55:1,border:task.status==="active"?"2px solid #fff":"1px solid rgba(0,0,0,.15)",boxShadow:task.status==="active"?`0 0 12px ${sub?.color}66`:"0 2px 6px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.15)",padding:"3px 5px",display:"flex",flexDirection:"column",justifyContent:"space-between",overflow:"hidden",position:"relative",transition:"transform .12s"}}
                onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)";}} onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform="none";}}>
                <div style={{position:"absolute",top:0,right:0,width:0,height:0,borderStyle:"solid",borderWidth:"0 10px 10px 0",borderColor:"transparent rgba(0,0,0,.15) transparent transparent"}}/>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:900,fontSize:9,color:"#fff",background:"rgba(0,0,0,.2)",borderRadius:3,padding:"0 4px",letterSpacing:.8}}>{sub?.abbr}</span><span style={{fontSize:7,color:"rgba(255,255,255,.8)"}}>{task.duration}d</span></div>
                {vDur>=2&&<div style={{fontSize:8,color:"#fff",fontWeight:600,lineHeight:1.2,overflow:"hidden",whiteSpace:vDur<3?"nowrap":"normal",textOverflow:"ellipsis",textShadow:"0 1px 1px rgba(0,0,0,.3)"}}>{task.desc}</div>}
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:7,color:"rgba(255,255,255,.7)"}}>Crew {task.crew}</span>{task.status==="done"&&<span style={{fontSize:7,color:"#fff",fontWeight:800}}>Done</span>}{task.status==="active"&&<span style={{fontSize:7,color:"#fff",fontWeight:800,animation:"pulse 2s infinite"}}>LIVE</span>}</div>
              </div>
            </div>);})}
          {zm.map(ms=><div key={ms.id} onClick={()=>setModal({type:"milestone",data:ms})} style={{position:"absolute",left:`${(ms.day-viewStart)*(100/VISIBLE)}%`,top:"50%",transform:"translate(-50%,-50%) rotate(45deg)",width:22,height:22,background:ms.color,border:"2px solid #fff",boxShadow:`0 0 12px ${ms.color}88`,zIndex:15,cursor:"pointer",transition:"transform .15s"}} onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.transform="translate(-50%,-50%) rotate(45deg) scale(1.4)";}} onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform="translate(-50%,-50%) rotate(45deg)";}} title={ms.label}><div style={{transform:"rotate(-45deg)",fontSize:7,fontWeight:800,color:"#fff",textAlign:"center",lineHeight:"18px"}}>&diams;</div></div>)}
        </div>
      </div>);
    })}

    {/* Legend */}
    <div style={{display:"flex",gap:10,padding:"8px 0",flexWrap:"wrap",borderTop:"1px solid #1a1a3a",marginTop:6,alignItems:"center"}}>
      <span style={{fontSize:9,fontWeight:800,color:"#555"}}>LEGEND:</span>
      {SUBS.slice(0,12).map(s=><div key={s.id} style={{display:"flex",alignItems:"center",gap:3,fontSize:8,color:"#666"}}><div style={{width:12,height:12,borderRadius:3,background:s.color}}/>{s.abbr}</div>)}
      <div style={{display:"flex",alignItems:"center",gap:3,fontSize:8,color:"#666"}}><div style={{width:12,height:12,transform:"rotate(45deg)",background:"#764ba2",border:"1px solid #fff"}}/>Milestone</div>
      <div style={{display:"flex",alignItems:"center",gap:3,fontSize:8,color:"#e74c3c"}}><div style={{width:12,height:2,background:"#e74c3c"}}/>Today</div>
    </div>

    {/* ═══ SUB-CONTRACTOR PANEL ═══ */}
    <div style={{background:"#0a0a1e",borderTop:"2px solid #764ba2",padding:"14px 0",marginTop:8}}>
      <div style={{fontWeight:800,fontSize:14,color:"#fff",marginBottom:4}}>SUB-CONTRACTORS & TASKS</div>
      <div style={{fontSize:10,color:"#555",marginBottom:10}}>Drag a sub onto the schedule \u00B7 Click + to create task \u00B7 Expand for task list</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:6}}>
        {SUBS.map(sub=>{const st=tasks.filter(t=>t.subId===sub.id);const isOpen=subExp===sub.id;
          return(<div key={sub.id} style={{background:"#10102a",borderRadius:8,border:`1px solid ${sub.color}33`,overflow:"hidden"}} onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=`${sub.color}88`;}} onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=`${sub.color}33`;}}>
            <div draggable onDragStart={e=>{setDragNewSub(sub.id);setDragTaskId(null);e.dataTransfer.effectAllowed="copy";}} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 8px",cursor:"grab",background:`linear-gradient(90deg,${sub.color}22,transparent)`}}>
              <div style={{width:28,height:28,borderRadius:4,background:sub.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:9,color:"#fff",flexShrink:0}}>{sub.abbr}</div>
              <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:10,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sub.name}</div><div style={{fontSize:8,color:"#555"}}>{sub.trade} \u00B7 {sub.contact}</div></div>
              <div style={{display:"flex",gap:3,flexShrink:0}}>
                <span style={{fontSize:9,color:"#888"}}>{st.length}</span>
                <button onClick={e=>{e.stopPropagation();setSubExp(isOpen?null:sub.id);}} style={{width:22,height:22,borderRadius:4,background:"#1a1a3a",border:"1px solid #252550",color:"#888",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>{isOpen?"\u25B2":"\u25BC"}</button>
                <button onClick={e=>{e.stopPropagation();const n={id:uid(),subId:sub.id,zone:0,startDay:todayIdx+1,duration:3,desc:"",crew:2,status:"upcoming"};setTasks(p=>[...p,n]);setModal({type:"editTask",data:n});}} style={{width:22,height:22,borderRadius:4,background:sub.color,border:"none",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>+</button>
              </div>
            </div>
            {isOpen&&<div style={{padding:"0 8px 8px",display:"flex",flexDirection:"column",gap:3}}>
              {st.length===0&&<div style={{fontSize:9,color:"#444",fontStyle:"italic",padding:4}}>No tasks — click +</div>}
              {st.map(task=><div key={task.id} draggable onDragStart={e=>{setDragTaskId(task.id);setDragNewSub(null);e.dataTransfer.effectAllowed="move";}} onClick={()=>setModal({type:"editTask",data:task})} style={{background:`${sub.color}15`,borderLeft:`3px solid ${sub.color}`,borderRadius:4,padding:"4px 7px",cursor:"grab"}} onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.background=`${sub.color}33`;}} onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background=`${sub.color}15`;}}>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:600,fontSize:9,color:"#ccc"}}>{task.desc||"Untitled"}</span><span style={{fontSize:8,fontWeight:700,color:task.status==="done"?"#27ae60":task.status==="active"?"#3498db":"#555"}}>{task.status}</span></div>
                <div style={{fontSize:8,color:"#555"}}>{ZONES[task.zone]} \u00B7 Day {task.startDay+1}&ndash;{task.startDay+task.duration} \u00B7 Crew {task.crew}</div>
              </div>)}
            </div>}
          </div>);
        })}
      </div>
    </div>
  </div>)}

  {/* ═══ FLOW CHARTS ═══ */}
  {view==="flowcharts"&&<div style={{display:"grid",gap:14}}>
    <div style={{fontWeight:800,fontSize:16,color:"#fff"}}>Interactive Flow Charts <span style={{fontSize:11,color:"#888",fontWeight:400}}>— Hover nodes for details</span></div>
    <FlowChart {...FC_TAKT}/><FlowChart {...FC_LPS}/><FlowChart {...FC_HUDDLE}/><FlowChart {...FC_OPF}/><FlowChart {...FC_BTL}/>
  </div>}

  {/* ═══ REFERENCE ═══ */}
  {view==="reference"&&<div style={{display:"grid",gap:14}}>
    <div style={{fontWeight:800,fontSize:16,color:"#fff"}}>Reference Lists & Definitions</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <RefList title="Takt Definitions" icon="Target" color="#667eea" items={TAKT_DEFS}/>
      <RefList title="Last Planner System" icon="Clipboard" color="#9B59B6" items={LPS_DEFS}/>
      <RefList title="8 Wastes" icon="Trash" color="#E74C3C" items={WASTES}/>
      <RefList title="Steering Principles" icon="Train" color="#2ECC71" items={PRINCIPLES}/>
    </div>
    <RefList title="Daily Huddle — 7 Steps" icon="Clipboard" color="#F39C12" items={HUDDLE_STEPS}/>
  </div>}

  {/* ═══ DAILY HUDDLE ═══ */}
  {view==="huddle"&&<div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
      <div><div style={{fontWeight:800,fontSize:15,color:"#fff"}}>Daily Afternoon Huddle</div><div style={{fontSize:10,color:"#888"}}>20% Planning \u00B7 40% Handoffs \u00B7 40% Roadblock Removal</div></div>
      <button onClick={()=>setModal({type:"huddle",data:{id:"new",date:today2(),type:"afternoon",shoutouts:[""],ppcScore:0,tasksPlanned:0,tasksComplete:0,roadblocksIdentified:0,nextDayPlan:"",safetyFocus:"",notes:""}})} style={S.btn}>+ New Huddle</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:6,marginBottom:12}}>
      {HUDDLE_STEPS.map((s,i)=>{const c=["#3498DB","#2ECC71","#F39C12","#9B59B6","#E67E22","#1ABC9C","#E74C3C"];return(
        <div key={i} style={{...S.card,borderLeft:`4px solid ${c[i]}`,cursor:"pointer"}} onClick={()=>{if(i===4)setView("handoffs");if(i===6)setView("permits");if(i===2)setView("ppc");}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:`${c[i]}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:c[i]}}>{i+1}</div>
            <div><div style={{fontWeight:700,fontSize:11,color:"#fff"}}>{s.term}</div><div style={{fontSize:9,color:"#888"}}>{s.def.substring(0,55)}...</div></div>
          </div>
        </div>);})}
    </div>
    <div style={S.card}>
      <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:8}}>Huddle History</div>
      {huddles.map(h=><div key={h.id} onClick={()=>setModal({type:"huddle",data:h})} style={{background:"#0c0c1e",borderRadius:8,padding:10,marginBottom:4,cursor:"pointer",border:"1px solid #1a1a3a"}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:700,color:"#fff",fontSize:12}}>{fmtDate(h.date)}</span><span style={{fontSize:10}}>PPC: <b style={{color:h.ppcScore>=80?"#2ECC71":"#F39C12"}}>{h.ppcScore}%</b> \u00B7 {h.tasksComplete}/{h.tasksPlanned}</span></div>
        {h.shoutouts?.filter(Boolean).length>0&&<div style={{fontSize:10,color:"#2ECC71",marginTop:3}}>{h.shoutouts.filter(Boolean).join(" \u00B7 ")}</div>}
      </div>)}
    </div>
  </div>}

  {/* ═══ ROADBLOCKS ═══ */}
  {view==="roadblocks"&&<div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
      <div style={{fontWeight:800,fontSize:15,color:"#fff"}}>Roadblock Board</div>
      <button onClick={()=>setModal({type:"roadblock",data:{id:"new",description:"",trade:"",zone:"Zone A",severity:"medium",owner:"",dateCreated:today2(),dateNeeded:"",status:"open",resolution:""}})} style={S.btn}>+ Add Roadblock</button>
    </div>
    {roadblocks.map(rb=>{const sub=SUBS.find(s=>s.id===rb.trade);return(
      <div key={rb.id} onClick={()=>setModal({type:"roadblock",data:rb})} style={{...S.card,borderLeft:`4px solid ${rb.severity==="high"?"#E74C3C":"#F39C12"}`,cursor:"pointer",marginBottom:6,opacity:rb.status==="resolved"?.5:1}}>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <div style={{display:"flex",gap:6,alignItems:"center"}}><span style={S.pill(rb.severity==="high"?"#E74C3C":"#F39C12",true)}>{rb.severity}</span>{sub&&<span style={{fontSize:10,color:sub.color,fontWeight:700}}>{sub.abbr}</span>}<span style={{fontSize:10,color:"#888"}}>{rb.zone}</span></div>
          <span style={S.pill(rb.status==="open"?"#E74C3C":"#2ECC71",true)}>{rb.status}</span>
        </div>
        <div style={{fontWeight:600,fontSize:12,color:"#fff",marginTop:4}}>{rb.description}</div>
        <div style={{fontSize:10,color:"#888",marginTop:3}}>Owner: <b style={{color:"#c4b5fd"}}>{rb.owner}</b> \u00B7 Created: {fmtDate(rb.dateCreated)} {rb.dateNeeded&&<> \u00B7 Need by: <b style={{color:"#F39C12"}}>{fmtDate(rb.dateNeeded)}</b></>}</div>
      </div>);})}
  </div>}

  {/* ═══ HANDOFFS ═══ */}
  {view==="handoffs"&&<div>
    <div style={{fontWeight:800,fontSize:15,color:"#fff",marginBottom:10}}>Handoff Checklist</div>
    {tasks.filter(t=>t.status==="active"||t.status==="done").map(task=>{const sub=SUBS.find(s=>s.id===task.subId);const next=tasks.filter(t=>t.zone===task.zone&&t.startDay===task.startDay+task.duration);if(!next.length)return null;return(
      <div key={task.id} style={{...S.card,borderLeft:`4px solid ${sub?.color}`,marginBottom:6}}>
        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
          <span style={{fontWeight:700,color:sub?.color,fontSize:12}}>{sub?.name}</span><span style={{color:"#666"}}>&rarr;</span>
          {next.map(nt=>{const ns=SUBS.find(s=>s.id===nt.subId);return<span key={nt.id} style={{fontWeight:700,color:ns?.color,fontSize:12}}>{ns?.name}</span>;})}
          <span style={{fontSize:10,color:"#888",marginLeft:"auto"}}>{ZONES[task.zone]}</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:3}}>
          {["Host work 100% complete?","Space clean & clear?","Materials staged?","Inspection passed?","Successor crew confirmed?","No access conflicts?"].map((c,i)=>
            <label key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"#bbb",padding:"3px 6px",background:"#0c0c1e",borderRadius:5,cursor:"pointer"}}><input type="checkbox" style={{width:14,height:14,accentColor:"#2ECC71"}}/>{c}</label>
          )}
        </div>
      </div>);}).filter(Boolean)}
  </div>}

  {/* ═══ DELIVERIES ═══ */}
  {view==="deliveries"&&<div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
      <div style={{fontWeight:800,fontSize:15,color:"#fff"}}>Material Deliveries</div>
      <button onClick={()=>setModal({type:"delivery",data:{id:"new",item:"",trade:"",zone:"Zone A",vendor:"",dateExpected:"",status:"ordered",stagingLocation:""}})} style={S.btn}>+ Add Delivery</button>
    </div>
    {deliveries.map(d=>{const sub=SUBS.find(s=>s.id===d.trade);const sc: Record<string,string>={ordered:"#3498DB",pending:"#F39C12",delivered:"#2ECC71",delayed:"#E74C3C"};return(
      <div key={d.id} onClick={()=>setModal({type:"delivery",data:d})} style={{...S.card,cursor:"pointer",marginBottom:5,display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:10,alignItems:"center"}}>
        <div><div style={{fontWeight:700,fontSize:12,color:"#fff"}}>{d.item}</div><div style={{fontSize:10,color:"#888"}}>{d.vendor} \u00B7 <span style={{color:sub?.color}}>{sub?.trade}</span></div></div>
        <div style={{fontSize:10,color:"#888"}}>{d.zone} \u00B7 {fmtDate(d.dateExpected)} \u00B7 {d.stagingLocation}</div>
        <span style={S.pill(sc[d.status]||"#888",true)}>{d.status}</span>
      </div>);})}
  </div>}

  {/* ═══ PPC ═══ */}
  {view==="ppc"&&<div>
    <div style={{fontWeight:800,fontSize:15,color:"#fff",marginBottom:12}}>PPC & Variance</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:14}}>
      {[{l:"PPC",v:`${ppc.ppc}%`,c:ppc.ppc>=80?"#2ECC71":"#E74C3C"},{l:"Done",v:String(ppc.done),c:"#2ECC71"},{l:"Active",v:String(ppc.active),c:"#3498DB"},{l:"Blocked",v:String(ppc.blocked),c:"#E74C3C"}].map((m,i)=>
        <div key={i} style={{...S.card,textAlign:"center",border:`1px solid ${m.c}33`}}><div style={{fontSize:9,color:"#888"}}>{m.l}</div><div style={{fontSize:28,fontWeight:900,color:m.c}}>{m.v}</div></div>
      )}
    </div>
    <div style={S.card}>
      <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:8}}>PPC by Sub</div>
      {SUBS.map(sub=>{const st=tasks.filter(t=>t.subId===sub.id);if(!st.length)return null;const d=st.filter(t=>t.status==="done").length;const p=Math.round(d/st.length*100);return(
        <div key={sub.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
          <div style={{width:32,fontSize:8,color:sub.color,fontWeight:700,textAlign:"right"}}>{sub.abbr}</div>
          <div style={{flex:1,height:12,background:"#1a1a3a",borderRadius:3,overflow:"hidden",position:"relative"}}><div style={{height:"100%",width:`${p}%`,background:`${sub.color}aa`,borderRadius:3}}/><span style={{position:"absolute",right:4,top:0,fontSize:8,color:"#fff",fontWeight:700}}>{p}%</span></div>
          <div style={{width:30,fontSize:8,color:"#888"}}>{d}/{st.length}</div>
        </div>);}).filter(Boolean)}
    </div>
  </div>}

  {/* ═══ PLUS/DELTA ═══ */}
  {view==="plusdelta"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
    {[{type:"plus",title:"PLUS — What Went Well",color:"#2ECC71"},{type:"delta",title:"\u0394 DELTA — What To Change",color:"#F39C12"}].map(col=>
      <div key={col.type} style={{...S.card,borderTop:`3px solid ${col.color}`}}>
        <div style={{fontWeight:800,fontSize:13,color:col.color,marginBottom:8}}>{col.title}</div>
        <div style={{display:"flex",gap:4,marginBottom:8}}>
          <input id={`${col.type}-in`} placeholder={`Add...`} style={{...S.inp,flex:1}} onKeyDown={e=>{if(e.key==="Enter"&&(e.target as HTMLInputElement).value.trim()){setPlusDeltas(p=>[...p,{id:uid(),date:today2(),type:col.type,text:(e.target as HTMLInputElement).value}]);(e.target as HTMLInputElement).value="";}}}/>
          <button onClick={()=>{const el=document.getElementById(`${col.type}-in`) as HTMLInputElement;if(el?.value.trim()){setPlusDeltas(p=>[...p,{id:uid(),date:today2(),type:col.type,text:el.value}]);el.value="";}}} style={S.btn}>+</button>
        </div>
        {plusDeltas.filter(p=>p.type===col.type).map(p=>
          <div key={p.id} style={{background:`${col.color}10`,border:`1px solid ${col.color}33`,borderRadius:6,padding:"4px 8px",marginBottom:3,fontSize:11,color:"#bbb"}}>{col.type==="plus"?"+":"\u0394"} {p.text}<span style={{float:"right",fontSize:9,color:"#555"}}>{fmtDate(p.date)}</span></div>
        )}
      </div>
    )}
  </div>}

  {/* ═══ PERMITS ═══ */}
  {view==="permits"&&<div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
      <div style={{fontWeight:800,fontSize:15,color:"#fff"}}>Permits</div>
      <button onClick={()=>setModal({type:"permit",data:{id:"new",type:"Hot Work",zone:"Zone A",date:today2(),trade:"",description:"",preparedBy:"",approvedBy:"",status:"draft"}})} style={S.btn}>+ Pre-Fill Permit</button>
    </div>
    {permits.length===0&&<div style={{...S.card,textAlign:"center",color:"#555"}}>No permits — pre-fill during afternoon huddle (Step 7)</div>}
    {permits.map((p: any)=>{const tc: Record<string,string>={"Hot Work":"#E74C3C","Confined Space":"#F39C12","Excavation/Dig":"#795548","Crane/Lift":"#3498DB"};return(
      <div key={p.id} onClick={()=>setModal({type:"permit",data:p})} style={{...S.card,cursor:"pointer",borderLeft:`4px solid ${tc[p.type]||"#888"}`,marginBottom:5}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:700,color:tc[p.type]||"#fff"}}>{p.type}</span><span style={S.pill(p.status==="approved"?"#2ECC71":"#F39C12",true)}>{p.status}</span></div>
        <div style={{fontSize:10,color:"#888",marginTop:3}}>{p.zone} \u00B7 {fmtDate(p.date)} \u00B7 {p.preparedBy||"\u2014"}</div>
      </div>);})}
  </div>}

  {/* ═══ PRODUCTION ═══ */}
  {view==="production"&&<div>
    <div style={{fontWeight:800,fontSize:15,color:"#fff",marginBottom:10}}>Production Tracker</div>
    <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"separate",borderSpacing:2}}>
      <thead><tr>{["Sub","Task","Zone","Crew","Days","Status",""].map(h=><th key={h} style={{background:"#16163a",padding:"6px 8px",fontSize:10,color:"#888",fontWeight:700,borderRadius:4,textAlign:"left"}}>{h}</th>)}</tr></thead>
      <tbody>{tasks.slice(0,20).map(t=>{const sub=SUBS.find(s=>s.id===t.subId);return(
        <tr key={t.id}><td style={{background:"#0c0c1e",padding:"5px 8px",fontSize:11,borderRadius:4}}><span style={{color:sub?.color,fontWeight:700}}>{sub?.name}</span></td>
        <td style={{background:"#0c0c1e",padding:"5px 8px",fontSize:11,borderRadius:4,color:"#ddd"}}>{t.desc}</td>
        <td style={{background:"#0c0c1e",padding:"5px 8px",fontSize:11,borderRadius:4,color:"#888"}}>{ZONES[t.zone]}</td>
        <td style={{background:"#0c0c1e",padding:"5px 8px",fontSize:11,borderRadius:4,color:"#888"}}>Crew {t.crew}</td>
        <td style={{background:"#0c0c1e",padding:"5px 8px",fontSize:11,borderRadius:4,color:"#888"}}>{t.duration}d</td>
        <td style={{background:"#0c0c1e",padding:"5px 8px",fontSize:11,borderRadius:4}}><span style={{color:t.status==="done"?"#27ae60":t.status==="active"?"#3498db":"#666",fontWeight:700}}>{t.status}</span></td>
        <td style={{background:"#0c0c1e",padding:"5px 8px",borderRadius:4}}><button onClick={()=>setModal({type:"editTask",data:t})} style={{...S.btn2,padding:"2px 8px",fontSize:9}}>Edit</button></td>
        </tr>);})}</tbody>
    </table></div>
  </div>}

  </div>

  {/* ═══ MODALS ═══ */}
  {modal?.type==="editTask"&&<EditTaskModal data={modal.data} onSave={f=>{setTasks(p=>{const ex=p.find(t=>t.id===f.id);return ex?p.map(t=>t.id===f.id?f:t):[...p,f];});setModal(null);}} onDelete={id=>{setTasks(p=>p.filter(t=>t.id!==id));setModal(null);}} onClose={()=>setModal(null)}/>}

  {modal?.type==="milestone"&&<MilestoneModal data={modal.data} onSave={f=>{setMilestones(p=>{const ex=p.find(m=>m.id===f.id);return ex?p.map(m=>m.id===f.id?f:m):[...p,f];});setModal(null);}} onDelete={id=>{setMilestones(p=>p.filter(m=>m.id!==id));setModal(null);}} onClose={()=>setModal(null)}/>}

  {modal?.type==="roadblock"&&<RoadblockModal data={modal.data} onSave={f=>{if(f.id==="new")setRoadblocks(p=>[...p,{...f,id:uid()}]);else setRoadblocks(p=>p.map(r=>r.id===f.id?f:r));setModal(null);}} onClose={()=>setModal(null)}/>}

  {modal?.type==="delivery"&&<DeliveryModal data={modal.data} onSave={f=>{if(f.id==="new")setDeliveries(p=>[...p,{...f,id:uid()}]);else setDeliveries(p=>p.map(d=>d.id===f.id?f:d));setModal(null);}} onClose={()=>setModal(null)}/>}

  {modal?.type==="huddle"&&<HuddleModal data={modal.data} onSave={f=>{if(f.id==="new")setHuddles(p=>[...p,{...f,id:uid()}]);else setHuddles(p=>p.map(h=>h.id===f.id?f:h));setModal(null);}} onClose={()=>setModal(null)}/>}

  {modal?.type==="permit"&&<PermitModal data={modal.data} onSave={f=>{if(f.id==="new")setPermits(p=>[...p,{...f,id:uid()}]);else setPermits(p=>p.map(x=>x.id===f.id?f:x));setModal(null);}} onClose={()=>setModal(null)}/>}

  </div>);
}
