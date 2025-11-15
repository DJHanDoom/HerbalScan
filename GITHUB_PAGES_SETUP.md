# GitHub Pages Setup Instructions

This repository is now configured for GitHub Pages deployment with **automatic setup**!

## Quick Setup (AUTOMATIC - No Manual Steps Required!)

### ✨ Automatic Setup

When you merge this PR to `main`, the GitHub Actions workflow will:
1. **Automatically enable GitHub Pages** for your repository
2. **Configure the source** to use GitHub Actions
3. **Build and deploy** your site immediately

**No manual configuration needed!** 🎉

### Step 1: Wait for Deployment

- After merging to `main`, the deployment starts automatically
- Check the **Actions** tab to see the deployment progress  
- It usually takes 1-2 minutes
- You'll see a green checkmark when it's done ✅

### Step 2: Access Your Site

Once deployed (look for the green checkmark in Actions), your site will be available at:

**https://djhandoom.github.io/HerbalScan/**

### Optional: Manual Configuration (if needed)

If you want to manually verify or configure GitHub Pages:

1. Go to your repository on GitHub: https://github.com/DJHanDoom/HerbalScan
2. Click on **Settings** (top menu)
3. In the left sidebar, click on **Pages**
4. Under **Source**, you should see **GitHub Actions** already selected
5. Your site URL will be displayed at the top

**Note:** The workflow automatically configures this for you, so manual setup is optional.

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

### Site Not Working?

If you merged the PR but the site isn't working:

1. **Check the Actions tab** 
   - Go to: https://github.com/DJHanDoom/HerbalScan/actions
   - Look for the "Deploy to GitHub Pages" workflow
   - If it shows a ❌ red X (failed), click on it to see the error
   - If it shows ✅ green checkmark (success), the site is deployed!

2. **Wait a few minutes**
   - First deployment can take 2-5 minutes
   - Clear your browser cache and try again
   - Try accessing in an incognito/private window

3. **Verify Repository is Public**
   - GitHub Pages on free accounts only works with public repositories
   - Go to Settings → scroll down to "Danger Zone"
   - Check if repository visibility is "Public"

4. **Try Manual Workflow Run**
   - Go to Actions tab
   - Click "Deploy to GitHub Pages" on the left
   - Click "Run workflow" button on the right
   - Select "main" branch and click "Run workflow"

5. **Check for Build Errors**
   - If the workflow fails, read the error message in the Actions logs
   - Common issues:
     - Repository not public (requires GitHub Pro for private repos)
     - Branch protection rules blocking deployment
     - Incorrect file permissions

### Still Having Issues?

If the automatic setup didn't work:

1. **Enable Pages Manually:**
   - Settings → Pages
   - Source: Select "GitHub Actions"
   - Click Save

2. **Re-run the Workflow:**
   - Actions tab → Select latest failed workflow
   - Click "Re-run all jobs"

3. **Check Workflow Status:**
   ```bash
   # The workflow should show:
   ✅ Checkout
   ✅ Setup Pages  
   ✅ Upload artifact
   ✅ Deploy to GitHub Pages
   ```

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
