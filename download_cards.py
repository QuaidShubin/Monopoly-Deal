import requests
from bs4 import BeautifulSoup
import os
from urllib.parse import urljoin
import time

# Create cards directory if it doesn't exist
cards_dir = os.path.join('images', 'cards')
os.makedirs(cards_dir, exist_ok=True)

# URL of the cards page
base_url = 'https://lackeyccg.com/monopolydeal/cards/'

def download_cards():
    try:
        # Get the webpage content
        response = requests.get(base_url)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all links that end with .jpg
        image_links = [link.get('href') for link in soup.find_all('a') 
                      if link.get('href', '').lower().endswith('.jpg')]
        
        print(f"Found {len(image_links)} card images to download")
        
        # Download each image
        for img_link in image_links:
            full_url = urljoin(base_url, img_link)
            filename = os.path.join(cards_dir, img_link)
            
            # Skip if file already exists
            if os.path.exists(filename):
                print(f"Skipping {img_link} - already exists")
                continue
            
            # Download the image
            print(f"Downloading {img_link}...")
            img_response = requests.get(full_url)
            img_response.raise_for_status()
            
            # Save the image
            with open(filename, 'wb') as f:
                f.write(img_response.content)
            
            # Be nice to the server
            time.sleep(0.5)
            
        print("Download completed successfully!")
        
    except requests.exceptions.RequestException as e:
        print(f"Error downloading cards: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    download_cards() 