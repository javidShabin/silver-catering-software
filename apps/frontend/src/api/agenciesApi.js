import axiosInstance from "../utils/axios";

export const agenciesApi = {
  // Agencies
  getAll: async () => {
    const response = await axiosInstance.get("/agencies");
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axiosInstance.get(`/agencies/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await axiosInstance.post("/agencies", data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await axiosInstance.patch(`/agencies/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axiosInstance.delete(`/agencies/${id}`);
    return response.data;
  },

  // Event Assignments
  getAllAssignments: async () => {
    const response = await axiosInstance.get("/agencies/assignments");
    return response.data;
  },

  getEventAssignments: async (eventId) => {
    const response = await axiosInstance.get(`/agencies/event/${eventId}/assignments`);
    return response.data;
  },

  assignToEvent: async (data) => {
    const response = await axiosInstance.post("/agencies/assignments", data);
    return response.data;
  },

  updateAssignment: async (assignmentId, data) => {
    const response = await axiosInstance.patch(`/agencies/assignments/${assignmentId}`, data);
    return response.data;
  },

  deleteAssignment: async (assignmentId) => {
    const response = await axiosInstance.delete(`/agencies/assignments/${assignmentId}`);
    return response.data;
  }
};
