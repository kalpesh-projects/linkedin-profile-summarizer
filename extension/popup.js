document.addEventListener("DOMContentLoaded", function () {
  const copyBtn = document.getElementById("copyBtn");
  const summaryEl = document.getElementById("summary");
  const whyEl = document.getElementById("why");
  const messageEl = document.getElementById("message");
  const loadingEl = document.getElementById("loading");
  const contentEl = document.getElementById("content");

  // Show loading state immediately
  loadingEl.style.display = "block";
  contentEl.style.display = "none";
  copyBtn.style.display = "none";

  // Add a timeout for cases where the content script doesn't respond
  let responseTimeout = setTimeout(() => {
    loadingEl.style.display = "none";
    contentEl.style.display = "block";
    summaryEl.innerText = "❌ Timeout waiting for page to load completely. Please refresh the page and try again.";
  }, 15000); // 15 second timeout

  if (!copyBtn || !summaryEl || !whyEl || !messageEl || !loadingEl || !contentEl) {
    console.error("❌ One or more DOM elements are missing");
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getProfileData" }, function (response) {
      clearTimeout(responseTimeout);

      if (!response) {
        loadingEl.style.display = "none";
        contentEl.style.display = "block";
        summaryEl.innerText = "❌ Could not extract profile data. Make sure you're on a LinkedIn page and try refreshing.";
        whyEl.style.display = "none";
        messageEl.style.display = "none";
        return;
      }
      
      // Check if we're not on a LinkedIn profile page
      if (response.error && response.notProfilePage) {
        loadingEl.style.display = "none";
        contentEl.style.display = "block";
        summaryEl.innerHTML = "This is not a LinkedIn profile page. Please navigate to a LinkedIn profile (linkedin.com/in/username) and try again.";
        whyEl.style.display = "none";
        messageEl.style.display = "none";
        copyBtn.style.display = "none";
        return;
      }
      
      // Check if the response has other errors
      if (response.error) {
        loadingEl.style.display = "none";
        contentEl.style.display = "block";
        summaryEl.innerText = `❌ ${response.message || "Error extracting profile data"}`;
        whyEl.style.display = "none";
        messageEl.style.display = "none";
        return;
      }

      const { headline, about, experience, name, url } = response;

const prompt = `
You're a professional AI writing assistant. Based on a LinkedIn profile that includes the headline, about, and experience sections, generate the following three items:

Return exactly 5 concise bullet points, each highlighting key information such as experience, skills, industries, or education. Keep the total word count under 40 words. Format bullets one per line, without numbering or extra spaces. Maintain a neutral-professional tone and extract both unique and core details from the profile.

Write 1–2 crisp sentences explaining why the user should connect with this person. Frame the benefit clearly — e.g., learning opportunities, relevant experience, or aligned domains. Use third-person perspective and begin with phrases like: “Connecting with this professional could help you…” or “You could benefit from their experience in…”

Write a short, polite, professional connection message (2 sentences max). Do not use their name. Avoid emojis, fluff, or casual phrases. Example format: Hi, I came across your profile and would love to connect and learn from your experience in [domain/skill].

Return the output in plain text with clear separation between the three sections.

Data:
Name: ${name || "Not available"}
URL: ${url || window.location.href}
Headline: ${headline}
About: ${about}
Experience:
${experience.map((exp, idx) => `${idx + 1}. ${exp}`).join("\n")}
`;
      fetch("http://127.0.0.1:5000/gpt-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      })
        .then(res => res.json())
        .then(data => {
          // Hide loading spinner and show content
          loadingEl.style.display = "none";
          contentEl.style.display = "block";
          copyBtn.style.display = "block";

          summaryEl.innerText = data.summary?.trim() || "⚠️ No summary available";
          whyEl.innerText = data.why_connect?.trim() || "⚠️ No reason provided";
          messageEl.value = data.message?.trim() || "⚠️ No message generated";
        })
        .catch(err => {
          // Hide loading spinner and show content with error
          loadingEl.style.display = "none";
          contentEl.style.display = "block";
          copyBtn.style.display = "block";

          summaryEl.innerText = "❌ Error contacting GPT server.";
          console.error("GPT fetch error:", err);
        });
    });
  });

  copyBtn.addEventListener("click", function () {
    messageEl.select();
    document.execCommand("copy");
  });
});
