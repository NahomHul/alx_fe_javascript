const API_URL = 'https://jsonplaceholder.typicode.com/posts'; // Mock API URL
let quotes = JSON.parse(localStorage.getItem('quotes')) || [];

// Fetch initial quotes from the server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const serverQuotes = data.map(item => ({
            text: item.title, // Using title as quote text
            category: 'General' // Default category for mock data
        }));

        handleDataSync(serverQuotes);
    } catch (error) {
        console.error('Error fetching quotes:', error);
    }
}

// Handle syncing between local and server quotes
function handleDataSync(serverQuotes) {
    let isNewQuoteAdded = false; // Flag to track if new quotes were added

    // Simple conflict resolution: server data takes precedence
    serverQuotes.forEach(serverQuote => {
        const existingQuote = quotes.find(q => q.text === serverQuote.text);
        if (!existingQuote) {
            quotes.push(serverQuote); // Add new quote
            isNewQuoteAdded = true; // Mark that a new quote was added
        }
    });
    
    if (isNewQuoteAdded) {
        notifyUser("Quotes synced with server!");
    }

    saveQuotes();
}

// Add quote and sync with server
async function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;

    if (newQuoteText && newQuoteCategory) {
        const newQuote = { text: newQuoteText, category: newQuoteCategory };
        quotes.push(newQuote);
        saveQuotes();
        await postQuoteToServer(newQuote);
        populateCategories();
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        alert('Quote added successfully!');
    } else {
        alert('Please fill in both fields.');
    }
}

// Simulate posting a new quote to the server
async function postQuoteToServer(quote) {
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quote)
        });
    } catch (error) {
        console.error('Error posting quote:', error);
    }
}

function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = [...new Set(quotes.map(q => q.category))];

    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    const lastCategory = localStorage.getItem('lastSelectedCategory') || 'all';
    categoryFilter.value = lastCategory;
    filterQuotes();
}

function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    localStorage.setItem('lastSelectedCategory', selectedCategory);

    showRandomQuote(); // Update displayed quote based on selected filter
}

function getFilteredQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    return selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);
}

async function syncQuotes() {
    await fetchQuotesFromServer();
}

// Periodically check for updates from the server
setInterval(syncQuotes, 30000); // Check every 30 seconds

// Notify user of updates
function notifyUser(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.backgroundColor = 'yellow';
    notification.style.padding = '10px';
    notification.style.margin = '10px 0';
    document.body.prepend(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Create initial quotes and categories when the page loads
fetchQuotesFromServer();
populateCategories();

// Event listener for showing a new quote
document.getElementById('newQuote').addEventListener('click', showRandomQuote);