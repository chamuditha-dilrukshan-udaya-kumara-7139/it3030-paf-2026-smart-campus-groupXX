import http from './http';

export const ticketService = {
  // Create a new ticket
  createTicket: async (ticketData) => {
    const response = await http.post('/api/tickets', ticketData);
    return response.data;
  },

  // Get all tickets
  getAllTickets: async () => {
    const response = await http.get('/api/tickets');
    return response.data;
  },

  // Get tickets for a specific user
  getUserTickets: async (userId) => {
    const response = await http.get(`/api/tickets/user/${userId}`);
    return response.data;
  },

  // Get a single ticket
  getTicketById: async (id) => {
    const response = await http.get(`/api/tickets/${id}`);
    return response.data;
  },

  // Update a ticket's status 
  updateTicketStatus: async (id, status) => {
    const response = await http.put(`/api/tickets/${id}/status`, { status });
    return response.data;
  },

  // Add comment
  addComment: async (ticketId, content) => {
    const response = await http.post(`/api/tickets/${ticketId}/comments`, {
      ticketId,
      content,
    });
    return response.data;
  },

  // Get comments
  getCommentsForTicket: async (ticketId) => {
    const response = await http.get(`/api/tickets/${ticketId}/comments`);
    return response.data;
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    const response = await http.delete(`/api/tickets/comments/${commentId}`);
    return response.data;
  }
};
