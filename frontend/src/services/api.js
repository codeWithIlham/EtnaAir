import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' }
})

API.interceptors.request.use(config => {
  const token = localStorage.getItem('etnair_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authAPI = {
  login:    (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
}

export const propertyAPI = {
  getAll:   (params) => API.get('/annonces', { params }),
  getById:  (id)     => API.get(`/annonces/${id}`),
  create:   (data)   => API.post('/annonces', data),
  update:   (id, d)  => API.put(`/annonces/${id}`, d),
  delete:   (id)     => API.delete(`/annonces/${id}`),
}

export const bookingAPI = {
  getAll:        ()          => API.get('/bookings'),
  getById:       (id)        => API.get(`/bookings/${id}`),
  create:        (data)      => API.post('/bookings', data),
  delete:        (id)        => API.delete(`/bookings/${id}`),
  updateStatus:  (id, status) => API.patch(`/bookings/${id}/status`, { status }),
}

export const reviewAPI = {
  getByProperty: (id)   => API.get(`/reviews/property/${id}`),
  create:        (data) => API.post('/reviews', data),
}

export const userAPI = {
  getAll:        ()          => API.get('/users'),
  getById:       (id)        => API.get(`/users/${id}`),
  getMe:         ()          => API.get('/users/me'),
  updateProfile: (data)      => API.put('/users/me', data),
  updateRole:    (id, role)  => API.patch(`/users/${id}/role`, { role }),
  becomeHost:    ()          => API.patch('/users/me/become-host'),
  deleteUser:    (id)        => API.delete(`/users/${id}`),
}

export const uploadAPI = {
  // Upload image vers MinIO — retourne { image_url, id }
  upload: (file, property_id = null, is_main = false) => {
    const fd = new FormData()
    fd.append('image', file)
    if (property_id) fd.append('property_id', property_id)
    fd.append('is_main', is_main ? 'true' : 'false')
    return API.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  // Supprime une image par son ID (DB + MinIO)
  deleteImage: (imageId) => API.delete(`/upload/${imageId}`),
}

export const serviceAPI = {
  getAll:      (params) => API.get('/services', { params }),
  getById:     (id)     => API.get(`/services/${id}`),
  book:        (id, data) => API.post(`/services/${id}/book`, data),
  myBookings:  ()       => API.get('/services/my-bookings'),
  create:      (data)   => API.post('/services', data),
  update:      (id, d)  => API.put(`/services/${id}`, d),
  delete:      (id)     => API.delete(`/services/${id}`),
}

export const notificationAPI = {
  getAll:     ()   => API.get('/notifications'),
  markRead:   (id) => API.patch(`/notifications/${id}/read`),
  markAllRead: ()  => API.patch('/notifications/read-all'),
}

export const wishlistAPI = {
  getAll:   ()   => API.get('/wishlist'),
  add:      (property_id) => API.post('/wishlist', { property_id }),
  remove:   (propertyId)  => API.delete(`/wishlist/${propertyId}`),
  check:    (propertyId)  => API.get(`/wishlist/check/${propertyId}`),
}

// Images fallback par ville (si pas d'image en DB)
export const PROPERTY_IMAGES = {
  1:  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=85',
  2:  'https://images.unsplash.com/photo-1551882547-ff40c4fe1fa7?w=900&q=85',
  3:  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=85',
  4:  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=900&q=85',
  5:  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=85',
  6:  'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=900&q=85',
  7:  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=85',
  8:  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=85',
  9:  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&q=85',
  10: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=900&q=85',
  11: 'https://images.unsplash.com/photo-1577003811926-53b288a6e5d0?w=900&q=85',
  12: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=900&q=85',
}

export const CITY_IMAGES = {
  Paris:      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&q=85',
  Lyon:       'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=900&q=85',
  Bordeaux:   'https://images.unsplash.com/photo-1591122947157-26bad3a117d2?w=900&q=85',
  Nice:       'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=900&q=85',
  Marseille:  'https://images.unsplash.com/photo-1544550285-f813152fb2fd?w=900&q=85',
  Chamonix:   'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900&q=85',
  Strasbourg: 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?w=900&q=85',
  Toulouse:   'https://images.unsplash.com/photo-1532951974108-bd9e6b37f962?w=900&q=85',
  Biarritz:   'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=900&q=85',
  Honfleur:   'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=85',
}

// Priorité : 1) image MinIO/DB  2) mapping ID  3) mapping ville  4) fallback
export const getPropertyImage = (property) => {
  if (!property) return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'
  // Image principale depuis la base de données (PropertyImage table)
  const dbImg = property.images?.find(i => i.is_main)?.image_url
    || property.images?.[0]?.image_url
  if (dbImg) return dbImg
  // Fallback Unsplash par ID ou ville
  return PROPERTY_IMAGES[property.id]
    || CITY_IMAGES[property.city]
    || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'
}

export default API
