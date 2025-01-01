/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const mongoose = require('mongoose');

// Connect to MongoDB with error handling
mongoose.connect(process.env.DB, {
  authSource: 'admin',
  dbName: 'personal_library'
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));
// Create Book Schema
const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: [String]
});

// Add virtual for commentcount
BookSchema.virtual('commentcount').get(function() {
  return this.comments.length;
});

// Ensure virtuals are included in JSON
BookSchema.set('toJSON', { virtuals: true });

const Book = mongoose.model('Book', BookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res) {
      try {
        const books = await Book.find({});
        res.json(books);
      } catch (err) {
        res.json([]);
      }
    })
    
    .post(async function (req, res) {
      const title = req.body.title;
      if (!title) {
        return res.send('missing required field title');
      }
      
      try {
        const book = new Book({ title });
        const savedBook = await book.save();
        res.json({ _id: savedBook._id, title: savedBook.title });
      } catch (err) {
        res.send('error adding book');
      }
    })
    
    .delete(async function(req, res) {
      try {
        await Book.deleteMany({});
        res.send('complete delete successful');
      } catch (err) {
        res.send('error deleting books');
      }
    });

  app.route('/api/books/:id')
    .get(async function (req, res) {
      try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.send('no book exists');
        res.json(book);
      } catch (err) {
        res.send('no book exists');
      }
    })
    
    .post(async function(req, res) {
      const { comment } = req.body;
      if (!comment) {
        return res.send('missing required field comment');
      }
      
      try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.send('no book exists');
        
        book.comments.push(comment);
        await book.save();
        res.json(book);
      } catch (err) {
        res.send('no book exists');
      }
    })
    
    .delete(async function(req, res) {
      try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) return res.send('no book exists');
        res.send('delete successful');
      } catch (err) {
        res.send('no book exists');
      }
    });
};