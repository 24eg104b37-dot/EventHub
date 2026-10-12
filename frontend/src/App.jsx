import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { ArrowUpRight, CalendarDays, MapPin, Search, Plus, Ticket, Users, Sparkles, Clock3, X, CheckCircle2, SlidersHorizontal, Heart, Menu } from 'lucide-react'

const initialEvents = [
 {id:1,title:'Designing for Tomorrow',category:'Design',date:'2026-10-22',time:'10:00 AM',venue:'Anurag University · Seminar Hall',city:'Hyderabad',price:0,seats:120,attendees:86,description:'A creative meetup exploring human-centered design, product thinking and the ideas shaping what comes next.',color:'lavender',emoji:'✳'},
 {id:2,title:'Build & Beyond Hackathon',category:'Technology',date:'2026-10-25',time:'09:30 AM',venue:'Innovation Lab, Block C',city:'Hyderabad',price:199,seats:150,attendees:112,description:'Bring your team, prototype a bold idea and learn from mentors across engineering and product.',color:'peach',emoji:'⌘'},
 {id:3,title:'Campus Music Evening',category:'Music',date:'2026-10-29',time:'05:00 PM',venue:'Open Air Theatre',city:'Hyderabad',price:99,seats:300,attendees:214,description:'An evening of student bands, acoustic sets and good company under the lights.',color:'blue',emoji:'♫'},
 {id:4,title:'Startup Stories: From Idea to Impact',category:'Business',date:'2026-11-02',time:'11:00 AM',venue:'Auditorium, Main Building',city:'Hyderabad',price:0,seats:180,attendees:93,description:'Founders share honest lessons on building products, finding customers and staying resilient.',color:'green',emoji:'↗'},
 {id:5,title:'Photography Walk',category:'Lifestyle',date:'2026-11-06',time:'07:00 AM',venue:'University Main Gate',city:'Hyderabad',price:49,seats:40,attendees:28,description:'Explore visual storytelling, practice composition and capture campus life with fellow creators.',color:'pink',emoji:'◉'},
 {id:6,title:'Future of AI Meetup',category:'Technology',date:'2026-11-12',time:'02:00 PM',venue:'Computer Science Auditorium',city:'Hyderabad',price:149,seats:200,attendees:147,description:'A practical conversation about AI tools, responsible innovation and opportunities for students.',color:'dark',emoji:'✦'}
]
const categories = ['All events','Technology','Design','Music','Business','Lifestyle']
const money = n => n === 0 ? 'Free' : `₹${n}`
const dateParts = d => { const date = new Date(`${d}T12:00:00`); return {day:date.toLocaleDateString('en-IN',{day:'2-digit'}),month:date.toLocaleDateString('en-IN',{month:'short'}),full:date.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'})} }

const API_BASE = (
 import.meta.env.VITE_API_BASE_URL ||
 import.meta.env.VITE_API_URL ||
 (typeof window !== 'undefined' ? localStorage.getItem('eventhub-api-url') : null) ||
 ''
).replace(/\/$/, '')

const api = axios.create({
 baseURL: API_BASE,
 timeout: 10000
})

export default function App(){
 const [events,setEvents] = useState(initialEvents)
 const [query,setQuery] = useState('')
 const [category,setCategory] = useState('All events')
 const [view,setView] = useState('discover')
 const [modal,setModal] = useState(null)
 const [selected,setSelected] = useState(null)
 const [notice,setNotice] = useState('')
 const [form,setForm] = useState({title:'',category:'Technology',date:'2026-11-15',time:'10:00 AM',venue:'',city:'Hyderabad',price:'0',seats:'100',description:''})
 const [name,setName] = useState(()=>localStorage.getItem('eventhub-name')||'')
 const [email,setEmail] = useState(()=>localStorage.getItem('eventhub-email')||'')
 const [registered,setRegistered] = useState(()=>{try{return JSON.parse(localStorage.getItem('eventhub-registered')||'[]')}catch{return []}})
 const [apiMode,setApiMode] = useState('demo')

 useEffect(()=>{
  let live=true
  api.get('/api/events')
   .then(r=>{
     if(live&&Array.isArray(r.data)){
       if(r.data.length>0) setEvents(r.data)
       setApiMode('connected')
     }
   })
   .catch(()=>{
     if(live) setApiMode('demo')
   })
  return ()=>{live=false}
 },[])

 const visible = useMemo(()=>events.filter(e=>(category==='All events'||e.category===category)&&`${e.title} ${e.category} ${e.venue} ${e.city}`.toLowerCase().includes(query.toLowerCase())),[events,category,query])
 const totalAttendees = events.reduce((n,e)=>n+(Number(e.attendees)||0),0)
 const updateForm=(k,v)=>setForm(f=>({...f,[k]:v}))
 const showNotice=t=>{setNotice(t);setTimeout(()=>setNotice(''),3000)}

 function configureBackendUrl(){
  const current = localStorage.getItem('eventhub-api-url') || API_BASE || ''
  const entered = window.prompt('Enter your Railway Backend URL (e.g. https://your-backend.up.railway.app):', current)
  if (entered !== null) {
   const clean = entered.trim().replace(/\/$/, '')
   if (clean) {
    localStorage.setItem('eventhub-api-url', clean)
    window.location.reload()
   } else {
    localStorage.removeItem('eventhub-api-url')
    window.location.reload()
   }
  }
 }

 async function persist(next){setEvents(next);try{await api.put('/api/events/sync',next,{timeout:10000});setApiMode('connected')}catch{localStorage.setItem('eventhub-events',JSON.stringify(next))}}
 function openCreate(){setSelected(null);setForm({title:'',category:'Technology',date:'2026-11-15',time:'10:00 AM',venue:'',city:'Hyderabad',price:'0',seats:'100',description:''});setModal('event')}
 function openEdit(e){setSelected(e);setForm({...e,price:String(e.price),seats:String(e.seats)});setModal('event')}
 async function saveEvent(ev){ev.preventDefault();if(!form.title.trim()||!form.venue.trim()){showNotice('Please add an event title and venue.');return}const item={...form,id:selected?.id||Date.now(),price:Number(form.price)||0,seats:Number(form.seats)||100,attendees:selected?.attendees||0,color:selected?.color||['lavender','peach','blue','green','pink'][events.length%5],emoji:selected?.emoji||'✦'};let savedItem=item;try{if(selected){const res=await api.put(`/api/events/${selected.id}`,item,{timeout:10000});if(res?.data?.id)savedItem=res.data}else{const {id,...payload}=item;const res=await api.post('/api/events',payload,{timeout:10000});if(res?.data?.id)savedItem=res.data}setApiMode('connected')}catch(e){console.warn('Backend sync, local fallback:',e)}const next=selected?events.map(e=>e.id===selected.id?savedItem:e):[savedItem,...events];setEvents(next);localStorage.setItem('eventhub-events',JSON.stringify(next));setModal(null);showNotice(selected?'Event updated successfully':'Your event has been created')}
 async function deleteEvent(e){const next=events.filter(x=>x.id!==e.id&&(!e.title||x.title!==e.title));setEvents(next);localStorage.setItem('eventhub-events',JSON.stringify(next));setRegistered(old=>{const updated=old.filter(id=>id!==e.id);localStorage.setItem('eventhub-registered',JSON.stringify(updated));return updated});setModal(null);try{await api.delete(`/api/events/${e.id}`,{params:{title:e.title},timeout:10000});setApiMode('connected');showNotice('Event deleted successfully')}catch(err){console.warn('Delete warning:',err);showNotice('Event removed')}}
 async function register(e){if(!name.trim()||!email.includes('@')){showNotice('Enter your name and a valid email to RSVP.');return}if(registered.includes(e.id)){showNotice('You have already RSVP’d for this event.');return}try{await api.post(`/api/events/${e.id}/registrations`,{name:name.trim(),email:email.trim()});const next=events.map(x=>x.id===e.id?{...x,attendees:(Number(x.attendees)||0)+1}:x);setEvents(next);setRegistered(old=>{const updated=[...new Set([...old,e.id])];localStorage.setItem('eventhub-registered',JSON.stringify(updated));return updated});localStorage.setItem('eventhub-name',name.trim());localStorage.setItem('eventhub-email',email.trim());localStorage.setItem('eventhub-events',JSON.stringify(next));setApiMode('connected');setModal(null);showNotice(`You're registered for ${e.title}!`)}catch(err){showNotice(err.response?.data?.message||'Registration failed. Please check the backend and try again.')}}
 async function cancelRegistration(e){try{await api.delete(`/api/events/${e.id}/registrations`,{params:{email:localStorage.getItem('eventhub-email')||email}});setRegistered(old=>{const updated=old.filter(id=>id!==e.id);localStorage.setItem('eventhub-registered',JSON.stringify(updated));return updated});setEvents(old=>old.map(x=>x.id===e.id?{...x,attendees:Math.max(0,(Number(x.attendees)||0)-1)}:x));setModal(null);showNotice('Registration cancelled')}catch(err){showNotice(err.response?.data?.message||'Could not cancel registration')}}
 const featured=events.find(e=>e.id===1)||events[0]
 return <div className="app-shell">
  <aside className="sidebar"><a className="brand" href="#" onClick={e=>{e.preventDefault();setView('discover')}}><span className="brand-mark"><Sparkles size={20}/></span><span>event<span className="brand-light">hub</span><small>MAKE IT HAPPEN</small></span></a>
   <div className="side-label">WORKSPACE</div><button className={`nav-item ${view==='discover'?'active':''}`} onClick={()=>setView('discover')}><Sparkles size={18}/> Discover events</button><button className={`nav-item ${view==='manage'?'active':''}`} onClick={()=>setView('manage')}><CalendarDays size={18}/> Manage events</button><button className={`nav-item ${view==='attending'?'active':''}`} onClick={()=>setView('attending')}><Ticket size={18}/> My registrations <span className="nav-count">{registered.length}</span></button>
   <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Sparkles size={17}/></div><strong>Have an idea?</strong><p>Turn your next big idea into an event people remember.</p><button onClick={openCreate}>Create an event <ArrowUpRight size={15}/></button></div><div className="profile"><div className="avatar">AU</div><div><strong>Event Organizer</strong><small>Personal workspace</small></div><span className="online-dot"/></div></div>
  </aside>
  <main className="main">
   <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>{view==='discover'?'Discover':view==='manage'?'Manage events':'My registrations'}</b></div><div className="top-actions"><span className={`connection ${apiMode==='connected'?'connected':''}`} onClick={configureBackendUrl} style={{cursor:'pointer'}} title={apiMode==='connected'?`Connected to ${API_BASE||'backend'}. Click to configure`: 'Click to configure Railway Backend URL'}><i/>{apiMode==='connected'?'API connected':'Demo mode'}</span><button className="top-create" onClick={openCreate}><Plus size={17}/> Create event</button><div className="avatar small-avatar">AU</div></div></header>
   <section className="page-content">
    <div className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-dot"/> YOUR CAMPUS, YOUR COMMUNITY</div><h1>{view==='discover'?'Find your next experience.':view==='manage'?'Make something happen.':'Your plans, all in one place.'}</h1><p className="subhead">{view==='discover'?'Discover meetups, workshops and moments worth showing up for.':view==='manage'?'Create memorable experiences and keep every detail organized.':'Keep track of the events you’ve signed up for.'}</p></div><div className="welcome-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-star">✳</div><div className="art-note note-one">ideas ↗</div><div className="art-note note-two">people +</div></div></div>
    <div className="stats-grid"><div className="stat-card"><div className="stat-top"><span>Upcoming events</span><span className="stat-icon purple"><CalendarDays size={17}/></span></div><strong>{events.length.toString().padStart(2,'0')}</strong><small><span className="stat-positive">↗ Live</span> in your community</small></div><div className="stat-card"><div className="stat-top"><span>Total registrations</span><span className="stat-icon orange"><Users size={17}/></span></div><strong>{totalAttendees.toLocaleString('en-IN')}</strong><small><span className="stat-positive">↗ Growing</span> event participation</small></div><div className="stat-card"><div className="stat-top"><span>Events you’re joining</span><span className="stat-icon blue"><Ticket size={17}/></span></div><strong>{registered.length.toString().padStart(2,'0')}</strong><small>Your upcoming experiences</small></div></div>
    {view==='discover'&&<><div className="feature-banner"><div className="feature-copy"><span className="feature-tag"><Sparkles size={13}/> THIS WEEK'S SPOTLIGHT</span><h2>{featured?.title||'Make room for something new.'}</h2><p>{featured?.description||'Find the people, ideas and experiences that inspire you.'}</p><div className="feature-meta"><span><CalendarDays size={15}/>{featured?dateParts(featured.date).full:'Coming soon'}</span><span><MapPin size={15}/>{featured?.city||'Hyderabad'}</span></div><button onClick={()=>{setSelected(featured);setModal('details')}} className="feature-button">Explore event <ArrowUpRight size={16}/></button></div><div className="feature-visual"><div className="feature-circle circle-back"/><div className="feature-circle circle-front"/><div className="feature-glyph">{featured?.emoji||'✳'}</div><div className="floating-chip chip-a">✦ Good things ahead</div><div className="floating-chip chip-b"><span className="mini-avatars">A&nbsp; R&nbsp; M</span> + {featured?.attendees||86} attending</div></div></div>
     <div className="section-head"><div><h2>Explore events <span className="result-count">{visible.length}</span></h2><p>There’s something for every kind of curious.</p></div><div className="searchbox"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search events, places..." aria-label="Search events"/><kbd>⌘ K</kbd></div></div>
     <div className="filter-row"><div className="category-filters">{categories.map(c=><button key={c} className={`filter-chip ${category===c?'selected':''}`} onClick={()=>setCategory(c)}>{c}</button>)}</div><button className="filter-control" onClick={()=>{setCategory('All events');setQuery('')}}><SlidersHorizontal size={15}/> Reset</button></div>
     <div className="events-grid">{visible.map(e=><EventCard key={e.id} event={e} registered={registered.includes(e.id)} onOpen={()=>{setSelected(e);setModal('details')}} onEdit={()=>openEdit(e)}/>)}</div>{visible.length===0&&<div className="empty"><span>✳</span><h3>No events found</h3><p>Try another search or choose a different category.</p><button onClick={()=>{setQuery('');setCategory('All events')}}>Clear filters</button></div>}
    </>}
    {view==='manage'&&<><div className="section-head manage-heading"><div><h2>Your events <span className="result-count">{events.length}</span></h2><p>Manage details, availability and event listings.</p></div><button className="top-create" onClick={openCreate}><Plus size={17}/> New event</button></div><div className="manage-list">{events.map(e=><div className="manage-row" key={e.id}><div className={`event-thumb ${e.color}`}><span>{e.emoji}</span></div><div className="manage-info"><strong>{e.title}</strong><small><CalendarDays size={13}/>{dateParts(e.date).full} <span>·</span> <MapPin size={13}/>{e.venue}</small></div><div className="manage-category">{e.category}</div><div className="manage-attendees"><Users size={15}/>{e.attendees||0}/{e.seats}</div><button className="outline-small" onClick={()=>openEdit(e)}>Edit</button><button className="outline-small" title="Delete event" onClick={()=>{setSelected(e);setModal('delete')}}>Delete</button></div>)}</div></>}
    {view==='attending'&&<><div className="section-head"><div><h2>Events you’re attending <span className="result-count">{registered.length}</span></h2><p>Your RSVP list lives here.</p></div></div>{events.filter(e=>registered.includes(e.id)).length?<div className="events-grid">{events.filter(e=>registered.includes(e.id)).map(e=><EventCard key={e.id} event={e} registered onOpen={()=>{setSelected(e);setModal('details')}} onEdit={()=>{}}/>)}</div>:<div className="empty"><span>♧</span><h3>Your calendar is waiting</h3><p>Find an event that sparks your interest and RSVP to save your spot.</p><button onClick={()=>setView('discover')}>Discover events <ArrowUpRight size={15}/></button></div>}</>}
    <footer className="footer"><span>© 2026 EventHub</span><span>Made for ideas that bring people together <span className="footer-spark">✳</span></span><span className="footer-status"><i/> All systems ready</span></footer>
   </section>
  </main>
  {notice&&<div className="toast"><CheckCircle2 size={18}/>{notice}</div>}
  {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(null)}}><div className="modal">
   <button className="modal-close" onClick={()=>setModal(null)}><X size={19}/></button>
   {modal==='event'&&<><div className="modal-kicker"><Sparkles size={15}/> EVENT WORKSPACE</div><h2>{selected?'Edit event':'Create an event'}</h2><p className="modal-desc">The details make the experience. Fill in the essentials below.</p><form onSubmit={saveEvent}><label>Event name<input required value={form.title} onChange={e=>updateForm('title',e.target.value)} placeholder="e.g. Creative minds meetup"/></label><div className="form-two"><label>Category<select value={form.category} onChange={e=>updateForm('category',e.target.value)}>{categories.slice(1).map(c=><option key={c}>{c}</option>)}</select></label><label>Date<input required type="date" value={form.date} onChange={e=>updateForm('date',e.target.value)}/></label></div><div className="form-two"><label>Time<input value={form.time} onChange={e=>updateForm('time',e.target.value)} placeholder="10:00 AM"/></label><label>Ticket price (₹)<input type="number" min="0" value={form.price} onChange={e=>updateForm('price',e.target.value)}/></label></div><label>Venue<input required value={form.venue} onChange={e=>updateForm('venue',e.target.value)} placeholder="Building, room or location"/></label><div className="form-two"><label>City<input value={form.city} onChange={e=>updateForm('city',e.target.value)}/></label><label>Available seats<input type="number" min="1" value={form.seats} onChange={e=>updateForm('seats',e.target.value)}/></label></div><label>Description<textarea rows="3" value={form.description} onChange={e=>updateForm('description',e.target.value)} placeholder="What should attendees look forward to?"/></label><button className="submit-button" type="submit">{selected?'Save changes':'Publish event'} <ArrowUpRight size={16}/></button></form></>}
   {modal==='details'&&selected&&<><div className={`detail-hero ${selected.color}`}><span>{selected.emoji}</span><small>{selected.category.toUpperCase()} · EVENTHUB</small></div><div className="modal-kicker"><Sparkles size={15}/> COME BE PART OF IT</div><h2>{selected.title}</h2><p className="modal-desc">{selected.description}</p><div className="detail-facts"><div><CalendarDays size={17}/><span><b>{dateParts(selected.date).full}</b><small>{selected.time}</small></span></div><div><MapPin size={17}/><span><b>{selected.venue}</b><small>{selected.city}</small></span></div><div><Ticket size={17}/><span><b>{money(selected.price)}</b><small>{Math.max(0,(Number(selected.seats)||0)-(Number(selected.attendees)||0))} seats remaining</small></span></div></div><div className="attendee-line"><div className="mini-avatars">A&nbsp; R&nbsp; M</div><span><b>{selected.attendees||0} people</b> are already interested</span></div>{registered.includes(selected.id)?<><button className="submit-button success-button" disabled><CheckCircle2 size={17}/> You’re registered</button><button className="outline-small" style={{width:'100%',marginTop:10}} onClick={()=>cancelRegistration(selected)}>Cancel registration</button></>:<><div className="form-two"><label>Your name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name"/></label><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label></div><button className="submit-button" disabled={(Number(selected.attendees)||0)>=(Number(selected.seats)||0)} onClick={()=>register(selected)}>{(Number(selected.attendees)||0)>=(Number(selected.seats)||0)?'Event is full':`RSVP · ${money(selected.price)}`} <ArrowUpRight size={16}/></button></>}</>}
   {modal==='delete'&&selected&&<><div className="delete-icon"><X size={22}/></div><h2>Delete this event?</h2><p className="modal-desc">“{selected.title}” will be removed from your event list. This action can’t be undone.</p><div className="delete-actions"><button className="outline-small" onClick={()=>setModal(null)}>Keep event</button><button className="delete-button" onClick={()=>deleteEvent(selected)}>Delete event</button></div></>}
  </div></div>}
 </div>
}
function EventCard({event:e,registered,onOpen,onEdit}){const d=dateParts(e.date);return <article className="event-card"><button className={`event-art ${e.color}`} onClick={onOpen} aria-label={`View ${e.title}`}><span className="event-symbol">{e.emoji}</span><span className="art-category">{e.category}</span><span className="date-sticker"><b>{d.day}</b><small>{d.month}</small></span><span className="art-spark">✦</span></button><div className="event-body"><div className="event-time"><Clock3 size={13}/>{d.full} <span>·</span> {e.time}</div><button className="event-title" onClick={onOpen}>{e.title}</button><div className="event-location"><MapPin size={14}/><span>{e.venue}</span></div><p className="event-description">{e.description}</p><div className="event-card-bottom"><div className="event-price">{money(e.price)} <small>· {Math.max(0,(Number(e.seats)||0)-(Number(e.attendees)||0))} spots left</small></div><button className={`round-arrow ${registered?'registered':''}`} onClick={onOpen} aria-label="Open event">{registered?<CheckCircle2 size={17}/>:<ArrowUpRight size={17}/>}</button></div></div></article>}
