// Constants for selector patterns
const SELECTORS = {
  HEADLINE: [
    ".text-body-medium.break-words",
    "[data-field='headline']",
    ".pv-text-details__left-panel:not(.pv-text-details__mini-card-content) span.text-body-medium",
  ],
  ABOUT: [
    ".pv-shared-text-with-see-more > span",
    "#about ~ .display-flex > .pv-shared-text-with-see-more > span",
    "[data-field='about'] .visually-hidden",
  ],
  EXPERIENCE_SECTION: [
    ".experience__item",
    ".pv-entity__position-group",
    "#experience ~ .pvs-list__container .pvs-entity",
  ],
  EXPERIENCE_ROLE: [
    "span[aria-hidden]",
    ".pv-entity__summary-info h3",
    ".display-flex .mr1 span[aria-hidden='true']",
    ".pvs-entity__primary-text",
  ],
};

// Use the monitor if available, otherwise create a simple logger
const logger = {
  debug: false,
  log: function (message) {
    if (this.debug) console.log(`[LinkedIn Extractor] ${message}`);
  },
  error: function (message) {
    console.error(`[LinkedIn Extractor Error] ${message}`);
  },
};

/**
 * Attempt to extract text using multiple selector patterns
 * @param {Array} selectors - Array of CSS selectors to try
 * @param {Element} context - Optional element to scope the search
 * @returns {string} The extracted text or empty string
 */
function getTextWithFallback(selectors, context = document) {
  for (const selector of selectors) {
    try {
      const el = context.querySelector(selector);
      if (el && el.innerText) {
        const text = el.innerText.trim();
        logger.log(`Found text with selector: ${selector}`);
        return text;
      }
    } catch (err) {
      logger.error(`Error with selector ${selector}: ${err.message}`);
    }
  }

  // Fallback: Look for elements containing label text patterns
  if (selectors === SELECTORS.HEADLINE) {
    return findElementByTextPattern(
      ["profession", "headline", "title"],
      context
    );
  } else if (selectors === SELECTORS.ABOUT) {
    return findElementByTextPattern(["about", "summary", "bio"], context);
  }

  return "";
}

/**
 * Finds elements that might contain a specific type of data based on text patterns
 * @param {Array} patterns - Array of text patterns to look for
 * @param {Element} context - Element to scope the search
 * @returns {string} Extracted text or empty string
 */
function findElementByTextPattern(patterns, context = document) {
  // Find section headers that might indicate the right section
  const headers = Array.from(
    context.querySelectorAll("h1, h2, h3, h4, h5, h6, section")
  );

  for (const header of headers) {
    const headerText = header.innerText.toLowerCase();
    for (const pattern of patterns) {
      if (headerText.includes(pattern)) {
        // Try to get the content following this header
        const section = header.closest("section") || header.parentElement;
        if (section) {
          // Look for paragraphs or content divs
          const contentElements = section.querySelectorAll(
            "p, div > span, div.pv-shared-text-with-see-more"
          );
          for (const el of contentElements) {
            if (el.innerText && el.innerText.trim().length > 10) {
              return el.innerText.trim();
            }
          }
        }
      }
    }
  }

  return "";
}

/**
 * Get experience data with multiple fallback mechanisms
 * @returns {Array} Array of experience items
 */
function getExperiences() {
  let experiences = [];
  let found = false;

  // Try all selector patterns for experience sections
  for (const sectionSelector of SELECTORS.EXPERIENCE_SECTION) {
    try {
      const expSections = document.querySelectorAll(sectionSelector);

      if (expSections && expSections.length > 0) {
        found = true;
        logger.log(
          `Found ${expSections.length} experiences with selector: ${sectionSelector}`
        );

        // Extract up to 3 experiences
        for (let i = 0; i < Math.min(expSections.length, 3); i++) {
          let roleText = "";

          // Try each role selector
          for (const roleSelector of SELECTORS.EXPERIENCE_ROLE) {
            const role = expSections[i].querySelector(roleSelector);
            if (role && role.innerText) {
              roleText = role.innerText.trim();
              break;
            }
          }

          // If we found a role, add it
          if (roleText) {
            experiences.push(roleText);
          }
        }

        // If we found experiences, no need to try other selectors
        if (experiences.length > 0) {
          break;
        }
      }
    } catch (err) {
      logger.error(
        `Error extracting experiences with selector ${sectionSelector}: ${err.message}`
      );
    }
  }

  // Fallback: If no experiences found, try to find experience content based on text patterns
  if (!found || experiences.length === 0) {
    logger.log("Falling back to text pattern search for experiences");
    // Look for sections that might contain experience information
    const expContent = findExperiencesByTextPattern();
    if (expContent.length > 0) {
      experiences = expContent;
    }
  }

  return experiences;
}

/**
 * Find experience data by looking for text patterns
 * @returns {Array} Array of experience items
 */
function findExperiencesByTextPattern() {
  const experiences = [];

  // Find sections that might be about experience
  const expPatterns = ["experience", "work", "career", "employment"];
  const headers = Array.from(
    document.querySelectorAll("h1, h2, h3, h4, h5, h6, section")
  );

  for (const header of headers) {
    const headerText = header.innerText.toLowerCase();
    for (const pattern of expPatterns) {
      if (headerText.includes(pattern)) {
        // Found a potential experience section
        const section = header.closest("section") || header.parentElement;
        if (section) {
          // Look for list items, job titles or position names
          const items = section.querySelectorAll(
            "li, .pv-entity__summary-info, .pvs-entity"
          );
          for (let i = 0; i < Math.min(items.length, 3); i++) {
            const itemText = items[i].innerText.trim();
            if (itemText && itemText.length > 5) {
              // Try to extract just the job title by taking the first line
              const firstLine = itemText.split("\n")[0].trim();
              experiences.push(firstLine);
            }
          }

          if (experiences.length > 0) {
            return experiences;
          }
        }
      }
    }
  }

  return experiences;
}

/**
 * Get profile name with multiple fallback mechanisms
 * @returns {string} The profile name or empty string
 */
function getProfileName() {
  // Try different selector patterns for the profile name
  const nameSelectors = [
    "h1.text-heading-xlarge",
    ".pv-top-card--list li.inline.t-24",
    ".ph5 h1",
    "[data-field='name']",
  ];

  return getTextWithFallback(nameSelectors);
}

/**
 * Extract as much profile data as possible
 * @returns {Object} Profile data object
 */
function extractProfileData() {
  logger.log("Starting profile data extraction");

  const headline = getTextWithFallback(SELECTORS.HEADLINE);
  const about = getTextWithFallback(SELECTORS.ABOUT);
  const experience = getExperiences();
  const name = getProfileName();

  const result = {
    headline: headline || "No headline found",
    about: about || "No about section found",
    experience: experience.length > 0 ? experience : ["No experience found"],
    name: name || "No name found",
    url: window.location.href,
  };

  logger.log("Extraction complete");
  return result;
}

function isLinkedInProfilePage() {
  const url = window.location.href;
  // Check if URL matches LinkedIn profile pattern
  return url.match(/linkedin\.com\/in\//) !== null;
}

// Listen for messages from the popup
window.addEventListener("load", function () {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getProfileData") {
      // First check if we're on a LinkedIn profile page
      if (!isLinkedInProfilePage()) {
        sendResponse({
          error: true,
          notProfilePage: true,
          message:
            "Not a LinkedIn profile page. Please navigate to a LinkedIn profile and try again.",
        });
        return true;
      }

      logger.log("Received request for profile data");

      setTimeout(() => {
        try {
          const profileData = extractProfileData();
          console.log("Extracted profile data:", profileData);
          sendResponse(profileData);
        } catch (err) {
          console.error("Exception during extraction:", err);
          sendResponse({
            error: true,
            message: `Failed to extract profile data: ${err.message}`,
          });
        }
      }, 500);
      return true;
    }
  });

  // Return true to indicate we will send a response asynchronously
  return true;
});

// Optional: Monitor for LinkedIn SPA navigation to handle dynamic page changes
if (window.location.href.includes("linkedin.com/in/")) {
  logger.log("Setting up navigation observer");

  // Create an observer to watch for URL changes (LinkedIn is a SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      logger.log("URL changed, profile might have changed");
    }
  }).observe(document, { subtree: true, childList: true });
}
