import api from "./axios";

// Resources / Books
export const getResourcesApi = async (params = {}) => {
  const response = await api.get("/api/books/resources", { params });
  return response.data;
};

export const getResourceByIdApi = async (id) => {
  const response = await api.get(`/api/books/resources/${id}`);
  return response.data;
};

export const createResourceApi = async (formData) => {
  const response = await api.post("/api/books/resources", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateResourceApi = async (id, formData) => {
  const response = await api.put(`/api/books/resources/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteResourceApi = async (id) => {
  const response = await api.delete(`/api/books/resources/${id}`);
  return response.data;
};

// Categories
export const getCategoriesApi = async () => {
  const response = await api.get("/api/books/categories");
  return response.data;
};

export const createCategoryApi = async (categoryData) => {
  const response = await api.post("/api/books/categories", categoryData);
  return response.data;
};

export const deleteCategoryApi = async (id) => {
  const response = await api.delete(`/api/books/categories/${id}`);
  return response.data;
};

// Bookmarks
export const addBookmarkApi = async (resourceId) => {
  const response = await api.post("/api/books/bookmarks", { resourceId });
  return response.data;
};

export const getBookmarksApi = async () => {
  const response = await api.get("/api/books/bookmarks");
  return response.data;
};

export const removeBookmarkApi = async (resourceId) => {
  const response = await api.delete(`/api/books/bookmarks/${resourceId}`);
  return response.data;
};

// Analytics
export const getTrendingBooksApi = async () => {
  const response = await api.get("/api/books/analytics/trending");
  return response.data;
};

export const getTopRatedBooksApi = async () => {
  const response = await api.get("/api/books/analytics/top-rated");
  return response.data;
};

export const getMostViewedBooksApi = async () => {
  const response = await api.get("/api/books/analytics/most-viewed");
  return response.data;
};

export const getMostDownloadedBooksApi = async () => {
  const response = await api.get("/api/books/analytics/most-downloaded");
  return response.data;
};

// Resource Reviews
export const getResourceReviewsApi = async (resourceId) => {
  const response = await api.get(`/api/books/reviews/${resourceId}`);
  return response.data;
};

export const addResourceReviewApi = async (reviewData) => {
  const response = await api.post("/api/books/reviews", reviewData);
  return response.data;
};

export const updateResourceReviewApi = async (reviewId, reviewData) => {
  const response = await api.put(`/api/books/reviews/${reviewId}`, reviewData);
  return response.data;
};

export const deleteResourceReviewApi = async (reviewId) => {
  const response = await api.delete(`/api/books/reviews/${reviewId}`);
  return response.data;
};

// General File Upload
export const uploadFileApi = async (file, type) => {
  const formData = new FormData();
  formData.append("file", file);
  const url = type ? `/api/books/resources/upload?type=${type}` : "/api/books/resources/upload";
  const response = await api.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

