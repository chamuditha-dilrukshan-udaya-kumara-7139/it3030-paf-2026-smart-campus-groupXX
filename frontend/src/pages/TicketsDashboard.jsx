import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { useAuth } from '../context/AuthContext';

function TicketsDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
    // Setting up to refresh timer
    const interval = setInterval(() => {
      setTickets((t) => [...t]);
    }, 60000); // refresh every minute to update the timer
    return () => clearInterval(interval);
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Fetch all for admin/tech, else fetch user tickets
      let data = [];
      if (user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') {
        data = await ticketService.getAllTickets();
      } else {
        data = await ticketService.getUserTickets(user.id);
      }
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeOpened = (createdAt) => {
    if (!createdAt) return 'Unknown';
    const start = new Date(createdAt);
    const now = new Date();
    const difMs = now - start;
    if (difMs < 0) return 'Just now';
    const hours = Math.floor(difMs / (1000 * 60 * 60));
    const mins = Math.floor((difMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getPriorityStyle = (priority) => {
    if (priority === 'HIGH') return 'bg-red-100 text-red-800 border border-red-300 animate-pulse font-bold shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    if (priority === 'MEDIUM') return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    return 'bg-green-100 text-green-800 border border-green-300';
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
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex justify-between items-center pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Maintenance Tickets</h1>
          <p className="mt-2 text-sm text-gray-500">Manage and track your campus maintenance requests.</p>
        </div>
        <button 
          onClick={() => navigate('/tickets/new')}
          className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
          <p className="mt-1 text-gray-500">You don't have any maintenance tickets yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map(ticket => (
            <div 
              key={ticket.id} 
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className="bg-white overflow-hidden rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 relative group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${getPriorityStyle(ticket.priority)}`}>
                    {ticket.priority} Priority
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{ticket.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{ticket.description}</p>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{calculateTimeOpened(ticket.createdAt)} opened</span>
                  </div>
                  <span className="font-semibold text-indigo-600 group-hover:text-indigo-800">
                    View Details →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TicketsDashboard;
