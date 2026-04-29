import mockData from '../data/mockData.json'

/**
 * Simulates a repository scan API call.
 * Takes a repo URL or file payload and returns the scan results.
 */
export const scanRepository = async (payload) => {
  return new Promise((resolve, reject) => {
    // Simulate network delay and scan processing time
    setTimeout(() => {
      if (payload.includes('fail')) {
        reject(new Error('Failed to connect to repository. Please verify access rights.'))
      } else {
        resolve(mockData.scanResult)
      }
    }, 3500)
  })
}

/**
 * Fetches the latest dashboard stats.
 */
export const getDashboardStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData.scanResult)
    }, 800)
  })
}
