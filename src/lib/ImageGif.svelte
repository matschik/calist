<script lang="ts">
    let { isFrozen = false, src, ...rest } = $props();

    let imgEl: HTMLImageElement | undefined = $state();
    let frozenDataUrl: string | null = $state(null);
    let currentSrc = $state(src);

    function createFrozenFrame() {
        if (!imgEl || !src || frozenDataUrl) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Create a temporary image to capture the current frame
        const tempImg = document.createElement('img');
        tempImg.crossOrigin = 'anonymous';
        
        tempImg.onload = function() {
            canvas.width = tempImg.naturalWidth;
            canvas.height = tempImg.naturalHeight;
            ctx.drawImage(tempImg, 0, 0);
            
            // Store the frozen frame and update the displayed image
            frozenDataUrl = canvas.toDataURL();
            if (imgEl && isFrozen) {
                imgEl.src = frozenDataUrl;
            }
        };
        
        tempImg.onerror = function() {
            console.warn('Failed to create frozen frame for:', src);
        };
        
        // Use the current src to capture the frame
        tempImg.src = src;
    }

    function updateImageSrc() {
        if (!imgEl) return;

        if (isFrozen) {
            if (frozenDataUrl) {
                imgEl.src = frozenDataUrl;
            } else {
                createFrozenFrame();
            }
        } else {
            imgEl.src = src;
            // Clear frozen frame when unfrozen to save memory
            frozenDataUrl = null;
        }
    }

    // Watch for changes in props and update accordingly
    $effect(() => {
        // If src changed, clear frozen frame and update current src
        if (currentSrc !== src) {
            currentSrc = src;
            frozenDataUrl = null;
        }
        
        updateImageSrc();
    });
</script>

<img bind:this={imgEl} {src} {...rest} />