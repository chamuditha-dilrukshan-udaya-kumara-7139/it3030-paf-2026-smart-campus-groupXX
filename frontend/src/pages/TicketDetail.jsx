import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { ticketService } from '../services/ticketService';
import { useAuth } from '../context/AuthContext';

function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingMessage, setMeetingMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '', priority: '', contactDetails: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ticketData, commentsData] = await Promise.all([
          ticketService.getTicketById(id),
          ticketService.getCommentsForTicket(id)
        ]);
        setTicket(ticketData);
        setComments(commentsData);
        if (ticketData.scheduledMeetingTime) {
          setMeetingTime(ticketData.scheduledMeetingTime);
          setMeetingMessage(ticketData.meetingMessage || '');
        }
        setEditForm({
          title: ticketData.title,
          description: ticketData.description,
          category: ticketData.category,
          priority: ticketData.priority,
          contactDetails: ticketData.contactDetails || ''
        });
      } catch (err) {
        console.error("Error fetching ticket:", err);
        setError('Failed to load ticket details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await ticketService.updateTicketStatus(id, { 
        status: newStatus,
        scheduledMeetingTime: ticket.scheduledMeetingTime,
        meetingMessage: ticket.meetingMessage
      });
      setTicket({ ...ticket, status: newStatus });
    } catch (err) {
      console.error(err);
      window.alert('Failed to update status.');
    }
  };

  const handleUpdateMeeting = async (isCancel = false) => {
    try {
      const updatedTime = isCancel ? null : meetingTime;
      const updatedMsg = isCancel ? null : meetingMessage;
      await ticketService.updateTicketStatus(id, { 
        status: ticket.status, 
        scheduledMeetingTime: updatedTime, 
        meetingMessage: updatedMsg 
      });
      setTicket({ ...ticket, scheduledMeetingTime: updatedTime, meetingMessage: updatedMsg });
      if (isCancel) {
        setMeetingTime('');
        setMeetingMessage('');
      }
      window.alert(isCancel ? 'Meeting schedule removed!' : 'Meeting schedule updated!');
    } catch (err) {
      console.error(err);
      window.alert('Failed to update meeting schedule.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const addedComment = await ticketService.addComment(id, newComment);
      setComments([...comments, addedComment]);
      setNewComment('');
    } catch (err) {
      console.error(err);
      window.alert('Failed to add comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await ticketService.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error(err);
      window.alert('Failed to delete comment.');
    }
  };

  const handleDeleteTicket = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this ticket?")) return;
    try {
      await ticketService.deleteTicket(id);
      navigate('/hub/tickets');
    } catch (err) {
      console.error(err);
      window.alert('Failed to delete ticket.');
    }
  };

  const handleUpdateTicket = async () => {
    try {
      const updated = await ticketService.updateTicket(id, editForm);
      setTicket({ ...ticket, ...updated });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      window.alert('Failed to update ticket. Ensure all fields are filled.');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center py-20 text-red-500">{error || 'Ticket not found'}</div>
        </div>
      </div>
    );
  }

  const canEditStatus = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN';
  const isAuthor = ticket.authorId === user?.id;
  const canEditContent = (isAuthor && ticket.status === 'OPEN') || user?.role === 'ADMIN';
  const canDeleteTicket = isAuthor || user?.role === 'ADMIN';

  const canViewTicket = isAuthor || user?.role === 'ADMIN' || user?.role === 'TECHNICIAN';
  
  
  if (!canViewTicket) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-8">You do not have permission to view this ticket.</p>
            <button onClick={() => navigate('/hub/tickets')} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium">Return to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-end items-center mb-2">
        <button onClick={() => navigate('/hub/tickets')} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center px-4 py-2 bg-indigo-50 rounded-lg transition-colors">
          ← Back to Dashboard
        </button>
      </div>

      {ticket.scheduledMeetingTime && (
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-indigo-800">Meeting Scheduled for: {new Date(ticket.scheduledMeetingTime).toLocaleString()}</h3>
              <div className="mt-2 text-sm text-indigo-700">
                <p>{ticket.meetingMessage || 'Please visit the designated location to discuss your ticket.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 flex-wrap gap-4">
          <h3 className="text-lg leading-6 font-bold text-gray-900 flex items-center gap-3">
            Ticket Details
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(ticket.status)}`}>
              {ticket.status.replace('_', ' ')}
            </span>
          </h3>
          
          <div className="flex gap-2 items-center flex-wrap">
            {canEditContent && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium">Edit Ticket</button>
            )}
            {canEditContent && isEditing && (
              <>
                <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
                <button onClick={handleUpdateTicket} className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium tracking-wide">Save</button>
              </>
            )}
            {canDeleteTicket && (
              <button onClick={handleDeleteTicket} className="px-3 py-1 text-sm bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 font-medium">Delete</button>
            )}
            {canEditStatus && (
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="text-gray-500">Update Status:</span>
                <select 
                  value={ticket.status} 
                  onChange={handleStatusChange}
                  className="block w-40 pl-3 pr-10 py-2 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            )}
          </div>
        </div>
        
        <div className="px-6 py-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input type="text" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})} className="mt-1 block w-full border border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Details</label>
                <input type="text" value={editForm.contactDetails} onChange={e => setEditForm({...editForm, contactDetails: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea rows="4" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
            </div>
          ) : (
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Title</dt>
                <dd className="mt-1 text-sm text-gray-900 font-bold">{ticket.title}</dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Category & Priority</dt>
                <dd className="mt-1 text-sm text-gray-900">{ticket.category} — <b>{ticket.priority}</b></dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Created For Contact</dt>
                <dd className="mt-1 text-sm text-gray-900">{ticket.contactDetails}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-md border border-gray-100">{ticket.description}</dd>
              </div>


            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 mb-3">Attachments</dt>
                <dd className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {ticket.attachments.map((img, i) => (
                    <div key={i} className="rounded-lg overflow-hidden border border-gray-200">
                      <img src={img} alt="Attachment" className="w-full h-48 object-cover hover:opacity-75 transition-opacity cursor-zoom-in" onClick={() => window.open(img, '_blank')} />
                    </div>
                  ))}
                </dd>
              </div>
            )}
          </dl>
          )}
        </div>

        {canEditStatus && (
          <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              Schedule Meeting
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Meeting Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={meetingTime ? new Date(meetingTime).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Meeting Message / Instructions</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={meetingMessage}
                    onChange={(e) => setMeetingMessage(e.target.value)}
                    placeholder="e.g. Please visit the admin office, room 302"
                    className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <button 
                    onClick={() => handleUpdateMeeting(false)}
                    className="whitespace-nowrap px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                  >
                    Save Schedule
                  </button>
                  {ticket.scheduledMeetingTime && (
                    <button 
                      onClick={() => handleUpdateMeeting(true)}
                      className="whitespace-nowrap px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg leading-6 font-bold text-gray-900">Discussion & Activity</h3>
        </div>
        <div className="px-6 py-6 pb-24">
          <ul className="space-y-8">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-sm text-center italic border-2 border-dashed border-gray-200 p-8 rounded-lg">No comments yet. Be the first to comment.</p>
            ) : (
              comments.map((comment) => (
                <li key={comment.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      C
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">User ID: {comment.authorId}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-700 p-4 bg-gray-50 rounded-b-lg rounded-tr-lg border border-gray-200">
                      <p>{comment.content}</p>
                    </div>
                    <div className="mt-2 text-xs flex items-center justify-between">
                      <span className="text-gray-500 font-medium">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                      {(comment.authorId === user.id || user.role === 'ADMIN') && (
                        <button 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-500 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="bg-gray-50 px-4 py-6 border-t border-gray-200 sm:px-6 fixed bottom-0 w-full max-w-7xl mx-auto rounded-b-2xl">
          <form onSubmit={handleAddComment} className="flex gap-4">
            <img className="h-10 w-10 rounded-full border border-gray-300" src={`https://ui-avatars.com/api/?name=${user.email}`} alt="" />
            <div className="min-w-0 flex-1">
              <textarea
                rows="2"
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                placeholder="Add a note or update..."
              />
            </div>
            <div className="flex-shrink-0">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}

export default TicketDetail;
