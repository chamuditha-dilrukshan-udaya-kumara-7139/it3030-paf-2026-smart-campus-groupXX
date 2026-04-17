import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { useAuth } from '../context/AuthContext';

function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketData, commentsData] = await Promise.all([
        ticketService.getTicketById(id),
        ticketService.getCommentsForTicket(id)
      ]);
      setTicket(ticketData);
      setComments(commentsData);
    } catch (err) {
      setError('Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await ticketService.updateTicketStatus(id, newStatus);
      setTicket({ ...ticket, status: newStatus });
    } catch (err) {
      alert('Failed to update status.');
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
      alert('Failed to add comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await ticketService.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      alert('Failed to delete comment.');
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

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (error || !ticket) return <div className="text-center py-20 text-red-500">{error || 'Ticket not found'}</div>;

  const canEditStatus = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button onClick={() => navigate('/tickets')} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center mb-4">
        ← Back to Tickets
      </button>

      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg leading-6 font-bold text-gray-900 flex items-center gap-3">
            Ticket Details
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(ticket.status)}`}>
              {ticket.status.replace('_', ' ')}
            </span>
          </h3>
          
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
        
        <div className="px-6 py-6">
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
        </div>
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
  );
}

export default TicketDetail;
