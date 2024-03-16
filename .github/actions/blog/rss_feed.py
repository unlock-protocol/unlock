import os
import re
import requests
import feedparser
from datetime import datetime

# Fetch the RSS feed
rss_url = 'https://paragraph.xyz/api/blogs/rss/@unlockprotocol'
feed = feedparser.parse(rss_url)

# Create the base directory for storing blog posts
blog_dir = '../../../unlock-protocol-com/blog'
os.makedirs(blog_dir, exist_ok=True)

# Load the titles of existing blog posts to check for duplicates
existing_titles = set()
for filename in os.listdir(blog_dir):
    if filename.endswith('.md'):
        with open(os.path.join(blog_dir, filename), 'r') as f:
            for line in f:
                if line.startswith('title: '):
                    existing_title = line.split('title: ')[1].strip().strip('"')
                    existing_titles.add(existing_title)
                    break

# Iterate over each post in the feed
for entry in feed.entries:
    # Extract post details
    title = entry.title
    subtitle = entry.subtitle if 'subtitle' in entry else ''
    author_name = entry.author
    publish_date = entry.published
    description = entry.summary
    image_url = entry.image.href if 'image' in entry else ''

    # Skip if the title already exists
    if title in existing_titles:
        continue

    # Generate a slug for the blog post
    slug = re.sub(r'[^\w\-_\. ]', '_', title).lower().replace(' ', '_')

    # Create a directory for the blog post images
    post_images_dir = f'../../../unlock-protocol-com/public/images/blog/{slug}'
    os.makedirs(post_images_dir, exist_ok=True)

    # Fetch and save the image locally
    local_image_path = ''
    if image_url:
        image_filename = os.path.basename(image_url)
        local_image_path = os.path.join(post_images_dir, image_filename)
        response = requests.get(image_url)
        with open(local_image_path, 'wb') as f:
            f.write(response.content)

    # Create the post content
    post_content = f'''---
title: "{title}"
subtitle: "{subtitle}"
authorName: "{author_name}"
publishDate: "{publish_date}"
description: "{description}"
image: "../../../unlock-protocol-com/public/images/blog/{slug}/{image_filename}"
---

{entry.content[0].value}
'''

    # Generate the filename for the blog post
    post_filename = f'{slug}.md'
    post_file_path = os.path.join(blog_dir, post_filename)

    # Save the post to a file
    with open(post_file_path, 'w') as f:
        f.write(post_content)

    # Add the title to the set of existing titles
    existing_titles.add(title)
