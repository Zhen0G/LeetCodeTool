# LeetCode Tracker

A Next.js application that helps you manage and track your progress with LeetCode problems.

## Features

- **Problem Management**: Add, edit, and delete LeetCode problems
- **Progress Tracking**: Record problem status, attempts, and completion time
- **Notes System**: Add solution notes and thought processes for each problem
- **Problem Sets**: Create and manage custom sets of problems for targeted practice
- **Random Practice**: Randomly select problems to practice based on sets or difficulty
- **Statistics Dashboard**: Visualize your progress with heatmaps and charts
- **Tag Classification**: View problems organized by tags and categories

## Deployment Guide

### Requirements

- Node.js 18+
- SQLite (default) or MongoDB database

### Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/leetcode-tracker.git
   cd leetcode-tracker
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables
   Create a `.env.local` file and add database configuration:
   
   For SQLite (default):
   ```
   DB_TYPE=sqlite
   DB_PATH=./data/leetcode.db
   ```
   
   For MongoDB (optional):
   ```
   DB_TYPE=mongodb
   MONGODB_URI=mongodb://localhost:27017/leetcode-tracker
   ```

4. Start the development server
   ```bash
   npm run dev
   ```
   The application will run at http://localhost:3000

### Production Deployment

1. Build the application
   ```bash
   npm run build
   ```

2. Start the production server
   ```bash
   npm run start
   ```

## API Documentation

### Problems API

#### Get all problems
- Request: `GET /api/problems`
- Response: List of all problems, sorted by problem ID
- Example:
  ```javascript
  fetch('/api/problems')
    .then(res => res.json())
    .then(data => console.log(data))
  ```

#### Add a new problem
- Request: `POST /api/problems`
- Request body:
  ```json
  {
    "id": 1,
    "title": "Two Sum",
    "difficulty": "Easy",
    "tags": ["Array", "Hash Table"],
    "link": "https://leetcode.com/problems/two-sum/"
  }
  ```
- Response: Information about the newly created problem
- Example:
  ```javascript
  fetch('/api/problems', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 1,
      title: "Two Sum",
      difficulty: "Easy", 
      tags: ["Array", "Hash Table"],
      link: "https://leetcode.com/problems/two-sum/"
    })
  }).then(res => res.json())
  ```

#### Get a single problem
- Request: `GET /api/problems/{id}`
- Response: Information about the problem with the specified ID
- Example:
  ```javascript
  fetch('/api/problems/1')
    .then(res => res.json())
    .then(data => console.log(data))
  ```

#### Update a problem
- Request: `PATCH /api/problems/{id}`
- Request body:
  ```json
  {
    "status": "Solved",
    "duration": 600,
    "favorite": true,
    "note": "Solution approach: Used a hash table to store traversed elements..."
  }
  ```
- Response: Information about the updated problem
- Example:
  ```javascript
  fetch('/api/problems/1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: "Solved",
      duration: 600,
      favorite: true
    })
  }).then(res => res.json())
  ```

#### Delete a problem
- Request: `DELETE /api/problems/{id}`
- Response: Success message for deletion
- Example:
  ```javascript
  fetch('/api/problems/1', { method: 'DELETE' })
    .then(res => res.json())
    .then(data => console.log(data))
  ```

#### Get random problems
- Request: `GET /api/practice/random?count=5&set=123`
- Optional parameters: 
  - `count`: Number of problems to return (default: 1)
  - `set`: Problem set ID to select from
- Response: Random selected problem(s)
- Example:
  ```javascript
  fetch('/api/practice/random?count=5')
    .then(res => res.json())
    .then(data => console.log(data))
  ```

### Problem Sets API

#### Get all problem sets
- Request: `GET /api/sets`
- Response: List of all problem sets
- Example:
  ```javascript
  fetch('/api/sets')
    .then(res => res.json())
    .then(data => console.log(data))
  ```

#### Create a new problem set
- Request: `POST /api/sets`
- Request body:
  ```json
  {
    "name": "Dynamic Programming Problems",
    "description": "A collection of DP problems for practice",
    "problems": [70, 121, 198, 322, 518]
  }
  ```
- Response: The newly created problem set
- Example:
  ```javascript
  fetch('/api/sets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "Dynamic Programming Problems",
      description: "A collection of DP problems for practice",
      problems: [70, 121, 198, 322, 518]
    })
  }).then(res => res.json())
  ```

#### Get a problem set
- Request: `GET /api/sets/{id}`
- Response: Information about the specified problem set with full problem details
- Example:
  ```javascript
  fetch('/api/sets/1')
    .then(res => res.json())
    .then(data => console.log(data))
  ```

#### Update a problem set
- Request: `PATCH /api/sets/{id}`
- Request body:
  ```json
  {
    "name": "Updated Set Name",
    "description": "Updated description",
    "problems": [1, 2, 3, 4, 5]
  }
  ```
- Response: The updated problem set
- Example:
  ```javascript
  fetch('/api/sets/1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "Updated Set Name",
      description: "Updated description"
    })
  }).then(res => res.json())
  ```

#### Delete a problem set
- Request: `DELETE /api/sets/{id}`
- Response: Success message for deletion
- Example:
  ```javascript
  fetch('/api/sets/1', { method: 'DELETE' })
    .then(res => res.json())
    .then(data => console.log(data))
  ```

#### Add a problem to a set
- Request: `POST /api/sets/{id}/add`
- Request body:
  ```json
  {
    "problemId": 42
  }
  ```
- Response: The added problem information
- Example:
  ```javascript
  fetch('/api/sets/1/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemId: 42 })
  }).then(res => res.json())
  ```

#### Remove a problem from a set
- Request: `POST /api/sets/{id}/remove`
- Request body:
  ```json
  {
    "problemId": 42
  }
  ```
- Response: Success message
- Example:
  ```javascript
  fetch('/api/sets/1/remove', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemId: 42 })
  }).then(res => res.json())
  ```

### LeetCode API

#### Get problem information by ID
- Request: `GET /api/leetcode?id={id}`
- Response:
  ```json
  {
    "id": 1,
    "title": "Two Sum",
    "slug": "two-sum",
    "difficulty": "Easy",
    "link": "https://leetcode.com/problems/two-sum",
    "tags": ["Array", "Hash Table"]
  }
  ```
- Example:
  ```javascript
  fetch('/api/leetcode?id=1')
    .then(res => res.json())
    .then(data => console.log(data))
  ```

### Notes API

#### Get all notes
- Request: `GET /api/notes`
- Response: List of all notes, sorted by creation time (descending)
- Example:
  ```javascript
  fetch('/api/notes')
    .then(res => res.json())
    .then(data => console.log(data))
  ```

#### Create a new note
- Request: `POST /api/notes`
- Request body:
  ```json
  {
    "title": "Hash Table Techniques",
    "content": "When solving lookup problems, hash tables are a powerful tool..."
  }
  ```
- Response: Information about the newly created note
- Example:
  ```javascript
  fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: "Hash Table Techniques",
      content: "When solving lookup problems, hash tables are a powerful tool..."
    })
  }).then(res => res.json())
  ```

#### Get a single note
- Request: `GET /api/notes/{id}`
- Response: Information about the note with the specified ID
- Example:
  ```javascript
  fetch('/api/notes/1')
    .then(res => res.json())
    .then(data => console.log(data))
  ```

#### Update a note
- Request: `PATCH /api/notes/{id}`
- Request body:
  ```json
  {
    "title": "Hash Table and Two Pointer Techniques",
    "content": "Updated note content..."
  }
  ```
- Response: Information about the updated note
- Example:
  ```javascript
  fetch('/api/notes/1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: "Hash Table and Two Pointer Techniques",
      content: "Updated note content..."
    })
  }).then(res => res.json())
  ```

#### Delete a note
- Request: `DELETE /api/notes/{id}`
- Response: Success message for deletion
- Example:
  ```javascript
  fetch('/api/notes/1', { 
    method: 'DELETE' 
  }).then(res => res.json())
  ```

## License

MIT
