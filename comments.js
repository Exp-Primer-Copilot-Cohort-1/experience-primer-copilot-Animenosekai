// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { randomBytes } = require('crypto');
const axios = require('axios');

// Create app
const app = express();

// Parse request body
app.use(bodyParser.json());

// Enable CORS
app.use(cors());

// Comments
const commentsByPostId = {};

// Get comments
app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

// Create comment
app.post('/posts/:id/comments', async (req, res) => {
  // Generate random id
  const commentId = randomBytes(4).toString('hex');

  // Get content from request body
  const { content } = req.body;

  // Get comments for post
  const comments = commentsByPostId[req.params.id] || [];

  // Add new comment
  comments.push({ id: commentId, content, status: 'pending' });

  // Update comments
  commentsByPostId[req.params.id] = comments;

  // Emit event
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: 'pending',
    },
  });

  // Send response
  res.status(201).send(comments);
});

// Receive events
app.post('/events', async (req, res) => {
  console.log('Event Received:', req.body.type);

  // Get comment
  const { type, data } = req.body;

  // Check if event is a comment moderation event
  if (type === 'CommentModerated') {
    // Get comment
    const { id, postId, status, content } = data;

    // Get comments for post
    const comments = commentsByPostId[postId];

    // Find comment
    const comment = comments.find((comment) => {
      return comment.id === id;
    });

    // Update comment status
    comment.status = status;

    // Emit event
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data: {
        id,
        postId,
        status,
        content,
      },
    });
  }