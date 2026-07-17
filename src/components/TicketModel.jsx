import React, { useState } from 'react';
import { X, Ticket, ChevronDown, Send, Bold, Italic, Underline, List, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

export default function TicketModal(){
  const [tab,setTab]=useState('comments');
  const tabs=[['comments','Comments'],['history','Call History'],['client','Client History']];
  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center p-6'>
      <div className='bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col'>
        <div className='h-18 border-b px-6 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='h-10 w-10 rounded-lg bg-orange-400 text-white flex items-center justify-center'><Ticket size={18}/></div>
            <h2 className='text-2xl font-semibold'>Create Ticket</h2>
          </div>
          <button><X className='text-slate-500'/></button>
        </div>

        <div className='flex-1 grid grid-cols-12 overflow-hidden'>
          <div className='col-span-7 p-6 overflow-y-auto border-r'>
            <div className='space-y-5'>
              <Field label='Client Name *'><Select placeholder='Search or select client...'/></Field>
              <div className='grid grid-cols-2 gap-5'>
                <Field label='Assigned To'><Select placeholder='Jordan Sterling'/></Field>
                <Field label='Contact Number'><Input placeholder='+1 (555) 000-0000'/></Field>
              </div>
              <div className='grid grid-cols-2 gap-5'>
                <Field label='Start Date'><Input placeholder='mm/dd/yyyy'/></Field>
                <Field label='Due Date'><Input placeholder='mm/dd/yyyy'/></Field>
              </div>
              <div className='grid grid-cols-2 gap-5'>
                <Field label='Query Type'><Select placeholder='General Inquiry'/></Field>
                <Field label='Priority'><Select placeholder='Medium'/></Field>
              </div>
              <Field label='Description'>
                <div className='border rounded-xl overflow-hidden'>
                  <div className='h-11 border-b flex items-center gap-3 px-4 text-slate-600'>
                    <Bold size={16}/><Italic size={16}/><Underline size={16}/><List size={16}/><LinkIcon size={16}/><ImageIcon size={16}/>
                  </div>
                  <textarea className='w-full h-48 p-4 outline-none resize-none' placeholder='Provide details about the ticket...' />
                </div>
              </Field>
            </div>
          </div>

          <div className='col-span-5 flex flex-col overflow-hidden'>
            <div className='border-b px-4 pt-4'>
              <div className='flex gap-6'>
                {tabs.map(([k,l])=> <button key={k} onClick={()=>setTab(k)} className={`pb-3 text-sm font-semibold border-b-2 ${tab===k?'border-orange-600 text-orange-600':'border-transparent text-slate-500'}`}>{l}</button>)}
              </div>
            </div>
            <div className='flex-1 overflow-y-auto p-4'>
              {tab==='comments' && <Comments/>}
              {tab==='history' && <CallHistory/>}
              {tab==='client' && <ClientHistory/>}
            </div>
          </div>
        </div>

        <div className='h-20 border-t px-6 flex items-center justify-end gap-3'>
          <button className='px-5 py-2.5 rounded-lg border font-medium'>Cancel</button>
          <button className='px-5 py-2.5 rounded-lg border border-orange-600 text-orange-600 font-medium'>Save</button>
          <button className='px-6 py-2.5 rounded-lg bg-orange-400 text-white font-medium'>Save & Notify</button>
        </div>
      </div>
    </div>
  )
}

function Field({label,children}){return <div><label className='block text-sm font-medium mb-2 text-slate-700'>{label}</label>{children}</div>}
function Input(props){return <input {...props} className='w-full h-12 px-4 rounded-xl border outline-none focus:ring-2 focus:ring-orange-500'/>}
function Select({placeholder}){return <button className='w-full h-12 px-4 rounded-xl border flex items-center justify-between text-left text-slate-700'><span>{placeholder}</span><ChevronDown size={18} className='text-slate-400'/></button>}
function Card({title,meta,text,badge}){return <div className='border rounded-2xl p-4 mb-4 bg-white'><div className='flex justify-between'><h4 className='font-semibold'>{title}</h4><span className='text-xs text-slate-400'>{meta}</span></div><p className='text-sm text-slate-600 mt-2'>{text}</p>{badge && <div className='mt-3 inline-block px-2 py-1 rounded bg-slate-100 text-xs'>{badge}</div>}</div>}
function Comments(){return <div><Card title='Jordan Sterling' meta='2 hours ago' text='Investigating the API timeout reported by the client. Likely a gateway issue.'/><Card title='Sarah Chen' meta='Yesterday, 4:30 PM' text='Client requested an update on the billing cycle. Handed off to accounting.'/><div className='border rounded-xl p-3 flex items-center gap-2'><input className='flex-1 outline-none' placeholder='Add a comment...'/><Send size={18} className='text-orange-600'/></div></div>}
function CallHistory(){return <div><Card title='Inbound Call' meta='Today, 11:20 AM' text='Client reported recurring timeout. Escalated to L2 support.'/><Card title='Outbound Follow-up' meta='Oct 24, 3:45 PM' text='Attempted contact, no answer. Left voicemail regarding invoice #882.'/><Card title='Inbound Call' meta='Oct 22, 10:15 AM' text='Resolved billing query. Client confirmed access to portal.'/></div>}
function ClientHistory(){return <div className='space-y-4'><div className='border rounded-2xl p-4'><h4 className='font-semibold text-lg'>Acme Corp</h4><p className='text-sm text-slate-500'>Enterprise Client â€¢ San Francisco, CA</p></div><Card title='TKT-1244' meta='IN PROGRESS' text='Payment Gateway Timeout'/><Card title='TKT-1239' meta='RESOLVED' text='Monthly Usage Report Export'/><Card title='TKT-1221' meta='PENDING' text='API Access Key Rotation'/></div>}