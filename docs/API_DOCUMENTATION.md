# VJSS Mobile App - API Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Endpoints](#endpoints)
   - [Calendar Data](#1-calendar-data)
   - [Kalyanak Events](#2-kalyanak-events)
   - [Daily Events](#3-daily-events)
   - [Home Screen Data](#4-home-screen-data)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Versioning](#versioning)
9. [Testing](#testing)

## Introduction
This document outlines the API specifications for the VJSS (Vibrant Jain Spiritual Services) mobile application. The API will serve as the backend for the app, providing calendar data, events, and other religious information for the Jain community.

## Authentication
```http
Authorization: Bearer <token>
```
- All endpoints require authentication except where noted
- Include the JWT token in the Authorization header

## Base URL
```
https://api.vjss.com/v1
```

## Endpoints

### 1. Calendar Data
Get calendar data for a date range.

```http
GET /calendar?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

#### Query Parameters
| Parameter  | Type   | Required | Description                    |
|------------|--------|----------|--------------------------------|
| start_date | string | Yes      | Start date in YYYY-MM-DD format |
| end_date   | string | Yes      | End date in YYYY-MM-DD format   |

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "gregorian_date": "2025-12-25",
      "jain_month": "Magshar",
      "jain_paksha": "shukla",
      "jain_date": "Saptami",
      "jain_date_full": "Magshar Shukla Saptami",
      "is_holiday": 1
    }
  ]
}
```

### 2. Kalyanak Events
Get all Kalyanak events.

```http
GET /kalyanak
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tirthankar_name": "Lord Mahavira",
      "event_name": "Janma Kalyanak",
      "jain_date": "Chaitra Shukla Trayodashi"
    }
  ]
}
```

### 3. Daily Events
Get events for a specific date.

```http
GET /events?date=YYYY-MM-DD
```

#### Query Parameters
| Parameter | Type   | Required | Description                   |
|-----------|--------|----------|-------------------------------|
| date      | string | Yes      | Date in YYYY-MM-DD format     |

#### Response
```json
{
  "success": true,
  "data": {
    "kshay_events": [
      {
        "id": 1,
        "gregorian_date": "2025-12-25",
        "jain_date": "Magshar Shukla Saptami"
      }
    ],
    "kalyanak_events": [
      {
        "id": 1,
        "tirthankar_name": "Lord Mahavira",
        "event_name": "Janma Kalyanak",
        "jain_date": "Magshar Shukla Saptami"
      }
    ],
    "general_events": [
      {
        "id": 1,
        "gregorian_date": "2025-12-25",
        "description": "Christmas Day"
      }
    ]
  }
}
```

### 4. Home Screen Data
Get data for the home screen.

```http
GET /home?date=YYYY-MM-DD
```

#### Query Parameters
| Parameter | Type   | Required | Description                   |
|-----------|--------|----------|-------------------------------|
| date      | string | No       | Date in YYYY-MM-DD format. Defaults to today. |

#### Response
```json
{
  "success": true,
  "data": {
    "jain_date": {
      "day": 7,
      "month": "Magshar",
      "paksh": "shukla",
      "tithi": "Saptami",
      "is_holiday": true,
      "jain_date_full": "Magshar Shukla Saptami"
    },
    "sun_times": {
      "sunrise": "07:10 AM",
      "sunset": "05:45 PM"
    },
    "choghadiya": {
      "day": [
        {
          "name": "Amrit",
          "time": "07:10 AM - 08:40 AM",
          "color": "#4CAF50"
        }
      ],
      "night": []
    },
    "events": [
      {
        "type": "kalyanak",
        "title": "Lord Mahavira's Janma Kalyanak",
        "time": "All Day"
      }
    ]
  }
}
```

## Data Models

### Calendar
```typescript
interface Calendar {
  id: number;
  gregorian_date: string;  // YYYY-MM-DD
  jain_month: string;
  jain_paksha: 'shukla' | 'krishna';
  jain_date: string;
  jain_date_full: string;
  is_holiday: number;  // 0 or 1
}
```

### Kalyanak Event
```typescript
interface KalyanakEvent {
  id: number;
  tirthankar_name: string;
  event_name: string;
  jain_date: string;
}
```

### Kshay Event
```typescript
interface KshayEvent {
  id: number;
  gregorian_date: string;  // YYYY-MM-DD
  jain_date: string;
}
```

### General Event
```typescript
interface GeneralEvent {
  id: number;
  gregorian_date: string;  // YYYY-MM-DD
  description: string;
}
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}  // Optional additional error details
  }
}
```

### Common Error Codes
| Status Code | Error Code          | Description                           |
|-------------|---------------------|---------------------------------------|
| 400         | INVALID_REQUEST     | Invalid request parameters            |
| 401         | UNAUTHORIZED        | Authentication required              |
| 403         | FORBIDDEN           | Insufficient permissions             |
| 404         | NOT_FOUND           | Resource not found                   |
| 429         | RATE_LIMIT_EXCEEDED | Too many requests                    |
| 500         | INTERNAL_ERROR      | Internal server error                |

## Rate Limiting
- 100 requests per minute per IP address
- Headers included in response:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets (UTC epoch seconds)

## Versioning
- API versioning is handled through the URL path (e.g., `/v1/endpoint`)
- Breaking changes require a new version number
- Deprecation notice will be provided for at least 3 months before removing an endpoint

## Testing
### Test Environment
```
https://api-staging.vjss.com/v1
```

### Test Data
- Use the following test dates for development:
  - 2025-12-25: Major holiday
  - 2025-01-01: New Year's Day
  - 2025-10-26: Diwali

### Test Cases
1. Verify all required fields are present in responses
2. Test date ranges spanning month/year boundaries
3. Test timezone handling
4. Verify error responses for invalid inputs
5. Test rate limiting

## Contact
For any questions or issues, please contact:
- Email: dev@vjss.com
- Slack: #vjss-dev-team
