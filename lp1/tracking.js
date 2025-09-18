(function() {
    let initialProcessingAttemptedAndRan = false; 
    const cookieName = 'rtkclickid-store';
    const localTrackingDomain = 'trk.healthylovinglife.com'; // For the image fallback
    const targetLinkSelectors = 'a.cta-button, a.video-link, a[class*="cta"]';
    const cloudRunBeaconUrl = 'https://clicklog-hgcv-114790900110.us-east1.run.app'; // Your Cloud Run URL

    // --- NEW: Global flag to track if ANY outbound click has been fired for this page view ---
    let pageOutboundClickHasBeenTracked = false;

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return '';
    }

    function processTrackableLinks(clickIdFromCookie) {
        const links = document.querySelectorAll(targetLinkSelectors);

        if (links.length === 0) {
            return false; 
        }

        let anyLinkProcessedThisCall = false;
        links.forEach(link => {
            // This flag ensures we only set up each link (href mod + listener) once
            if (link.dataset.trackingSetupDone) {
                return; 
            }

            anyLinkProcessedThisCall = true;
            try {
                // 1. Modify Link Href with subid (still useful for the actual navigation)
                let url;
                try {
                    url = new URL(link.href, document.baseURI);
                } catch (urlError) {
                    return; 
                }
                
                url.searchParams.set('subid', clickIdFromCookie);
                url.searchParams.set('tid', clickIdFromCookie);
                link.href = url.toString(); 

                // 2. Add Click Listener to this specific link
                link.addEventListener('click', function() {
                    // --- Check the GLOBAL flag ---
                    if (pageOutboundClickHasBeenTracked) {
                        // The first outbound click on this page has already been tracked.
                        // console.log('Page outbound click already tracked.');
                        return; 
                    }
                    // --- END Check GLOBAL flag ---

                    const currentClickIdForPixel = getCookie(cookieName); 
                    
                    if (!currentClickIdForPixel) {
                        // console.warn('No clickId found at click time for pixel.');
                        return; 
                    }

                    // Fire the tracking beacon/pixel
                    if (navigator.sendBeacon) {
                        const beaconUrlForCloudRun = `${cloudRunBeaconUrl}?subid=${encodeURIComponent(currentClickIdForPixel)}`;
                        navigator.sendBeacon(beaconUrlForCloudRun);
                    } else {
                        const redtrackDirectUrl = `https://${localTrackingDomain}/click?clickid=${encodeURIComponent(currentClickIdForPixel)}`;
                        const img = new Image();
                        img.src = redtrackDirectUrl;
                        img.style.display = 'none';
                        document.body.appendChild(img);
                        img.onload = img.onerror = function() {
                            if (img.parentNode) {
                                img.parentNode.removeChild(img);
                            }
                        };
                    }
                    
                    // --- SET THE GLOBAL FLAG after firing for the first outbound click ---
                    pageOutboundClickHasBeenTracked = true;
                    // console.log('Page outbound click tracked.');
                    // --- END SET THE GLOBAL FLAG ---
                });

                link.dataset.trackingSetupDone = 'true'; 

            } catch (e) {
                // console.error('Error processing link:', link, e);
            }
        });
        
        return anyLinkProcessedThisCall;
    }

    function attemptToProcessLinks() {
        if (initialProcessingAttemptedAndRan) return true;

        const clickIdValue = getCookie(cookieName);
        if (clickIdValue) {
            if (processTrackableLinks(clickIdValue)) {
                initialProcessingAttemptedAndRan = true; 
            }
            return true; 
        }
        return false; 
    }

    // --- Main Execution Flow (to set up hrefs and listeners) ---
    attemptToProcessLinks();
    document.addEventListener('DOMContentLoaded', attemptToProcessLinks);
    window.addEventListener('load', attemptToProcessLinks);

    let pollAttempts = 0;
    const maxPollAttempts = 200; 
    const pollInterval = 50;    

    function pollForCookieAndProcess() {
        if (initialProcessingAttemptedAndRan || pollAttempts++ >= maxPollAttempts) {
            return; 
        }
        if (!attemptToProcessLinks()) { 
            setTimeout(pollForCookieAndProcess, pollInterval); 
        }
    }
    setTimeout(pollForCookieAndProcess, pollInterval);

})();