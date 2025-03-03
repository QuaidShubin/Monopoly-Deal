from PIL import Image
import os

# List of wildcard images to flip
wildcards = [
    "wildlbbr.jpg",
    "wildbg.jpg",
    "wildgt.jpg",
    "wildlbt.jpg",
    "wildop.jpg",
    "wildry.jpg",
    "wildut.jpg",
]

# Directory containing the card images
cards_dir = "images/cards"

# Process each wildcard
for wildcard in wildcards:
    # Full path to image
    image_path = os.path.join(cards_dir, wildcard)

    # Create flipped filename
    flipped_name = wildcard.replace(".jpg", "_flipped.jpg")
    flipped_path = os.path.join(cards_dir, flipped_name)

    try:
        # Open and rotate image
        with Image.open(image_path) as img:
            # Rotate 180 degrees
            flipped = img.rotate(180)
            # Save flipped version
            flipped.save(flipped_path, quality=95)
            print(f"Created {flipped_name}")
    except Exception as e:
        print(f"Error processing {wildcard}: {e}")

print("Finished creating flipped wildcard images")
