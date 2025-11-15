# GitHub Pages Setup Instructions

This repository is now configured for GitHub Pages deployment! Follow these simple steps to activate it.

## Quick Setup (2 minutes)

### Step 1: Enable GitHub Pages in Repository Settings

1. Go to your repository on GitHub: https://github.com/DJHanDoom/HerbalScan
2. Click on **Settings** (top menu)
3. In the left sidebar, click on **Pages**
4. Under **Source**, select **GitHub Actions** from the dropdown
5. Click **Save**

That's it! GitHub Actions will automatically build and deploy your site.

### Step 2: Wait for Deployment

- The first deployment will start automatically when you merge this PR to the `main` branch
- Check the **Actions** tab to see the deployment progress
- It usually takes 1-2 minutes

### Step 3: Access Your Site

Once deployed, your site will be available at:

**https://djhandoom.github.io/HerbalScan/**

## What Was Configured

### Files Created

1. **index.html** - Beautiful landing page with:
   - Project overview
   - Features showcase
   - AI models listing (Premium & Free)
   - Installation instructions
   - Responsive design

2. **styles.css** - Modern styling with:
   - Green color theme (vegetation-focused)
   - Responsive layouts
   - Smooth animations
   - Mobile-friendly design

3. **.github/workflows/pages.yml** - GitHub Actions workflow for automatic deployment

4. **_config.yml** - Jekyll configuration for GitHub Pages

5. **.nojekyll** - Ensures plain HTML/CSS is served without Jekyll processing

## Customization

### Update Content

To customize the landing page:
1. Edit `index.html` for content changes
2. Edit `styles.css` for design changes
3. Commit and push - the site will update automatically

### Change Colors

In `styles.css`, modify the CSS variables at the top:
```css
:root {
    --primary-color: #2d7d46;     /* Main green */
    --secondary-color: #4caf50;   /* Light green */
    --accent-color: #8bc34a;      /* Accent green */
    --dark-color: #1b5e20;        /* Dark green */
    --light-color: #f1f8e9;       /* Light background */
}
```

## Troubleshooting

### Site Not Deploying?

1. Check the **Actions** tab for build errors
2. Ensure you've selected "GitHub Actions" as the source in Settings → Pages
3. Make sure the workflow file exists at `.github/workflows/pages.yml`

### 404 Error?

- Wait a few minutes after the first deployment
- Clear your browser cache
- Check that the deployment completed successfully in the Actions tab

### Need Help?

Check the official GitHub Pages documentation:
https://docs.github.com/en/pages

## Important Notes

### Flask Application vs GitHub Pages

- **GitHub Pages** hosts only static files (HTML, CSS, JavaScript)
- The **Flask application** described in the README requires a backend server
- This GitHub Pages site serves as a **landing page** with documentation
- To run the full Flask app with AI analysis, users must install it locally or deploy to a platform that supports Python (Heroku, PythonAnywhere, Railway, etc.)

### Future Deployments

Every time you push to the `main` branch, the site will automatically redeploy. No manual action needed!

## Next Steps

1. Merge this PR to `main`
2. Enable GitHub Actions as the Pages source
3. Share your site: https://djhandoom.github.io/HerbalScan/

Enjoy your new project website! 🌿
