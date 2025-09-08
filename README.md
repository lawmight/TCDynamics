# TCDynamics - 30 Days of Python Learning Journey

A personal website documenting a 30-day Python learning journey with interactive progress tracking, contact forms, and a modern responsive design.

## 🚀 Features

### Frontend
- **Modern Responsive Design**: Beautiful gradient backgrounds and smooth animations
- **Interactive Progress Tracking**: Real-time progress bar showing learning journey completion
- **Expandable Day Cards**: Click to reveal detailed learning experiences for each day
- **Contact Form**: Fully functional contact form with Azure Functions backend
- **Newsletter Signup**: Email subscription for learning updates
- **Smooth Scrolling Navigation**: Professional navigation experience
- **Mobile-First Design**: Optimized for all device sizes

### Backend (Azure Functions)
- **Contact Form Processing**: Handles form submissions with validation
- **JSON API Responses**: Structured responses with success/error handling
- **Input Validation**: Email format and required field validation
- **Error Handling**: Comprehensive error management and logging

## 🛠️ Technology Stack

- **Frontend**: React/TypeScript, Vite, Tailwind CSS, ShadCN UI
- **Backend**: Python, Azure Functions
- **Database**: Azure Cosmos DB
- **AI Integration**: NIA AI Service via Model Context Protocol (MCP)
- **Hosting**: OVHcloud (Frontend), Azure (Backend)
- **Email**: Zoho Mail
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Animations**: CSS animations and JavaScript Intersection Observer
- **Form Handling**: Fetch API with async/await

## 🤖 AI Integration (MCP)

TCDynamics includes advanced AI integration through the Model Context Protocol (MCP):

- **NIA AI Service**: Integrated AI assistant with your API key (`nk_lrzAv0SQJE3FNfS2yV52Y0XlnZ7WeI5p`)
- **Context-Aware Assistance**: AI assistants can understand project structure and provide intelligent help
- **Code Analysis**: Automatic code analysis and recommendations
- **Learning Recommendations**: AI-powered personalized learning paths
- **Project Insights**: Comprehensive project overview and documentation access

### MCP Features
- Real-time project context for AI assistants
- Code analysis and optimization suggestions
- Learning path recommendations
- Deployment and infrastructure insights
- Secure API key management

For detailed MCP setup instructions, see [MCP_README.md](MCP_README.md).

### 🔄 Quick MCP Restart
After closing Cursor, simply double-click `start-mcp.bat` in your project folder to restart the server!

## 📁 Project Structure

```
TCDynamics/
├── function_app.py          # Azure Functions backend
├── host.json               # Azure Functions configuration
├── local.settings.json     # Local development settings
├── requirements.txt        # Python dependencies
├── index.html             # Main website page
├── style.css              # Complete styling
├── script.js              # Interactive functionality
└── __pycache__/           # Python cache
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Azure Functions Core Tools
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TCDynamics
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start Azure Functions locally**
   ```bash
   func start
   ```

4. **Open the website**
   - Navigate to `TCDynamics/index.html` in your browser
   - Or serve it using a local server:
     ```bash
     python -m http.server 8000
     ```
   - Then visit `http://localhost:8000`

## 📝 Usage

### Website Features

1. **Progress Tracking**
   - The progress bar automatically updates based on completed days
   - Current day is displayed prominently
   - Visual indicators show completion status

2. **Day Cards**
   - Click "Voir mon expérience" to expand day details
   - Each day shows learning objectives and personal experiences
   - Status badges indicate completion (Terminé/À venir)

3. **Contact Form**
   - Fill out the contact form with name, email, and message
   - Form validates input and sends to Azure Function
   - Success/error messages are displayed

4. **Newsletter Signup**
   - Subscribe to receive learning journey updates
   - Email validation ensures proper format

### Backend API

The Azure Function provides a REST API endpoint:

**POST /api/ContactForm**
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Your message here"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Merci pour votre message ! Je vous répondrai bientôt."
  }
  ```

## 🎨 Customization

### Styling
- Modify `style.css` to change colors, fonts, and layout
- The design uses CSS custom properties for easy theming
- Responsive breakpoints are defined for mobile optimization

### Content
- Update day cards in `index.html` with your learning experiences
- Modify the 30-day curriculum to match your learning path
- Add your own code snippets and project examples

### Functionality
- Extend `script.js` with additional interactive features
- Modify the Azure Function to add email sending or database storage
- Add authentication or additional API endpoints

## 🔧 Development

### Adding New Days
1. Copy an existing day card structure in `index.html`
2. Update the day number, title, and description
3. Add your learning content in the expandable sections
4. Update the progress tracking in `script.js` if needed

### Extending the Backend
1. Add new Azure Functions in `function_app.py`
2. Update `requirements.txt` for new dependencies
3. Test locally with `func start`

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Future Enhancements

- [ ] Database integration for storing contact form submissions
- [ ] Email notification system
- [ ] User authentication and personal dashboards
- [ ] Blog functionality for detailed posts
- [ ] Code syntax highlighting for Python examples
- [ ] Dark mode toggle
- [ ] Social media sharing
- [ ] Analytics and progress statistics

## 📞 Support

For questions or support, please use the contact form on the website or open an issue in the repository.

---

**Happy Learning! 🐍✨**
