# Website Audit Report - tcdynamics.fr

## Comprehensive Recap - January 2026

---

## Executive Summary

This comprehensive audit report evaluates the website `tcdynamics.fr` across multiple dimensions including usability, performance, SEO, social media integration, security, and technical implementation. The site demonstrates good performance on desktop (score: 86) but requires improvement on mobile (score: 60). Overall usability score is 54, indicating room for enhancement.

---

## 1. Usability & User Experience

### Overall Usability Score: **54/100**

**Status:** "Your usability could be better"

The page is functional but could be more usable across devices. Improving usability is important to maximize audience reach and minimize bounce rates, which can indirectly affect search engine rankings.

### Device Rendering

**Status:** ✅ **Passing**

The website renders appropriately across different devices:

- **Mobile Phone View:** Displays correctly with responsive design
  - Header: "TCDynamics" with hamburger menu
  - Main title: "Automatisez Votre Entreprise avec l'IA"
  - Subtitle: "Finies les heures perdues en process manuels."

- **Tablet View:** Optimized for landscape orientation
  - Full content visible including CTAs: "VOIR LA DÉMO" and "PARLER À UN EXPERT"
  - Target audience clearly displayed: "Responsable RH, DG, DAF, DIRIGEANT & SPÉCIALISTES"

**Recommendation:** Continue testing across various resolutions and orientations to ensure optimal user experience.

### Google's Core Web Vitals

**Status:** ⚠️ **Insufficient Data**

Google indicates they do not have sufficient real-world speed data for this page to make a Core Web Vitals assessment. This typically occurs for:

- Smaller websites
- Sites that are not easily crawlable by Google
- Newly launched websites

**Action Required:** Increase website traffic and ensure proper Google Search Console setup to collect real-world user experience data.

---

## 2. Performance Metrics

### Desktop Performance

**Score:** **86/100** (Moderate to Good)
**Status:** Scoring poorly according to Google's standards

#### Lab Data (Desktop):

- **First Contentful Paint (FCP):** 1.0s ✅
- **Speed Index:** 1.7s ✅
- **Largest Contentful Paint (LCP):** 2.0s ✅
- **Time to Interactive (TTI):** 2.0s ✅
- **Total Blocking Time (TBT):** 0.05s ✅
- **Cumulative Layout Shift (CLS):** 0 ✅

#### Opportunities for Improvement:

- **Avoid multiple page redirects:** Estimated savings: 0.34s
- **Reduce unused JavaScript:** Estimated savings: 0.29s

### Mobile Performance

**Score:** **60/100** (Poor)
**Status:** Scoring poorly on Mobile PageSpeed Insights

#### Lab Data (Mobile):

- **First Contentful Paint (FCP):** 4.6s ❌ (Poor)
- **Speed Index:** 4.6s ❌ (Poor)
- **Largest Contentful Paint (LCP):** 6.8s ❌ (Poor)
- **Time to Interactive (TTI):** 7.5s ❌ (Poor)
- **Total Blocking Time (TBT):** 0.06s ✅ (Good)
- **Cumulative Layout Shift (CLS):** 0 ✅ (Excellent)

#### Opportunities for Improvement:

- **Avoid multiple page redirects:** Estimated savings: 1.11s
- **Reduce unused JavaScript:** Estimated savings: 0.45s

**Critical Action Required:** Mobile performance needs significant optimization, particularly for First Contentful Paint and Time to Interactive metrics.

### Overall Performance Score: **84/100**

**Status:** "Your performance is good"

#### Load Speed Metrics:

- **Server Response:** 0.0s ✅ (Excellent)
- **All Page Content Loaded:** 1.3s ✅ (Good - within 5s threshold)
- **All Page Scripts Complete:** 2.0s ✅ (Good - within 10s threshold)

**Analysis:** While desktop performance is acceptable, mobile performance requires urgent attention. The significant difference between desktop and mobile scores suggests optimization opportunities in responsive design and mobile-specific resource loading.

---

## 3. Page Load Speed & File Size

### Website Download Size

**Status:** ✅ **Passing** - "Your page's file size is reasonably low"

**Total Download Size:** 0.79MB

#### Breakdown by File Type:

- **HTML:** 0.01MB
- **CSS:** 0.01MB
- **JavaScript:** 0.67MB (85% of total size)
- **Images:** 0MB (likely dynamically loaded or base64 encoded)
- **Other:** 0.09MB

**Recommendation:** JavaScript represents the largest portion of the download size. Consider code splitting, lazy loading, and removing unused JavaScript to reduce mobile load times.

### Compression Usage

**Status:** ✅ **Passing** - "Your website appears to be using a reasonable level of compression"

**Overall Compression Rate:** 79% (compressing 3.75MB total)

#### Compression by File Type:

- **HTML:** 45% compressed (0.01MB)
- **CSS:** 79% compressed (0.07MB)
- **JavaScript:** 68% compressed (2.10MB)
- **Other:** 94% compressed (1.56MB)

**Recommendation:** HTML compression could be improved from 45% to match CSS compression levels. JavaScript compression at 68% has room for optimization.

### Resources Breakdown

**Total Objects:** 52 resources required to load the page

- **HTML Pages:** 3
- **JavaScript Resources:** 35 (67% of total resources)
- **CSS Resources:** 2
- **Images:** 0
- **Other Resources:** 12

**Recommendation:** Consider consolidating JavaScript files where possible to reduce the number of HTTP requests. The high number of JS resources (35) contributes to slower mobile load times.

---

## 4. Technical Implementation

### Mobile Viewport

**Status:** ✅ **Passing**

- Page correctly specifies a Viewport matching device size
- Allows appropriate rendering across devices

### Flash Usage

**Status:** ✅ **Passing**

- No Flash content identified
- Using modern web technologies (HTML/CSS)

### iFrames Usage

**Status:** ✅ **Passing**

- No iFrames detected on the page
- Modern navigation practices implemented

### Favicon

**Status:** ✅ **Passing**

- Favicon specified and present
- Enhances branding and user experience

### Email Privacy

**Status:** ✅ **Passing**

- No email addresses found in plain text
- Protects against spam scraping

### Legible Font Sizes

**Status:** ✅ **Passing**

- Text appears legible across devices
- Appropriate sizing for readability

### Tap Target Sizing

**Status:** ✅ **Passing**

- Links and buttons appropriately sized for touchscreen interaction
- No issues with clickability on mobile devices

### JavaScript Errors

**Status:** ✅ **Passing**

- No JavaScript errors reported
- Code execution functioning correctly

### Image Optimization

**Status:** ✅ **Passing**

- All images appear optimized
- No obvious optimization issues detected

### Minification

**Status:** ✅ **Passing**

- All JavaScript and CSS files appear minified
- Code optimization implemented correctly

### Deprecated HTML

**Status:** ✅ **Passing**

- No deprecated HTML tags found
- Using modern HTML standards

### Inline Styles

**Status:** ✅ **Passing**

- No inline styles found in HTML tags
- Proper separation of concerns (HTML/CSS)

### HTTP/2 Usage

**Status:** ❌ **Failing** - "Your website is using an outdated HTTP Protocol"

**Critical Issue:** The website is not using HTTP/2 or HTTP/3, which significantly impacts page load speed.

**Action Required:** Enable HTTP/2+ Protocol to improve page load speed. This is a high-priority optimization that can provide immediate performance benefits.

**Note:** The technology section shows HTTP/3 is detected, which may indicate a configuration issue or the audit tool's detection method.

### LLMS.txt (AI Crawler Instructions)

**Status:** ✅ **Detected**

**File:** `http://tcdynamics.fr/llms.txt`

**Purpose:** This file helps Large Language Models (like ChatGPT and Claude) understand your site's content more efficiently.

**Recommendation:** Ensure this file is kept up to date to improve how AI tools reference your brand.

### Google Accelerated Mobile Pages (AMP)

**Status:** ❌ **Not Enabled**

**AMP Indicators:**

- AMP Related Doctype Declaration: ❌ Failed
- AMP Runtime: ❌ Failed
- AMP CSS Boilerplate: ❌ Failed
- Embedded Inline Custom CSS: ❌ Failed
- AMP Images: ❌ Failed
- AMP HTML Canonical Link: ✅ Passed

**Note:** AMP is being deprecated by various browsers and frameworks, so this may not be a priority. However, the canonical link is correctly implemented.

---

## 5. SEO & On-Page Optimization

### On-Page Link Structure

**Total Links:** 12

#### Link Distribution:

- **Internal Links:** 4 (33%)
- **External Links (Follow):** 8 (67%)
- **External Links (Nofollow):** 0 (0%)

**Analysis:**

- 67% of links are external and passing authority to other sites
- Consider adding `nofollow` attributes to external links that don't need to pass PageRank
- Internal linking could be strengthened (only 4 internal links)

### Backlink Analysis

**Status:** ⚠️ **Limited Data Available**

- **Top Pages with Backlinks:** No specific data provided
- **Top Anchors by Backlinks:** No anchor text data found
- **Top Referring Domain Geographies:** No geographic data found

**Recommendation:** Build a more diverse backlink profile and ensure proper anchor text diversity for SEO benefits.

### 📊 SEO Performance & Content Depth

#### Estimated Organic Traffic

**Status:** ⚠️ **Low Visibility**

The audit estimates the site receives approximately **11 visitors per month** from organic search.

#### Current Keyword Rankings

The site is currently ranking for the following term:

- **Keyword:** "workflowai"
- **Position:** 2 (First Page)
- **Search Volume:** 70 monthly searches
- **Estimated Traffic:** 11 visitors

#### Content Volume Analysis

**Status:** ✅ **Good Content Depth**

- **Word Count:** 1,765 words
- **Analysis:** This content length is considered "very good" for ranking potential, well above the recommended 500-word minimum.

#### Keyword Consistency Check

The audit identified these most frequently used keywords across your Title, Description, and Headings. Ensure these align with your target strategy:

**Keywords:** support, pour, sur, donné, les, démo, votre

**Observation:** The main target keywords are not distributed evenly across important HTML tags.

---

## 6. Social Media Integration

### Overall Social Score: **73/100**

**Status:** "Your social is good"

The website has a reasonably good social presence. Social activity is important for customer communication, brand awareness, and as a marketing channel.

### Social Media Links

**Status:** ✅ **All Major Platforms Linked**

- **Facebook:** ✅ Linked to `https://facebook.com/tom.coustols`
- **X (Twitter):** ✅ Linked to `https://x.com/tomcoustols`
- **Instagram:** ✅ Linked to `https://instagram.com/tomcoustols`
- **LinkedIn:** ✅ Linked to `https://linkedin.com/in/tom-coustols`
- **YouTube:** ✅ Linked to `https://youtube.com/channel/UCrxEFM24FYeYBzRu1dMyv2Q`

**Recommendation:** Continue building followers on all networks and ensure all profiles are listed on the website footer.

### YouTube Channel Activity

**Status:** ⚠️ **Low Engagement**

- **Subscribers:** 26 (Low)
- **View Count:** 53.5K

**Recommendation:** Focus on increasing subscriber count and engagement to improve social presence score.

### Facebook Open Graph Tags

**Status:** ✅ **Properly Implemented**

All Open Graph tags are correctly configured:

- `og:title`: "TCDynamics - Automatisez Votre Entreprise avec l'IA"
- `og:description`: "Gagnez 10h par semaine avec notre intelligence artificielle. Spécialement conçu pour les entreprises françaises de Montigny-le-Bretonneux et Guyancourt."
- `og:type`: "website"
- `og:url`: "https://tcdynamics.fr/"
- `og:locale`: "fr-FR"
- `og:site_name`: "TCDynamics"
- `og:image`: "https://tcdynamics.fr/android-chrome-512x512.png"
- `og:image:width`: 512
- `og:image:height`: 512
- `og:image:alt`: "TCDynamics - Automatisation d'entreprise avec l'IA"

**Excellent:** Proper implementation ensures optimal appearance when shared on Facebook.

### Facebook Pixel

**Status:** ❌ **Not Detected**

**Action Required:** Install Facebook Pixel for:

- Visitor retargeting
- Facebook Ads optimization
- Audience building and lookalike audiences
- Analytics and conversion tracking

**Recommendation:** Implement Facebook Pixel if planning any Facebook marketing campaigns.

### X (Twitter) Cards

**Status:** ✅ **Properly Implemented**

All Twitter Card meta tags are correctly configured:

- `twitter:card`: "summary_large_image"
- `twitter:title`: "TCDynamics - Automatisez Votre Entreprise avec l'IA"
- `twitter:description`: "Gagnez 10h par semaine avec notre intelligence artificielle. Spécialement conçu pour les entreprises françaises de Montigny-le-Bretonneux et Guyancourt."
- `twitter:image`: "https://tcdynamics.fr/android-chrome-512x512.png"
- `twitter:image:alt`: "TCDynamics - Automatisation d'entreprise avec l'IA"
- `twitter:site`: "@tomcoustols"
- `twitter:creator`: "@tomcoustols"

**Excellent:** Proper implementation ensures optimal appearance when shared on X/Twitter.

---

## 7. Local SEO

### Local Business Schema

**Status:** ✅ **Implemented**

- **Schema Type:** `LocalBusiness`
- Properly structured data markup identified

**Excellent:** Helps search engines understand the business and improves local search rankings.

### Google Business Profile

**Status:** ❌ **Not Identified**

**Critical Issue:** No Google Business Profile was identified that links to this website.

**Impact:**

- Missing from Google Maps
- Reduced visibility in local search results
- No customer reviews visible in search results
- Limited local SEO benefits

**Action Required:**

1. Create or claim a Google Business Profile
2. Ensure the website URL (`tcdynamics.fr`) is listed in the profile
3. Complete all business information (NAP: Name, Address, Phone)
4. Verify the business listing
5. Encourage customer reviews

### Google Reviews

**Status:** ❌ **Not Available**

Due to the missing Google Business Profile, no Google reviews are available.

**Recommendation:** Once Google Business Profile is set up, proactively drive reviews as they are critical for:

- Customer trust
- Business reputation
- Local search rankings
- Foot traffic

---

## 8. Security & Email Configuration

### DMARC Record

**Status:** ✅ **Valid Record Present**

**Record:** `v=DMARC1; p=none;`

**Recommendation:** Consider strengthening the policy from `p=none` to `p=quarantine` or `p=reject` after monitoring, as this provides better protection against email spoofing.

### SPF Record

**Status:** ✅ **Valid Record Present**

**Record:** `v=spf1 include:zohomail.com ~all`

**Analysis:** Correctly configured to authorize Zoho Mail servers to send emails on behalf of the domain.

**Recommendation:** Review all email delivery platforms to ensure SPF record includes all authorized senders.

### Charset

**Status:** ✅ **Correctly Configured**

**Encoding:** `text/html; charset=utf-8`

Standard UTF-8 encoding ensures proper character display across all languages and devices.

---

## 9. Technology Stack

### Detected Technologies:

- **Cloudflare:** CDN and security provider
- **Google Analytics:** Website analytics tracking
- **HTTP/3:** Latest HTTP protocol (detected, but HTTP/2 usage failed - may be configuration issue)
- **Vercel Analytics:** Analytics service (suggests Vercel hosting)

### Server Information:

- **Server IP:** 104.21.18.149
- **DNS Servers:**
  - `damiete.ns.cloudflare.com`
  - `molly.ns.cloudflare.com`
- **Web Server:** Cloudflare (acting as reverse proxy/CDN)

**Analysis:** Modern technology stack with Cloudflare CDN providing security and performance benefits.

---

## 10. Page Structure

### Child Pages Identified:

- `/about` - About page detected

**Recommendation:** Ensure all important pages are properly linked and accessible for SEO purposes.

---

## Priority Action Items

### 🔴 Critical (High Priority)

1. **Improve Mobile Performance** (Score: 60/100)
   - Optimize First Contentful Paint (currently 4.6s)
   - Reduce Time to Interactive (currently 7.5s)
   - Eliminate multiple page redirects (saves 1.11s)
   - Reduce unused JavaScript (saves 0.45s)

2. **Execute a Link Building Strategy**
   - **Status:** High Priority (Source: Audit Report)
   - Current backlink count is 0. Search engines rely on backlinks to judge authority.
   - Action: Start by listing the site on relevant business directories and partners.

3. **Enable HTTP/2 Protocol**
   - Significant performance improvement opportunity
   - Check server/CDN configuration

4. **Create Google Business Profile**
   - Essential for local SEO
   - Enables customer reviews
   - Improves local search visibility

### 🟡 Important (Medium Priority)

5. **Install Facebook Pixel**
   - Enable retargeting and Facebook Ads
   - Prepare for future marketing campaigns

6. **Optimize JavaScript Delivery**
   - 35 JavaScript resources is high
   - Consider code splitting and lazy loading
   - JavaScript represents 85% of download size (0.67MB)

7. **Improve HTML Compression**
   - Currently at 45%, could match CSS compression (79%)

8. **Strengthen External Link Strategy**
   - Add `nofollow` to non-essential external links
   - Increase internal linking (currently only 4 internal links)

### 🟢 Nice to Have (Low Priority)

9. **Increase YouTube Subscribers**
   - Currently at 26 subscribers
   - 53.5K views suggests content is being watched

10. **Strengthen DMARC Policy**
    - Consider moving from `p=none` to `p=quarantine` after monitoring

---

## Summary of Strengths

✅ **Excellent Areas:**

- Desktop performance (86/100)
- Server response time (0.0s)
- Social media integration (all platforms linked)
- Open Graph and Twitter Cards properly implemented
- Local Business Schema implemented
- Security headers (DMARC, SPF) configured
- No JavaScript errors
- Modern code practices (no deprecated HTML, no inline styles)
- Proper viewport configuration
- Image optimization

✅ **Good Areas:**

- Overall performance (84/100)
- Compression usage (79% overall)
- Social presence (73/100)
- Minification implemented
- Email security configured

⚠️ **Areas Needing Improvement:**

- Mobile performance (60/100) - **CRITICAL**
- Google Business Profile missing - **CRITICAL**
- HTTP/2 not enabled - **CRITICAL**
- Facebook Pixel not installed
- Limited backlink data
- Low YouTube subscriber count

---

## Recommendations Summary

### Immediate Actions (This Week)

1. Create and verify Google Business Profile
2. Investigate and fix HTTP/2 configuration
3. Audit and optimize mobile page load performance

### Short-term (This Month)

4. Install Facebook Pixel
5. Optimize JavaScript delivery (code splitting, lazy loading)
6. Reduce page redirects
7. Remove unused JavaScript

### Long-term (Next Quarter)

8. Build quality backlink profile
9. Increase social media engagement
10. Monitor and improve Core Web Vitals as data becomes available

---

**Report Generated:** January 2026
**Website Audited:** tcdynamics.fr
**Audit Tool:** Website Audit Report (32 pages)

---

## Notes

- This audit was performed from US servers; results may vary slightly for other regions
- Core Web Vitals data requires sufficient real-world traffic to be meaningful
- Some recommendations may require developer assistance or server configuration changes
- Regular audits (quarterly) are recommended to track improvements
