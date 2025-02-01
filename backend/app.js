require('dotenv').config({ path: './backend/.env' });
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const upload = require('./config/multer-config');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/auth');
const authController = require('./controllers/authCOntroller');
const Blog = require('./models/Blogs');

const app = express();

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, '../assets')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(
    session({
        secret: process.env.SESSION_SECRET, 
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
    })
);

app.use('/api/auth', authRoutes);

app.get('/', async (req, res) => { 
    try {
        const blogs = await Blog.find();
        res.render('index', { title: 'Home', blogs });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'About Us' });
});

app.get('/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.render('blogs', { title: 'Blogs', blogs });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact Us' });
});
app.get('/blog-details/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).send('Blog not found');
        }
        res.render('blog-details', { title: blog.title, blog });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


app.post('/create-blogs', upload.single('image'), async (req, res) => {
    try {
        const { title, description, metaTitle, metaContent, metaDescription, metaKeywords, date } = req.body;
        const newBlog = new Blog({ 
            title, 
            description, 
            image: req.file.path, 
            date,
            metaTitle, 
            metaContent, 
            metaDescription, 
            metaKeywords: metaKeywords.split(',').map(keyword => keyword.trim()) // Convert metaKeywords to an array
        });
        await newBlog.save();
        res.redirect('/admin-dashboard');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/edit-blogs/:id', upload.single('image'), async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const { title, description, metaTitle, metaContent, metaDescription, metaKeywords, date } = req.body;
        const image = req.file ? req.file.path : blog.image;

        blog.title = title;
        blog.description = description;
        blog.image = image;
        blog.metaTitle = metaTitle;
        blog.metaContent = metaContent;
        blog.metaDescription = metaDescription;
        blog.metaKeywords = metaKeywords;
        blog.date = date;

        await blog.save();
        res.redirect('/admin-dashboard');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a blog
app.delete('/delete-blogs/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        const imagePublicId = blog.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(imagePublicId);

        await Blog.findByIdAndDelete(req.params.id);
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.get('/admin-dashboard', authMiddleware, async (req, res) => {
    try {
        const blogs = await Blog.find({});

        res.render('admin-dashboard', {
            title: 'Admin Dashboard',
            blogs: blogs
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching blogs');
    }
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Admin Login' });
});




app.get('/logout', authController.logout);




module.exports = app;