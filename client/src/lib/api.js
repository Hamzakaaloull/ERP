// /lib/api.js
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export async function fetchFromStrapi(endpoint, options = {}) {
  const token = localStorage.getItem('token')
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // في Strapi v5، البيانات تكون في data.data
    return data.data || data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// وظيفة مساعدة للحصول على البيانات مع populate
export async function fetchWithPopulate(resource, populate = []) {
  const populateString = populate.map(field => `populate=${field}`).join('&')
  const endpoint = `/api/${resource}?${populateString}`
  
  return fetchFromStrapi(endpoint)
}