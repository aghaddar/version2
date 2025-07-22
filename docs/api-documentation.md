# API Documentation

This document provides details about the API endpoints used in the AnimePlus application. The application uses two separate APIs:

1. **Consumet API** - For anime data (running on port 3000)
2. **Backend API** - For authentication and comments (running on port 3001)

## Environment Configuration

The application uses the following environment variables to configure API URLs:

\`\`\`
NEXT_PUBLIC_API_BASE_URL=https://api-consumet-nu.vercel.app/  # Consumet API
NEXT_PUBLIC_BACKEND_URL=http://192.168.0.104:3001   # Backend API
\`\`\`

---

## Consumet API

The Consumet API provides anime data including search results, anime details, episodes, and video sources.

Base URL: `https://api-consumet-nu.vercel.app/`

### Search Anime

Searches for anime by title.

- **URL**: `/anime/animepahe/{query}`
- **Method**: `GET`
- **URL Parameters**: 
  - `query`: The search term (e.g., "one piece")

**Response**:
\`\`\`json
{
  "results": [
    {
      "id": "string",
      "title": "string",
      "image": "string",
      "releaseDate": "string",
      "type": "string"
    }
  ]
}
\`\`\`

**Example**:
\`\`\`javascript
// Search for "demon slayer"
const results = await fetch(`${API_BASE_URL}/demon%20slayer`).then(res => res.json());
\`\`\`

### Get Anime Info

Retrieves detailed information about a specific anime.

- **URL**: `/anime/animepahe/info/{id}`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: The anime ID

**Response**:
\`\`\`json
{
  "id": "string",
  "title": "string",
  "image": "string",
  "description": "string",
  "genres": ["string"],
  "status": "string",
  "type": "string",
  "releaseDate": "string",
  "totalEpisodes": 0,
  "episodes": [
    {
      "id": "string",
      "number": 0,
      "title": "string"
    }
  ],
  "recommendations": [
    {
      "id": "string",
      "title": "string",
      "image": "string",
      "type": "string",
      "releaseDate": "string"
    }
  ]
}
\`\`\`

**Example**:
\`\`\`javascript
// Get info for anime with ID "demon-slayer"
const animeInfo = await fetch(`${API_BASE_URL}/info/demon-slayer`).then(res => res.json());
\`\`\`

### Get Episode Sources

Retrieves video sources for a specific episode.

- **URL**: `/anime/animepahe/watch`
- **Method**: `GET`
- **Query Parameters**:
  - `episodeId`: The episode ID

**Response**:
\`\`\`json
{
  "sources": [
    {
      "url": "string",
      "isM3U8": boolean,
      "quality": "string"
    }
  ]
}
\`\`\`

**Example**:
\`\`\`javascript
// Get sources for episode with ID "demon-slayer-episode-1"
const sources = await fetch(`${API_BASE_URL}/watch?episodeId=demon-slayer-episode-1`).then(res => res.json());
\`\`\`

---

## Backend API

The Backend API handles user authentication and comments functionality.

Base URL: `http://192.168.0.104:3001`

### Authentication

#### Register User

Creates a new user account.

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
\`\`\`json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
\`\`\`

**Response**:
\`\`\`json
{
  "message": "string",
  "token": "string",
  "user": {
    "userID": 0,
    "username": "string",
    "email": "string",
    "avatarURL": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
\`\`\`

**Example**:
\`\`\`javascript
const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: "newuser",
    email: "user@example.com",
    password: "password123"
  }),
});
\`\`\`

#### Login User

Authenticates a user and returns a JWT token.

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
\`\`\`json
{
  "email": "string",
  "password": "string"
}
\`\`\`

**Response**:
\`\`\`json
{
  "message": "string",
  "token": "string",
  "user": {
    "userID": 0,
    "username": "string",
    "email": "string",
    "avatarURL": "string"
  }
}
\`\`\`

**Example**:
\`\`\`javascript
const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123"
  }),
});
\`\`\`

### Comments

#### Get Comments for Episode

Retrieves all comments for a specific episode.

- **URL**: `/api/comments/episode/{episodeId}`
- **Method**: `GET`
- **URL Parameters**:
  - `episodeId`: The episode ID

**Response**:
\`\`\`json
[
  {
    "id": "string",
    "userId": "string",
    "username": "string",
    "userAvatar": "string",
    "content": "string",
    "createdAt": "string",
    "likes": 0,
    "replies": [
      {
        "id": "string",
        "userId": "string",
        "username": "string",
        "userAvatar": "string",
        "content": "string",
        "createdAt": "string",
        "likes": 0
      }
    ]
  }
]
\`\`\`

**Example**:
\`\`\`javascript
const comments = await fetch(`${BACKEND_URL}/api/comments/episode/demon-slayer-episode-1`).then(res => res.json());
\`\`\`

#### Add Comment

Adds a new comment to an episode.

- **URL**: `/api/comments`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authorization**: Bearer Token
- **Request Body**:
\`\`\`json
{
  "episodeId": "string",
  "commentText": "string"
}
\`\`\`

**Response**:
\`\`\`json
{
  "id": "string",
  "userId": "string",
  "username": "string",
  "userAvatar": "string",
  "content": "string",
  "createdAt": "string",
  "likes": 0
}
\`\`\`

**Example**:
\`\`\`javascript
const newComment = await fetch(`${BACKEND_URL}/api/comments`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    episodeId: "demon-slayer-episode-1",
    commentText: "This episode was amazing!"
  }),
}).then(res => res.json());
\`\`\`

#### Reply to Comment

Adds a reply to an existing comment.

- **URL**: `/api/comments/{commentId}/reply`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authorization**: Bearer Token
- **URL Parameters**:
  - `commentId`: The ID of the comment to reply to
- **Request Body**:
\`\`\`json
{
  "commentText": "string"
}
\`\`\`

**Response**:
\`\`\`json
{
  "id": "string",
  "userId": "string",
  "username": "string",
  "userAvatar": "string",
  "content": "string",
  "createdAt": "string",
  "likes": 0
}
\`\`\`

**Example**:
\`\`\`javascript
const reply = await fetch(`${BACKEND_URL}/api/comments/123/reply`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    commentText: "I agree with your comment!"
  }),
}).then(res => res.json());
\`\`\`

#### Like Comment

Adds a like to a comment.

- **URL**: `/api/comments/{commentId}/like`
- **Method**: `POST`
- **Authorization**: Bearer Token
- **URL Parameters**:
  - `commentId`: The ID of the comment to like

**Response**: Status 200 OK if successful

**Example**:
\`\`\`javascript
const success = await fetch(`${BACKEND_URL}/api/comments/123/like`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`
  }
}).then(res => res.ok);
\`\`\`

#### Unlike Comment

Removes a like from a comment.

- **URL**: `/api/comments/{commentId}/unlike`
- **Method**: `POST`
- **Authorization**: Bearer Token
- **URL Parameters**:
  - `commentId`: The ID of the comment to unlike

**Response**: Status 200 OK if successful

**Example**:
\`\`\`javascript
const success = await fetch(`${BACKEND_URL}/api/comments/123/unlike`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`
  }
}).then(res => res.ok);
\`\`\`

#### Delete Comment

Deletes a comment.

- **URL**: `/api/comments/{commentId}`
- **Method**: `DELETE`
- **Authorization**: Bearer Token
- **URL Parameters**:
  - `commentId`: The ID of the comment to delete

**Response**: Status 200 OK if successful

**Example**:
\`\`\`javascript
const success = await fetch(`${BACKEND_URL}/api/comments/123`, {
  method: "DELETE",
  headers: {
    "Authorization": `Bearer ${token}`
  }
}).then(res => res.ok);
\`\`\`

---

## Error Handling

All API endpoints follow these error handling conventions:

1. **4xx Errors**: Client-side errors (e.g., invalid input, unauthorized)
   - 400: Bad Request
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not Found

2. **5xx Errors**: Server-side errors
   - 500: Internal Server Error

The application includes fallback mechanisms for when the API is unavailable:
- Mock data for anime content
- Cached data when possible
- Graceful degradation of features

## API Status Indicator

The application includes an API status indicator that checks if the backend API is online. This indicator:
- Appears in the bottom-right corner of the screen
- Shows green when the API is online
- Shows red when the API is offline
- Can be manually refreshed
- Can be dismissed by the user

---

## Development Notes

### Local Testing

For local development and testing:

1. Ensure both APIs are running:
   - Consumet API on port 3000
   - Backend API on port 3001
   - Frontend on port 8080

2. Use the provided `.env.local` file to configure the API URLs:
   \`\`\`
   NEXT_PUBLIC_API_BASE_URL=https://api-consumet-nu.vercel.app/
   NEXT_PUBLIC_BACKEND_URL=http://192.168.0.104:3001
   \`\`\`

### API Timeouts

The application implements timeout handling for API requests:
- 5-second timeout for comment fetching
- Fallback to mock data when APIs are unavailable
- Error states in UI components to inform users of issues
