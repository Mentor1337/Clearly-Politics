# Clearly Politics Setup Guide

This guide will walk you through setting up your "Clearly Politics" GitHub Pages dashboard from start to finish.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create GitHub Repository

1. **Go to GitHub** and sign in to your account
2. **Create a new repository**:
   - Click the "+" icon → "New repository"
   - Repository name: `clearly-politics`
   - Description: "Data-driven analysis of gun violence and political violence in the United States"
   - Make it **Public** (required for free GitHub Pages)
   - Initialize with README: ✅ Check this
   - Click "Create repository"

### Step 2: Upload Files

1. **Download all the files** I created for you
2. **In your new repository**, click "uploading an existing file"
3. **Drag and drop all files** into the upload area
4. **Commit message**: "Initial dashboard setup"
5. Click "Commit changes"

### Step 3: Enable GitHub Pages

1. **Go to Settings** tab in your repository
2. **Scroll down to "Pages"** section (left sidebar)
3. **Source**: Select "Deploy from a branch"
4. **Branch**: Select "main"
5. **Folder**: Select "/ (root)"
6. Click **Save**

🎉 **Your dashboard will be live at**: `https://yourusername.github.io/clearly-politics/`

(Replace "yourusername" with your actual GitHub username)

---

## 📋 Detailed Setup Instructions

### Prerequisites

- GitHub account (free)
- Basic familiarity with web browsers
- Optional: Node.js for local development

### File Structure Overview

```
clearly-politics/
├── index.html              # 🏠 Main dashboard page
├── README.md               # 📖 Project documentation  
├── _config.yml             # ⚙️ Jekyll configuration
├── package.json            # 📦 Dependencies
├── .github/
│   └── workflows/
│       └── update-data.yml # 🤖 Automated updates
├── js/
│   ├── api-handlers.js     # 🔌 API integration
│   └── data-processor.js   # 📊 Data processing
└── scripts/
    └── collect-data.js     # 🗂️ Data collection script
```

### Setting Up Automated Data Updates

The dashboard includes automated data collection that runs daily. To enable this:

1. **Go to your repository Settings**
2. **Click "Secrets and variables" → "Actions"**  
3. **Add these secrets** (optional, for enhanced data collection):
   - `CENSUS_API_KEY`: Get from [census.gov/developers](https://www.census.gov/developers/)
   - `FBI_API_KEY`: Contact FBI for access to enhanced datasets

### Local Development Setup

If you want to run the dashboard locally:

```bash
# Clone your repository
git clone https://github.com/yourusername/clearly-politics.git
cd clearly-politics

# Install dependencies (optional)
npm install

# Start local server
python -m http.server 8000
# OR
npm run serve

# Open in browser
open http://localhost:8000
```

### Customization Options

#### 1. Update Your Information

**In `_config.yml`**:
```yaml
url: "https://yourusername.github.io"  # Replace with your username
twitter_username: your_twitter         # Your Twitter handle
github_username: your_github          # Your GitHub username
```

**In `package.json`**:
```json
"repository": {
  "url": "git+https://github.com/yourusername/clearly-politics.git"
},
"homepage": "https://yourusername.github.io/clearly-politics/"
```

#### 2. Customize Colors and Styling

**In `index.html`**, find the `<style>` section and modify:
```css
/* Change primary colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* Background gradient */
color: #3498db; /* Primary blue */
color: #e74c3c; /* Primary red */
```

#### 3. Add More Data Sources

**In `js/api-handlers.js`**, add new data sources:
```javascript
this.baseUrls = {
    gunViolenceArchive: 'https://www.gunviolencearchive.org/query',
    // Add your new source here
    newSource: 'https://api.newsource.com/data'
};
```

### Data Sources Integration

The dashboard is designed to work with these data sources:

#### Already Integrated:
- ✅ Mock data for demonstration
- ✅ US Census population data  
- ✅ Political classifications (red/blue/swing states)
- ✅ Gun law strength scores

#### Ready to Integrate:
- 🔄 Gun Violence Archive (requires web scraping)
- 🔄 FBI Hate Crime Statistics 
- 🔄 Political violence databases
- 🔄 Academic research data

### Troubleshooting

#### Dashboard Not Loading?
1. **Check GitHub Pages status**: Repository Settings → Pages
2. **Verify files uploaded correctly**: Should see index.html in repository root
3. **Wait 5-10 minutes**: GitHub Pages needs time to deploy

#### Data Not Updating?
1. **Check Actions tab**: See if automated workflow is running
2. **Verify secrets**: Make sure API keys are added correctly
3. **Check logs**: Click on failed workflow runs for error details

#### Charts Not Displaying?
1. **Check browser console**: Press F12 → Console tab for errors
2. **Verify data format**: Ensure data files are valid JSON
3. **Check CDN links**: Make sure Chart.js and D3.js are loading

### Performance Optimization

#### For Large Datasets:
```javascript
// In api-handlers.js, implement data pagination
async fetchLargeDataset(page = 1, limit = 1000) {
    const url = `${this.baseUrl}/data?page=${page}&limit=${limit}`;
    return await this.fetchWithCache(`data_page_${page}`, url);
}
```

#### For Faster Loading:
```html
<!-- Add to <head> in index.html -->
<link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.min.js" as="script">
<link rel="preload" href="data/processed/latest.json" as="fetch">
```

### Security Best Practices

#### Protect API Keys:
- ✅ Never commit API keys to code
- ✅ Use GitHub Secrets for sensitive data
- ✅ Implement rate limiting for API calls

#### Validate Data:
```javascript
// Always validate external data
function validateData(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
    }
    // Add specific validation rules
}
```

### Advanced Features

#### Real-time Updates:
```javascript
// Add to main dashboard script
setInterval(async () => {
    await refreshData();
    console.log('Data refreshed');
}, 30 * 60 * 1000); // Every 30 minutes
```

#### Mobile Optimization:
```css
/* Responsive breakpoints already included */
@media (max-width: 768px) {
    .dashboard-grid {
        grid-template-columns: 1fr;
    }
}
```

### Monitoring and Analytics

#### Add Google Analytics:
1. **Get tracking ID** from Google Analytics
2. **Add to `_config.yml`**:
```yaml
google_analytics: UA-XXXXXXX-X
```

#### Monitor Performance:
```javascript
// Add performance tracking
window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log('Page load time:', loadTime + 'ms');
});
```

### Legal and Ethical Considerations

#### Data Attribution:
- ✅ All sources properly cited
- ✅ Links to original data providers
- ✅ Methodology clearly documented

#### Content Policy:
- ✅ Factual, non-partisan presentation
- ✅ Transparent about limitations
- ✅ Academic-quality sourcing

### Getting Help

#### Issues with Setup:
1. **Check the README.md** for detailed documentation
2. **Search GitHub Issues** in the repository
3. **Create a new issue** with:
   - Your operating system
   - Browser being used
   - Error messages (if any)
   - Steps to reproduce the problem

#### Contributing:
1. **Fork the repository**
2. **Make your changes**
3. **Submit a pull request** with description

### Next Steps

After your dashboard is live:

1. **Test all functionality** - click through all charts and features
2. **Monitor data updates** - check that automated collection works
3. **Share responsibly** - provide context when sharing insights
4. **Keep updated** - watch for new data sources and methodology improvements

---

## 🎯 Success Checklist

- [ ] Repository created and files uploaded
- [ ] GitHub Pages enabled and dashboard accessible
- [ ] All charts loading and displaying data
- [ ] Automated data collection workflow running
- [ ] Mobile responsiveness tested
- [ ] Data sources properly attributed
- [ ] Personal information updated in configuration files

**Congratulations!** 🎉 Your Clearly Politics dashboard is now live and ready to inform data-driven discussions about important policy issues.

Remember: The goal is to present factual information that helps people understand complex issues through data rather than rhetoric.