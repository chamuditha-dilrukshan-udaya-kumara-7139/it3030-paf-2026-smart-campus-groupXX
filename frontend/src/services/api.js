import axios from 'axios';

// Backend එකේ URL එක (Spring Boot run වෙන තැන)
const API_URL = 'http://localhost:8080/api/resources';

export const getAllResources = () => axios.get(API_URL);
export const createResource = (resource) => axios.post(API_URL, resource);
export const updateResource = (id, resource) => axios.put(`${API_URL}/${id}`, resource);
export const deleteResource = (id) => axios.delete(`${API_URL}/${id}`);