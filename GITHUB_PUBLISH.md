# GitHub Publishing Instructions

Follow these steps to publish TableTamer v1.0.0 to GitHub:

1. **Create a new GitHub repository**:
   - Go to GitHub and create a new repository named `tabletamer`
   - Do not initialize with README, .gitignore, or license (we'll push our own)

2. **Update package.json**:
   - Replace the current package.json with the contents of package.json.github
   - `mv package.json.github package.json`

3. **Initialize Git and push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial release v1.0.0"
   git branch -M main
   git remote add origin https://github.com/0xwulf/tabletamer.git
   git push -u origin main
   ```

4. **Create a release**:
   - Go to the Releases section of your GitHub repository
   - Click "Create a new release"
   - Tag version: v1.0.0
   - Release title: TableTamer v1.0.0
   - Description: Copy the content from CHANGELOG.md
   - Select "Publish release"

5. **Setup GitHub Pages (optional)**:
   - Go to Settings > Pages
   - Select "Deploy from a branch"
   - Choose "main" branch and "/docs" folder (you may need to create a docs folder first)
   - Click "Save"
   - Update the demo link in README.md with your GitHub Pages URL

6. **Cleanup**:
   - Delete this file after publishing: `rm GITHUB_PUBLISH.md`