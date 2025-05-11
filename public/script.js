// This is a simplified version of the script that should work with VS Code Live Server

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Sample data
    const sampleNews = [
        {
            id: '1',
            title: 'Welcome to Our News Platform',
            content: 'This is a demonstration of our news management system. Administrators can create, edit, and delete news articles, while regular users can only view them.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: '2',
            title: 'How to Use Two-Factor Authentication',
            content: 'Two-factor authentication adds an extra layer of security to your account. After entering your password, you\'ll need to provide a verification code from your authenticator app.',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];
    
    // Initialize localStorage if needed
    if (!localStorage.getItem('newsItems')) {
        localStorage.setItem('newsItems', JSON.stringify(sampleNews));
    }
    
    // User credentials (for demo)
    const users = [
        { id: '1', username: 'admin', password: 'admin', isAdmin: true },
        { id: '2', username: 'user', password: 'user', isAdmin: false }
    ];
    
    // Function to show a section and hide others
    function showSection(sectionId) {
        console.log('Showing section:', sectionId);
        
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show the requested section
        const section = document.getElementById(sectionId + '-section');
        if (section) {
            section.classList.add('active');
        } else {
            console.error('Section not found:', sectionId);
        }
    }
    
    // Function to get news items from localStorage
    function getNewsItems() {
        const newsJson = localStorage.getItem('newsItems');
        return newsJson ? JSON.parse(newsJson) : [];
    }
    
    // Function to render news for regular users
    function loadNewsSection() {
        console.log('Loading news section');
        
        const newsContainer = document.getElementById('news-container');
        const news = getNewsItems();
        
        // Clear previous content
        newsContainer.innerHTML = '';
        
        if (news.length === 0) {
            newsContainer.innerHTML = '<div class="empty-message">No news articles available.</div>';
        } else {
            // Render each news item
            news.forEach(item => {
                const newsItem = document.createElement('div');
                newsItem.className = 'news-item';
                newsItem.innerHTML = `
                    <div class="news-item-header">
                        <h3>${escapeHtml(item.title)}</h3>
                        <p>Published on ${new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div class="news-item-content">
                        <p>${escapeHtml(item.content)}</p>
                    </div>
                `;
                
                newsContainer.appendChild(newsItem);
            });
        }
        
        showSection('news');
    }
    
    // Function to render news for admin dashboard
    function loadAdminDashboard() {
        console.log('Loading admin dashboard');
        
        const newsContainer = document.getElementById('admin-news-container');
        const news = getNewsItems();
        
        // Clear previous content
        newsContainer.innerHTML = '';
        
        if (news.length === 0) {
            newsContainer.innerHTML = '<div class="empty-message">No news articles available.</div>';
        } else {
            // Render each news item with admin controls
            news.forEach(item => {
                const newsItem = document.createElement('div');
                newsItem.className = 'news-item';
                newsItem.innerHTML = `
                    <div class="news-item-header">
                        <h3>${escapeHtml(item.title)}</h3>
                        <p>Published on ${new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div class="news-item-content">
                        <p>${escapeHtml(item.content)}</p>
                    </div>
                    <div class="news-item-actions">
                        <button class="btn btn-secondary edit-btn" data-id="${item.id}">Edit</button>
                        <button class="btn btn-danger delete-btn" data-id="${item.id}">Delete</button>
                    </div>
                `;
                
                newsContainer.appendChild(newsItem);
            });
            
            // Add event listeners for edit and delete buttons
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    loadEditNewsForm(id);
                });
            });
            
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this news item?')) {
                        deleteNewsItem(id);
                        loadAdminDashboard();
                    }
                });
            });
        }
        
        showSection('admin');
    }
    
    // Function to delete a news item
    function deleteNewsItem(id) {
        const news = getNewsItems();
        const updatedNews = news.filter(item => item.id !== id);
        localStorage.setItem('newsItems', JSON.stringify(updatedNews));
    }
    
    // Function to load the edit form for a news item
    function loadEditNewsForm(id) {
        const news = getNewsItems();
        const newsItem = news.find(item => item.id === id);
        
        if (!newsItem) {
            alert('News item not found');
            return;
        }
        
        const titleInput = document.getElementById('edit-news-title');
        const contentInput = document.getElementById('edit-news-content');
        const form = document.getElementById('edit-news-form');
        
        titleInput.value = newsItem.title;
        contentInput.value = newsItem.content;
        
        // Store the ID in the form for submission
        form.setAttribute('data-id', id);
        
        showSection('edit-news');
    }
    
    // Helper function to escape HTML
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Set up event listeners
    
    // Home page buttons
    document.getElementById('login-btn').onclick = function() {
        console.log('Login button clicked');
        showSection('login');
        return false; // Prevent default
    };
    
    document.getElementById('guest-btn').onclick = function() {
        loadNewsSection();
        return false; // Prevent default
    };
    
    // Login form
    document.getElementById('login-form').onsubmit = function(e) {
        e.preventDefault();
        console.log('Login form submitted');
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('login-error');
        
        // Find user
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            console.log('User authenticated:', user);
            
            if (user.isAdmin) {
                // Show 2FA form for admin
                document.getElementById('login-form').style.display = 'none';
                document.getElementById('twofa-form').style.display = 'block';
                document.getElementById('login-title').textContent = 'Two-Factor Authentication';
                document.getElementById('login-description').textContent = 'Enter the verification code from your authenticator app';
            } else {
                // Regular user login successful
                localStorage.setItem('currentUser', JSON.stringify({
                    id: user.id,
                    username: user.username,
                    isAdmin: user.isAdmin
                }));
                loadNewsSection();
            }
        } else {
            errorElement.textContent = 'Invalid username or password';
        }
        
        return false;
    };
    
    // 2FA form
    document.getElementById('twofa-form').onsubmit = function(e) {
        e.preventDefault();
        console.log('2FA form submitted');
        
        const code = document.getElementById('twoFactorCode').value;
        const errorElement = document.getElementById('twofa-error');
        
        // For demo, accept a specific code
        if (code === '123456') {
            // Get the username from the login form
            const username = document.getElementById('username').value;
            const user = users.find(u => u.username === username);
            
            localStorage.setItem('currentUser', JSON.stringify({
                id: user.id,
                username: user.username,
                isAdmin: user.isAdmin
            }));
            
            loadAdminDashboard();
            
            // Reset forms for next login
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('twofa-form').style.display = 'none';
            document.getElementById('login-title').textContent = 'Login';
            document.getElementById('login-description').textContent = 'Enter your credentials to access the platform';
            document.getElementById('login-form').reset();
            document.getElementById('twofa-form').reset();
        } else {
            errorElement.textContent = 'Invalid verification code';
        }
        
        return false;
    };
    
    // Back to home buttons
    document.getElementById('back-to-home').onclick = function() {
        showSection('home');
        return false;
    };
    
    document.getElementById('news-back-btn').onclick = function() {
        showSection('home');
        return false;
    };
    
    // Admin dashboard buttons
    document.getElementById('create-news-btn').onclick = function() {
        document.getElementById('create-news-form').reset();
        showSection('create-news');
        return false;
    };
    
    document.getElementById('admin-logout-btn').onclick = function() {
        localStorage.removeItem('currentUser');
        showSection('home');
        return false;
    };
    
    // Create news form
    document.getElementById('create-news-form').onsubmit = function(e) {
        e.preventDefault();
        console.log('Create news form submitted');
        
        const title = document.getElementById('news-title').value;
        const content = document.getElementById('news-content').value;
        const errorElement = document.getElementById('create-error');
        
        if (!title.trim() || !content.trim()) {
            errorElement.textContent = 'Title and content are required';
            return false;
        }
        
        // Create news item
        const news = getNewsItems();
        const newItem = {
            id: Date.now().toString(),
            title: title,
            content: content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        news.push(newItem);
        localStorage.setItem('newsItems', JSON.stringify(news));
        
        loadAdminDashboard();
        return false;
    };
    
    document.getElementById('create-cancel-btn').onclick = function() {
        loadAdminDashboard();
        return false;
    };
    
    // Edit news form
    document.getElementById('edit-news-form').onsubmit = function(e) {
        e.preventDefault();
        console.log('Edit news form submitted');
        
        const id = this.getAttribute('data-id');
        const title = document.getElementById('edit-news-title').value;
        const content = document.getElementById('edit-news-content').value;
        const errorElement = document.getElementById('edit-error');
        
        if (!title.trim() || !content.trim()) {
            errorElement.textContent = 'Title and content are required';
            return false;
        }
        
        // Update news item
        const news = getNewsItems();
        const index = news.findIndex(item => item.id === id);
        
        if (index !== -1) {
            news[index] = {
                ...news[index],
                title: title,
                content: content,
                updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem('newsItems', JSON.stringify(news));
        }
        
        loadAdminDashboard();
        return false;
    };
    
    document.getElementById('edit-cancel-btn').onclick = function() {
        loadAdminDashboard();
        return false;
    };
    
    // Check if user is already logged in
    const currentUserJson = localStorage.getItem('currentUser');
    if (currentUserJson) {
        const currentUser = JSON.parse(currentUserJson);
        if (currentUser.isAdmin) {
            loadAdminDashboard();
        } else {
            loadNewsSection();
        }
    }
    
    console.log('App initialized');
});