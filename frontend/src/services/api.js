import http from './http';

const RESOURCE_PATH = '/api/resources';

export const getAllResources = () => http.get(RESOURCE_PATH);
export const createResource = (resource) => http.post(RESOURCE_PATH, resource);
export const updateResource = (id, resource) => http.put(`${RESOURCE_PATH}/${id}`, resource);
export const deleteResource = (id) => http.delete(`${RESOURCE_PATH}/${id}`);