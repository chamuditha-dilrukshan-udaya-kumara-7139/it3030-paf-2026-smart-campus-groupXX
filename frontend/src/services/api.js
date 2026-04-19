import http from './http';

const RESOURCE_PATH = '/api/resources';
const AUTH_PATH = '/api/auth';

export const getAllResources = () => http.get(RESOURCE_PATH);
export const createResource = (resource) => http.post(RESOURCE_PATH, resource);
export const updateResource = (id, resource) => http.put(`${RESOURCE_PATH}/${id}`, resource);
export const deleteResource = (id) => http.delete(`${RESOURCE_PATH}/${id}`);

export const loginWithEmail = (credentials) => http.post(`${AUTH_PATH}/login`, credentials);
export const signupWithEmail = (payload) => http.post(`${AUTH_PATH}/register`, payload);
export const logout = () => http.post('/logout');

export const updateProfile = (payload) => http.put(`${AUTH_PATH}/me`, payload);
export const deleteAccount = () => http.delete(`${AUTH_PATH}/me`);

export const getAllUsers = () => http.get('/api/admin/users');
export const updateUserRole = (userId, role) =>
  http.put(`/api/admin/users/${userId}/role`, `"${role}"`);
export const deleteUser = (userId) => http.delete(`/api/admin/users/${userId}`);
