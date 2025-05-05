const router = require('express').Router();
const Snippet = require('../models/Snippet');

// Get all snippets for user
router.get('/', async (req, res) => {
  try {
    // Only fetch snippets belonging to the authenticated user
    const snippets = await Snippet.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .exec();
    res.json(snippets);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching snippets' });
  }
});

// Create snippet
router.post('/', async (req, res) => {
  try {
    const { title, code, language, description, tags } = req.body;

    if (!title || !code || !language) {
      return res.status(400).json({ 
        message: 'Title, code, and language are required' 
      });
    }

    // Always associate snippet with the authenticated user
    const snippet = new Snippet({
      title,
      code,
      language,
      description,
      tags: tags || [],
      user: req.userId  // This ensures the snippet belongs to the current user
    });

    await snippet.save();
    res.status(201).json(snippet);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error creating snippet',
      error: err.message 
    });
  }
});

// Delete snippet - with ownership verification
router.delete('/:id', async (req, res) => {
  try {
    // First find the snippet and verify ownership
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      user: req.userId  // This ensures users can only delete their own snippets
    });

    if (!snippet) {
      return res.status(404).json({ 
        message: 'Snippet not found or you do not have permission to delete it' 
      });
    }

    await Snippet.deleteOne({ _id: req.params.id });
    res.json({ message: 'Snippet deleted successfully' });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error deleting snippet',
      error: err.message 
    });
  }
});

// Update snippet - with ownership verification
router.put('/:id', async (req, res) => {
  try {
    const { title, code, language, description, tags } = req.body;

    // First verify ownership
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!snippet) {
      return res.status(404).json({ 
        message: 'Snippet not found or you do not have permission to update it' 
      });
    }

    const updatedSnippet = await Snippet.findByIdAndUpdate(
      req.params.id,
      {
        title,
        code,
        language,
        description,
        tags
      },
      { new: true }
    );

    res.json(updatedSnippet);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error updating snippet',
      error: err.message 
    });
  }
});

// Toggle bookmark status
router.patch('/:id/bookmark', async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!snippet) {
      return res.status(404).json({ 
        message: 'Snippet not found or you do not have permission to update it' 
      });
    }

    // Update bookmark status based on request body
    if (req.body.isBookmarked !== undefined) {
      snippet.isBookmarked = req.body.isBookmarked;
    } else {
      // If no status provided, toggle the current status
      snippet.isBookmarked = !snippet.isBookmarked;
    }

    await snippet.save();
    res.json(snippet);
  } catch (err) {
    console.error('Error updating bookmark:', err);
    res.status(500).json({ 
      message: 'Error updating bookmark',
      error: err.message 
    });
  }
});

// Toggle star status
router.patch('/:id/star', async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!snippet) {
      return res.status(404).json({ 
        message: 'Snippet not found or you do not have permission to update it' 
      });
    }

    snippet.isStarred = !snippet.isStarred;
    await snippet.save();
    res.json(snippet);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error updating star',
      error: err.message 
    });
  }
});

module.exports = router; 