/**
 * Generate a date range query for MongoDB based on a period string
 * 
 * @param period Period string (e.g., '30d', '7d', '24h', '1y')
 * @returns Date filter object for MongoDB query
 */
export const generateDateRangeQuery = (period: string): { $gte: Date } => {
  const now = new Date();
  let startDate = new Date(now);
  
  // Parse period string
  const value = parseInt(period.slice(0, -1));
  const unit = period.slice(-1);
  
  switch (unit) {
    case 'h': // hours
      startDate.setHours(now.getHours() - value);
      break;
    case 'd': // days
      startDate.setDate(now.getDate() - value);
      break;
    case 'w': // weeks
      startDate.setDate(now.getDate() - (value * 7));
      break;
    case 'm': // months
      startDate.setMonth(now.getMonth() - value);
      break;
    case 'y': // years
      startDate.setFullYear(now.getFullYear() - value);
      break;
    default:
      // Default to 30 days if invalid period
      startDate.setDate(now.getDate() - 30);
  }
  
  return { $gte: startDate };
};

/**
 * Generate a MongoDB aggregation pipeline stage for time series data
 * 
 * @param period Period string (e.g., '30d', '7d', '24h', '1y')
 * @returns MongoDB aggregation pipeline stage
 */
export const generateTimeSeriesAggregation = (period: string): any => {
  // Determine appropriate time grouping based on period
  let dateFormat = '%Y-%m-%d'; // Default to daily
  let dateField = { $dateToString: { format: dateFormat, date: '$timestamp' } };
  
  // Parse period string
  const value = parseInt(period.slice(0, -1));
  const unit = period.slice(-1);
  
  // For short periods (hours), group by hour
  if (unit === 'h' && value <= 48) {
    dateFormat = '%Y-%m-%d %H:00';
    dateField = { $dateToString: { format: dateFormat, date: '$timestamp' } };
  }
  // For long periods (months/years), group by month
  else if ((unit === 'm' && value > 1) || unit === 'y') {
    dateFormat = '%Y-%m';
    dateField = { $dateToString: { format: dateFormat, date: '$timestamp' } };
  }
  
  return [
    {
      $group: {
        _id: dateField,
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        count: 1
      }
    }
  ];
};

/**
 * Format date for display
 * 
 * @param date Date to format
 * @param format Format string
 * @returns Formatted date string
 */
export const formatDate = (date: Date, format: string = 'YYYY-MM-DD'): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * Get date range for a period
 * 
 * @param period Period string (e.g., '30d', '7d', '24h', '1y')
 * @returns Object with start and end dates
 */
export const getDateRangeForPeriod = (period: string): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  const startDate = new Date();
  
  // Parse period string
  const value = parseInt(period.slice(0, -1));
  const unit = period.slice(-1);
  
  switch (unit) {
    case 'h': // hours
      startDate.setHours(endDate.getHours() - value);
      break;
    case 'd': // days
      startDate.setDate(endDate.getDate() - value);
      break;
    case 'w': // weeks
      startDate.setDate(endDate.getDate() - (value * 7));
      break;
    case 'm': // months
      startDate.setMonth(endDate.getMonth() - value);
      break;
    case 'y': // years
      startDate.setFullYear(endDate.getFullYear() - value);
      break;
    default:
      // Default to 30 days if invalid period
      startDate.setDate(endDate.getDate() - 30);
  }
  
  return { startDate, endDate };
};
