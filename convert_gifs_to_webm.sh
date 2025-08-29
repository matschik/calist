#!/bin/bash

# Smart GIF to WebM converter - only converts when WebM doesn't exist
# Using ffmpeg with VP9 codec for optimal compression
#
# USAGE:
#   ./convert_gifs_to_webm.sh
#
# FEATURES:
#   - Only converts GIF files that don't have WebM versions yet
#   - Shows size comparison for converted files
#   - Provides conversion statistics
#   - Safe to run multiple times
#   - Automatically skips already converted files
#
# REQUIREMENTS:
#   - ffmpeg installed (brew install ffmpeg on macOS)
#   - Script must be run from project root directory

EXERCISES_DIR="static/exercise-video"

echo "Smart GIF to WebM converter"
echo "Only converts files that don't have WebM versions yet..."
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is not installed. Please install ffmpeg first."
    echo "On macOS: brew install ffmpeg"
    echo "On Ubuntu/Debian: sudo apt install ffmpeg"
    exit 1
fi

# Counters for statistics
total_gifs=0
converted_count=0
skipped_count=0

echo "Scanning for GIF files..."

# Process each GIF file
for gif_file in "$EXERCISES_DIR"/*.gif; do
    if [ -f "$gif_file" ]; then
        total_gifs=$((total_gifs + 1))
        
        # Get the base filename without extension
        base_name=$(basename "$gif_file" .gif)
        webm_file="$EXERCISES_DIR/${base_name}.webm"
        
        # Check if WebM already exists
        if [ -f "$webm_file" ]; then
            echo "⏭️  Skipping $gif_file (WebM already exists)"
            skipped_count=$((skipped_count + 1))
        else
            echo "🔄 Converting $gif_file to $webm_file..."
            
            ffmpeg -i "$gif_file" \
                   -c:v libvpx-vp9 \
                   -pix_fmt yuv420p \
                   -b:v 0 \
                   -crf 30 \
                   -an \
                   "$webm_file" \
                   -y -loglevel error
            
            if [ $? -eq 0 ]; then
                echo "✅ Successfully converted $gif_file to $webm_file"
                converted_count=$((converted_count + 1))
                
                # Show size comparison
                gif_size=$(du -h "$gif_file" | cut -f1)
                webm_size=$(du -h "$webm_file" | cut -f1)
                echo "   📊 Size: $gif_size → $webm_size"
            else
                echo "❌ Failed to convert $gif_file"
                # Remove failed WebM file if it was created
                [ -f "$webm_file" ] && rm "$webm_file"
            fi
        fi
    fi
done

echo ""
echo "🎯 Conversion Summary:"
echo "   Total GIF files found: $total_gifs"
echo "   Files converted: $converted_count"
echo "   Files skipped (WebM exists): $skipped_count"
echo ""

if [ $converted_count -gt 0 ]; then
    echo "📁 Current file sizes:"
    echo "   GIF files:"
    ls -lh "$EXERCISES_DIR"/*.gif 2>/dev/null | awk '{print "     " $5, $9}' || echo "     No GIF files found"
    
    echo "   WebM files:"
    ls -lh "$EXERCISES_DIR"/*.webm 2>/dev/null | awk '{print "     " $5, $9}' || echo "     No WebM files found"
    
    echo ""
    echo "💡 Tip: You can run this script anytime to convert new GIF files!"
else
    echo "✨ All GIF files already have WebM versions!"
fi
