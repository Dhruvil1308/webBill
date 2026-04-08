export const config = {
  hotelId: process.env.NEXT_PUBLIC_HOTEL_ID || '',
};

export const getHotelId = () => {
  if (!config.hotelId) {
    console.warn('NEXT_PUBLIC_HOTEL_ID is not defined in environment variables');
  }
  return config.hotelId;
};
