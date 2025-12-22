import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const CITY_DATA = [
  { id: "1", name: "Adelaide, SA, Australia", timezone: "Australia/Adelaide", lat: -34.929, long: 138.601 },
  { id: "2", name: "Agra, Uttar Pradesh, India", timezone: "Asia/Kolkata", lat: 27.18, long: 78.02 },
  { id: "3", name: "Ahmedabad, Gujarat, India", timezone: "Asia/Kolkata", lat: 23.03, long: 72.58 },
  { id: "4", name: "Aligarh, Uttar Pradesh, India", timezone: "Asia/Kolkata", lat: 27.88, long: 78.08 },
  { id: "5", name: "Allahabad, Uttar Pradesh, India", timezone: "Asia/Kolkata", lat: 25.45, long: 81.85 },
  { id: "6", name: "Amravati, Maharashtra, India", timezone: "Asia/Kolkata", lat: 20.9258, long: 77.7647 },
  { id: "7", name: "Amritsar, Punjab, India", timezone: "Asia/Kolkata", lat: 31.64, long: 74.86 },
  { id: "8", name: "Anand, Gujarat, India", timezone: "Asia/Kolkata", lat: 22.556, long: 72.951 },
  { id: "9", name: "Ankleshwar, Gujarat, India", timezone: "Asia/Kolkata", lat: 21.6, long: 73 },
  { id: "10", name: "Antwerp, Belgium", timezone: "Europe/Brussels", lat: 51.2167, long: 4.4 },
  { id: "11", name: "Atlanta, GA, United States", timezone: "America/New_York", lat: 33.755, long: -84.39 },
  { id: "12", name: "Aurangabad, Maharashtra, India", timezone: "Asia/Kolkata", lat: 19.88, long: 75.32 },
  { id: "13", name: "Austin, TX, United States", timezone: "America/Chicago", lat: 30.25, long: -97.75 },
  { id: "14", name: "Baltimore, MD, United States", timezone: "America/New_York", lat: 39.2833, long: -76.6167 },
  { id: "15", name: "Bangalore, Karnataka, India", timezone: "Asia/Kolkata", lat: 12.9667, long: 77.5667 },
  { id: "16", name: "Bangkok, Thailand", timezone: "Asia/Bangkok", lat: 13.75, long: 100.4667 },
  { id: "17", name: "Barcelona, Catalonia, Spain", timezone: "Europe/Madrid", lat: 41.3833, long: 2.1833 },
  { id: "18", name: "Bareilly, Uttar Pradesh, India", timezone: "Asia/Kolkata", lat: 28.364, long: 79.415 },
  { id: "19", name: "Beijing, Beijing, China", timezone: "Asia/Shanghai", lat: 39.9139, long: 116.3917 },
  { id: "20", name: "Berlin, Germany", timezone: "Europe/Berlin", lat: 52.5167, long: 13.3833 },
  { id: "21", name: "Bhiwandi, Maharashtra, India", timezone: "Asia/Kolkata", lat: 19.2967, long: 73.0631 },
  { id: "22", name: "Bhopal, Madhya Pradesh, India", timezone: "Asia/Kolkata", lat: 23.25, long: 77.4167 },
  { id: "23", name: "Bhubaneshwar, Orissa, India", timezone: "Asia/Kolkata", lat: 20.27, long: 85.84 },
  { id: "24", name: "Bikaner, Rajasthan, India", timezone: "Asia/Kolkata", lat: 28.0167, long: 73.3119 },
  { id: "25", name: "Birmingham, England, United Kingdom", timezone: "Europe/London", lat: 52.4831, long: -1.8936 },
  { id: "26", name: "Boston, MA, United States", timezone: "America/New_York", lat: 42.3581, long: -71.0636 },
  { id: "27", name: "Brisbane, QLD, Australia", timezone: "Australia/Brisbane", lat: -27.4679, long: 153.0278 },
  { id: "28", name: "Brussels, Belgium", timezone: "Europe/Brussels", lat: 50.85, long: 4.35 },
  { id: "29", name: "Buenos Aires, Argentina", timezone: "America/Argentina/Buenos_Aires", lat: -34.6033, long: -58.3817 },
  { id: "30", name: "Byron Bay, NSW, Australia", timezone: "Australia/Sydney", lat: -28.6431, long: 153.615 },
  { id: "31", name: "Cairo, Egypt", timezone: "Africa/Cairo", lat: 30.05, long: 31.2333 },
  { id: "32", name: "Cambridge, England, United Kingdom", timezone: "Europe/London", lat: 52.205, long: 0.119 },
  { id: "33", name: "Cape Town, WC, South Africa", timezone: "Africa/Johannesburg", lat: -33.9253, long: 18.4239 },
  { id: "34", name: "Casablanca, Morocco", timezone: "Africa/Casablanca", lat: 33.5333, long: -7.5833 },
  { id: "35", name: "Chandigarh, India", timezone: "Asia/Kolkata", lat: 30.75, long: 76.78 },
  { id: "36", name: "Charlotte, NC, United States", timezone: "America/New_York", lat: 35.2269, long: -80.8433 },
  { id: "37", name: "Chennai, Tamil Nadu, India", timezone: "Asia/Kolkata", lat: 13.0839, long: 80.27 },
  { id: "38", name: "Chicago, IL, United States", timezone: "America/Chicago", lat: 41.8369, long: -87.6847 },
  { id: "39", name: "Cleveland, OH, United States", timezone: "America/New_York", lat: 41.4822, long: -81.6697 },
  { id: "40", name: "Coffs Harbour, NSW, Australia", timezone: "Australia/Sydney", lat: -30.3022, long: 153.1189 },
  { id: "41", name: "Coimbatore, Tamil Nadu, India", timezone: "Asia/Kolkata", lat: 11.0183, long: 76.9725 },
  { id: "42", name: "Colombo, Western Province, Sri Lanka", timezone: "Asia/Colombo", lat: 6.9344, long: 79.8428 },
  { id: "43", name: "Columbus, OH, United States", timezone: "America/New_York", lat: 39.9833, long: -82.9833 },
  { id: "44", name: "Cuttack, Orissa, India", timezone: "Asia/Kolkata", lat: 20.27, long: 85.52 },
  { id: "45", name: "Dallas, TX, United States", timezone: "America/Chicago", lat: 32.7758, long: -96.7967 },
  { id: "46", name: "Dehradun, Uttarakhand, India", timezone: "Asia/Kolkata", lat: 30.318, long: 78.029 },
  { id: "47", name: "Delhi, India", timezone: "Asia/Kolkata", lat: 28.61, long: 77.23 },
  { id: "48", name: "Denver, CO, United States", timezone: "America/Denver", lat: 39.7392, long: -104.9847 },
  { id: "49", name: "Detroit, MI, United States", timezone: "America/Detroit", lat: 42.3314, long: -83.0458 },
  { id: "50", name: "Dhaka, Bangladesh", timezone: "Asia/Dhaka", lat: 23.7, long: 90.375 },
  { id: "51", name: "Dhanbad, Jharkhand, India", timezone: "Asia/Kolkata", lat: 23.8, long: 86.45 },
  { id: "52", name: "Dubai, United Arab Emirates", timezone: "Asia/Dubai", lat: 24.95, long: 55.3333 },
  { id: "53", name: "Durban, KZN, South Africa", timezone: "Africa/Johannesburg", lat: -29.8833, long: 31.05 },
  { id: "54", name: "East Brunswick, NJ, United States", timezone: "America/New_York", lat: 40.4262, long: -74.4182 },
  { id: "55", name: "Edison, NJ, United States", timezone: "America/New_York", lat: 40.504, long: -74.3494 },
  { id: "56", name: "Faisalabad, Punjab, Pakistan", timezone: "Asia/Karachi", lat: 31.418, long: 73.079 },
  { id: "57", name: "Faridabad, Haryana, India", timezone: "Asia/Kolkata", lat: 28.4211, long: 77.3078 },
  { id: "58", name: "Fort Worth, TX, United States", timezone: "America/Chicago", lat: 32.7574, long: -97.3332 },
  { id: "59", name: "Frankfurt, Hesse, Germany", timezone: "Europe/Berlin", lat: 50.1167, long: 8.6833 },
  { id: "60", name: "Fremont, CA, United States", timezone: "America/Los_Angeles", lat: 37.5483, long: -121.9886 },
  { id: "61", name: "Gandhidham, Gujarat, India", timezone: "Asia/Kolkata", lat: 23.08, long: 70.13 },
  { id: "62", name: "Gandhinagar, Gujarat, India", timezone: "Asia/Kolkata", lat: 23.22, long: 72.68 },
  { id: "63", name: "Ghaziabad, Uttar Pradesh, India", timezone: "Asia/Kolkata", lat: 28.67, long: 77.42 },
  { id: "64", name: "Girnar, Gujarat, India", timezone: "Asia/Kolkata", lat: 21.4947, long: 70.5056 },
  { id: "65", name: "Gorakhpur, Uttar Pradesh, India", timezone: "Asia/Kolkata", lat: 26.7588, long: 83.3697 },
  { id: "66", name: "Guwahati, Assam, India", timezone: "Asia/Kolkata", lat: 26.1833, long: 91.7333 },
  { id: "67", name: "Gwalior, Madhya Pradesh, India", timezone: "Asia/Kolkata", lat: 26.2215, long: 78.178 },
  { id: "68", name: "Havana, City of Havana, Cuba", timezone: "America/Havana", lat: 23.1333, long: -82.3833 },
  { id: "69", name: "Ho chi minh city (Saigon), Vietnam", timezone: "Asia/Ho_Chi_Minh", lat: 10.75, long: 106.6667 },
  { id: "70", name: "Hong kong", timezone: "Asia/Hong_Kong", lat: 22.267, long: 114.188 },
  { id: "71", name: "Houston, TX, United States", timezone: "America/Chicago", lat: 29.7628, long: -95.3831 },
  { id: "72", name: "Hubli, Karnataka, India", timezone: "Asia/Kolkata", lat: 15.3617, long: 75.085 },
  { id: "73", name: "Hyderabad, AP, India", timezone: "Asia/Kolkata", lat: 17.366, long: 78.476 },
  { id: "74", name: "Indianapolis, IN, United States", timezone: "America/Indiana/Indianapolis", lat: 39.791, long: -86.148 },
  { id: "75", name: "Indore, Madhya Pradesh, India", timezone: "Asia/Kolkata", lat: 22.7253, long: 75.8655 },
  { id: "76", name: "Irving, TX, United States", timezone: "America/Chicago", lat: 32.8117, long: -96.9508 },
  { id: "77", name: "Istanbul, Turkey", timezone: "Europe/Istanbul", lat: 41.0136, long: 28.955 },
  { id: "78", name: "Jabalpur, Madhya Pradesh, India", timezone: "Asia/Kolkata", lat: 23.1667, long: 79.9333 },
  { id: "79", name: "Jacksonville", timezone: "America/New_York", lat: 30.3369, long: -81.6614 },
  { id: "80", name: "Jaipur, Rajasthan, India", timezone: "Asia/Kolkata", lat: 26.926, long: 75.8235 },
  { id: "81", name: "Jakarta, Indonesia", timezone: "Asia/Jakarta", lat: -6.2, long: 106.8167 },
  { id: "82", name: "Jalandhar, Punjab, India", timezone: "Asia/Kolkata", lat: 31.326, long: 75.576 },
  { id: "83", name: "Jammu, India", timezone: "Asia/Kolkata", lat: 34.083656, long: 74.797371 },
  { id: "84", name: "Jamnagar, Gujarat, India", timezone: "Asia/Kolkata", lat: 22.47, long: 70.07 },
  { id: "85", name: "Jamshedpur, Jharkhand, India", timezone: "Asia/Kolkata", lat: 22.8, long: 86.3 },
  { id: "86", name: "Jeddah, Makkah, Saudi Arabia", timezone: "Asia/Riyadh", lat: 21.5433, long: 39.1728 },
  { id: "87", name: "Jodhpur, Rajasthan, India", timezone: "Asia/Kolkata", lat: 26.28, long: 73.02 },
  { id: "88", name: "Johannesburg, GP, South Africa", timezone: "Africa/Johannesburg", lat: -26.2044, long: 28.0456 },
  { id: "89", name: "Kabul, Afghanistan", timezone: "Asia/Kabul", lat: 34.5333, long: 69.1667 },
  { id: "90", name: "Kalyan, Maharashtra, India", timezone: "Asia/Kolkata", lat: 19.2373, long: 73.1304 },
  { id: "91", name: "Kanpur, Uttar Pradesh, India", timezone: "Asia/Kolkata", lat: 26.4607, long: 80.3334 },
  { id: "92", name: "Karachi, Sindh, Pakistan", timezone: "Asia/Karachi", lat: 24.86, long: 67.01 },
  { id: "93", name: "Khambhat, Gujarat, India", timezone: "Asia/Kolkata", lat: 22.3, long: 72.62 },
  { id: "94", name: "Kinshasa, Democratic Republic of the Congo", timezone: "Africa/Kinshasa", lat: -4.325, long: 15.3222 },
  { id: "95", name: "Kobe, Hyogo, Japan", timezone: "Asia/Tokyo", lat: 34.69, long: 135.1956 },
  { id: "96", name: "Kochi, Kerala, India", timezone: "Asia/Kolkata", lat: 9.97, long: 76.28 },
  { id: "97", name: "Kolkata, West Bengal, India", timezone: "Asia/Kolkata", lat: 22.5667, long: 88.3667 },
  { id: "98", name: "Kota, Rajasthan, India", timezone: "Asia/Kolkata", lat: 25.18, long: 75.83 },
  { id: "99", name: "Kuala Lumpur, KL, Malaysia", timezone: "Asia/Kuala_Lumpur", lat: 3.1357, long: 101.688 },
  { id: "100", name: "Kutch, Gujarat, India", timezone: "Asia/Kolkata", lat: 23.915, long: 70.367 },
  { id: "101", name: "Lahore, Punjab, Pakistan", timezone: "Asia/Karachi", lat: 31.5497, long: 74.3436 },
  { id: "102", name: "Las vegas, NV, United States", timezone: "America/Los_Angeles", lat: 36.1215, long: -115.1739 },
  { id: "103", name: "Lisbon, Portugal", timezone: "Europe/Lisbon", lat: 38.7138, long: -9.1394 },
  { id: "104", name: "London, England, United Kingdom", timezone: "Europe/London", lat: 51.5072, long: -0.1275 },
  { id: "105", name: "Los Angeles, CA, United States", timezone: "America/Los_Angeles", lat: 34.05, long: -118.25 },
  { id: "106", name: "Louisville, KY, United States", timezone: "America/New_York", lat: 38.25, long: -85.7667 },
  { id: "107", name: "Lucknow, Uttar Pradesh, India", timezone: "Asia/Kolkata", lat: 26.847, long: 80.947 },
  { id: "108", name: "Ludhiana, Punjab, India", timezone: "Asia/Kolkata", lat: 30.91, long: 75.85 },
  { id: "109", name: "Madrid, Spain", timezone: "Europe/Madrid", lat: 40.4, long: -3.6833 },
  { id: "110", name: "Madurai, Tamil Nadu, India", timezone: "Asia/Kolkata", lat: 9.9197, long: 78.1194 },
  { id: "111", name: "Mahudi, Gujarat, India", timezone: "Asia/Kolkata", lat: 23.4833, long: 72.7833 },
  { id: "112", name: "Manchester, England, United Kingdom", timezone: "Europe/London", lat: 53.4667, long: -2.2333 },
  { id: "113", name: "Mangalore, Karnataka, India", timezone: "Asia/Kolkata", lat: 12.87, long: 74.88 },
  { id: "114", name: "Manila, Philippines", timezone: "Asia/Manila", lat: 14.5995124, long: 120.9842195 },
  { id: "115", name: "Meerut, Uttar Pradesh, India", timezone: "Asia/Kolkata", lat: 28.99, long: 77.7 },
  { id: "116", name: "Melbourne, VIC, Australia", timezone: "Australia/Melbourne", lat: -37.8136, long: 144.9631 },
  { id: "117", name: "Memphis, TN, United States", timezone: "America/Chicago", lat: 35.1174, long: -89.9711 },
  { id: "118", name: "Mexico City, DF, Mexico", timezone: "America/Mexico_City", lat: 19.4333, long: -99.1333 },
  { id: "119", name: "Miami, FL, United States", timezone: "America/New_York", lat: 25.7877, long: -80.2241 },
  { id: "120", name: "Milan, Lombardy, Italy", timezone: "Europe/Rome", lat: 45.4667, long: 9.1667 },
  { id: "121", name: "Milwaukee, WI, United States", timezone: "America/Chicago", lat: 43.05, long: -87.95 },
  { id: "122", name: "Minneapolis, MN, United States", timezone: "America/Chicago", lat: 44.9833, long: -93.2667 },
  { id: "123", name: "Montréal, QC, Canada", timezone: "America/Montreal", lat: 45.5, long: -73.5667 },
  { id: "124", name: "Moradabad, Uttar Pradesh, India", timezone: "Asia/Kolkata", lat: 28.83, long: 78.78 },
  { id: "125", name: "Moscow, Russia", timezone: "Europe/Moscow", lat: 55.75, long: 37.6167 },
  { id: "126", name: "Mount Abu, Rajasthan, India", timezone: "Asia/Kolkata", lat: 24.5925, long: 72.7083 },
  { id: "127", name: "Mumbai, Maharashtra, India", timezone: "Asia/Kolkata", lat: 18.975, long: 72.8258 },
  { id: "128", name: "Mysore, Karnataka, India", timezone: "Asia/Kolkata", lat: 12.3, long: 76.65 },
  { id: "129", name: "Nagpur, Maharashtra, India", timezone: "Asia/Kolkata", lat: 21.15, long: 79.09 },
  { id: "130", name: "Nairobi, Kenya", timezone: "Africa/Nairobi", lat: -1.2833, long: 36.8167 },
  { id: "131", name: "Nashik, Maharashtra, India", timezone: "Asia/Kolkata", lat: 20, long: 73.78 },
  { id: "132", name: "Nashville-davidson, TN, United States", timezone: "America/Chicago", lat: 36.1667, long: -86.7833 },
  { id: "133", name: "Navi Mumbai, Maharashtra, India", timezone: "Asia/Kolkata", lat: 19.02, long: 73.02 },
  { id: "134", name: "Navsari, Gujarat, India", timezone: "Asia/Kolkata", lat: 20.9491, long: 72.9136 },
  { id: "135", name: "New Delhi, Delhi, India", timezone: "Asia/Kolkata", lat: 28.6139, long: 77.2089 },
  { id: "136", name: "New York, NY, United States", timezone: "America/New_York", lat: 40.7127, long: -74.0059 },
  { id: "137", name: "Noida, Uttar Pradesh, India", timezone: "Asia/Kolkata", lat: 28.57, long: 77.32 },
  { id: "138", name: "Oklahoma City, OK, United States", timezone: "America/Chicago", lat: 35.4822, long: -97.535 },
  { id: "139", name: "Osaka, Japan", timezone: "Asia/Tokyo", lat: 34.6939, long: 135.5022 },
  { id: "140", name: "Palitana, Gujarat, India", timezone: "Asia/Kolkata", lat: 21.52, long: 71.83 },
  { id: "141", name: "Paris, Île-de-France, France", timezone: "Europe/Paris", lat: 48.8567, long: 2.3508 },
  { id: "142", name: "Patna, Bihar, India", timezone: "Asia/Kolkata", lat: 25.611, long: 85.144 },
  { id: "143", name: "Philadelphia, PA, United States", timezone: "America/New_York", lat: 39.95, long: -75.1667 },
  { id: "144", name: "Phoenix, AZ, United States", timezone: "America/Phoenix", lat: 33.45, long: -112.0667 },
  { id: "145", name: "Portland, OR, United States", timezone: "America/Los_Angeles", lat: 45.52, long: -122.6819 },
  { id: "146", name: "Pune, Maharashtra, India", timezone: "Asia/Kolkata", lat: 18.5203, long: 73.8567 },
  { id: "147", name: "Raipur, Chhattisgarh, India", timezone: "Asia/Kolkata", lat: 21.14, long: 81.38 },
  { id: "148", name: "Rajkot, Gujarat, India", timezone: "Asia/Kolkata", lat: 22.3, long: 70.7833 },
  { id: "149", name: "Ranakpur, Rajasthan, India", timezone: "Asia/Kolkata", lat: 25.135, long: 73.447 },
  { id: "150", name: "Ranchi, Jharkhand, India", timezone: "Asia/Kolkata", lat: 23.35, long: 85.33 },
  { id: "151", name: "Rawalpindi, Punjab, Pakistan", timezone: "Asia/Karachi", lat: 33.6, long: 73.0333 },
  { id: "152", name: "Rio de Janeiro, RJ, Brazil", timezone: "America/Sao_Paulo", lat: -22.9083, long: -43.1964 },
  { id: "153", name: "Riyadh, Saudi Arabia", timezone: "Asia/Riyadh", lat: 24.6333, long: 46.7167 },
  { id: "154", name: "Rome, Latium, Italy", timezone: "Europe/Rome", lat: 41.9, long: 12.5 },
  { id: "155", name: "Sacramento, CA, United States", timezone: "America/Los_Angeles", lat: 38.5556, long: -121.4689 },
  { id: "156", name: "Verapaz, San Vicente, El Salvador", timezone: "America/El_Salvador", lat: 13.6689, long: -88.8661 },
  { id: "157", name: "San Diego, CA, United States", timezone: "America/Los_Angeles", lat: 32.715, long: -117.1625 },
  { id: "158", name: "San Francisco, CA, United States", timezone: "America/Los_Angeles", lat: 37.7833, long: -122.4167 },
  { id: "159", name: "San Jose, CA, United States", timezone: "America/Los_Angeles", lat: 37.3333, long: -121.9 },
  { id: "160", name: "Santa Clara, CA, United States", timezone: "America/Los_Angeles", lat: 37.3544, long: -121.9692 },
  { id: "161", name: "Santiago, Chile", timezone: "America/Santiago", lat: -33.45, long: -70.6667 },
  { id: "162", name: "São Paulo, SP, Brazil", timezone: "America/Sao_Paulo", lat: -23.55, long: -46.6333 },
  { id: "163", name: "Seattle, WA, United States", timezone: "America/Los_Angeles", lat: 47.6097, long: -122.3331 },
  { id: "164", name: "Seoul, South Korea", timezone: "Asia/Seoul", lat: 37.5667, long: 126.9781 },
  { id: "165", name: "Shanghai, China", timezone: "Asia/Shanghai", lat: 31.2, long: 121.5 },
  { id: "166", name: "Shankheshwar, Patan, India", timezone: "Asia/Kolkata", lat: 23.3, long: 71.47 },
  { id: "167", name: "Shenzhen, Guangdong, China", timezone: "Asia/Shanghai", lat: 22.55, long: 114.1 },
  { id: "168", name: "Shravanabelagola, Karnataka, India", timezone: "Asia/Kolkata", lat: 12.859, long: 76.484 },
  { id: "169", name: "Singapore", timezone: "Asia/Singapore", lat: 1.3, long: 103.8 },
  { id: "170", name: "Solapur, Maharashtra, India", timezone: "Asia/Kolkata", lat: 17.68, long: 75.92 },
  { id: "171", name: "Srinagar, Jammu and Kashmir, India", timezone: "Asia/Kolkata", lat: 34.0016247, long: 74.7627016 },
  { id: "172", name: "St Louis, MO, United States", timezone: "America/Chicago", lat: 38.6272, long: -90.1978 },
  { id: "173", name: "Stockholm, Stockholm, Sweden", timezone: "Europe/Stockholm", lat: 59.3294, long: 18.0686 },
  { id: "174", name: "Surat, Gujarat, India", timezone: "Asia/Kolkata", lat: 21.17, long: 72.83 },
  { id: "175", name: "Suva, Fiji", timezone: "Pacific/Fiji", lat: -18.1416, long: 178.4419 },
  { id: "176", name: "Sydney, NSW, Australia", timezone: "Australia/Sydney", lat: -33.86, long: 151.2094 },
  { id: "177", name: "Taipei, Taiwan", timezone: "Asia/Taipei", lat: 25.0333, long: 121.6333 },
  { id: "178", name: "Tampa, FL, United States", timezone: "America/New_York", lat: 27.971, long: -82.465 },
  { id: "179", name: "Tehran, Iran", timezone: "Asia/Tehran", lat: 35.6961, long: 51.4231 },
  { id: "180", name: "Tel aviv-yafo, Israel", timezone: "Asia/Jerusalem", lat: 32.0833, long: 34.8 },
  { id: "181", name: "Thane, Maharashtra, India", timezone: "Asia/Kolkata", lat: 19.1724, long: 72.957 },
  { id: "182", name: "Thiruvananthapuram, Kerala, India", timezone: "Asia/Kolkata", lat: 8.4875, long: 76.9525 },
  { id: "183", name: "Tokyo, Japan", timezone: "Asia/Tokyo", lat: 35.6895, long: 139.6917 },
  { id: "184", name: "Toronto, ON, Canada", timezone: "America/Toronto", lat: 43.7, long: -79.4 },
  { id: "185", name: "Udaipur, Rajasthan, India", timezone: "Asia/Kolkata", lat: 24.58, long: 73.68 },
  { id: "186", name: "Vadodara, Gujarat, India", timezone: "Asia/Kolkata", lat: 22.3, long: 73.2003 },
  { id: "187", name: "Vancouver, BC, Canada", timezone: "America/Vancouver", lat: 49.25, long: -123.1 },
  { id: "188", name: "Varanasi, Uttar Pradesh, India", timezone: "Asia/Kolkata", lat: 25.282, long: 82.9563 },
  { id: "189", name: "Vasai, Maharashtra, India", timezone: "Asia/Kolkata", lat: 19.47, long: 72.8 },
  { id: "190", name: "Vellore, Tamil Nadu, India", timezone: "Asia/Kolkata", lat: 12.9202, long: 79.1333 },
  { id: "191", name: "Vijayawada, AP, India", timezone: "Asia/Kolkata", lat: 16.5083, long: 80.6417 },
  { id: "192", name: "Visakhapatnam, AP, India", timezone: "Asia/Kolkata", lat: 17.6883, long: 83.2186 },
  { id: "193", name: "Warsaw, Masovian, Poland", timezone: "Europe/Warsaw", lat: 52.2333, long: 21.0167 },
  { id: "194", name: "Washington, United States", timezone: "America/Los_Angeles", lat: 47.5, long: -120.5 },
  { id: "195", name: "Wembley, England, United Kingdom", timezone: "Europe/London", lat: 51.556, long: -0.3042 },
  { id: "196", name: "Westborough, MA, United States", timezone: "America/New_York", lat: 42.2694, long: -71.6167 },
  { id: "197", name: "Wollongong, NSW, Australia", timezone: "Australia/Sydney", lat: -34.4331, long: 150.8831 },
  { id: "198", name: "Omdurman, Sudan", timezone: "Africa/Khartoum", lat: 15.6445, long: 32.4777 },
];

const CityItem = ({ city, onPress }) => (
  <TouchableOpacity style={styles.cityItem} onPress={onPress}>
    <Text style={styles.cityText}>{city}</Text>
  </TouchableOpacity>
);

const CitySelectionScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");

  const filteredData = CITY_DATA.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCitySelect = async (city) => {
    try {
      await AsyncStorage.setItem('selectedCityData', JSON.stringify(city));
      await AsyncStorage.setItem('selectedCity', city.city);
    } catch (e) {
      // ignore storage error and continue navigation
    }
    // Replace the current screen with Home
    navigation.replace('Home', { city: city.city });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={styles.header.backgroundColor} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Location</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#A0A0A0"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <Text style={styles.listHeader}>Cities</Text>
        )}
        renderItem={({ item }) => (
          <CityItem
            city={item.name}
            onPress={() => handleCitySelect(item)}
          />
        )}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#9E1B17",
  },
  header: {
    backgroundColor: "transparent",
    height: 50,
    justifyContent: "center",
    marginTop: 50,
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  searchContainer: {
    backgroundColor: "#9E1B17",
    paddingHorizontal: 15,
    paddingBottom: 5,
  },
  searchInput: {
    backgroundColor: "transparent",
    color: "white",
    fontSize: 16,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF80",
  },
  listHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#9E1B17",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  cityItem: {
    backgroundColor: "#9E1B17",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#FFFFFF40",
  },
  cityText: {
    fontSize: 16,
    color: "white",
  },
  list: {
    flex: 1,
    backgroundColor: "#9E1B17",
  }
});

export default CitySelectionScreen;