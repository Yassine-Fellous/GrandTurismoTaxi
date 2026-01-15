import { Booking } from '@/types/booking';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize bookings file if it doesn't exist
if (!fs.existsSync(BOOKINGS_FILE)) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2));
}

export function getAllBookings(): Booking[] {
  try {
    const data = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading bookings:', error);
    return [];
  }
}

export function addBooking(booking: Booking): void {
  try {
    const bookings = getAllBookings();
    bookings.push(booking);
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (error) {
    console.error('Error adding booking:', error);
    throw error;
  }
}

export function updateBookingStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled'
): boolean {
  try {
    const bookings = getAllBookings();
    const index = bookings.findIndex((b) => b.id === id);
    
    if (index === -1) {
      return false;
    }

    bookings[index].status = status;
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
    return true;
  } catch (error) {
    console.error('Error updating booking:', error);
    return false;
  }
}

export function getBookingById(id: string): Booking | null {
  const bookings = getAllBookings();
  return bookings.find((b) => b.id === id) || null;
}
