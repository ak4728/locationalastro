#!/usr/bin/env python3
"""
Image compression script for LocationalAstro project
Compresses PNG images to reduce file size while maintaining quality
"""

from PIL import Image, ImageOps
import os
import shutil

def compress_image(input_path, output_path, quality=85, max_width=1920):
    """
    Compress an image while maintaining aspect ratio
    
    Args:
        input_path: Path to input image
        output_path: Path to save compressed image
        quality: JPEG quality (1-100, higher is better)
        max_width: Maximum width in pixels
    """
    try:
        # Open the image
        with Image.open(input_path) as img:
            # Convert to RGB if necessary (PNG to JPEG conversion)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Create a white background for transparent images
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize if too large
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Apply auto-orient based on EXIF data
            img = ImageOps.exif_transpose(img)
            
            # Save as JPEG with compression
            img.save(output_path, 'JPEG', quality=quality, optimize=True)
            
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

def get_file_size_mb(file_path):
    """Get file size in MB"""
    return os.path.getsize(file_path) / (1024 * 1024)

def main():
    images_dir = "images"
    
    # Images to compress (the large background images)
    images_to_compress = [
        ("background.png", "background.jpg", 80, 1920),
        ("background2.png", "background2.jpg", 80, 1920),
        ("LocationalAstro.png", "LocationalAstro.jpg", 85, 1200),
        ("logo-large.png", "logo-large.jpg", 90, 800),
    ]
    
    print("Image Compression Report")
    print("=" * 50)
    
    for input_name, output_name, quality, max_width in images_to_compress:
        input_path = os.path.join(images_dir, input_name)
        output_path = os.path.join(images_dir, output_name)
        
        if not os.path.exists(input_path):
            print(f"❌ {input_name} not found, skipping...")
            continue
            
        # Get original size
        original_size = get_file_size_mb(input_path)
        
        # Compress the image
        print(f"🔄 Compressing {input_name}...")
        compress_image(input_path, output_path, quality, max_width)
        
        if os.path.exists(output_path):
            # Get compressed size
            compressed_size = get_file_size_mb(output_path)
            reduction = ((original_size - compressed_size) / original_size) * 100
            
            print(f"✅ {input_name} -> {output_name}")
            print(f"   Original: {original_size:.2f} MB")
            print(f"   Compressed: {compressed_size:.2f} MB")
            print(f"   Reduction: {reduction:.1f}%")
            print()
        else:
            print(f"❌ Failed to create {output_name}")
    
    print("Compression completed!")
    print("\nNext steps:")
    print("1. Update your HTML/CSS to use the new .jpg files instead of .png")
    print("2. Test the website to ensure images display correctly")
    print("3. If satisfied, you can delete the original .png files to save space")

if __name__ == "__main__":
    main()