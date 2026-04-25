# ClickWise - GitHub Pages Deployment

This folder contains the static site for GitHub Pages hosting.

## Setup Instructions

1. **Push to GitHub**:
   ```bash
   git add docs/
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "Deploy from a branch"
   - Choose "main" branch and "/docs" folder
   - Click "Save"

3. **Access your site**:
   - Your site will be available at: `https://[your-username].github.io/[repo-name]/`
   - It may take a few minutes for the initial deployment

## Custom Domain (Optional)

To use a custom domain like `clickwise.org`:

1. In your domain registrar's DNS settings, add:
   - A records pointing to GitHub Pages IPs:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153
   - Or a CNAME record pointing to `[your-username].github.io`

2. Create a file named `CNAME` in the docs folder with your domain:
   ```bash
   echo "clickwise.org" > docs/CNAME
   ```

3. In GitHub Pages settings, enter your custom domain and enforce HTTPS

## Notes

- This is a static site (no backend) - the contact form shows a success message but doesn't send emails
- If you need backend functionality, consider services like Netlify Forms, Formspree, or deploying the backend separately
